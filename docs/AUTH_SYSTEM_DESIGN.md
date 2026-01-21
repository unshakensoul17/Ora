# Fashcycle Authentication System - Design Document

## 🎯 Authentication Strategy Overview

### Core Principles
1. **Primary Login**: Phone + Password (Fast, familiar)
2. **Email Verification**: Free OTP via Supabase (No SMS cost)
3. **Password Recovery**: Email-based (Free, secure)
4. **Immutable Identity**: Phone + Email locked after registration (Prevents fraud)

---

## 🔐 Authentication Flows

### 1. Registration Flow

**User Journey:**
```
1. User enters:
   - Shop Name
   - Owner Name
   - Phone Number (Primary ID)
   - Email Address (Recovery)
   - Password (min 8 chars)
   - Address/Locality

2. System validates:
   ✓ Phone is unique (not registered)
   ✓ Email is unique (not registered)
   ✓ Password strength (8+ chars, 1 number, 1 special char)

3. Email Verification (FREE via Supabase):
   - Send OTP to email
   - User enters 6-digit code
   - Email marked as verified

4. Account Created:
   - Status: PENDING (awaiting admin approval)
   - Phone & Email: LOCKED (cannot be changed)
   - Password: Hashed (bcrypt)
```

**Why Email OTP for Verification?**
- ✅ **FREE** (Supabase handles it)
- ✅ Confirms valid email for password recovery
- ✅ Reduces fake registrations
- ✅ No SMS cost during registration

---

### 2. Login Flow (Primary)

**Phone + Password Login:**
```
1. User enters:
   - Phone Number
   - Password

2. System validates:
   ✓ Shop exists with this phone
   ✓ Password matches (bcrypt compare)
   ✓ Shop status is ACTIVE (not PENDING/SUSPENDED)

3. Success:
   - Generate JWT token
   - Return shop data
   - Store token in SecureStore
```

**Why Phone + Password?**
- ✅ **Fast** (no waiting for OTP)
- ✅ **Offline-friendly** (works without SMS)
- ✅ **Familiar** UX (like banking apps)
- ✅ **No cost** per login

---

### 3. Password Reset Flow

**Email-based Recovery (FREE):**
```
1. User clicks "Forgot Password?"

2. User enters Phone Number

3. System finds shop by phone:
   - Retrieves associated email
   - Shows masked email: "r***@gmail.com"

4. User confirms email

5. System sends OTP to email (FREE via Supabase)

6. User enters OTP

7. User sets new password

8. Password updated in database
```

**Why Email for Recovery?**
- ✅ **FREE** (no SMS cost)
- ✅ **Secure** (email is verified during registration)
- ✅ **Standard** practice (like Google, Facebook)
- ✅ **Prevents SIM swap attacks**

---

### 4. Alternative Login: Email + OTP (Optional)

**For users who forget password:**
```
1. User clicks "Login with Email"

2. User enters Email Address

3. System sends OTP to email (FREE via Supabase)

4. User enters 6-digit OTP

5. System verifies OTP

6. User logged in (temporary session)

7. Prompt: "Set a password for faster login next time"
```

**Why Offer This?**
- ✅ **Backup** login method
- ✅ **FREE** (no SMS)
- ✅ **Passwordless** option for users who prefer it
- ✅ **Converts** to password login over time

---

## 🏗️ Database Schema Updates

### Shop Table (Updated)

```prisma
model Shop {
  id              String       @id @default(uuid())
  name            String
  ownerName       String
  ownerPhone      String       @unique  // PRIMARY LOGIN ID (IMMUTABLE)
  email           String       @unique  // RECOVERY EMAIL (IMMUTABLE)
  emailVerified   Boolean      @default(false)
  passwordHash    String       // bcrypt hash
  address         String
  locality        String
  city            String       @default("Indore")
  pincode         String
  lat             Float
  lng             Float
  status          ShopStatus   @default(PENDING)
  tier            PricingTier  @default(STARTER)
  description     String?
  images          String[]
  operatingHours  Json?
  
  // Security
  lastLoginAt     DateTime?
  passwordChangedAt DateTime?
  
  // Metadata
  verifiedAt      DateTime?
  suspendedAt     DateTime?
  suspendReason   String?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  inventoryItems  InventoryItem[]
  attributions    AttributionEvent[]

  @@index([ownerPhone])
  @@index([email])
  @@index([status])
  @@index([city, locality])
}
```

