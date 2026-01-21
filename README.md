# Fashcycle

> **Vertical SaaS + Hyper-Local O2O Marketplace** for fashion rental boutiques in Indore, India.

A "Digital Munim" (digital accountant) that helps unorganized rental shops manage inventory, handle bookings, and convert online discovery into verified walk-ins using QR-based attribution.

---

## 🎯 What This Is

- ✅ **Vertical SaaS OS** — Calendar & inventory control for rental shops
- ✅ **O2O Marketplace** — Discover online → Reserve → Walk-in to try
- ✅ **Closed-Loop Attribution** — QR scan verifies lead, triggers billing

**NOT** an e-commerce checkout, delivery platform, or phone directory.

---

## 🏗️ Architecture

```
fashcycle/
├── backend/          # NestJS API (Node.js)
├── shop-app/         # React Native (Android-first)
├── user-web/         # Next.js (Consumer marketplace)
├── admin/            # Next.js (Admin console)
├── shared/           # Shared types
├── seed/             # Indore seed data
└── docs/             # Documentation
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose

### 1. Start Infrastructure
```bash
cd backend
docker-compose up -d postgres redis meilisearch
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run seed
npm run start:dev
```
API available at http://localhost:3000/api/docs

### 3. Start User Web
```bash
cd user-web
npm install
npm run dev
```
Available at http://localhost:3001

### 4. Start Admin Console
```bash
cd admin
npm install
npm run dev
```
Available at http://localhost:3002

### 5. Run Shop App
```bash
cd shop-app
npm install
npx expo start
```

---

## 📱 Core O2O Flow

```
1. User browses marketplace (shop identity masked)
2. User clicks "Reserve for Trial" → 4-hour hold created
3. User receives QR code + shop location
4. User walks to shop
5. Shop scans QR → Verified! Lead is billable.
6. User tries outfit → pays if they like it
```

---

## 💰 Monetization

| Tier | Price | Details |
|------|-------|---------|
| Starter | Free | ≤50 items, calendar + inventory |
| Pro | ₹299/mo | Unlimited items |
| Pay-Per-Lead | ₹50/scan | Per verified QR walk-in |

**Rule**: No charge without verified offline value.

---

## 🔑 Key Features

### Backend (NestJS)
- **Calendar Engine**: D-1 pickup / D+1 return buffer blocks
- **Redis Locking**: Prevents double-booking (4hr TTL)
- **QR Verification**: O2O handshake for attribution
- **MeiliSearch**: Fast product search

### Shop App (React Native)
- OTP login
- Inventory management
- Visual calendar
- QR scanner for verification
- Hold management

### User Web (Next.js)
- Product-first search
- Shop masking (identity hidden pre-hold)
- Reserve for Trial flow
- QR display with countdown

### Admin Console (Next.js)
- Shop approval/suspension
- Lead tracking & billing
- Revenue dashboards

---

## 📊 Database Models

| Model | Purpose |
|-------|---------|
| `User` | Consumer accounts |
| `Shop` | Rental boutiques |
| `InventoryItem` | Rental items (time-based, not quantity) |
| `AvailabilityBlock` | Calendar blocks (if date exists → unavailable) |
| `Booking` | Holds & rentals |
| `AttributionEvent` | Verified walk-ins (billable leads) |

---

## 🛠️ Tech Stack

- **Backend**: Node.js, NestJS, Prisma
- **Database**: PostgreSQL
- **Cache/Locking**: Redis
- **Search**: MeiliSearch
- **Shop App**: React Native (Expo)
- **Web Apps**: Next.js 14
- **Payments**: Razorpay (integration ready)

---

## 📁 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /auth/user/send-otp` | Send OTP to user |
| `GET /inventory/marketplace` | Browse items |
| `POST /bookings/hold` | Create a hold |
| `POST /bookings/verify-qr` | Verify QR (O2O handshake) |
| `GET /calendar/item/:id` | Get item calendar |
| `GET /attribution/shop/:id/stats` | Shop lead stats |

Full API docs at `/api/docs` (Swagger)

---

## 📍 Seed Data

10 pre-approved shops in Indore localities:
- Vijay Nagar, Sapna Sangeeta, Palasia, Rajwada
- MG Road, South Tukoganj, New Palasia, Bhawarkuan, Ring Road

Each shop has 5-10 inventory items.

---

## 🚧 What's NOT Included

- ❌ Delivery/logistics
- ❌ Full online checkout
- ❌ AI recommendations
- ❌ Multi-city (Day 1)

---

## 🚀 Deployment

### Production Deployment Documentation

Complete guides for deploying all Fashcycle applications to production:

- **[Deployment Overview](docs/DEPLOYMENT_OVERVIEW.md)** - Start here for complete deployment roadmap
- **[Backend + Web Apps Deployment](docs/DEPLOYMENT.md)** - Deploy backend, user web, and admin console
- **[Shop App Deployment Guide](docs/SHOP_APP_DEPLOYMENT.md)** - Comprehensive guide for mobile app deployment
- **[Shop App Deployment Checklist](docs/SHOP_APP_DEPLOYMENT_CHECKLIST.md)** - Task-by-task checklist

### Quick Commands

```bash
# Deploy Shop App (Android)
cd shop-app
eas build --platform android --profile production

# Deploy Shop App (iOS)
eas build --platform ios --profile production

# OTA Update (after initial release)
eas update --branch production --message "Bug fixes"
```

See `/deploy-shop-app` workflow for detailed steps.

---

## 📄 License

Private / Proprietary
