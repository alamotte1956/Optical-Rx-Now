from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone, timedelta
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
import uuid
import io

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "optical_wallet")
ADMIN_API_KEY = os.getenv("ADMIN_API_KEY", "")

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="My Optical Wallet API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware — Allow all origins for native mobile app compatibility
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
    await db.analytics.create_index("platform")

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
    platform: Optional[str] = None  # android, ios, web
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

# Recommendation 1: Admin API Key authentication
async def verify_admin_key(request: Request):
    """Verify admin API key for protected endpoints"""
    if not ADMIN_API_KEY:
        return  # No key configured, skip auth (dev mode)
    api_key = request.headers.get("X-Admin-Key", "")
    if api_key != ADMIN_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid or missing admin API key")

# ==================== HEALTH ENDPOINTS ====================

@app.get("/")
async def health_check():
    return {"status": "healthy", "service": "My Optical Wallet API", "version": "2.0.1"}

@app.get("/api/")
async def api_root():
    return {"status": "healthy", "service": "My Optical Wallet API", "version": "2.0.1"}

@app.get("/api/health")
@app.head("/api/health")
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
@limiter.limit("60/minute")
async def get_affiliates(request: Request, all: bool = False):
    """Fetch affiliates. Pass ?all=true from admin to include inactive."""
    query = {} if all else {"is_active": True}
    affiliates = await db.affiliates.find(query).sort("commission", -1).to_list(100)
    for a in affiliates:
        a["_id"] = str(a["_id"])
    return {"affiliates": affiliates}

@app.post("/api/affiliates", dependencies=[Depends(verify_admin_key)])
@limiter.limit("30/minute")
async def create_affiliate(request: Request, affiliate: AffiliateModel):
    data = affiliate.model_dump()
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.affiliates.insert_one(data)
    data["_id"] = str(result.inserted_id)
    return {"status": "created", "affiliate": data}

