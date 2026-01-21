# Free Tier SMS Authentication Options

## 1. Firebase Authentication (The "Free-est" Option)
Firebase is famous for its generous free tier, but it has changed recently.

- **Free Limit**: historically **10,000 free verifications/month**.
- **Current Status**: Now part of Google Cloud Identity Platform. The first 50,000 MAUs are free, **BUT** SMS costs might incur charges depending on the region.
- **Pros**: Handles SMS delivery for you (no separate Twilio account needed usually).
- **Cons**: Harder to integrate with Supabase database (you'd split auth across two systems).

## 2. Supabase Auth (Best Integrated Option)
- **Supabase Service**: **FREE** (up to 50,000 MAU).
- **SMS Costs**: **NOT Free**. You must bring your own provider (Twilio, MessageBird, Vonage).
- **Control**: You can set **Daily Limits** to control costs.
  - Rate limiting is built-in (e.g., max 30 OTPs/hour).
  - You can configure this in the Dashboard to prevent billing shock.

## 3. The "Cheapest Paid" Option: Custom + MSG91 (Recommended)
As analyzed before, this is likely your best bet for India.

- **Cost**: ₹0.20 per SMS (~$0.002)
- **Daily Limit**: You implement it yourself in code (we already have constraints).
- **Free Credits**: MSG91 often gives startup credits.

---

## 💡 Recommendation

Since you are already using **Supabase** for database:

**Stick to Supabase Auth + Custom Provider (MSG91)** or **Custom Auth + MSG91**.

### Why not Firebase?
Mixing **Firebase Auth** + **Supabase Database** creates complex "Row Level Security" issues. You'd have to sync Firebase users to Supabase to make your security rules work. **Not worth the hassle** just to save ₹400/month.

### How to Control Costs with Supabase
If you use Supabase Auth with Twilio/MSG91, you can set strict rate limits in the **Supabase Dashboard > Auth > Rate Limits**:
- **SMS Limit**: e.g. 100 per hour
- **OTP Expiry**: 5 minutes

### Final Verdict
There is **no completely free** unlimited SMS provider for production due to telecom costs.
- **Cheapest**: Custom Auth + MSG91 (₹0.20/SMS).
- **Easiest**: Supabase Auth + Twilio (₹0.60/SMS).
- **"Free Tier" Trap**: Firebase has a free tier but integrating it with Supabase eliminates the savings due to dev complexity.
