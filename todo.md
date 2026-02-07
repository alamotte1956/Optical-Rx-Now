# Optical Rx Now - Outstanding Issues to Fix

## 1. Home Button Not Working ✅ IN PROGRESS
- **File**: app/(tabs)/index.tsx
- **Issue**: Line 27 uses `router.replace("/")` which should work
- **Fix Needed**: Verify button exists and has proper onPress handler

## 2. No Banner Ad Placeholder on Welcome Page ❌ NOT STARTED
- **File**: app/index.tsx
- **Issue**: No ad banner placeholder visible
- **Fix Needed**: Add ad banner component at top or bottom of welcome screen

## 3. Admin Area Logic Not Working ❌ NOT STARTED
- **File**: app/admin.tsx
- **Issue**: Analytics not loading properly
- **Fix Needed**: Debug and fix data fetching

## 4. No Delete Button in Prescription Area ❌ NOT STARTED
- **File**: app/(tabs)/index.tsx
- **Issue**: Prescription cards missing delete functionality
- **Fix Needed**: Add delete button to prescription cards

## 5. No Delete on Family Member Pages ❌ NOT STARTED
- **File**: app/member/[id].tsx
- **Issue**: Family member cards missing delete functionality
- **Fix Needed**: Add delete button to family member cards

## 6. Sam's Club Local Store Link ❌ PARTIALLY DONE
- **File**: app/find-optometrist.tsx
- **Issue**: Need link to local Sam's Club based on user location
- **Fix Needed**: Add location-based Sam's Club finder integration

## Priority Order:
1. HIGH: Delete buttons (critical UX)
2. HIGH: Home button fix
3. MEDIUM: Banner ad placeholder
4. MEDIUM: Admin area logic
5. LOW: Local Sam's Club link