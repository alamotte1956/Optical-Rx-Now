# App Store Submission Checklist for Optical Rx Now

This checklist guides you through preparing and submitting Optical Rx Now to both the iOS App Store and Google Play Store.

---

## Pre-Submission Setup

### 1. AdMob Account Setup ⚠️ CRITICAL
- [ ] Create AdMob account at https://admob.google.com/
- [ ] Create iOS app in AdMob console
- [ ] Create Android app in AdMob console
- [ ] Copy iOS App ID from AdMob (format: `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`)
- [ ] Copy Android App ID from AdMob (format: `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`)
- [ ] Create banner ad units for both platforms
- [ ] **CRITICAL:** Replace placeholder AdMob IDs in:
  - `frontend/.env` (create from `.env.example`)
  - `frontend/app.json` (if AdMob plugin is configured there)
- [ ] Review `frontend/ADMOB_WARNING.md` for complete setup instructions

### 2. EAS Account and Project Setup
- [ ] Install EAS CLI: `npm install -g eas-cli`
- [ ] Log in to EAS: `eas login`
- [ ] Initialize EAS project: `cd frontend && eas init`
- [ ] Note the Project ID from `eas init` output
- [ ] Update `frontend/app.json` → `extra.eas.projectId` with actual Project ID

### 3. Apple Developer Account
- [ ] Enroll in Apple Developer Program ($99/year)
- [ ] Note your Team ID from developer.apple.com
- [ ] Create App ID in Certificates, Identifiers & Profiles
  - Bundle ID: `com.alamotte.opticalrxnow` (or your custom domain)
  - Enable capabilities: App Groups (optional)
- [ ] Create App in App Store Connect
  - Note the App Store Connect App ID (10-digit number)

### 4. Google Play Developer Account
- [ ] Enroll in Google Play Console ($25 one-time)
- [ ] Create new app in Play Console
- [ ] Note the package name: `com.alamotte.opticalrxnow`
- [ ] Set up app signing by Google Play (recommended)

### 5. Bundle Identifier Configuration
- [ ] Verify `frontend/app.json`:
  - `ios.bundleIdentifier`: `com.alamotte.opticalrxnow`
  - `android.package`: `com.alamotte.opticalrxnow`
- [ ] Verify `frontend/eas.json`:
  - `build.production.ios.bundleIdentifier`: matches above
  - `build.production.android.package`: matches above

### 6. Environment Variables
- [ ] Create `frontend/.env` from `frontend/.env.example`
- [ ] Update `EXPO_PUBLIC_BACKEND_URL` with production backend URL
- [ ] Update `EXPO_PUBLIC_ADMOB_IOS_APP_ID` with real AdMob iOS ID
- [ ] Update `EXPO_PUBLIC_ADMOB_ANDROID_APP_ID` with real AdMob Android ID
- [ ] **DO NOT** commit `.env` file (should be in `.gitignore`)

---

## Backend Deployment

### Option A: Railway Deployment
- [ ] Create Railway account at https://railway.app/
- [ ] Create new project
- [ ] Connect GitHub repository
- [ ] Deploy backend:
  - Railway will auto-detect `backend/railway.json`
  - Set root directory to `backend/`
- [ ] Configure environment variables in Railway:
  - `MONGO_URL`: MongoDB Atlas connection string (see MongoDB Setup below)
  - `DB_NAME`: `optical_rx_now`
  - `ADMIN_KEY`: Generate secure random string: `openssl rand -hex 32`
  - `ALLOWED_ORIGINS`: Your app's domains
- [ ] Note the Railway deployment URL (e.g., `https://your-app.railway.app`)

### Option B: Render Deployment
- [ ] Create Render account at https://render.com/
- [ ] New Web Service → Connect repository
- [ ] Configure service:
  - Root directory: `backend`
  - Build command: `pip install -r requirements.txt`
  - Start command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
- [ ] Add environment variables (same as Railway above)
- [ ] Note the Render deployment URL

### Option C: Fly.io Deployment
- [ ] Install flyctl: https://fly.io/docs/hands-on/install-flyctl/
- [ ] Sign up: `fly auth signup`
- [ ] Deploy:
  ```bash
  cd backend
  fly launch
  fly secrets set MONGO_URL="your-mongodb-url"
  fly secrets set ADMIN_KEY="your-admin-key"
  fly deploy
  ```
- [ ] Note the Fly.io URL

### MongoDB Setup (All Platforms)
- [ ] Create MongoDB Atlas account: https://www.mongodb.com/cloud/atlas
- [ ] Create free cluster (M0)
- [ ] Create database user
- [ ] Whitelist IP addresses (or use `0.0.0.0/0` for testing)
- [ ] Get connection string
- [ ] Update connection string in your deployment platform

