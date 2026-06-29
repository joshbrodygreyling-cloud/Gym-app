import { useMemo, useState } from 'react'
import { generateMealPlan, MEAL_TYPE_LABEL } from '../lib/mealPlanner'
import type { NutritionTargets } from '../lib/nutrition'
import type { Goal } from '../types'
import { SparkIcon } from './Icons'

const TYPE_EMOJI: Record<string, string> = {
  breakfast: '🍳',
  lunch: '🥗',
  dinner: '🍽️',
  snack: '🍎',
}

export default function MealPlanSection({ targets, goal }: { targets: NutritionTargets; goal: Goal }) {
  const [seed, setSeed] = useState(0)
  const [vegetarian, setVegetarian] = useState(false)
  const [show, setShow] = useState(false)

  const plan = useMemo(
    () => generateMealPlan(targets, goal, { vegetarian, seed }),
    [targets, goal, vegetarian, seed],
  )

  const diff = plan.totals.kcal - plan.target.kcal
  const diffLabel = diff === 0 ? 'on target' : `${diff > 0 ? '+' : ''}${diff} kcal vs target`

  return (
    <div className="card space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-brand-200">Today’s meal plan</h3>
          <p className="text-xs text-white/50">Breakfast, lunch, dinner & a snack built around your targets.</p>
        </div>
        {show && (
          <button onClick={() => setSeed((s) => s + 1)} className="btn-ghost shrink-0" title="New variation">
            <SparkIcon className="h-4 w-4" /> Shuffle
          </button>
        )}
      </div>

      {!show ? (
        <button onClick={() => setShow(true)} className="btn-primary w-full">
          🍽️ Generate my meal plan
        </button>
      ) : (
        <>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={vegetarian}
              onChange={(e) => setVegetarian(e.target.checked)}
              className="h-4 w-4 accent-brand-500"
            />
            Vegetarian only
          </label>

          <div className="space-y-3">
            {plan.meals.map((pm) => (
              <div key={pm.type} className="rounded-xl border border-white/5 bg-black/20 p-3">
                <div className="flex items-baseline justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-200/80">
                    {TYPE_EMOJI[pm.type]} {MEAL_TYPE_LABEL[pm.type]}
                  </p>
                  <p className="text-xs font-bold text-white">{pm.kcal} kcal</p>
                </div>
                <p className="mt-0.5 font-semibold text-white">
                  {pm.meal.name}
                  {pm.servings !== 1 && <span className="ml-1 text-xs font-normal text-white/45">×{pm.servings}</span>}
                </p>
                <p className="mt-1 text-xs text-white/55">{pm.meal.items.join(' · ')}</p>
                <div className="mt-2 flex gap-3 text-[11px] text-white/60">
                  <span className="text-brand-300">P {pm.protein}g</span>
                  <span className="text-amber-300">C {pm.carbs}g</span>
                  <span className="text-rose-300">F {pm.fat}g</span>
                </div>
              </div>
            ))}
          </div>

          {/* Day totals */}
          <div className="rounded-xl bg-brand-500/10 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-white">Day total</p>
              <p className="text-sm font-extrabold text-white">{plan.totals.kcal} kcal</p>
            </div>
            <p className="text-xs text-white/45">
              Target {plan.target.kcal} kcal · {diffLabel}
            </p>
            <div className="mt-3 flex gap-4 text-xs">
              <span className="text-brand-300">Protein {plan.totals.protein}g</span>
              <span className="text-amber-300">Carbs {plan.totals.carbs}g</span>
              <span className="text-rose-300">Fat {plan.totals.fat}g</span>
            </div>
          </div>

          <p className="text-[11px] text-white/35">
            Portions are scaled to fit your targets. Swap any meal for something similar you enjoy — consistency matters
            more than perfection.
          </p>
        </>
      )}
    </div>
  )
}
