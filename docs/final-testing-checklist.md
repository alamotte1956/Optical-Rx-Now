# Final Testing Checklist

Complete this checklist before submitting to App Store and Google Play Store.

---

## iOS Testing

### Initial Launch & Splash Screen
- [ ] App launches without crashes
- [ ] Splash screen displays correctly
- [ ] Age verification screen appears on first launch
- [ ] "Yes, I'm 18+" button works
- [ ] Age verification persists (doesn't show again on second launch)
- [ ] App transitions smoothly after age verification

### Permissions
- [ ] Camera permission requested when taking photo
- [ ] Camera permission denial handled gracefully
- [ ] Photo library permission requested when selecting photo
- [ ] Photo library permission denial handled gracefully
- [ ] Location permission requested for Store Finder (optional)
- [ ] Location permission denial doesn't break Store Finder
- [ ] Permission prompts have clear, descriptive messages

### Core Functionality
**Family Members:**
- [ ] Can add family member
- [ ] Can edit family member details
- [ ] Can delete family member
- [ ] Deleting family member prompts confirmation
- [ ] Can view list of family members

**Prescriptions:**
- [ ] Can add eyeglass prescription
- [ ] Can add contact lens prescription
- [ ] Can add prescription with photo (camera)
- [ ] Can add prescription with photo (photo library)
- [ ] Can add prescription without photo
- [ ] Can view prescription details
- [ ] Can edit prescription
- [ ] Can delete prescription
- [ ] Prescription dates display correctly

**Sharing:**
- [ ] Share button works
- [ ] Can share prescription via email
- [ ] Can share prescription via messaging
- [ ] Share sheet displays correctly
- [ ] Shared content includes prescription details

**Store Finder:**
- [ ] Store finder map loads (with internet)
- [ ] Current location shown (if permission granted)
- [ ] Nearby stores displayed
- [ ] Can tap on store for details
- [ ] Manual search by city/zip works

### Data Persistence
- [ ] Added family members persist after app restart
- [ ] Added prescriptions persist after app restart
- [ ] Prescription photos persist after app restart
- [ ] Age verification persists after app restart
- [ ] No data loss on app backgrounding

### Privacy & Security
- [ ] No network requests for local data operations
- [ ] Prescription photos encrypted
- [ ] No analytics or tracking calls
- [ ] Privacy policy link works
- [ ] Data isolated to app sandbox

### UI/UX
- [ ] All text is readable and correctly sized
- [ ] Navigation works intuitively
- [ ] Back button works on all screens
- [ ] Forms validate input correctly
- [ ] Error messages are clear and helpful
- [ ] Empty states show helpful prompts
- [ ] Loading states display when needed
- [ ] Keyboard doesn't obscure input fields
- [ ] Safe area insets respected (notch, home indicator)

### iOS Specific
- [ ] Status bar displays correctly
- [ ] App works on iOS 15.1+
- [ ] Dark mode supported (if applicable)
- [ ] Landscape orientation handled (if applicable)
- [ ] iPad layout correct (if supporting iPad)
- [ ] No usage of private APIs
- [ ] App uses PrivacyInfo.xcprivacy correctly

---

## Android Testing

### Initial Launch & Splash Screen
- [ ] App launches without crashes
- [ ] Splash screen displays correctly
- [ ] Age verification screen appears on first launch
- [ ] "Yes, I'm 18+" button works
- [ ] Age verification persists
- [ ] App transitions smoothly after age verification

### Permissions
- [ ] Camera permission requested when taking photo
- [ ] Camera permission denial handled gracefully
- [ ] Storage/Photo picker permission works
- [ ] Location permission requested for Store Finder
- [ ] Location permission denial doesn't break Store Finder
- [ ] Android 13+ photo picker works correctly

### Core Functionality
(Same as iOS section above)
- [ ] Family member CRUD operations work
- [ ] Prescription CRUD operations work
- [ ] Photo capture and selection work
- [ ] Sharing works
- [ ] Store finder works

### Data Persistence
- [ ] Data persists after app restart
- [ ] Data persists after device restart
- [ ] No data loss on app backgrounding
- [ ] No data loss when app is killed by system

### Privacy & Security
- [ ] No network requests for local data operations
- [ ] Data Safety form matches actual behavior
- [ ] No analytics or tracking
- [ ] Data stored in app-specific storage

### UI/UX
- [ ] Material Design guidelines followed
- [ ] Navigation works with back button (hardware/software)
- [ ] Forms validate input correctly
- [ ] Error messages clear and helpful
- [ ] Empty states helpful
- [ ] Keyboard doesn't obscure inputs
- [ ] System navigation gestures work

### Android Specific
- [ ] BackHandler works correctly (navigates back or exits)
- [ ] App works on Android 7.0+ (API 24+)
- [ ] App targets Android 14 (API 34)
- [ ] Photo picker (Android 13+) works
- [ ] Legacy photo selection works (Android 7-12)
- [ ] App handles different screen sizes
- [ ] App handles different screen densities
- [ ] No battery drain or performance issues

---

## Cross-Platform Testing

### Offline Mode
- [ ] App works without internet connection
- [ ] Can add/view/edit/delete data offline
- [ ] Store finder shows appropriate message when offline
- [ ] No crashes or errors when offline

### Performance
- [ ] App launches in < 3 seconds
- [ ] Navigation is smooth (no lag)
- [ ] Photo loading is fast
- [ ] No memory leaks
- [ ] No excessive battery usage
- [ ] Scrolling is smooth with many items

### Edge Cases
- [ ] Works with very long names (family members)
- [ ] Works with many family members (20+)
- [ ] Works with many prescriptions per person (10+)
- [ ] Works with large prescription photos
- [ ] Handles low storage gracefully
- [ ] Handles interrupted operations (phone call, etc.)

### Accessibility
- [ ] Screen reader compatible (VoiceOver/TalkBack)
- [ ] Text scales correctly with system font size
- [ ] Color contrast meets WCAG standards
- [ ] Touch targets are adequate size (44x44pt minimum)
- [ ] Accessibility labels present

### Internationalization (If Applicable)
- [ ] Dates formatted correctly for locale
- [ ] Numbers formatted correctly for locale
- [ ] Text doesn't overflow with longer translations
- [ ] RTL languages supported (if applicable)

---

## Build Verification

### iOS Build (Xcode)
- [ ] No build warnings
- [ ] No deprecation warnings
- [ ] Deployment target set to iOS 15.1
- [ ] Bundle identifier correct
- [ ] Version number correct (e.g., 1.0.0)
- [ ] Build number correct
- [ ] App icon present (1024x1024)
- [ ] Launch screen configured
- [ ] PrivacyInfo.xcprivacy included in bundle
- [ ] Required device capabilities set
- [ ] Entitlements correct
- [ ] Provisioning profile valid
- [ ] Archive succeeds
- [ ] Build size reasonable (< 100 MB)

### Android Build (EAS/Gradle)
- [ ] No build warnings
- [ ] Target SDK is 34
- [ ] Minimum SDK is 24
- [ ] Version code correct
- [ ] Version name correct (e.g., 1.0.0)
- [ ] App icon present (adaptive icon)
- [ ] Splash screen configured
- [ ] Package name correct
- [ ] Signing configured correctly
- [ ] ProGuard/R8 rules correct (if using)
- [ ] Build succeeds
- [ ] AAB/APK generated successfully
- [ ] Build size reasonable (< 100 MB)

---

## App Store Readiness

### Metadata Complete
- [ ] App name finalized
- [ ] Short description written
- [ ] Full description written
- [ ] Keywords selected (iOS)
- [ ] Tags selected (Android)
- [ ] Screenshots created (all required sizes)
- [ ] App icon ready (1024x1024 for iOS, 512x512 for Android)
- [ ] Privacy policy URL active and correct
- [ ] Support URL active and correct
- [ ] Support email active and monitored
- [ ] Category selected
- [ ] Age rating determined

### Store Requirements
**iOS App Store:**
- [ ] Apple Developer account active
- [ ] App Store Connect record created
- [ ] Privacy Nutrition Labels completed
- [ ] App privacy questions answered
- [ ] Export compliance answered
- [ ] Content rights documentation ready
- [ ] App Review Information completed
- [ ] Age rating questionnaire completed
- [ ] Pricing and availability set

**Google Play Store:**
- [ ] Google Play Console account active
- [ ] App created in Console
- [ ] Data Safety section completed
- [ ] Content rating questionnaire completed
- [ ] Target audience selected (18+)
- [ ] Store listing complete
- [ ] Pricing and distribution set
- [ ] App content information provided

---

## Pre-Submission Final Checks

### Code Quality
- [ ] No debug code or console.logs in production
- [ ] No hardcoded credentials or API keys
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] Network error handling implemented
- [ ] Code follows platform best practices

