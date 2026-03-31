# YumKeeper — Apple App Store Submission Guide

> This document covers everything needed to submit YumKeeper to the Apple App Store: the complete store listing copy, asset checklist, EAS build instructions, and App Store Connect configuration steps.

---

## Part 1 — App Store Listing Copy

### App Name
**YumKeeper**

### Subtitle (30 characters max)
**Track food. Waste less.**

### Description (4,000 characters max)

YumKeeper is your kitchen's best friend — a beautifully simple food tracker that helps you know exactly what's in your fridge, freezer, pantry, and cellar at all times.

Stop throwing away food you forgot you had. YumKeeper sends you friendly nudges before things expire, so you can use them up at just the right time. Most households save over £800 a year simply by wasting less — and YumKeeper makes that effortless.

**Track everything, effortlessly**
Add items in seconds using the emoji food picker. Assign them to your fridge, freezer, pantry, or cellar, set an expiry date, and you're done. YumKeeper remembers so you don't have to.

**Friendly alerts, not nagging notifications**
Instead of cold, clinical reminders, YumKeeper speaks to you like a friend: "Heads up! Your organic milk is best used tomorrow 🥛". You'll always know what needs using up — without the guilt.

**Personalised just for you**
Tell YumKeeper your name during setup and every morning you'll be greeted with a warm "Good morning, Sarah 👋". It's a small touch that makes your kitchen feel a little more like home.

**Preservation tips built in**
Not sure how long cherry tomatoes last in the fridge? YumKeeper surfaces expert preservation tips right when you add an item, so you always store food the right way.

**Your data, your device**
YumKeeper works entirely offline. Your food inventory is stored privately on your device — no account required, no data shared.

**Designed for iPhone and iPad**
YumKeeper is optimised for every screen size. On iPad, the inventory screen uses a beautiful split-view layout so you can browse categories and items side by side.

---

### Keywords (100 characters max)
`food tracker,expiry,waste less,fridge,pantry,freezer,preservation,kitchen,inventory,fresh`

### Category
**Food & Drink** (Primary) · **Lifestyle** (Secondary)

### Age Rating
**4+** — No objectionable content.

### Privacy Policy URL
`https://freshkeep-ctbgrbwn.manus.space/api/privacy-policy`

### Support URL
`https://freshkeep-ctbgrbwn.manus.space`

### Data Deletion URL
`https://freshkeep-ctbgrbwn.manus.space/api/delete-account`

---

## Part 2 — Asset Checklist

All assets are saved in `store-assets/ios/` in the project.

| Asset | Dimensions | File | Status |
|-------|-----------|------|--------|
| App Icon | 1024×1024 px PNG | `assets/images/icon.png` | ✅ Ready |
| iPhone 6.7-inch Screenshot 1 | 1290×2796 px | `ios/ios-iphone-1-welcome.jpg` | ✅ Ready |
| iPhone 6.7-inch Screenshot 2 | 1290×2796 px | `ios/ios-iphone-2-dashboard.jpg` | ✅ Ready |
| iPhone 6.7-inch Screenshot 3 | 1290×2796 px | `ios/ios-iphone-3-inventory.jpg` | ✅ Ready |
| iPhone 6.7-inch Screenshot 4 | 1290×2796 px | `ios/ios-iphone-4-add-item.jpg` | ✅ Ready |
| iPhone 6.7-inch Screenshot 5 | 1290×2796 px | `ios/ios-iphone-5-alerts.jpg` | ✅ Ready |
| iPad Pro 12.9-inch Screenshot 1 | 2048×2732 px | `ios/ios-ipad-1-dashboard.jpg` | ✅ Ready |
| iPad Pro 12.9-inch Screenshot 2 | 2048×2732 px | `ios/ios-ipad-2-inventory.jpg` | ✅ Ready |
| iPad Pro 12.9-inch Screenshot 3 | 2048×2732 px | `ios/ios-ipad-3-add-item.jpg` | ✅ Ready |

> **Note:** Apple requires screenshots for at least the 6.7-inch iPhone display. iPad screenshots are required only if you enable iPad support (recommended — already configured in `app.config.ts` with `supportsTablet: true`).

---

## Part 3 — EAS Build Setup

### Prerequisites