---

## 🔒 Security Features

### 1. Password Requirements
```typescript
- Minimum 8 characters
- At least 1 number
- At least 1 special character (!@#$%^&*)
- Not common passwords (123456, password, etc.)
```

### 2. Rate Limiting
```typescript
- Login attempts: 5 per 15 minutes per phone
- Password reset: 3 per hour per email
- Email OTP: 5 per hour per email
```

### 3. Account Lockout
```typescript
- After 5 failed login attempts: 15-minute lockout
- After 10 failed attempts: 1-hour lockout
- After 20 failed attempts: Account suspended (admin review)
```

### 4. Immutable Identity
```typescript
- Phone number: CANNOT be changed (prevents account takeover)
- Email: CANNOT be changed (prevents recovery hijacking)
- Rationale: If user loses phone/email, they contact support
```

### 5. Session Management
```typescript
- JWT expires after 30 days
- Refresh token for long-term sessions
- Logout invalidates token (Redis blacklist)
```

---

## 💰 Cost Analysis

### Current Proposal Costs

| Action | Provider | Cost |
|--------|----------|------|
| **Registration** | Supabase Email OTP | FREE ✅ |
| **Login** | Password (local) | FREE ✅ |
| **Password Reset** | Supabase Email OTP | FREE ✅ |
| **Alt Login** | Supabase Email OTP | FREE ✅ |

**Monthly Cost: ₹0** 🎉

### Comparison with SMS-based

| Scenario | SMS OTP | Password + Email OTP |
|----------|---------|---------------------|
| 1000 registrations | ₹200-600 | **FREE** |
| 2000 logins/month | ₹400-1200 | **FREE** |
| 100 password resets | ₹20-60 | **FREE** |
| **Total** | ₹620-1860 | **₹0** ✅ |

---

## 🎨 UX Improvements

### 1. Smart Login Screen
```
┌─────────────────────────────┐
│   🏪 Fashcycle Shop Login   │
├─────────────────────────────┤
│                             │
│  Phone Number               │
│  ┌─────────────────────┐   │
│  │ +91 9876543210      │   │
│  └─────────────────────┘   │
│                             │
│  Password                   │
│  ┌─────────────────────┐   │
│  │ ••••••••            │ 👁 │
│  └─────────────────────┘   │
│                             │
│  [ Forgot Password? ]       │
│                             │
│  ┌─────────────────────┐   │
│  │      LOGIN          │   │
│  └─────────────────────┘   │
│                             │
│  ─────── OR ───────         │
│                             │
│  [ Login with Email OTP ]   │
│                             │
│  Don't have an account?     │
│  [ Register Now ]           │
└─────────────────────────────┘
```

### 2. Registration Screen
```
┌─────────────────────────────┐
│   Register Your Shop        │
├─────────────────────────────┤
│                             │
│  Shop Name *                │
│  ┌─────────────────────┐   │
│  │ Fashion Hub         │   │
│  └─────────────────────┘   │
│                             │
│  Owner Name *               │
│  ┌─────────────────────┐   │
│  │ Rajesh Kumar        │   │
│  └─────────────────────┘   │
│                             │
│  Phone Number *             │
│  ┌─────────────────────┐   │
│  │ +91 9876543210      │   │
│  └─────────────────────┘   │
│  ⚠️ Cannot be changed later │
│                             │
│  Email Address *            │
│  ┌─────────────────────┐   │
│  │ rajesh@gmail.com    │   │
│  └─────────────────────┘   │
│  ⚠️ Cannot be changed later │
│                             │
│  Password *                 │
│  ┌─────────────────────┐   │
│  │ ••••••••            │ 👁 │
│  └─────────────────────┘   │
│  ✓ 8+ chars ✓ 1 number      │
│                             │
│  Confirm Password *         │
│  ┌─────────────────────┐   │
│  │ ••••••••            │ 👁 │
│  └─────────────────────┘   │
│                             │
│  Address *                  │
│  ┌─────────────────────┐   │
│  │ 123 MG Road         │   │
│  └─────────────────────┘   │
│                             │
│  Locality *                 │
│  ┌─────────────────────┐   │
│  │ Vijay Nagar         │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │   REGISTER          │   │
│  └─────────────────────┘   │
│                             │
│  Already registered?        │
│  [ Login ]                  │
└─────────────────────────────┘
```

