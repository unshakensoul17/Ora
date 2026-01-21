# Fashcycle Shop App - Production Deployment Guide

## 📱 Overview

This guide covers the complete production deployment process for the **Fashcycle Shop App** (React Native/Expo) to both **Google Play Store** (Android) and **Apple App Store** (iOS).

---

## 🎯 Deployment Strategy

### Phase 1: Android-First Launch (Recommended)
- **Target**: Google Play Store
- **Timeline**: 1-2 weeks
- **Cost**: $25 one-time registration
- **Reason**: Faster approval, easier testing, primary market (Indore shop owners)

### Phase 2: iOS Launch
- **Target**: Apple App Store
- **Timeline**: 2-4 weeks
- **Cost**: $99/year
- **Reason**: Premium users, complete market coverage

---

## 📋 Prerequisites

### 1. Development Accounts
- [ ] **Google Play Console** - [$25 one-time](https://play.google.com/console)
- [ ] **Apple Developer Program** - [$99/year](https://developer.apple.com)
- [ ] **Expo Account** - [Free](https://expo.dev)

### 2. Required Assets
- [ ] App Icon (1024x1024px, no transparency)
- [ ] Splash Screen (1242x2436px)
- [ ] Feature Graphic (1024x500px for Play Store)
- [ ] Screenshots (5-8 screenshots per platform)
- [ ] Privacy Policy URL
- [ ] Terms of Service URL
- [ ] App Store Description (4000 chars max)

### 3. Technical Requirements
- [ ] Production API endpoint (Railway/Render)
- [ ] Production database (Supabase)
- [ ] Error tracking (Sentry/Bugsnag)
- [ ] Analytics (Firebase/Mixpanel)
- [ ] Push notifications setup (Firebase Cloud Messaging)

---

## 🔧 Step 1: Configure Production Environment

### 1.1 Update `app.json`

```json
{
  "expo": {
    "name": "Fashcycle Shop",
    "slug": "fashcycle-shop",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0f0f0f"
    },
    "updates": {
      "fallbackToCacheTimeout": 0,
      "url": "https://u.expo.dev/[your-project-id]"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.fashcycle.shop",
      "buildNumber": "1",
      "infoPlist": {
        "NSCameraUsageDescription": "Fashcycle needs camera access to scan customer QR codes for booking verification.",
        "NSLocationWhenInUseUsageDescription": "We need your location to show nearby customers and optimize delivery routes."
      }
    },
    "android": {
      "package": "com.fashcycle.shop",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0f0f0f"
      },
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.ACCESS_FINE_LOCATION"
      ],
      "googleServicesFile": "./google-services.json"
    },
    "web": {
      "bundler": "metro",
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Allow Fashcycle Shop to access your camera for QR code scanning."
        }
      ],
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow Fashcycle to use your location."
        }
      ],
      "expo-secure-store"
    ],
    "extra": {
      "eas": {
        "projectId": "[your-eas-project-id]"
      }
    },
    "owner": "your-expo-username"
  }
}
```

### 1.2 Create Environment Configuration

Create `app.config.js` for environment-specific configs:

```javascript
export default ({ config }) => {
  const isProduction = process.env.APP_ENV === 'production';
  
  return {
    ...config,
    extra: {
      ...config.extra,
      apiUrl: isProduction 
        ? 'https://api.fashcycle.app/api/v1'
        : 'http://localhost:3000/api/v1',
      environment: process.env.APP_ENV || 'development',
    },
  };
};
```

### 1.3 Update API Configuration

Update `src/config/api.ts`:

```typescript
import Constants from 'expo-constants';

export const API_CONFIG = {
  baseURL: Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};
```

---

## 🏗️ Step 2: Setup EAS (Expo Application Services)

### 2.1 Install EAS CLI

```bash
npm install -g eas-cli
```

### 2.2 Login to Expo

```bash
eas login
```

### 2.3 Configure EAS Build

Create `eas.json`:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug"
      },
      "ios": {
        "buildConfiguration": "Debug"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "buildConfiguration": "Release"
      },
      "env": {
        "APP_ENV": "production"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "internal"
      },
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD123456"
      }
    }
  }
}
```

---

## 📦 Step 3: Build for Production

### 3.1 Android Build (AAB for Play Store)

```bash
# Configure project
eas build:configure

# Build production AAB
eas build --platform android --profile production

