import asyncio
import logging
import math
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

import requests
from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, Query
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, ConfigDict, Field
from starlette.middleware.cors import CORSMiddleware


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str


class OpticalStore(BaseModel):
    id: str
    name: str
    address: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    distance_km: float
    latitude: float
    longitude: float
    source: str


class LocationLabel(BaseModel):
    city: str


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius_km = 6371
    lat1_rad, lon1_rad = math.radians(lat1), math.radians(lon1)
    lat2_rad, lon2_rad = math.radians(lat2), math.radians(lon2)
    delta_lat = lat2_rad - lat1_rad
    delta_lon = lon2_rad - lon1_rad

    arc = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2
    )
    return round(radius_km * 2 * math.atan2(math.sqrt(arc), math.sqrt(1 - arc)), 1)


def format_address(tags: dict) -> Optional[str]:
    parts = [
        tags.get("addr:housenumber"),
        tags.get("addr:street"),
        tags.get("addr:city"),
        tags.get("addr:state"),
        tags.get("addr:postcode"),
    ]
    address = ", ".join(part for part in parts if part)
    return address or tags.get("addr:full") or None


def build_maps_fallback(lat: float, lng: float) -> List[OpticalStore]:
    maps_url = f"https://www.google.com/maps/search/optical+store/@{lat},{lng},14z"
    return [
        OpticalStore(
            id="maps-fallback",
            name="Open nearby optical stores in Maps",
            address="Live nearby search powered by your current GPS location.",
            website=maps_url,
            phone=None,
            distance_km=0,
            latitude=lat,
            longitude=lng,
            source="maps_fallback",
        )
    ]


def fetch_optical_stores(lat: float, lng: float) -> List[OpticalStore]:
    overpass_query = f"""
    [out:json][timeout:20];
    (
      node[\"shop\"=\"optician\"](around:12000,{lat},{lng});
      way[\"shop\"=\"optician\"](around:12000,{lat},{lng});
      relation[\"shop\"=\"optician\"](around:12000,{lat},{lng});
    );
    out center tags;
    """

    response = requests.post(
        "https://overpass-api.de/api/interpreter",
        data=overpass_query,
        timeout=25,
    )
    response.raise_for_status()
    payload = response.json()

    stores: List[OpticalStore] = []
    for element in payload.get("elements", []):
        tags = element.get("tags", {})
        store_lat = element.get("lat") or element.get("center", {}).get("lat")
        store_lng = element.get("lon") or element.get("center", {}).get("lon")

        if not tags.get("name") or store_lat is None or store_lng is None:
            continue

        stores.append(
            OpticalStore(
                id=f"{element.get('type', 'store')}-{element.get('id')}",
                name=tags["name"],
                address=format_address(tags),
                website=tags.get("website"),
                phone=tags.get("phone"),
                distance_km=haversine_distance(lat, lng, store_lat, store_lng),
                latitude=store_lat,
                longitude=store_lng,
                source="osm",
            )
        )

    stores.sort(key=lambda store: (store.distance_km, store.name.lower()))
    return stores[:12]


def fetch_location_label(lat: float, lng: float) -> str:
    response = requests.get(
        "https://nominatim.openstreetmap.org/reverse",
        params={
            "format": "jsonv2",
            "lat": lat,
            "lon": lng,
        },
        headers={"User-Agent": "MyOpticalWallet/1.0"},
        timeout=20,
    )
    response.raise_for_status()
    payload = response.json()
    address = payload.get("address", {})

    return (
        address.get("city")
        or address.get("town")
        or address.get("village")
        or address.get("municipality")
        or address.get("county")
        or payload.get("name")
        or "Current area"
    )

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks


@api_router.get("/public/optical-stores", response_model=List[OpticalStore])
async def get_optical_stores(
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
):
    try:
        stores = await asyncio.to_thread(fetch_optical_stores, lat, lng)
        return stores or build_maps_fallback(lat, lng)
    except (requests.RequestException, ValueError) as exc:
        logger.warning("Store lookup failed: %s", exc)
        return build_maps_fallback(lat, lng)


@api_router.get("/public/location-label", response_model=LocationLabel)
async def get_location_label(
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
):
    try:
        city = await asyncio.to_thread(fetch_location_label, lat, lng)
        return LocationLabel(city=city)
    except (requests.RequestException, ValueError) as exc:
        logger.warning("Location label lookup failed: %s", exc)
        return LocationLabel(city="Current area")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
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