### Verify Backend Deployment
- [ ] Test health endpoint: `curl https://your-backend-url.com/api/health` (if available)
- [ ] Test analytics endpoint: `curl -X POST https://your-backend-url.com/api/analytics/track -H "Content-Type: application/json" -d '{"event":"test","deviceId":"test"}'`
- [ ] Update `frontend/.env` with `EXPO_PUBLIC_BACKEND_URL=https://your-backend-url.com`

---

## iOS App Store Submission

### 1. Configure iOS Build
- [ ] Verify `frontend/eas.json` production profile
- [ ] Verify `frontend/app.json` iOS settings:
  - `bundleIdentifier`
  - `buildNumber`
  - `infoPlist` permissions
  - `config.usesNonExemptEncryption: false`

### 2. Build iOS App
```bash
cd frontend
eas build --platform ios --profile production
```
- [ ] Wait for build to complete (~15-30 minutes)
- [ ] Download IPA file when ready
- [ ] Or submit directly to App Store Connect (if configured in eas.json)

### 3. App Store Connect Setup
- [ ] Log in to https://appstoreconnect.apple.com/
- [ ] Select your app
- [ ] Fill out App Information:
  - Name: "Optical Rx Now"
  - Subtitle: "Manage Your Prescriptions"
  - Privacy Policy URL: `https://opticalrxnow.com/privacy`
  - Category: Medical
  - Content Rights: Check age rating
- [ ] Upload screenshots (required sizes):
  - 6.7" Display (iPhone 14 Pro Max): 1290 x 2796
  - 6.5" Display (iPhone 11 Pro Max): 1242 x 2688
  - iPad Pro 12.9" (2nd/3rd gen): 2048 x 2732
- [ ] Write app description (use `README.md` as reference)
- [ ] Add keywords (max 100 characters)
- [ ] Upload app preview video (optional but recommended)
- [ ] Set pricing (Free)
- [ ] Enable In-App Purchases (if applicable)

### 4. TestFlight Testing (Recommended)
- [ ] Build should auto-appear in TestFlight section
- [ ] Add internal testers (up to 100)
- [ ] Add external testers (up to 10,000)
- [ ] Distribute build to testers
- [ ] Collect feedback and fix issues
- [ ] Build new version if needed: `eas build --platform ios --profile production`

### 5. Submit for Review
- [ ] Complete all required fields in App Store Connect
- [ ] Add version release notes
- [ ] Submit for review
- [ ] Respond to any reviewer questions promptly
- [ ] Monitor status in App Store Connect

### 6. Post-Submission
- [ ] Wait for approval (typically 1-3 days)
- [ ] Manually release or auto-release when approved
- [ ] Monitor crash reports in App Store Connect
- [ ] Respond to user reviews

---

## Google Play Store Submission

### 1. Configure Android Build
- [ ] Verify `frontend/eas.json` production profile
- [ ] Verify `frontend/app.json` Android settings:
  - `package`
  - `versionCode`
  - `permissions`

### 2. Build Android App
```bash
cd frontend
eas build --platform android --profile production
```
- [ ] Wait for build to complete (~15-30 minutes)
- [ ] Download AAB (Android App Bundle) file

### 3. Google Play Console Setup
- [ ] Log in to https://play.google.com/console/
- [ ] Select your app
- [ ] Complete Store Presence:
  - **App Details:**
    - App name: "Optical Rx Now"
    - Short description: Max 80 characters
    - Full description: Max 4000 characters
  - **Graphics:**
    - App icon: 512 x 512 PNG
    - Feature graphic: 1024 x 500 PNG
    - Phone screenshots: Min 2, max 8 (JPEG/PNG)
    - 7-inch tablet screenshots: Min 2, max 8
    - 10-inch tablet screenshots: Min 2, max 8
  - **Categorization:**
    - App category: Medical
    - Tags: prescription, eyeglasses, contacts
  - **Contact details:**
    - Email, website, privacy policy URL
  - **Privacy Policy:**
    - URL: `https://opticalrxnow.com/privacy`

### 4. Content Rating
- [ ] Complete content rating questionnaire
- [ ] Typical selections for this app:
  - No violence, sexual content, or profanity
  - No user-generated content
  - No social features
  - Medical/health app
- [ ] Receive rating (typically Everyone or Teen)

### 5. App Content
- [ ] Privacy Policy: Provide URL
- [ ] Data Safety:
  - Select "Yes" for data collection
  - Specify: Device IDs, app usage analytics
  - Purpose: Analytics, Advertising
  - Note: No personal or health data collected
