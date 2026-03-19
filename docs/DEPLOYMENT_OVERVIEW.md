# ORA Production Deployment - Complete Overview

## 📱 What We're Deploying

The ORA platform consists of **4 applications**:

1. **Backend API** (NestJS) → Railway
2. **User Web** (Next.js) → Vercel
3. **Admin Console** (Next.js) → Vercel
4. **Shop App** (React Native) → Google Play Store + Apple App Store ⭐

---

## 🎯 Deployment Strategy

### Phase 1: Infrastructure (Backend + Web Apps)
**Status**: ✅ Already documented in `/docs/DEPLOYMENT.md`

- Backend → Railway (or Render)
- User Web → Vercel
- Admin Console → Vercel
- Database → Supabase PostgreSQL
- Cache → Upstash Redis
- Storage → Supabase Storage

### Phase 2: Mobile App (Shop App)
**Status**: ✅ **NEW - Fully documented**

- Android → Google Play Store
- iOS → Apple App Store
- Updates → Expo EAS OTA

---

## 📚 Documentation Structure

### 1. **Shop App Deployment Guide** (Comprehensive)
**File**: `/docs/SHOP_APP_DEPLOYMENT.md`

**What it covers**:
- Complete step-by-step deployment process
- EAS Build configuration
- Google Play Store submission
- Apple App Store submission
- OTA updates setup
- Monitoring and analytics
- Security checklist
- Testing procedures
- Cost breakdown
- Troubleshooting

**When to use**: First-time deployment or detailed reference

---

### 2. **Deployment Workflow** (Quick Reference)
**File**: `/.agent/workflows/deploy-shop-app.md`

**What it covers**:
- Quick command reference
- Essential steps only
- Common issues and fixes
- Fast deployment path

**When to use**: Regular deployments, quick reference

**How to use**: Run `/deploy-shop-app` command

---

### 3. **Deployment Checklist** (Task List)
**File**: `/docs/SHOP_APP_DEPLOYMENT_CHECKLIST.md`

**What it covers**:
- Pre-deployment checklist
- Android-specific checklist
- iOS-specific checklist
- Post-launch checklist
- Emergency procedures
- Success metrics

**When to use**: Before and during deployment to ensure nothing is missed

---

## 🚀 Quick Start Guide

### For First-Time Deployment

1. **Read the comprehensive guide**:
   ```bash
   cat docs/SHOP_APP_DEPLOYMENT.md
   ```

2. **Complete the checklist**:
   ```bash
   cat docs/SHOP_APP_DEPLOYMENT_CHECKLIST.md
   ```

3. **Follow the workflow**:
   ```bash
   # Use the /deploy-shop-app command or:
   cat .agent/workflows/deploy-shop-app.md
   ```

### For Regular Updates

1. **Build new version**:
   ```bash
   cd shop-app
   eas build --platform android --profile production
   ```

2. **Upload to stores** (manual or via EAS submit)

3. **For minor updates** (no native code changes):
   ```bash
   eas update --branch production --message "Bug fixes"
   ```

---

## 💰 Cost Summary

### One-Time Costs
- Google Play Developer: **$25**
- Apple Developer (optional): **$99/year**

### Monthly Costs (Optional)
- EAS Build (free tier available): **$0-29/month**
- Monitoring (Sentry free tier): **$0**
- Analytics (Firebase free tier): **$0**

### Total Year 1
- **Android only**: $25
- **Android + iOS**: $124
- **With paid EAS**: $472

---

## ⏱️ Timeline

### Android Deployment
- **Setup**: 1-2 days
- **Build & Submit**: 1 day
- **Review**: 1-7 days
- **Total**: ~1-2 weeks

### iOS Deployment
- **Setup**: 2-3 days
- **Build & Submit**: 1 day
- **Review**: 1-3 days
- **Total**: ~2-4 weeks

### OTA Updates
- **Instant**: No review needed

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   CLIENT APPLICATIONS                    │
├─────────────────┬─────────────────┬─────────────────────┤
│  Shop App       │  User Web       │  Admin Console      │
│  (iOS/Android)  │  (Next.js)      │  (Next.js)          │
│  Play/App Store │  Vercel         │  Vercel             │
└────────┬────────┴────────┬────────┴────────┬────────────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
                    ┌──────▼──────┐
                    │   Backend   │
                    │   (NestJS)  │
                    │   Railway   │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
    │Supabase │      │ Upstash │      │Firebase │
    │PostgreSQL│      │  Redis  │      │   FCM   │
    │ Storage │      │         │      │ Sentry  │
    └─────────┘      └─────────┘      └─────────┘
