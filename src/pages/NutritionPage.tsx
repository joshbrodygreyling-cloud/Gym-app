import { useApp } from '../context/AppContext'
import { computeNutrition } from '../lib/nutrition'
import { GOAL_LABELS } from '../lib/planGenerator'
import { Link } from 'react-router-dom'

function MacroBar({ proteinG, carbsG, fatG }: { proteinG: number; carbsG: number; fatG: number }) {
  const pCal = proteinG * 4
  const cCal = carbsG * 4
  const fCal = fatG * 9
  const total = pCal + cCal + fCal || 1
  return (
    <div className="space-y-2">
      <div className="flex h-3 overflow-hidden rounded-full">
        <div className="bg-brand-400" style={{ width: `${(pCal / total) * 100}%` }} />
        <div className="bg-amber-400" style={{ width: `${(cCal / total) * 100}%` }} />
        <div className="bg-rose-400" style={{ width: `${(fCal / total) * 100}%` }} />
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-brand-300">● Protein {proteinG}g</span>
        <span className="text-amber-300">● Carbs {carbsG}g</span>
        <span className="text-rose-300">● Fat {fatG}g</span>
      </div>
    </div>
  )
}

export default function NutritionPage() {
  const { profile } = useApp()
  if (!profile) return null

  const n = computeNutrition(profile)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Nutrition Targets</h1>
        <p className="mt-1 text-sm text-white/55">
          Personalised daily fuel for your goal: {GOAL_LABELS[profile.goal]}.
        </p>
      </div>

      {!n ? (
        <div className="card text-sm text-white/70">
          We need your age, height and weight to calculate this.{' '}
          <Link to="/profile" className="font-semibold text-brand-300">
            Complete your profile →
          </Link>
        </div>
      ) : (
        <>
          <div className="card text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-200/80">Daily calorie target</p>
            <p className="mt-1 text-5xl font-extrabold text-white">{n.calories.toLocaleString()}</p>
            <p className="text-sm text-white/50">kcal / day</p>
            <p className="mx-auto mt-3 max-w-md text-sm text-white/65">{n.goalBlurb}</p>
          </div>

          <div className="card space-y-3">
            <h3 className="text-sm font-bold text-brand-200">Macro breakdown</h3>
            <MacroBar proteinG={n.proteinG} carbsG={n.carbsG} fatG={n.fatG} />
            <p className="text-xs text-white/45">
              High protein supports muscle and recovery. Carbs fuel your training; fats keep hormones healthy.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="card text-center">
              <p className="text-2xl font-extrabold text-white">{n.bmr.toLocaleString()}</p>
              <p className="text-xs text-white/50">BMR (at rest)</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-extrabold text-white">{n.tdee.toLocaleString()}</p>
              <p className="text-xs text-white/50">Maintenance</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-extrabold text-white">{n.waterL}L</p>
              <p className="text-xs text-white/50">Water / day</p>
            </div>
          </div>

          <div className="card">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-200/80">Quick tips</p>
            <ul className="mt-2 space-y-1.5 text-sm text-white/70">
              <li>🍗 Hit your protein first — spread it across 3–4 meals.</li>
              <li>🥦 Fill half your plate with vegetables for fibre and fullness.</li>
              <li>🍚 Eat most of your carbs around your workout for energy and recovery.</li>
              <li>💧 Sip water through the day; more on training days and in the heat.</li>
              <li>😴 Sleep 7–9 hours — recovery is where progress actually happens.</li>
            </ul>
          </div>

          <p className="text-center text-xs text-white/35">
            These are estimates to get you started. Adjust based on how your body responds over 2–3 weeks.
          </p>
        </>
      )}
    </div>
  )
}
