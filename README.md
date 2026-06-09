# Cellulogram 🎬
### Premium Casting Workspace & Audition Pipeline for Regional Cinema

Cellulogram is a state-of-the-art mobile casting application designed specifically for **actors, independent filmmakers, and regional directors**. It eliminates messy WhatsApp and Google Drive clutter by providing a highly-responsive native pipeline for casting calls, self-tapes, and instant swipe-shortlisting review.

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

Follow this step-by-step checklist to test the entire native mobile experience:
## 🎭 Flow 1: Rapid Login & Role Switching

To simplify testing, the login screen includes a **Rapid Evaluation Panel**.

1. Launch the app and tap **SIGN IN TO PORTAL** from the landing page.
2. Scroll to the bottom and locate the **⚡ RAPID EVALUATION PANEL**.
3. Tap **DEMO ACTOR** to enter the actor workspace instantly.
4. To test the director experience, sign out from the Profile tab and tap **DEMO DIRECTOR**.

---

## 🎬 Flow 2: The Actor Experience

Log in as the **Demo Actor** to test audition submission workflows:

1. **Browse Auditions** – Open the Dashboard and explore active casting opportunities.
2. **Read Details** – Tap a role card to view casting requirements, languages, location, and deadline.
3. **Apply for a Role** – Tap **APPLY FOR THIS ROLE**.
4. **Upload an Audition** – Tap **Choose Audition Video** to open your device gallery using `expo-image-picker`.
5. **Complete Your Application** – Fill in age, gender, skills, and experience details.
6. **Submit** – Tap **SUBMIT APPLICATION**.
7. **Track Progress** – Monitor the upload progress meter and view your submitted applications in the **My Auditions** section.

---

## 🔎 Flow 3: The Director Command Center

Log in as the **Demo Director** to test casting management workflows:

1. **View Casting Metrics** – Review dashboard statistics including total casting calls, applicants, and shortlisted talent.
2. **Review Applications** – Open an active casting call to view submitted auditions.
3. **Audition Review Workflow**

   * Open an applicant profile.
   * Play audition videos using the built-in video player powered by `expo-video`.
   * Update application status using **Shortlist** 🌟 or **Pass** 🚫 actions.
4. **Create a New Casting Call**

   * Navigate to **Post New Role**.
   * Enter project details, role requirements, age range, language, and casting information.
   * Tap **CREATE CASTING CALL** to publish the role.

---

## 📂 Project Structure

### 🧩 Core Screens

* Landing & Gateway Screen – Cinematic introduction and entry point.
* Login Controller Screen – Authentication and rapid role-switching panel.
* Actor Dashboard – Browse active casting opportunities.
* Actor Audition Upload Screen – Submit self-tape auditions.
* Director Dashboard – Manage casting calls and applicants.
* Director Review Screen – Review and update applicant status.
* Director Casting Form – Create and publish new casting opportunities.

### 🗄️ Services & State

* Database Simulator – Mock backend services and simulated delays.
* Auth Store Manager – Authentication and role persistence using Zustand.
* Custom Input Components – Reusable form components for mobile workflows.
