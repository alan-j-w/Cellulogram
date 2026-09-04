# 🚀 CELLULOGRAM BUILD COMMANDS REFERENCE

**Generated:** 2026-09-04  
**Expo SDK:** 55.0.31  
**EAS CLI:** >= 19.1.0

---

## 📋 QUICK REFERENCE

| Build Type | Command | Platform | Output |
|------------|---------|----------|--------|
| Local Android APK | `eas build --platform android --profile preview --local` | Android | `.apk` |
| EAS Preview APK | `eas build --platform android --profile preview` | Android | `.apk` |
| EAS Production AAB | `eas build --platform android --profile production` | Android | `.aab` |
| iOS Release Build | `eas build --platform ios --profile production` | iOS | `.ipa` |
| Web Production Build | `npx expo export --platform web` | Web | `dist/` |

---

## 🛠️ PREREQUISITES

### System Requirements
```bash
# Node.js
node --version  # v18.0.0 or higher

# npm
npm --version   # v9.0.0 or higher

# Expo CLI
npm install -g expo-cli@latest

# EAS CLI
npm install -g eas-cli@latest

# Android SDK (for local Android builds)
# - Android Studio
# - ANDROID_HOME environment variable
# - Java 17+

# Xcode (for iOS builds - macOS only)
# - Xcode 15+
# - Command Line Tools
```

### Authentication
```bash
# Login to Expo
eas login

# Verify login
eas whoami

# Check project link
eas project:info
```

---

## 📱 ANDROID BUILDS

### 1. Local Android APK (Internal Testing)
```bash
# Build locally on your machine
eas build --platform android --profile preview --local

# Output: ./android/app/build/outputs/apk/preview/release/app-preview-release.apk
```

**Requirements:**
- Android SDK installed
- ANDROID_HOME set
- Java 17+
- Gradle wrapper (included in project)

**Use Case:** Quick testing without cloud credits

---

### 2. EAS Preview APK (Internal Testing)
```bash
# Build on EAS Cloud
eas build --platform android --profile preview

# With specific version
eas build --platform android --profile preview --auto-submit

# Output: Downloadable from EAS dashboard
```

**Configuration (eas.json):**
```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

**Use Case:** Team testing, QA, stakeholder demos

---

### 3. EAS Production AAB (Play Store)
```bash
# Build production AAB for Play Store
eas build --platform android --profile production

# With auto-submit to Play Store
eas build --platform android --profile production --auto-submit

