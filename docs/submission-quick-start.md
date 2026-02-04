# App Store Submission Quick Start Guide

A simple, step-by-step guide to submitting Optical Rx Now to Apple App Store and Google Play Store.

---

## Overview

This guide will walk you through the entire submission process for both iOS and Android platforms. Follow the steps in order for the smoothest experience.

**Expected Timeline:**
- **Preparation:** 1-2 weeks
- **Apple Review:** 1-3 days (typically 24 hours)
- **Google Review:** 1-7 days (typically 3 days)

---

## Pre-Submission Checklist

Before you start the submission process, ensure you have:

### Required Items
- [ ] Apple Developer Account ($99/year) - https://developer.apple.com
- [ ] Google Play Developer Account ($25 one-time) - https://play.google.com/console
- [ ] App built and tested on physical devices
- [ ] Screenshots created (see [Screenshot Guide](screenshot-guide.md))
- [ ] App icon (1024x1024 for iOS, 512x512 for Android)
- [ ] Privacy policy active at https://opticalrxnow.com/privacy
- [ ] Support email active: support@opticalrxnow.com
- [ ] All testing completed (see [Testing Checklist](final-testing-checklist.md))

### Helpful Documents
- [App Store Description](app-store-description.md) - Copy-paste content ready
- [App Review Notes](app-review-notes.md) - Information for reviewers
- [Screenshot Guide](screenshot-guide.md) - How to create screenshots
- [Testing Checklist](final-testing-checklist.md) - Pre-submission testing

---

## iOS Submission (Apple App Store)

### Step 1: Prepare Your Build

1. **Build the app for production**
   ```bash
   cd frontend
   eas build --platform ios --profile production
   ```

2. **Wait for build to complete** (usually 15-30 minutes)
   - EAS will send you a notification when done
   - Download the IPA file or use EAS Submit

3. **Test the production build on a real device**
   - Install via TestFlight or direct download
   - Complete critical testing
   - Ensure no crashes or major bugs

### Step 2: Set Up App Store Connect

1. **Log in to App Store Connect**
   - Go to https://appstoreconnect.apple.com
   - Sign in with your Apple Developer account

2. **Create a new app**
   - Click "My Apps" → "+" → "New App"
   - **Platform:** iOS
   - **Name:** Optical Rx Now
   - **Primary Language:** English (U.S.)
   - **Bundle ID:** Select your app's bundle ID
   - **SKU:** opticalrxnow (or similar unique identifier)
   - **User Access:** Full Access

3. **Upload build**
   - Use `eas submit --platform ios` OR
   - Use Xcode → Window → Organizer → Upload
   - Wait for processing (10-30 minutes)

### Step 3: Complete App Information

**App Information (General):**
- **Name:** Optical Rx Now
- **Subtitle:** Family Prescription Manager
- **Category:** Medical (Primary), Health & Fitness (Secondary)
- **Privacy Policy URL:** https://opticalrxnow.com/privacy
- **Support URL:** https://opticalrxnow.com
- **Marketing URL:** https://opticalrxnow.com (optional)

**Pricing and Availability:**
- **Price:** Free
- **Availability:** All countries

**Age Rating:**
- Complete the questionnaire
- Select: Medical/Treatment Information → Infrequent/Mild
- Result should be: 17+

### Step 4: Prepare Version Information

**Version 1.0.0:**

1. **Screenshots**
   - Upload screenshots for 6.7" display (required)
   - Upload screenshots for 5.5" display (optional)
   - Upload iPad screenshots if supporting iPad
   - See [Screenshot Guide](screenshot-guide.md)

2. **Promotional Text** (170 characters, optional but recommended)
   ```
   Keep your family's eyeglass and contact lens prescriptions organized and accessible. 100% private - all data stored locally on your device.
   ```

3. **Description** (4000 characters max)
   - Copy from [App Store Description](app-store-description.md)
   - The full description provided in that document

4. **Keywords** (100 characters)
   ```
   prescription,eyeglasses,contacts,optical,health,medical,vision,eye,glasses,family
   ```

5. **Support URL:** https://opticalrxnow.com

6. **Marketing URL:** https://opticalrxnow.com (optional)

### Step 5: Complete App Privacy

**Privacy Nutrition Labels:**

1. **Data Collection**
   - Select "No, we do not collect data from this app"
   - This is accurate - all data is local only

2. **Privacy Policy**
   - URL: https://opticalrxnow.com/privacy

