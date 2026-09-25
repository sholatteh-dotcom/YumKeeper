# FreshKeep – Project TODO

## Branding & Setup
- [x] Generate custom app logo (green leaf/jar icon)
- [x] Update theme colors to green/amber palette
- [x] Update app.config.ts with FreshKeep branding
- [x] Configure tab navigation (Dashboard, Inventory, Tips, Settings)
- [x] Add all required icon mappings to icon-symbol.tsx

## Data Layer
- [x] Define TypeScript types for FoodItem, Category, PreservationMethod
- [x] Build food database with common foods and default shelf lives
- [x] Build preservation tips/techniques database
- [x] Implement AsyncStorage persistence for food inventory
- [x] Implement expiry calculation utilities
- [x] Set up local notifications for expiry alerts

## Dashboard Screen
- [x] Greeting header with current date
- [x] Summary stats cards (Total, Expiring Soon, Expired, Fresh)
- [x] Expiring Soon horizontal scroll list
- [x] Category quick-access chips
- [x] FAB to add new item

## Inventory Screen
- [x] Search bar
- [x] Filter tabs (All, Fridge, Freezer, Pantry, Cellar)
- [x] Sort options
- [x] FlatList of food cards with expiry color coding
- [x] Swipe-to-delete functionality
- [x] Empty state illustration

## Add Item Screen
- [x] Food name input with auto-suggest
- [x] Category picker
- [x] Quantity + unit picker
- [x] Purchase date picker
- [x] Expiry date picker
- [x] Notes field
- [x] Save functionality with AsyncStorage

## Item Detail Screen
- [x] Food name, category, quantity display
- [x] Days remaining prominent display
- [x] Storage tips for that food type
- [x] Preservation options section
- [x] Edit and Delete actions

## Preservation Tips Screen
- [x] Search bar
- [x] Category filter tabs (Freezing, Canning, Pickling, Drying, Fermenting, etc.)
- [x] 2-column grid of technique cards
- [x] Featured tip section

## Tip Detail Screen
- [x] Technique name and description
- [x] Difficulty and time display
- [x] Best foods chips
- [x] Step-by-step instructions
- [x] Equipment needed list
- [x] Pro tips section

## Settings Screen
- [x] Notification preferences
- [x] Default storage location
- [x] Theme toggle
- [x] About section

## Polish & QA
- [x] Consistent spacing and typography throughout
- [x] Dark mode support
- [x] Loading states and empty states
- [x] Error handling
- [x] All navigation flows working end-to-end

## Barcode Scanner
- [x] Read camera docs and install expo-camera if needed
- [x] Add barcode scanner button to Add Item screen
- [x] Build barcode scanner modal with camera view
- [x] Parse scanned barcode and auto-fill food name/category
- [x] Handle web fallback (camera not available)

## Shopping List Tab
- [x] Add Shopping List tab to navigation
- [x] Add icon mapping for shopping list
- [x] Create shopping list context/storage
- [x] Auto-add items to shopping list when deleted from inventory
- [x] Manual add item to shopping list
- [x] Check off / uncheck items
- [x] Clear completed items
- [x] Categorized display (Fridge, Freezer, Pantry, Cellar)

## Use It Up (Meal Suggestions)
- [x] Build meal suggestions database (recipes using common expiring foods)
- [x] Add "Use It Up" section to Dashboard
- [x] Show recipes based on items expiring within 3 days
- [x] Meal detail screen with ingredients and steps
- [x] "Mark as used" action to remove items from inventory

## Rebranding: FreshKeep → YumKeeper
- [x] Generate new YumKeeper logo (playful, friendly style)
- [x] Update all icon asset files (icon.png, splash-icon.png, favicon.png, android-icon-foreground.png)
- [x] Update app.config.ts appName to "YumKeeper"
- [x] Update logoUrl in app.config.ts
- [x] Update all "FreshKeep" text references in app screens to "YumKeeper"

