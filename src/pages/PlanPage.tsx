import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const [activeDay, setActiveDay] = useState(0)

  if (!profile) return null
  // No plan yet -> send them to choose how to set one up.
  if (!plan) return <Navigate to="/plan/setup" replace />

  const isCustom = plan.source === 'custom'
  const day = plan.days[Math.min(activeDay, plan.days.length - 1)]

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">{isCustom ? plan.name || 'My Routine' : 'Your Workout Plan'}</h1>
            <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[11px] font-semibold text-white/60">
              {isCustom ? 'Custom' : 'Generated'}
            </span>
          </div>
          <p className="mt-1 text-sm text-white/55">
            {isCustom
              ? `${plan.daysPerWeek} training ${plan.daysPerWeek === 1 ? 'day' : 'days'} · ${plan.days.length} day split`
              : `${GOAL_LABELS[plan.goal]} · ${EXPERIENCE_LABELS[plan.experience]} · ${EQUIPMENT_LABELS[plan.equipment]} · ${plan.daysPerWeek}×/week`}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          {isCustom ? (
            <button onClick={() => navigate('/plan/build')} className="btn-ghost" title="Edit your routine">
              Edit
            </button>
          ) : (
            <button onClick={regeneratePlan} className="btn-ghost" title="Generate a fresh variation">
              <SparkIcon className="h-4 w-4" /> Refresh
            </button>
          )}
          <button onClick={() => navigate('/plan/setup')} className="btn-ghost" title="Switch plan type">
            Change
          </button>
        </div>
      </div>

      {plan.summary && (
        <div className="card">
          <p className="text-sm text-white/75">{plan.summary}</p>
        </div>
      )}

      {/* Day tabs */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {plan.days.map((d, i) => (
          <button
            key={i}
            onClick={() => setActiveDay(i)}
            className={`shrink-0 rounded-xl border px-3.5 py-2 text-sm font-semibold transition ${
              i === Math.min(activeDay, plan.days.length - 1)
                ? 'border-brand-400 bg-brand-500/20 text-white'
                : 'border-white/10 bg-white/[0.02] text-white/60'
            }`}
          >
            {d.isRestDay ? '😴' : `Day ${i + 1}`}
          </button>
        ))}
      </div>

      {/* Active day */}
      <div className="card space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white">{day.title}</h2>
          {day.focus && <p className="text-sm text-white/55">{day.focus}</p>}
        </div>

        {day.isRestDay ? (
          <div className="rounded-xl bg-brand-500/5 px-4 py-8 text-center">
            <p className="text-3xl">😴</p>
            <p className="mt-2 font-semibold text-white">Rest day</p>
            <p className="text-sm text-white/50">Recover, stretch, hydrate and sleep well. Growth happens when you rest.</p>
          </div>
        ) : (
          <>
            {day.warmup && (
              <div className="rounded-xl bg-amber-400/5 px-3 py-2 text-xs text-amber-100/80">
                <span className="font-semibold">Warm-up:</span> {day.warmup}
              </div>
            )}

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

            <button onClick={() => navigate('/track')} className="btn-primary w-full">
              Log these lifts in the tracker →
            </button>
          </>
        )}
      </div>

      {plan.weeklyVolumeNote && (
        <div className="card">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-200/80">Coach’s note</p>
          <p className="mt-1 text-sm text-white/70">{plan.weeklyVolumeNote}</p>
        </div>
      )}
    </div>
  )
}