# Or build APK for testing
eas build --platform android --profile preview
```

**What happens:**
1. Code is uploaded to Expo servers
2. Build runs on Expo's infrastructure
3. You get a download link for the AAB/APK
4. Build typically takes 10-20 minutes

### 3.2 iOS Build (IPA for App Store)

```bash
# Build production IPA
eas build --platform ios --profile production
```

**Requirements:**
- Apple Developer account
- App Store Connect access
- Certificates and provisioning profiles (EAS handles this automatically)

---

## 🎨 Step 4: Prepare Store Assets

### 4.1 App Icon

Create icons using [Expo Icon Generator](https://www.appicon.co/):
- **1024x1024px** PNG (no transparency)
- Place in `assets/icon.png`
- Adaptive icon for Android: `assets/adaptive-icon.png`

### 4.2 Screenshots

**Android (Google Play):**
- Phone: 1080x1920px (5-8 screenshots)
- 7-inch tablet: 1200x1920px
- 10-inch tablet: 1600x2560px

**iOS (App Store):**
- iPhone 6.7": 1290x2796px
- iPhone 6.5": 1242x2688px
- iPad Pro 12.9": 2048x2732px

**Pro Tip:** Use [Figma](https://figma.com) or [Shotsnapp](https://shotsnapp.com/) to create beautiful screenshots with device frames.

### 4.3 Feature Graphic (Android Only)

- **1024x500px** JPG/PNG
- Showcases app's main features
- No text (Google may reject)

---

## 🚀 Step 5: Deploy to Google Play Store

### 5.1 Create Google Play Console Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Pay $25 one-time registration fee
3. Complete account setup

### 5.2 Create App

1. **Create App** → Fill in details:
   - App name: "Fashcycle Shop"
   - Default language: English (India)
   - App or Game: App
   - Free or Paid: Free

2. **Store Listing:**
   - Short description (80 chars)
   - Full description (4000 chars)
   - Screenshots
   - Feature graphic
   - App icon
   - Category: Business
   - Contact details
   - Privacy policy URL

3. **Content Rating:**
   - Complete questionnaire
   - Get ESRB rating (likely "Everyone")

4. **App Content:**
   - Privacy policy
   - Ads declaration (No ads)
   - Target audience
   - News app (No)

5. **Pricing & Distribution:**
   - Free
   - Countries: India (or worldwide)
   - Content guidelines acceptance

### 5.3 Upload Build

1. **Production** → **Create new release**
2. Upload AAB file from EAS build
3. Add release notes:
   ```
   Initial release of Fashcycle Shop
   - Manage inventory
   - Visual calendar
   - QR code scanning
   - Hold management
   ```
4. **Save** → **Review release** → **Start rollout to Production**

### 5.4 Review Process

- **Timeline**: 1-7 days
- **Status**: Track in Play Console
- **Common rejections**: Privacy policy, permissions, content rating

---

## 🍎 Step 6: Deploy to Apple App Store

### 6.1 Create App Store Connect Account

1. Join [Apple Developer Program](https://developer.apple.com) ($99/year)
2. Access [App Store Connect](https://appstoreconnect.apple.com)

### 6.2 Create App

1. **My Apps** → **+** → **New App**
2. Fill in details:
   - Platform: iOS
   - Name: Fashcycle Shop
   - Primary Language: English (India)
   - Bundle ID: com.fashcycle.shop
   - SKU: fashcycle-shop-001

### 6.3 App Information

1. **Privacy Policy URL**
2. **Category**: Business
3. **Subcategory**: Productivity
4. **Content Rights**: No third-party content

### 6.4 Pricing & Availability

- **Price**: Free
- **Availability**: India (or worldwide)

### 6.5 Prepare for Submission

1. **App Preview and Screenshots**
   - Upload screenshots for all required sizes
   - Optional: App preview video (30 sec)

2. **Promotional Text** (170 chars)
   ```
   Manage your fashion rental boutique with ease. Track inventory, manage bookings, and verify customer walk-ins with QR scanning.
   ```

3. **Description** (4000 chars)
   ```
   Fashcycle Shop is the ultimate inventory and booking management tool for fashion rental boutiques.

   KEY FEATURES:
   • Visual Calendar - See availability at a glance
   • Inventory Management - Track all your rental items
   • QR Code Scanning - Verify customer bookings instantly
   • Hold Management - Manage customer reservations
   • Real-time Sync - Always up-to-date across devices

   Perfect for boutique owners in Indore and beyond!
   ```

4. **Keywords** (100 chars)
   ```
   rental,fashion,boutique,inventory,calendar,booking,qr,shop,business,management
   ```

5. **Support URL**: Your website
6. **Marketing URL**: Optional

### 6.6 Build Upload

```bash
# Build and submit to App Store
eas submit --platform ios --profile production

# Or manually upload via Transporter app
```

### 6.7 App Review Information

- **Sign-in required**: Yes
- **Demo account**:
  - Username: demo@fashcycle.com
  - Password: Demo@123
- **Notes**: Explain QR scanning feature, provide test QR code

### 6.8 Submit for Review

1. **Add for Review**
2. **Submit**
3. **Wait for review** (1-3 days typically)

---

## 🔄 Step 7: Over-The-Air (OTA) Updates

### 7.1 Setup EAS Update

```bash
# Install
npm install expo-updates

# Configure in app.json (already done above)
```

### 7.2 Publish Updates

```bash
# Publish update to production
eas update --branch production --message "Bug fixes and improvements"

