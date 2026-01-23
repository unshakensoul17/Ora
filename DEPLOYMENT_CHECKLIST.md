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
- [x] Git repository initialized
- [x] .gitignore created
- [x] All files added to git
- [x] Initial commit created
- [x] GitHub repository created
- [x] Remote origin added
- [x] Code pushed to GitHub

**GitHub Repository URL**: https://github.com/unshakensoul17/Fashcycle-

## Phase 2: Backend (Render)

- [x] Render account created
- [x] New Blueprint created from GitHub repo
- [x] Service `fashcycle-backend` detected via `render.yaml`
- [x] Environment variables configured in Render
- [x] Backend deployed successfully (Docker mode)
- [x] Health check passed

**Backend URL**: (Check Render Dashboard)

## Phase 3: User Web (Vercel)

- [x] Vercel account created
- [x] Project imported from GitHub
- [x] Project configured
  - [x] Root directory set to `user-web`
  - [x] Framework preset: Next.js
- [x] Environment variables added
- [x] Deployed successfully (Dynamic pages fixed)

## Phase 4: Admin Panel (Vercel)

- [x] Project imported from GitHub
- [x] Project configured
  - [x] Root directory set to `admin`
  - [x] Framework preset: Next.js
- [x] Environment variables added
- [x] Deployed successfully (Type errors fixed)

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
