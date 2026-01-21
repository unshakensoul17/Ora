---
description: Deploy Fashcycle to Production (GitHub + Vercel + Railway)
---

# Deploy Fashcycle to Production

This workflow guides you through deploying the complete Fashcycle platform:
- **Backend** → Railway
- **User Web** → Vercel
- **Admin Panel** → Vercel
- **Code Repository** → GitHub

## Prerequisites

Before starting, ensure you have:
- [ ] GitHub account (free)
- [ ] Vercel account (free) - https://vercel.com
- [ ] Railway account (free $5 credit) - https://railway.app
- [ ] Supabase project created - https://supabase.com
- [ ] Upstash Redis database created - https://upstash.com
- [ ] Razorpay account (test mode) - https://razorpay.com

---

## Phase 1: Push to GitHub

### 1. Initialize Git Repository

```bash
cd /home/unshakensoul/Antigarvity/fashcycle
git init
```

### 2. Create .gitignore

The .gitignore file should already exist. If not, it will be created automatically.

### 3. Add All Files

```bash
git add .
```

### 4. Create Initial Commit

```bash
git commit -m "Initial commit: Fashcycle platform - Backend, User Web, Admin Panel"
```

### 5. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `fashcycle` (or your preferred name)
3. Description: "Vertical SaaS + O2O Marketplace for fashion rental boutiques"
4. Keep it **Private** (recommended for production code)
5. **DO NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

