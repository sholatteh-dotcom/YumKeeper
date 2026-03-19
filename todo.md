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
