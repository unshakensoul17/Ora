---
description: Deploy Shop App for Free and Test on Device
---

# Free Production Deployment & Testing Guide

This workflow guides you through deploying the ORA Shop App using 100% free tools and testing it on physical devices.

## Option 1: Web App (PWA) - Recommended for Instant Access

Convert your app into a Progressive Web App (PWA) accessible via URL.

### 1. Build for Web
Run this command in the `shop-app/` directory:
```bash
npx expo export --platform web
```
This creates a `dist` folder.

### 2. Deploy to Vercel
(Requires Vercel CLI or manual upload)
```bash
npx vercel deploy --prod
```
- Select `dist` as the build folder if asked.
- **Cost:** Free (Hobby Tier).
- **Result:** You get a `https://ora-shop.vercel.app` URL.

### 3. Install on Device
- Open the URL in Chrome (Android) or Safari (iOS).
- Tap "Share" (iOS) or Menu (Android) -> "Add to Home Screen".
- It will appear as a native app icon.

## Option 2: Android Native App (APK)

Build a real Android `.apk` file to install directly (sideload).

### 1. Configure EAS
We have created `eas.json` configured for APK generation.

### 2. Build APK
```bash
# Run this from shop-app/ directory
eas build --platform android --profile production --local
```
*Note: `--local` requires Android Studio setup. If you don't have it, run without `--local` to build in the cloud (Free Expo account required).*

**Cloud Build (Easiest):**
```bash
eas build --platform android --profile production
```
- You will need to log in (`eas login`).
- It will queue and build in the cloud.
- **Cost:** Free (Resource limited).

### 3. Install on Device
- Download the `.apk` file from the link EAS provides.
- Transfer to phone or download directly on phone.
- Tap to install. (You may need to allow "Install unknown apps").

## Testing on Physical Device

### 1. Development Mode (Expo Go)
Fastest way to test changes during development.
1. Install **Expo Go** from Play Store / App Store.
2. Run in terminal:
   ```bash
   npx expo start
   ```
3. Scan the QR code with your phone.

### 2. Production Mode (APK / Web)
- **Web:** Accessible globally via the Vercel URL.
- **APK:** A standalone app. Does not require Expo Go. Performance is faster.

## Summary of Free Tools
- **Deployment:** Vercel (Web), EAS Build (Android APK).
- **Database:** Supabase (Free Tier).
- **Testing:** Expo Go, Physical Device Sideloading.
