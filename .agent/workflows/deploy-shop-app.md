---
description: Deploy Shop App to Production
---

# Deploy ORA Shop App to Production

This workflow guides you through deploying the React Native Shop App to Google Play Store and Apple App Store.

## Prerequisites

Before starting, ensure you have:
- [ ] Google Play Developer account ($25)
- [ ] Apple Developer account ($99/year) - for iOS
- [ ] Expo account (free)
- [ ] App assets ready (icon, screenshots, descriptions)
- [ ] Production backend deployed and running

## Quick Start - Android (Recommended First)

### 1. Install EAS CLI

```bash
npm install -g eas-cli
```

### 2. Login to Expo

```bash
cd shop-app
eas login
```

### 3. Configure EAS Build

// turbo
```bash
eas build:configure
```

### 4. Create Production Build

```bash
# This will build an AAB file for Google Play Store
eas build --platform android --profile production
```

Wait 10-20 minutes for the build to complete. You'll get a download link.

### 5. Download the AAB

Download the `.aab` file from the link provided by EAS.

### 6. Upload to Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app (if not already created)
3. Complete store listing (description, screenshots, etc.)
4. Go to **Production** → **Create new release**
5. Upload the AAB file
6. Add release notes
7. Review and rollout

### 7. Wait for Review

Google typically reviews apps within 1-7 days.

## iOS Deployment

### 1. Build for iOS

```bash
eas build --platform ios --profile production
```

### 2. Submit to App Store

```bash
eas submit --platform ios --profile production
```

Or manually upload via Transporter app.

### 3. Configure in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create new app
3. Fill in metadata (screenshots, description, etc.)
4. Add build from TestFlight
5. Submit for review

## Over-The-Air Updates (After Initial Release)

For quick updates that don't require native code changes:

```bash
# Publish update to production
eas update --branch production --message "Bug fixes and improvements"
```

Users will get the update on next app launch.

## Testing Before Production

### Internal Testing (Android)

```bash
# Build for internal testing
eas build --platform android --profile preview
```

Share the APK with testers.

### TestFlight (iOS)

After building for iOS, the app automatically appears in TestFlight. Invite testers via App Store Connect.

## Monitoring

After deployment:

1. **Check crash reports** in Play Console / App Store Connect
2. **Monitor user reviews**
3. **Track analytics** (if Firebase is configured)
4. **Respond to feedback** quickly

## Common Issues

### Build Fails

```bash
# Clear cache and retry
eas build --platform android --profile production --clear-cache
```

### App Rejected

- Read the rejection email carefully
- Fix the issues mentioned
- Resubmit with notes explaining changes

### OTA Update Not Working

- Ensure app has `expo-updates` installed
- Check that users have internet connection
- Updates apply on next app restart

## Version Management

When releasing updates:

1. **Update version in app.json**:
   ```json
   {
     "expo": {
       "version": "1.0.1",
       "android": {
         "versionCode": 2
       },
       "ios": {
         "buildNumber": "2"
       }
     }
   }
   ```

2. **Build new version**
3. **Upload to stores**

## Resources

- Full guide: `/docs/SHOP_APP_DEPLOYMENT.md`
- [Expo EAS Documentation](https://docs.expo.dev/build/introduction/)
- [Google Play Console](https://play.google.com/console)
- [App Store Connect](https://appstoreconnect.apple.com)

## Cost Summary

- **Google Play**: $25 one-time
- **Apple App Store**: $99/year
- **EAS Build (optional paid)**: $29/month (free tier available)
- **Total Year 1**: $124 (Android + iOS)

## Timeline

- **Android**: 1-2 weeks (including review)
- **iOS**: 2-4 weeks (including review)
- **OTA Updates**: Instant (no review needed)

---

**Pro Tip**: Start with Android for faster deployment and feedback, then launch iOS once you've ironed out any issues.