@app.put("/api/affiliates/{affiliate_id}", dependencies=[Depends(verify_admin_key)])
@limiter.limit("30/minute")
async def update_affiliate(request: Request, affiliate_id: str, affiliate: AffiliateModel):
    data = affiliate.model_dump(exclude={"affiliate_id"})
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.affiliates.update_one(
        {"affiliate_id": affiliate_id},
        {"$set": data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Affiliate not found")
    return {"status": "updated", "affiliate": data}

@app.delete("/api/affiliates/{affiliate_id}", dependencies=[Depends(verify_admin_key)])
@limiter.limit("30/minute")
async def delete_affiliate(request: Request, affiliate_id: str):
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
async def get_banners(all: bool = False):
    """Fetch banners. Pass ?all=true from admin to include inactive/expired."""
    if all:
        banners = await db.banners.find({}).to_list(50)
        for b in banners:
            b["_id"] = str(b["_id"])
        return {"banners": banners}
    
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

@app.post("/api/banners", dependencies=[Depends(verify_admin_key)])
@limiter.limit("30/minute")
async def create_banner(request: Request, banner: BannerModel):
    data = banner.model_dump()
    result = await db.banners.insert_one(data)
    data["_id"] = str(result.inserted_id)
    return {"status": "created", "banner": data}

@app.put("/api/banners/{banner_id}", dependencies=[Depends(verify_admin_key)])
@limiter.limit("30/minute")
async def update_banner(request: Request, banner_id: str, banner: BannerModel):
    data = banner.model_dump(exclude={"banner_id"})
    result = await db.banners.update_one(
        {"banner_id": banner_id},
        {"$set": data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Banner not found")
    return {"status": "updated", "banner": data}

@app.delete("/api/banners/{banner_id}", dependencies=[Depends(verify_admin_key)])
@limiter.limit("30/minute")
async def delete_banner(request: Request, banner_id: str):
    result = await db.banners.delete_one({"banner_id": banner_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Banner not found")
    return {"status": "deleted"}

# ==================== ANALYTICS ENDPOINTS ====================

@app.post("/api/analytics/event")
@limiter.limit("120/minute")
async def log_event(request: Request, event: AnalyticsEvent):
    """Log anonymous aggregate analytics event"""
    data = {
        "event_type": event.event_type,
        "platform": (event.platform or event.metadata.get("platform", "unknown") if event.metadata else "unknown").lower(),
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
    
    # Platform breakdown
    pipeline_platforms = [
        {"$group": {"_id": "$platform", "count": {"$sum": 1}}}
    ]
    platform_totals = await db.analytics.aggregate(pipeline_platforms).to_list(10)
    platform_counts = {}
    for p in platform_totals:
        key = (p["_id"] or "unknown").lower()
        platform_counts[key] = platform_counts.get(key, 0) + p["count"]
    
    # Platform + event type cross-tabulation
    pipeline_platform_events = [
        {"$group": {"_id": {"platform": "$platform", "event_type": "$event_type"}, "count": {"$sum": 1}}}
    ]
    platform_event_totals = await db.analytics.aggregate(pipeline_platform_events).to_list(100)
    platform_events = {}
    for pe in platform_event_totals:
        plat = (pe["_id"].get("platform") or "unknown").lower()
        evt = pe["_id"].get("event_type", "unknown")
        if plat not in platform_events:
            platform_events[plat] = {}
        platform_events[plat][evt] = pe["count"]
    
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
        "platform_breakdown": platform_counts,
        "platform_events": platform_events,
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

@app.post("/api/invoices", dependencies=[Depends(verify_admin_key)])
@limiter.limit("30/minute")
async def create_invoice(request: Request, invoice: InvoiceModel):
    data = invoice.model_dump()
    result = await db.invoices.insert_one(data)
    data["_id"] = str(result.inserted_id)
    return {"status": "created", "invoice": data}

@app.put("/api/invoices/{invoice_id}", dependencies=[Depends(verify_admin_key)])
@limiter.limit("30/minute")
async def update_invoice(request: Request, invoice_id: str, updates: dict):
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.invoices.update_one(
        {"invoice_id": invoice_id},
        {"$set": updates}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {"status": "updated"}

@app.delete("/api/invoices/{invoice_id}", dependencies=[Depends(verify_admin_key)])
@limiter.limit("30/minute")
async def delete_invoice(request: Request, invoice_id: str):
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


# ==================== AUTO-INVOICING ====================

@app.post("/api/invoices/auto-generate")
async def auto_generate_invoices():
    """Auto-generate invoices based on affiliate click data for the current period"""
    affiliates = await db.affiliates.find({"is_active": True}).to_list(100)
    
    if not affiliates:
        return {"status": "no_affiliates", "invoices_created": 0}
    
    invoices_created = 0
    for aff in affiliates:
        clicks = aff.get("click_count", 0)
        commission = aff.get("commission", 0)
        potential_revenue = round(clicks * commission / 100, 2)
        
        if potential_revenue <= 0:
            continue
        
        invoice_id = str(uuid.uuid4())
        line_items = [{
            "description": f"Affiliate clicks ({clicks}) x {commission}% commission",
            "quantity": clicks,
            "unit_price": round(commission / 100, 4),
            "total": potential_revenue
        }]
        
        # Set due date to 30 days from now
        due_date = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
        
        invoice = {
            "invoice_id": invoice_id,
            "recipient_name": aff.get("name", "Unknown"),
            "recipient_email": None,
            "invoice_type": "affiliate",
            "line_items": line_items,
            "total_amount": potential_revenue,
            "status": "pending",
            "due_date": due_date,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.invoices.insert_one(invoice)
        invoices_created += 1
    
    return {"status": "success", "invoices_created": invoices_created}


# ==================== WEEKLY PDF REPORT ====================

@app.get("/api/reports/weekly")
async def generate_weekly_report():
    """Generate a weekly PDF report for advertisers with analytics summary"""
    from fpdf import FPDF
    
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    
    # Fetch data
    affiliates = await db.affiliates.find().to_list(100)
    banners = await db.banners.find().to_list(100)
    events = await db.analytics.find().to_list(10000)
    invoices = await db.invoices.find().to_list(100)
    
    # Aggregate events from last 7 days
    weekly_events = [e for e in events if e.get("created_at", "") >= week_ago.isoformat()]
    event_counts = {}
    for e in weekly_events:
        etype = e.get("event_type", "unknown")
        event_counts[etype] = event_counts.get(etype, 0) + 1
    
    total_affiliate_clicks = sum(a.get("click_count", 0) for a in affiliates)
    total_banner_views = sum(b.get("view_count", 0) for b in banners)
    total_banner_clicks = sum(b.get("click_count", 0) for b in banners)
    active_affiliates = len([a for a in affiliates if a.get("is_active")])
    active_banners = len([b for b in banners if b.get("is_active")])
    
    # Invoice stats
    paid_invoices = [i for i in invoices if i.get("status") == "paid"]
    pending_invoices = [i for i in invoices if i.get("status") == "pending"]
    total_revenue = sum(i.get("total_amount", 0) for i in paid_invoices)
    pending_amount = sum(i.get("total_amount", 0) for i in pending_invoices)
    
    # Generate PDF
    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    
    # Title
    pdf.set_font("Helvetica", "B", 24)
    pdf.set_text_color(10, 22, 40)
    pdf.cell(0, 15, "My Optical Wallet", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.set_font("Helvetica", "", 14)
    pdf.set_text_color(107, 124, 143)
    pdf.cell(0, 8, "Weekly Advertiser Report", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 8, f"Period: {week_ago.strftime('%B %d, %Y')} - {now.strftime('%B %d, %Y')}", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(10)
    
    # Summary Section
    pdf.set_font("Helvetica", "B", 16)
    pdf.set_text_color(74, 158, 255)
    pdf.cell(0, 10, "Executive Summary", new_x="LMARGIN", new_y="NEXT")
    pdf.set_draw_color(74, 158, 255)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(5)
    
    pdf.set_font("Helvetica", "", 11)
    pdf.set_text_color(60, 60, 60)
    
    summary_data = [
        ("Total Weekly Events", str(len(weekly_events))),
        ("App Opens (Weekly)", str(event_counts.get("app_open", 0))),
        ("Share Clicks (Weekly)", str(event_counts.get("share_click", 0))),
        ("Banner Views (All-Time)", str(total_banner_views)),
        ("Banner Clicks (All-Time)", str(total_banner_clicks)),
        ("Affiliate Clicks (All-Time)", str(total_affiliate_clicks)),
    ]
    
    for label, value in summary_data:
        pdf.set_font("Helvetica", "", 11)
        pdf.cell(120, 8, label)
        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(0, 8, value, new_x="LMARGIN", new_y="NEXT")
    
    pdf.ln(8)
    
    # Financial Section
    pdf.set_font("Helvetica", "B", 16)
    pdf.set_text_color(76, 175, 80)
    pdf.cell(0, 10, "Financial Overview", new_x="LMARGIN", new_y="NEXT")
    pdf.set_draw_color(76, 175, 80)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(5)
    
    pdf.set_text_color(60, 60, 60)
    finance_data = [
        ("Total Revenue (Paid)", f"${total_revenue:.2f}"),
        ("Pending Amount", f"${pending_amount:.2f}"),
        ("Paid Invoices", str(len(paid_invoices))),
        ("Pending Invoices", str(len(pending_invoices))),
    ]
    
    for label, value in finance_data:
        pdf.set_font("Helvetica", "", 11)
        pdf.cell(120, 8, label)
        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(0, 8, value, new_x="LMARGIN", new_y="NEXT")
    
    pdf.ln(8)
    
    # Affiliate Performance Table
    pdf.set_font("Helvetica", "B", 16)
    pdf.set_text_color(224, 64, 251)
    pdf.cell(0, 10, "Affiliate Performance", new_x="LMARGIN", new_y="NEXT")
    pdf.set_draw_color(224, 64, 251)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(5)
    
    if affiliates:
        # Table header
        pdf.set_font("Helvetica", "B", 10)
        pdf.set_fill_color(240, 240, 245)
        pdf.set_text_color(60, 60, 60)
        pdf.cell(70, 8, "Partner", border=1, fill=True)
        pdf.cell(35, 8, "Commission %", border=1, fill=True, align="C")
        pdf.cell(30, 8, "Clicks", border=1, fill=True, align="C")
        pdf.cell(30, 8, "Status", border=1, fill=True, align="C")
        pdf.cell(0, 8, "", new_x="LMARGIN", new_y="NEXT")
        
        pdf.set_font("Helvetica", "", 10)
        for aff in sorted(affiliates, key=lambda x: x.get("click_count", 0), reverse=True):
            pdf.cell(70, 7, aff.get("name", "")[:30], border=1)
            pdf.cell(35, 7, f"{aff.get('commission', 0)}%", border=1, align="C")
            pdf.cell(30, 7, str(aff.get("click_count", 0)), border=1, align="C")
            status = "Active" if aff.get("is_active") else "Inactive"
            pdf.cell(30, 7, status, border=1, align="C")
            pdf.cell(0, 7, "", new_x="LMARGIN", new_y="NEXT")
    else:
        pdf.set_font("Helvetica", "I", 11)
        pdf.set_text_color(150, 150, 150)
        pdf.cell(0, 8, "No affiliates configured", new_x="LMARGIN", new_y="NEXT")
    
    pdf.ln(8)
    
    # Banner Performance
    pdf.set_font("Helvetica", "B", 16)
    pdf.set_text_color(255, 152, 0)
    pdf.cell(0, 10, "Banner Performance", new_x="LMARGIN", new_y="NEXT")
    pdf.set_draw_color(255, 152, 0)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(5)
    
    if banners:
        pdf.set_font("Helvetica", "B", 10)
        pdf.set_fill_color(240, 240, 245)
        pdf.set_text_color(60, 60, 60)
        pdf.cell(60, 8, "Banner", border=1, fill=True)
        pdf.cell(30, 8, "Views", border=1, fill=True, align="C")
        pdf.cell(30, 8, "Clicks", border=1, fill=True, align="C")
        pdf.cell(30, 8, "CTR", border=1, fill=True, align="C")
        pdf.cell(30, 8, "Status", border=1, fill=True, align="C")
        pdf.cell(0, 8, "", new_x="LMARGIN", new_y="NEXT")
        
        pdf.set_font("Helvetica", "", 10)
        for ban in banners:
            views = ban.get("view_count", 0)
            clicks = ban.get("click_count", 0)
            ctr = f"{(clicks / views * 100):.1f}%" if views > 0 else "0.0%"
            title = (ban.get("title") or "Untitled")[:25]
            pdf.cell(60, 7, title, border=1)
            pdf.cell(30, 7, str(views), border=1, align="C")
            pdf.cell(30, 7, str(clicks), border=1, align="C")
            pdf.cell(30, 7, ctr, border=1, align="C")
            status = "Active" if ban.get("is_active") else "Inactive"
            pdf.cell(30, 7, status, border=1, align="C")
            pdf.cell(0, 7, "", new_x="LMARGIN", new_y="NEXT")
    else:
        pdf.set_font("Helvetica", "I", 11)
        pdf.set_text_color(150, 150, 150)
        pdf.cell(0, 8, "No banners configured", new_x="LMARGIN", new_y="NEXT")
    
    pdf.ln(10)
    
    # Footer
    pdf.set_font("Helvetica", "I", 9)
    pdf.set_text_color(150, 150, 150)
    pdf.cell(0, 8, f"Generated on {now.strftime('%B %d, %Y at %I:%M %p UTC')}", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.cell(0, 6, "My Optical Wallet - Confidential Advertiser Report", new_x="LMARGIN", new_y="NEXT", align="C")
    
    # Return as streaming PDF
    pdf_buffer = io.BytesIO()
    pdf_output = pdf.output()
    pdf_buffer.write(pdf_output)
    pdf_buffer.seek(0)
    
    filename = f"MOW_Weekly_Report_{now.strftime('%Y%m%d')}.pdf"
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
