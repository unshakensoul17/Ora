# Multi-stage build for production
FROM node:22-alpine AS builder

# Install build dependencies for native modules and Prisma
RUN apk add --no-cache openssl libc6-compat python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine

# Install OpenSSL and libc6-compat (required by Prisma)
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm install --omit=dev

# Copy Prisma schema and generate client
RUN npx prisma generate

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port (Render uses PORT env var, defaults to 10000)
EXPOSE ${PORT:-10000}

# Start command (migrations + start)
CMD sh -c "npx prisma migrate deploy && node dist/src/main.js"
