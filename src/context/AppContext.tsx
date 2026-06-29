import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Profile, WorkoutPlan } from '../types'
import { computeStats } from '../lib/streak'
import { generatePlan } from '../lib/planGenerator'

const KEYS = {
  profile: 'fitforge.profile',
  plan: 'fitforge.plan',
  visits: 'fitforge.visits',
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full / unavailable — fail silently */
  }
}

interface AppState {
  profile: Profile | null
  plan: WorkoutPlan | null
  visits: string[]
  saveProfile: (p: Profile) => void
  regeneratePlan: () => void
  toggleVisit: (dateKey: string) => void
  logToday: () => void
  hasVisit: (dateKey: string) => boolean
  resetAll: () => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(() => load(KEYS.profile, null))
  const [plan, setPlan] = useState<WorkoutPlan | null>(() => load(KEYS.plan, null))
  const [visits, setVisits] = useState<string[]>(() => load(KEYS.visits, []))

  useEffect(() => save(KEYS.profile, profile), [profile])
  useEffect(() => save(KEYS.plan, plan), [plan])
  useEffect(() => save(KEYS.visits, visits), [visits])

  const saveProfile = (p: Profile) => {
    setProfile(p)
    // (Re)generate a plan whenever the profile is saved.
    setPlan(generatePlan(p))
  }

  const regeneratePlan = () => {
    if (profile) setPlan(generatePlan(profile))
  }

  const toggleVisit = (dateKey: string) => {
    setVisits((prev) => (prev.includes(dateKey) ? prev.filter((d) => d !== dateKey) : [...prev, dateKey]))
  }

  const logToday = () => {
    const key = new Date()
    const k = `${key.getFullYear()}-${String(key.getMonth() + 1).padStart(2, '0')}-${String(key.getDate()).padStart(2, '0')}`
    setVisits((prev) => (prev.includes(k) ? prev : [...prev, k]))
  }

  const hasVisit = (dateKey: string) => visits.includes(dateKey)

  const resetAll = () => {
    setProfile(null)
    setPlan(null)
    setVisits([])
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
  }

  const value: AppState = {
    profile,
    plan,
    visits,
    saveProfile,
    regeneratePlan,
    toggleVisit,
    logToday,
    hasVisit,
    resetAll,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppState {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

/** Convenience hook for streak stats derived from current visits + profile goal. */
export function useStreak() {
  const { visits, profile } = useApp()
  return useMemo(() => computeStats(visits, profile?.daysPerWeek ?? 3), [visits, profile?.daysPerWeek])
}
