# Pre-Submission Testing

## iOS Testing
- [ ] Test on iOS 17+ (latest)
- [ ] Camera permission prompt appears
- [ ] Photo library permission prompt appears
- [ ] Prescriptions save and load correctly
- [ ] Images display from local file system
- [ ] Delete family member cascades to prescriptions
- [ ] App works in Airplane Mode (offline)

## Android Testing  
- [ ] Test on Android 13+ (Photo Picker)
- [ ] Camera permission prompt appears
- [ ] Photo picker works (Android 13+)
- [ ] Prescriptions save and load correctly
- [ ] Images display from local file system
- [ ] Delete family member cascades to prescriptions
- [ ] App works in Airplane Mode (offline)

## Data Privacy Testing
- [ ] No network calls for prescription data
- [ ] Data persists after app restart
- [ ] Data is deleted when app is uninstalled
- [ ] Affiliate links still work

## Functionality Testing

### Family Members
- [ ] Add family member (all relationship types)
- [ ] View family members list
- [ ] Delete family member
- [ ] Confirm cascade deletion of prescriptions

### Prescriptions
- [ ] Add prescription with camera photo
- [ ] Add prescription from gallery
- [ ] View prescriptions list
- [ ] Filter prescriptions by family member
- [ ] View prescription details
- [ ] Share prescription (PDF export)
- [ ] Email prescription
- [ ] Print prescription
- [ ] Delete prescription

### Data Persistence
- [ ] Force quit app and relaunch - data persists
- [ ] Add 10+ prescriptions - performance check
- [ ] Large image files (5MB+) - storage check

## Edge Cases
- [ ] Add prescription with no family members
- [ ] Delete last family member
- [ ] Offline mode - all features work
- [ ] Low storage warning handling
- [ ] Image corruption/missing file handling
