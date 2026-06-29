import { MEALS } from '../data/meals'
import type { Meal, MealType } from '../data/meals'
import type { Goal } from '../types'
import type { NutritionTargets } from './nutrition'

export interface PlannedMeal {
  type: MealType
  meal: Meal
  /** portion multiplier applied to hit the calorie target more closely */
  servings: number
  kcal: number
  protein: number
  carbs: number
  fat: number
}

export interface MealPlan {
  meals: PlannedMeal[]
  totals: { kcal: number; protein: number; carbs: number; fat: number }
  target: { kcal: number; protein: number; carbs: number; fat: number }
  vegetarian: boolean
}

const TYPE_LABEL: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
}

export const MEAL_TYPE_LABEL = TYPE_LABEL

// Calorie distribution across the day.
const SPLIT: { type: MealType; share: number }[] = [
  { type: 'breakfast', share: 0.25 },
  { type: 'lunch', share: 0.3 },
  { type: 'dinner', share: 0.3 },
  { type: 'snack', share: 0.15 },
]

function round(n: number) {
  return Math.round(n)
}

/**
 * Build a full day of meals that lands close to the user's calorie & protein
 * targets. Goal nudges meal preference (higher-protein picks for muscle / fat
 * loss / strength). `seed` lets the UI request fresh variations.
 */
export function generateMealPlan(
  targets: NutritionTargets,
  goal: Goal,
  options: { vegetarian?: boolean; seed?: number } = {},
): MealPlan {
  const { vegetarian = false, seed = 0 } = options
  const preferProtein = goal === 'build_muscle' || goal === 'lose_weight' || goal === 'get_stronger'

  const meals: PlannedMeal[] = SPLIT.map(({ type, share }, slotIndex) => {
    const slotTarget = targets.calories * share

    let pool = MEALS.filter((m) => m.type === type && (!vegetarian || m.vegetarian))
    if (pool.length === 0) pool = MEALS.filter((m) => m.type === type)

    // Rank by: protein preference, then closeness to the slot's calorie target.
    const ranked = [...pool].sort((a, b) => {
      if (preferProtein && a.highProtein !== b.highProtein) return a.highProtein ? -1 : 1
      return Math.abs(a.kcal - slotTarget) - Math.abs(b.kcal - slotTarget)
    })

    // Use the seed to rotate through the top choices for variety on regenerate.
    const topN = Math.min(3, ranked.length)
    const meal = ranked[(seed + slotIndex) % topN]

    // Scale the portion (within sensible limits) to better hit the slot target.
    const rawServings = slotTarget / meal.kcal
    const servings = Math.max(0.75, Math.min(1.75, Math.round(rawServings * 4) / 4))

    return {
      type,
      meal,
      servings,
      kcal: round(meal.kcal * servings),
      protein: round(meal.protein * servings),
      carbs: round(meal.carbs * servings),
      fat: round(meal.fat * servings),
    }
  })

  const totals = meals.reduce(
    (acc, m) => ({
      kcal: acc.kcal + m.kcal,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  )

  return {
    meals,
    totals,
    target: { kcal: targets.calories, protein: targets.proteinG, carbs: targets.carbsG, fat: targets.fatG },
    vegetarian,
  }
}