# Publish to preview
eas update --branch preview --message "Testing new features"
```

### 7.3 Update Strategy

- **Critical fixes**: OTA update (instant)
- **New features**: OTA update (users get it on next app open)
- **Native changes**: New build required (camera permissions, etc.)

---

## 📊 Step 8: Monitoring & Analytics

### 8.1 Crash Reporting (Sentry)

```bash
npm install @sentry/react-native
```

Configure in `App.tsx`:

```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'your-sentry-dsn',
  enableInExpoDevelopment: false,
  debug: false,
});
```

### 8.2 Analytics (Firebase)

```bash
expo install @react-native-firebase/app @react-native-firebase/analytics
```

### 8.3 Performance Monitoring

- **Expo Application Services**: Built-in performance metrics
- **Firebase Performance**: Detailed performance tracking

---

## 🔐 Step 9: Security Checklist

- [ ] **API Keys**: Never hardcode, use environment variables
- [ ] **Secure Storage**: Use `expo-secure-store` for tokens
- [ ] **HTTPS Only**: All API calls over HTTPS
- [ ] **Certificate Pinning**: Consider for production
- [ ] **Code Obfuscation**: Enable ProGuard (Android) / Bitcode (iOS)
- [ ] **Permissions**: Request only necessary permissions
- [ ] **Data Encryption**: Encrypt sensitive local data

---

## 📱 Step 10: Testing Before Launch

### 10.1 Internal Testing

**Android:**
1. Play Console → **Internal testing**
2. Add testers via email
3. Share testing link

**iOS:**
1. TestFlight → **Add Internal Testers**
2. Invite via email
3. Testers download TestFlight app

### 10.2 Beta Testing

**Android:**
- **Closed testing**: Up to 100 testers
- **Open testing**: Unlimited testers

**iOS:**
- **TestFlight**: Up to 10,000 external testers

### 10.3 Test Checklist

- [ ] Login/Logout flow
- [ ] Inventory CRUD operations
- [ ] Calendar view and interactions
- [ ] QR code scanning
- [ ] Hold management
- [ ] Offline functionality
- [ ] Push notifications
- [ ] Performance on low-end devices
- [ ] Network error handling

---

## 🚀 Step 11: Launch Checklist

### Pre-Launch
- [ ] All features tested
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Support email setup
- [ ] Demo account created
- [ ] Screenshots uploaded
- [ ] Store descriptions finalized
- [ ] Backend scaled for production
- [ ] Monitoring tools configured

### Launch Day
- [ ] Submit to stores
- [ ] Monitor crash reports
- [ ] Check user reviews
- [ ] Respond to feedback
- [ ] Monitor server load

### Post-Launch
- [ ] Collect user feedback
- [ ] Fix critical bugs via OTA
- [ ] Plan feature updates
- [ ] Monitor analytics
- [ ] Optimize based on metrics

---

## 💰 Cost Breakdown

| Item | Cost | Frequency |
|------|------|-----------|
| Google Play Developer | $25 | One-time |
| Apple Developer Program | $99 | Annual |
| Expo EAS Build (Free tier) | $0 | Monthly |
| Expo EAS Build (Production) | $29 | Monthly (optional) |
| Sentry (Free tier) | $0 | Monthly |
| Firebase (Free tier) | $0 | Monthly |
| **Total (Year 1)** | **$124-$472** | - |

---

## 🔄 Version Management

### Semantic Versioning

```
MAJOR.MINOR.PATCH (e.g., 1.0.0)
```

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Version Codes

**Android:**
- `versionCode`: Integer, increment with each release (1, 2, 3...)

**iOS:**
- `buildNumber`: String, increment with each build ("1", "2", "3"...)

### Release Schedule

- **Patch releases**: Weekly (bug fixes)
- **Minor releases**: Monthly (new features)
- **Major releases**: Quarterly (major updates)

---

## 🆘 Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
eas build --platform android --profile production --clear-cache
```

### App Rejected

**Common reasons:**
- Missing privacy policy
- Incorrect permissions usage
- Crashes on launch
- Incomplete metadata

**Solution:**
- Read rejection email carefully
- Fix issues
- Resubmit with notes

### OTA Update Not Working

```bash
# Check update configuration
expo config --type public

# Force update
eas update --branch production --message "Force update"
```

---

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
- [React Native Performance](https://reactnative.dev/docs/performance)

---

## 🎯 Next Steps

1. **Create developer accounts** (Google Play + Apple)
2. **Prepare assets** (icons, screenshots, descriptions)
3. **Configure EAS** and run test builds
4. **Internal testing** with shop owners
5. **Submit to stores**
6. **Monitor and iterate**

---

## 📞 Support

For deployment issues:
- **Expo Discord**: [expo.dev/discord](https://expo.dev/discord)
- **Stack Overflow**: Tag `expo` or `react-native`
- **Fashcycle Team**: support@fashcycle.app

---

**Last Updated**: January 2026
**Version**: 1.0.0
