# Implementation Plan - DJ Request App

## Goal Description
Build a real-time mobile-first web application that allows event attendees to request songs, give feedback, and tip the DJ. The DJ can manage these requests in real-time.

## Tech Stack
- **Frontend:** Nuxt.js + Nuxt UI (Vue 3)
- **Backend/Database:** Supabase (PostgreSQL, Realtime, Auth)
- **Styling:** TailwindCSS (via Nuxt UI)
    - **Font:** Be Vietnam Pro
    - **Colors:** Primary `#00A9FF`, Secondary `#E800B8`, Dark BG `#131022`, Light BG `#f6f5f8`
- **Icons:** Material Symbols Outlined (via Google Fonts or Iconify equivalent)

## User Review Required
- **YouTube API:** Need to confirm if we are using the official YouTube Data API (requires key) or a scraping method/alternative. *Assumption: Will use YouTube Data API v3.*
- **Payment Integration:** "Tip the DJ" will be simple links/QR codes to external services (Venmo, CashApp), not integrated payment processing.

## Proposed Changes

### 1. Project Setup
- [x] Initialize Nuxt project.
- [x] Install `@nuxtjs/supabase`.
- [x] Configure `nuxt.config.ts`:
    - Add Supabase module.
    - Configure Tailwind theme (colors, fonts).
    - Add Google Fonts (Be Vietnam Pro, Material Symbols).

### 2. Database Schema (Supabase)

#### Tables
- **djs** (Admin users)
    - `id` (uuid, PK, references auth.users)
    - `username` (text)
    - `avatar_url` (text)
    - `payment_links` (jsonb) - Venmo/CashApp links

- **events**
    - `id` (uuid, PK)
    - `dj_id` (uuid, FK to djs)
    - `code` (text, unique) - for guests to join
    - `name` (text)
    - `date` (timestamp)
    - `is_active` (boolean)

- **requests**
    - `id` (uuid, PK)
    - `event_id` (uuid, FK to events)
    - `user_session_id` (text) - Anonymous UUID
    - `user_name` (text)
    - `song_title` (text)
    - `song_artist` (text)
    - `youtube_url` (text)
    - `status` (enum: pending, ready, played, ignored)
    - `created_at` (timestamp)
    - `upvotes` (int)
    - `user_comment` (text)

- **feedback**
    - `id` (uuid, PK)
    - `event_id` (uuid, FK to events)
    - `message` (text)
    - `sentiment` (enum: positive, negative, neutral)

### 3. Component Architecture

#### Shared
- `AppHeader.vue`
- `AppFooter.vue`
- `SongCard.vue` (Display request info)

#### Guest View
- `pages/index.vue` (Join Event / Landing)
- `pages/event/[code].vue` (Main Guest Interface)
    - `components/RequestForm.vue`
    - `components/LiveFeed.vue`
    - `components/TipJar.vue`

#### Admin View
- `pages/admin/login.vue`
- `pages/admin/dashboard.vue`
    - `components/RequestManager.vue`
    - `components/EventSettings.vue`

### 4. Real-time Implementation
- Use `supabase.channel` to listen for `INSERT` and `UPDATE` on `requests` table.
- Update local state immediately on changes.

## Verification Plan

### Manual Verification
- **Guest Flow:** Join event -> Search song -> Submit -> Verify appears in feed.
- **DJ Flow:** Login -> Create Event -> View Requests -> Change Status -> Verify update on Guest view.
- **Real-time:** Open two browsers (Guest & DJ), submit request, verify instant appearance.
