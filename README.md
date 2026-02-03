# Optical Rx Now

A mobile application for managing optical prescriptions locally on your device with privacy-first architecture.

## Architecture

### Local-First Privacy
- All prescription and family member data is stored **locally on the user's device**
- The backend only handles:
  - Anonymous analytics (device IDs, app opens, clicks)
  - Affiliate partner links (read-only for users)
  - Admin dashboard for advertiser metrics
- **No PHI (Protected Health Information) leaves the device**

### Backend Endpoints (Analytics Only)
- `POST /api/analytics/track` - Track anonymous events (app opens, ad clicks, affiliate clicks)
- `GET /api/analytics/dashboard` - Admin analytics dashboard (requires admin key)
- `GET /api/affiliates` - Get active affiliate partners (public, read-only)
- `GET /api/affiliates/all` - Get all affiliates including inactive (requires admin key)
- `POST /api/affiliates` - Create affiliate partner (requires admin key)
- `PUT /api/affiliates/{id}` - Update affiliate partner (requires admin key)
- `DELETE /api/affiliates/{id}` - Delete affiliate partner (requires admin key)

### Benefits
- **Privacy**: User's sensitive prescription data never leaves their device
- **Security**: No PHI to protect from data breaches
- **Compliance**: No HIPAA requirements
- **Cost**: Minimal backend infrastructure needed
- **Offline**: App works without internet for core features

## Setup

### Backend Setup
1. Install dependencies: `pip install -r backend/requirements.txt`
2. Set environment variables:
   - `MONGO_URL` - MongoDB connection string (default: mongodb://localhost:27017)
   - `DB_NAME` - Database name (default: optical_rx_now)
   - `ADMIN_KEY` - Admin key for protected endpoints (default: change-this-in-production)
   - `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins
3. Run server: `uvicorn backend.server:app --reload`

### Frontend Setup
See [frontend/README.md](frontend/README.md) for frontend setup instructions.

## Security

### Admin Authentication
Protected endpoints require an `X-Admin-Key` header with the configured admin key:
- `/api/analytics/dashboard`
- `/api/affiliates/all`
- POST/PUT/DELETE `/api/affiliates`

Example:
```bash
curl -H "X-Admin-Key: your-admin-key" https://api.example.com/api/analytics/dashboard
```

### CORS Configuration
CORS is restricted to specific origins. Configure allowed origins via the `ALLOWED_ORIGINS` environment variable.

