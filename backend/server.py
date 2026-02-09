from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks
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
import asyncio


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

class AffiliatePartnerCreate(BaseModel):
    name: str
    description: str
    url: str
    category: str  # 'eyeglasses', 'contacts', 'both'
    discount: str
    commission: Optional[str] = None
    is_featured: bool = False
    is_active: bool = True
    order: int = 100  # Lower number = higher in list

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
async def get_all_affiliates():
    """Return all affiliates including inactive (for admin)"""
    await seed_affiliates()
    
    affiliates = await db.affiliates.find().sort("order", 1).to_list(100)
    return {"partners": [AffiliatePartner(**convert_mongo_doc(a)).dict() for a in affiliates]}


@api_router.post("/affiliates", response_model=AffiliatePartner)
async def create_affiliate(affiliate: AffiliatePartnerCreate):
    """Create a new affiliate partner"""
    affiliate_dict = affiliate.dict()
    result = await db.affiliates.insert_one(affiliate_dict)
    affiliate_dict['id'] = str(result.inserted_id)
    return AffiliatePartner(**affiliate_dict)


@api_router.put("/affiliates/{affiliate_id}", response_model=AffiliatePartner)
async def update_affiliate(affiliate_id: str, affiliate: AffiliatePartnerCreate):
    """Update an existing affiliate partner"""
    try:
        result = await db.affiliates.update_one(
            {"_id": ObjectId(affiliate_id)},
            {"$set": affiliate.dict()}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Affiliate not found")
        updated = await db.affiliates.find_one({"_id": ObjectId(affiliate_id)})
        return AffiliatePartner(**convert_mongo_doc(updated))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.delete("/affiliates/{affiliate_id}")
async def delete_affiliate(affiliate_id: str):
    """Delete an affiliate partner"""
    try:
        result = await db.affiliates.delete_one({"_id": ObjectId(affiliate_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Affiliate not found")
        return {"message": "Affiliate deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Include the router in the main app
app.include_router(api_router)

# Root health check endpoint for Kubernetes
@app.get("/")
async def root_health_check():
    return {"status": "healthy", "service": "Optical Rx Now API"}


# ==================== OCR & Expiration Alert Endpoints ====================

class OCRRequest(BaseModel):
    image_base64: str

class OCRResponse(BaseModel):
    expiry_date: Optional[str] = None
    raw_text: Optional[str] = None
    success: bool = False
    message: str = ""

class UserEmailCreate(BaseModel):
    email: str
    family_member_id: Optional[str] = None  # Optional: associate with a family member

class UserEmail(BaseModel):
    id: str
    email: str
    family_member_id: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ExpiryAlert(BaseModel):
    id: str
    prescription_id: str
    user_email: str
    alert_date: datetime
    days_before: int  # 30, 14, 7, 1, 0
    sent: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)


@api_router.post("/ocr/extract-expiry", response_model=OCRResponse)
async def extract_expiry_date(request: OCRRequest):
    """
    Use GPT-4 Vision to extract the expiration date from a prescription image.
    Returns the expiry date in YYYY-MM-DD format if found.
    """
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
        
        api_key = os.getenv("EMERGENT_LLM_KEY")
        if not api_key:
            return OCRResponse(
                success=False,
                message="OCR service not configured. Please contact support."
            )
        
        # Initialize chat with GPT-4 Vision
        chat = LlmChat(
            api_key=api_key,
            session_id=f"ocr-{uuid.uuid4()}",
            system_message="""You are an OCR assistant specialized in reading prescription documents.
Your task is to extract ONLY the expiration date from eyeglass or contact lens prescriptions.
Look for terms like: "Expiration Date", "Expires", "Exp", "Valid Until", "Good Through", "Rx Expiration".
Return the date in YYYY-MM-DD format.
If you cannot find an expiration date, respond with "NOT_FOUND".
If the date format is ambiguous, make your best interpretation assuming US date formats (MM/DD/YYYY)."""
        ).with_model("openai", "gpt-4o")
        
        # Clean up base64 string (remove data URL prefix if present)
        image_data = request.image_base64
        if "," in image_data:
            image_data = image_data.split(",")[1]
        
        # Create image content
        image_content = ImageContent(image_base64=image_data)
        
        # Send message with image
        user_message = UserMessage(
            text="Please extract the prescription expiration date from this image. Return ONLY the date in YYYY-MM-DD format, or 'NOT_FOUND' if you cannot find it.",
            image_contents=[image_content]
        )
        
        response = await chat.send_message(user_message)
        
        # Parse response
        response_text = response.strip()
        
        if response_text == "NOT_FOUND" or "not found" in response_text.lower():
            return OCRResponse(
                success=False,
                message="Could not find expiration date in the image. Please enter it manually.",
                raw_text=response_text
            )
        
        # Try to parse as date to validate
        try:
            # Clean up any extra text
            date_str = response_text.replace("The expiration date is ", "").replace(".", "").strip()
            # Handle various formats
            for fmt in ["%Y-%m-%d", "%m/%d/%Y", "%d/%m/%Y", "%B %d, %Y", "%b %d, %Y"]:
                try:
                    parsed_date = datetime.strptime(date_str, fmt)
                    formatted_date = parsed_date.strftime("%Y-%m-%d")
                    return OCRResponse(
                        success=True,
                        expiry_date=formatted_date,
                        message="Expiration date extracted successfully",
                        raw_text=response_text
                    )
                except ValueError:
                    continue
            
            # If we couldn't parse but got a date-like response, return it anyway
            if any(char.isdigit() for char in date_str):
                return OCRResponse(
                    success=True,
                    expiry_date=date_str[:10] if len(date_str) >= 10 else date_str,
                    message="Date extracted - please verify format",
                    raw_text=response_text
                )
                
        except Exception as parse_error:
            logger.warning(f"Date parsing error: {parse_error}")
        
        return OCRResponse(
            success=False,
            message="Could not parse expiration date. Please enter it manually.",
            raw_text=response_text
        )
        
    except Exception as e:
        logger.error(f"OCR extraction error: {e}")
        return OCRResponse(
            success=False,
            message=f"Error processing image: {str(e)}"
        )


# ==================== User Email Management ====================

@api_router.post("/user-emails", response_model=UserEmail)
async def create_user_email(email_data: UserEmailCreate):
    """Register an email for expiration alerts"""
    try:
        # Check if email already exists
        existing = await db.user_emails.find_one({"email": email_data.email.lower()})
        if existing:
            # Update to active if it was deactivated
            await db.user_emails.update_one(
                {"_id": existing["_id"]},
                {"$set": {"is_active": True, "family_member_id": email_data.family_member_id}}
            )
            updated = await db.user_emails.find_one({"_id": existing["_id"]})
            return UserEmail(**convert_mongo_doc(updated))
        
        # Create new email record
        email_doc = {
            "email": email_data.email.lower(),
            "family_member_id": email_data.family_member_id,
            "is_active": True,
            "created_at": datetime.utcnow()
        }
        result = await db.user_emails.insert_one(email_doc)
        email_doc["_id"] = result.inserted_id
        
        return UserEmail(**convert_mongo_doc(email_doc))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.get("/user-emails")
async def get_user_emails():
    """Get all registered emails"""
    emails = await db.user_emails.find({"is_active": True}).to_list(100)
    return [UserEmail(**convert_mongo_doc(e)) for e in emails]


@api_router.delete("/user-emails/{email_id}")
async def delete_user_email(email_id: str):
    """Deactivate an email (soft delete)"""
    try:
        result = await db.user_emails.update_one(
            {"_id": ObjectId(email_id)},
            {"$set": {"is_active": False}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Email not found")
        return {"message": "Email removed from alerts"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== Expiration Alert Scheduling ====================

@api_router.post("/alerts/schedule/{prescription_id}")
async def schedule_expiry_alerts(prescription_id: str, background_tasks: BackgroundTasks):
    """
    Schedule expiration alerts for a prescription.
    Alerts will be created for: 30 days, 14 days, 7 days, 1 day, and day of expiration.
    """
    try:
        # Get the prescription
        rx = await db.prescriptions.find_one({"_id": ObjectId(prescription_id)})
        if not rx:
            raise HTTPException(status_code=404, detail="Prescription not found")
        
        if not rx.get("expiry_date"):
            raise HTTPException(status_code=400, detail="Prescription has no expiration date set")
        
        # Parse expiry date
        try:
            expiry_date = datetime.strptime(rx["expiry_date"], "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid expiry date format")
        
        # Get all active user emails
        user_emails = await db.user_emails.find({"is_active": True}).to_list(100)
        if not user_emails:
            raise HTTPException(status_code=400, detail="No email addresses registered for alerts")
        
        # Define alert intervals (days before expiry)
        alert_intervals = [30, 14, 7, 1, 0]
        alerts_created = 0
        
        for email_doc in user_emails:
            for days_before in alert_intervals:
                alert_date = expiry_date - timedelta(days=days_before)
                
                # Skip if alert date is in the past
                if alert_date < datetime.utcnow():
                    continue
                
                # Check if alert already exists
                existing_alert = await db.expiry_alerts.find_one({
                    "prescription_id": prescription_id,
                    "user_email": email_doc["email"],
                    "days_before": days_before
                })
                
                if not existing_alert:
                    alert_doc = {
                        "prescription_id": prescription_id,
                        "user_email": email_doc["email"],
                        "alert_date": alert_date,
                        "days_before": days_before,
                        "sent": False,
                        "created_at": datetime.utcnow()
                    }
                    await db.expiry_alerts.insert_one(alert_doc)
                    alerts_created += 1
        
        return {
            "message": f"Scheduled {alerts_created} expiration alerts",
            "expiry_date": rx["expiry_date"],
            "alerts_at": [f"{d} days before" if d > 0 else "On expiration day" for d in alert_intervals]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.get("/alerts/pending")
async def get_pending_alerts():
    """Get all pending (unsent) alerts"""
    now = datetime.utcnow()
    alerts = await db.expiry_alerts.find({
        "sent": False,
        "alert_date": {"$lte": now}
    }).to_list(100)
    
    return [{"id": str(a["_id"]), **{k: v for k, v in a.items() if k != "_id"}} for a in alerts]


@api_router.get("/alerts/prescription/{prescription_id}")
async def get_prescription_alerts(prescription_id: str):
    """Get all alerts for a specific prescription"""
    alerts = await db.expiry_alerts.find({
        "prescription_id": prescription_id
    }).sort("alert_date", 1).to_list(100)
    
    return [{"id": str(a["_id"]), **{k: v for k, v in a.items() if k != "_id"}} for a in alerts]

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
