#!/bin/bash

echo "🔍 Pre-build Checklist"
echo "======================"
echo ""

# Check API configuration
echo "✓ Checking API configuration..."
grep "API_BASE_URL" shop-app/src/api/config.ts
echo ""

# Check if backend is accessible
echo "✓ Testing backend connectivity..."
curl -I https://fashcycle-backend-5608.onrender.com/api/v1/shops/admin/list 2>&1 | head -5
echo ""

# Check package.json
echo "✓ Checking dependencies..."
cd shop-app
npm list expo expo-secure-store react-native 2>&1 | grep -E "expo@|expo-secure-store@|react-native@"
echo ""

echo "✓ Starting build..."
npx eas build --platform android --profile production
