# DJ Request App - Task List

- [x] **Phase 1: Project Setup & Configuration**
    - [x] Initialize Nuxt project with Nuxt UI
    - [x] Install `@nuxtjs/supabase`
    - [x] Set up Supabase project and client
    - [x] Configure environment variables
    - [x] Configure Tailwind theme (Colors, Fonts) from mocks

- [x] **Phase 2: Database & Authentication**
    - [x] Design Database Schema (Events, Requests, Feedback)
    - [x] Implement Anonymous Guest Auth (UUID in localStorage)
    - [x] Implement Admin Auth (Email/Password)

- [x] **Phase 3: Admin Event Management**
    - [x] Build Admin Dashboard layout
    - [x] Implement Event Management (Create, Edit, Delete Events)
    - [x] Generate Event qr code and customizable unique slug
    - [x] Add missing fields to the model and event details page

- [x] **Phase 4: Song Requests E2E**
    - [x] Create Live request queue
    - [x] Implement Song Request Form (YouTube Search)
    - [x] Build Admin Request Management (View, Update Status)
    - [x] Build Live Request Feed (Real-time updates for both)

- [x] **Phase 5: Feedback & Tip Systems**
    - [x] Implement Tip the DJ page
      - [x] Paypal (https://paypal.me/fadeek)
      - [x] Venmo @FadeeKannah
      - [x] Zelle fadeekannah@gmail.com
    - [x] Implement Feedback/Sentiment system

- [x] **Phase 6: Enhancements**
    - [x] Landing page list active events today
    - [x] Make event url case insensitive
    - [x] Cleanup app header have page title, home show nothing
    - [x] Guest users have random animal name and avatar
    - [x] Guest user can change name and avatar
    - [x] Make sure the correct name is used when requesting and submitting feedback
    - [x] submitting request should save id and name in supabase
    - [x] Create event use timezone and use start and end times 
    - [x] Update footer
    
- [x] **Phase 7: UI/UX Polish & Deployment**
    - [x] Header should not show menu Icon
    - [x] Fix UI colors and ensure it works in both light and dark modes and layout
    - [x] Apply Mobile-first responsive design
    - [x] Add animations and transitions
    - [x] Fix typing errors
    - [x] Remove server dependency
    - [x] Cleanup docs and create agents.md
    - [x] Setup treafik

- [ ] **Phase 8: Integrate MeTube**
  - [ ] Integrate MeTube to automatically start downloading the video when the request is submitted
  - [ ] Setup syncthing


- [ ] **Phase 9: Future Enhancements**
  - [ ] Feedback sentiment Thumbs up/down
  - [ ] Dynamic Avatars

    