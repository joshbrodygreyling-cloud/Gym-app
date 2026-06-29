import type { Goal, Profile } from '../types'

export interface NutritionTargets {
  bmr: number
  tdee: number
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  goalBlurb: string
  /** estimated litres of water per day */
  waterL: number
}

/**
 * Estimate daily calorie & macro targets.
 *
 * - BMR via the Mifflin–St Jeor equation (most accurate common formula).
 * - Activity multiplier estimated from training days per week.
 * - Calories adjusted up/down for the user's goal.
 * - Protein scaled to bodyweight; fat ~25% of calories; carbs fill the rest.
 */
export function computeNutrition(profile: Profile): NutritionTargets | null {
  const { weightKg, heightCm, age, sex, goal, daysPerWeek } = profile
  if (!weightKg || !heightCm || !age) return null

  // Mifflin–St Jeor
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  const bmr = Math.round(sex === 'female' ? base - 161 : base + 5)

  // Activity factor from weekly training frequency.
  const activity = daysPerWeek <= 1 ? 1.3 : daysPerWeek <= 3 ? 1.45 : daysPerWeek <= 5 ? 1.6 : 1.725
  const tdee = Math.round(bmr * activity)

  const { calories, goalBlurb } = adjustForGoal(tdee, goal)

  // Protein: higher for muscle / fat loss to preserve lean mass.
  const proteinPerKg = goal === 'build_muscle' || goal === 'lose_weight' || goal === 'get_stronger' ? 2.0 : 1.6
  const proteinG = Math.round(weightKg * proteinPerKg)

  // Fat ≈ 25% of calories (9 kcal/g).
  const fatG = Math.round((calories * 0.25) / 9)

  // Carbs fill the remaining calories (4 kcal/g), floored at 0.
  const carbsG = Math.max(0, Math.round((calories - proteinG * 4 - fatG * 9) / 4))

  // Rough hydration guideline.
  const waterL = Math.round((weightKg * 0.033 + (daysPerWeek >= 4 ? 0.5 : 0.3)) * 10) / 10

  return { bmr, tdee, calories, proteinG, carbsG, fatG, goalBlurb, waterL }
}

function adjustForGoal(tdee: number, goal: Goal): { calories: number; goalBlurb: string } {
  switch (goal) {
    case 'lose_weight':
      return {
        calories: Math.round(tdee - 500),
        goalBlurb: 'A ~500 kcal/day deficit for steady, sustainable fat loss (~0.5 kg/week) while keeping protein high to protect muscle.',
      }
    case 'build_muscle':
      return {
        calories: Math.round(tdee + 250),
        goalBlurb: 'A small ~250 kcal/day surplus to build muscle while minimising fat gain. Pair with progressive overload.',
      }
    case 'get_stronger':
      return {
        calories: Math.round(tdee + 150),
        goalBlurb: 'A slight surplus to fuel heavy training and recovery without unnecessary fat gain.',
      }
    case 'endurance':
      return {
        calories: tdee,
        goalBlurb: 'Eat at maintenance to fuel performance, with plenty of carbs around your training.',
      }
    case 'general_fitness':
    default:
      return {
        calories: tdee,
        goalBlurb: 'Eat around maintenance to stay healthy and energised. Adjust slightly if you want to lean out or grow.',
      }
  }
}

// ---------------------------------------------------------------------------
// Strength tools
// ---------------------------------------------------------------------------

/** Estimate one-rep max using the Epley formula. */
export function estimate1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30))
}

/** A handy table of %1RM -> rep targets for programming. */
export function rmPercentTable(oneRm: number): { pct: number; weight: number; reps: string }[] {
  const rows = [
    { pct: 100, reps: '1' },
    { pct: 95, reps: '2' },
    { pct: 90, reps: '4' },
    { pct: 85, reps: '6' },
    { pct: 80, reps: '8' },
    { pct: 75, reps: '10' },
    { pct: 70, reps: '12' },
    { pct: 65, reps: '15' },
  ]
  return rows.map((r) => ({ ...r, weight: Math.round((oneRm * r.pct) / 100) }))
}

/**
 * Work out which plates to load on each side of a barbell.
 * Returns the plates per side (kg or lb depending on the values passed in).
 */
export function platesPerSide(target: number, barWeight: number, available: number[]): { plates: number[]; leftover: number } {
  const perSide = (target - barWeight) / 2
  if (perSide <= 0) return { plates: [], leftover: 0 }
  const sorted = [...available].sort((a, b) => b - a)
  const plates: number[] = []
  let remaining = perSide
  for (const p of sorted) {
    while (remaining >= p - 1e-9) {
      plates.push(p)
      remaining = Math.round((remaining - p) * 100) / 100
    }
  }
  return { plates, leftover: Math.round(remaining * 100) / 100 }
}