# Output: Downloadable .aab from EAS dashboard
```

**Configuration (eas.json):**
```json
{
  "build": {
    "production": {
      "autoIncrement": true,
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

**Play Store Submission:**
```bash
# Submit to Play Store
eas submit --platform android --profile production

# Or with specific track
eas submit --platform android --profile production --track production
```

**Use Case:** Production release to Google Play Store

---

### 4. Android Build Profiles

#### Development Build
```bash
eas build --platform android --profile development
```
- Development client enabled
- Internal distribution
- Hot reload support

#### Preview Build
```bash
eas build --platform android --profile preview
```
- APK format
- Internal distribution
- Production-like build

#### Production Build
```bash
eas build --platform android --profile production
```
- AAB format
- Auto-increment version
- Play Store ready

---

## 🍎 iOS BUILDS

### 1. iOS Release Build (App Store)
```bash
# Build on EAS Cloud (requires Apple Developer account)
eas build --platform ios --profile production

# With auto-submit to App Store Connect
eas build --platform ios --profile production --auto-submit

# Output: Downloadable .ipa from EAS dashboard
```

**Configuration (eas.json):**
```json
{
  "build": {
    "production": {
      "autoIncrement": true,
      "ios": {
        "buildConfiguration": "Release"
      }
    }
  }
}
```

**App Store Submission:**
```bash
# Submit to App Store Connect
eas submit --platform ios --profile production
```

**Requirements:**
- Apple Developer Program membership ($99/year)
- App Store Connect app record created
- Bundle ID: `com.cellulogram.app`
- Provisioning profiles configured

---

### 2. iOS Build Profiles

#### Development Build
```bash
eas build --platform ios --profile development
```
- Development client
- Internal distribution
- Simulator build available

#### Preview Build
```bash
eas build --platform ios --profile preview
```
- Internal distribution
- TestFlight ready

#### Production Build
```bash
eas build --platform ios --profile production
```
- App Store ready
- Auto-increment build number

---

## 🌐 WEB BUILDS

### 1. Web Production Build
```bash
# Static export for web deployment
npx expo export --platform web

# Output: ./dist/ folder
```

**Output Structure:**
```
dist/
├── _expo/
│   ├── static/
│   │   ├── css/
│   │   └── js/
├── index.html
├── manifest.json
└── ... (23 static routes)
```

**Configuration (app.json):**
```json
{
  "expo": {
    "web": {
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    }
  }
}
```

---

### 2. Web Deployment Commands

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Or connect GitHub repo for auto-deploy
```

#### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

#### AWS S3 + CloudFront
```bash
# Sync to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

#### Firebase Hosting
```bash
# Install Firebase CLI
npm i -g firebase-tools

# Initialize
firebase init hosting

# Deploy
firebase deploy
```

---

## 🔧 BUILD CONFIGURATION

### Environment Variables
```bash
# Set EAS secrets (recommended for production)
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-project.supabase.co"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-anon-key"
eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --value "your-web-client-id"
eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID --value "your-android-client-id"
eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID --value "your-ios-client-id"

# List secrets
eas secret:list --scope project
```

### Build Credentials (Android)
```bash
# Configure keystore for production
eas credentials --platform android

# Or use local credentials
eas build --platform android --profile production --local --keystore-path ./keystore.jks --keystore-password YOUR_PASSWORD --key-alias YOUR_ALIAS --key-password YOUR_PASSWORD
```

### Build Credentials (iOS)
```bash
# Configure certificates and profiles
eas credentials --platform ios

# Or use local credentials
eas build --platform ios --profile production --local --provisioning-profile-path ./profile.mobileprovision --certificate-path ./cert.p12 --certificate-password YOUR_PASSWORD
```

---

## 📦 VERSION MANAGEMENT

### Auto-increment Version
```bash
# Android: versionCode auto-increment
# iOS: buildNumber auto-increment
eas build --platform all --profile production
```

### Manual Version Update
```bash
# Update version in app.json
# "version": "1.0.1"

# Or use eas version
eas version --platform android
eas version --platform ios
```

---

## 🔍 BUILD MONITORING

### Check Build Status
```bash
# List recent builds
eas build:list --platform android
eas build:list --platform ios

# View specific build
eas build:view BUILD_ID

# View build logs
eas build:view BUILD_ID --logs
```

### Cancel Build
```bash
eas build:cancel BUILD_ID
```

---

## 🚀 COMPLETE BUILD WORKFLOWS

### Workflow 1: Full Production Release
```bash
# 1. Update version
# Edit app.json version

# 2. Build Android AAB
eas build --platform android --profile production

# 3. Build iOS IPA
eas build --platform ios --profile production

# 4. Build Web
npx expo export --platform web

# 5. Submit to stores
eas submit --platform android --profile production
eas submit --platform ios --profile production

# 6. Deploy Web
vercel --prod  # or your preferred host
```

### Workflow 2: Internal Testing
```bash
# 1. Build Android Preview APK
eas build --platform android --profile preview

# 2. Build iOS Preview
eas build --platform ios --profile preview

# 3. Distribute via EAS or TestFlight
```

### Workflow 3: Local Development Build
```bash
# 1. Start development server
npm start

# 2. Run on Android device/emulator
npm run android

# 3. Run on iOS simulator (macOS only)
npm run ios

# 4. Run on Web
npm run web
```

---

## 📋 PRE-BUILD CHECKLIST

### Before Every Build
- [ ] Update version in `app.json`
- [ ] Verify `.env` has production values
- [ ] Run `npx tsc --noEmit` (TypeScript check)
- [ ] Run `npx expo-doctor` (Expo compatibility)
- [ ] Run `npx expo install --check` (Dependencies)
- [ ] Test locally with `npm start`

### Before Production Build
- [ ] Configure Google OAuth Client IDs
- [ ] Set EAS secrets for production
- [ ] Verify Supabase production database
- [ ] Test on physical devices
- [ ] Verify app icons and splash screens
- [ ] Check app.json permissions
- [ ] Review privacy policy and terms

---

## 🐛 TROUBLESHOOTING

### Common Build Issues

#### Android Build Fails
```bash
# Clear cache
eas build --platform android --profile preview --clear-cache

# Check Gradle
cd android && ./gradlew clean

# Verify keystore
keytool -list -v -keystore keystore.jks
```

#### iOS Build Fails
```bash
# Clear cache
eas build --platform ios --profile preview --clear-cache

# Check certificates
eas credentials --platform ios

# Verify bundle ID matches provisioning profile
```

#### Web Build Fails
```bash
# Clear Metro cache
npx expo start --clear

# Check for TypeScript errors
npx tsc --noEmit

# Verify static export compatibility
npx expo export --platform web --clear
```

---

## 📊 BUILD PERFORMANCE

### Typical Build Times (EAS Cloud)
| Platform | Profile | Time |
|----------|---------|------|
| Android | Preview | 8-12 min |
| Android | Production | 10-15 min |
| iOS | Preview | 12-18 min |
| iOS | Production | 15-25 min |
| Web | Export | 2-5 min |

### Optimization Tips
- Use `--local` for faster iteration
- Enable EAS build cache
- Minimize dependencies
- Use `expo install` for compatible packages

---

## 📁 OUTPUT LOCATIONS

### Local Builds
```
Android APK: ./android/app/build/outputs/apk/
Android AAB: ./android/app/build/outputs/bundle/
iOS IPA: ./ios/build/ (macOS only)
Web: ./dist/
```

### EAS Cloud Builds
```
Download from: https://expo.dev/accounts/[account]/projects/[project]/builds/[build-id]
```

---

## 🔗 USEFUL LINKS

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [Expo Export Documentation](https://docs.expo.dev/distribution/publishing-websites/)
- [Google Play Console](https://play.google.com/console)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Supabase Dashboard](https://supabase.com/dashboard)

---

## 📞 SUPPORT

For build issues:
1. Check EAS build logs
2. Run `npx expo-doctor`
3. Verify all environment variables
4. Check Expo SDK compatibility
5. Contact Expo support if needed

---

*End of Build Commands Reference*