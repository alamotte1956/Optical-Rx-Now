from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from bson import ObjectId


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env', override=False)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class FamilyMemberCreate(BaseModel):
    name: str
    relationship: str

class FamilyMember(BaseModel):
    id: str
    name: str
    relationship: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PrescriptionCreate(BaseModel):
    family_member_id: str
    rx_type: str  # 'eyeglass' or 'contact'
    image_base64: str
    notes: Optional[str] = ""
    date_taken: Optional[str] = None

class Prescription(BaseModel):
    id: str
    family_member_id: str
    rx_type: str
    image_base64: str
    notes: str = ""
    date_taken: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PrescriptionUpdate(BaseModel):
    rx_type: Optional[str] = None
    notes: Optional[str] = None
    date_taken: Optional[str] = None


# Helper function to convert MongoDB document
def convert_mongo_doc(doc):
    if doc is None:
        return None
    doc['id'] = str(doc['_id'])
    del doc['_id']
    return doc


# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "Optical Rx Now API"}


# ==================== Family Member Endpoints ====================

@api_router.post("/family-members", response_model=FamilyMember)
async def create_family_member(member: FamilyMemberCreate):
    member_dict = member.dict()
    member_dict['created_at'] = datetime.utcnow()
    result = await db.family_members.insert_one(member_dict)
    member_dict['id'] = str(result.inserted_id)
    return FamilyMember(**member_dict)


@api_router.get("/family-members", response_model=List[FamilyMember])
async def get_family_members():
    members = await db.family_members.find(
        {}, 
        {"_id": 1, "name": 1, "relationship": 1, "created_at": 1}
    ).to_list(100)
    return [FamilyMember(**convert_mongo_doc(m)) for m in members]


@api_router.get("/family-members/{member_id}", response_model=FamilyMember)
async def get_family_member(member_id: str):
    try:
        member = await db.family_members.find_one({"_id": ObjectId(member_id)})
        if not member:
            raise HTTPException(status_code=404, detail="Family member not found")
        return FamilyMember(**convert_mongo_doc(member))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.put("/family-members/{member_id}", response_model=FamilyMember)
async def update_family_member(member_id: str, member: FamilyMemberCreate):
    try:
        result = await db.family_members.update_one(
            {"_id": ObjectId(member_id)},
            {"$set": member.dict()}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Family member not found")
        updated = await db.family_members.find_one({"_id": ObjectId(member_id)})
        return FamilyMember(**convert_mongo_doc(updated))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.delete("/family-members/{member_id}")
async def delete_family_member(member_id: str):
    try:
        # Delete all prescriptions for this member
        await db.prescriptions.delete_many({"family_member_id": member_id})
        # Delete the member
        result = await db.family_members.delete_one({"_id": ObjectId(member_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Family member not found")
        return {"message": "Family member and their prescriptions deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== Prescription Endpoints ====================

@api_router.post("/prescriptions", response_model=Prescription)
async def create_prescription(rx: PrescriptionCreate):
    # Verify family member exists
    try:
        member = await db.family_members.find_one({"_id": ObjectId(rx.family_member_id)})
        if not member:
            raise HTTPException(status_code=404, detail="Family member not found")
    except:
        raise HTTPException(status_code=400, detail="Invalid family member ID")
    
    rx_dict = rx.dict()
    rx_dict['created_at'] = datetime.utcnow()
    rx_dict['date_taken'] = rx.date_taken or datetime.utcnow().strftime("%Y-%m-%d")
    
    result = await db.prescriptions.insert_one(rx_dict)
    rx_dict['id'] = str(result.inserted_id)
    return Prescription(**rx_dict)


@api_router.get("/prescriptions", response_model=List[Prescription])
async def get_prescriptions(family_member_id: Optional[str] = None):
    query = {}
    if family_member_id:
        query['family_member_id'] = family_member_id
    
    # Fetch all fields including image_base64 for list view (needed for thumbnails)
    prescriptions = await db.prescriptions.find(query).sort("created_at", -1).to_list(100)
    return [Prescription(**convert_mongo_doc(p)) for p in prescriptions]


@api_router.get("/prescriptions/{rx_id}", response_model=Prescription)
async def get_prescription(rx_id: str):
    try:
        rx = await db.prescriptions.find_one({"_id": ObjectId(rx_id)})
        if not rx:
            raise HTTPException(status_code=404, detail="Prescription not found")
        return Prescription(**convert_mongo_doc(rx))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.put("/prescriptions/{rx_id}", response_model=Prescription)
async def update_prescription(rx_id: str, rx_update: PrescriptionUpdate):
    try:
        update_data = {k: v for k, v in rx_update.dict().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        result = await db.prescriptions.update_one(
            {"_id": ObjectId(rx_id)},
            {"$set": update_data}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Prescription not found")
        
        updated = await db.prescriptions.find_one({"_id": ObjectId(rx_id)})
        return Prescription(**convert_mongo_doc(updated))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.delete("/prescriptions/{rx_id}")
async def delete_prescription(rx_id: str):
    try:
        result = await db.prescriptions.delete_one({"_id": ObjectId(rx_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Prescription not found")
        return {"message": "Prescription deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== Stats Endpoint ====================

@api_router.get("/stats")
async def get_stats():
    members_count = await db.family_members.count_documents({})
    prescriptions_count = await db.prescriptions.count_documents({})
    eyeglass_count = await db.prescriptions.count_documents({"rx_type": "eyeglass"})
    contact_count = await db.prescriptions.count_documents({"rx_type": "contact"})
    
    return {
        "family_members": members_count,
        "total_prescriptions": prescriptions_count,
        "eyeglass_prescriptions": eyeglass_count,
        "contact_prescriptions": contact_count
    }


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