Before building, ensure you have the following installed and configured on your local machine:

```bash
npm install -g eas-cli
eas login          # Log in with your Expo account
```

You also need an **Apple Developer account** ($99/year) at [developer.apple.com](https://developer.apple.com).

### Step 1 — Configure EAS

In the project root, run:

```bash
eas build:configure
```

This creates `eas.json` with build profiles. The default configuration is sufficient for a first submission.

### Step 2 — Register your iOS device (for TestFlight testing)

```bash
eas device:create
```

Follow the prompts to register your iPhone's UDID for development/TestFlight builds.

### Step 3 — Build for iOS

To build a production `.ipa` for App Store submission:

```bash
eas build --platform ios --profile production
```

EAS will:
1. Ask you to log in to your Apple Developer account (first time only).
2. Automatically create or reuse a Distribution Certificate and Provisioning Profile.
3. Build the app in the cloud and provide a download link when complete.

> **Signing key tip:** EAS manages the signing certificate for you. The certificate it creates will be registered in App Store Connect automatically, avoiding the SHA1 mismatch issue that occurs when building locally with a different keystore.

### Step 4 — Submit to App Store Connect

Once the build is complete, run:

```bash
eas submit --platform ios
```

EAS will upload the `.ipa` directly to App Store Connect using your Apple credentials. You will need to provide your **Apple ID** and an **App-Specific Password** (generated at [appleid.apple.com](https://appleid.apple.com) → Security → App-Specific Passwords).

---

## Part 4 — App Store Connect Configuration

After the build is uploaded, complete the following in [App Store Connect](https://appstoreconnect.apple.com):

### 4.1 — Create the App Record

1. Go to **My Apps → + → New App**.
2. Set **Platform**: iOS.
3. Set **Name**: YumKeeper.
4. Set **Primary Language**: English (UK) or English (US).
5. Set **Bundle ID**: select the bundle ID from `app.config.ts` (e.g. `space.manus.food.preservation.app.tXXXXXXXX`).
6. Set **SKU**: `yumkeeper-001` (any unique string).

### 4.2 — App Information

Navigate to **App Information** and fill in:

| Field | Value |
|-------|-------|
| Name | YumKeeper |
| Subtitle | Track food. Waste less. |
| Category | Food & Drink |
| Secondary Category | Lifestyle |
| Privacy Policy URL | `https://freshkeep-ctbgrbwn.manus.space/api/privacy-policy` |
| Age Rating | 4+ |

### 4.3 — Pricing and Availability

Set the price to **Free** and select all territories (or specific regions as needed).

### 4.4 — App Privacy (Data Safety)

In the **App Privacy** section, declare:

- **Data Not Collected** — YumKeeper stores all data locally on the device and does not collect or transmit any personal data to external servers.
- **Data Deletion**: `https://freshkeep-ctbgrbwn.manus.space/api/delete-account`

### 4.5 — Version Information

Navigate to the version page and:

1. Upload the 5 iPhone 6.7-inch screenshots from `store-assets/ios/ios-iphone-*.jpg`.
2. Upload the 3 iPad Pro 12.9-inch screenshots from `store-assets/ios/ios-ipad-*.jpg`.
3. Paste the **Description**, **Keywords**, and **Support URL** from Part 1 above.
4. Set **What's New** (for version 1.0): `Welcome to YumKeeper! Track your food, get friendly expiry alerts, and save money by wasting less.`

### 4.6 — Submit for Review

Once all fields are complete and the build is attached:

1. Click **Add for Review**.
2. Answer the export compliance question: **No** (no encryption used beyond standard HTTPS).
3. Answer the advertising identifier question: **No** (no IDFA used).
4. Click **Submit to App Review**.

Apple's review typically takes **1–3 business days** for a first submission.

---

## Part 5 — Post-Submission Checklist

| Task | Notes |
|------|-------|
| Monitor review status | Check App Store Connect daily; respond to any reviewer questions within 24 hours |
| Prepare a TestFlight build | Use `eas build --profile preview` to distribute to beta testers before the public release |
| Set up App Store notifications | Enable email alerts in App Store Connect → Users and Access → Notifications |
| Plan version 1.1 | Address any reviewer feedback and prepare the first update |
