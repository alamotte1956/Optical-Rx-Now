from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

app = FastAPI(title="Optical Rx Now API - Minimal")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def health_check():
    return {"status": "healthy", "service": "Optical Rx Now API", "mode": "frontend-only"}

@app.get("/api/")
async def api_root():
    return {"message": "Optical Rx Now API - Frontend Only Mode", "note": "All data is stored locally on device"}

@app.get("/api/health")
async def api_health():
    return {"status": "healthy", "service": "optical-rx-now", "version": "1.0.0"}

# Kubernetes standard health endpoints
@app.get("/healthz")
async def healthz():
    """Kubernetes liveness probe endpoint"""
    return {"status": "ok"}

@app.get("/readyz")
async def readyz():
    """Kubernetes readiness probe endpoint"""
    return {"status": "ok"}

