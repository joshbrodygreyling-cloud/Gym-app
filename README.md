# FitForge — Your Complete Gym Companion 🏋️

FitForge is a mobile-first web app that helps gym-goers train smarter and stay
consistent. Tell it about yourself and your goal, and it forges a personalised
workout plan, helps you figure out any machine, and keeps your gym streak alive.

## Features

### 🎯 Goal-based workout plans (the core)
Answer a few questions — age, weight, height, sex, goal, experience, available
equipment, and days per week — and FitForge builds a complete weekly routine:

- **Smart splits** that scale with your schedule: full-body (1–2 days),
  push/pull/legs (3 or 5–6 days), or upper/lower (4 days).
- **Goal-tuned programming.** Sets, reps and rest periods automatically adapt to
  your goal:
  - *Build muscle* → moderate weight, 8–12 reps, hypertrophy volume
  - *Get stronger* → heavy compounds, 4–6 reps, long rest
  - *Lose weight* → higher reps, short rest, cardio finishers
  - *Endurance* → high reps, minimal rest, conditioning
  - *General fitness* → a balanced mix
- **Experience-aware** exercise selection (beginners get simpler movements).
- Every exercise has a built-in step-by-step "how to" guide.
- Refresh for a fresh variation any time.

### 📸 Machine identifier
Not sure how to use a machine? Snap or upload a photo and FitForge identifies it
and explains how to use it safely. Photo recognition is powered by Claude vision
(add your own Anthropic API key in Settings — it's stored only on your device).
No key needed to get value: a forgiving name search covers every machine in the
library instantly.

### 🔥 Streak & consistency tracker
- One-tap "I went today" check-in.
- A tappable monthly calendar to log past visits.
- Current streak, longest streak, total visits, and weekly-goal progress.
- Your chosen training frequency becomes your weekly consistency target.

### 📚 Exercise library
A browsable, searchable library of machines and exercises, each with how-to
steps, coaching tips, and common mistakes to avoid. Filter by muscle group.

## Tech

- **React 18 + TypeScript + Vite**
- **Tailwind CSS** for styling
- **React Router** for navigation
- All data persists locally in the browser (`localStorage`) — no backend, no
  account required, fully private.

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check and build for production
npm run preview  # preview the production build
```

## How the plan generator works

The generator (`src/lib/planGenerator.ts`) combines three inputs:

1. **A split template** chosen from your days-per-week.
2. **Goal parameters** (sets / reps / rest / whether to add cardio finishers).
3. **Exercise selection** from the library (`src/data/exercises.ts`), filtered by
   your equipment and capped to your experience level, always anchoring each
   session with compound lifts before isolation work.

## Optional: AI photo identification

1. Get an API key from the [Anthropic Console](https://console.anthropic.com/).
2. Open **Profile & Settings** in the app and paste it in (or add it the first
   time you upload a photo).
3. The key lives only in your browser's local storage and is used solely for
   your own photo lookups.