- [ ] Government Access: Complete if applicable
- [ ] Target Audience: All ages
- [ ] News Apps: No
- [ ] COVID-19 Contact Tracing: No
- [ ] Data Deletion: Provide instructions
- [ ] Ads: Yes, we use AdMob

### 6. Internal Testing Track (Recommended)
- [ ] Create Internal Testing release
- [ ] Upload AAB file
- [ ] Add testers (up to 100 email addresses)
- [ ] Share testing link
- [ ] Collect feedback
- [ ] Fix issues and rebuild if needed

### 7. Production Release
- [ ] Go to Production release
- [ ] Upload AAB file (if not promoted from testing)
- [ ] Add release notes (What's new)
- [ ] Set release type:
  - Managed: You control release timing
  - Immediate: Goes live immediately after approval
- [ ] Review and roll out to production
- [ ] Select rollout percentage (optional):
  - Start with 5-10% for staged rollout
  - Increase gradually: 25%, 50%, 100%

### 8. Submit for Review
- [ ] Complete all required sections (Console will show what's missing)
- [ ] Submit app for review
- [ ] Wait for approval (typically 1-7 days, can be faster)
- [ ] Monitor review status

### 9. Post-Submission
- [ ] Release app when approved
- [ ] Monitor crashes in Play Console
- [ ] Respond to user reviews
- [ ] Track metrics: installs, retention, ratings

---

## Post-Launch Checklist

### Monitoring
- [ ] Set up alerts for backend errors (Railway/Render/Fly.io)
- [ ] Monitor MongoDB usage and costs
- [ ] Check crash reports daily (first week)
- [ ] Monitor AdMob revenue and fill rate
- [ ] Track app store ratings and reviews

### Updates
- [ ] Plan regular updates (bug fixes, features)
- [ ] Update privacy policy if data practices change
- [ ] Maintain changelog in app store listings
- [ ] Communicate with users via release notes

### Marketing
- [ ] Share on social media
- [ ] Create landing page at opticalrxnow.com
- [ ] Submit to app review sites
- [ ] Collect user testimonials
- [ ] Build email list for updates

### Legal
- [ ] Ensure privacy policy is accessible at URL
- [ ] Keep compliance docs updated
- [ ] Monitor GDPR/CCPA requirements
- [ ] Respond to data deletion requests within required timeframes

---

## Quick Reference Commands

### EAS Build Commands
```bash
# iOS Development Build
eas build --platform ios --profile development

# iOS Production Build
eas build --platform ios --profile production

# Android Development Build
eas build --platform android --profile development

# Android Production Build
eas build --platform android --profile production

# Build both platforms simultaneously
eas build --platform all --profile production

# Submit iOS to App Store
eas submit --platform ios --profile production

# Submit Android to Play Store
eas submit --platform android --profile production
```

### Backend Deployment
```bash
# Railway
railway up

# Fly.io
fly deploy

# Render
# Push to GitHub, auto-deploys
```

### Local Testing
```bash
# Run backend locally
cd backend
uvicorn server:app --reload

# Run frontend locally
cd frontend
npm start
```

---

## Troubleshooting

### Build Failures
- Check `eas.json` syntax
- Verify bundle identifiers match everywhere
- Ensure all assets exist at specified paths
- Check EAS build logs for specific errors

### Rejection Reasons (iOS)
- Missing privacy policy
- Incorrect usage descriptions
- Crashes on launch
- Missing required features
- Guideline violations
- Update accordingly and resubmit

### Rejection Reasons (Android)
- Privacy policy issues
- Data safety disclosures incomplete
- Crashes on specific devices
- Missing permissions explanations
- Resubmit with fixes

### AdMob Issues
- App not showing ads: Wait 24-48 hours after app launch
- Test ads showing: Ensure production AdMob IDs are used
- Low fill rate: Normal initially, improves over time
- Account suspended: Follow AdMob policies strictly

---

## Resources

- [Expo Application Services (EAS) Docs](https://docs.expo.dev/eas/)
- [App Store Connect Help](https://developer.apple.com/app-store-connect/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
- [AdMob Setup Guide](https://admob.google.com/home/get-started/)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Railway Docs](https://docs.railway.app/)
- [Render Docs](https://render.com/docs)
- [Fly.io Docs](https://fly.io/docs/)

---

**🎉 Congratulations on submitting your app! This is a significant achievement.**

Remember: The first submission takes the longest. Updates and iterations will be much faster. Keep iterating based on user feedback!
