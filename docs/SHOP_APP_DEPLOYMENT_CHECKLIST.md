# ORA Shop App - Production Deployment Checklist

Use this checklist to ensure you don't miss any critical steps when deploying to production.

## 📋 Pre-Deployment Checklist

### Developer Accounts
- [ ] Google Play Developer account created ($25)
- [ ] Apple Developer Program enrolled ($99/year) - if deploying to iOS
- [ ] Expo account created (free)
- [ ] EAS CLI installed globally (`npm install -g eas-cli`)

### Backend Infrastructure
- [ ] Production backend deployed (Railway/Render)
- [ ] Production database setup (Supabase PostgreSQL)
- [ ] Redis cache configured (Upstash)
- [ ] Environment variables configured
- [ ] API endpoint tested and working
- [ ] CORS configured for production domains
- [ ] Database migrations run
- [ ] Seed data loaded (if needed)

### App Configuration
- [ ] `app.json` updated with production values
- [ ] Bundle identifier set: `com.ora.shop`
- [ ] Version number set: `1.0.0`
- [ ] Version code set: `1` (Android) / Build number: `1` (iOS)
- [ ] App name finalized: "ORA Shop"
- [ ] API endpoint updated to production URL
- [ ] Environment configuration created (`app.config.js`)

### Assets Prepared
- [ ] App icon (1024x1024px, PNG, no transparency)
- [ ] Adaptive icon for Android (1024x1024px)
- [ ] Splash screen (1242x2436px)
- [ ] Feature graphic for Play Store (1024x500px)
- [ ] Screenshots (5-8 per platform):
  - [ ] Android phone (1080x1920px)
  - [ ] iOS 6.7" (1290x2796px)
- [ ] App Store description written (4000 chars max)
- [ ] Short description written (80 chars for Android)
- [ ] Keywords selected (100 chars for iOS)

### Legal & Compliance
- [ ] Privacy Policy created and published
- [ ] Terms of Service created and published
- [ ] Privacy Policy URL accessible
- [ ] Support email setup (e.g., support@ora.app)
- [ ] Content rating questionnaire completed

### Testing
- [ ] All features tested on Android
- [ ] All features tested on iOS (if applicable)
- [ ] Login/logout flow verified
- [ ] Inventory management tested
- [ ] Calendar functionality verified
- [ ] QR code scanning tested
- [ ] Hold management verified
- [ ] Offline mode tested
- [ ] Network error handling verified
- [ ] Performance tested on low-end devices
- [ ] Demo account created for reviewers

### Monitoring & Analytics
- [ ] Sentry configured for crash reporting
- [ ] Firebase Analytics setup (optional)
- [ ] Error tracking tested
- [ ] Performance monitoring enabled

---

## 🤖 Android Deployment Checklist

### Build Configuration
- [ ] `eas.json` created with production profile
- [ ] Google Services file added (if using Firebase)
- [ ] ProGuard rules configured (if needed)
- [ ] Permissions justified in manifest

### Google Play Console Setup
- [ ] App created in Play Console
- [ ] Store listing completed:
  - [ ] App name
  - [ ] Short description
  - [ ] Full description
  - [ ] App icon uploaded
  - [ ] Feature graphic uploaded
  - [ ] Screenshots uploaded (phone + tablet)
  - [ ] Category selected: Business
  - [ ] Contact details added
  - [ ] Privacy policy URL added
- [ ] Content rating completed
- [ ] Target audience selected
- [ ] App content declarations completed
- [ ] Pricing & distribution configured
- [ ] Countries selected (India or worldwide)

### Build & Upload
- [ ] Production build created: `eas build --platform android --profile production`
- [ ] AAB file downloaded
- [ ] AAB uploaded to Play Console
- [ ] Release notes added
- [ ] Release reviewed
- [ ] Rollout started

### Post-Submission
- [ ] Submission confirmation received
- [ ] Review status monitored
- [ ] Team notified of submission

---

## 🍎 iOS Deployment Checklist

### Build Configuration
- [ ] Apple Developer account verified
- [ ] App ID created in Developer Portal
- [ ] Certificates configured (EAS handles automatically)
- [ ] Provisioning profiles created
- [ ] Info.plist permissions configured

### App Store Connect Setup
- [ ] App created in App Store Connect
- [ ] App information completed:
  - [ ] Name: ORA Shop
  - [ ] Bundle ID: com.ora.shop
  - [ ] Primary language: English (India)
  - [ ] Category: Business
  - [ ] Privacy policy URL
  - [ ] Support URL
