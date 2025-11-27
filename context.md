# Project Context

This project is a real-time mobile-first app that allows event attendees to request songs, give feedback, and comment during a live DJ set.
The DJ (Admin) can view, manage, and prioritize requests in real time, enabling more audience engagement and personalized music selection.

## Goals & Objectives

- Enhance crowd engagement at live DJ events.
- Provide a simple way for users to request songs or share feedback.
- Enable DJs to manage, filter, and respond to requests quickly.
- Support real-time updates without page refresh using Supabase real-time.
- Use YouTube to find songs and request them using links.

## System Features

- Real-time Data Sync using Supabase Realtime.
- Anonymous Session Tracking: auto-generated UUID stored in localStorage/cookie.
- Notifications: 
    - Alerts for DJ when a new request comes in.
    - When a request is ready, played, or ignored.

## Technical Overview

- Frontend: Nuxt.js + Nuxt UI
- Real-time Backend: Supabase Realtime
- Security: rate limiting on requests.
- Usability: Mobile-first responsive design.

## Key Features

### A. User (Guest) Features

#### Anonymous Access

- Users can join without signing in.
- A unique session ID (UUID) is assigned automatically.
- User can enter a display name.

#### Live Feed

- See a live list of recent requests
- Requests update in real time

#### Song Requests

- Search a song using YouTube search.
- Select a song from the search results. With the ability to preview within the app
- Optional: add a short comment or dedication

#### Feedback & Comments

- Users can leave reactions or short feedback.

#### Tip the DJ

- Users can tip the DJ to show their appreciation.
- DJ can receive tips through different ways (e.g. Venmo, Cash App, Zelle, paypal, etc).

#### Event Info

- Event name and DJ name
- Event date, time and location
- Event description
- Event Rules

### B. DJ (Admin) Features

#### Admin Login

- DJ logs in securely via email/password or event-specific admin code.

#### Events

- DJ can create multiple events.
- Each event has its own unique code.
- DJ can edit and delete events.

#### Dashboard

- Real-time view of all incoming requests.
- Sort and filter by:
    - Time received
    - Upvotes 
    - Status (pending / ready / played / ignored)
- Manage requests by changing status and adding comments.


## Future enhancements (Post-MVP)

- Block abusive users by unique ID.
- Upvote system for requests.
- QR code to join event page.
- Push notifications for accepted/played requests.
- Theming per event.
- Feedback analytics (sentiment tracking).