### Legal & Compliance
- [ ] Privacy policy reviewed and accurate
- [ ] Terms of service ready (if applicable)
- [ ] Age verification working (18+)
- [ ] Medical disclaimer included
- [ ] COPPA compliant
- [ ] GDPR compliant (if applicable)
- [ ] CCPA compliant (if applicable)

### Security
- [ ] No sensitive data in logs
- [ ] Prescription photos encrypted
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] Dependencies up to date
- [ ] No known security vulnerabilities

### User Experience
- [ ] Onboarding flow tested
- [ ] Happy path tested
- [ ] Error paths tested
- [ ] All user-facing text reviewed for typos
- [ ] Consistent terminology throughout app
- [ ] Help/support easily accessible

### Testing on Physical Devices
- [ ] Tested on physical iPhone (iOS 15.1+)
- [ ] Tested on physical Android phone (Android 7.0+)
- [ ] Tested on different screen sizes
- [ ] Tested with real data scenarios
- [ ] Tested with multiple family members/prescriptions
- [ ] No crashes or freezes observed

---

## Final Sign-Off

Before submitting, confirm:
- [ ] All checklist items above completed
- [ ] App tested by at least 2 people
- [ ] No known critical bugs
- [ ] All store assets ready
- [ ] Support infrastructure in place (email, privacy policy)
- [ ] Review notes prepared for app reviewers
- [ ] Ready to respond to review feedback within 24-48 hours

