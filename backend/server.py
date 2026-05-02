from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

app = FastAPI(title="My Optical Wallet API - Minimal")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def health_check() -> dict[str, str]:
    return {"status": "healthy", "service": "My Optical Wallet API", "mode": "frontend-only"}

@app.get("/api/")
async def api_root() -> dict[str, str]:
    return {"message": "My Optical Wallet API - Frontend Only Mode", "note": "All data is stored locally on device"}

@app.get("/api/health")
async def api_health() -> dict[str, str]:
    return {"status": "healthy", "service": "my-optical-wallet", "version": "1.0.2"}

# Kubernetes standard health endpoints
@app.get("/health")
async def health() -> dict[str, str]:
    """Kubernetes health check endpoint"""
    return {"status": "healthy"}

@app.get("/healthz")
async def healthz() -> dict[str, str]:
    """Kubernetes liveness probe endpoint"""
    return {"status": "ok"}

@app.get("/readyz")
async def readyz() -> dict[str, str]:
    """Kubernetes readiness probe endpoint"""
    return {"status": "ok"}

