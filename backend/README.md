# Fashcycle Backend

Vertical SaaS + O2O Marketplace API for fashion rental boutiques.

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose

### Development Setup

1. **Start infrastructure services:**
   ```bash
   docker-compose up -d postgres redis meilisearch
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment:**
   ```bash
   cp .env.example .env
   ```

4. **Run database migrations:**
   ```bash
   npx prisma migrate dev
   ```

5. **Seed the database:**
   ```bash
   npm run seed
   ```

6. **Start the API:**
   ```bash
   npm run start:dev
   ```

7. **Access API docs:**
   Open http://localhost:3000/api/docs

## Full Docker Setup

```bash
docker-compose up -d
```

This starts all services including the API at http://localhost:3000.

## API Endpoints

### Auth
- `POST /api/v1/auth/user/send-otp` - Send OTP to user
- `POST /api/v1/auth/user/verify-otp` - Verify user OTP
- `POST /api/v1/auth/shop/send-otp` - Send OTP to shop
- `POST /api/v1/auth/shop/verify-otp` - Verify shop OTP

### Shops
- `POST /api/v1/shops/register` - Register shop
- `GET /api/v1/shops/:id` - Get shop details
- `GET /api/v1/shops/:id/dashboard` - Shop dashboard stats

### Inventory
- `GET /api/v1/inventory/marketplace` - Browse items
- `GET /api/v1/inventory/:id` - Item details
- `POST /api/v1/inventory/shop/:shopId` - Add item
- `PATCH /api/v1/inventory/:id` - Update item

### Bookings
- `POST /api/v1/bookings/hold` - Create hold (Reserve for Trial)
- `POST /api/v1/bookings/verify-qr` - Verify QR (O2O handshake)
- `PATCH /api/v1/bookings/:id/cancel` - Cancel hold
- `PATCH /api/v1/bookings/:id/pickup` - Mark picked up
- `PATCH /api/v1/bookings/:id/return` - Mark returned

### Calendar
- `GET /api/v1/calendar/item/:id` - Item calendar
- `GET /api/v1/calendar/item/:id/availability` - Check availability

### Search
- `GET /api/v1/search?q=...` - Search items
- `GET /api/v1/search/suggestions?q=...` - Autocomplete

### Attribution
- `GET /api/v1/attribution/shop/:id/stats` - Shop lead stats
- `GET /api/v1/attribution/admin/stats` - Platform stats

## Project Structure

```
src/
├── main.ts                 # Entry point
├── app.module.ts           # Root module
├── prisma/                 # Database service
├── redis/                  # Redis service (locking)
└── modules/
    ├── auth/               # OTP authentication
    ├── shops/              # Shop management
    ├── inventory/          # Inventory CRUD
    ├── calendar/           # Availability engine
    ├── bookings/           # Holds & rentals
    ├── search/             # MeiliSearch
    └── attribution/        # Lead tracking
```

## Key Features

- **Calendar Engine**: D-1 pickup / D+1 return buffer blocks
- **Redis Locking**: Prevents double-booking with 4-hour TTL
- **QR Verification**: O2O handshake for attribution
- **Shop Masking**: Identity hidden until verified walk-in
- **Lead Billing**: ₹50 per verified QR scan
