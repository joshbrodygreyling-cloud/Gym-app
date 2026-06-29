import { useState } from 'react'
import type { Equipment, Experience, Goal, Profile, Sex } from '../types'
import { EQUIPMENT_LABELS, EXPERIENCE_LABELS, GOAL_LABELS } from '../lib/planGenerator'

interface Props {
  initial?: Profile | null
  submitLabel: string
  onSubmit: (p: Profile) => void
}

const GOALS: Goal[] = ['build_muscle', 'lose_weight', 'get_stronger', 'endurance', 'general_fitness']
const EXPERIENCES: Experience[] = ['beginner', 'intermediate', 'advanced']
const EQUIPMENTS: Equipment[] = ['full_gym', 'dumbbells_only', 'bodyweight']

const GOAL_BLURB: Record<Goal, string> = {
  build_muscle: 'Add size and shape',
  lose_weight: 'Burn fat, stay lean',
  get_stronger: 'Lift heavier weights',
  endurance: 'Last longer, more stamina',
  general_fitness: 'Feel good overall',
}

function lbToKg(lb: number) {
  return Math.round(lb * 0.453592 * 10) / 10
}
function kgToLb(kg: number) {
  return Math.round(kg / 0.453592)
}
function inToCm(inches: number) {
  return Math.round(inches * 2.54)
}
function cmToInTotal(cm: number) {
  return Math.round(cm / 2.54)
}

