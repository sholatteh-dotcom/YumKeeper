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

---

## Part 6 — Promoting from Internal Testing to Open Testing (Google Play)

Once you have verified the internal test build works correctly on a physical device, follow these steps to promote it to Open Testing (public beta) and then to Production.

### Pre-promotion Checklist

| Item | Status |
|------|--------|
| App tested on at least one physical Android device | Required |
| All core flows work end-to-end (add item, expiry alert, settings) | Required |
| Privacy Policy URL live at `/api/privacy-policy` | Done |
| Delete Account URL live at `/api/delete-account` | Done |
| Data Safety form completed in Play Console | Required |
| Content rating questionnaire completed | Required |
| Store listing (title, description, screenshots, feature graphic) uploaded | Done |
| App icon (512×512 PNG) uploaded | Done |
| At least 2 phone screenshots uploaded | Done |
| 7-inch and 10-inch tablet screenshots uploaded | Done |
| `google-play-service-account.json` placed in project root | Required for `eas submit` |

### Promotion Steps in Play Console

1. Go to **Testing → Internal testing** and open the current release.
2. Click **Promote release → Open testing**.
3. Review the release notes — add a brief changelog such as *"Initial public beta release"*.
4. Set the **rollout percentage** to 100% for open testing.
5. Click **Save** then **Start rollout to Open testing**.

### Moving to Production

After gathering feedback from open testers:

1. Go to **Testing → Open testing** and open the release.
2. Click **Promote release → Production**.
3. Set the rollout to a staged percentage (e.g. 10%) for a cautious launch, or 100% for a full launch.
4. Click **Save** then **Start rollout to Production**.

> **Note:** Google typically reviews new apps within 3–7 days before they appear publicly in the Play Store. Ensure all policy requirements are met before submitting to Production.

---

## Part 7 — iOS App Store: Promoting from TestFlight to Review

### Pre-submission Checklist

| Item | Status |
|------|--------|
| App tested on physical iPhone via TestFlight | Required |
| All core flows work end-to-end | Required |
| Privacy Policy URL live | Done |
| Age rating questionnaire completed in App Store Connect | Required |
| iPhone 6.7-inch screenshots uploaded | Done |
| iPad 12.9-inch screenshots uploaded | Done |
| App description, keywords, and subtitle filled in | Done |
| `ascAppId` filled in `eas.json` | Pending — replace `REPLACE_WITH_APP_STORE_CONNECT_APP_ID` |

### How to Find Your ascAppId

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com) → **My Apps → YumKeeper**.
2. Click **App Information** in the left sidebar.
3. The **Apple ID** field (a 9–10 digit number) is your `ascAppId`.
4. Replace `REPLACE_WITH_APP_STORE_CONNECT_APP_ID` in `eas.json` with this number.

### Submission Steps

1. In App Store Connect, open YumKeeper → **App Store** tab.
2. Click **+ Version** and enter `1.0.1`.
3. Select the TestFlight build you want to submit.
4. Fill in **What's New**: *"Initial release — track food freshness, get expiry alerts, and save money."*
5. Click **Add for Review** then **Submit to App Review**.

Apple typically reviews new apps within 24–48 hours.

---

## Part 8 — User Data & Privacy Compliance

This section explains how YumKeeper handles user data, what obligations apply under major privacy regulations, and how to correctly complete the data safety and privacy declarations required by both the Apple App Store and Google Play Store.

---

### 8.1 — How YumKeeper Handles User Data

YumKeeper is designed as a **local-first, privacy-respecting application**. The table below summarises every category of data the app touches and how it is handled.

| Data Category | What Is Stored | Where It Is Stored | Transmitted Externally? |
|---------------|---------------|-------------------|------------------------|
| Food inventory items (name, quantity, expiry date, location) | On device | `AsyncStorage` (device only) | No |
| User's first name (optional, entered during onboarding) | On device | `AsyncStorage` (device only) | No |
| Notification preferences and alert settings | On device | `AsyncStorage` (device only) | No |
| Deletion requests (submitted via web form) | Server database | PostgreSQL (hosted server) | No — stored internally only |
| App crash and diagnostic data | Not collected | N/A | No |
| Advertising identifiers (IDFA/GAID) | Not collected | N/A | No |
| Location data | Not collected | N/A | No |
| Payment information | Not collected | N/A | No |

**Summary:** YumKeeper does not collect, sell, or share any personal data with third parties. The only server-side data stored is a deletion request record (email address + timestamp), submitted voluntarily by the user via the `/api/delete-account` form.

---

### 8.2 — GDPR Compliance (European Union)

The **General Data Protection Regulation (GDPR)** applies to any app used by people in the European Union, regardless of where the developer is based.

**Lawful basis for processing.** The sole server-side data processed by YumKeeper — deletion request records — is processed under **Article 6(1)(c)** (legal obligation) and **Article 17** (right to erasure). No other personal data is processed server-side.

**Data subject rights.** YumKeeper supports the following rights out of the box:

