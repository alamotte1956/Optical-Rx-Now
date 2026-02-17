# Optical Rx Now - Product Requirements Document

## Overview
**App Name:** Optical Rx Now  
**Platform:** iOS & Android (React Native/Expo)  
**Business Model:** Free app with affiliate marketing commissions and banner ads from optical goods manufacturers

## User Personas
1. **Primary Users:** Families managing multiple prescriptions for eyeglasses and contact lenses
2. **Target Demographics:** Adults 25-65 managing their own and family members' vision care

## Core Features (Implemented)

### Prescription Management
- ✅ Photo capture of prescriptions (camera + gallery)
- ✅ **On-device OCR** for automatic expiration date detection (ML Kit - HIPAA compliant)
- ✅ **Required** expiration date entry (auto-detected or manual fallback)
- ✅ Family member management with relationships
- ✅ Prescription types: Eyeglasses & Contact Lenses (separate buttons)
- ✅ Expiration tracking with color-coded status

### Notifications
- ✅ Push notifications for expiring prescriptions
- ✅ Alerts at 30, 14, 7, 2 days, and day of expiration
- ✅ Customizable notification settings

### Shop & Affiliates
- ✅ 18 affiliate optical partners integrated
- ✅ Partners sorted by commission rate (4-15%)
- ✅ Categories: Online, Retail, Contacts
- ✅ Location-based retail store finder
- ✅ "Preferred Partner" highlighting (Sam's Club)

### Find Optometrists
- ✅ Google Maps integration
- ✅ Healthgrades integration
- ✅ Yelp integration
- ✅ Location-based search

### Admin Panel (Long-press logo to access)
- ✅ Analytics dashboard with metrics
- ✅ Affiliate management with enable/disable
- ✅ Affiliate ID input for each partner
- ✅ Click tracking analytics
- ✅ Data management tools

## Monetization Infrastructure (Implemented)

### Affiliate Partners (18 total)
| Partner | Commission | Network | Category |
|---------|------------|---------|----------|
| Designer Optics | 15% | Partnerize | Online |
| Eyeglasses.com | 15% | IMPACT.com | Online |
| GlassesUSA | 12% | CJ | Online |
| Clearly | 12% | Direct | Contacts |
| Lens.com | 12% | CJ | Contacts |
| ContactsDirect | 11% | ShareASale | Contacts |
| Zenni Optical | 10% | Impact Radius | Online |
| EyeBuyDirect | 10% | ShareASale | Online |
| Warby Parker | 10% | Rakuten | Online |
| 1-800 Contacts | 9% | CJ | Contacts |
| Target Optical | 8% | CJ | Retail |
| Eyeconic | 8% | VSP | Online |
| Coastal | 8% | ShareASale | Online |
| SportRx | 7% | Direct | Online |
| FramesDirect | 7% | CJ | Online |
| Sam's Club | 5% | Direct | Retail |
| Costco Optical | 4% | Direct | Retail |
| America's Best | 4% | Direct | Retail |

### Analytics Tracking
- ✅ App opens tracked
- ✅ Ad clicks tracked
- ✅ Affiliate clicks tracked with partner attribution
- ✅ Stats viewable in Admin panel
- ✅ Local storage for privacy

### Ad Placements
- ✅ Welcome screen banner placeholder
- ✅ Shop page banner placeholder
- ✅ Find Optometrists banner placeholder
- ✅ "Advertise with us" CTAs with email link

## Technical Architecture

### Frontend (Expo/React Native)
- Expo SDK 54
- expo-router for navigation
- AsyncStorage for local data
- expo-image-picker for photos
- expo-location for geolocation
- expo-notifications for push

### Backend (FastAPI)
- Minimal health check endpoints
- All user data stored locally on device
- No server-side storage (privacy-focused)

## App Store Readiness
- ✅ app.json configured for iOS & Android
- ✅ Bundle IDs: com.opticalrxnow.app
- ✅ Privacy permissions configured
- ✅ EAS Build configuration (eas.json)
- ✅ Deployment guide created

## Next Steps / Backlog

### P0 (Before Launch)
- [ ] Add actual affiliate IDs in Admin panel
- [ ] Create Privacy Policy page
- [ ] Set up App Store Connect account
- [ ] Set up Google Play Console account
- [ ] Build production APK/IPA

### P1 (Post-Launch)
- [ ] Integrate Google AdMob for banner ads
- [ ] Add more manufacturer banner ad slots
- [ ] Implement deep linking for affiliate URLs
- [ ] Add analytics export functionality

### P2 (Future Enhancements)
- [ ] Firebase Analytics for cross-device tracking
- [ ] A/B testing for affiliate placement
- [ ] Revenue dashboard
- [ ] Push notification campaigns

## Changelog
- **Jan 2026**: Added affiliate ID management in Admin panel
- **Jan 2026**: Expanded to 18 affiliate partners
- **Jan 2026**: Implemented click tracking analytics
- **Jan 2026**: GitHub import and deployment setup
