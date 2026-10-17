#!/bin/bash
# GlobalWeb Studio - Android APK Build Helper Script
set -e

echo "============================================="
echo "   GlobalWeb Studio - Android APK Builder    "
echo "============================================="

echo "Step 1: Installing Capacitor Android dependencies..."
npm install @capacitor/core @capacitor/android @capacitor/cli --save

echo "Step 2: Building production web assets..."
npm run build

echo "Step 3: Initializing / Syncing Android platform..."
if [ ! -d "android" ]; then
  npx cap add android
fi
npx cap sync android

echo "Step 4: Opening Android Studio to compile APK..."
echo "In Android Studio:"
echo "1. Wait for Gradle sync to complete."
echo "2. Go to: Build > Build Bundle(s) / APK(s) > Build APK(s)"
echo "3. Your installable .apk will be in android/app/build/outputs/apk/debug/app-debug.apk"
echo "============================================="
npx cap open android
