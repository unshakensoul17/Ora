---
description: Setup Android Development Environment on Linux
---

# Android Environment Setup Guide

To build Android apps locally on your machine (saving you from cloud queues), you need to set up the Android SDK.

## 1. Install Android Studio

The easiest way on Linux is usually via Snap or downloading the tarball.

### Option A: Via Terminal (Snap) - Recommended for Ubuntu
```bash
sudo snap install android-studio --classic
```

### Option B: Manual Download
1. Download from [developer.android.com/studio](https://developer.android.com/studio).
2. Extract the tarball to `/usr/local/` or your home folder.
3. Run `bin/studio.sh`.

## 2. Initial Setup Wizard (Crucial!)

1. **Launch Android Studio**.
2. Select "Do not import settings".
3. Click **Next** through the wizard.
4. Select **Standard** install type.
5. **IMPORTANT:** Ensure **"Android SDK"** and **"Android SDK Platform"** are checked.
6. Note the **SDK Location** path shown (usually `/home/username/Android/Sdk`).
7. Click **Finish** and wait for components to download.

## 3. Install SDK Tools

1. On the Android Studio Welcome screen, click **More Actions** (three dots) -> **SDK Manager**.
2. Go to the **SDK Tools** tab (center of window).
3. Check these boxes:
   - [x] Android SDK Build-Tools
   - [x] Android SDK Command-line Tools (latest)
   - [x] Android SDK Platform-Tools
4. Click **Apply** -> **OK** to install them.

## 4. configure Environment Variables

You need to tell your system where the SDK is.

Run this command in your terminal to see if the SDK exists where we expect:
```bash
ls -d $HOME/Android/Sdk
```
If that exists, run the following to make the setup permanent:

```bash
# Add these lines to your ~/.bashrc or ~/.zshrc
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
```

Then reload via:
```bash
source ~/.bashrc
```

## 5. Verify Setup

Run:
```bash
adb --version
```
It should show the version and path.

## 6. Build Locally

Now you can build your app locally:
```bash
npx eas build --platform android --profile production --local
```
