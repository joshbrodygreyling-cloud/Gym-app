import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { EXERCISES } from '../data/exercises'
import type { PlannedSet, WorkoutDay, WorkoutPlan } from '../types'

interface DraftExercise {
  exerciseId: string
  exerciseName: string
  sets: number
  reps: string
  restSeconds: number
}

interface DraftDay {
  title: string
  isRestDay: boolean
  blocks: DraftExercise[]
}

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

/** Map a typed name to a library exercise id when it matches, else a slug. */
function resolveExerciseId(name: string): string {
  const match = EXERCISES.find(
    (e) => e.name.toLowerCase() === name.trim().toLowerCase() || e.aliases.some((a) => a.toLowerCase() === name.trim().toLowerCase()),
  )
  return match ? match.id : slugify(name) || 'exercise'
}

function emptyExercise(): DraftExercise {
  return { exerciseId: '', exerciseName: '', sets: 3, reps: '10', restSeconds: 90 }
}

function initialDays(existing: WorkoutPlan | null): DraftDay[] {
  if (existing && existing.source === 'custom') {
    return existing.days.map((d) => ({
      title: d.title,
      isRestDay: Boolean(d.isRestDay),
      blocks: d.blocks.map((b) => ({
        exerciseId: b.exerciseId,
        exerciseName: b.exerciseName,
        sets: b.sets,
        reps: b.reps,
        restSeconds: b.restSeconds,
      })),
    }))
  }
  return [{ title: 'Day 1', isRestDay: false, blocks: [emptyExercise()] }]
}

export default function CustomPlanBuilder() {
  const { profile, plan, saveCustomPlan } = useApp()
  const navigate = useNavigate()

  const editingCustom = plan?.source === 'custom'
  const [name, setName] = useState(editingCustom ? plan?.name ?? 'My Routine' : 'My Routine')
  const [days, setDays] = useState<DraftDay[]>(() => initialDays(plan))
  const [error, setError] = useState<string | null>(null)

  if (!profile) return null

  // ---- day helpers ----
  const updateDay = (i: number, patch: Partial<DraftDay>) =>
    setDays((prev) => prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)))
  const addDay = () =>
    setDays((prev) => [...prev, { title: `Day ${prev.length + 1}`, isRestDay: false, blocks: [emptyExercise()] }])
  const removeDay = (i: number) => setDays((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev))

  // ---- exercise helpers ----
  const updateExercise = (di: number, ei: number, patch: Partial<DraftExercise>) =>
    setDays((prev) =>
      prev.map((d, idx) =>
        idx === di ? { ...d, blocks: d.blocks.map((b, bi) => (bi === ei ? { ...b, ...patch } : b)) } : d,
      ),
    )
  const addExercise = (di: number) =>
    setDays((prev) => prev.map((d, idx) => (idx === di ? { ...d, blocks: [...d.blocks, emptyExercise()] } : d)))
  const removeExercise = (di: number, ei: number) =>
    setDays((prev) =>
      prev.map((d, idx) => (idx === di ? { ...d, blocks: d.blocks.filter((_, bi) => bi !== ei) } : d)),
    )

  const save = () => {
    // Build the plan, keeping only named exercises on training days.
    const builtDays: WorkoutDay[] = days.map((d) => {
      if (d.isRestDay) {
        return { title: d.title.trim() || 'Rest', isRestDay: true, blocks: [] }
      }
      const blocks: PlannedSet[] = d.blocks
        .filter((b) => b.exerciseName.trim())
        .map((b) => ({
          exerciseId: resolveExerciseId(b.exerciseName),
          exerciseName: b.exerciseName.trim(),
          sets: Math.max(1, Number(b.sets) || 1),
          reps: String(b.reps).trim() || '10',
          restSeconds: Math.max(0, Number(b.restSeconds) || 0),
        }))
      return { title: d.title.trim() || 'Workout', blocks }
    })

    const trainingDays = builtDays.filter((d) => !d.isRestDay && d.blocks.length > 0)
    if (trainingDays.length === 0) {
      setError('Add at least one training day with one exercise before saving.')
      return
    }

    const newPlan: WorkoutPlan = {
      source: 'custom',
      name: name.trim() || 'My Routine',
      goal: profile.goal,
      experience: profile.experience,
      equipment: profile.equipment,
      daysPerWeek: trainingDays.length,
      days: builtDays,
      generatedAt: new Date().toISOString(),
    }
    saveCustomPlan(newPlan)
    navigate('/plan')
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{editingCustom ? 'Edit Your Routine' : 'Build Your Routine'}</h1>
        <p className="mt-1 text-sm text-white/55">
          Add your training days and rest days. For each exercise, set the sets, reps and rest.
        </p>
      </div>

      <div className="card">
        <label className="label" htmlFor="plan-name">Routine name</label>
        <input id="plan-name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. PPL, Upper/Lower, My Split" />
      </div>

      {days.map((day, di) => (
        <div key={di} className="card space-y-3">
          <div className="flex items-center gap-2">
            <input
              className="input flex-1 font-semibold"
              value={day.title}
              onChange={(e) => updateDay(di, { title: e.target.value })}
              placeholder={`Day ${di + 1}`}
            />
            <button
              onClick={() => removeDay(di)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-white/40 hover:bg-white/5 hover:text-rose-300"
              aria-label="Remove day"
              title="Remove day"
            >
              ✕
            </button>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={day.isRestDay}
              onChange={(e) => updateDay(di, { isRestDay: e.target.checked })}
              className="h-4 w-4 accent-brand-500"
            />
            Rest day
          </label>

          {!day.isRestDay && (
            <div className="space-y-3">
              {day.blocks.map((b, ei) => (
                <div key={ei} className="rounded-xl border border-white/5 bg-black/20 p-3">
                  <div className="flex items-center gap-2">
                    <input
                      className="input flex-1"
                      list="exercise-options"
                      value={b.exerciseName}
                      onChange={(e) => updateExercise(di, ei, { exerciseName: e.target.value })}
                      placeholder="Exercise name (type or pick)"
                    />
                    <button
                      onClick={() => removeExercise(di, ei)}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white/40 hover:bg-white/5 hover:text-rose-300"
                      aria-label="Remove exercise"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <div>
                      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-white/40">Sets</span>
                      <input
                        type="number"
                        min={1}
                        className="input"
                        value={b.sets}
                        onChange={(e) => updateExercise(di, ei, { sets: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-white/40">Reps</span>
                      <input
                        className="input"
                        value={b.reps}
                        onChange={(e) => updateExercise(di, ei, { reps: e.target.value })}
                        placeholder="e.g. 8–12"
                      />
                    </div>
                    <div>
                      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-white/40">Rest (s)</span>
                      <input
                        type="number"
                        min={0}
                        step={15}
                        className="input"
                        value={b.restSeconds}
                        onChange={(e) => updateExercise(di, ei, { restSeconds: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => addExercise(di)} className="btn-ghost w-full">
                + Add exercise
              </button>
            </div>
          )}
        </div>
      ))}

      <button onClick={addDay} className="btn-ghost w-full">
        + Add another day
      </button>

      {error && <div className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-100">{error}</div>}

      <div className="flex gap-2">
        <button onClick={() => navigate('/plan')} className="btn-ghost flex-1">
          Cancel
        </button>
        <button onClick={save} className="btn-primary flex-1">
          Save routine
        </button>
      </div>

      {/* shared suggestions for all exercise inputs */}
      <datalist id="exercise-options">
        {EXERCISES.map((e) => (
          <option key={e.id} value={e.name} />
        ))}
      </datalist>
    </div>
  )
}
