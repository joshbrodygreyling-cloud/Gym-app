import { useMemo, useState } from 'react'
import { EXERCISES } from '../data/exercises'
import ExerciseCard from '../components/ExerciseCard'
import type { MuscleGroup } from '../types'

const FILTERS: { key: MuscleGroup | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'chest', label: 'Chest' },
  { key: 'back', label: 'Back' },
  { key: 'shoulders', label: 'Shoulders' },
  { key: 'biceps', label: 'Biceps' },
  { key: 'triceps', label: 'Triceps' },
  { key: 'quads', label: 'Quads' },
  { key: 'hamstrings', label: 'Hamstrings' },
  { key: 'glutes', label: 'Glutes' },
  { key: 'calves', label: 'Calves' },
  { key: 'core', label: 'Core' },
  { key: 'cardio', label: 'Cardio' },
]

export default function LibraryPage() {
  const [filter, setFilter] = useState<MuscleGroup | 'all'>('all')
  const [search, setSearch] = useState('')

  const list = useMemo(() => {
    const q = search.trim().toLowerCase()
    return EXERCISES.filter((e) => {
      const matchesFilter =
        filter === 'all' || e.primaryMuscles.includes(filter) || e.secondaryMuscles.includes(filter)
      const matchesSearch =
        !q || e.name.toLowerCase().includes(q) || e.aliases.some((a) => a.toLowerCase().includes(q))
      return matchesFilter && matchesSearch
    })
  }, [filter, search])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Exercise Library</h1>
        <p className="mt-1 text-sm text-white/55">
          Step-by-step guides for every machine and exercise — {EXERCISES.length} and counting.
        </p>
      </div>

      <input
        className="input"
        placeholder="Search exercises…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              filter === f.key ? 'border-brand-400 bg-brand-500/20 text-white' : 'border-white/10 bg-white/[0.02] text-white/60'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-white/40">{list.length} exercises</p>

      <div className="space-y-3">
        {list.map((ex) => (
          <ExerciseCard key={ex.id} exercise={ex} />
        ))}
        {list.length === 0 && <p className="text-sm text-white/45">Nothing matches that search.</p>}
      </div>
    </div>
  )
}
