# LiftIQ — Your Complete Gym Companion 🏋️

LiftIQ is a mobile-first web app that helps gym-goers train smarter and stay
consistent. Tell it about yourself and your goal, and it builds a personalised
workout plan, helps you figure out any machine, and keeps your gym streak alive.

## Features

### 🎯 Workout plans — two ways (the core)
After setting up your profile you choose how to build your routine:

1. **Generate a Plan** — LiftIQ auto-builds a personalised weekly routine from
   your goal, experience, equipment and schedule (details below).
2. **Upload Your Own Routine** — build your plan by hand: add training days and
   rest days, with exercises, sets, reps and rest for each. Edit it any time.

You can switch between the two whenever you like from the plan screen, and the
**lift tracker works with either** — it surfaces your plan's exercises as
quick-pick chips and gives progressive-overload suggestions and history no
matter which path you chose.

#### Generate a Plan
Answer a few questions — age, weight, height, sex, goal, experience, available
equipment, and days per week — and LiftIQ builds a complete weekly routine:

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
Not sure how to use a machine? Snap or upload a photo and LiftIQ identifies it
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

### 🥗 Nutrition targets & meal plans
Personalised daily calorie and macro targets calculated from your stats:

- **BMR** via the Mifflin–St Jeor equation and **TDEE** from your training
  frequency.
- Calories adjusted for your goal (deficit, surplus or maintenance).
- Protein / carbs / fat breakdown plus a daily water guideline and practical
  eating tips.
- **Full day meal plans** — generate breakfast, lunch, dinner and a snack built
  to hit your targets, each with its own calories and macros and a running day
  total. Meals are biased toward higher protein for muscle/fat-loss goals,
  portions auto-scale to your calorie target, there's a vegetarian-only toggle,
  and you can shuffle for fresh variations.

### 📈 Lift tracker with progressive overload
Log every exercise with weight and reps per set:

- Pick an exercise (from the library or a custom name), set a rep goal, and
  record each set.
- The next time you train that lift, LiftIQ reads your last session and tells
  you **exactly what to do**: hit all your reps cleanly → it suggests adding
  weight (+2.5 kg isolation / +5 kg big compound lifts, or lb equivalents);
  fell short → it tells you to repeat the weight and chase the missing reps; had
  a real grind → it suggests a small deload.
- Tracks your **personal records** (heaviest lifted and estimated 1RM) and full
  per-exercise history.

### ⏱️ Built-in rest timer
Every exercise in your plan has a one-tap countdown rest timer (pre-set to the
recommended rest for that exercise) with a gentle audio cue when it's done.

### 🧮 Gym tools
- **1-rep-max estimator** (Epley) with a full %1RM training table.
- **Barbell plate calculator** that tells you exactly what to load on each side,
  in kg or lb.

### 🏅 Achievements
Unlock motivational badges as you build your streak and rack up visits.

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

## AI photo identification (machine identifier)

The machine identifier sends the photo to Claude's vision model. There are two
ways to power it:

### Recommended: a shared key via environment variable (server-side)

The app ships with a serverless function (`api/identify.ts`) that calls Claude
using an `ANTHROPIC_API_KEY` read **on the server** — so the key is never exposed
to the browser. With this set, photo identification works for everyone with no
per-user setup.

1. Get an API key from the [Anthropic Console](https://console.anthropic.com/).
2. **Local dev:** copy `.env.example` to `.env.local` and set `ANTHROPIC_API_KEY`.
   Run with the Vercel CLI (`vercel dev`) so the `api/` function is served.
   > Plain `vite dev` doesn't run the serverless function — the app detects this
   > and falls back to text search (or a device key, below).
3. **Production (Vercel):** add `ANTHROPIC_API_KEY` under **Project → Settings →
   Environment Variables**, then deploy.

> ⚠️ Do **not** name it `VITE_ANTHROPIC_API_KEY` or otherwise expose it to the
> client — Vite inlines `VITE_`-prefixed vars into the public bundle, which would
> leak the secret to every visitor. Keep it server-side only.

### Fallback: a personal key on your device

No server key? Open **Profile & Settings** (or upload a photo) and paste your own
Anthropic API key. It's stored only in your browser's local storage and used
solely for your own lookups. Either way, the name search covers every machine in
the library with no key at all.