- [ ] Pricing & availability set
- [ ] App Privacy details filled
- [ ] Screenshots uploaded (all required sizes)
- [ ] App description written
- [ ] Keywords added
- [ ] Promotional text added

### Build & Upload
- [ ] Production build created: `eas build --platform ios --profile production`
- [ ] IPA file submitted: `eas submit --platform ios`
- [ ] Build appears in TestFlight
- [ ] Build added to App Store version
- [ ] Demo account credentials provided
- [ ] Review notes added (explain QR scanning)
- [ ] App submitted for review

### Post-Submission
- [ ] Submission confirmation received
- [ ] Review status monitored
- [ ] Team notified of submission

---

## 🔄 Post-Launch Checklist

### Day 1
- [ ] Monitor crash reports (Sentry/Play Console/App Store Connect)
- [ ] Check user reviews
- [ ] Verify analytics are tracking
- [ ] Test production app download
- [ ] Verify all features work in production
- [ ] Monitor server load and performance

### Week 1
- [ ] Respond to user reviews
- [ ] Fix critical bugs via OTA update
- [ ] Collect user feedback
- [ ] Monitor key metrics (DAU, retention, crashes)
- [ ] Plan first update

### Month 1
- [ ] Analyze user behavior
- [ ] Identify pain points
- [ ] Plan feature improvements
- [ ] Optimize based on metrics
- [ ] Prepare version 1.1.0

---

## 🚨 Emergency Procedures

### Critical Bug Found
1. [ ] Assess severity
2. [ ] If minor: Fix via OTA update
   ```bash
   eas update --branch production --message "Critical bug fix"
   ```
3. [ ] If major: Pull app from stores temporarily
4. [ ] Fix and submit new build
5. [ ] Communicate with users

### App Rejected
1. [ ] Read rejection email carefully
2. [ ] Document rejection reason
3. [ ] Fix issues mentioned
4. [ ] Test thoroughly
5. [ ] Resubmit with detailed notes
6. [ ] Monitor resubmission status

### Server Issues
1. [ ] Check backend health
2. [ ] Verify database connectivity
3. [ ] Check Redis connection
4. [ ] Review error logs
5. [ ] Scale resources if needed
6. [ ] Communicate with users if downtime expected

---

## 📊 Success Metrics

Track these metrics post-launch:

- [ ] **Downloads**: Target 100+ in first month
- [ ] **Active Users**: Track DAU/MAU
- [ ] **Crash-free Rate**: Target >99%
- [ ] **App Store Rating**: Target 4.5+
- [ ] **User Retention**: D1, D7, D30
- [ ] **QR Scans**: Track verified walk-ins
- [ ] **Inventory Items**: Average per shop

---

## 🎯 Version Planning

### Version 1.0.0 (Initial Release)
- [x] Core features
- [x] Inventory management
- [x] Calendar view
- [x] QR scanning
- [x] Hold management

### Version 1.1.0 (Planned)
- [ ] Push notifications
- [ ] Offline mode improvements
- [ ] Performance optimizations
- [ ] UI/UX refinements

### Version 1.2.0 (Future)
- [ ] Advanced analytics
- [ ] Multi-shop support
- [ ] Revenue tracking
- [ ] Customer insights

---

## 📞 Support Contacts

- **Expo Support**: [expo.dev/discord](https://expo.dev/discord)
- **Google Play Support**: [Play Console Help](https://support.google.com/googleplay/android-developer)
- **Apple Support**: [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
- **ORA Team**: support@ora.app

---

## 📚 Documentation References

- [Full Deployment Guide](/docs/SHOP_APP_DEPLOYMENT.md)
- [Quick Workflow](/docs/workflows/deploy-shop-app.md)
- [Backend Deployment](/docs/DEPLOYMENT.md)
- [Expo EAS Docs](https://docs.expo.dev/build/introduction/)

---

**Last Updated**: January 2026  
**Checklist Version**: 1.0.0

---

## ✅ Final Pre-Launch Verification

Before hitting "Submit for Review":

- [ ] App tested on real devices (not just simulator)
- [ ] All features working in production environment
- [ ] No hardcoded API keys or secrets
- [ ] Privacy policy accessible and accurate
- [ ] Demo account working for reviewers
- [ ] Screenshots accurately represent current app
- [ ] App description matches actual functionality
- [ ] Version numbers correct in all places
- [ ] Team notified of submission
- [ ] Monitoring tools active and tested

**Ready to launch? Let's go! 🚀**