## UI Redesign: Food Photography + One-Tap Interface
- [ ] Generate high-saturation food photography for 4 storage categories (Fridge, Freezer, Pantry, Cellar)
- [ ] Generate hero banner food photography for Dashboard
- [ ] Generate food photography for Preservation Tips categories
- [ ] Redesign Dashboard: full-width photo hero, one-tap quick-action row, photo-backed category cards
- [ ] Redesign Inventory: photo-backed food cards with one-tap delete/edit/detail actions
- [ ] Redesign Add Item: visual category picker with food photos, one-tap date shortcuts
- [ ] Redesign Tips screen: full-bleed photo cards for each technique
- [ ] Redesign Shopping screen: photo-backed category sections, one-tap check-off
- [ ] Update theme colors to match high-saturation photography palette

## Payment & Subscription (Stripe)
- [x] Read server/README.md for backend setup guidance
- [x] Configure Stripe secret key and webhook secret as environment secrets
- [x] Install stripe npm package on server
- [x] Create Stripe products and prices (Fresh monthly/annual, Family monthly/annual)
- [x] Build /api/subscription/create-checkout-session endpoint
- [x] Build /api/subscription/webhook endpoint (handle checkout.session.completed, customer.subscription.*)
- [x] Build /api/subscription/status endpoint (return current plan for user)
- [x] Build /api/subscription/portal endpoint (Stripe customer portal for manage/cancel)
- [x] Create SubscriptionContext to hold plan state app-wide
- [x] Build Pricing screen with 3 tier cards (Free, Fresh, Family) and monthly/annual toggle
- [x] Build Paywall modal that triggers when free-tier limit is hit
- [x] Gate barcode scanner behind Fresh+ plan
- [x] Gate shopping list behind Fresh+ plan
- [x] Gate notifications behind Fresh+ plan
- [x] Gate tips beyond 3 behind Fresh+ plan
- [x] Gate items beyond 10 behind Fresh+ plan (show paywall on add)
- [x] Gate family sharing behind Family plan
- [x] Add subscription section to Settings screen (current plan badge, manage/upgrade button)
- [x] Add Pricing tab or button accessible from Dashboard and Settings

## Free Trial & Upgrade Prompt
- [x] Add 7-day free trial (trial_period_days: 7) to Stripe Checkout session
- [x] Update Pricing screen to show "Start 7-day free trial" CTA copy
- [x] Add upgrade prompt banner to Dashboard for free users
- [x] Banner shows items used vs limit (e.g. "7/10 items used")
- [x] Banner has "Upgrade to Fresh" CTA that opens Pricing screen
- [x] Banner disappears for paid users

## Apple App Store Build Fixes
- [x] Install missing peer dependency: expo-asset (required by expo-audio)
- [x] Update all outdated Expo SDK packages to match SDK 54 versions
- [x] Fix @react-navigation/bottom-tabs minor version mismatch (added to expo.install.exclude - versions are newer/compatible)
- [x] Verify app.config.ts iOS permissions are complete (camera, notifications, microphone)
- [x] Add NSPhotoLibraryUsageDescription and NSPhotoLibraryAddUsageDescription to iOS infoPlist
- [x] Verify all tests pass after package updates

## EAS Build Configuration Fixes
- [x] Create eas.json with build profiles (development, preview, production)
- [x] Set cli.appVersionSource to "remote" in eas.json
- [x] Add EAS_BUILD_NO_EXPO_GO_WARNING=true to suppress Expo Go warning
- [x] Set ios.deploymentTarget to "16.0" via expo-build-properties plugin in app.config.ts
- [x] Add ios.entitlements with aps-environment for push notifications
- [x] Add extra.eas.projectId placeholder to app.config.ts (set during eas init)

## EAS Build Fix: Remove empty submit fields
- [x] Remove empty submit.production section from eas.json (causes validation errors)

## EAS Project ID Configuration
- [x] Get EAS projectId from user (via eas init or Expo dashboard)
- [x] Add extra.eas.projectId to app.config.ts (369cf431-4f4b-4518-ac98-dfa01d9b90a6)

## EAS Build Enhancements
- [x] Install expo-updates package
- [x] Add expo-updates plugin to app.config.ts with runtimeVersion policy
- [x] Add updates config block to app.config.ts (url, enabled, checkOnLaunch)
- [x] Add production channel to production build profile in eas.json
- [x] Add preview channel to preview build profile in eas.json
- [x] Add simulator build profile to eas.json for iOS simulator testing
- [x] Add credentialsSource: "remote" to all build profiles
- [x] Add credentialsSource: "remote" to all profiles (EAS manages signing automatically)
- [x] OTA updates configured (expo-updates checks on app load automatically)
- [x] Verify all tests pass after expo-updates install (60 passed)

