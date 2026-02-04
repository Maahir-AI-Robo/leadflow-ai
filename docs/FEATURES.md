# LeadFlow AI - Feature Documentation

A comprehensive AI-powered lead management and outreach platform built with React, TypeScript, and Supabase.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Dashboard](#dashboard)
3. [Lead Management](#lead-management)
4. [Campaigns](#campaigns)
5. [Email Templates Library](#email-templates-library)
6. [Email Tracking](#email-tracking)
7. [Webhook Endpoints](#webhook-endpoints)
8. [Message Analytics](#message-analytics)
9. [Notifications](#notifications)
10. [Database Schema](#database-schema)

---

## Authentication

**Location:** `/auth`

### Features
- Email/password sign up and sign in
- Session persistence with auto-refresh
- Protected routes with automatic redirect
- User profiles created automatically on signup

### Implementation
- `src/hooks/useAuth.tsx` - Auth context and hooks
- `src/pages/Auth.tsx` - Auth UI component
- Supabase Auth with RLS policies

---

## Dashboard

**Location:** `/` (Index)

### Features
- **Stats Overview**: Total leads, hot/warm/cold leads, active campaigns
- **Follow-ups List**: Upcoming and overdue follow-ups with quick actions
- **AI Suggestions**: Smart recommendations for lead engagement
- **Activity Feed**: Recent activities across all leads
- **Pull-to-Refresh**: Mobile-friendly refresh gesture
- **New User Onboarding**: Empty state with CTA for first lead

### Implementation
- `src/pages/Index.tsx` - Main dashboard page
- `src/hooks/useDashboardStats.ts` - Stats aggregation hook
- `src/components/dashboard/` - Dashboard components

---

## Lead Management

**Location:** `/leads`

### Features
- **Lead List**: Filterable, searchable lead cards
- **Lead Scoring**: Hot/warm/cold classification with visual badges
- **Star/Favorite**: Quick-access starred leads
- **Add Lead Dialog**: Manual lead creation form
- **Edit Lead Dialog**: Update lead information
- **Lead Detail View**: Full lead profile with tabs

### Communication Actions
- **Email Dialog**: Send emails with template support
- **WhatsApp Dialog**: Send WhatsApp messages
- **Bulk Email**: Send to multiple leads at once
- **Bulk WhatsApp**: Bulk messaging via WhatsApp
- **Schedule Follow-up**: Set reminders for future contact

### AI Features
- **AI Summary**: Auto-generated lead insights
- **LinkedIn Search**: Find leads via LinkedIn integration

### Implementation
- `src/pages/Leads.tsx` - Lead management page
- `src/hooks/useLeads.ts` - Lead CRUD operations
- `src/hooks/useLeadAI.ts` - AI-powered lead analysis
- `src/components/leads/` - Lead components

---

## Campaigns

**Location:** `/campaigns`

### Features
- **Campaign Builder**: Multi-step wizard for campaign creation
  1. Campaign Basics (name, type, settings)
  2. Select Leads (choose target leads)
  3. Generate Messages (AI-powered or manual templates)
  4. Review & Publish

- **Campaign Types**: Email, WhatsApp, LinkedIn, Multi-channel
- **Campaign Status**: Draft, Active, Paused, Completed
- **Campaign Leads**: Track individual lead progress within campaigns
- **Email Tracking Stats**: Per-campaign delivery metrics

### AI Features
- AI-generated message sequences
- Personalization variables ({{name}}, {{company}}, etc.)
- Smart follow-up scheduling

### Implementation
- `src/pages/Campaigns.tsx` - Campaign management
- `src/hooks/useCampaigns.ts` - Campaign CRUD
- `src/hooks/useCampaignBuilder.ts` - Builder state management
- `src/hooks/useCampaignExecution.ts` - Campaign execution logic
- `src/components/campaigns/` - Campaign components

---

## Email Templates Library

**Location:** `/templates`

### Features
- **Template Grid**: Visual library of reusable templates
- **Search & Filter**: Find templates by name or category
- **Categories**: General, Sales, Follow-up, Introduction, etc.
- **Favorites**: Mark frequently used templates
- **Variables**: Auto-extracted placeholders ({{name}}, {{company}}, etc.)
- **Tags**: Organize templates with custom tags
- **Use Count**: Track template popularity

### Template Editor
- Rich text subject and body editing
- Quick-insert variable buttons
- Tag management
- Category selection
- Preview with sample data

### Implementation
- `src/pages/Templates.tsx` - Templates page
- `src/hooks/useEmailTemplates.ts` - Template CRUD and variable extraction
- `src/components/email/EmailTemplatesLibrary.tsx` - Template grid
- `src/components/email/EmailTemplateEditor.tsx` - Create/edit dialog

---

## Email Tracking

### Features
- **Open Tracking**: 1x1 pixel tracking for email opens
- **Click Tracking**: Wrapped links for click detection
- **Unique Tracking ID**: Per-message tracking identifier
- **Metrics Stored**:
  - `opens_count` - Total opens
  - `clicks_count` - Total clicks
  - `first_opened_at` - First open timestamp

### Tracking Events Table
Records individual tracking events with:
- Event type (open, click)
- IP address
- User agent
- URL (for clicks)
- Timestamp

### Campaign Stats Component
Displays per-campaign metrics:
- Total sent
- Unique opens
- Open rate
- Unique clicks
- Click rate
- Click-to-open rate

### Implementation
- `supabase/functions/email-tracking/index.ts` - Tracking pixel/link handler
- `src/hooks/useEmailTracking.ts` - Tracking stats hooks
- `src/components/campaigns/EmailTrackingStats.tsx` - Stats display

---

## Webhook Endpoints

### Email Webhook (Resend)

**URL:** `https://[project-id].supabase.co/functions/v1/webhook-email`

**Supported Events:**
- `email.sent` - Email sent
- `email.delivered` - Email delivered
- `email.opened` - Email opened
- `email.clicked` - Link clicked
- `email.bounced` - Email bounced
- `email.complained` - Spam complaint
- `email.delivery_delayed` - Delivery delayed

**Security:** Optional Svix signature verification via `RESEND_WEBHOOK_SECRET`

### WhatsApp Webhook (Twilio)

**URL:** `https://[project-id].supabase.co/functions/v1/webhook-whatsapp`

**Supported Statuses:**
- `queued` - Message queued
- `sent` - Message sent
- `delivered` - Message delivered
- `read` - Message read
- `failed` - Delivery failed
- `undelivered` - Undelivered

**Features:**
- Updates message_logs with delivery status
- Creates notifications for important events
- Updates lead's last activity on read
- Handles incoming messages

**Security:** Optional Twilio signature verification via `TWILIO_AUTH_TOKEN`

### Implementation
- `supabase/functions/webhook-email/index.ts`
- `supabase/functions/webhook-whatsapp/index.ts`

---

## Message Analytics

**Location:** `/analytics`

### Dashboard Metrics

**Overall Stats:**
- Delivery Rate (% of messages delivered)
- Read Rate (% of delivered messages read)
- Response Rate (% of messages with responses)
- Failure Rate (% of failed messages)

### Visualizations

1. **7-Day Trend Chart**
   - Line graph showing sent, delivered, responded over time

2. **Channel Distribution**
   - Pie chart showing message volume by channel
   - Progress bars with delivery/response rates per channel

3. **Channel Performance**
   - Bar chart comparing delivered/read/responded by channel

4. **Most Engaged Leads**
   - Ranked list of leads with highest response rates
   - Shows response count and message count

### Implementation
- `src/pages/Analytics.tsx` - Analytics page
- `src/hooks/useMessageAnalytics.ts` - Analytics data aggregation
- `src/components/dashboard/MessageAnalytics.tsx` - Charts and metrics

---

## Notifications

**Location:** `/notifications`

### Features
- Real-time notification list
- Read/unread status
- Priority levels (normal, high)
- Type categorization (AI, engagement, alert)
- Link to related leads

### Implementation
- `src/pages/Notifications.tsx`
- `src/hooks/useNotifications.ts`

---

## Database Schema

### Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profile data |
| `leads` | Lead contact information and scoring |
| `activities` | Activity log for leads |
| `campaigns` | Campaign definitions |
| `campaign_leads` | Lead-campaign relationships |
| `campaign_templates` | Message templates per campaign step |
| `email_templates` | Reusable email template library |
| `message_logs` | All sent messages with tracking data |
| `email_tracking_events` | Individual open/click events |
| `follow_ups` | Scheduled follow-up reminders |
| `notifications` | User notifications |

### Key Relationships
- `leads` ← `activities` (lead_id)
- `campaigns` ← `campaign_leads` (campaign_id)
- `campaigns` ← `campaign_templates` (campaign_id)
- `leads` ← `campaign_leads` (lead_id)
- `message_logs` ← `email_tracking_events` (message_log_id)
- `leads` ← `message_logs` (lead_id)
- `campaigns` ← `message_logs` (campaign_id)

### Row Level Security
All tables have RLS enabled with user-specific policies:
- Users can only access their own data
- `email_tracking_events` allows public INSERT for tracking

---

## Edge Functions

| Function | Purpose |
|----------|---------|
| `email-send` | Send emails via Resend API |
| `email-tracking` | Handle open/click tracking pixels |
| `webhook-email` | Receive Resend delivery webhooks |
| `whatsapp-send` | Send WhatsApp messages via Twilio |
| `webhook-whatsapp` | Receive Twilio status webhooks |
| `lead-ai` | AI-powered lead analysis |
| `campaign-ai` | AI-generated campaign messages |
| `linkedin-search` | LinkedIn profile search |

---

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, shadcn/ui components
- **State:** TanStack React Query
- **Routing:** React Router v6
- **Backend:** Supabase (Postgres, Auth, Edge Functions)
- **Charts:** Recharts
- **Animations:** Framer Motion

---

## Environment Variables

Required secrets (configured in Supabase):
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (edge functions)

Optional secrets:
- `RESEND_API_KEY` - For email sending
- `RESEND_WEBHOOK_SECRET` - For webhook verification
- `TWILIO_ACCOUNT_SID` - For WhatsApp
- `TWILIO_AUTH_TOKEN` - For WhatsApp webhook verification
- `TWILIO_WHATSAPP_FROM` - WhatsApp sender number

---

## Navigation Structure

```
/ (Dashboard)
├── /leads (Lead Management)
├── /campaigns (Campaign Builder)
├── /analytics (Message Analytics)
├── /templates (Email Templates)
├── /notifications (Alerts)
├── /settings (User Settings)
└── /auth (Authentication)
```

---

*Last updated: February 2026*
