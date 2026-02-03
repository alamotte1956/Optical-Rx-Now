from fastapi import FastAPI, APIRouter, HTTPException, Header, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timedelta
from bson import ObjectId
from bson.errors import InvalidId
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging (before first use)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Environment detection and admin key validation
ENV = os.getenv('ENV', 'development')
ADMIN_KEY = os.getenv('ADMIN_KEY')

if ENV == 'production':
    if not ADMIN_KEY or ADMIN_KEY == 'change-this-in-production':
        raise ValueError("ADMIN_KEY must be set to a secure value in production")
elif not ADMIN_KEY:
    ADMIN_KEY = 'dev-only-key-DO-NOT-USE-IN-PROD'
    logger.warning("Using development admin key - NOT FOR PRODUCTION")

# Default allowed CORS origins
DEFAULT_ALLOWED_ORIGINS = 'http://localhost:3000,http://localhost:8000'

# MongoDB connection - use getenv with defaults for deployment flexibility
mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.getenv('DB_NAME', 'optical_rx_now')]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Rate limiter configuration
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# Define Models
# Prescription and family member models removed - data stored locally on device


# Helper function to convert MongoDB document
def convert_mongo_doc(doc):
    if doc is None:
        return None
    doc['id'] = str(doc['_id'])
    del doc['_id']
    return doc


def validate_object_id(id_string: str) -> ObjectId:
    """Safely convert string to ObjectId"""
    try:
        return ObjectId(id_string)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=400, detail="Invalid ID format")


# Admin authentication helper
def verify_admin_key(x_admin_key: Optional[str] = Header(None)):
    """Verify admin key from header"""
    if not x_admin_key or x_admin_key != ADMIN_KEY:
        raise HTTPException(status_code=403, detail="Invalid or missing admin key")
    return True


# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "Optical Rx Now API"}


# ==================== Family Member Endpoints ====================
# Family member endpoints removed - data stored locally on device


# ==================== Prescription Endpoints ====================
# Prescription endpoints removed - data stored locally on device


# ==================== Stats Endpoint ====================
# Stats endpoint removed - relied on prescription data stored locally on device


# ==================== Analytics Endpoints ====================

class AnalyticsEvent(BaseModel):
    device_id: str = Field(..., min_length=10, max_length=100, description="Unique device identifier")
    event_type: Literal["app_open", "ad_click", "affiliate_click"] = "app_open"
    platform: Optional[Literal["ios", "android", "web"]] = None
    app_version: Optional[str] = Field(None, max_length=20)
    metadata: Optional[dict] = None
    
    @validator('metadata')
    def validate_metadata_size(cls, v):
        if v and len(str(v)) > 1000:
            raise ValueError('Metadata too large')
        return v

@api_router.post("/analytics/track")
@limiter.limit("60/minute")  # 60 requests per minute per IP
async def track_event(request: Request, event: AnalyticsEvent):
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
async def get_analytics_dashboard(x_admin_key: Optional[str] = Header(None)):
    """Get analytics dashboard data for advertiser pitches (admin only)"""
    verify_admin_key(x_admin_key)
    
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
            "affiliate_clicks_30d": affiliate_clicks
        },
        "daily_breakdown": daily_stats,
        "generated_at": now.isoformat()
    }


# ==================== Affiliate Links ====================

class AffiliatePartnerCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=500)
    url: str = Field(..., pattern=r'^https?://.+')
    category: Literal['eyeglasses', 'contacts', 'both']
    discount: str = Field(..., max_length=200)
    commission: Optional[str] = Field(None, max_length=50)
    is_featured: bool = False
    is_active: bool = True
    order: int = Field(100, ge=0, le=9999)

class AffiliatePartner(BaseModel):
    id: str
    name: str
    description: str
    url: str
    category: str
    discount: str
    commission: Optional[str] = None
    is_featured: bool = False
    is_active: bool = True
    order: int = 100

# Default affiliates to seed database
DEFAULT_AFFILIATES = [
    {
        "name": "Sam's Club Optical",
        "description": "In-store eye exams & quality eyewear",
        "url": "https://www.samsclub.com/locator",
        "category": "both",
        "discount": "In-store savings",
        "commission": None,
        "is_featured": True,
        "is_active": True,
        "order": 1
    },
    {
        "name": "Clearly",
        "description": "Premium contacts & glasses with fast shipping",
        "url": "https://www.clearly.ca",
        "category": "both",
        "discount": "Up to 20% commission",
        "commission": "20%",
        "is_featured": False,
        "is_active": True,
        "order": 10
    },
    {
        "name": "Eyeglasses.com",
        "description": "200,000+ frames from 300+ designer brands",
        "url": "https://www.eyeglasses.com",
        "category": "eyeglasses",
        "discount": "Up to 15% commission",
        "commission": "15%",
        "is_featured": False,
        "is_active": True,
        "order": 20
    },
    {
        "name": "PerfectLensWorld",
        "description": "Premium brand contact lenses up to 40% off",
        "url": "https://www.perfectlensworld.com",
        "category": "contacts",
        "discount": "Up to 15% commission",
        "commission": "15%",
        "is_featured": False,
        "is_active": True,
        "order": 30
    },
    {
        "name": "SmartBuyGlasses",
        "description": "Designer sunglasses & prescription eyewear",
        "url": "https://www.smartbuyglasses.com",
        "category": "both",
        "discount": "12% commission",
        "commission": "12%",
        "is_featured": False,
        "is_active": True,
        "order": 40
    },
    {
        "name": "Coastal",
        "description": "3,000+ designer frames, first pair 50% off",
        "url": "https://www.coastal.com",
        "category": "eyeglasses",
        "discount": "Up to 12% commission",
        "commission": "12%",
        "is_featured": False,
        "is_active": True,
        "order": 50
    },
    {
        "name": "GlassesUSA",
        "description": "5,000+ styles with virtual try-on",
        "url": "https://www.glassesusa.com",
        "category": "eyeglasses",
        "discount": "Up to 12% commission",
        "commission": "12%",
        "is_featured": False,
        "is_active": True,
        "order": 60
    },
    {
        "name": "Zenni Optical",
        "description": "Affordable prescription glasses from $6.95",
        "url": "https://www.zennioptical.com",
        "category": "eyeglasses",
        "discount": "Budget-friendly prices",
        "commission": "9%",
        "is_featured": False,
        "is_active": True,
        "order": 70
    },
    {
        "name": "1-800 Contacts",
        "description": "Fast delivery on all contact lens brands",
        "url": "https://www.1800contacts.com",
        "category": "contacts",
        "discount": "Price match guarantee",
        "commission": "8%",
        "is_featured": False,
        "is_active": True,
        "order": 80
    }
]