## EAS Slug & Warning Fixes
- [x] Update appSlug in app.config.ts from "food-preservation-app" to "yumkeeper-" to match EAS project
- [x] Add EAS_BUILD_NO_EXPO_GO_WARNING=true to all build profiles and base profile in eas.json

## EAS Credentials Fix
- [x] Guide user to run eas credentials interactively to generate Apple Distribution Certificate
- [x] Update eas.json to handle non-interactive credential builds correctly

## Android Build Configuration
- [x] Audit eas.json Android build profiles (APK for preview, AAB for production)
- [x] Verify android package name, adaptive icon, and permissions in app.config.ts
- [x] Ensure expo-doctor passes all Android-related checks (17/17 passed)
- [x] Verify no iOS-only native modules are blocking Android build (expo-symbols uses .ios.tsx platform file, safe)
- [x] Confirm Android build profile uses credentialsSource: remote for keystore auto-generation

## In-App Review Prompt (expo-store-review)
- [x] Install expo-store-review package
- [x] Create review trigger utility (tracks item count milestone in AsyncStorage)
- [x] Trigger review prompt after user adds their 5th food item
- [x] Ensure review prompt only fires once (never repeat)
- [x] Add Platform guard (iOS/Android only, skip on web)
- [x] Integrate into add-item save flow

## Android Notification Channels
- [x] Add named notification channels to app.config.ts (Expiry Alerts, Weekly Digest)
- [x] Update notification service to use named channel IDs

## Onboarding Flow (First-Launch)
- [x] Create onboarding screen 1: Welcome / hero with app value prop
- [x] Create onboarding screen 2: Key features highlight (inventory, tips, barcode)
- [x] Create onboarding screen 3: Free trial CTA with "Start Free Trial" button
- [x] First-launch detection via AsyncStorage
- [x] Wire onboarding into root layout (_layout.tsx)

## Privacy Policy & Legal Pages Follow-up
- [x] Update privacy policy contact email to a real monitored address
- [x] Add Privacy Policy link in Settings → About section (opens in-app browser)
- [x] Add Terms of Service link in Settings → About section
- [x] Create /terms route on Express server with full ToS HTML page
- [x] Add /terms-of-service redirect alias
- [x] Link both /privacy-policy and /terms from the Settings screen

## Legal Compliance Follow-up (Round 2)
- [x] Add "I agree to ToS and Privacy Policy" consent checkbox to onboarding slide 3
- [x] Make ToS and Privacy Policy links tappable inside the onboarding consent checkbox text
- [x] Gate "Start Free Trial" button behind consent checkbox (disabled until checked)
- [x] Store consent timestamp in AsyncStorage for audit trail
- [x] Add GDPR cookie/tracking consent banner to privacy-policy.html and terms.html
- [x] Banner gates analytics behind explicit opt-in (localStorage-based)
- [x] Add EN/FR/DE/ES language switcher to privacy-policy.html
- [x] Add EN/FR/DE/ES language switcher to terms.html
- [x] Translate key sections (headings + summaries) into FR, DE, ES

## Legal Compliance Follow-up (Round 3)
- [x] Add Dutch (NL) to language switcher on both legal pages
- [x] Translate all body paragraph text into FR, DE, ES, NL on privacy-policy.html
- [x] Translate all body paragraph text into FR, DE, ES, NL on terms.html
- [x] Add consent_records table to database schema
- [x] Add POST /api/legal/consent server endpoint to store consent records
- [x] Sync onboarding consent record to server after user logs in
- [x] Add CURRENT_POLICY_VERSION constant shared between app and server
- [x] On app launch, check stored consent version vs current version
- [x] Show re-consent modal if policy version is newer than stored consent
- [x] Re-consent modal links to updated ToS and Privacy Policy
- [x] On re-consent, update AsyncStorage and sync to server

