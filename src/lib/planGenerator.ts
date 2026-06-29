import { EXERCISES } from '../data/exercises'
import type {
  Equipment,
  Exercise,
  Experience,
  Goal,
  MuscleGroup,
  PlannedSet,
  Profile,
  WorkoutDay,
  WorkoutPlan,
} from '../types'

// ---------------------------------------------------------------------------
// Goal -> training parameters
// ---------------------------------------------------------------------------

interface GoalParams {
  compoundSets: number
  isolationSets: number
  compoundReps: string
  isolationReps: string
  restCompound: number
  restIsolation: number
  /** add a conditioning finisher to each day */
  addCardioFinisher: boolean
  summary: string
  weeklyVolumeNote: string
}

function goalParams(goal: Goal, experience: Experience): GoalParams {
  // Beginners do slightly less volume regardless of goal.
  const beginnerTrim = experience === 'beginner' ? 1 : 0
  const advancedBump = experience === 'advanced' ? 1 : 0

  switch (goal) {
    case 'build_muscle':
      return {
        compoundSets: 4 - beginnerTrim + advancedBump,
        isolationSets: 3 - beginnerTrim + advancedBump,
        compoundReps: '8–10',
        isolationReps: '10–12',
        restCompound: 90,
        restIsolation: 60,
        addCardioFinisher: false,
        summary:
          'Hypertrophy-focused plan: moderate weights, controlled tempo, and enough volume to drive muscle growth. Aim to add a rep or a little weight each week.',
        weeklyVolumeNote:
          'Progressive overload is key. When you can hit the top of the rep range on every set, increase the weight slightly next session.',
      }
    case 'get_stronger':
      return {
        compoundSets: 5 - beginnerTrim,
        isolationSets: 3 - beginnerTrim,
        compoundReps: '4–6',
        isolationReps: '6–8',
        restCompound: 180,
        restIsolation: 90,
        addCardioFinisher: false,
        summary:
          'Strength plan built around heavy compound lifts with low reps and long rest so you can move serious weight safely. Accessories keep you balanced.',
        weeklyVolumeNote:
          'Rest fully between heavy sets (2–3 min). Prioritise good form over chasing numbers — add weight only when all reps are clean.',
      }
    case 'lose_weight':
      return {
        compoundSets: 3,
        isolationSets: 3,
        compoundReps: '10–12',
        isolationReps: '12–15',
        restCompound: 60,
        restIsolation: 45,
        addCardioFinisher: true,
        summary:
          'Fat-loss plan combining full-body resistance training with short rest and cardio finishers to keep your heart rate up and burn more calories. Lifting preserves muscle while you lose fat.',
        weeklyVolumeNote:
          'Keep rest short to stay in a higher heart-rate zone. Pair this with a calorie deficit and 7–10k steps a day for best results.',
      }
    case 'endurance':
      return {
        compoundSets: 3,
        isolationSets: 2,
        compoundReps: '15–20',
        isolationReps: '15–20',
        restCompound: 45,
        restIsolation: 30,
        addCardioFinisher: true,
        summary:
          'Muscular-endurance plan: higher reps, light-to-moderate loads, and short rest to build stamina, plus steady cardio work.',
        weeklyVolumeNote:
          'Focus on continuous, controlled reps. Build up your cardio duration week over week.',
      }
    case 'general_fitness':
    default:
      return {
        compoundSets: 3,
        isolationSets: 3 - beginnerTrim,
        compoundReps: '8–12',
        isolationReps: '10–15',
        restCompound: 75,
        restIsolation: 60,
        addCardioFinisher: true,
        summary:
          'Balanced all-round plan that builds a bit of strength, muscle and conditioning. Great for staying healthy, capable and feeling good.',
        weeklyVolumeNote:
          'A sustainable, well-rounded routine. Mix in some cardio you enjoy and aim for consistency above all.',
      }
  }
}