| Right | How It Is Fulfilled |
|-------|-------------------|
| Right of access (Art. 15) | All data is stored locally on the user's device and is directly accessible to them |
| Right to erasure (Art. 17) | Users submit a deletion request at `/api/delete-account`; data is purged within 30 days |
| Right to data portability (Art. 20) | Not applicable — no personal data is held server-side beyond deletion requests |
| Right to object (Art. 21) | Users can disable notifications at any time in Settings |

**Data retention.** Deletion request records are retained for 30 days to allow processing, then permanently deleted by the automated daily purge job.

**Privacy Policy.** A GDPR-compliant privacy policy is published at `https://freshkeep-ctbgrbwn.manus.space/api/privacy-policy`. It must be linked in both the App Store and Play Store listings.

**Data Protection Officer (DPO).** For a solo developer or small team, a formal DPO is not required unless processing is carried out on a large scale. If YumKeeper grows significantly, revisit this requirement.

---

### 8.3 — CCPA Compliance (California, USA)

The **California Consumer Privacy Act (CCPA)** applies if the app has users in California and the developer meets certain revenue or data volume thresholds. For most indie developers, the thresholds are not met, but it is best practice to comply regardless.

**Key obligations:**

- **Do not sell personal information.** YumKeeper does not sell any user data. No third-party advertising SDKs are integrated.
- **Right to know.** Users can see all their data directly on their device (food inventory, settings).
- **Right to delete.** Fulfilled via the `/api/delete-account` web form.
- **Non-discrimination.** Users who exercise privacy rights are not treated differently.

No additional in-app UI is required for CCPA compliance given YumKeeper's data-minimal architecture.

---

### 8.4 — Apple App Privacy (App Store Connect)

When submitting to the App Store, Apple requires you to complete the **App Privacy** questionnaire in App Store Connect. Answer as follows for YumKeeper:

**Question: Does your app collect data?**
Select **"No, we do not collect data from this app."**

This is accurate because all food inventory and settings data is stored locally on the device and is never transmitted to Apple, the developer, or any third party. The optional deletion request (email address) is submitted voluntarily by the user and is not collected passively by the app.

> If Apple's reviewer questions this, reference the Privacy Policy URL (`https://freshkeep-ctbgrbwn.manus.space/api/privacy-policy`) and note that the only server interaction is a user-initiated deletion request form, which is not passive data collection.

**Export Compliance.** When prompted during submission, answer **No** to the question about encryption. YumKeeper uses only standard HTTPS for network communication, which is exempt from export compliance requirements under US EAR (Export Administration Regulations).

---

### 8.5 — Google Play Data Safety Form

Google Play requires all apps to complete a **Data Safety** declaration. Complete the form in Play Console → **Policy → App content → Data safety** as follows:

| Question | Answer |
|----------|--------|
| Does your app collect or share any of the required user data types? | **No** |
| Does your app use encryption in transit? | **Yes** — all server communication uses HTTPS/TLS |
| Does your app provide a way for users to request data deletion? | **Yes** |
| Data deletion URL | `https://freshkeep-ctbgrbwn.manus.space/api/delete-account` |

Because YumKeeper does not collect any data types listed in Google's taxonomy (location, contacts, personal info, financial info, health info, messages, photos/videos, audio, files, calendar, app activity, web browsing, app info, device identifiers), the form can be completed quickly with predominantly "No" answers.

---

### 8.6 — In-App Privacy Best Practices

The following practices are already implemented in YumKeeper and should be maintained in all future versions:

**Minimal data collection.** The app requests only the permissions it needs. Camera permission is requested only when the barcode scanner is opened. Notification permission is requested only when the user enables alerts in Settings. No permissions are requested on first launch.

**No third-party analytics or advertising SDKs.** YumKeeper does not integrate Firebase Analytics, Facebook SDK, Google AdMob, or any other third-party data collection library. This keeps the app's data footprint at zero and simplifies all privacy declarations.

**Transparent permission prompts.** All iOS `NSUsageDescription` strings in `app.config.ts` clearly explain why each permission is needed (e.g. *"YumKeeper uses your camera to scan product barcodes and auto-fill food details."*). These descriptions must be honest and specific — vague descriptions are a common reason for App Store rejection.

**Secure deletion.** The `/api/delete-account` endpoint records the deletion request in the database and triggers an automated purge job. The purge job permanently deletes all records associated with the user's email within 30 days, in compliance with GDPR Article 17.

**Future considerations.** If cloud sync, user accounts, or third-party integrations (e.g. recipe APIs, supermarket loyalty cards) are added in future versions, a full privacy impact assessment should be conducted before release, and the Privacy Policy, App Privacy declaration, and Data Safety form must all be updated accordingly.

---

### 8.7 — Privacy Policy Maintenance

The live Privacy Policy at `https://freshkeep-ctbgrbwn.manus.space/api/privacy-policy` must be kept up to date. Update it whenever:

- A new data type is collected or processed.
- A new third-party service or SDK is integrated.
- The data retention period changes.
- The app expands to a new jurisdiction with specific legal requirements (e.g. Brazil's LGPD, Canada's PIPEDA, Australia's Privacy Act).

Both Apple and Google can reject app updates if the Privacy Policy URL is broken or if the declared data practices do not match the actual app behaviour.
