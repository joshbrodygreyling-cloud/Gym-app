import { Link } from 'react-router-dom'
import { useApp, useStreak } from '../context/AppContext'
import { GOAL_LABELS } from '../lib/planGenerator'
import { todayKey } from '../lib/streak'
import { CameraIcon, CheckIcon, DumbbellIcon, FlameIcon } from '../components/Icons'

function bmiInfo(weightKg: number | null, heightCm: number | null) {
  if (!weightKg || !heightCm) return null
  const h = heightCm / 100
  const bmi = weightKg / (h * h)
  let label = 'Healthy'
  if (bmi < 18.5) label = 'Underweight'
  else if (bmi < 25) label = 'Healthy'
  else if (bmi < 30) label = 'Overweight'
  else label = 'Obese'
  return { bmi: Math.round(bmi * 10) / 10, label }
}

export default function Dashboard() {
  const { profile, plan, logToday, hasVisit } = useApp()
  const stats = useStreak()
  if (!profile) return null

  const wentToday = hasVisit(todayKey())
  const todaysWorkout = plan?.days.length ? plan.days[stats.totalVisits % plan.days.length] : null
  const bmi = bmiInfo(profile.weightKg, profile.heightCm)

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div>
        <p className="text-sm text-white/50">Welcome back,</p>
        <h1 className="text-2xl font-extrabold tracking-tight">{profile.name} 💪</h1>
        <p className="mt-1 text-sm text-brand-300">Goal: {GOAL_LABELS[profile.goal]}</p>
      </div>

      {/* Streak hero */}
      <div className="card relative overflow-hidden">
        <div className="absolute -right-6 -top-8 text-brand-500/10">
          <FlameIcon className="h-40 w-40" />
        </div>
        <div className="relative flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-200/80">Current streak</p>
            <p className="mt-1 text-5xl font-extrabold text-white">
              {stats.current}
              <span className="ml-2 text-lg font-semibold text-white/50">{stats.current === 1 ? 'day' : 'days'}</span>
            </p>
            <p className="mt-1 text-xs text-white/45">Longest: {stats.longest} · Total visits: {stats.totalVisits}</p>
          </div>
          <button
            onClick={logToday}
            disabled={wentToday}
            className={wentToday ? 'btn-ghost' : 'btn-primary'}
          >
            {wentToday ? (
              <>
                <CheckIcon className="h-4 w-4" /> Logged today
              </>
            ) : (
              <>
                <FlameIcon className="h-4 w-4" /> I went today
              </>
            )}
          </button>
        </div>

        {/* weekly progress */}
        <div className="relative mt-4">
          <div className="mb-1 flex justify-between text-xs text-white/50">
            <span>This week</span>
            <span>
              {stats.visitsThisWeek}/{profile.daysPerWeek} {stats.weeklyGoalMet ? '🎉' : ''}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-brand-500 transition-all"
              style={{ width: `${Math.min(100, (stats.visitsThisWeek / profile.daysPerWeek) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Today's workout */}
      {todaysWorkout && (
        <Link to="/plan" className="card block transition hover:border-brand-400/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-200/80">Today’s suggested session</p>
            <DumbbellIcon className="h-5 w-5 text-brand-300" />
          </div>
          <h2 className="mt-1 text-xl font-bold text-white">{todaysWorkout.title}</h2>
          <p className="text-sm text-white/55">{todaysWorkout.focus}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {todaysWorkout.blocks.slice(0, 4).map((b) => (
              <span key={b.exerciseId} className="rounded-lg bg-white/[0.04] px-2 py-1 text-xs text-white/70">
                {b.exerciseName}
              </span>
            ))}
            {todaysWorkout.blocks.length > 4 && (
              <span className="rounded-lg bg-white/[0.04] px-2 py-1 text-xs text-white/50">
                +{todaysWorkout.blocks.length - 4} more
              </span>
            )}
          </div>
          <p className="mt-3 text-sm font-semibold text-brand-300">View full plan →</p>
        </Link>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/identify" className="card flex flex-col gap-2 transition hover:border-brand-400/40">
          <CameraIcon className="h-6 w-6 text-brand-300" />
          <span className="font-semibold text-white">Identify a machine</span>
          <span className="text-xs text-white/50">Snap a photo, learn how to use it</span>
        </Link>
        <Link to="/nutrition" className="card flex flex-col gap-2 transition hover:border-brand-400/40">
          <span className="text-2xl leading-none">🥗</span>
          <span className="font-semibold text-white">Nutrition targets</span>
          <span className="text-xs text-white/50">Calories & macros for your goal</span>
        </Link>
        <Link to="/tools" className="card flex flex-col gap-2 transition hover:border-brand-400/40">
          <span className="text-2xl leading-none">🧮</span>
          <span className="font-semibold text-white">Gym tools</span>
          <span className="text-xs text-white/50">1RM & plate calculators</span>
        </Link>
        <Link to="/library" className="card flex flex-col gap-2 transition hover:border-brand-400/40">
          <DumbbellIcon className="h-6 w-6 text-brand-300" />
          <span className="font-semibold text-white">Exercise library</span>
          <span className="text-xs text-white/50">How-tos for every machine</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <p className="text-2xl font-extrabold text-white">{stats.visitsThisMonth}</p>
          <p className="text-xs text-white/50">visits this month</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-extrabold text-white">{plan?.days.length ?? 0}</p>
          <p className="text-xs text-white/50">days in your plan</p>
        </div>
        <div className="card text-center">
          {bmi ? (
            <>
              <p className="text-2xl font-extrabold text-white">{bmi.bmi}</p>
              <p className="text-xs text-white/50">BMI · {bmi.label}</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-extrabold text-white/40">—</p>
              <p className="text-xs text-white/50">add height & weight</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
