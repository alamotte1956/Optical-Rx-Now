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
    
    # Set default expiry date (1 year from date taken)
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


# ==================== Analytics Endpoints ====================

class AnalyticsEvent(BaseModel):
    device_id: str
    event_type: str = "app_open"  # app_open, ad_click, affiliate_click
    platform: Optional[str] = None  # ios, android, web
    app_version: Optional[str] = None
    metadata: Optional[dict] = None

@api_router.post("/analytics/track")
async def track_event(event: AnalyticsEvent):
    """Track analytics events from the app"""
    now = datetime.utcnow()
    today = now.strftime("%Y-%m-%d")
    
    event_doc = {
        "device_id": event.device_id,
        "event_type": event.event_type,
        "platform": event.platform,
        "app_version": event.app_version,
        "metadata": event.metadata,
        "timestamp": now,
        "date": today
    }
    
    await db.analytics_events.insert_one(event_doc)
    
    # Update or create device record (for unique user tracking)
    if event.event_type == "app_open":
        await db.devices.update_one(
            {"device_id": event.device_id},
            {
                "$set": {
                    "last_active": now,
                    "platform": event.platform,
                    "app_version": event.app_version
                },
                "$setOnInsert": {
                    "first_seen": now,
                    "device_id": event.device_id
                }
            },
            upsert=True
        )
    
    return {"status": "tracked"}


@api_router.get("/analytics/dashboard")
async def get_analytics_dashboard(admin_key: Optional[str] = None):
    """Get analytics dashboard data for advertiser pitches"""
    # Simple admin protection - in production, use proper auth
    # For now, anyone can access - add admin_key check if needed
    
    now = datetime.utcnow()
    today = now.strftime("%Y-%m-%d")
    seven_days_ago = (now - timedelta(days=7)).strftime("%Y-%m-%d")
    thirty_days_ago = (now - timedelta(days=30)).strftime("%Y-%m-%d")
    
    # Total Downloads (unique devices ever seen)
    total_downloads = await db.devices.count_documents({})
    
    # Daily Active Users (unique devices active today)
    today_start = datetime.strptime(today, "%Y-%m-%d")
    dau = await db.devices.count_documents({
        "last_active": {"$gte": today_start}
    })
    
    # Weekly Active Users (last 7 days)
    week_start = datetime.strptime(seven_days_ago, "%Y-%m-%d")
    wau = await db.devices.count_documents({
        "last_active": {"$gte": week_start}
    })
    
    # Monthly Active Users (last 30 days)
    month_start = datetime.strptime(thirty_days_ago, "%Y-%m-%d")
    mau = await db.devices.count_documents({
        "last_active": {"$gte": month_start}
    })
    
    # New users in last 7 days
    new_users_week = await db.devices.count_documents({
        "first_seen": {"$gte": week_start}
    })
    
    # New users in last 30 days
    new_users_month = await db.devices.count_documents({
        "first_seen": {"$gte": month_start}
    })
    
    # Platform breakdown
    ios_users = await db.devices.count_documents({"platform": "ios"})
    android_users = await db.devices.count_documents({"platform": "android"})
    web_users = await db.devices.count_documents({"platform": "web"})
    
    # Ad clicks (last 30 days)
    ad_clicks = await db.analytics_events.count_documents({
        "event_type": "ad_click",
        "date": {"$gte": thirty_days_ago}
    })
    
    # Affiliate clicks (last 30 days)
    affiliate_clicks = await db.analytics_events.count_documents({
        "event_type": "affiliate_click",
        "date": {"$gte": thirty_days_ago}
    })
    
    # Daily breakdown for last 7 days
    daily_stats = []
    for i in range(7):
        date = (now - timedelta(days=i)).strftime("%Y-%m-%d")
        date_start = datetime.strptime(date, "%Y-%m-%d")
        date_end = date_start + timedelta(days=1)
        
        day_active = await db.devices.count_documents({
            "last_active": {"$gte": date_start, "$lt": date_end}
        })
        day_new = await db.devices.count_documents({
            "first_seen": {"$gte": date_start, "$lt": date_end}
        })
        
        daily_stats.append({
            "date": date,
            "active_users": day_active,
            "new_users": day_new
        })
    
    # Content stats
    total_prescriptions = await db.prescriptions.count_documents({})
    total_family_members = await db.family_members.count_documents({})
    
    return {
        "summary": {
            "total_downloads": total_downloads,
            "daily_active_users": dau,
            "weekly_active_users": wau,
            "monthly_active_users": mau,
            "new_users_this_week": new_users_week,
            "new_users_this_month": new_users_month
        },
        "platforms": {
            "ios": ios_users,
            "android": android_users,
            "web": web_users
        },
        "engagement": {
            "ad_clicks_30d": ad_clicks,
            "affiliate_clicks_30d": affiliate_clicks,
            "total_prescriptions": total_prescriptions,
            "total_family_members": total_family_members
        },
        "daily_breakdown": daily_stats,
        "generated_at": now.isoformat()
    }


# ==================== Affiliate Links ====================

@api_router.get("/affiliates")
async def get_affiliate_links():
    """Return affiliate partner links - sorted by commission rate"""
    return {
        "partners": [
            {
                "id": "clearly",
                "name": "Clearly",
                "description": "Premium contacts & glasses with fast shipping",
                "url": "https://www.clearly.ca",
                "category": "both",
                "discount": "Up to 20% commission",
                "commission": "20%"
            },
            {
                "id": "eyeglasses",
                "name": "Eyeglasses.com",
                "description": "200,000+ frames from 300+ designer brands",
                "url": "https://www.eyeglasses.com",
                "category": "eyeglasses",
                "discount": "Up to 15% commission",
                "commission": "15%"
            },
            {
                "id": "perfectlens",
                "name": "PerfectLensWorld",
                "description": "Premium brand contact lenses up to 40% off",
                "url": "https://www.perfectlensworld.com",
                "category": "contacts",
                "discount": "Up to 15% commission",
                "commission": "15%"
            },
            {
                "id": "smartbuy",
                "name": "SmartBuyGlasses",
                "description": "Designer sunglasses & prescription eyewear",
                "url": "https://www.smartbuyglasses.com",
                "category": "both",
                "discount": "12% commission",
                "commission": "12%"
            },
            {
                "id": "coastal",
                "name": "Coastal",
                "description": "3,000+ designer frames, first pair 50% off",
                "url": "https://www.coastal.com",
                "category": "eyeglasses",
                "discount": "Up to 12% commission",
                "commission": "12%"
            },
            {
                "id": "glassesusa",
                "name": "GlassesUSA",
                "description": "5,000+ styles with virtual try-on",
                "url": "https://www.glassesusa.com",
                "category": "eyeglasses",
                "discount": "Up to 12% commission",
                "commission": "12%"
            },
            {
                "id": "zenni",
                "name": "Zenni Optical",
                "description": "Affordable prescription glasses from $6.95",
                "url": "https://www.zennioptical.com",
                "category": "eyeglasses",
                "discount": "Budget-friendly prices",
                "commission": "9%"
            },
            {
                "id": "contacts",
                "name": "1-800 Contacts",
                "description": "Fast delivery on all contact lens brands",
                "url": "https://www.1800contacts.com",
                "category": "contacts",
                "discount": "Price match guarantee",
                "commission": "8%"
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