### Step 6: App Review Information

**Contact Information:**
- **First Name:** [Your First Name]
- **Last Name:** [Your Last Name]
- **Phone Number:** [Your Phone Number]
- **Email:** support@opticalrxnow.com

**Notes:**
Copy the detailed notes from [App Review Notes](app-review-notes.md), including:
- Age verification instructions
- Key features to test
- Privacy explanation
- Permissions usage

**Sign-in Information:**
- Not required (no login needed)

**Attachments:**
- None required

### Step 7: Submit for Review

1. **Select the build** you uploaded
2. **Review all information** for accuracy
3. **Export Compliance:**
   - "Does your app use encryption?" → No (or select appropriate option)
4. **Advertising Identifier:**
   - "Does this app use the Advertising Identifier?" → No
5. Click **"Add for Review"**
6. Click **"Submit to App Review"**

---

## Android Submission (Google Play Store)

### Step 1: Prepare Your Build

1. **Build the app for production**
   ```bash
   cd frontend
   eas build --platform android --profile production
   ```

2. **Wait for build to complete** (usually 15-30 minutes)
   - EAS will send you a notification when done
   - Download the AAB file

3. **Test the production build**
   - Install on a real Android device
   - Complete critical testing
   - Ensure no crashes or major bugs

### Step 2: Set Up Google Play Console

1. **Log in to Google Play Console**
   - Go to https://play.google.com/console
   - Sign in with your Google account

2. **Create a new app**
   - Click "Create app"
   - **App name:** Optical Rx Now
   - **Default language:** English (United States)
   - **App or game:** App
   - **Free or paid:** Free
   - Accept declarations
   - Click "Create app"

### Step 3: Complete Store Listing

**Main store listing:**

1. **App name:** Optical Rx Now

2. **Short description** (80 characters)
   ```
   Family prescription manager. Store eyeglass & contact lens prescriptions privately.
   ```

3. **Full description** (4000 characters max)
   - Copy from [App Store Description](app-store-description.md)
   - The full description provided in that document

4. **App icon**
   - Upload 512x512 PNG
   - High-resolution icon

5. **Feature graphic**
   - 1024 x 500 pixels
   - Optional but recommended

6. **Phone screenshots**
   - Upload 2-8 screenshots
   - See [Screenshot Guide](screenshot-guide.md)

7. **Tablet screenshots** (if applicable)
   - Upload if supporting tablets

8. **App category**
   - **Category:** Medical
   - **Tags:** Health, Prescription, Vision, Optical, Family

9. **Contact details**
   - **Email:** support@opticalrxnow.com
   - **Phone:** Optional
   - **Website:** https://opticalrxnow.com

10. **Privacy policy**
    - **URL:** https://opticalrxnow.com/privacy

### Step 4: Complete Data Safety Section

**Data Safety:**

1. **Data collection and security**
   - "Does your app collect or share any of the required user data types?" → **No**
   - "Is all of the user data collected by your app encrypted in transit?" → **Yes**
   - "Do you provide a way for users to request that their data is deleted?" → **Yes** (uninstall app)

2. **Review and submit**
   - Review your answers
   - Submit data safety section

### Step 5: Select Target Audience and Content

**Target audience:**
- Select "18 and over"
- App requires age verification

**Content rating:**
1. Complete the questionnaire
2. Select relevant categories:
   - Medical reference
   - No inappropriate content
3. Submit for rating
4. Should receive rating suitable for teens/adults

**News app:**
- This is not a news app

### Step 6: Set Up App Access

**App access:**
- "Do you have any special access features?" → **No**
- "Does your app contain ads?" → **No**

### Step 7: Upload Your App

