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

## Admin Dashboard

A simple web-based admin dashboard is available at `frontend/admin-dashboard.html`.

### Features:
- 📊 **Real-time Analytics Dashboard**
  - Total downloads and active users (daily, weekly, monthly)
  - Platform breakdown (iOS, Android, Web)
  - Engagement metrics (ad clicks, affiliate clicks)
  - Auto-refresh every 60 seconds
  
- 🔗 **Manage Affiliate Partners**
  - Add, edit, and delete affiliate partners
  - Toggle active status with one click
  - Set featured affiliates and display order
  - Categorize by eyeglasses, contacts, or both

- 🔐 **Secure & Simple**
  - No login required - just enter admin key once
  - Admin key stored in browser localStorage
  - Configurable API URL for different environments
  - Real-time connection status indicator

### Usage:

1. **Open the Dashboard**
   - Open `frontend/admin-dashboard.html` in your browser
   - Or host it on any static file hosting service

2. **First Time Setup**
   - Enter your admin key (same as the `ADMIN_KEY` environment variable)
   - Optionally configure the API URL (default: `http://localhost:8000/api`)
   - The admin key is stored in your browser for future sessions

3. **Managing Affiliates**
   - Click "Add New Affiliate" to create a new partner
   - Use "Edit" to modify existing affiliates
   - "Activate/Deactivate" to control visibility in the app
   - "Delete" to permanently remove an affiliate

4. **Viewing Analytics**
   - Dashboard automatically loads analytics on page load
   - Click "Refresh" to manually update
   - Analytics auto-refresh every 60 seconds

### Hosting Options:

The dashboard is a single HTML file with no dependencies, so you can:
- Open it directly from your filesystem (`file://`)
- Host on **GitHub Pages**
- Deploy to **Netlify** or **Vercel**
- Upload to any static hosting service
- Serve from an S3 bucket or CDN

**Note:** For production use, configure your backend's `ALLOWED_ORIGINS` to include your dashboard's URL for CORS support.

