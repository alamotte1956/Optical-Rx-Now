# Complete App Store Submission Guide for Optical Rx Now

This is your complete step-by-step guide to submit **Optical Rx Now** to both the Apple App Store and Google Play Store.

---

## 📋 TABLE OF CONTENTS
1. [Prerequisites](#prerequisites)
2. [Building Your App](#building-your-app)
3. [iOS App Store Submission](#ios-app-store-submission)
4. [Google Play Store Submission](#google-play-store-submission)
5. [Post-Submission](#post-submission)

---

## PREREQUISITES

### Required Accounts
- ✅ **Apple Developer Account** ($99/year) - [developer.apple.com](https://developer.apple.com)
- ✅ **Google Play Developer Account** ($25 one-time) - [play.google.com/console](https://play.google.com/console)
- ✅ **Expo Account** (Free) - You already have this with EAS configured

### Required Assets
Before you begin, prepare these assets:

#### App Icon
- **1024x1024 PNG** with no transparency
- Should match your current icon in `assets/images/icon.png`

#### Screenshots (You'll need to generate these)
**For iOS:**
- iPhone 6.7" (1290 x 2796 pixels) - iPhone 14 Pro Max size
- iPhone 6.5" (1242 x 2688 pixels) - iPhone 11 Pro Max size
- iPad Pro 12.9" (2048 x 2732 pixels) - if supporting iPad

**For Android:**
- Phone: 16:9 aspect ratio (minimum 320px wide)
- 7-inch tablet: 16:9 aspect ratio
- 10-inch tablet: 16:9 aspect ratio

**How to capture screenshots:**
1. Install your app on a device or simulator
2. Navigate through key screens: Home, Add Prescription, Prescription List, Prescription Detail
3. Use device screenshot feature (Volume Down + Power on most devices)
4. You need 2-8 screenshots per device size

#### App Description
Use this template and customize:

```
Optical Rx Now - Never Lose Your Prescription Again

Keep your family's eyeglass and contact lens prescriptions organized and accessible anytime, anywhere.

KEY FEATURES:
• 📸 Capture prescription photos with your camera
• 👨‍👩‍👧‍👦 Organize prescriptions by family member
• 🔒 100% private - all data stored locally on your device
• 📤 Share prescriptions easily with optical stores
• 🏪 Find nearby optical retailers
• ⏰ Track prescription dates and expiration

PRIVACY FIRST:
Your prescription data never leaves your device. No cloud storage, no data collection, complete privacy.

PERFECT FOR:
• Families with multiple prescriptions
• Contact lens wearers
• Anyone who needs quick access to prescription information
• Shopping for glasses online or in-store

Download now and keep your optical health information organized!
```

---

## BUILDING YOUR APP

### Step 1: Install EAS CLI (if not already installed)
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```

### Step 3: Configure Your Environment
Create a `.env` file in the `frontend/` directory based on `.env.example`:

```bash
cd frontend
cp .env.example .env
```

Edit `.env` and set:
```
EXPO_PUBLIC_BACKEND_URL=http://localhost:8000
EXPO_PUBLIC_PRIVACY_POLICY_URL=https://opticalrxnow.com/privacy
EXPO_PUBLIC_ADMIN_KEY=your-secure-admin-key-here
```

### Step 4: Build for iOS
```bash
cd frontend
eas build --platform ios --profile production
```

**What happens:**
- EAS will ask you to create credentials (certificates and provisioning profiles)
- Select "Yes" to let Expo manage credentials automatically
- Build will take 10-20 minutes
- You'll get a download link when complete

**After build completes:**
- Download the `.ipa` file or note the build URL
- You'll submit this through App Store Connect

### Step 5: Build for Android
```bash
cd frontend
eas build --platform android --profile production
```

**What happens:**
- EAS will create an Android App Bundle (.aab)
- Build will take 10-20 minutes
- You'll get a download link when complete

**After build completes:**
- Download the `.aab` file
- You'll upload this to Google Play Console

---

## iOS APP STORE SUBMISSION

### Step 1: Create App in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+ (plus icon)** → **New App**
3. Fill out the form:
   - **Platform:** iOS
   - **Name:** Optical Rx Now
   - **Primary Language:** English (U.S.)
   - **Bundle ID:** Select `com.alamotte.opticalrxnow`
   - **SKU:** opticalrxnow (or any unique identifier)
   - **User Access:** Full Access

### Step 2: Fill Out App Information

#### App Information Tab
- **Subtitle** (30 chars max): "Family Prescription Manager"
- **Category:** 
  - Primary: **Medical**
  - Secondary: **Health & Fitness**
- **Privacy Policy URL:** `https://opticalrxnow.com/privacy`

#### Pricing and Availability
- **Price:** Free
- **Availability:** All countries (or select specific countries)

### Step 3: Prepare for Submission

Click on your app version (e.g., 1.0.0):

#### Screenshots and Preview
Upload your screenshots for each device size:
- Drag and drop or click to upload
- Add 2-8 screenshots per device
- Order them with the most important screens first

#### Promotional Text (170 chars max)
```
Keep your family's eyeglass and contact lens prescriptions organized and accessible. 100% private - all data stored locally on your device.
```

#### Description (4000 chars max)
Paste your prepared app description (see Prerequisites section above)

#### Keywords (100 chars max)
```
prescription,eyeglass,contacts,optical,family,health,medical,vision,eye,glasses
```

#### Support URL
```
https://opticalrxnow.com/support
```
(Create this page or use your main site)

#### Marketing URL (Optional)
```
https://opticalrxnow.com
```

### Step 4: App Review Information

- **Sign-in required:** No
- **Contact Information:**
  - First Name: [Your first name]
  - Last Name: [Your last name]
  - Phone Number: [Your phone]
  - Email: [Your email]
- **Notes:**
```
This app stores optical prescription information locally on the user's device. No backend server or data transmission is required for testing. All features work offline.

To test the app:
1. Tap "Add Family Member" to create a profile
2. Tap "Add Prescription" to capture or upload a prescription photo
3. View prescriptions in the list
4. Tap any prescription to view details and share

Privacy: All data is stored locally using AsyncStorage. No network requests are made except for the optional store locator feature.
```

### Step 5: Content Rights and Age Rating

#### Content Rights
- Check: "Yes" for rights to use content

#### Age Rating
Click **Edit** and answer questionnaire:
- **Unrestricted Web Access:** No
- **Medical/Treatment Information:** Yes (select "Infrequent/Mild")
- All other questions: No

Expected rating: **4+**

### Step 6: Upload Build

1. In the **Build** section, click **+ (plus icon)**
2. Select the build you created with EAS
3. If you don't see your build:
   - Wait a few minutes for Apple to process it
   - Make sure you uploaded it using Xcode's Transporter app or EAS submit command

**Alternative: Use EAS Submit**
```bash
eas submit --platform ios
```
This automatically uploads your build to App Store Connect.

### Step 7: Version Information

- **Copyright:** 2026 [Your Name or Company]
- **Version:** 1.0.0
- **Release:** Manual release (you control when it goes live)

### Step 8: Submit for Review

1. Review all information carefully
2. Click **Save**
3. Click **Submit for Review**
4. Confirm submission

**Review Timeline:** Typically 24-48 hours

---

## GOOGLE PLAY STORE SUBMISSION

### Step 1: Create App in Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **All apps** → **Create app**
3. Fill out the form:
   - **App name:** Optical Rx Now
   - **Default language:** English (United States)
   - **App or game:** App
   - **Free or paid:** Free
   - Accept declarations
4. Click **Create app**

### Step 2: Set Up Your App

Google Play Console will guide you through required tasks. Complete each section:

#### Store Settings → App Details

- **App name:** Optical Rx Now
- **Short description** (80 chars max):
```
Family prescription manager. Store eyeglass & contact lens prescriptions privately.
```
- **Full description** (4000 chars max):
Paste your prepared app description

#### Store Settings → Store Listing

**Graphics Assets:**

1. **App icon** (512 x 512 PNG)
   - Upload your 1024x1024 icon (Play Console will resize)

2. **Feature graphic** (1024 x 500 PNG) - REQUIRED
   - Create a banner image with your app name and tagline
   - Use Canva or similar tool if needed
   - Example text: "Optical Rx Now - Family Prescription Manager"

3. **Phone screenshots** (REQUIRED)
   - Upload 2-8 screenshots
   - Minimum 2 required

4. **7-inch tablet screenshots** (Optional but recommended)
5. **10-inch tablet screenshots** (Optional but recommended)

**Categorization:**
- **App category:** Medical
- **Tags:** Health, Medical, Family, Prescription

**Contact details:**
- **Email:** [Your email]
- **Phone:** [Your phone] (optional)
- **Website:** https://opticalrxnow.com

**External marketing:** No (unless you want to allow Google to feature your app)

### Step 3: Content Rating

1. Go to **Policy → App content → Content rating**
2. Click **Start questionnaire**
3. **Email address:** [Your email]
4. **Category:** Select "Utility, Productivity, Communication, or Other"
5. Answer questions:
   - Does your app depict or discuss violence? **No**
   - Does your app contain sexual content? **No**
   - Does your app contain bad language? **No**
   - Does your app depict or facilitate user-generated content? **No**
   - Is this app a social media app? **No**
   - Does your app contain or promote discriminatory content? **No**
   - Does your app allow users to gamble? **No**
   - Does your app provide medical information? **Yes**
     - Is the information provided by qualified medical professionals? **No**
     - (Explain: "App only stores user-provided prescription information")

6. Click **Save** → **Submit**

Expected rating: **Everyone**

### Step 4: Data Safety

1. Go to **Policy → App content → Data safety**
2. Click **Start**
3. **Does your app collect or share any of the required user data types?**
   - Select **No**
   - (All data is stored locally, not collected by you)
4. **Does your app use security practices?**
   - Data is encrypted in transit: **No** (no network transmission)
   - Users can request data deletion: **Yes**
     - Explain: "Users can delete data by uninstalling the app or deleting items within the app"
5. Click **Save** → **Submit**

### Step 5: Government and Legal

1. **Privacy Policy URL:** `https://opticalrxnow.com/privacy`
2. **App access:**
   - "Yes, my app is restricted" → **No**
3. **Ads:** No
4. **Target audience:**
   - Select **13 years and older** (or **All ages** if appropriate)
5. **News app:** No
6. **Data safety form:** Already completed
7. **Health data:** No (you're not collecting health data)
8. **Data deletion:** User can delete data within app or by uninstalling

### Step 6: Select Testers (Internal Testing Track)

**RECOMMENDED: Start with Internal Testing**

1. Go to **Testing → Internal testing**
2. Click **Create new release**
3. Upload your `.aab` file from EAS build
4. **Release name:** 1.0.0
5. **Release notes:**
```
Initial release of Optical Rx Now
- Store family prescriptions
- Capture prescription photos
- Organize by family member
- Find nearby optical stores
```
6. Add email addresses of testers (can be just yourself)
7. Click **Save** → **Review release** → **Start rollout to Internal testing**

**Test internally for a few days, then move to Production**

### Step 7: Production Release

1. Go to **Testing → Production**
2. Click **Create new release**
3. **Upload from library** → Select your tested build
4. **Release name:** 1.0.0
5. **Release notes:**
```
Initial release
- Store and organize optical prescriptions
- Capture prescription photos
- Family member management
- Find nearby optical stores
- 100% private - all data stored locally
```
6. **Rollout percentage:** 100% (or start with smaller % for staged rollout)
7. Click **Save** → **Review release** → **Start rollout to Production**

**Review Timeline:** Can be a few hours to a few days, usually faster than iOS

---

## POST-SUBMISSION

### Monitor Your Submissions

#### iOS App Store
- Check status in App Store Connect
- Respond to any messages from App Review
- Common statuses:
  - **Waiting for Review** - In queue
  - **In Review** - Being reviewed
  - **Pending Developer Release** - Approved, waiting for you to release
  - **Ready for Sale** - Live on App Store

#### Google Play Store
- Check status in Play Console
- Review goes through automated and manual checks
- Common statuses:
  - **In review** - Being reviewed
  - **Pending publication** - Approved
  - **Published** - Live on Play Store

### Common Rejection Reasons and Fixes

#### iOS Rejections:

**1. "App doesn't work as expected"**
- **Fix:** Ensure clear test instructions in App Review notes
- Add demo content if needed

**2. "Privacy policy missing or incorrect"**
- **Fix:** Verify https://opticalrxnow.com/privacy is accessible

**3. "Permission usage unclear"**
- **Fix:** Already configured correctly in your app.json

**4. "Missing iPad screenshots"**
- **Fix:** Either add iPad screenshots or disable iPad support

#### Android Rejections:

**1. "Incomplete Data Safety form"**
- **Fix:** Ensure you answered all questions accurately

**2. "Privacy policy not accessible"**
- **Fix:** Verify https://opticalrxnow.com/privacy works

**3. "Inappropriate content rating"**
- **Fix:** Review content rating questionnaire

### After Approval

#### iOS:
- If set to manual release, click **Release this version**
- App will be live within a few hours
- Share your App Store link: `https://apps.apple.com/app/optical-rx-now/[APP_ID]`

#### Android:
- App goes live automatically (unless you chose staged rollout)
- Share your Play Store link: `https://play.google.com/store/apps/details?id=com.alamotte.opticalrxnow`

### Marketing Your App

1. **Create a landing page** at opticalrxnow.com with:
   - App description
   - Screenshots
   - Download links for both stores
   - Privacy policy link

2. **Share on social media:**
   - Twitter, Facebook, LinkedIn
   - Health and family-oriented communities
   - Reddit (r/health, r/productivity)

3. **App Store Optimization (ASO):**
   - Monitor keyword rankings
   - Respond to user reviews
   - Update screenshots based on user feedback

4. **Gather feedback:**
   - Ask early users for reviews
   - Monitor crash reports and user feedback
   - Plan updates based on user needs

---

## USEFUL COMMANDS

### Build Commands
```bash
# Build for iOS production
cd frontend
eas build --platform ios --profile production

# Build for Android production
eas build --platform android --profile production

# Build for both platforms
eas build --platform all --profile production

# Check build status
eas build:list

# Submit to App Store
eas submit --platform ios

# Submit to Play Store
eas submit --platform android
```

### Testing Commands
```bash
# Build for iOS preview (TestFlight)
eas build --platform ios --profile preview

# Build for Android preview (Internal Testing)
eas build --platform android --profile preview
```

---

## SUPPORT RESOURCES

- **Expo Documentation:** https://docs.expo.dev
- **EAS Build:** https://docs.expo.dev/build/introduction/
- **EAS Submit:** https://docs.expo.dev/submit/introduction/
- **App Store Review Guidelines:** https://developer.apple.com/app-store/review/guidelines/
- **Play Store Policies:** https://play.google.com/about/developer-content-policy/
- **Apple Developer Support:** https://developer.apple.com/support/
- **Google Play Support:** https://support.google.com/googleplay/android-developer

---

## CHECKLIST

Use this checklist to track your progress:

### Pre-Build
- [ ] Apple Developer account created and active
- [ ] Google Play Developer account created and active
- [ ] All screenshots captured and ready
- [ ] App description written
- [ ] Privacy policy accessible at https://opticalrxnow.com/privacy
- [ ] Support/marketing website ready

### iOS Submission
- [ ] iOS build created with EAS
- [ ] App created in App Store Connect
- [ ] App information filled out
- [ ] Screenshots uploaded
- [ ] Build uploaded and selected
- [ ] App submitted for review
- [ ] App approved
- [ ] App released to App Store

### Android Submission
- [ ] Android build created with EAS
- [ ] App created in Google Play Console
- [ ] Store listing completed
- [ ] Content rating completed
- [ ] Data safety completed
- [ ] Build uploaded to Internal Testing
- [ ] Internal testing completed
- [ ] Build promoted to Production
- [ ] App approved
- [ ] App live on Play Store

---

**Good luck with your submission! 🚀**

If you encounter any issues, check the EAS build logs and app store review feedback for specific guidance.