---

## Post-Submission Monitoring

After submitting:
- [ ] Monitor support email for user feedback
- [ ] Monitor app review status daily
- [ ] Be prepared to respond to reviewer questions
- [ ] Have fixes ready for any issues found in review
- [ ] Plan for post-launch monitoring and updates

---

## Common Issues to Watch For

### iOS Specific
- PrivacyInfo.xcprivacy missing or incorrect
- Required reason API usage not documented
- Age rating doesn't match content
- Screenshots not correct dimensions
- In-app purchases misconfigured (if applicable)

### Android Specific
- Target SDK not set to required level
- Data Safety form incomplete or inaccurate
- Permissions not justified in store listing
- Missing required privacy policy link
- Age rating issues

### Both Platforms
- App crashes on launch
- Permissions not working
- Data not persisting
- Privacy policy link broken
- Support email not working
- Misleading screenshots or description
- Age verification not working
- Medical disclaimer missing

---

## Testing Timeline Recommendation

- **Day 1:** iOS Testing (4-6 hours)
- **Day 2:** Android Testing (4-6 hours)
- **Day 3:** Cross-platform & Edge Cases (3-4 hours)
- **Day 4:** Build Verification & Final Checks (2-3 hours)
- **Day 5:** Physical Device Testing (3-4 hours)
- **Day 6:** Final Review & Sign-off (2-3 hours)

**Total:** 18-26 hours over 6 days

---

## Success Criteria

All items in this checklist should be checked (✅) before submission.

Any items that are not checked should be:
1. Documented as known issues
2. Assessed for risk
3. Fixed before submission if critical

Good luck with your app store submission! 🚀