export default function ProfileForm({ initial, submitLabel, onSubmit }: Props) {
  const [units, setUnits] = useState<'metric' | 'imperial'>(initial?.units ?? 'metric')
  const [name, setName] = useState(initial?.name ?? '')
  const [age, setAge] = useState<string>(initial?.age ? String(initial.age) : '')
  const [sex, setSex] = useState<Sex>(initial?.sex ?? 'male')
  const [goal, setGoal] = useState<Goal>(initial?.goal ?? 'build_muscle')
  const [experience, setExperience] = useState<Experience>(initial?.experience ?? 'beginner')
  const [equipment, setEquipment] = useState<Equipment>(initial?.equipment ?? 'full_gym')
  const [daysPerWeek, setDaysPerWeek] = useState<number>(initial?.daysPerWeek ?? 3)

  // weight
  const [weight, setWeight] = useState<string>(() => {
    if (!initial?.weightKg) return ''
    return String(initial.units === 'imperial' ? kgToLb(initial.weightKg) : initial.weightKg)
  })
  // height (metric: cm; imperial: ft + in)
  const [heightCm, setHeightCm] = useState<string>(() =>
    initial?.heightCm && (initial.units ?? 'metric') === 'metric' ? String(initial.heightCm) : '',
  )
  const [feet, setFeet] = useState<string>(() => {
    if (initial?.heightCm && initial.units === 'imperial') return String(Math.floor(cmToInTotal(initial.heightCm) / 12))
    return ''
  })
  const [inches, setInches] = useState<string>(() => {
    if (initial?.heightCm && initial.units === 'imperial') return String(cmToInTotal(initial.heightCm) % 12)
    return ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let weightKg: number | null = null
    if (weight) weightKg = units === 'imperial' ? lbToKg(Number(weight)) : Number(weight)

    let computedHeightCm: number | null = null
    if (units === 'metric') {
      computedHeightCm = heightCm ? Number(heightCm) : null
    } else if (feet || inches) {
      computedHeightCm = inToCm(Number(feet || 0) * 12 + Number(inches || 0))
    }

    const profile: Profile = {
      name: name.trim() || 'Athlete',
      age: age ? Number(age) : null,
      weightKg,
      heightCm: computedHeightCm,
      sex,
      goal,
      experience,
      equipment,
      daysPerWeek,
      units,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    }
    onSubmit(profile)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Units toggle */}
      <div className="flex items-center justify-end gap-2">
        <span className="text-xs text-white/50">Units:</span>
        <div className="flex overflow-hidden rounded-lg border border-white/10 text-xs">
          {(['metric', 'imperial'] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnits(u)}
              className={`px-3 py-1.5 font-semibold transition ${
                units === u ? 'bg-brand-500 text-white' : 'bg-white/[0.02] text-white/60'
              }`}
            >
              {u === 'metric' ? 'kg / cm' : 'lb / ft'}
            </button>
          ))}
        </div>
      </div>

      {/* Basics */}
      <div className="card space-y-4">
        <h3 className="text-sm font-bold text-brand-200">About you</h3>
        <div>
          <label className="label" htmlFor="name">Name</label>
          <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="age">Age</label>
            <input id="age" className="input" type="number" min={12} max={100} value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 24" />
          </div>
          <div>
            <label className="label" htmlFor="weight">Weight ({units === 'metric' ? 'kg' : 'lb'})</label>
            <input id="weight" className="input" type="number" min={0} value={weight} onChange={(e) => setWeight(e.target.value)} placeholder={units === 'metric' ? 'e.g. 75' : 'e.g. 165'} />
          </div>
        </div>

        {units === 'metric' ? (
          <div>
            <label className="label" htmlFor="height">Height (cm)</label>
            <input id="height" className="input" type="number" min={0} value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="e.g. 178" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="feet">Height (ft)</label>
              <input id="feet" className="input" type="number" min={0} value={feet} onChange={(e) => setFeet(e.target.value)} placeholder="e.g. 5" />
            </div>
            <div>
              <label className="label" htmlFor="inches">Height (in)</label>
              <input id="inches" className="input" type="number" min={0} max={11} value={inches} onChange={(e) => setInches(e.target.value)} placeholder="e.g. 10" />
            </div>
          </div>
        )}

        <div>
          <span className="label">Sex</span>
          <div className="grid grid-cols-3 gap-2">
            {(['male', 'female', 'other'] as Sex[]).map((s) => (
              <button key={s} type="button" onClick={() => setSex(s)} className={`chip ${sex === s ? 'chip-on' : 'chip-off'}`}>
                {s[0].toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Goal */}
      <div className="card space-y-3">
        <h3 className="text-sm font-bold text-brand-200">What's your main goal?</h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {GOALS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGoal(g)}
              className={`flex flex-col items-start rounded-xl border px-4 py-3 text-left transition ${
                goal === g ? 'border-brand-400 bg-brand-500/20' : 'border-white/10 bg-white/[0.02] hover:border-white/25'
              }`}
            >
              <span className="font-semibold text-white">{GOAL_LABELS[g]}</span>
              <span className="text-xs text-white/50">{GOAL_BLURB[g]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div className="card space-y-3">
        <h3 className="text-sm font-bold text-brand-200">Experience level</h3>
        <div className="grid grid-cols-3 gap-2">
          {EXPERIENCES.map((x) => (
            <button key={x} type="button" onClick={() => setExperience(x)} className={`chip ${experience === x ? 'chip-on' : 'chip-off'}`}>
              {EXPERIENCE_LABELS[x]}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment */}
      <div className="card space-y-3">
        <h3 className="text-sm font-bold text-brand-200">What can you train with?</h3>
        <div className="grid grid-cols-3 gap-2">
          {EQUIPMENTS.map((eq) => (
            <button key={eq} type="button" onClick={() => setEquipment(eq)} className={`chip ${equipment === eq ? 'chip-on' : 'chip-off'}`}>
              {EQUIPMENT_LABELS[eq]}
            </button>
          ))}
        </div>
      </div>

      {/* Days per week */}
      <div className="card space-y-3">
        <h3 className="text-sm font-bold text-brand-200">Days per week you can train</h3>
        <div className="grid grid-cols-6 gap-2">
          {[1, 2, 3, 4, 5, 6].map((d) => (
            <button key={d} type="button" onClick={() => setDaysPerWeek(d)} className={`chip ${daysPerWeek === d ? 'chip-on' : 'chip-off'}`}>
              {d}
            </button>
          ))}
        </div>
        <p className="text-xs text-white/40">This also becomes your weekly consistency goal for your streak.</p>
      </div>

      <button type="submit" className="btn-primary w-full py-3 text-base">
        {submitLabel}
      </button>
    </form>
  )
}
