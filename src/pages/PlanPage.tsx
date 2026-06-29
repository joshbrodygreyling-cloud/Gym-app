import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { getExerciseById } from '../data/exercises'
import { EQUIPMENT_LABELS, EXPERIENCE_LABELS, GOAL_LABELS } from '../lib/planGenerator'
import type { PlannedSet } from '../types'
import { SparkIcon } from '../components/Icons'
import RestTimer from '../components/RestTimer'

function fmtRest(s: number) {
  if (s >= 60) {
    const m = Math.floor(s / 60)
    const rem = s % 60
    return rem ? `${m}m ${rem}s` : `${m} min`
  }
  return `${s}s`
}

function ExerciseRow({ block }: { block: PlannedSet }) {
  const [open, setOpen] = useState(false)
  const ex = getExerciseById(block.exerciseId)

  return (
    <div className="rounded-xl border border-white/5 bg-black/20">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-3 p-3 text-left">
        <div className="min-w-0">
          <p className="truncate font-semibold text-white">{block.exerciseName}</p>
          <p className="text-xs text-white/50">
            {block.sets} sets × {block.reps} reps · rest {fmtRest(block.restSeconds)}
          </p>
        </div>
        <span className="shrink-0 text-xs font-semibold text-brand-300">{open ? 'Hide' : 'How to'}</span>
      </button>

      {open && ex && (
        <div className="space-y-3 border-t border-white/5 px-3 pb-3 pt-3 text-sm">
          <ol className="list-decimal space-y-1 pl-5 text-white/75">
            {ex.howTo.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
          {ex.tips.length > 0 && (
            <p className="rounded-lg bg-brand-500/10 px-3 py-2 text-xs text-brand-100">
              💡 {ex.tips[0]}
            </p>
          )}
          {ex.commonMistakes.length > 0 && (
            <p className="text-xs text-white/45">
              <span className="font-semibold text-white/60">Avoid:</span> {ex.commonMistakes.join(' · ')}
            </p>
          )}
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-200/80">Rest timer</p>
            <RestTimer seconds={block.restSeconds} />
          </div>
        </div>
      )}
    </div>
  )
}

export default function PlanPage() {
  const { plan, profile, regeneratePlan } = useApp()
  const [activeDay, setActiveDay] = useState(0)

  if (!plan || !profile) {
    return <p className="text-white/60">No plan yet. Complete your profile to generate one.</p>
  }

  const day = plan.days[activeDay]

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Your Workout Plan</h1>
          <p className="mt-1 text-sm text-white/55">
            {GOAL_LABELS[plan.goal]} · {EXPERIENCE_LABELS[plan.experience]} · {EQUIPMENT_LABELS[plan.equipment]} ·{' '}
            {plan.daysPerWeek}×/week
          </p>
        </div>
        <button onClick={regeneratePlan} className="btn-ghost shrink-0" title="Generate a fresh variation">
          <SparkIcon className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="card">
        <p className="text-sm text-white/75">{plan.summary}</p>
      </div>

      {/* Day tabs */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {plan.days.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveDay(i)}
            className={`shrink-0 rounded-xl border px-3.5 py-2 text-sm font-semibold transition ${
              i === activeDay ? 'border-brand-400 bg-brand-500/20 text-white' : 'border-white/10 bg-white/[0.02] text-white/60'
            }`}
          >
            Day {i + 1}
          </button>
        ))}
      </div>

      {/* Active day */}
      <div className="card space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white">{day.title}</h2>
          <p className="text-sm text-white/55">{day.focus}</p>
        </div>

        <div className="rounded-xl bg-amber-400/5 px-3 py-2 text-xs text-amber-100/80">
          <span className="font-semibold">Warm-up:</span> {day.warmup}
        </div>

        <div className="space-y-2">
          {day.blocks.map((b, i) => (
            <ExerciseRow key={`${b.exerciseId}-${i}`} block={b} />
          ))}
        </div>

        {day.finisher && (
          <div className="rounded-xl bg-brand-500/10 px-3 py-2 text-sm text-brand-100">
            <span className="font-semibold">Finisher:</span> {day.finisher}
          </div>
        )}
      </div>

      <div className="card">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-200/80">Coach’s note</p>
        <p className="mt-1 text-sm text-white/70">{plan.weeklyVolumeNote}</p>
      </div>
    </div>
  )
}
