from fastapi import FastAPI, HTTPException
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
import os
import uuid

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "optical_wallet")

app = FastAPI(title="My Optical Wallet API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
client = None
db = None

@app.on_event("startup")
async def startup_db():
    global client, db
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    # Create indexes
    await db.affiliates.create_index("affiliate_id", unique=True)
    await db.banners.create_index("is_active")
    await db.analytics.create_index("event_type")
    await db.analytics.create_index("created_at")

@app.on_event("shutdown")
async def shutdown_db():
    global client
    if client:
        client.close()

# ==================== MODELS ====================

class AffiliateModel(BaseModel):
    affiliate_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    url: str
    commission: float = 0
    logo_url: Optional[str] = None
    is_active: bool = True
    click_count: int = 0
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class BannerModel(BaseModel):
    banner_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    image_url: str
    destination_url: str
    title: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_active: bool = True
    view_count: int = 0
    click_count: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AnalyticsEvent(BaseModel):
    event_type: str  # app_open, share_click, banner_view, banner_click, affiliate_click
    metadata: Optional[dict] = None

class InvoiceModel(BaseModel):
    invoice_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    recipient_name: str
    recipient_email: Optional[str] = None
    invoice_type: str  # "advertiser" or "affiliate"
    line_items: list = []
    total_amount: float = 0
    status: str = "pending"  # pending, paid, overdue
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    due_date: Optional[str] = None

# ==================== HEALTH ENDPOINTS ====================

@app.get("/")
async def health_check():
    return {"status": "healthy", "service": "My Optical Wallet API", "version": "2.0.1"}

@app.get("/api/")
async def api_root():
    return {"status": "healthy", "service": "My Optical Wallet API", "version": "2.0.1"}

@app.get("/api/health")
async def api_health():
    return {"status": "healthy", "service": "my-optical-wallet", "version": "2.0.1"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.get("/readyz")
async def readyz():
    return {"status": "ok"}

# ==================== AFFILIATE ENDPOINTS ====================

@app.get("/api/affiliates")
async def get_affiliates():
    """Public endpoint - app fetches current affiliate data"""
    affiliates = await db.affiliates.find({"is_active": True}).sort("commission", -1).to_list(100)
    for a in affiliates:
        a["_id"] = str(a["_id"])
    return {"affiliates": affiliates}

@app.post("/api/affiliates")
async def create_affiliate(affiliate: AffiliateModel):
    data = affiliate.model_dump()
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.affiliates.insert_one(data)
    data["_id"] = str(result.inserted_id)
    return {"status": "created", "affiliate": data}

@app.put("/api/affiliates/{affiliate_id}")
async def update_affiliate(affiliate_id: str, affiliate: AffiliateModel):
    data = affiliate.model_dump(exclude={"affiliate_id"})
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.affiliates.update_one(
        {"affiliate_id": affiliate_id},
        {"$set": data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Affiliate not found")
    return {"status": "updated", "affiliate": data}

@app.delete("/api/affiliates/{affiliate_id}")
async def delete_affiliate(affiliate_id: str):
    result = await db.affiliates.delete_one({"affiliate_id": affiliate_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Affiliate not found")
    return {"status": "deleted"}

# ==================== REDIRECT ENDPOINT (Obfuscated Affiliate Links) ====================

@app.get("/api/redirect/{affiliate_id}")
async def redirect_affiliate(affiliate_id: str):
    """Obfuscated redirect - hides affiliate IDs from end users"""
    affiliate = await db.affiliates.find_one({"affiliate_id": affiliate_id, "is_active": True})
    if not affiliate:
        raise HTTPException(status_code=404, detail="Partner not found")
    # Track click
    await db.affiliates.update_one(
        {"affiliate_id": affiliate_id},
        {"$inc": {"click_count": 1}}
    )
    # Log analytics
    await db.analytics.insert_one({
        "event_type": "affiliate_click",
        "affiliate_id": affiliate_id,
        "affiliate_name": affiliate.get("name", ""),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    return {"redirect_url": affiliate["url"]}

# ==================== BANNER ENDPOINTS ====================

@app.get("/api/banners")
async def get_banners():
    """Public endpoint - app fetches active banners"""
    now = datetime.now(timezone.utc).isoformat()
    banners = await db.banners.find({"is_active": True}).to_list(50)
    active_banners = []
    for b in banners:
        b["_id"] = str(b["_id"])
        # Check date range
        if b.get("start_date") and b["start_date"] > now:
            continue
        if b.get("end_date") and b["end_date"] < now:
            continue
        active_banners.append(b)
    return {"banners": active_banners}

@app.post("/api/banners")
async def create_banner(banner: BannerModel):
    data = banner.model_dump()
    result = await db.banners.insert_one(data)
    data["_id"] = str(result.inserted_id)
    return {"status": "created", "banner": data}

@app.put("/api/banners/{banner_id}")
async def update_banner(banner_id: str, banner: BannerModel):
    data = banner.model_dump(exclude={"banner_id"})
    result = await db.banners.update_one(
        {"banner_id": banner_id},
        {"$set": data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Banner not found")
    return {"status": "updated", "banner": data}

@app.delete("/api/banners/{banner_id}")
async def delete_banner(banner_id: str):
    result = await db.banners.delete_one({"banner_id": banner_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Banner not found")
    return {"status": "deleted"}

# ==================== ANALYTICS ENDPOINTS ====================

@app.post("/api/analytics/event")
async def log_event(event: AnalyticsEvent):
    """Log anonymous aggregate analytics event"""
    data = {
        "event_type": event.event_type,
        "metadata": event.metadata or {},
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.analytics.insert_one(data)
    return {"status": "logged"}

@app.get("/api/analytics/dashboard")
async def get_analytics_dashboard():
    """Admin dashboard - aggregate metrics only"""
    pipeline_totals = [
        {"$group": {"_id": "$event_type", "count": {"$sum": 1}}}
    ]
    totals = await db.analytics.aggregate(pipeline_totals).to_list(20)
    metrics = {t["_id"]: t["count"] for t in totals}
    
    # Get affiliate click stats
    affiliates = await db.affiliates.find({}).to_list(100)
    total_clicks = sum(a.get("click_count", 0) for a in affiliates)
    total_commission = sum(a.get("commission", 0) for a in affiliates)
    
    # Get banner stats
    banners = await db.banners.find({}).to_list(50)
    total_banner_views = sum(b.get("view_count", 0) for b in banners)
    total_banner_clicks = sum(b.get("click_count", 0) for b in banners)
    
    return {
        "events": metrics,
        "affiliate_stats": {
            "total_clicks": total_clicks,
            "total_affiliates": len(affiliates),
            "total_commission_potential": total_commission
        },
        "banner_stats": {
            "total_views": total_banner_views,
            "total_clicks": total_banner_clicks,
            "active_banners": len([b for b in banners if b.get("is_active")])
        },
        "summary": {
            "app_opens": metrics.get("app_open", 0),
            "share_clicks": metrics.get("share_click", 0),
            "total_events": sum(metrics.values()) if metrics else 0
        }
    }

@app.get("/api/analytics/affiliate/{affiliate_id}")
async def get_affiliate_analytics(affiliate_id: str):
    """Get analytics for a specific affiliate"""
    events = await db.analytics.find(
        {"event_type": "affiliate_click", "affiliate_id": affiliate_id}
    ).to_list(1000)
    return {
        "affiliate_id": affiliate_id,
        "total_clicks": len(events),
        "events": [{"created_at": e.get("created_at")} for e in events]
    }

# ==================== INVOICE ENDPOINTS ====================

@app.get("/api/invoices")
async def get_invoices():
    invoices = await db.invoices.find({}).sort("created_at", -1).to_list(100)
    for inv in invoices:
        inv["_id"] = str(inv["_id"])
    return {"invoices": invoices}

@app.post("/api/invoices")
async def create_invoice(invoice: InvoiceModel):
    data = invoice.model_dump()
    result = await db.invoices.insert_one(data)
    data["_id"] = str(result.inserted_id)
    return {"status": "created", "invoice": data}

@app.put("/api/invoices/{invoice_id}")
async def update_invoice(invoice_id: str, updates: dict):
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.invoices.update_one(
        {"invoice_id": invoice_id},
        {"$set": updates}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {"status": "updated"}

@app.delete("/api/invoices/{invoice_id}")
async def delete_invoice(invoice_id: str):
    result = await db.invoices.delete_one({"invoice_id": invoice_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {"status": "deleted"}

# ==================== FINANCIAL DASHBOARD ====================

@app.get("/api/finance/dashboard")
async def get_financial_dashboard():
    """Financial summary - commissions and ad revenue"""
    affiliates = await db.affiliates.find({}).to_list(100)
    invoices = await db.invoices.find({}).to_list(100)
    
    potential_commission = sum(a.get("commission", 0) * a.get("click_count", 0) / 100 for a in affiliates)
    
    paid_invoices = [i for i in invoices if i.get("status") == "paid"]
    pending_invoices = [i for i in invoices if i.get("status") == "pending"]
    overdue_invoices = [i for i in invoices if i.get("status") == "overdue"]
    
    return {
        "commission": {
            "potential": round(potential_commission, 2),
            "total_affiliate_clicks": sum(a.get("click_count", 0) for a in affiliates),
            "active_affiliates": len([a for a in affiliates if a.get("is_active")])
        },
        "invoices": {
            "total": len(invoices),
            "paid": {"count": len(paid_invoices), "amount": sum(i.get("total_amount", 0) for i in paid_invoices)},
            "pending": {"count": len(pending_invoices), "amount": sum(i.get("total_amount", 0) for i in pending_invoices)},
            "overdue": {"count": len(overdue_invoices), "amount": sum(i.get("total_amount", 0) for i in overdue_invoices)}
        },
        "total_revenue": sum(i.get("total_amount", 0) for i in paid_invoices)
    }