// ---------------------------------------------------------------------------
// Split templates: each day is defined by the muscle groups it targets
// ---------------------------------------------------------------------------

interface DayTemplate {
  title: string
  focus: string
  /** ordered: compounds first. each entry is a muscle to fill with one exercise */
  slots: MuscleGroup[]
}

function buildSplit(daysPerWeek: number): DayTemplate[] {
  const fullBody: DayTemplate = {
    title: 'Full Body',
    focus: 'A bit of everything — push, pull and legs',
    slots: ['quads', 'chest', 'back', 'shoulders', 'hamstrings', 'core'],
  }

  switch (daysPerWeek) {
    case 1:
      return [{ ...fullBody, title: 'Full Body A' }]
    case 2:
      return [
        { ...fullBody, title: 'Full Body A', slots: ['quads', 'chest', 'back', 'shoulders', 'core'] },
        { ...fullBody, title: 'Full Body B', slots: ['hamstrings', 'back', 'chest', 'glutes', 'core'] },
      ]
    case 3:
      return [
        {
          title: 'Push (Chest, Shoulders, Triceps)',
          focus: 'Pressing muscles',
          slots: ['chest', 'shoulders', 'chest', 'triceps', 'triceps'],
        },
        {
          title: 'Pull (Back & Biceps)',
          focus: 'Pulling muscles',
          slots: ['back', 'back', 'shoulders', 'biceps', 'biceps'],
        },
        {
          title: 'Legs & Core',
          focus: 'Lower body and abs',
          slots: ['quads', 'hamstrings', 'glutes', 'calves', 'core'],
        },
      ]
    case 4:
      return [
        {
          title: 'Upper A',
          focus: 'Chest & back emphasis',
          slots: ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
        },
        {
          title: 'Lower A',
          focus: 'Quad emphasis',
          slots: ['quads', 'hamstrings', 'glutes', 'calves', 'core'],
        },
        {
          title: 'Upper B',
          focus: 'Shoulders & arms emphasis',
          slots: ['shoulders', 'back', 'chest', 'triceps', 'biceps'],
        },
        {
          title: 'Lower B',
          focus: 'Hamstring & glute emphasis',
          slots: ['hamstrings', 'quads', 'glutes', 'calves', 'core'],
        },
      ]
    case 5:
      return [
        { title: 'Push', focus: 'Chest, shoulders, triceps', slots: ['chest', 'shoulders', 'chest', 'triceps', 'triceps'] },
        { title: 'Pull', focus: 'Back & biceps', slots: ['back', 'back', 'shoulders', 'biceps', 'biceps'] },
        { title: 'Legs', focus: 'Lower body', slots: ['quads', 'hamstrings', 'glutes', 'calves', 'core'] },
        { title: 'Upper', focus: 'Chest, back & arms', slots: ['chest', 'back', 'shoulders', 'biceps', 'triceps'] },
        { title: 'Lower & Core', focus: 'Legs and abs', slots: ['quads', 'hamstrings', 'glutes', 'core', 'core'] },
      ]
    case 6:
    default:
      return [
        { title: 'Push A', focus: 'Chest emphasis', slots: ['chest', 'shoulders', 'chest', 'triceps', 'triceps'] },
        { title: 'Pull A', focus: 'Back emphasis', slots: ['back', 'back', 'shoulders', 'biceps', 'biceps'] },
        { title: 'Legs A', focus: 'Quad emphasis', slots: ['quads', 'hamstrings', 'glutes', 'calves', 'core'] },
        { title: 'Push B', focus: 'Shoulder emphasis', slots: ['shoulders', 'chest', 'shoulders', 'triceps', 'triceps'] },
        { title: 'Pull B', focus: 'Width & biceps', slots: ['back', 'back', 'shoulders', 'biceps', 'biceps'] },
        { title: 'Legs B', focus: 'Hamstring & glute emphasis', slots: ['hamstrings', 'quads', 'glutes', 'calves', 'core'] },
      ]
  }
}

