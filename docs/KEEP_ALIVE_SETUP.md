# Backend Keep-Alive Setup Guide

## Problem
Render Free Tier spins down services after **15 minutes of inactivity**, causing:
- 30-60 second cold start delay
- Poor user experience
- API timeouts

## Solution: Dual Keep-Alive System

We use **two** complementary solutions for maximum reliability:
1. **UptimeRobot** (Primary) - External monitoring service
2. **GitHub Actions** (Backup) - Cron job in your repository

---

## 🎯 Solution 1: UptimeRobot (PRIMARY)

### Setup Steps (5 minutes)

#### 1. Create Account
- Go to: [https://uptimerobot.com/signUp](https://uptimerobot.com/signUp)
- Sign up with your email (free tier is unlimited)
- Verify your email

#### 2. Add New Monitor
Once logged in:
1. Click **"+ Add New Monitor"** button
2. Fill in the form:

   ```
   Monitor Type: HTTP(s)
   Friendly Name: ORA Backend
   URL (or IP): https://ora-backend-5608.onrender.com/api/v1/shops/admin/list
   Monitoring Interval: Every 5 minutes
   Monitor Timeout: 30 seconds
   ```

3. **Alert Contacts** (optional but recommended):
   - Add your email
   - Get notified if backend goes down
   - Set threshold: "Alert when down for 2 minutes"

4. Click **"Create Monitor"**

#### 3. Verify It's Working
- Monitor should show "Up" status within 5 minutes
- You'll see response time graph
- Check "Logs" tab to see ping history

### What This Does
- ✅ Pings your backend every 5 minutes
- ✅ Keeps Render service "warm" 24/7
- ✅ Monitors uptime and alerts you if down
- ✅ Shows response time analytics
- ✅ Completely free forever

---

## 🔄 Solution 2: GitHub Actions (BACKUP)

### Setup Steps (Already Done! ✅)

The workflow file is already created at:
```
.github/workflows/keep-alive.yml
```

### Enable GitHub Actions (If Not Already Enabled)

1. Go to your GitHub repository: [https://github.com/unshakensoul17/ORA-](https://github.com/unshakensoul17/ORA-)
2. Click **Actions** tab
3. If you see "Workflows disabled", click **"I understand my workflows, go ahead and enable them"**
4. You should see **"Keep Backend Alive"** workflow

### Verify It's Running

1. Go to **Actions** tab
2. Click **"Keep Backend Alive"** in left sidebar
3. You should see scheduled runs every 5 minutes
4. Click any run to see logs

### Manual Trigger (Optional)

You can manually trigger the workflow:
1. Go to **Actions** → **Keep Backend Alive**
2. Click **"Run workflow"** dropdown
3. Click **"Run workflow"** button

### What This Does
- ✅ Runs every 5 minutes via GitHub's cron scheduler
- ✅ Pings backend automatically
- ✅ No external service dependency
- ✅ Version controlled and auditable
- ✅ Free with GitHub (2,000 minutes/month)

---

## 🔍 Monitoring & Verification

### UptimeRobot Dashboard
- **URL:** [https://uptimerobot.com/dashboard](https://uptimerobot.com/dashboard)
- **What to check:**
  - Monitor status (should be green/up)
  - Response time (should be 200-800ms)
  - Uptime percentage (target: 99.9%+)
  - Last check time (should be within last 5 minutes)

### GitHub Actions Dashboard
- **URL:** [https://github.com/unshakensoul17/ORA-/actions](https://github.com/unshakensoul17/ORA-/actions)
- **What to check:**
  - Workflow runs (should be every 5 minutes)
  - Status (should be green checkmarks)
  - Logs show successful curl command

### Render Dashboard
- **URL:** [https://dashboard.render.com/](https://dashboard.render.com/)
- **What to check:**
  - Service status: "Live" (not "Sleeping")
  - Recent activity in logs
  - No spin-down messages

---

## 📊 Expected Behavior

### Before Keep-Alive Setup
```
User Request → Backend (sleeping) → 30-60s cold start → Response
Next request (16+ min later) → Backend sleeping again → Cold start
```

### After Keep-Alive Setup
```
UptimeRobot (every 5 min) → Backend stays warm
GitHub Actions (every 5 min) → Backup ping
User Request → Backend (already warm) → Instant response (<500ms)
```

---

## 🛠️ Troubleshooting

### UptimeRobot shows "Down" status

**Check 1: Is the URL correct?**
```bash
curl -I https://ora-backend-5608.onrender.com/api/v1/shops/admin/list
```
Should return: `HTTP/2 200`

**Check 2: Is Render service running?**
- Go to Render dashboard
- Check if service is "Live"
- Check logs for errors

**Check 3: Monitor timeout too short?**
- Increase timeout to 30 seconds
- Cold starts can take 20-30 seconds

### GitHub Actions not running

**Check 1: Are workflows enabled?**
- Go to Settings → Actions → General
- Ensure "Allow all actions and reusable workflows" is selected

**Check 2: Is the schedule correct?**
- GitHub Actions might have a delay (up to 10 minutes)
- Check last run time in Actions tab

**Check 3: Manual trigger**
- Try running workflow manually
- Check logs for errors

### Backend still spinning down

**Check 1: Ping frequency**
- UptimeRobot: Every 5 minutes (max for free tier)
- GitHub Actions: Every 5 minutes
- One of them should hit before 15-minute timeout

**Check 2: Both services running?**
- Verify UptimeRobot shows recent pings
- Verify GitHub Actions shows recent runs

**Check 3: Render logs**
- Look for "Spinning down" messages
- If you see them, investigate which service failed

---

## 💰 Cost Analysis

| Service | Free Tier | Paid Tier | Recommendation |
|---------|-----------|-----------|----------------|
| UptimeRobot | 50 monitors, 5 min interval | $7/mo for 1 min interval | Free is perfect |
| GitHub Actions | 2,000 min/month | $0.008/min beyond | Free is enough |
| **Total** | **$0/month** | - | **Stay on free!** |

---

## 📈 Performance Impact

### Before Keep-Alive
- First request: **30-60 seconds** (cold start)
- Subsequent requests: **200-500ms** (warm)
- Spin-down after: **15 minutes**

### After Keep-Alive
- All requests: **200-500ms** (always warm)
- Spin-down: **Never** (kept alive)
- User experience: **Instant** ⚡

---

## 🎯 Quick Checklist

- [x] GitHub Actions workflow created and pushed
- [ ] UptimeRobot account created
- [ ] Monitor added for backend URL
- [ ] Email alerts configured
- [ ] Verify monitor status is "Up"
- [ ] Check GitHub Actions are running
- [ ] Test backend response time
- [ ] Confirm no more cold starts

---

## 📱 Mobile App Integration (Optional)

**UptimeRobot Mobile App:**
- iOS: [App Store](https://apps.apple.com/app/uptimerobot/id1104878581)
- Android: [Play Store](https://play.google.com/store/apps/details?id=com.uptimerobot)

Get push notifications if your backend goes down!

---

## Support & Resources

- **UptimeRobot Docs:** [https://uptimerobot.com/help](https://uptimerobot.com/help)
- **GitHub Actions Docs:** [https://docs.github.com/actions](https://docs.github.com/actions)
- **Render Status:** [https://status.render.com](https://status.render.com)

---

**Status:**
- ✅ GitHub Actions: Deployed and Active
- ⏳ UptimeRobot: Waiting for setup (5 minutes)

**Next Step:** Set up UptimeRobot following the instructions above!
