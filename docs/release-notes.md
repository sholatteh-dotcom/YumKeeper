# YumKeeper — Release Notes

---

## Version 1.0.1 — Initial Release

*Released: April 2026*

---

### Google Play Store — "What's New" (500 characters max)

> Welcome to YumKeeper — your kitchen's best friend! 🫙
>
> Track everything in your fridge, freezer, pantry, and cellar. Get friendly nudges before food expires so you can use it up at just the right time. Most households save over £800 a year simply by wasting less — and YumKeeper makes that effortless.
>
> • Personalised greeting with your name
> • Friendly expiry alerts (not nagging ones)
> • Built-in food preservation tips
> • Works fully offline — your data stays on your device

---

### Apple App Store — "What's New" (4,000 characters max)

Welcome to YumKeeper — your kitchen's best friend. 🫙

This is the very first release of YumKeeper, and we're so glad you're here. Here's everything that's included in version 1.0.1:

**Track your food, effortlessly.** Add items to your fridge, freezer, pantry, or cellar in seconds using the emoji food picker. Set an expiry date and YumKeeper remembers everything so you don't have to.

**Friendly alerts, not nagging notifications.** Instead of cold, clinical reminders, YumKeeper speaks to you like a friend: "Heads up! Your organic milk is best used tomorrow 🥛". You'll always know what needs using up — without the guilt.

**Personalised just for you.** Tell YumKeeper your name during setup and every morning you'll be greeted with a warm "Good morning, Sarah 👋". It's a small touch that makes your kitchen feel a little more like home.

**Preservation tips built in.** Not sure how long cherry tomatoes last in the fridge? YumKeeper surfaces expert preservation tips right when you add an item, so you always store food the right way.

**Your data, your device.** YumKeeper works entirely offline. Your food inventory is stored privately on your device — no account required, no data shared with anyone.

**Designed for iPhone and iPad.** YumKeeper is optimised for every screen size. On iPad, the inventory screen uses a beautiful split-view layout so you can browse categories and items side by side.

We'd love to hear what you think. If you enjoy YumKeeper, please leave a review — it means the world to a small team and helps other households discover a smarter way to manage their kitchen. 🙏

---

### Internal / TestFlight Release Notes (for testers)

**Build:** 1.0.1 (versionCode 2)
**Date:** April 2026
**Track:** Internal → Open Testing

This build includes the following changes since the initial scaffold:

- Onboarding flow with 3 slides, optional name capture, and AsyncStorage persistence.
- Personalised Dashboard greeting using time-of-day logic ("Good morning / afternoon / evening, [Name] 👋").
- Friendly expiry alert notification copy ("Just a nudge — your apple is best used in the next 3 days 🍎").
- Softer weekly digest notification ("Your weekly kitchen check-in 🫙").
- Updated tagline across all touchpoints: "Your kitchen's best friend — fresher food, happier meals, and a little more money in your pocket."
- Delete account web page live at `/api/delete-account` for GDPR Article 17 compliance.
- Android package name updated to `com.yumkeeper.app`.
- iOS bundle identifier updated to `com.yumkeeper.app`.
- New app icon (512×512, branded jar design).
- Store assets: 5 phone screenshots, 7-inch and 10-inch tablet screenshots, 1024×500 feature graphic.
- iOS App Store screenshots: 5 iPhone 6.7-inch, 3 iPad Pro 12.9-inch.
- EAS submit profile configured for Android auto-submission.
- Privacy Policy and Terms of Service pages live on the server.

**Known limitations in this build:**
- Barcode scanner requires a physical device (not available in Expo Go web preview).
- Push notifications require a physical device with notification permissions granted.

**Testing focus areas:**
- Add, edit, and delete food items across all four storage locations (Fridge, Freezer, Pantry, Cellar).
- Verify expiry alert notifications fire at the correct time.
- Confirm the personalised greeting displays correctly after entering a name in onboarding.
- Test the delete account form at `/api/delete-account` and confirm the confirmation message appears.

---

### Version History

| Version | Build | Date | Notes |
|---------|-------|------|-------|
| 1.0.1 | 2 | April 2026 | Initial public release |
