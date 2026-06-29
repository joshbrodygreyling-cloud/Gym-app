import { useMemo, useState } from 'react'
import { estimate1RM, platesPerSide, rmPercentTable } from '../lib/nutrition'
import { useApp } from '../context/AppContext'

const KG_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25]
const LB_PLATES = [45, 35, 25, 10, 5, 2.5]

function OneRepMax() {
  const [weight, setWeight] = useState('60')
  const [reps, setReps] = useState('5')
  const oneRm = estimate1RM(Number(weight) || 0, Number(reps) || 0)
  const table = useMemo(() => (oneRm ? rmPercentTable(oneRm) : []), [oneRm])

  return (
    <div className="card space-y-4">
      <div>
        <h3 className="text-sm font-bold text-brand-200">1-Rep Max Estimator</h3>
        <p className="text-xs text-white/50">Enter a weight and how many reps you can do with it.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="orm-w">Weight lifted</label>
          <input id="orm-w" className="input" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="orm-r">Reps</label>
          <input id="orm-r" className="input" type="number" value={reps} onChange={(e) => setReps(e.target.value)} />
        </div>
      </div>
      <div className="rounded-xl bg-brand-500/10 p-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-200">Estimated 1RM</p>
        <p className="text-4xl font-extrabold text-white">{oneRm || '—'}</p>
      </div>
      {oneRm > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-200/80">Training percentages</p>
          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            {table.map((r) => (
              <div key={r.pct} className="rounded-lg bg-white/[0.04] p-2 text-center">
                <p className="font-bold text-white">{r.weight}</p>
                <p className="text-[11px] text-white/50">{r.pct}% · ~{r.reps} reps</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PlateCalculator({ unit }: { unit: 'metric' | 'imperial' }) {
  const isKg = unit === 'metric'
  const barDefault = isKg ? 20 : 45
  const [target, setTarget] = useState(String(isKg ? 60 : 135))
  const [bar, setBar] = useState(String(barDefault))

  const available = isKg ? KG_PLATES : LB_PLATES
  const { plates, leftover } = platesPerSide(Number(target) || 0, Number(bar) || 0, available)

  // group identical plates for display
  const grouped = plates.reduce<Record<number, number>>((acc, p) => {
    acc[p] = (acc[p] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="card space-y-4">
      <div>
        <h3 className="text-sm font-bold text-brand-200">Barbell Plate Calculator</h3>
        <p className="text-xs text-white/50">What to load on each side of the bar ({isKg ? 'kg' : 'lb'}).</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="pc-t">Target total</label>
          <input id="pc-t" className="input" type="number" value={target} onChange={(e) => setTarget(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="pc-b">Bar weight</label>
          <input id="pc-b" className="input" type="number" value={bar} onChange={(e) => setBar(e.target.value)} />
        </div>
      </div>

      <div className="rounded-xl bg-black/30 p-4">
        {plates.length === 0 ? (
          <p className="text-center text-sm text-white/50">
            {Number(target) <= Number(bar) ? 'Target is at or below the empty bar.' : 'No plates needed.'}
          </p>
        ) : (
          <>
            <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-brand-200">Per side</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {Object.entries(grouped)
                .sort((a, b) => Number(b[0]) - Number(a[0]))
                .map(([p, count]) => (
                  <span key={p} className="rounded-lg bg-brand-500/20 px-3 py-2 text-sm font-bold text-white">
                    {count} × {p}
                  </span>
                ))}
            </div>
          </>
        )}
        {leftover > 0 && (
          <p className="mt-3 text-center text-xs text-amber-300">
            Can’t make the last {leftover}{isKg ? 'kg' : 'lb'} per side with standard plates.
          </p>
        )}
      </div>
    </div>
  )
}

export default function ToolsPage() {
  const { profile } = useApp()
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Gym Tools</h1>
        <p className="mt-1 text-sm text-white/55">Handy calculators for smarter training.</p>
      </div>
      <OneRepMax />
      <PlateCalculator unit={profile?.units ?? 'metric'} />
    </div>
  )
}
