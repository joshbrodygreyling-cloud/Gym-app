// ---------- Profile & goals ----------

export type Sex = 'male' | 'female' | 'other'

export type Goal =
  | 'build_muscle'
  | 'lose_weight'
  | 'get_stronger'
  | 'endurance'
  | 'general_fitness'

export type Experience = 'beginner' | 'intermediate' | 'advanced'

export type Equipment = 'full_gym' | 'dumbbells_only' | 'bodyweight'

export interface Profile {
  name: string
  age: number | null
  /** stored in kilograms */
  weightKg: number | null
  /** stored in centimetres */
  heightCm: number | null
  sex: Sex
  goal: Goal
  experience: Experience
  daysPerWeek: number
  equipment: Equipment
  units: 'metric' | 'imperial'
  createdAt: string
}

// ---------- Exercises ----------

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'core'
  | 'full_body'
  | 'cardio'

export type ExerciseCategory = 'machine' | 'free_weight' | 'bodyweight' | 'cardio' | 'cable'

export interface Exercise {
  id: string
  name: string
  /** common alternate names — used to make photo / text search forgiving */
  aliases: string[]
  category: ExerciseCategory
  primaryMuscles: MuscleGroup[]
  secondaryMuscles: MuscleGroup[]
  equipment: Equipment[]
  /** higher = more demanding / better for advanced lifters */
  difficulty: 1 | 2 | 3
  /** a big multi-joint movement that should anchor a session */
  compound: boolean
  /** step-by-step how-to-use instructions */
  howTo: string[]
  tips: string[]
  commonMistakes: string[]
}

// ---------- Generated plans ----------

export interface PlannedSet {
  exerciseId: string
  exerciseName: string
  sets: number
  reps: string
  restSeconds: number
  note?: string
}

export interface WorkoutDay {
  title: string
  focus: string
  warmup: string
  blocks: PlannedSet[]
  finisher?: string
}

export interface WorkoutPlan {
  goal: Goal
  daysPerWeek: number
  experience: Experience
  equipment: Equipment
  summary: string
  weeklyVolumeNote: string
  days: WorkoutDay[]
  generatedAt: string
}

// ---------- Streak / attendance ----------

export interface VisitLog {
  /** ISO date strings: "2026-06-29" */
  dates: string[]
}

export interface StreakStats {
  current: number
  longest: number
  totalVisits: number
  visitsThisWeek: number
  visitsThisMonth: number
  weeklyGoalMet: boolean
}