```

---

## 🔑 Key Technologies

### Shop App Stack
- **Framework**: React Native (Expo)
- **Build System**: EAS (Expo Application Services)
- **Updates**: OTA via EAS Update
- **Navigation**: React Navigation
- **State**: Zustand
- **API Client**: Axios + React Query
- **Camera**: Expo Camera (QR scanning)
- **Storage**: Expo Secure Store

### Deployment Tools
- **Build**: EAS Build
- **Submit**: EAS Submit (or manual)
- **Updates**: EAS Update
- **Monitoring**: Sentry
- **Analytics**: Firebase (optional)

---

## 📋 Pre-Deployment Requirements

### Accounts Needed
- [x] Expo account
- [ ] Google Play Developer account
- [ ] Apple Developer account (for iOS)

### Infrastructure Ready
- [x] Backend deployed and running
- [x] Database configured (Supabase)
- [x] Redis configured (Upstash)
- [x] Storage configured (Supabase)

### Assets Prepared
- [ ] App icon (1024x1024px)
- [ ] Screenshots (5-8 per platform)
- [ ] Feature graphic (Android)
- [ ] Privacy policy URL
- [ ] App descriptions

---

## 🎯 Recommended Deployment Path

### Week 1: Preparation
1. Create developer accounts
2. Prepare all assets
3. Write privacy policy
4. Set up monitoring tools
5. Configure EAS

### Week 2: Android Build & Test
1. Create production build
2. Internal testing
3. Fix any issues
4. Prepare store listing

### Week 3: Android Launch
1. Submit to Play Store
2. Monitor review process
3. Launch to production
4. Monitor metrics

### Week 4+: iOS (Optional)
1. Create iOS build
2. TestFlight testing
3. Submit to App Store
4. Monitor and launch

---

## 🔄 Update Strategy

### Critical Bugs
- **Method**: OTA Update
- **Timeline**: Immediate
- **Command**: `eas update --branch production`

### New Features (No Native Code)
- **Method**: OTA Update
- **Timeline**: Same day
- **Command**: `eas update --branch production`

### New Features (Native Code Changes)
- **Method**: New Build
- **Timeline**: 1-7 days (review)
- **Command**: `eas build` + store submission

---

## 📊 Success Metrics to Track

### App Performance
- Crash-free rate: Target >99%
- App load time: <3 seconds
- API response time: <500ms

### User Engagement
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Session length
- Feature usage

### Business Metrics
- QR scans per day
- Verified walk-ins
- Inventory items managed
- Shop retention rate

---

## 🆘 Support & Resources

### Documentation
- [Expo Docs](https://docs.expo.dev)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Play Console Help](https://support.google.com/googleplay/android-developer)
- [App Store Connect](https://developer.apple.com/help/app-store-connect/)

### Community
- Expo Discord: [expo.dev/discord](https://expo.dev/discord)
- Stack Overflow: Tag `expo` or `react-native`

### ORA Team
- Email: support@ora.app
- Docs: `/docs/` folder

---

## ✅ Next Steps

1. **Review the comprehensive guide**: `/docs/SHOP_APP_DEPLOYMENT.md`
2. **Create developer accounts** (Google Play + optionally Apple)
3. **Prepare assets** (icon, screenshots, descriptions)
4. **Install EAS CLI**: `npm install -g eas-cli`
5. **Configure EAS**: `cd shop-app && eas build:configure`
6. **Create test build**: `eas build --platform android --profile preview`
7. **Test thoroughly**
8. **Create production build**: `eas build --platform android --profile production`
9. **Submit to Play Store**
10. **Monitor and iterate**

---

## 🎉 You're Ready!

You now have:
- ✅ Complete deployment documentation
- ✅ Step-by-step workflows
- ✅ Comprehensive checklists
- ✅ Architecture overview
- ✅ Cost and timeline estimates
- ✅ Support resources

**Time to deploy! 🚀**

---

**Last Updated**: January 2026  
**Documentation Version**: 1.0.0
