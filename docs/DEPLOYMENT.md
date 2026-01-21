# Fashcycle Deployment Guide
## Free Stack (Supabase + Railway + Vercel)

This guide walks you through deploying Fashcycle to production using the free stack.

## Prerequisites

- GitHub account with repository access
- Supabase account (free tier)
- Upstash account (free tier)
- Railway account ($5 credit)
- Vercel account (free tier)
- Razorpay account (for payments)

## Step 1: Supabase Setup

1. **Create Project**
   ```
   supabase.com → New Project → fashcycle-prod
   Region: ap-south-1 (Mumbai)
   ```

2. **Get Credentials**
   - Go to Settings → API
   - Copy: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - Go to Settings → Database
   - Copy: `DATABASE_URL` (pooling), `DIRECT_URL`

3. **Create Storage Buckets**
   ```sql
   -- Run in SQL Editor
   INSERT INTO storage.buckets (id, name, public)
   VALUES 
     ('inventory-images', 'inventory-images', true),
     ('shop-photos', 'shop-photos', true),
     ('damage-photos', 'damage-photos', false),
     ('user-avatars', 'user-avatars', true);
   ```

## Step 2: Upstash Redis

1. **Create Database**
   ```
   upstash.com → Redis → Create Database
   Name: fashcycle-redis
   Region: ap-south-1 (Mumbai)
   Type: Regional
   ```

2. **Get Credentials**
   - Copy: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

## Step 3: Railway Backend

1. **Connect Repository**
   ```
   railway.app → New Project → Deploy from GitHub
   Select: fashcycle repository
   Root Directory: backend
   ```

2. **Add Environment Variables**
   - Copy all variables from `backend/.env.example`
   - Fill in actual values

3. **Run Migrations**
   ```bash
   # In Railway terminal
   npx prisma migrate deploy
   ```

4. **Get URL**
   - Settings → Domains → Copy Railway URL
   - Optional: Add custom domain

## Step 4: Vercel Frontends

### User Web
```
vercel.com → Import → Select repo
Root: user-web
Framework: Next.js
Environment Variables: Copy from user-web/.env.example
```

### Admin Panel
```
vercel.com → Import → Select repo
Root: admin
Framework: Next.js
Environment Variables: Copy from admin/.env.example
```

## Step 5: Configure CORS

Update backend CORS_ORIGINS in Railway:
```
CORS_ORIGINS=https://fashcycle.vercel.app,https://admin-fashcycle.vercel.app
```

## Step 6: Verify Deployment

1. Test API: `https://your-railway-url.railway.app/api/v1/health`
2. Test User Web: `https://fashcycle.vercel.app`
3. Test Admin: `https://admin-fashcycle.vercel.app`

## Troubleshooting

### Database Connection Issues
- Ensure Supabase project is active
- Check DATABASE_URL has correct password
- Use pooler URL (port 6543) for serverless

### Redis Connection Issues
- Verify Upstash credentials
- Check regional endpoint matches

### CORS Errors
- Add frontend URLs to CORS_ORIGINS
- Restart Railway service
