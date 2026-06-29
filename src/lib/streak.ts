import type { StreakStats } from '../types'

/** Format a Date as a local "YYYY-MM-DD" string (no timezone surprises). */
export function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayKey(): string {
  return toDateKey(new Date())
}

function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function daysBetween(a: Date, b: Date): number {
  const ms = parseKey(toDateKey(a)).getTime() - parseKey(toDateKey(b)).getTime()
  return Math.round(ms / 86_400_000)
}

/**
 * Streak = consecutive days with a logged visit, counting back from today.
 * A streak stays "alive" if you went today OR yesterday (so a rest day today
 * doesn't instantly kill it until tomorrow).
 */
export function computeStats(dates: string[], weeklyGoal: number): StreakStats {
  const set = new Set(dates)
  const sorted = [...set].sort()
  const today = new Date()

  // ----- current streak -----
  let current = 0
  const startOffset = set.has(todayKey()) ? 0 : 1 // allow grace for "haven't gone yet today"
  let cursor = new Date(today)
  cursor.setDate(cursor.getDate() - startOffset)
  while (set.has(toDateKey(cursor))) {
    current++
    cursor.setDate(cursor.getDate() - 1)
  }
  // If the most recent visit is older than yesterday, the streak is broken (0).
  if (sorted.length) {
    const last = parseKey(sorted[sorted.length - 1])
    if (daysBetween(today, last) > 1) current = 0
  } else {
    current = 0
  }

  // ----- longest streak -----
  let longest = 0
  let run = 0
  let prev: Date | null = null
  for (const key of sorted) {
    const d = parseKey(key)
    if (prev && daysBetween(d, prev) === 1) {
      run++
    } else {
      run = 1
    }
    if (run > longest) longest = run
    prev = d
  }

  // ----- this week (Mon–Sun) -----
  const startOfWeek = new Date(today)
  const dow = (today.getDay() + 6) % 7 // make Monday = 0
  startOfWeek.setDate(today.getDate() - dow)
  const visitsThisWeek = sorted.filter((k) => parseKey(k) >= parseKey(toDateKey(startOfWeek))).length

  // ----- this month -----
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const visitsThisMonth = sorted.filter((k) => parseKey(k) >= startOfMonth).length

  return {
    current,
    longest: Math.max(longest, current),
    totalVisits: set.size,
    visitsThisWeek,
    visitsThisMonth,
    weeklyGoalMet: visitsThisWeek >= weeklyGoal,
  }
}

/** Build a grid of the last N days for a contribution-style calendar. */
export function lastNDays(n: number): string[] {
  const out: string[] = []
  const today = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    out.push(toDateKey(d))
  }
  return out
}
