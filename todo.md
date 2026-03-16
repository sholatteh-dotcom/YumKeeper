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
