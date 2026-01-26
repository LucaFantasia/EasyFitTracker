# Easy Fit Tracker

**Easy Fit Tracker** is a mobile-first workout tracking web app designed for fast, frictionless logging — no typing, just taps.

Built for people who want to log workouts quickly at the gym without breaking flow.

---

## 🚀 Features

### Workout Logging
- Create workouts with a clean, step-by-step flow
- Add exercises → log sets → save workout
- No typing for reps or weight (picker-based UI)
- One task per screen, optimized for phones

### Workout History
- View all past workouts
- Workout detail pages with exercises and sets
- Edit workout name after completion
- Delete workouts securely

### Smart UX
- Shows **previous set info** (“last time”) for context
- Large tap targets and iOS-style spacing
- Dark UI with green accent
- Navigation-first design (no blocking UI)

### Authentication
- Email/password auth via Supabase
- Secure logout via server actions
- Session-safe routing

---

## 🧠 Tech Stack

- **Next.js** (App Router, client-heavy)
- **TypeScript**
- **Supabase**
  - Authentication
  - PostgreSQL database
  - Row Level Security (RLS)
- **Vercel** (deployment)
- **Zod** (server-side validation)

---

## 🏗 Architecture Overview

### Draft Workout Flow
- Client-side draft state via React Context
- Persisted in `localStorage`
- Structure:
    - Workout
        - Exercises
            - Sets
                - Reps
                - Weight


### Server Actions
- Saving workouts
- Editing workout names
- Deleting workouts
- Logging out

### Database Model
- `workouts`
- `workout_exercises`
- `exercise_sets`

---

## 📱 Mobile-First Design Principles

- Designed for phone screens first
- No horizontal scrolling
- Large buttons (≥44px)
- No keyboard required during workout logging
- Smooth navigation with optimistic updates

---

## 🔐 Security

- Supabase Auth
- RLS enforced on all workout data
- Server-side validation with Zod
- No client-side trust for writes

---

## 🧪 Status

**Version:** `v1.0.0`  
**State:** Feature-complete MVP  
**Next planned work:**
- Exercise progress/history
- Performance analytics
- Caching optimizations
- UI polish & animations

---

## 📝 License

Private / personal project (adjust as needed).
