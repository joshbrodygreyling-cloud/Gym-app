import { useState } from 'react'
import type { Exercise } from '../types'

const CATEGORY_LABEL: Record<Exercise['category'], string> = {
  machine: 'Machine',
  free_weight: 'Free weight',
  bodyweight: 'Bodyweight',
  cardio: 'Cardio',
  cable: 'Cable',
}

const MUSCLE_LABEL: Record<string, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
  core: 'Core',
  full_body: 'Full body',
  cardio: 'Cardio',
}

export default function ExerciseCard({ exercise, defaultOpen = false }: { exercise: Exercise; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="card">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-start justify-between gap-3 text-left">
        <div>
          <h3 className="font-bold text-white">{exercise.name}</h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <span className="rounded-md bg-brand-500/15 px-2 py-0.5 text-[11px] font-semibold text-brand-200">
              {CATEGORY_LABEL[exercise.category]}
            </span>
            {exercise.primaryMuscles.map((m) => (
              <span key={m} className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[11px] text-white/65">
                {MUSCLE_LABEL[m] ?? m}
              </span>
            ))}
          </div>
        </div>
        <span className="shrink-0 text-xs font-semibold text-brand-300">{open ? 'Hide' : 'Guide'}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-4 border-t border-white/5 pt-4 text-sm">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-200/80">How to use it</p>
            <ol className="list-decimal space-y-1 pl-5 text-white/80">
              {exercise.howTo.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>

          {exercise.tips.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-200/80">Tips</p>
              <ul className="space-y-1 text-white/75">
                {exercise.tips.map((t, i) => (
                  <li key={i}>💡 {t}</li>
                ))}
              </ul>
            </div>
          )}

          {exercise.commonMistakes.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-red-300/80">Common mistakes</p>
              <ul className="space-y-1 text-white/60">
                {exercise.commonMistakes.map((m, i) => (
                  <li key={i}>⚠️ {m}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
