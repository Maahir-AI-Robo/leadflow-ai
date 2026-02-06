# 🚀 AI-Powered Sales & Lead Engagement Platform

A full-featured sales engagement platform with AI-driven lead generation, campaign management, and direct outreach via WhatsApp and LinkedIn using the salesperson’s own phone apps — no third-party messaging APIs required.

The app is production-ready, mobile-first, and wrapped with Capacitor for native iOS and Android deployment. Backend is powered by Supabase with AI capabilities provided by Lovable AI.

---

## ✨ Features

### 🧠 AI Lead Generation
- AI-powered lead discovery using:
  - Industry
  - Job role
  - Company size
  - Location (GPS-enabled on mobile)
- Auto-generated lead profiles with:
  - AI score and reasoning
  - Contact hints
- No LinkedIn scraping or external lead APIs required

---

### 📍 Location-Based Lead Finder
- Mobile GPS support
- One-tap location detection
- Auto-fills city/region for hyper-local lead discovery

---

### 💬 Outreach (No External APIs)

#### WhatsApp
- Uses `wa.me` deep links
- Opens the user’s WhatsApp app with pre-filled messages
- Supports individual and bulk outreach
- No WhatsApp Business API required

#### LinkedIn
- Deep links to:
  - Saved LinkedIn profiles, or
  - Auto LinkedIn search by name + company
- Messages sent directly from the LinkedIn mobile app
- No LinkedIn API required

---

### 📣 Campaign Management
- Create, edit, and manage campaigns
- Edit Campaign dialog with 3 tabs:
  - **Details** – name, type, status
  - **Messages** – inline template editing
  - **Leads** – view and remove leads
- Reusable campaign form logic
- Edit button available on campaign cards

---

### 📧 Email Campaigns
- Email delivery via Resend
- Template-based campaigns
- Secure webhook handling for email events

---

### 👤 Profile & Settings
- Dedicated Profile page
  - Full name
  - Company
  - Job title
  - Avatar upload (5MB limit)
- Secure avatar storage via Supabase Storage
- Auto-creation of profile records
- Security page
  - Password change
  - Validation and security tips

---

### 📱 Mobile-First Navigation
- Optimized for mobile devices
- Bottom navigation with:
  - Home
  - Leads
  - Campaigns
  - Alerts
  - More (slide-up menu)
- Clean and uncluttered UI on small screens

---

### 🔐 Security
- Supabase Row Level Security (RLS) enforced
- Unsafe public insert policies removed
- Service-role edge functions for sensitive operations
- No secrets exposed in client-side code

---

## 🧰 Tech Stack

### Frontend
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Capacitor (iOS & Android)

### Backend
- Supabase (Postgres, Auth, Storage, Edge Functions)
- Lovable AI (lead generation, scoring, summaries)

---

## 🔑 Environment Variables

### Required for Full Functionality

| Variable | Description |
|--------|------------|
| `RESEND_API_KEY` | Email sending |
| `EMAIL_FROM_ADDRESS` | Custom sender address |
| `RESEND_WEBHOOK_SECRET` | Email webhook verification |

### Auto-Managed (No Action Required)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`
- `LOVABLE_API_KEY`

> WhatsApp and LinkedIn do **not** require API keys. Messaging works via deep links using the user’s phone apps.

---

## 📦 Native Mobile Deployment (Capacitor)

### Prerequisites
- Node.js 18+
- npm
- Xcode (for iOS)
- Android Studio (for Android)

---

### Install Dependencies
```bash
npm install

### Build Web App
npm run build

### Add Native Platforms
npx cap add ios
npx cap add android

### Sync Web Build to Native
npx cap sync

### Run on Device or Emulator
npx cap run ios
npx cap run android

✅ Status

All pages functional

AI Lead Finder fully working

Campaigns, leads, and templates stable

Mobile UI optimized

Ready for:

Capacitor native deployment

Flutter frontend integration

Production use
