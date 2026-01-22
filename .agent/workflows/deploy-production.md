---
description: Deploy Fashcycle to Production (GitHub + Vercel + Render)
---

# Deploy Fashcycle to Production

This workflow guides you through deploying the complete Fashcycle platform:
- **Backend** → Render
- **User Web** → Vercel
- **Admin Panel** → Vercel
- **Code Repository** → GitHub

## Prerequisites

Before starting, ensure you have:
- [ ] GitHub account (free)
- [ ] Vercel account (free) - https://vercel.com
- [ ] Render account (free tier available) - https://render.com
- [ ] Supabase project created - https://supabase.com
- [ ] Upstash Redis database created - https://upstash.com
- [ ] Razorpay account (test mode) - https://razorpay.com

---

## Phase 1: Push to GitHub

### 1. Initialize Git Repository (If not already done)

```bash
cd /home/unshakensoul/Antigarvity/fashcycle
git init
git add .
git commit -m "Initial commit"
```

### 2. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `fashcycle`
3. Keep it **Private**
4. Click "Create repository"

### 3. Push to GitHub

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/fashcycle.git
git branch -M main
git push -u origin main
```

---

## Phase 2: Deploy Backend to Render

### 1. Login to Render

Go to https://render.com and sign in with GitHub.

### 2. Create New Blueprint Instance

1. Click "New +" button and select "Blueprint"
2. Connect your `fashcycle` GitHub repository
3. Render will detect the `render.yaml` file automatically

### 3. Configure Environment Variables

Render will ask you to fill in the values for the environment variables defined in `render.yaml`:

- **DATABASE_URL**: From Supabase (Transaction Pooler URL Port 6543)
- **DIRECT_URL**: From Supabase (Session Pooler URL Port 5432)
- **SUPABASE_URL**: Your Supabase Project URL
- **SUPABASE_ANON_KEY**: Your Supabase Anon Key
- **SUPABASE_SERVICE_ROLE_KEY**: Your Supabase Service Role Key
- **UPSTASH_REDIS_REST_URL**: From Upstash Console
- **UPSTASH_REDIS_REST_TOKEN**: From Upstash Console
- **JWT_SECRET**: Generate a secure random string (min 32 chars)
- **RAZORPAY_KEY_ID**: Live or Test Key ID
- **RAZORPAY_KEY_SECRET**: Live or Test Secret
- **RAZORPAY_WEBHOOK_SECRET**: Webhook secret
- **GOOGLE_MAPS_API_KEY**: Your Google Maps API Key
- **CORS_ORIGINS**: `http://localhost:3001,http://localhost:3002` (Update this later with Vercel URLs)

### 4. Deploy Backend

Click "Apply" or "Create Web Service". Render will start the build process:
1. `npm install`
2. `npx prisma generate`
3. `npm run build`

And the start command:
1. `npx prisma migrate deploy`
2. `npm run start:prod`

### 5. Get Backend URL

Once deployed, Render will provide a URL like:
`https://fashcycle-backend.onrender.com`

**Note**: The free tier on Render spins down after inactivity. The first request might take 50s+ to wake it up.

---

## Phase 3: Deploy User Web to Vercel

### 1. Login to Vercel

Go to https://vercel.com and sign in with GitHub.

### 2. Import Project

1. Click "Add New..." → "Project"
2. Import your `fashcycle` repository
3. Vercel will detect it's a monorepo

### 3. Configure User Web Deployment

1. You will see "Build and Output Settings" (or similar).
2. Look for **Root Directory**.
3. It might show `./` by default. Click **Edit** next to it.
4. Select `user-web` from the file browser, or manually type `user-web`.
5. Click **Continue**.
6. Vercel should now detect the **Next.js** framework automatically.

### 4. Add Environment Variables

In Vercel project settings → Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-api-key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
NEXT_PUBLIC_APP_NAME=Fashcycle
NEXT_PUBLIC_HOLD_DEPOSIT=99
```

### 5. Deploy

Click "Deploy" and wait for completion.
Vercel will provide a URL like: `https://fashcycle-user-web.vercel.app`

---

## Phase 4: Deploy Admin Panel to Vercel

### 1. Import Project Again

1. In Vercel, click "Add New..." → "Project"
2. Import your `fashcycle` repository again

### 2. Configure Admin Deployment

1. **Project Name**: `fashcycle-admin`
2. Look for **Root Directory**.
3. Click **Edit**.
4. Select `admin` or manually type `admin`.
5. Click **Continue**.
6. Framework Preset should auto-switch to **Next.js**.

### 3. Add Environment Variables

```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_ADMIN_MODE=true
```

### 4. Deploy

Click "Deploy" and wait for completion.
Vercel will provide a URL like: `https://fashcycle-admin.vercel.app`

---

## Phase 5: Update Backend CORS

### 1. Update Render Environment Variables

1. Go to Render Dashboard → fashcycle-backend → Environment
2. Update `CORS_ORIGINS`:

```env
CORS_ORIGINS=https://fashcycle-user-web.vercel.app,https://fashcycle-admin.vercel.app
```

3. Save Changes. Render will automatically redeploy.

---

## Phase 6: Verify Deployment

1. **Test Backend**: Visit `https://your-backend.onrender.com/api/docs` (Swagger UI).
2. **Test User Web**: Browse items, attempt a search.
3. **Test Admin Panel**: Login and view dashboard.

---

## Troubleshooting

### Render Build Fails
- Check logs in the "Events" or "Logs" tab.
- Ensure `npx prisma generate` is running before build.
- Ensure `DATABASE_URL` is accessible.

### "Service Unavailable" or 502
- Check if the service is healthy.
- Check logs for startup errors (e.g., database connection failure).
- Ensure `PORT` env var is set to `10000` (Render's default is usually 10000, but our app defaults to 3000 unless specified).

### CORS Errors
- Double check `CORS_ORIGINS` in Render config.
- Ensure no trailing slashes in the origin URLs.

---

**URLs to bookmark:**
- User Web: https://fashcycle-user-web.vercel.app
- Admin Panel: https://fashcycle-admin.vercel.app
- Backend API: https://fashcycle-backend.onrender.com/api/docs
