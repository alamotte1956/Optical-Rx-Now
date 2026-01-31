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
from datetime import datetime, timedelta
from bson import ObjectId


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection - use getenv with defaults for deployment flexibility
mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.getenv('DB_NAME', 'optical_rx_now')]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Free tier limits
FREE_FAMILY_MEMBER_LIMIT = 2
FREE_PRESCRIPTION_LIMIT = 5


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
    expiry_date: Optional[str] = None

class Prescription(BaseModel):
    id: str
    family_member_id: str
    rx_type: str
    image_base64: str
    notes: str = ""
    date_taken: str
    expiry_date: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PrescriptionUpdate(BaseModel):
    rx_type: Optional[str] = None
    notes: Optional[str] = None
    date_taken: Optional[str] = None
    expiry_date: Optional[str] = None

class UserSubscription(BaseModel):
    id: str
    user_id: str = "default_user"  # For MVP, single user
    is_premium: bool = False
    subscription_type: Optional[str] = None  # 'monthly' or 'yearly'
    subscribed_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

class SubscriptionCreate(BaseModel):
    subscription_type: str  # 'monthly' or 'yearly'


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


# ==================== Subscription Endpoints ====================

@api_router.get("/subscription")
async def get_subscription():
    sub = await db.subscriptions.find_one({"user_id": "default_user"})
    if not sub:
        # Create default free subscription
        default_sub = {
            "user_id": "default_user",
            "is_premium": False,
            "subscription_type": None,
            "subscribed_at": None,
            "expires_at": None
        }
        result = await db.subscriptions.insert_one(default_sub)
        default_sub['id'] = str(result.inserted_id)
        return UserSubscription(**default_sub)
    return UserSubscription(**convert_mongo_doc(sub))


@api_router.post("/subscription/upgrade")
async def upgrade_subscription(sub_data: SubscriptionCreate):
    now = datetime.utcnow()
    if sub_data.subscription_type == "monthly":
        expires_at = now + timedelta(days=30)
    else:  # yearly
        expires_at = now + timedelta(days=365)
    
    update_data = {
        "is_premium": True,
        "subscription_type": sub_data.subscription_type,
        "subscribed_at": now,
        "expires_at": expires_at
    }
    
    result = await db.subscriptions.update_one(
        {"user_id": "default_user"},
        {"$set": update_data},
        upsert=True
    )
    
    sub = await db.subscriptions.find_one({"user_id": "default_user"})
    return UserSubscription(**convert_mongo_doc(sub))


@api_router.post("/subscription/cancel")
async def cancel_subscription():
    update_data = {
        "is_premium": False,
        "subscription_type": None,
        "subscribed_at": None,
        "expires_at": None
    }
    
    await db.subscriptions.update_one(
        {"user_id": "default_user"},
        {"$set": update_data}
    )
    
    sub = await db.subscriptions.find_one({"user_id": "default_user"})
    return UserSubscription(**convert_mongo_doc(sub))


@api_router.get("/limits")
async def get_limits():
    """Get current usage vs limits"""
    sub = await db.subscriptions.find_one({"user_id": "default_user"})
    is_premium = sub.get("is_premium", False) if sub else False
    
    family_count = await db.family_members.count_documents({})
    prescription_count = await db.prescriptions.count_documents({})
    
    return {
        "is_premium": is_premium,
        "family_members": {
            "current": family_count,
            "limit": None if is_premium else FREE_FAMILY_MEMBER_LIMIT,
            "can_add": is_premium or family_count < FREE_FAMILY_MEMBER_LIMIT
        },
        "prescriptions": {
            "current": prescription_count,
            "limit": None if is_premium else FREE_PRESCRIPTION_LIMIT,
            "can_add": is_premium or prescription_count < FREE_PRESCRIPTION_LIMIT
        }
    }


# ==================== Family Member Endpoints ====================

@api_router.post("/family-members", response_model=FamilyMember)
async def create_family_member(member: FamilyMemberCreate):
    # Check limits
    limits = await get_limits()
    if not limits["family_members"]["can_add"]:
        raise HTTPException(
            status_code=403, 
            detail=f"Free tier limit reached. Upgrade to Premium for unlimited family members."
        )
    
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
    # Check limits
    limits = await get_limits()
    if not limits["prescriptions"]["can_add"]:
        raise HTTPException(
            status_code=403, 
            detail=f"Free tier limit reached. Upgrade to Premium for unlimited prescriptions."
        )
    
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
    
    # Set default expiry date (1 year for eyeglasses, 1 year for contacts)
    if not rx_dict.get('expiry_date'):
        date_taken = datetime.strptime(rx_dict['date_taken'], "%Y-%m-%d")
        expiry = date_taken + timedelta(days=365)
        rx_dict['expiry_date'] = expiry.strftime("%Y-%m-%d")
    
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
    
    # Check for expiring prescriptions (within 30 days)
    today = datetime.utcnow().strftime("%Y-%m-%d")
    thirty_days = (datetime.utcnow() + timedelta(days=30)).strftime("%Y-%m-%d")
    expiring_count = await db.prescriptions.count_documents({
        "expiry_date": {"$lte": thirty_days, "$gte": today}
    })
    
    return {
        "family_members": members_count,
        "total_prescriptions": prescriptions_count,
        "eyeglass_prescriptions": eyeglass_count,
        "contact_prescriptions": contact_count,
        "expiring_soon": expiring_count
    }


# ==================== Affiliate Links ====================

@api_router.get("/affiliates")
async def get_affiliate_links():
    """Return affiliate partner links"""
    return {
        "partners": [
            {
                "id": "zenni",
                "name": "Zenni Optical",
                "description": "Affordable prescription glasses from $6.95",
                "url": "https://www.zennioptical.com",
                "category": "eyeglasses",
                "discount": "Up to 50% off"
            },
            {
                "id": "warby",
                "name": "Warby Parker",
                "description": "Designer frames with free home try-on",
                "url": "https://www.warbyparker.com",
                "category": "eyeglasses",
                "discount": "Free shipping"
            },
            {
                "id": "contacts",
                "name": "1-800 Contacts",
                "description": "Fast delivery on contact lenses",
                "url": "https://www.1800contacts.com",
                "category": "contacts",
                "discount": "Price match guarantee"
            },
            {
                "id": "coastal",
                "name": "Coastal",
                "description": "Quality glasses & contacts online",
                "url": "https://www.coastal.com",
                "category": "both",
                "discount": "First pair 50% off"
            }
        ]
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