## Legal Compliance Follow-up (Round 3)
- [x] Add Dutch (NL) to language switcher on both legal pages
- [x] Translate all body paragraph text into FR, DE, ES, NL on privacy-policy.html
- [x] Translate all body paragraph text into FR, DE, ES, NL on terms.html
- [x] Add consent_records table to database schema
- [x] Add POST /api/legal/consent server endpoint to store consent records
- [x] Sync onboarding consent record to server after user logs in
- [x] Add CURRENT_POLICY_VERSION constant shared between app and server
- [x] On app launch, check stored consent version vs current version
- [x] Show re-consent modal if policy version is newer than stored consent
- [x] Re-consent modal links to updated ToS and Privacy Policy
- [x] On re-consent, update AsyncStorage and sync to server

## Legal Compliance Follow-up (Round 4)
- [x] Bump CURRENT_POLICY_VERSION to 1.1 in lib/onboarding.ts and server/legal-router.ts
- [x] Update re-consent modal "What changed" summary for v1.1
- [x] Add legal.adminConsentStatus tRPC endpoint (admin-only) listing non-consented users
- [x] Add admin consent panel screen in app (admin role only)
- [x] Add deletion_requests table to database schema
- [x] Add legal.requestDeletion tRPC endpoint to log GDPR erasure requests
- [x] Add "Delete my account and data" button in Settings → About
- [x] Show confirmation dialog before submitting deletion request
- [x] Show success/error feedback after deletion request submitted
- [x] Store deletion request in DB with userId, requestedAt, status

## Legal Compliance Follow-up (Round 5)
- [x] Fix __dirname deployment error (ESM-safe path resolution)
- [x] Add email notification to user on deletion request submission
- [x] Add alert email to admin on new deletion request
- [x] Build admin deletion queue screen with all pending/processing requests
- [x] Add "Mark as Processing" action button in admin deletion queue
- [x] Add "Mark as Completed" action button in admin deletion queue
- [x] Add updateDeletionRequestStatus DB helper
- [x] Add legal.adminUpdateDeletionStatus tRPC endpoint (admin-only)
- [x] Add legal.adminDeletionQueue tRPC endpoint listing all requests
- [x] Add automated daily purge job (cron) for requests older than 30 days
- [x] Purge job deletes food inventory, consent records, and subscription data
- [x] Purge job marks deletion_requests status as "completed"

## Promotional Ad Page
- [x] Generate hero banner and feature images for YumKeeper ad
- [x] Build full-page promotional ad at /ad with hero, features, how-it-works, savings callout, testimonials, and CTA
- [x] Add /download redirect alias to /ad
- [x] Wire Open Graph and Twitter Card meta tags for social sharing
- [x] Link ad page to Privacy Policy, Terms of Service, and app download

## Ad Page Round 2
- [x] Generate downloadable promotional video for YumKeeper
- [x] Add video demo section to /ad page (autoplay muted + download button)
- [x] Create /ad-b A/B variant with alternative headline
- [x] Add UTM parameter tracking to all CTA links on both ad variants
- [x] Add EN/NL/DE/FR language switcher to /ad page
- [x] Add EN/NL/DE/FR language switcher to /ad-b page
- [x] Add /ad-b route to Express server

## URL Fix & Sitemap (Round 7)
- [x] Update Settings screen legal links to /api/privacy-policy and /api/terms
- [x] Update ReConsentModal links to /api/privacy-policy and /api/terms
- [x] Update onboarding.tsx consent checkbox links to /api/privacy-policy and /api/terms
- [x] Add /api/sitemap.xml route to Express server listing all public pages

## Rebranding: Remove All FreshKeep References
- [x] Replace all remaining "FreshKeep" text with "YumKeeper" across app source, server HTML, and config files

## Rebrand Completion (Round 2)
- [x] Update app.config.ts appName to YumKeeper and update store metadata
- [x] Regenerate app icon with YumKeeper branding (no FreshKeep text)
- [x] Replace assets/images/icon.png, splash-icon.png, favicon.png, android-icon-foreground.png
- [x] Update logoUrl in app.config.ts with new icon S3 URL