// ---------------------------------------------------------------------------
// Exercise selection
// ---------------------------------------------------------------------------

function maxDifficulty(experience: Experience): number {
  if (experience === 'beginner') return 1
  if (experience === 'intermediate') return 2
  return 3
}

function candidatesFor(muscle: MuscleGroup, equipment: Equipment, experience: Experience): Exercise[] {
  const cap = maxDifficulty(experience)
  return EXERCISES.filter(
    (e) =>
      e.primaryMuscles.includes(muscle) &&
      e.equipment.includes(equipment) &&
      e.category !== 'cardio' &&
      // beginners get difficulty<=1, but allow one step up if nothing else fits later
      e.difficulty <= cap + 1,
  ).sort((a, b) => {
    // Compounds first, then prefer exercises closest to (but not over) the cap.
    if (a.compound !== b.compound) return a.compound ? -1 : 1
    const da = a.difficulty > cap ? 99 : cap - a.difficulty
    const db = b.difficulty > cap ? 99 : cap - b.difficulty
    return da - db
  })
}

function pickCardio(equipment: Equipment): Exercise | undefined {
  const cardio = EXERCISES.filter((e) => e.category === 'cardio' && e.equipment.includes(equipment))
  if (cardio.length) return cardio[Math.floor(Math.random() * cardio.length)]
  // bodyweight fallback conditioning
  return EXERCISES.find((e) => e.id === 'kettlebell-swing' && e.equipment.includes(equipment))
}

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------

export function generatePlan(profile: Profile): WorkoutPlan {
  const { goal, experience, equipment, daysPerWeek } = profile
  const params = goalParams(goal, experience)
  const templates = buildSplit(daysPerWeek)

  const days: WorkoutDay[] = templates.map((template) => {
    const used = new Set<string>()
    const blocks: PlannedSet[] = []

    for (const muscle of template.slots) {
      const candidates = candidatesFor(muscle, equipment, experience).filter((e) => !used.has(e.id))
      const choice = candidates[0] ?? candidatesFor(muscle, equipment, experience)[0]
      if (!choice) continue
      used.add(choice.id)

      const isCompound = choice.compound
      blocks.push({
        exerciseId: choice.id,
        exerciseName: choice.name,
        sets: isCompound ? params.compoundSets : params.isolationSets,
        reps: isCompound ? params.compoundReps : params.isolationReps,
        restSeconds: isCompound ? params.restCompound : params.restIsolation,
      })
    }

    let finisher: string | undefined
    if (params.addCardioFinisher) {
      const cardio = pickCardio(equipment)
      if (cardio) {
        const minutes = goal === 'lose_weight' ? '10–15' : '8–12'
        finisher = `${minutes} min on the ${cardio.name}${
          goal === 'lose_weight' ? ' — alternate 1 min hard / 1 min easy' : ' at a steady, conversational pace'
        }.`
      }
    }

    return {
      title: template.title,
      focus: template.focus,
      warmup:
        '5 minutes of light cardio, then 1–2 light warm-up sets of your first exercise to get the blood flowing and joints ready.',
      blocks,
      finisher,
    }
  })

  return {
    goal,
    daysPerWeek,
    experience,
    equipment,
    summary: params.summary,
    weeklyVolumeNote: params.weeklyVolumeNote,
    days,
    generatedAt: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

export const GOAL_LABELS: Record<Goal, string> = {
  build_muscle: 'Build Muscle',
  lose_weight: 'Lose Weight',
  get_stronger: 'Get Stronger',
  endurance: 'Improve Endurance',
  general_fitness: 'General Fitness',
}

export const EXPERIENCE_LABELS: Record<Experience, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  full_gym: 'Full Gym',
  dumbbells_only: 'Dumbbells Only',
  bodyweight: 'Bodyweight Only',
}
