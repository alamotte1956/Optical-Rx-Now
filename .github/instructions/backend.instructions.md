---
applyTo:
  - "backend/**/*.py"
  - "**/*_test.py"
  - "**/test_*.py"
---

# Backend Instructions (Python/FastAPI)

## Technology Stack
- **Framework**: FastAPI for async API endpoints
- **Database**: MongoDB with Motor (async driver)
- **Validation**: Pydantic v2 for request/response models
- **Testing**: pytest with mocking for database operations

## Code Style

### Formatting & Linting
- Use `black` for automatic code formatting (88 char line length)
- Use `isort` for import sorting
- Use `flake8` for linting
- Use `mypy` for type checking

### Type Hints
- ALWAYS add type hints to function parameters and return values
- Use `Optional[Type]` for nullable values
- Use Pydantic models for complex data structures

### Example:
```python
from typing import Optional
from pydantic import BaseModel

async def get_analytics(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
) -> dict:
    """Get analytics data for a date range."""
    pass
```

## API Endpoint Patterns

### Rate Limiting
- All public endpoints should have rate limiting
- Default: 60 requests per minute per IP
- Use `slowapi` library for rate limiting

### Admin Authentication
- Protected endpoints require `X-Admin-Key` header
- Validate against `ADMIN_KEY` environment variable
- Return 401 for missing/invalid keys

### Input Validation
- Use Pydantic models for request body validation
- Validate string lengths (e.g., device_id: 10-100 chars)
- Validate URLs with proper regex
- Sanitize MongoDB ObjectIDs before queries

### Error Handling
- Return proper HTTP status codes
- Use HTTPException from FastAPI
- Include descriptive error messages
- Log errors for debugging

### Example Endpoint:
```python
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, Field, validator

router = APIRouter()

class AnalyticsEvent(BaseModel):
    device_id: str = Field(..., min_length=10, max_length=100)
    event_type: str
    metadata: Optional[str] = Field(None, max_length=1000)
    
    @validator('event_type')
    def validate_event_type(cls, v):
        allowed = ['app_open', 'ad_click', 'affiliate_click']
        if v not in allowed:
            raise ValueError(f'event_type must be one of {allowed}')
        return v

@router.post("/analytics/track")
async def track_event(event: AnalyticsEvent):
    # Implementation
    pass

@router.get("/analytics/dashboard")
async def get_dashboard(x_admin_key: str = Header(...)):
    if x_admin_key != os.getenv("ADMIN_KEY"):
        raise HTTPException(status_code=401, detail="Invalid admin key")
    # Implementation
    pass
```

## Database Operations

### MongoDB Best Practices
- Use Motor for async MongoDB operations
- Create indexes automatically on startup
- Use proper connection pooling
- Handle connection errors gracefully

### Example:
```python
from motor.motor_asyncio import AsyncIOMotorClient

# Connection setup
client = AsyncIOMotorClient(os.getenv("MONGO_URL"))
db = client[os.getenv("DB_NAME")]

# Ensure indexes
async def ensure_indexes():
    await db.analytics.create_index([("timestamp", -1)])
    await db.devices.create_index([("device_id", 1)], unique=True)
```

## Environment Configuration

### Required Variables
- `ENV`: "development", "staging", or "production"
- `MONGO_URL`: MongoDB connection string
- `DB_NAME`: Database name
- `ADMIN_KEY`: Admin authentication key (MUST be secure in production)
- `ALLOWED_ORIGINS`: Comma-separated CORS origins

### Validation in Production
```python
if os.getenv("ENV") == "production":
    admin_key = os.getenv("ADMIN_KEY")
    if not admin_key or len(admin_key) < 32:
        raise ValueError("ADMIN_KEY must be set and secure in production")
```

## Testing

### Test Structure
- Use pytest for all tests
- Mock MongoDB connections using `mongomock` or similar
- Test happy paths and error cases
- Test rate limiting behavior
- Test admin authentication

### Example Test:
```python
import pytest
from fastapi.testclient import TestClient
from backend.server import app

client = TestClient(app)

def test_track_analytics_valid():
    response = client.post("/api/analytics/track", json={
        "device_id": "test-device-123",
        "event_type": "app_open",
        "metadata": "test metadata"
    })
    assert response.status_code == 200

def test_track_analytics_invalid_device_id():
    response = client.post("/api/analytics/track", json={
        "device_id": "short",  # Too short
        "event_type": "app_open"
    })
    assert response.status_code == 422
```

## Privacy & Security

### Critical Rules
- **NEVER** accept or store PHI (prescription data, names, etc.)
- **ONLY** store anonymous device IDs and event types
- **ALWAYS** validate that analytics data contains no PII
- **ALWAYS** enforce rate limiting to prevent abuse
- **ALWAYS** validate admin key for protected endpoints

### Data You CAN Store
- Device IDs (anonymous identifiers)
- Event types (app_open, ad_click, etc.)
- Timestamps
- Platform information (iOS/Android/Web)
- Affiliate partner data

### Data You CANNOT Store
- Prescription information
- Names or personal identifiers
- Email addresses (unless for admin/affiliate management)
- Location data (beyond general analytics)
- Health information of any kind

## Common Tasks

### Adding a New API Endpoint
1. Define Pydantic model for request/response
2. Add endpoint to appropriate router
3. Implement proper validation
4. Add authentication if needed (admin key)
5. Write tests for happy path and error cases
6. Document in API comments

### Updating Database Schema
1. Add new fields to Pydantic models
2. Update database indexes if needed
3. Ensure backward compatibility
4. Test with existing data
5. Update tests

### Adding Rate Limiting
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/api/analytics/track")
@limiter.limit("60/minute")
async def track_event(request: Request, event: AnalyticsEvent):
    # Implementation
    pass
```
