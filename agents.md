# Project: DJ Request App

## Overview
This is a real-time mobile-first application that allows event attendees to request songs, give feedback, and comment during a live DJ set. The DJ (Admin) can view, manage, and prioritize requests in real-time.

## Tech Stack
- **Framework:** [Nuxt 3](https://nuxt.com)
- **UI Library:** [Nuxt UI](https://ui.nuxt.com) (based on Headless UI & Tailwind CSS)
- **Styling:** Tailwind CSS
- **Database & Auth:** [Supabase](https://supabase.com)
- **Language:** TypeScript
- **Icons:** [Iconify](https://iconify.design) (Lucide, Heroicons, Simple Icons)
- **Package Manager:** npm

## Key Directories
- `app/`: Main application source code (pages, components, composables).
- `server/`: Server-side logic (API routes).
- `supabase/`: Supabase configuration and migrations.
- `docs/`: Project documentation.
- `public/`: Static assets.

## Development Guidelines

### Styling
- Use **Tailwind CSS** utility classes for styling.
- Use **Nuxt UI** components whenever possible for consistent design.
- Follow the mobile-first approach.

### State Management
- Use Nuxt's `useState` for shared state across components.
- Leverage Supabase Realtime for syncing data between clients.

### Database & Authentication
- **Supabase** is the single source of truth for data and auth.
- **Authentication:**
  - **Guests:** Anonymous login via `guest-auth` middleware (UUID in localStorage).
  - **Admins:** Email/Password login.
- **Types:** Always generate TypeScript types from Supabase schema:
  ```bash
  npx supabase gen types typescript --local > app/types/database.types.ts
  ```

### Icons
- Use the `UIIcon` component or Nuxt UI's `icon` prop.
- Preferred collections: `lucide`, `heroicons`, `simple-icons`.

## Common Tasks

### Running Locally
```bash
npm install
npm dev
```

### Linting
```bash
npm run lint
```

### Supabase Local Dev
```bash
npx supabase start
```

## User Preferences
- **Aesthetics:** High priority. Use rich aesthetics, vibrant colors, dark modes, and dynamic animations.
- **Code Style:** TypeScript, Composition API (`<script setup lang="ts">`).
