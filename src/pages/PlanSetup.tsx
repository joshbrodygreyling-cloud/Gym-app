import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { DumbbellIcon, SparkIcon } from '../components/Icons'

export default function PlanSetup() {
  const { profile, plan, generatePlanNow } = useApp()
  const navigate = useNavigate()
  if (!profile) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Your Workout Plan</h1>
        <p className="mt-1 text-sm text-white/55">
          How would you like to set up your routine? You can switch or change it any time.
        </p>
      </div>

      {plan && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">
          Heads up: choosing an option below will replace your current plan.
        </div>
      )}

      {/* Generate */}
      <button
        onClick={() => {
          generatePlanNow()
          navigate('/plan')
        }}
        className="card w-full text-left transition hover:border-brand-400/50"
      >
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-500/20 text-brand-300">
            <SparkIcon className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-white">Generate a Plan</h2>
            <p className="mt-1 text-sm text-white/60">
              Let LiftIQ build a personalised weekly routine from your goal, experience, equipment and schedule.
              Recommended if you’re not sure where to start.
            </p>
            <span className="mt-3 inline-block text-sm font-semibold text-brand-300">Auto-build my plan →</span>
          </div>
        </div>
      </button>

      {/* Upload own */}
      <button
        onClick={() => navigate('/plan/build')}
        className="card w-full text-left transition hover:border-brand-400/50"
      >
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-white">
            <DumbbellIcon className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-white">Upload Your Own Routine</h2>
            <p className="mt-1 text-sm text-white/60">
              Already have a plan you love? Build it by hand — add your training days and rest days, with exercises,
              sets and reps for each.
            </p>
            <span className="mt-3 inline-block text-sm font-semibold text-brand-300">Build it myself →</span>
          </div>
        </div>
      </button>

      {plan && (
        <button onClick={() => navigate('/plan')} className="btn-ghost w-full">
          Keep my current plan
        </button>
      )}
    </div>
  )
}
