# VOOM UI Update — Ghana Weekend Launch

## How to Apply
You can either:

### Option A: Apply the patch (fastest)
```bash
cd Voom
git apply FULL_PATCH.diff
```

### Option B: Copy individual files
Copy each file from this folder to the matching path in your Voom repo.

---

## What Changed (21 files)

### 🎨 Design System
- **`client/index.html`** — Added DM Serif Display (serif heading font) + DM Sans (body font) from Google Fonts to match Figma typography
- **`client/src/index.css`** — Updated font-family: headings now use `DM Serif Display` (serif), body uses `DM Sans`

### 💰 Ghana Market (FCFA → GHS)
- **`client/src/lib/utils.ts`** — Default currency changed to GHS (₵), conversion rates updated, GHS formatting no longer shows decimal places
- **`client/src/hooks/use-currency.tsx`** — Default currency state set to `GHS`
- **`client/src/pages/account-preferences.tsx`** — FCFA → GHS
- **`client/src/pages/payment-methods.tsx`** — FCFA → GHS display
- **`client/src/pages/become-host-rates.tsx`** — Labels say "GHS" not "FCFA"
- **`client/src/pages/become-host/car-rates.tsx`** — GHS labels, adjusted default rate values for Ghana market
- **`client/src/pages/become-host-summary.tsx`** — Currency + city updated (Douala → Accra)
- **`client/src/pages/become-host/car-summary.tsx`** — Currency → GHS
- **`client/src/pages/booking-confirm.tsx`** — Currency → GHS
- **`client/src/components/booking-process-fixed.tsx`** — Currency → GHS

### 🇬🇭 French → English
- **`client/src/pages/all-cars.tsx`** — "Prise en charge et retour" → "Pick-up & return", "Annuler Gratuitement" → "Free Cancellation", "/jour" → "/day"
- **`client/src/pages/message-detail.tsx`** — Location references updated to Accra, Ghana

### 📱 Core UI Components (Figma Pixel-Match)
- **`client/src/components/car-card.tsx`** — Complete rewrite:
  - Rounded image container with white heart button
  - Serif heading for car name
  - Star rating on the right (filled black star)
  - "Pick-up & return: [city]" + "Free Cancellation" text
  - Bold serif price with /day suffix
  - Italic red "VOOM" branding bottom-right
  
- **`client/src/components/car-categories.tsx`** — Complete rewrite:
  - Image thumbnails instead of icon circles (matches Figma)
  - Red border on selected category
  - Horizontal scroll, clean labels

- **`client/src/components/layout/bottom-nav.tsx`** — Complete rewrite:
  - HOME / FAVORITES / BOOKINGS / MESSAGES / ACCOUNT
  - Uppercase labels with letter-spacing
  - Red active state (#C41E24-ish via hsl primary)
  - Red notification badge on MESSAGES (count: 3)
  - Safe area padding for mobile

### 📄 Page Redesigns
- **`client/src/pages/home.tsx`** — Complete rewrite:
  - Clean search bar with filter icon (matches Figma)
  - Category thumbnails
  - Vertical car card feed (no grid)
  - Empty state with "No car found" message
  - No header component — clean minimal top

- **`client/src/pages/favorites.tsx`** — Redesigned:
  - Serif "Favorites" heading
  - Same car card layout as home
  
- **`client/src/pages/bookings.tsx`** — Complete rewrite:
  - "Current Booking" / "Booking History" tabs (matches Figma)
  - Car thumbnail with serif heading + star rating
  - Booking details: ID, dates, location
  - Total section with bold price
  - Empty state

- **`client/src/pages/car-detail.tsx`** — Key updates:
  - **Reserve Now → WhatsApp deep link** to YOUR number
  - Pre-filled message with car name, location, rate, dates
  - Price display uses GHS with car currency
  - Serif heading on price in sticky bottom bar

---

## ⚠️ Action Required Before Launch

### 1. Set your WhatsApp number
In `client/src/pages/car-detail.tsx`, find this line:
```typescript
const VOOM_WHATSAPP_NUMBER = "233XXXXXXXXX";
```
Replace with your actual Ghana WhatsApp number (with country code, no + or spaces).

### 2. Seed Ghana car data
The existing DB likely has FCFA-priced cars. You'll want to:
- Update existing car records to use `currency: "GHS"` and adjust `dailyRate` to GHS values
- Update `city` fields to Ghana cities (Accra, Kumasi, etc.)
- Replace placeholder images with real car photos from owners

### 3. Share the Facebook post link
The app should be shared as: `https://v0-voom.vercel.app`
Users land on the home feed, browse cars, tap one, and "Reserve Now" opens WhatsApp to you.

---

## User Flow for Weekend Launch
```
Facebook Group Post → Voom Home Feed → Browse/Filter Cars → 
Car Detail Page → "Reserve Now" → WhatsApp Chat (to you) → 
You relay to car owner → Booking confirmed manually
```