async def seed_affiliates():
    """Seed default affiliates if collection is empty"""
    count = await db.affiliates.count_documents({})
    if count == 0:
        await db.affiliates.insert_many(DEFAULT_AFFILIATES)
        logger.info(f"Seeded {len(DEFAULT_AFFILIATES)} default affiliates")


@api_router.get("/affiliates")
async def get_affiliate_links():
    """Return active affiliate partner links from database"""
    # Seed defaults if empty
    await seed_affiliates()
    
    affiliates = await db.affiliates.find(
        {"is_active": True}
    ).sort("order", 1).to_list(100)
    
    partners = [AffiliatePartner(**convert_mongo_doc(a)) for a in affiliates]
    
    return {"partners": [p.dict() for p in partners]}


@api_router.get("/affiliates/all")
async def get_all_affiliates(x_admin_key: Optional[str] = Header(None)):
    """Return all affiliates including inactive (for admin)"""
    verify_admin_key(x_admin_key)
    await seed_affiliates()
    
    affiliates = await db.affiliates.find().sort("order", 1).to_list(100)
    return {"partners": [AffiliatePartner(**convert_mongo_doc(a)).dict() for a in affiliates]}


@api_router.post("/affiliates", response_model=AffiliatePartner)
async def create_affiliate(affiliate: AffiliatePartnerCreate, x_admin_key: Optional[str] = Header(None)):
    """Create a new affiliate partner (admin only)"""
    verify_admin_key(x_admin_key)
    affiliate_dict = affiliate.dict()
    result = await db.affiliates.insert_one(affiliate_dict)
    affiliate_dict['id'] = str(result.inserted_id)
    return AffiliatePartner(**affiliate_dict)


@api_router.put("/affiliates/{affiliate_id}", response_model=AffiliatePartner)
async def update_affiliate(affiliate_id: str, affiliate: AffiliatePartnerCreate, x_admin_key: Optional[str] = Header(None)):
    """Update an existing affiliate partner (admin only)"""
    verify_admin_key(x_admin_key)
    oid = validate_object_id(affiliate_id)  # Use helper
    result = await db.affiliates.update_one(
        {"_id": oid},
        {"$set": affiliate.dict()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Affiliate not found")
    updated = await db.affiliates.find_one({"_id": oid})
    return AffiliatePartner(**convert_mongo_doc(updated))


@api_router.delete("/affiliates/{affiliate_id}")
async def delete_affiliate(affiliate_id: str, x_admin_key: Optional[str] = Header(None)):
    """Delete an affiliate partner (admin only)"""
    verify_admin_key(x_admin_key)
    oid = validate_object_id(affiliate_id)  # Use helper
    result = await db.affiliates.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Affiliate not found")
    return {"message": "Affiliate deleted successfully"}


# Include the router in the main app
app.include_router(api_router)

# Root health check endpoint for Kubernetes
@app.get("/")
async def root_health_check():
    return {"status": "healthy", "service": "Optical Rx Now API"}

# CORS middleware - restrict to specific origins in production
# Set ALLOWED_ORIGINS environment variable to comma-separated list of allowed origins
allowed_origins_str = os.getenv('ALLOWED_ORIGINS', DEFAULT_ALLOWED_ORIGINS)
allowed_origins = [origin.strip() for origin in allowed_origins_str.split(',')]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_indexes():
    """Create database indexes for optimal query performance"""
    try:
        # Analytics indexes
        await db.devices.create_index([("last_active", -1)])
        await db.devices.create_index([("first_seen", -1)])
        await db.devices.create_index([("device_id", 1)], unique=True)
        await db.analytics_events.create_index([("date", -1), ("event_type", 1)])
        await db.analytics_events.create_index([("device_id", 1), ("timestamp", -1)])
        
        # Affiliate indexes
        await db.affiliates.create_index([("is_active", 1), ("order", 1)])
        
        logger.info("Database indexes created successfully")
    except Exception as e:
        logger.error(f"Error creating indexes: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