## Google Play Store Assets
- [x] Generate monochrome Android icon (white silhouette, transparent background)
- [x] Replace assets/images/android-icon-monochrome.png
- [x] Generate Google Play feature graphic (1024x500)
- [x] Generate phone screenshots (at least 2, 1080x1920)
- [ ] Add icon to /api/ad hero section

## Google Play Submission Assets (Round 2)
- [x] Generate 7-inch tablet screenshot (1200x1920)
- [x] Write keyword-optimised full Play Store description (4000 chars)
- [x] Write short description (80 chars)
- [x] Draft complete Google Play Data Safety form guide

## Tagline Update
- [x] Update tagline to a friendlier version across all touchpoints (onboarding, ad pages, store listing, legal pages)

## Personalised Greeting & Friendly Notifications
- [x] Add name input field to onboarding slide 3 (optional, friendly prompt)
- [x] Persist user's first name to AsyncStorage on onboarding completion
- [x] Update Dashboard greeting to use stored name with time-of-day personalisation (Good morning/afternoon/evening, [Name] 👋)
- [x] Soften expiry alert notification copy (e.g. "Hey! Your apple is best used in the next 2 days 🍎")
- [x] Soften weekly digest notification copy to match friendly brand voice

## Delete Account Web Page
- [x] Create standalone /api/delete-account HTML page with email submission form
- [x] Wire up POST handler to create deletion_requests record in DB
- [x] Register route in Express server

## App Icon & Store Screenshots
- [x] Generate polished app icon for YumKeeper
- [x] Save icon to all required asset paths (icon.png, splash-icon.png, favicon.png, android-icon-foreground.png)
- [x] Update app.config.ts logoUrl with new icon S3 URL
- [x] Generate 7-inch tablet screenshot (1200x1920)
- [x] Generate 10-inch tablet screenshot (1600x2560)

## Full Store Asset Pack
- [ ] Phone screenshot 1 — Onboarding / Welcome screen (1080x1920)
- [ ] Phone screenshot 2 — Dashboard with personalised greeting (1080x1920)
- [ ] Phone screenshot 3 — Inventory list with filter pills (1080x1920)
- [ ] Phone screenshot 4 — Add Item screen (1080x1920)
- [ ] Phone screenshot 5 — Expiry alerts / Notifications screen (1080x1920)
- [ ] Promotional video — 30-second app walkthrough (landscape 1920x1080)

## iOS App Store Assets & Submission
- [x] Generate 5 iPhone 6.7-inch screenshots (1290x2796)
- [x] Generate 3 iPad 12.9-inch screenshots (2048x2732)
- [x] Resize and compress all screenshots to Apple spec
- [x] Write App Store listing copy (title, subtitle, description, keywords)
- [x] Write EAS build and App Store Connect submission guide

## Package Name Update
- [x] Change Android package name to com.yumkeeper.app in app.config.ts

## iOS Bundle ID Update
- [x] Change iOS bundle identifier to com.yumkeeper.app in app.config.ts

## Version Code Bump
- [x] Set Android versionCode to 2 in app.config.ts for Play Store re-upload

## Release Recommendations
- [x] Bump version string to 1.0.1 in app.config.ts
- [x] Configure eas.json submit profile with Google Play service account
- [x] Document Google Play App Signing setup in submission guide

## Release Next Steps (Round 2)
- [x] Add iOS submit field instructions to eas.json comments
- [x] Add open testing promotion checklist to submission guide
- [x] Add service account key creation reminder to google-play-service-account-setup.md

## Privacy Compliance Documentation
- [x] Add Part 8 — User Data & Privacy Compliance section to submission guide

## Release Notes
- [x] Draft v1.0.1 release notes for Google Play and Apple App Store

## Automated EAS Builds
- [x] Add a protected GitHub Actions workflow for iOS and Android EAS builds
- [x] Add automated build setup, security, and release-operation documentation
- [x] Validate the workflow configuration and existing release profiles

## Automated Test Reliability
- [x] Activate and repair the skipped authentication logout test
- [x] Verify the complete suite runs without skipped tests

## Test Coverage & CI Guardrails
- [x] Add HTTP-level logout and session-cookie regression tests
- [x] Configure threshold-enforced session-cookie coverage reporting
- [x] Enforce active tests and upload coverage reports in CI
