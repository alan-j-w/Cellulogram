# Cellulogram 🎬
### Premium Casting Workspace & Audition Pipeline for Regional Cinema

Cellulogram is a state-of-the-art mobile casting application designed specifically for **actors, independent filmmakers, and regional directors** (e.g., Malayalam, Tamil cinema). It eliminates messy WhatsApp and Google Drive clutter by providing a highly-responsive native pipeline for casting calls, self-tapes, and instant swipe-shortlisting review.

> [!NOTE]  
> **Mobile Native Architecture**: This is a fully native mobile application built on **Expo SDK 55**, **React Native**, **NativeWind v4 (Tailwind CSS v4 engine)**, **Zustand** for state, and **React Query** for server state. It is styled natively for smooth performance on physical iOS/Android screens and simulators.

---

## 📱 Mobile Running & Setup Guide

Since this is a native mobile application and not a website, you will run it through the **Expo Development Server** which compiles and streams the JavaScript bundle to your phone or simulator.

### 1. Prerequisites
* **Physical Device Testing (Recommended)**: 
  * Install the free **Expo Go** application from the [Apple App Store](https://apps.apple.com/app/expo-go/id984021028) or [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent).
  * Ensure your mobile device and your development computer are connected to the **same Wi-Fi network**.
* **Simulator Testing (Alternative)**:
  * For iOS: [macOS] Xcode Simulator installed.
  * For Android: Android Studio and an Android Virtual Device (AVD) running.

---

### 2. Starting the Development Server

Open your terminal in the workspace root (`c:\Users\ALAN\OneDrive\Documents\Desktop\cellulogram\cellulogram`) and execute:

```bash
# Install dependencies (if not already done)
npm install

# Start the Expo development bundler
npx expo start
```

This command fires up the **Metro Bundler** and displays a **large interactive QR Code** in your terminal window.

#### 💡 Critical Connection Tips:
* **Physical Phone**: Open your phone's default camera app (iOS) or the Expo Go app (Android) and scan the **terminal QR code**. This instantly downloads and runs Cellulogram!
* **Simulator**: Press `i` in your terminal to launch automatically in the iOS Simulator, or `a` to launch in the Android Emulator.
* **Troubleshooting Wi-Fi Isolation**: If your router isolates device connections, start Metro with a tunnel wrapper to route over the public web:
  ```bash
  npx expo start --tunnel
  ```

---

## 🎯 High-Fidelity Manual Testing Script

We have engineered a **high-fidelity local database simulator** with pre-populated regional content (like *Kathanar: The Wild Hunter* and *Nizhal*) and real streaming video assets. 

Follow this step-by-step checklist to test the entire native mobile experience:

### 🎭 Flow 1: Rapid Login & Role Swapping
No tedious typing required on mobile keyboards! We added a **Rapid Evaluation Panel** on the login screen.
1. When the app launches, tap **SIGN IN TO PORTAL** from the cinematic landing page.
2. Scroll to the bottom and locate the **⚡ RAPID EVALUATION PANEL** card.
3. Tap **DEMO ACTOR** to log in instantly as actor *Amal Dev*.
4. Later, tap **Log Out** under the Profile tab and tap **DEMO DIRECTOR** to instantly swap into director *Paramjeet Dhanjal's* console.

---

### 🎬 Flow 2: The Actor Experience (Amal Dev)
Log in as the **Demo Actor** to test mobile submission and self-tape workflows:
1. **Browse Auditions**: On the **Dashboard**, scroll through active regional roles (e.g. *Lead Antagonist (Siddha)* for *Kathanar*).
2. **Read Details**: Tap on the **Lead Antagonist** card to open the role info screen showing casting requirements, languages, location, and deadline.
3. **Pick a Self-Tape**: Tap **APPLY FOR THIS ROLE**.
4. **Native Image Picker**: Tap **Choose Audition Video**. This opens your mobile device's native media gallery via `expo-image-picker`. You can select any short video on your device.
5. **Stateful Upload Meter**: Fill in your age, gender, skills, and experience. Tap **SUBMIT APPLICATION**.
6. **Watch the Progress**: Watch the custom premium **0-100% upload progress meter** animating with simulated latency.
7. **Track Your Application**: Tap the **My Auditions** tab at the bottom. You will see your newly uploaded application listed with a status of `Submitted`.

---

### 🔎 Flow 3: The Director Command Center (Paramjeet Dhanjal)
Log out, and tap **DEMO DIRECTOR** on the Rapid Login screen:
1. **Casting Metrics**: Look at the gorgeous Glassmorphic dashboard cards displaying metrics: *Total Casting Calls*, *Total Applicants*, and *Shortlisted Talents*.
2. **Reviewing Auditions**: In the **Casting Calls** list, tap **Kathanar: The Wild Hunter** (which has active applicants).
3. **Fast Swipe Review System**:
   * You will see the applicants listed (e.g., *Jithin Thomas*).
   * Tap on an applicant to open their casting card.
   * **Play Auditions Natively**: Tap the play button on their video. The app loads a high-fidelity video stream playing seamlessly via `expo-video` with fullscreen toggles.
   * **Instant Status Swiping/Tapping**: Tap **Shortlist** 🌟 or **Pass** 🚫. The state updates in real-time, instantly moving them to the corresponding pipeline.
4. **Posting a New Casting Call**:
   * Navigate back to the Director Dashboard.
   * Tap the **Post New Role** button.
   * Fill out the form fields: *Project Title*, *Role Name*, *Age Range*, *Language*, and *Detailed Requirements*.
   * Tap **CREATE CASTING CALL**.
   * It is instantly committed to the simulated database! If you log back in as an Actor, you will see your new role immediately populated on the actor landing feed!

---

## 🛠️ Developer Verification & Clean Codebase

To ensure code stability during testing, the codebase has been audited and compiled under strict TypeScript parameters:
* **No Type Warnings**: Running `npx tsc --noEmit` returns **0 compilation errors**.
* **Video Playback Compliant**: Upgraded direct video props to use native SDK 55 standard: `fullscreenOptions={{ enable: true }}`.
* **Component Cleanliness**: Cleared out unused default Expo boilerplate files to ensure clean app bundle loading.

---

## 📂 Interactive Project Map

Use these direct file links to inspect or customize the app's components and views:

### 🧩 Core Screens
* [Landing & Gateway Screen](file:///c:/Users/ALAN/OneDrive/Documents/Desktop/cellulogram/cellulogram/src/app/index.tsx): Cinematic introduction page.
* [Login Controller Screen](file:///c:/Users/ALAN/OneDrive/Documents/Desktop/cellulogram/cellulogram/src/app/(auth)/login.tsx): Rapid role-switching panel implementation.
* [Actor Dashboard Page](file:///c:/Users/ALAN/OneDrive/Documents/Desktop/cellulogram/cellulogram/src/app/(actor)/dashboard.tsx): Main feed for casting calls.
* [Actor Audition Uploader Page](file:///c:/Users/ALAN/OneDrive/Documents/Desktop/cellulogram/cellulogram/src/app/(actor)/apply/[id].tsx): Native gallery picker and progress meter.
* [Director Dashboard Page](file:///c:/Users/ALAN/OneDrive/Documents/Desktop/cellulogram/cellulogram/src/app/(director)/dashboard.tsx): Project analytics console.
* [Director Swipe-Review Screen](file:///c:/Users/ALAN/OneDrive/Documents/Desktop/cellulogram/cellulogram/src/app/(director)/applicants/[roleId].tsx): Fast decision pipeline.
* [Director Casting Post Form](file:///c:/Users/ALAN/OneDrive/Documents/Desktop/cellulogram/cellulogram/src/app/(director)/post-role.tsx): Multi-input role creator.

### 🗄️ Services & State
* [Database Simulator](file:///c:/Users/ALAN/OneDrive/Documents/Desktop/cellulogram/cellulogram/src/services/supabase.ts): Real mock data and simulated delay parameters.
* [Auth Store Manager](file:///c:/Users/ALAN/OneDrive/Documents/Desktop/cellulogram/cellulogram/src/store/authStore.ts): Seamless role persistence using Zustand.
* [Custom Input UI](file:///c:/Users/ALAN/OneDrive/Documents/Desktop/cellulogram/cellulogram/src/components/ui/Input.tsx): Highly customizable text field propagation.
