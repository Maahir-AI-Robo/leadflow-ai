🚀 AI-Powered Sales & Lead Engagement Platform

A full-featured sales engagement platform with AI lead generation, campaign management, and direct outreach via WhatsApp & LinkedIn using the salesperson’s own phone apps — no third-party messaging APIs required.

Built with a modern web stack and wrapped using Capacitor for native mobile deployment (Android & iOS). Backend powered by Supabase with AI features via Lovable AI.

✨ Key Features
🧠 AI Lead Generation

AI-powered lead discovery based on:

Industry

Job role

Company size

Location (GPS-enabled on mobile)

Auto-generated lead profiles with:

Name

Company

Role

Contact hints

AI score & reasoning

No LinkedIn or external scraping APIs required

📍 Location-Based Lead Finding

Mobile GPS integration

One-tap 📍 location detection

Automatically fills city/region for hyper-local lead discovery

💬 Outreach (No External Messaging APIs)

All outreach happens through the user’s own phone apps:

WhatsApp

Uses wa.me deep links

Opens the user’s WhatsApp app with pre-filled messages

Works for individual & bulk outreach

No WhatsApp Business API required

LinkedIn

Deep links to:

Existing LinkedIn profile (if saved)

Auto LinkedIn search by name + company

Messages sent directly from the LinkedIn mobile app

No LinkedIn API required

📣 Campaign Management

Create & edit campaigns

Campaign edit dialog with tabs:

Details – name, type, status

Messages – edit templates inline

Leads – view/remove assigned leads

Campaign cards with edit dropdown

Reusable campaign form logic

📧 Email Campaigns

Email sending via Resend

Supports templates & campaigns

Secure webhook handling for delivery events

👤 Profile & Settings

Dedicated Profile page

Full name

Company

Job title

Avatar upload (5MB limit)

Avatar stored securely in Supabase Storage

Auto-creation of profile records

Security page

Password change

Validation & security tips

📱 Mobile-First Navigation

Optimized for small screens

Bottom navigation with:

Home

Leads

Campaigns

Alerts

More (slide-up menu)

Clean, uncluttered UI on mobile

🔐 Security

Row Level Security (RLS) enforced

Removed unsafe public insert policies

Service-role edge functions for sensitive operations

No exposed credentials in client-side code

🧰 Tech Stack
Frontend

React

TypeScript

Tailwind CSS

Shadcn/UI

Capacitor (iOS & Android)

Backend

Supabase (Postgres, Auth, Storage, Edge Functions)

Lovable AI (lead generation, summaries, scoring)

🔑 Required Environment Secrets
Required for Full Functionality
Secret	Purpose
RESEND_API_KEY	Send real emails
EMAIL_FROM_ADDRESS	Custom sender email
RESEND_WEBHOOK_SECRET	Verify email webhooks
Auto-Managed (No Action Needed)

SUPABASE_URL

SUPABASE_ANON_KEY

SUPABASE_SERVICE_ROLE_KEY

SUPABASE_DB_URL

LOVABLE_API_KEY

ℹ️ WhatsApp & LinkedIn do NOT require API keys — messaging works via deep links using the user’s phone apps.

📦 Native Mobile Deployment (Capacitor)
Prerequisites

Node.js 18+

npm or pnpm

Xcode (for iOS)

Android Studio (for Android)

Setup
npm install

Build Web App
npm run build

Add Native Platforms
npx cap add ios
npx cap add android

Sync Build to Native
npx cap sync

Run on Device / Emulator
npx cap run ios
npx cap run android


Hot reload is enabled during development via the Capacitor config.

🧪 Current Status

✅ All pages functional
✅ AI Lead Finder fully working
✅ Campaigns, Leads, Templates stable
✅ Mobile navigation optimized
✅ Ready for:

Capacitor native builds

Flutter frontend (backend-compatible)

Production deployment

🛣️ Recommended Next Steps

Flutter UI consuming the same Supabase backend

Push notifications (Firebase / APNs)

CRM integrations (optional)

Team roles & permissions

Analytics dashboards
