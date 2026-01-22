# Fashcycle Deployment Checklist

Use this checklist to track your deployment progress.

## Pre-Deployment Setup

- [ ] **Supabase Project Created**
  - [ ] Database URL copied (Transaction Pooler - Port 6543)
  - [ ] Direct URL copied (Session Pooler - Port 5432)
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

## Phase 2: Backend (Render)

- [ ] Render account created
- [ ] New Blueprint created from GitHub repo
- [ ] Service `fashcycle-backend` detected via `render.yaml`

- [ ] Environment variables configured in Render:
  - [ ] NODE_ENV (`production`)
  - [ ] PORT (`10000`)
  - [ ] API_VERSION (`v1`)
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

- [ ] Backend deployed successfully
- [ ] Health check passed

**Backend URL**: _______________________________

## Phase 3: User Web (Vercel)

- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Project configured
  - [ ] Root directory set to `user-web`
  - [ ] Framework preset: Next.js

- [ ] Environment variables added:
  - [ ] NEXT_PUBLIC_API_URL (points to Render URL)
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
  - [ ] NEXT_PUBLIC_API_URL (points to Render URL)
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [ ] NEXT_PUBLIC_ADMIN_MODE

- [ ] Deployed successfully
- [ ] Admin panel accessible

**Admin URL**: _______________________________

## Phase 5: CORS Update

- [ ] Backend `CORS_ORIGINS` updated in Render Dashboard
- [ ] Service redeployed automatically

## Phase 6: Testing

- [ ] Backend API docs (Swagger) accessible
- [ ] User Web loads correctly
- [ ] User Web can fetch data from backend
- [ ] Admin Panel loads correctly
- [ ] Image uploads work (Supabase Storage)
- [ ] Booking flow works end-to-end

## Phase 7: Custom Domains (Optional)

- [ ] User Web custom domain added
- [ ] Admin custom domain added
- [ ] Backend custom domain added (Render Settings)
- [ ] DNS records configured
- [ ] SSL certificates provisioned

## Security Review

- [ ] No .env files in git repository
- [ ] All secrets in Render/Vercel environment variables
- [ ] JWT_SECRET is strong and unique
- [ ] Production Razorpay keys configured
- [ ] CORS properly configured

## Monitoring Setup

- [ ] Render logs accessible
- [ ] Vercel logs accessible

---

## Quick Reference

### Deployment URLs

| Service | URL |
|---------|-----|
| Backend API | _________________________ |
| User Web | _________________________ |
| Admin Panel | _________________________ |

### Important Links

- GitHub Repo: _________________________
- Render Dashboard: https://dashboard.render.com
- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://supabase.com/dashboard

---

**Deployment Date**: _________________________
**Status**: ⬜ In Progress | ⬜ Completed | ⬜ Issues Found
