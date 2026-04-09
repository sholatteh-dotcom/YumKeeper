# Google Play Service Account Setup

This guide explains how to create a Google Play service account key so that `eas submit --platform android` can upload builds automatically without manual AAB uploads.

## Step 1 — Create a Service Account in Google Cloud Console

1. Go to [console.cloud.google.com](https://console.cloud.google.com) and select (or create) the project linked to your Play Console account.
2. Navigate to **IAM & Admin → Service Accounts → Create Service Account**.
3. Name it `eas-submit` and click **Create and Continue**.
4. Skip the optional role assignment and click **Done**.
5. Click the new service account, go to the **Keys** tab, and click **Add Key → Create new key → JSON**.
6. Download the `.json` file — this is your `google-play-service-account.json`.

## Step 2 — Grant Play Console Access

1. Go to [play.google.com/console](https://play.google.com/console) → **Setup → API access**.
2. Link the Google Cloud project if not already linked.
3. Under **Service accounts**, find `eas-submit` and click **Grant access**.
4. Set the permissions to **Release manager** (allows uploading and managing releases).
5. Click **Apply** and **Invite user**.

## Step 3 — Add the Key to Your Project

Place the downloaded JSON file at the project root:

```
food-preservation-app/
  google-play-service-account.json   ← put it here
  eas.json                            ← already references this path
```

> **Security:** This file contains sensitive credentials. It is already listed in `.gitignore` — never commit it to version control.

## Step 4 — Submit with One Command

```bash
# Build and submit in one step
eas build --platform android --profile production --auto-submit

# Or submit an existing build
eas submit --platform android --profile production
```

EAS will upload the AAB directly to the **Internal testing** track in Play Console as a draft release, ready for you to promote.

---

## Google Play App Signing (Recommended)

Enabling Google Play App Signing prevents the SHA1 mismatch error permanently.

1. In Play Console → **Setup → App signing**, click **Request key upgrade** or **Use Google-managed key**.
2. Follow the on-screen instructions to transfer your upload key to Google.
3. From this point forward, you sign builds with your **upload key** (managed by EAS) and Google re-signs them with the **distribution key** before delivery to users.

**Benefits:**
- SHA1 mismatch errors become impossible — Google always uses the correct distribution key.
- If your upload key is ever lost or compromised, Google can issue a new one.
- Required for Play Asset Delivery and advanced delivery features.
