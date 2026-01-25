#!/bin/bash
# Free Production Deployment Script

echo "🔧 Ensuring tools are ready..."
# We use local verified versions to avoid npx installation prompts
npm install --save-dev eas-cli vercel

# 1. Web Build & Deploy
echo "🌐 Building Web App (PWA)..."
npx expo export --platform web

echo "🚀 Deploying Web to Vercel..."
# This will deploy the ./dist folder
# If valid tokens are present, it proceeds. Otherwise it will prompt.
npx vercel deploy --prod ./dist

# 2. Android Build
echo "🤖 Building Android APK (Production)..."
echo "Note: If you are not logged in, run 'npx eas login' first."
npx eas build --platform android --profile production

echo "✅ Done! Check the links above."
