import { getExerciseById } from '../data/exercises'
import { estimate1RM } from './nutrition'
import type { LiftEntry } from '../types'

export type ProgressionType = 'increase' | 'hold' | 'deload' | 'first'

export interface Progression {
  type: ProgressionType
  /** suggested working weight for the next session */
  suggestedWeight: number
  /** suggested rep target */
  suggestedReps: number
  unit: 'kg' | 'lb'
  message: string
  /** the entry this recommendation is based on, if any */
  basedOn?: LiftEntry
}

/**
 * Decide whether an exercise is a "big" lift that warrants larger jumps.
 * Lower-body and compound movements progress in bigger increments than small
 * isolation lifts.
 */
function isBigLift(exerciseId: string): boolean {
  const ex = getExerciseById(exerciseId)
  if (!ex) return false
  if (!ex.compound) return false
  return ex.primaryMuscles.some((m) => m === 'quads' || m === 'hamstrings' || m === 'glutes' || m === 'back')
}

/** Weight jump for a successful session, in the entry's unit. */
function increment(exerciseId: string, unit: 'kg' | 'lb'): number {
  const big = isBigLift(exerciseId)
  if (unit === 'lb') return big ? 10 : 5
  return big ? 5 : 2.5
}

/** The top working weight used in a session (max across sets). */
export function topWeight(entry: LiftEntry): number {
  return entry.sets.reduce((m, s) => Math.max(m, s.weight), 0)
}

/** Best estimated 1RM from a session's sets. */
export function bestE1RM(entry: LiftEntry): number {
  return entry.sets.reduce((m, s) => Math.max(m, estimate1RM(s.weight, s.reps)), 0)
}

/** All entries for one exercise, newest first. */
export function historyFor(entries: LiftEntry[], exerciseId: string): LiftEntry[] {
  return entries
    .filter((e) => e.exerciseId === exerciseId)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id.localeCompare(a.id)))
}

/**
 * Progressive-overload recommendation for the next time the user trains an
 * exercise, based on their most recent logged session.
 */
export function suggestProgression(entries: LiftEntry[], exerciseId: string): Progression {
  const history = historyFor(entries, exerciseId)
  const last = history[0]

  if (!last || last.sets.length === 0) {
    return {
      type: 'first',
      suggestedWeight: 0,
      suggestedReps: 8,
      unit: 'kg',
      message: 'No history yet. Pick a weight you can control for 8–10 clean reps, and log it — we’ll guide your progression from there.',
    }
  }

  const unit = last.unit
  const goal = last.repGoal
  const working = topWeight(last)
  const jump = increment(exerciseId, unit)

  const setsAtTop = last.sets.filter((s) => s.weight >= working - 1e-9)
  const hitAll = setsAtTop.length > 0 && setsAtTop.every((s) => s.reps >= goal)
  const worstReps = Math.min(...last.sets.map((s) => s.reps))

  if (hitAll) {
    return {
      type: 'increase',
      suggestedWeight: working + jump,
      suggestedReps: goal,
      unit,
      basedOn: last,
      message: `Last time you hit all ${goal} reps at ${working}${unit}. Add ${jump}${unit} → aim for ${goal} reps at ${working + jump}${unit}.`,
    }
  }

  // Struggled badly across the board -> deload slightly.
  if (worstReps < Math.max(1, goal - 3)) {
    const deload = Math.max(0, working - jump)
    return {
      type: 'deload',
      suggestedWeight: deload,
      suggestedReps: goal,
      unit,
      basedOn: last,
      message: `Last session was a grind (down to ${worstReps} reps at ${working}${unit}). Drop to ${deload}${unit} and rebuild clean form and reps.`,
    }
  }

  // Close but not all reps -> repeat the weight and chase the missing reps.
  return {
    type: 'hold',
    suggestedWeight: working,
    suggestedReps: goal,
    unit,
    basedOn: last,
    message: `You got ${worstReps}–${Math.max(...last.sets.map((s) => s.reps))} reps at ${working}${unit} last time. Stay at ${working}${unit} and push for ${goal} clean reps on every set, then we’ll add weight.`,
  }
}