### 3. Password Reset Flow
```
Step 1: Enter Phone
┌─────────────────────────────┐
│   Reset Password            │
├─────────────────────────────┤
│  Enter your phone number    │
│  ┌─────────────────────┐   │
│  │ +91 9876543210      │   │
│  └─────────────────────┘   │
│  [ Continue ]               │
└─────────────────────────────┘

Step 2: Confirm Email
┌─────────────────────────────┐
│   Verify Email              │
├─────────────────────────────┤
│  We'll send OTP to:         │
│  r***@gmail.com             │
│                             │
│  [ Send OTP ]               │
└─────────────────────────────┘

Step 3: Enter OTP
┌─────────────────────────────┐
│   Enter OTP                 │
├─────────────────────────────┤
│  Code sent to your email    │
│  ┌───┬───┬───┬───┬───┬───┐ │
│  │ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │ │
│  └───┴───┴───┴───┴───┴───┘ │
│  Resend in 0:45             │
└─────────────────────────────┘

Step 4: New Password
┌─────────────────────────────┐
│   Set New Password          │
├─────────────────────────────┤
│  New Password               │
│  ┌─────────────────────┐   │
│  │ ••••••••            │ 👁 │
│  └─────────────────────┘   │
│                             │
│  Confirm Password           │
│  ┌─────────────────────┐   │
│  │ ••••••••            │ 👁 │
│  └─────────────────────┘   │
│  [ Reset Password ]         │
└─────────────────────────────┘
```

---

## 🚀 Implementation Plan

### Phase 1: Backend (2-3 hours)
1. ✅ Update Prisma schema (add email, passwordHash, emailVerified)
2. ✅ Integrate Supabase Auth for email OTP
3. ✅ Create password hashing utilities (bcrypt)
4. ✅ Update auth endpoints:
   - POST /auth/shop/register (with email verification)
   - POST /auth/shop/login (phone + password)
   - POST /auth/shop/login-email (email + OTP)
   - POST /auth/shop/forgot-password
   - POST /auth/shop/reset-password
   - POST /auth/shop/verify-email
5. ✅ Add rate limiting middleware
6. ✅ Add password validation

### Phase 2: Shop App (3-4 hours)
1. ✅ Update LoginScreen (phone + password)
2. ✅ Create RegisterScreen (with email verification)
3. ✅ Create ForgotPasswordScreen
4. ✅ Create ResetPasswordScreen
5. ✅ Add password strength indicator
6. ✅ Add "Login with Email" option
7. ✅ Update auth store

### Phase 3: Testing (1 hour)
1. ✅ Test registration flow
2. ✅ Test login flow
3. ✅ Test password reset
4. ✅ Test email OTP delivery
5. ✅ Test rate limiting

**Total Time: 6-8 hours**

---

## 📋 Migration Strategy

### For Existing Shops (if any)

```typescript
// Migration script
1. Add email field to existing shops (prompt via app)
2. Send email verification OTP
3. Force password creation on next login
4. Lock phone + email after verification
```

---

## ✅ Benefits Summary

### Cost
- ✅ **₹0/month** (vs ₹400-1860 with SMS)
- ✅ Unlimited logins
- ✅ Unlimited password resets

### Security
- ✅ Password-based (offline-capable)
- ✅ Email verified (prevents fake accounts)
- ✅ Immutable identity (prevents fraud)
- ✅ Rate limiting (prevents brute force)

### UX
- ✅ Fast login (no OTP wait)
- ✅ Familiar flow (like banking apps)
- ✅ Backup method (email OTP)
- ✅ Easy recovery (email-based)

### Scalability
- ✅ No per-login cost
- ✅ Works offline
- ✅ Production-ready
- ✅ Enterprise-grade security

---

## 🎯 Ready to Implement?

This design gives you:
- **FREE** authentication (no SMS costs)
- **Better UX** (faster logins)
- **Higher security** (verified emails, strong passwords)
- **Fraud prevention** (immutable phone/email)

Shall I proceed with implementation?
