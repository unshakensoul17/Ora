# Fashcycle Deployment Checklist

Use this checklist to track your deployment progress.

## Pre-Deployment Setup

- [ ] **Supabase Project Created**
  - [ ] Database URL copied
  - [ ] Anon key copied
  - [ ] Service role key copied
  - [ ] Storage bucket created

- [ ] **Upstash Redis Created**
  - [ ] REST URL copied
  - [ ] REST token copied

- [ ] **Razorpay Account**
  - [ ] Test keys obtained
  - [ ] Live keys obtained (for production)

- [ ] **Google Maps API**
  - [ ] API key created
  - [ ] Maps JavaScript API enabled
  - [ ] Places API enabled

## Phase 1: GitHub

- [ ] Git repository initialized
- [ ] .gitignore created
- [ ] All files added to git
- [ ] Initial commit created
- [ ] GitHub repository created
- [ ] Remote origin added
- [ ] Code pushed to GitHub

**GitHub Repository URL**: _______________________________

## Phase 2: Backend (Railway)

- [ ] Railway account created
- [ ] New project created
- [ ] GitHub repository connected
- [ ] Backend service configured
  - [ ] Root directory set to `backend`
  - [ ] Build command configured
  - [ ] Start command configured

- [ ] Environment variables added:
  - [ ] NODE_ENV
  - [ ] DATABASE_URL
  - [ ] DIRECT_URL
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_ANON_KEY
  - [ ] SUPABASE_SERVICE_ROLE_KEY
  - [ ] UPSTASH_REDIS_REST_URL
  - [ ] UPSTASH_REDIS_REST_TOKEN
  - [ ] JWT_SECRET (generated)
  - [ ] RAZORPAY_KEY_ID
  - [ ] RAZORPAY_KEY_SECRET
  - [ ] GOOGLE_MAPS_API_KEY
  - [ ] CORS_ORIGINS (placeholder)

- [ ] MeiliSearch service added (optional)
- [ ] Backend deployed successfully
- [ ] API documentation accessible

**Backend URL**: _______________________________

## Phase 3: User Web (Vercel)

- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Project configured
  - [ ] Root directory set to `user-web`
  - [ ] Framework preset: Next.js

- [ ] Environment variables added:
  - [ ] NEXT_PUBLIC_API_URL
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [ ] NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  - [ ] NEXT_PUBLIC_RAZORPAY_KEY_ID
  - [ ] NEXT_PUBLIC_APP_NAME
  - [ ] NEXT_PUBLIC_HOLD_DEPOSIT

- [ ] Deployed successfully
- [ ] Website accessible

**User Web URL**: _______________________________

## Phase 4: Admin Panel (Vercel)

- [ ] Project imported from GitHub (again)
- [ ] Project configured
  - [ ] Root directory set to `admin`
  - [ ] Framework preset: Next.js

- [ ] Environment variables added:
  - [ ] NEXT_PUBLIC_API_URL
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [ ] NEXT_PUBLIC_ADMIN_MODE

- [ ] Deployed successfully
- [ ] Admin panel accessible

**Admin URL**: _______________________________

## Phase 5: CORS Update

- [ ] Backend CORS_ORIGINS updated with actual Vercel URLs
- [ ] Backend redeployed

## Phase 6: Testing

- [ ] Backend API docs accessible
- [ ] User Web loads correctly
- [ ] User Web can fetch data from backend
- [ ] Admin Panel loads correctly
- [ ] Admin Panel can fetch data from backend
- [ ] Image uploads work (Supabase Storage)
- [ ] Search functionality works (MeiliSearch)
- [ ] Booking flow works end-to-end

## Phase 7: Custom Domains (Optional)

- [ ] User Web custom domain added
- [ ] Admin custom domain added
- [ ] Backend custom domain added
- [ ] DNS records configured
- [ ] SSL certificates provisioned
- [ ] CORS updated with custom domains

## Security Review

- [ ] No .env files in git repository
- [ ] All secrets in Railway/Vercel environment variables
- [ ] JWT_SECRET is strong and unique
- [ ] Production Razorpay keys configured
- [ ] CORS properly configured
- [ ] Supabase RLS policies enabled
- [ ] Database backups enabled

## Monitoring Setup

- [ ] Railway logs accessible
- [ ] Vercel logs accessible
- [ ] Error tracking configured (optional)
- [ ] Analytics configured (optional)

## Documentation

- [ ] Deployment URLs documented
- [ ] Environment variables documented
- [ ] Team members have access
- [ ] Rollback procedure understood

---

## Quick Reference

### Deployment URLs

| Service | URL |
|---------|-----|
| Backend API | _________________________ |
| User Web | _________________________ |
| Admin Panel | _________________________ |
| API Docs | _________________________ |

### Important Links

- GitHub Repo: _________________________
- Railway Dashboard: https://railway.app/dashboard
- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://supabase.com/dashboard
- Upstash Console: https://console.upstash.com

---

## Next Steps After Deployment

1. [ ] Monitor error logs for first 24 hours
2. [ ] Test all critical user flows
3. [ ] Set up automated backups
4. [ ] Configure monitoring alerts
5. [ ] Deploy Shop App (mobile)
6. [ ] Plan marketing launch

---

**Deployment Date**: _________________________

**Deployed By**: _________________________

**Status**: ⬜ In Progress | ⬜ Completed | ⬜ Issues Found