### 6. Push to GitHub

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/fashcycle.git
git branch -M main
git push -u origin main
```

---

## Phase 2: Deploy Backend to Railway

### 1. Login to Railway

Go to https://railway.app and sign in with GitHub.

### 2. Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your `fashcycle` repository
4. Railway will detect the monorepo

### 3. Configure Backend Service

1. Click "Add Service" → "GitHub Repo"
2. Select `fashcycle` repository
3. In settings:
   - **Name**: `fashcycle-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && npm run start:prod`

### 4. Add Environment Variables

In Railway dashboard, go to Variables tab and add:

```env
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Database (from Supabase)
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[project-ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres

# Supabase
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# MeiliSearch (Railway)
MEILISEARCH_URL=https://your-meilisearch.railway.app
MEILISEARCH_API_KEY=your-master-key

# Auth
JWT_SECRET=generate-a-secure-random-string-min-32-chars
JWT_EXPIRES_IN=7d
OTP_EXPIRY_MINUTES=10

# Razorpay
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your-secret
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxx

# Google Maps
GOOGLE_MAPS_API_KEY=your-api-key

# App Config
HOLD_DURATION_HOURS=48
HOLD_DEPOSIT_AMOUNT=99
LEAD_FEE_AMOUNT=100

# CORS (will be updated after Vercel deployment)
CORS_ORIGINS=https://your-user-web.vercel.app,https://your-admin.vercel.app
```

### 5. Add MeiliSearch Service (Optional)

1. In Railway, click "New Service"
2. Search for "MeiliSearch" in templates
3. Deploy it
4. Copy the URL and API key to backend environment variables

### 6. Deploy Backend

Railway will automatically deploy. Wait for deployment to complete.

### 7. Get Backend URL

Once deployed, Railway will provide a URL like:
`https://fashcycle-backend-production.up.railway.app`

Copy this URL - you'll need it for frontend deployments.

---

## Phase 3: Deploy User Web to Vercel

### 1. Login to Vercel

Go to https://vercel.com and sign in with GitHub.

### 2. Import Project

1. Click "Add New..." → "Project"
2. Import your `fashcycle` repository
3. Vercel will detect it's a monorepo

### 3. Configure User Web Deployment

1. **Project Name**: `fashcycle-user-web`
2. **Framework Preset**: Next.js
3. **Root Directory**: `user-web`
4. **Build Command**: `npm run build`
5. **Output Directory**: `.next`
6. **Install Command**: `npm install`

### 4. Add Environment Variables

In Vercel project settings → Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-api-key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
NEXT_PUBLIC_APP_NAME=Fashcycle
NEXT_PUBLIC_HOLD_DEPOSIT=99
```

### 5. Deploy

Click "Deploy" and wait for deployment to complete.

### 6. Get User Web URL

Vercel will provide a URL like:
`https://fashcycle-user-web.vercel.app`

---

## Phase 4: Deploy Admin Panel to Vercel

### 1. Import Project Again

1. In Vercel, click "Add New..." → "Project"
2. Import your `fashcycle` repository again

### 2. Configure Admin Deployment

1. **Project Name**: `fashcycle-admin`
2. **Framework Preset**: Next.js
3. **Root Directory**: `admin`
4. **Build Command**: `npm run build`
5. **Output Directory**: `.next`
6. **Install Command**: `npm install`

### 3. Add Environment Variables

```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_ADMIN_MODE=true
```

### 4. Deploy

Click "Deploy" and wait for deployment to complete.

### 5. Get Admin URL

Vercel will provide a URL like:
`https://fashcycle-admin.vercel.app`

---

## Phase 5: Update CORS Settings

### 1. Update Backend Environment Variables

Go back to Railway → Backend Service → Variables:

Update `CORS_ORIGINS` with your actual Vercel URLs:

```env
CORS_ORIGINS=https://fashcycle-user-web.vercel.app,https://fashcycle-admin.vercel.app
```

### 2. Redeploy Backend

Railway will automatically redeploy with the new CORS settings.

---

## Phase 6: Verify Deployment

### 1. Test Backend

Visit: `https://your-backend.railway.app/api/docs`

You should see the Swagger API documentation.

### 2. Test User Web

Visit: `https://fashcycle-user-web.vercel.app`

- Browse items
- Try search
- Test reservation flow

### 3. Test Admin Panel

Visit: `https://fashcycle-admin.vercel.app`

- Login with admin credentials
- Check dashboard
- Verify shop management

---

## Phase 7: Custom Domains (Optional)

### For Vercel Apps

1. Go to Vercel project → Settings → Domains
2. Add your custom domain (e.g., `fashcycle.com`, `admin.fashcycle.com`)
3. Follow DNS configuration instructions
4. Vercel will automatically provision SSL certificates

### For Railway Backend

1. Go to Railway project → Settings → Domains
2. Add custom domain (e.g., `api.fashcycle.com`)
3. Update DNS records as instructed
4. Update CORS_ORIGINS in Railway environment variables

---

## Continuous Deployment

Once set up, deployments are automatic:

### Backend (Railway)
- Push to `main` branch → Auto-deploys to Railway
- Check deployment status in Railway dashboard

### User Web & Admin (Vercel)
- Push to `main` branch → Auto-deploys to Vercel
- Preview deployments for pull requests
- Check deployment status in Vercel dashboard

---

## Monitoring & Logs

### Railway (Backend)
- View logs: Railway Dashboard → Backend Service → Logs
- Monitor metrics: CPU, Memory, Network

### Vercel (Frontend)
- View logs: Vercel Dashboard → Project → Deployments → View Logs
- Analytics: Vercel Analytics (free tier available)

### Supabase (Database)
- Monitor queries: Supabase Dashboard → Database → Query Performance
- Check storage: Storage → Usage

---

## Rollback Strategy

### If Backend Deployment Fails

1. Go to Railway → Deployments
2. Click on previous successful deployment
3. Click "Redeploy"

### If Frontend Deployment Fails

1. Go to Vercel → Deployments
2. Find previous successful deployment
3. Click "..." → "Promote to Production"

---

## Cost Breakdown

| Service | Free Tier | Paid (if needed) |
|---------|-----------|------------------|
| **GitHub** | Unlimited private repos | - |
| **Vercel** | 100GB bandwidth/month | $20/month Pro |
| **Railway** | $5 credit/month | $5-20/month |
| **Supabase** | 500MB database, 1GB storage | $25/month Pro |
| **Upstash** | 10K commands/day | $0.2/100K commands |
| **Razorpay** | Free (2% transaction fee) | - |

**Total**: Free for MVP, ~$30-50/month for production

---

## Security Checklist

- [ ] All `.env` files are in `.gitignore`
- [ ] Production environment variables set in Railway/Vercel
- [ ] CORS configured with actual frontend URLs
- [ ] JWT_SECRET is a strong random string
- [ ] Razorpay using live keys (not test keys)
- [ ] Supabase RLS policies enabled
- [ ] Database backups enabled in Supabase

---

## Troubleshooting

### Backend won't start on Railway

- Check logs for errors
- Verify DATABASE_URL is correct
- Ensure Prisma migrations ran successfully
- Check that all required environment variables are set

### Frontend can't connect to backend

- Verify NEXT_PUBLIC_API_URL is correct
- Check CORS_ORIGINS in backend includes frontend URL
- Test backend API directly in browser

### Database connection errors

- Verify DATABASE_URL format
- Check Supabase project is active
- Ensure IP allowlist includes Railway IPs (usually not needed)

---

## Next Steps

After successful deployment:

1. **Set up monitoring**: Add error tracking (Sentry, LogRocket)
2. **Configure analytics**: Google Analytics, Vercel Analytics
3. **Set up backups**: Automate database backups
4. **Add CI/CD tests**: GitHub Actions for automated testing
5. **Deploy Shop App**: Follow `/deploy-shop-app` workflow

---

## Useful Commands

```bash
# Check deployment status
git status
git log --oneline -5

# Force redeploy (push empty commit)
git commit --allow-empty -m "Trigger deployment"
git push

# View Railway logs
railway logs

# View Vercel logs
vercel logs
```

---

**🎉 Congratulations!** Your Fashcycle platform is now live in production!

**URLs to bookmark:**
- User Web: https://fashcycle-user-web.vercel.app
- Admin Panel: https://fashcycle-admin.vercel.app
- Backend API: https://fashcycle-backend.railway.app/api/docs
