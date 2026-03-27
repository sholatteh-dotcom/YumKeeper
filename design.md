# YumKeeper – Food Preservation App Design Plan

## Brand Identity

- **App Name**: YumKeeper
- **Tagline**: Your kitchen's best friend — fresher food, happier meals, and a little more money in your pocket.
- **Primary Color**: `#2D8A4E` (Forest Green) – evokes freshness, nature, food
- **Accent Color**: `#F4A228` (Warm Amber) – warmth, harvest, urgency for expiry
- **Background (Light)**: `#F9FAF7` – soft off-white with green tint
- **Background (Dark)**: `#121A14` – deep forest dark
- **Surface (Light)**: `#FFFFFF`
- **Surface (Dark)**: `#1C2B1F`
- **Error/Expired**: `#E53E3E` (Red)
- **Warning/Expiring Soon**: `#F4A228` (Amber)
- **Success/Fresh**: `#2D8A4E` (Green)

---

## Screen List

1. **Dashboard (Home)** – Overview of pantry health, expiry alerts, quick stats
2. **Inventory** – Full list of tracked food items with filter/search
3. **Add Item** – Form to add a new food item with category, quantity, expiry date
4. **Item Detail** – Detailed view of a food item with preservation tips specific to that food
5. **Preservation Tips** – Browse preservation methods (freezing, canning, pickling, drying, etc.)
6. **Tip Detail** – Step-by-step guide for a specific preservation technique
7. **Settings** – App preferences, notification settings, theme toggle

---

## Primary Content and Functionality

### Dashboard (Home)
- Greeting header with date
- Summary cards: Total items, Expiring Soon (≤3 days), Expired, Fresh
- Horizontal scroll list of "Expiring Soon" items (urgent alerts)
- Category quick-access chips (Fridge, Freezer, Pantry, Cellar)
- Recent activity feed
- Floating Action Button (FAB) to add new item

### Inventory
- Search bar at top
- Filter tabs: All | Fridge | Freezer | Pantry | Cellar
- Sort options: Expiry Date, Name, Category
- FlatList of food cards showing: emoji/icon, name, category badge, days remaining, quantity
- Color-coded expiry status: green (fresh), amber (expiring soon), red (expired)
- Swipe-to-delete on items
- FAB to add new item

### Add Item
- Food name input (with auto-suggest from common foods database)
- Category picker (Fridge, Freezer, Pantry, Cellar)
- Quantity + unit picker
- Purchase date (defaults to today)
- Expiry date picker
- Preservation method selector (how it's currently stored)
- Notes field
- Save button

### Item Detail
- Food name, category, quantity
- Days remaining (large prominent display)
- Expiry date and purchase date
- Storage tips specific to that food type
- Preservation options: "How to extend shelf life" section
- Edit and Delete actions

### Preservation Tips
- Header with search
- Category tabs: All | Freezing | Canning | Pickling | Drying | Fermenting | Vacuum Sealing | Smoking
- Grid of technique cards with icon, name, difficulty badge, time estimate
- Featured tip of the day

### Tip Detail
- Technique name and description
- Difficulty level and time required
- Best foods for this technique (chips)
- Step-by-step instructions (numbered list)
- Equipment needed
- Pro tips section
- Related techniques

### Settings
- Notification preferences (expiry alerts: 1 day, 3 days, 7 days before)
- Default storage location
- Theme (Light / Dark / System)
- About section

---

## Key User Flows

### Flow 1: Add a Food Item
1. User opens app → Dashboard
2. Taps FAB (+) button
3. Add Item screen slides up
4. Types food name → auto-suggest appears
5. Selects category, sets expiry date
6. Taps Save → item added to inventory
7. Returns to Dashboard with updated count

### Flow 2: Check Expiring Items
1. User opens app → Dashboard
2. Sees "Expiring Soon" card with count
3. Taps on expiring item card
4. Item Detail screen shows days remaining prominently
5. User reads preservation tips to extend shelf life
6. User taps "Mark as Used" or "Delete"

### Flow 3: Learn Preservation Technique
1. User taps "Tips" tab
2. Browses by category (e.g., Freezing)
3. Taps a technique card (e.g., "Blanching before Freezing")
4. Reads step-by-step guide
5. Returns to inventory to apply knowledge

### Flow 4: Get Expiry Notification
1. App sends local notification: "🍎 Apple expires in 2 days"
2. User taps notification → opens Item Detail
3. User decides to preserve or consume

---

## Color Choices

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `primary` | `#2D8A4E` | `#4CAF72` | Buttons, active tabs, FAB |
| `accent` | `#F4A228` | `#FBBF24` | Warnings, expiring badges |
| `background` | `#F9FAF7` | `#121A14` | Screen backgrounds |
| `surface` | `#FFFFFF` | `#1C2B1F` | Cards, modals |
| `foreground` | `#1A2E1C` | `#E8F5E9` | Primary text |
| `muted` | `#6B7C6D` | `#8FA892` | Secondary text |
| `border` | `#D8E8DA` | `#2D4A32` | Dividers, card borders |
| `success` | `#2D8A4E` | `#4CAF72` | Fresh items |
| `warning` | `#F4A228` | `#FBBF24` | Expiring soon |
| `error` | `#E53E3E` | `#FC8181` | Expired items |

---

## Typography

- **Headers**: Bold, 24-32px
- **Card titles**: SemiBold, 16-18px
- **Body**: Regular, 14-15px, line-height 1.5
- **Labels/Badges**: Medium, 11-12px, uppercase

---

## Component Patterns

- **Food Card**: Rounded corners (16px), subtle shadow, left color-coded strip for expiry status
- **Category Badge**: Pill shape, colored by category (Fridge=blue, Freezer=cyan, Pantry=brown, Cellar=purple)
- **Expiry Badge**: Color-coded pill (green/amber/red) with days remaining
- **FAB**: Large circular button, primary color, bottom-right, with haptic feedback
- **Section Headers**: Bold label + "See All" link
- **Tip Cards**: Square-ish cards in a 2-column grid, icon + title + difficulty chip