1. **Go to "Production" in left sidebar**
2. **Create new release**
3. **Upload the AAB file**
4. **Release name:** 1.0.0 (or your version number)
5. **Release notes** (What's new):
   ```
   Initial release of Optical Rx Now
   
   • Store eyeglass and contact lens prescriptions
   • Organize by family member
   • 100% private - all data stored locally
   • Share prescriptions easily
   • Find nearby optical stores
   ```

### Step 8: Review and Rollout

1. **Review release**
   - Check all information is correct
   - Review warnings (address critical ones)

2. **Save and review**
   - Click "Save"
   - Click "Review release"

3. **Start rollout to production**
   - Click "Start rollout to Production"
   - Confirm rollout

---

## After Submission

### Apple App Store
- **Review starts:** Usually within 24 hours
- **Review duration:** 1-3 days typically
- **Status updates:** Check App Store Connect
- **Communication:** Respond quickly to any reviewer questions
- **Rejection:** Address issues and resubmit

### Google Play Store
- **Review starts:** Usually within a few hours
- **Review duration:** 1-7 days typically
- **Status updates:** Check Google Play Console
- **Communication:** Respond to any policy violations
- **Rejection:** Address issues and resubmit

### Monitor Support
- **Check support@opticalrxnow.com daily**
- Respond to user questions within 48 hours
- Monitor reviews once app is live
- Be prepared for update requests

---

## Common Mistakes to Avoid

### iOS
- ❌ Missing Privacy Manifest (PrivacyInfo.xcprivacy)
- ❌ Incorrect age rating
- ❌ Screenshots wrong dimensions
- ❌ Privacy policy link broken
- ❌ Not testing production build before submission
- ❌ Incomplete App Review Notes

### Android
- ❌ Data Safety form incomplete
- ❌ Target SDK not set to required level
- ❌ Privacy policy link missing
- ❌ Incorrect content rating
- ❌ Screenshots not high quality
- ❌ Short description over 80 characters

### Both Platforms
- ❌ App crashes on launch
- ❌ Permissions not working
- ❌ Age verification not working
- ❌ Support email not monitored
- ❌ Incomplete testing
- ❌ Misleading description or screenshots

---

## What to Expect During Review

### Apple Review Process
1. **Waiting for Review** - In queue (can take 1-2 days)
2. **In Review** - Actively being reviewed (1-24 hours)
3. **Pending Developer Release** or **Ready for Sale** - Approved!
4. **Rejected** - Issues found, need to fix and resubmit

### Google Review Process
1. **Pending Publication** - In queue
2. **Under Review** - Being reviewed
3. **Published** - Live on Play Store!
4. **Rejected** - Policy violations, need to fix

### Common Review Questions
- **Age verification:** How does it work?
- **Privacy:** How is data stored?
- **Permissions:** Why are they needed?
- **Medical info:** What disclaimers are shown?

**Be prepared to:**
- Respond within 24 hours
- Provide screenshots or videos
- Clarify privacy practices
- Fix bugs quickly

---

## Timeline Expectations

### From Submission to Live

**Best Case:**
- iOS: 1-2 days
- Android: 1-3 days

**Typical:**
- iOS: 2-3 days
- Android: 3-5 days

**With Issues:**
- iOS: 1-2 weeks (if rejected, fixed, resubmitted)
- Android: 1-2 weeks (if rejected, fixed, resubmitted)

### What Affects Timeline
- **Time of submission** (weekends/holidays slower)
- **App complexity** (medical apps get extra scrutiny)
- **First submission** (stricter review for new apps)
- **Quality of submission** (complete info = faster review)

---

## Getting Help

### Resources
- [Testing Checklist](final-testing-checklist.md)
- [Screenshot Guide](screenshot-guide.md)
- [App Review Notes](app-review-notes.md)
- [Support Email Template](support-email-template.md)

### Official Documentation
- **Apple:** https://developer.apple.com/app-store/review/guidelines/
- **Google:** https://support.google.com/googleplay/android-developer/

### Support
- **Email:** support@opticalrxnow.com
- **Website:** https://opticalrxnow.com
- **Privacy Policy:** https://opticalrxnow.com/privacy

---

## Checklist Summary

Before submitting:
- [ ] Testing complete ([Testing Checklist](final-testing-checklist.md))
- [ ] Screenshots created ([Screenshot Guide](screenshot-guide.md))
- [ ] Store descriptions ready ([App Store Description](app-store-description.md))
- [ ] Review notes prepared ([App Review Notes](app-review-notes.md))
- [ ] Privacy policy live at https://opticalrxnow.com/privacy
- [ ] Support email active: support@opticalrxnow.com
- [ ] Production builds tested on real devices
- [ ] Developer accounts active (Apple & Google)

---

## Success Tips

1. **Be thorough** - Complete testing prevents rejections
2. **Be honest** - Accurate descriptions and privacy info
3. **Be responsive** - Answer reviewer questions quickly
4. **Be patient** - Reviews take time, don't rush
5. **Be prepared** - Have support infrastructure ready

Good luck with your submission! 🎉

If you run into issues, refer to the detailed guides or reach out to support@opticalrxnow.com
