# Railway Deployment Guide - My Optical Wallet Backend

## Overview
This guide deploys your FastAPI backend + MongoDB to Railway for permanent hosting.

---

## Step 1: Set Up MongoDB Atlas (Free Database)

1. Go to https://cloud.mongodb.com and create a free account
2. Click "Build a Database" → Choose **M0 Free** tier
3. Select a region close to you (e.g., US East)
4. Set a database username and password (save these!)
5. Under "Network Access" → Click "Add IP Address" → Choose **"Allow Access from Anywhere"** (0.0.0.0/0)
6. Go to "Database" → Click **"Connect"** → Choose **"Drivers"**
7. Copy the connection string — it looks like:
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
8. Replace `<password>` with your actual password

---

## Step 2: Deploy Backend on Railway

1. Go to https://railway.app and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub Repo"**
3. Select your **Optical-Rx-Now** repository
4. Railway will detect the repo — click on the service
5. Go to **Settings** tab:
   - Set **Root Directory** to: `backend`
   - Set **Start Command** to: `uvicorn server:app --host 0.0.0.0 --port $PORT`
6. Go to **Variables** tab and add these:
   ```
   MONGO_URL = mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/optical_wallet?retryWrites=true&w=majority
   DB_NAME = optical_wallet
   ADMIN_API_KEY = Pvz8xwghNOsIOtw1tBKZXO4LsaB_3xOjiNy81w4qy08
   ```
7. Click **Deploy** — Railway will build and deploy automatically
8. Once deployed, go to **Settings** → **Networking** → **Generate Domain**
9. Copy your Railway URL (e.g., `https://your-app-name.up.railway.app`)

---

## Step 3: Update Your App's Backend URL

After Railway gives you a URL, update these files:

### In `frontend/services/adminApi.ts`:
Change line:
```typescript
const PRODUCTION_BACKEND_URL = "https://optical-rx-now.preview.emergentagent.com";
```
To:
```typescript
const PRODUCTION_BACKEND_URL = "https://YOUR-RAILWAY-URL.up.railway.app";
```

### In `frontend/app.json` (extra field):
```json
"EXPO_PUBLIC_BACKEND_URL": "https://YOUR-RAILWAY-URL.up.railway.app"
```

### In `frontend/eas.json` (both preview and production profiles):
```json
"EXPO_PUBLIC_BACKEND_URL": "https://YOUR-RAILWAY-URL.up.railway.app"
```

---

## Step 4: Rebuild APK

After updating the URLs:
```bash
cd frontend
eas build --platform android --profile preview
```

---

## Step 5: Verify

Visit in your browser:
```
https://YOUR-RAILWAY-URL.up.railway.app/api/health
```

You should see:
```json
{"status": "healthy", "service": "my-optical-wallet", "version": "2.0.1"}
```

---

## Costs
- **MongoDB Atlas M0**: Free forever (512MB)
- **Railway**: ~$5/month (includes $5 free credit on sign-up)

---

## Troubleshooting
- If backend shows "Offline" → Check Railway logs for errors
- If MongoDB won't connect → Verify IP whitelist is set to 0.0.0.0/0
- If CORS errors → Backend already has `allow_origins=["*"]`
