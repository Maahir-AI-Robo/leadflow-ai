# 🚀 LeadFlow AI — AI-Powered Sales & Lead Engagement

LeadFlow AI is a mobile-first, production-ready sales engagement platform that combines AI-driven lead discovery and scoring with direct outreach through users’ own WhatsApp and LinkedIn mobile apps (no third‑party messaging APIs required). The web app is wrapped with Capacitor for native iOS and Android deployment. The backend uses Supabase; AI capabilities are provided via Lovable AI.

Table of contents
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Mobile (Capacitor) Build & Release](#mobile-capacitor-build--release)
- [Deployment & Production Notes](#deployment--production-notes)
- [Security](#security)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License & Contact](#license--contact)

---

## Key Features

- AI Lead Generation
  - Discover leads by industry, role, company size, and location (mobile GPS available).
  - Auto-generated profiles with an AI score, reasoning, and contact hints.
  - No LinkedIn scraping or external lead APIs required.

- Outreach (No External Messaging APIs)
  - WhatsApp: uses `wa.me` deep links to open user’s WhatsApp app with prefilled messages. Supports single and bulk outreach.
  - LinkedIn: deep links to saved profiles or performs an auto-search by name + company for messaging within the LinkedIn mobile app.

- Campaign Management
  - Create, edit, and manage campaigns.
  - Campaign editor with tabs for Details, Messages (inline templates), and Leads.
  - Reusable campaign form logic and edit button on campaign cards.

- Email Campaigns
  - Email delivery via Resend.
  - Template-based campaigns with secure webhook handling for delivery events.

- Mobile-first UI
  - Optimized navigation (bottom tabs): Home, Leads, Campaigns, Alerts, More.
  - Clean, mobile-optimized layout and Capacitor-native packaging for Android & iOS.

---

## Tech Stack

- Frontend: React, TypeScript, Tailwind CSS, shadcn/ui
- Mobile wrapper: Capacitor (iOS & Android)
- Backend: Supabase (Postgres, Auth, Storage, Edge Functions)
- AI: Lovable AI (lead generation, scoring, summaries)
- Email: Resend

---

## Quick Start

Prerequisites:
- Node.js 18+
- npm
- Supabase project (for Auth, Postgres, Storage)
- Xcode (macOS) for iOS builds
- Android Studio for Android builds

1. Clone
```bash
git clone https://github.com/Maahir-AI-Robo/leadflow-ai.git
cd leadflow-ai
```

2. Install
```bash
npm install
```

3. Environment
- Copy `.env.example` to `.env.local` (or use your deployment platform’s secret manager) and fill in required variables (see below).

4. Run (development)
```bash
npm run dev
```

---

## Environment Variables

Required for full functionality:

- RESEND_API_KEY — Resend API key used for email send
- EMAIL_FROM_ADDRESS — Verified sender address for Resend
- RESEND_WEBHOOK_SECRET — Shared secret to verify Resend webhooks
- LOVABLE_API_KEY — API key for Lovable AI (lead generation and scoring)

Supabase-managed (usually auto-managed by the platform; ensure values are present for local dev):
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (server only — do NOT expose to clients)
- SUPABASE_DB_URL

Example .env.local
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=public-anon-key
SUPABASE_SERVICE_ROLE_KEY=service-role-key
LOVABLE_API_KEY=sk_live_...
RESEND_API_KEY=rs_live_...
EMAIL_FROM_ADDRESS=me@yourdomain.com
RESEND_WEBHOOK_SECRET=whsec_...
```

Notes:
- Never commit secrets. Use a secret manager or environment variables in your CI/CD.
- Keep `SUPABASE_SERVICE_ROLE_KEY` on server-only code (edge functions, backend services).

---

## Local Development

Common npm scripts:
- npm run dev — run the app in development mode
- npm run build — build web assets
- npm run start — serve the production build (after build)
- npm run lint — run linters
- npm run test — run tests (if present)

Edge functions & server actions:
- Implement server-only logic (email sending, service-role DB operations) in Supabase Edge Functions or server runtime using service role key.

Storage:
- Avatars and file uploads use Supabase Storage. Configure CORS and appropriate RLS policies for secure access.

---

## Mobile (Capacitor) Build & Release

Add Capacitor platforms and build native apps:

1. Build the web app
```bash
npm run build
```

2. Add native platforms (one-time)
```bash
npx cap add ios
npx cap add android
```

3. Sync web build to native projects
```bash
npx cap sync
```

4. Run on device or emulator
```bash
npx cap run ios
npx cap run android
```

Notes:
- For iOS, open the Xcode workspace generated under `ios/` and configure signing, capabilities, and App Store settings.
- For Android, open the project in Android Studio and configure keystore, signing, and release settings.

---

## Deployment & Production Notes

- Host the web app on Vercel, Netlify, or any static host capable of serving your build.
- Ensure Supabase config is set in your deployment environment variables.
- Use HTTPS and secure cookies for auth tokens.
- Rotate and store secrets securely (Resend, Lovable, Supabase service role).
- Monitor email webhooks (Resend) and secure webhook endpoints using `RESEND_WEBHOOK_SECRET`.

Performance:
- Cache AI-generated content where possible.
- Rate-limit AI calls and key operations to manage cost and performance.

---

## Security

- Supabase Row Level Security (RLS) enforced — remove unsafe public insert policies.
- Use service-role-only edge functions for sensitive actions requiring elevated permissions.
- Do not expose service role keys in client code.
- Validate and sanitize user input before using it in AI prompts or DB queries.
- Limit file upload sizes (avatar limit: 5 MB recommended).

---

## Contributing

Contributions are welcome.

Guidelines:
- Open issues for bugs or feature requests.
- Use feature branches and open pull requests.
- Follow the code style (TypeScript, Tailwind, shadcn/ui) and add tests where appropriate.
- Document major changes in the PR description.

Suggested labels: enhancement, bug, docs, help wanted.

---

## Troubleshooting

- WhatsApp deep links not opening? Confirm mobile environment and correct `wa.me` format; desktop browsers may not handle mobile app deep links.
- LinkedIn deep link searches may vary by OS and LinkedIn app version; fallback to opening profile URL where possible.
- Email not sending? Check `RESEND_API_KEY` and `EMAIL_FROM_ADDRESS` match Resend account and are verified.

If you hit auth issues, verify Supabase keys and RLS policies.

---

## License & Contact

- License: (add your license here, e.g., MIT)
- Maintainer: Maahir-AI-Robo — https://github.com/Maahir-AI-Robo
