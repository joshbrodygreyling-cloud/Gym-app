import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { searchExercises } from '../lib/machineId'
import { bestE1RM, historyFor, suggestProgression, topWeight } from '../lib/liftTracker'
import { todayKey } from '../lib/streak'
import type { LiftEntry, LiftSet } from '../types'
import { SparkIcon } from '../components/Icons'

interface Selected {
  id: string
  name: string
}

const PROGRESSION_STYLE: Record<string, string> = {
  increase: 'border-brand-400/40 bg-brand-500/15 text-brand-50',
  hold: 'border-amber-400/30 bg-amber-400/10 text-amber-100',
  deload: 'border-rose-400/30 bg-rose-400/10 text-rose-100',
  first: 'border-white/10 bg-white/[0.03] text-white/75',
}

const PROGRESSION_ICON: Record<string, string> = {
  increase: '⬆️',
  hold: '➡️',
  deload: '⬇️',
  first: '✨',
}

export default function TrackerPage() {
  const { lifts, addLift, deleteLift, profile, plan } = useApp()
  const defaultUnit: 'kg' | 'lb' = profile?.units === 'imperial' ? 'lb' : 'kg'

  // Unique exercises from the user's current plan (generated or custom) for quick logging.
  const planExercises = useMemo(() => {
    if (!plan) return [] as { id: string; name: string }[]
    const seen = new Map<string, string>()
    for (const day of plan.days) {
      for (const b of day.blocks) {
        if (!seen.has(b.exerciseId)) seen.set(b.exerciseId, b.exerciseName)
      }
    }
    return [...seen.entries()].map(([id, name]) => ({ id, name }))
  }, [plan])

  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Selected | null>(null)
  const [unit, setUnit] = useState<'kg' | 'lb'>(defaultUnit)
  const [repGoal, setRepGoal] = useState(8)
  const [sets, setSets] = useState<LiftSet[]>([{ weight: 0, reps: 0 }])
  const [justSaved, setJustSaved] = useState(false)

  const searchResults = useMemo(() => (query ? searchExercises(query).slice(0, 6) : []), [query])
  const progression = useMemo(
    () => (selected ? suggestProgression(lifts, selected.id) : null),
    [lifts, selected],
  )
  const history = useMemo(() => (selected ? historyFor(lifts, selected.id) : []), [lifts, selected])

  const recentAll = useMemo(() => lifts.slice(0, 8), [lifts])

  const selectExercise = (id: string, name: string) => {
    setSelected({ id, name })
    setQuery('')
    const prog = suggestProgression(lifts, id)
    setUnit(prog.basedOn?.unit ?? defaultUnit)
    setRepGoal(prog.suggestedReps || 8)
    // Prefill 3 sets with the suggested working weight (if any).
    const w = prog.suggestedWeight || 0
    setSets([
      { weight: w, reps: 0 },
      { weight: w, reps: 0 },
      { weight: w, reps: 0 },
    ])
    setJustSaved(false)
  }

  const updateSet = (i: number, field: keyof LiftSet, value: number) => {
    setSets((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)))
  }
  const addSet = () => {
    const last = sets[sets.length - 1]
    setSets((prev) => [...prev, { weight: last?.weight ?? 0, reps: 0 }])
  }
  const removeSet = (i: number) => setSets((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev))

  const validSets = sets.filter((s) => s.weight > 0 && s.reps > 0)

  const save = () => {
    if (!selected || validSets.length === 0) return
    const entry: LiftEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      exerciseId: selected.id,
      exerciseName: selected.name,
      date: todayKey(),
      unit,
      repGoal,
      sets: validSets,
    }
    addLift(entry)
    setJustSaved(true)
    setSets([{ weight: 0, reps: 0 }])
  }

  // best ever for selected exercise
  const pr = useMemo(() => {
    if (!history.length) return null
    const bestWeight = Math.max(...history.map(topWeight))
    const best1rm = Math.max(...history.map(bestE1RM))
    return { bestWeight, best1rm }
  }, [history])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Lift Tracker</h1>
        <p className="mt-1 text-sm text-white/55">
          Log your weights and reps. We’ll track your progress and tell you exactly when to add weight.
        </p>
      </div>

      {/* Exercise picker */}
      <div className="card space-y-3">
        <label className="label" htmlFor="lift-search">
          {selected ? 'Logging' : 'Which exercise?'}
        </label>
        {selected ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-lg font-bold text-white">{selected.name}</p>
            <button
              onClick={() => {
                setSelected(null)
                setQuery('')
              }}
              className="text-xs font-semibold text-brand-300"
            >
              Change
            </button>
          </div>
        ) : (
          <>
            <input
              id="lift-search"
              className="input"
              placeholder="Search e.g. bench press, squat, lat pulldown…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div className="space-y-1.5">
                {searchResults.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => selectExercise(ex.id, ex.name)}
                    className="block w-full rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-left text-sm text-white/80 hover:border-brand-400/40"
                  >
                    {ex.name}
                  </button>
                ))}
              </div>
            )}
            {query && searchResults.length === 0 && (
              <button
                onClick={() => selectExercise(query.toLowerCase().replace(/\s+/g, '-'), query.trim())}
                className="block w-full rounded-lg border border-dashed border-white/15 px-3 py-2 text-left text-sm text-white/70 hover:border-brand-400/40"
              >
                Log “{query.trim()}” as a custom exercise
              </button>
            )}

            {!query && planExercises.length > 0 && (
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-brand-200/80">From your plan</p>
                <div className="flex flex-wrap gap-1.5">
                  {planExercises.map((ex) => (
                    <button
                      key={ex.id}
                      onClick={() => selectExercise(ex.id, ex.name)}
                      className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium text-white/75 hover:border-brand-400/40"
                    >
                      {ex.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Progressive overload suggestion */}
      {selected && progression && (
        <div className={`card border ${PROGRESSION_STYLE[progression.type]}`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl leading-none">{PROGRESSION_ICON[progression.type]}</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
                {progression.type === 'first' ? 'Getting started' : 'Progressive overload'}
              </p>
              <p className="mt-1 text-sm">{progression.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Logging form */}
      {selected && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-brand-200">Today’s sets</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/45">Rep goal</span>
              <input
                type="number"
                min={1}
                max={30}
                value={repGoal}
                onChange={(e) => setRepGoal(Number(e.target.value))}
                className="w-16 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-center text-sm text-white"
              />
              <div className="flex overflow-hidden rounded-lg border border-white/10 text-xs">
                {(['kg', 'lb'] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => setUnit(u)}
                    className={`px-2.5 py-1 font-semibold ${unit === u ? 'bg-brand-500 text-white' : 'text-white/60'}`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {sets.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-12 text-xs font-semibold text-white/45">Set {i + 1}</span>
                <div className="flex flex-1 items-center gap-1">
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    value={s.weight || ''}
                    onChange={(e) => updateSet(i, 'weight', Number(e.target.value))}
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-center text-sm text-white"
                  />
                  <span className="text-xs text-white/40">{unit}</span>
                </div>
                <span className="text-white/30">×</span>
                <div className="flex flex-1 items-center gap-1">
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={s.reps || ''}
                    onChange={(e) => updateSet(i, 'reps', Number(e.target.value))}
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-center text-sm text-white"
                  />
                  <span className="text-xs text-white/40">reps</span>
                </div>
                <button
                  onClick={() => removeSet(i)}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white/40 hover:bg-white/5 hover:text-rose-300"
                  aria-label="Remove set"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={addSet} className="btn-ghost flex-1">
              + Add set
            </button>
            <button onClick={save} disabled={validSets.length === 0} className="btn-primary flex-1">
              Save workout
            </button>
          </div>
          {justSaved && <p className="text-center text-xs text-brand-300">Saved! Your progression updates automatically.</p>}
        </div>
      )}

      {/* PRs + history for selected exercise */}
      {selected && history.length > 0 && (
        <div className="space-y-3">
          {pr && (
            <div className="grid grid-cols-2 gap-3">
              <div className="card text-center">
                <p className="text-2xl font-extrabold text-white">
                  {pr.bestWeight}
                  <span className="text-sm font-semibold text-white/40"> {history[0].unit}</span>
                </p>
                <p className="text-xs text-white/50">heaviest lifted</p>
              </div>
              <div className="card text-center">
                <p className="text-2xl font-extrabold text-white">
                  {pr.best1rm}
                  <span className="text-sm font-semibold text-white/40"> {history[0].unit}</span>
                </p>
                <p className="text-xs text-white/50">est. 1-rep max</p>
              </div>
            </div>
          )}
          <div className="card">
            <h3 className="mb-3 text-sm font-bold text-brand-200">History — {selected.name}</h3>
            <div className="space-y-2">
              {history.map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-3 rounded-lg bg-black/20 px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-xs text-white/45">{formatDate(e.date)}</p>
                    <p className="truncate text-sm text-white/85">
                      {e.sets.map((s) => `${s.weight}×${s.reps}`).join(', ')} {e.unit}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteLift(e.id)}
                    className="shrink-0 text-xs text-white/30 hover:text-rose-300"
                    aria-label="Delete entry"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent activity (when nothing selected) */}
      {!selected && (
        <div className="card">
          <h3 className="mb-3 text-sm font-bold text-brand-200">Recent workouts</h3>
          {recentAll.length === 0 ? (
            <p className="text-sm text-white/45">
              Nothing logged yet. Search for an exercise above and log your first sets — every session after that gets a
              smart progression suggestion. <SparkIcon className="inline h-4 w-4 text-brand-300" />
            </p>
          ) : (
            <div className="space-y-2">
              {recentAll.map((e) => (
                <button
                  key={e.id}
                  onClick={() => selectExercise(e.exerciseId, e.exerciseName)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg bg-black/20 px-3 py-2 text-left hover:border-brand-400/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{e.exerciseName}</p>
                    <p className="text-xs text-white/45">
                      {formatDate(e.date)} · {e.sets.map((s) => `${s.weight}×${s.reps}`).join(', ')} {e.unit}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-brand-300">View →</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function formatDate(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const today = new Date()
  const diff = Math.round((new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() - date.getTime()) / 86_400_000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7) return `${diff} days ago`
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}
