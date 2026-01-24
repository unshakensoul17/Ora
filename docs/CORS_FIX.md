# CORS and Backend Connection Fix

## Problem
The admin panel deployed to Vercel (`fashcycle-admin.vercel.app`) cannot connect to the backend deployed on Render (`fashcycle-backend-5608.onrender.com`) due to:

1. **CORS blocking**: Missing `Access-Control-Allow-Origin` header
2. **404 errors**: Backend not responding to API calls

## Root Cause Analysis

### Issue 1: CORS Configuration
The backend's CORS is only configured for localhost origins, not production URLs:
- ❌ `http://localhost:3001` (development)
- ❌ `http://localhost:3002` (development)
- ✅ `https://fashcycle-admin.vercel.app` (MISSING)
- ✅ `https://fashcycle.vercel.app` (user web - MISSING)

### Issue 2: Environment Variable Not Set
The `CORS_ORIGINS` environment variable in Render needs to include production URLs.

## Solution

### Step 1: Update Backend CORS Configuration ✅ DONE
File: `backend/src/main.ts`

The backend now dynamically loads CORS origins from the `CORS_ORIGINS` environment variable. This has been updated in the code.

### Step 2: Update Render Environment Variables

1. Go to **Render Dashboard** → Your Backend Service (`fashcycle-backend-5608`)
2. Navigate to **Environment** tab
3. Find or add `CORS_ORIGINS` variable
4. Set the value to:
   ```
   https://fashcycle-admin.vercel.app,https://fashcycle.vercel.app,http://localhost:3001,http://localhost:3002
   ```
5. Click **Save Changes**
6. The service will automatically redeploy

### Step 3: Verify Backend is Running

1. Check if backend is accessible:
   ```bash
   curl https://fashcycle-backend-5608.onrender.com/api/v1/shops/admin/list
   ```

2. You should see either:
   - JSON response with shops data
   - 401 Unauthorized (expected, as admin routes might need auth)
   - NOT: 404 Not Found

### Step 4: Update Admin Panel Environment Variables

1. Go to **Vercel Dashboard** → `fashcycle-admin` project
2. Navigate to **Settings** → **Environment Variables**
3. Ensure `NEXT_PUBLIC_API_URL` is set to:
   ```
   https://fashcycle-backend-5608.onrender.com/api/v1
   ```
4. Click **Save**
5. Trigger a new deployment (or it will redeploy automatically)

### Step 5: Update User Web Environment Variables

1. Go to **Vercel Dashboard** → `fashcycle` (user-web) project
2. Navigate to **Settings** → **Environment Variables**
3. Ensure `NEXT_PUBLIC_API_URL` is set to:
   ```
   https://fashcycle-backend-5608.onrender.com/api/v1
   ```
4. Click **Save**

## Expected Behavior After Fix

1. ✅ Admin panel can fetch shops data
2. ✅ No CORS errors in browser console
3. ✅ API requests return data successfully
4. ✅ Console should show:
   ```
   🌐 CORS enabled for origins: [
     'https://fashcycle-admin.vercel.app',
     'https://fashcycle.vercel.app',
     'http://localhost:3001',
     'http://localhost:3002'
   ]
   ```

## Troubleshooting

### If 404 Errors Persist

**Check 1: Is the backend service active?**
- Go to Render dashboard
- Check if service status is "Live"
- Check deploy logs for errors

**Check 2: Is the database migrated?**
```bash
# In Render Shell
npx prisma migrate deploy
```

**Check 3: Is the API prefix correct?**
- Backend uses `/api/v1` prefix
- Admin calls `/shops/admin/list`
- Full URL: `https://[backend]/api/v1/shops/admin/list`

### If CORS Errors Persist

**Check 1: Verify CORS_ORIGINS is set correctly**
```bash
# In Render Shell, run:
echo $CORS_ORIGINS
```

Should output:
```
https://fashcycle-admin.vercel.app,https://fashcycle.vercel.app,http://localhost:3001,http://localhost:3002
```

**Check 2: Check backend logs**
Look for the line:
```
🌐 CORS enabled for origins: [...]
```

**Check 3: Verify backend deployment**
- After updating `CORS_ORIGINS`, Render should auto-redeploy
- Check "Events" tab to confirm deployment completed
- New deploy should take 2-5 minutes

### If Admin Authentication Issues

The admin endpoints might require authentication. Check if:
1. Admin routes need a JWT token
2. You need to implement admin login first
3. Or temporarily remove auth guards for testing

## Quick Command Checklist

```bash
# Test backend health
curl https://fashcycle-backend-5608.onrender.com/api/v1/shops/admin/list

# Test CORS with headers
curl -H "Origin: https://fashcycle-admin.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://fashcycle-backend-5608.onrender.com/api/v1/shops/admin/list

# Expected response should include:
# access-control-allow-origin: https://fashcycle-admin.vercel.app
```

## Next Steps

1. ✅ Update `CORS_ORIGINS` in Render
2. ✅ Wait for Render to redeploy (check Events tab)
3. ✅ Verify admin panel can now connect
4. ✅ Test all API endpoints
5. ✅ Repeat for user-web if needed

## Files Modified

- ✅ `backend/src/main.ts` - Dynamic CORS configuration
- `backend/.env.example` - Already has `CORS_ORIGINS` documented
- `render.yaml` - Already has `CORS_ORIGINS` env var defined

## Production URLs Summary

| Service | URL | Purpose |
|---------|-----|---------|
| Backend | `https://fashcycle-backend-5608.onrender.com` | API Server |
| Admin | `https://fashcycle-admin.vercel.app` | Admin Panel |
| User Web | `https://fashcycle.vercel.app` | Customer Portal |
| API Base | `https://fashcycle-backend-5608.onrender.com/api/v1` | API Endpoint |

---

**Status:** Backend code updated ✅  
**Action Required:** Update Render environment variable `CORS_ORIGINS`
