# Deployment Guide for Optical Rx Now

This guide provides step-by-step instructions for deploying the Optical Rx Now backend to various cloud platforms and building mobile apps with Expo Application Services (EAS).

---

## Table of Contents

1. [Backend Deployment](#backend-deployment)
   - [Railway](#option-1-railway-recommended)
   - [Render](#option-2-render)
   - [Fly.io](#option-3-flyio)
   - [Heroku](#option-4-heroku)
2. [MongoDB Setup](#mongodb-setup)
3. [Frontend Build with EAS](#frontend-build-with-eas)
4. [Environment Configuration](#environment-configuration)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## Backend Deployment

The backend is a FastAPI Python application that provides:
- Anonymous analytics tracking
- Affiliate partner management
- Admin dashboard

### Prerequisites
- Git repository with backend code
- MongoDB Atlas account (or local MongoDB for testing)
- Backend dependencies in `requirements.txt`

---

### Option 1: Railway (Recommended)

Railway provides a simple deployment experience with automatic builds and zero-config deployments.

#### Why Railway?
- ✅ Free tier available ($5 monthly credit)
- ✅ Automatic HTTPS
- ✅ Environment variable management
- ✅ Auto-deploys from Git
- ✅ Built-in monitoring

#### Steps

1. **Create Railway Account**
   - Go to https://railway.app/
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Authorize Railway to access your repository
   - Select the `Optical-Rx-Now` repository

3. **Configure Service**
   - Railway should auto-detect the `backend/railway.json` configuration
   - If not, manually set:
     - **Root Directory:** `backend`
     - **Start Command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`

4. **Set Environment Variables**
   Click on your service → Variables tab:
   ```
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
   DB_NAME=optical_rx_now
   ADMIN_KEY=<generate-secure-random-string>
   ALLOWED_ORIGINS=https://your-app-domain.com
   ```
   
   Generate secure admin key:
   ```bash
   openssl rand -hex 32
   ```

5. **Deploy**
   - Railway deploys automatically on Git push
   - First deployment starts immediately
   - Watch logs for any errors

6. **Get Your URL**
   - Go to Settings → Domains
   - Railway provides a domain like: `your-app.railway.app`
   - Optionally add custom domain

7. **Test Deployment**
   ```bash
   # Test analytics endpoint
   curl -X POST https://your-app.railway.app/api/analytics/track \
     -H "Content-Type: application/json" \
     -d '{"event":"test","deviceId":"test123"}'
   ```

---

### Option 2: Render

Render offers a developer-friendly platform with automatic SSL and continuous deployment.

#### Why Render?
- ✅ Free tier for web services
- ✅ Automatic SSL certificates
- ✅ Easy rollbacks
- ✅ Preview environments
- ✅ Auto-deploys from Git

#### Steps

1. **Create Render Account**
   - Go to https://render.com/
   - Sign up with GitHub

2. **Create New Web Service**
   - Dashboard → New → Web Service
   - Connect your GitHub repository
   - Select the `Optical-Rx-Now` repository

3. **Configure Service**
   - **Name:** `optical-rx-now-api`
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free (or paid for more resources)

4. **Set Environment Variables**
   In the Environment section, add:
   ```
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
   DB_NAME=optical_rx_now
   ADMIN_KEY=<generate-secure-random-string>
   ALLOWED_ORIGINS=https://your-app-domain.com
   PORT=10000
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render builds and deploys automatically
   - Monitor logs during deployment

6. **Get Your URL**
   - Render provides: `https://your-app.onrender.com`
   - Custom domains available in Settings

7. **Configure Auto-Deploy**
   - Settings → Build & Deploy
   - Enable "Auto-Deploy" for main branch
   - Pushes to main automatically redeploy

---

### Option 3: Fly.io

Fly.io runs your app on servers close to your users with global distribution.

#### Why Fly.io?
- ✅ Global edge deployment
- ✅ Free tier (3 VMs)
- ✅ Fast deployments
- ✅ Automatic HTTPS
- ✅ Built-in scaling

#### Steps

1. **Install flyctl**
   ```bash
   # macOS
   brew install flyctl
   
   # Linux
   curl -L https://fly.io/install.sh | sh
   
   # Windows
   iwr https://fly.io/install.ps1 -useb | iex
   ```

2. **Sign Up/Login**
   ```bash
   fly auth signup
   # or
   fly auth login
   ```

3. **Initialize App**
   ```bash
   cd backend
   fly launch
   ```
   
   Follow prompts:
   - App name: `optical-rx-now-api` (or auto-generated)
   - Region: Choose closest to your users
   - PostgreSQL: No (we use MongoDB)
   - Redis: No
   - Deploy: Not yet

4. **Configure `fly.toml`**
   `fly launch` creates `fly.toml`. Verify it contains:
   ```toml
   app = "optical-rx-now-api"
   primary_region = "sea"
   
   [build]
   
   [env]
     PORT = "8080"
   
   [http_service]
     internal_port = 8080
     force_https = true
     auto_stop_machines = true
     auto_start_machines = true
     min_machines_running = 0
   ```

5. **Set Secrets**
   ```bash
   fly secrets set MONGO_URL="mongodb+srv://username:password@cluster.mongodb.net/"
   fly secrets set DB_NAME="optical_rx_now"
   fly secrets set ADMIN_KEY="$(openssl rand -hex 32)"
   fly secrets set ALLOWED_ORIGINS="https://your-app-domain.com"
   ```

6. **Deploy**
   ```bash
   fly deploy
   ```
   
   Monitor deployment:
   ```bash
   fly logs
   ```

7. **Get Your URL**
   - Fly provides: `https://your-app.fly.dev`
   - Custom domains: `fly certs add your-domain.com`

8. **Scale (Optional)**
   ```bash
   # Add more regions
   fly regions add iad lhr syd
   
   # Scale machines
   fly scale count 2
   ```

---

### Option 4: Heroku

Heroku is a traditional PaaS with extensive documentation and add-ons.

#### Steps

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Other platforms: https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login**
   ```bash
   heroku login
   ```

3. **Create App**
   ```bash
   cd backend
   heroku create optical-rx-now-api
   ```

4. **Set Buildpack**
   ```bash
   heroku buildpacks:set heroku/python
   ```

5. **Configure Environment Variables**
   ```bash
   heroku config:set MONGO_URL="mongodb+srv://username:password@cluster.mongodb.net/"
   heroku config:set DB_NAME="optical_rx_now"
   heroku config:set ADMIN_KEY="$(openssl rand -hex 32)"
   heroku config:set ALLOWED_ORIGINS="https://your-app-domain.com"
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```
   
   Or deploy from GitHub:
   - Dashboard → Deploy → Connect to GitHub
   - Enable automatic deploys

7. **Verify Procfile**
   Ensure `backend/Procfile` exists:
   ```
   web: uvicorn server:app --host 0.0.0.0 --port $PORT
   ```

8. **Open App**
   ```bash
   heroku open
   ```

9. **View Logs**
   ```bash
   heroku logs --tail
   ```

---

## MongoDB Setup

All deployment options require a MongoDB database. We recommend MongoDB Atlas.

### MongoDB Atlas (Recommended)

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free

2. **Create Cluster**
   - Choose "Free Shared" (M0)
   - Select cloud provider and region (choose closest to your backend)
   - Cluster name: `OpticalRxNow`
   - Create cluster (takes 3-5 minutes)

3. **Create Database User**
   - Security → Database Access
   - Add New Database User
   - Authentication: Password
   - Username: `opticalrxnow_user`
   - Password: Auto-generate (save it!)
   - Database User Privileges: "Read and write to any database"

4. **Configure Network Access**
   - Security → Network Access
   - Add IP Address
   - For testing: `0.0.0.0/0` (allow from anywhere)
   - For production: Add specific IPs of your deployment platform

5. **Get Connection String**
   - Database → Connect
   - Choose "Connect your application"
   - Driver: Python, Version: 3.12+
   - Copy connection string:
     ```
     mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your credentials

6. **Create Database**
   - Collections → Create Database
   - Database name: `optical_rx_now`
   - Collection name: `analytics`
   - Create another collection: `affiliates`

7. **Test Connection**
   ```bash
   # Install mongosh
   brew install mongosh
   
   # Connect
   mongosh "mongodb+srv://username:password@cluster.mongodb.net/"
   
   # Switch to database
   use optical_rx_now
   
   # Insert test document
   db.analytics.insertOne({event: "test", deviceId: "test123"})
   
   # Query
   db.analytics.find()
   ```

### Alternative: Local MongoDB (Development Only)

1. **Install MongoDB**
   ```bash
   # macOS
   brew tap mongodb/brew
   brew install mongodb-community
   
   # Start service
   brew services start mongodb-community
   ```

2. **Use Local URL**
   ```bash
   MONGO_URL=mongodb://localhost:27017
   ```

---

## Frontend Build with EAS

### Prerequisites

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

3. **Configure EAS**
   ```bash
   cd frontend
   eas init
   ```
   
   This creates/updates:
   - EAS Project ID in `app.json`
   - `eas.json` configuration

### Development Builds

For testing on physical devices:

```bash
# iOS
eas build --platform ios --profile development

# Android
eas build --platform android --profile development

# Install on device
# iOS: Download IPA and install via Xcode/TestFlight
# Android: Download APK and install directly
```

### Production Builds

For app store submission:

```bash
# iOS
eas build --platform ios --profile production

# Android  
eas build --platform android --profile production

# Both platforms simultaneously
eas build --platform all --profile production
```

### Build Monitoring

- View builds: https://expo.dev/accounts/[account]/projects/[project]/builds
- Download artifacts when complete
- Build time: ~15-30 minutes

### Automatic Submission

Configure in `eas.json`:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCDE12345"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

Then submit:
```bash
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

---

## Environment Configuration

### Backend Environment Variables

Create `backend/.env` for local development:

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=optical_rx_now
ADMIN_KEY=dev-admin-key-change-in-production
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006
PORT=8000
```

**Never commit `.env` to Git!** Use `.env.example` as template.

### Frontend Environment Variables

Create `frontend/.env`:

```env
EXPO_PUBLIC_BACKEND_URL=http://localhost:8000
EXPO_PUBLIC_ADMOB_IOS_APP_ID=ca-app-pub-3940256099942544~1458002511
EXPO_PUBLIC_ADMOB_ANDROID_APP_ID=ca-app-pub-3940256099942544~3347511713
```

For production builds, update in `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_BACKEND_URL": "https://your-backend.railway.app"
      }
    }
  }
}
```

---

## Testing

### Local Testing

1. **Start Backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn server:app --reload --port 8000
   ```

2. **Start Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Test on Device**
   - Scan QR code with Expo Go app
   - Or build development client: `eas build --profile development`

### Production Testing

1. **Backend Health Check**
   ```bash
   curl https://your-backend-url.com/
   ```

2. **Analytics Endpoint**
   ```bash
   curl -X POST https://your-backend-url.com/api/analytics/track \
     -H "Content-Type: application/json" \
     -d '{
       "event": "app_open",
       "deviceId": "test-device-123",
       "timestamp": "2026-02-03T00:00:00Z"
     }'
   ```

3. **Admin Dashboard** (requires admin key)
   ```bash
   curl https://your-backend-url.com/api/analytics/dashboard \
     -H "X-Admin-Key: your-admin-key"
   ```

4. **Affiliates Endpoint**
   ```bash
   curl https://your-backend-url.com/api/affiliates
   ```

### TestFlight/Internal Testing

1. **iOS TestFlight**
   - Build appears automatically in App Store Connect
   - Add testers in TestFlight section
   - Distribute build

2. **Android Internal Testing**
   - Upload AAB to Play Console
   - Create Internal Testing release
   - Add tester emails
   - Share testing link

---

## Troubleshooting

### Backend Issues

**Problem:** Backend won't start
```bash
# Check logs
railway logs  # Railway
fly logs      # Fly.io
heroku logs --tail  # Heroku

# Common issues:
# - Missing environment variables
# - MongoDB connection failure
# - Port binding issues
```

**Problem:** MongoDB connection timeout
- Verify connection string format
- Check network access (whitelist IPs)
- Verify database user credentials
- Check MongoDB Atlas cluster is running

**Problem:** CORS errors in frontend
- Add frontend domain to `ALLOWED_ORIGINS`
- Include both HTTP and HTTPS versions
- Include localhost for development

### Frontend Build Issues

**Problem:** EAS build fails
```bash
# Check build logs in Expo dashboard
# Common issues:
# - Missing assets
# - Invalid bundle identifier
# - Incorrect EAS project ID
# - Version conflicts

# Clear cache and retry
eas build --platform ios --profile production --clear-cache
```

**Problem:** Environment variables not working
- Ensure variables prefixed with `EXPO_PUBLIC_`
- Restart development server after changing `.env`
- For production, set in `eas.json` under `build.production.env`

**Problem:** AdMob not showing ads
- Wait 24-48 hours after app launch
- Verify AdMob IDs are production IDs (not test IDs)
- Check AdMob account status
- Review AdMob policies compliance

### Deployment Issues

**Problem:** Railway deployment failed
- Check build logs in Railway dashboard
- Verify `railway.json` is in backend directory
- Ensure all dependencies in `requirements.txt`

**Problem:** Render service won't start
- Check build and runtime logs
- Verify Python version compatibility
- Ensure `PORT` environment variable is used

**Problem:** Fly.io deployment timeout
- Increase health check timeout in `fly.toml`
- Check application logs: `fly logs`
- Verify Dockerfile or buildpack configuration

---

## Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      # Railway
      - name: Deploy to Railway
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
      
      # Or Fly.io
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

---

## Security Best Practices

1. **Never commit secrets**
   - Use `.env` files locally
   - Use platform secret management in production
   - Rotate keys regularly

2. **Enable HTTPS**
   - All platforms provide automatic HTTPS
   - Never use HTTP in production

3. **Restrict CORS**
   - Only allow your app's domains
   - Don't use `*` in production

4. **MongoDB Security**
   - Use strong passwords
   - Restrict IP access
   - Enable encryption at rest
   - Regular backups

5. **Admin Key Security**
   - Generate strong random keys
   - Never expose in client code
   - Rotate periodically
   - Use separate keys for dev/prod

---

## Monitoring and Maintenance

### Application Monitoring

- **Railway:** Built-in metrics dashboard
- **Render:** Metrics in service dashboard
- **Fly.io:** `fly dashboard` and metrics UI
- **Heroku:** Heroku Metrics or New Relic add-on

### Database Monitoring

- **MongoDB Atlas:** Performance Advisor, Real-time metrics
- Set up alerts for:
  - High CPU usage
  - Storage limits
  - Connection issues

### Cost Management

- **Railway:** $5/month free credit, then pay-as-you-go
- **Render:** Free tier available, upgrade as needed
- **Fly.io:** 3 free VMs, then $0.0000008/sec
- **MongoDB Atlas:** M0 tier free forever (512 MB storage)

---

## Next Steps

After successful deployment:

1. ✅ Update `EXPO_PUBLIC_BACKEND_URL` in frontend
2. ✅ Build and test production apps
3. ✅ Submit to app stores (see `PUBLISH_CHECKLIST.md`)
4. ✅ Monitor for errors and crashes
5. ✅ Set up regular backups
6. ✅ Plan for scaling as user base grows

---

## Resources

- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)
- [Fly.io Documentation](https://fly.io/docs/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)

---

**Need help?** Open an issue on GitHub or contact support for your chosen platform.

**Happy Deploying! 🚀**
