import type { StreakStats } from '../types'

export interface Achievement {
  id: string
  emoji: string
  title: string
  desc: string
  unlocked: boolean
}

/** Derive a list of motivational badges from the user's streak stats. */
export function achievementsFor(stats: StreakStats): Achievement[] {
  return [
    { id: 'first', emoji: '🎯', title: 'First Step', desc: 'Log your first gym visit', unlocked: stats.totalVisits >= 1 },
    { id: 'week', emoji: '🔥', title: 'On Fire', desc: 'Reach a 3-day streak', unlocked: stats.longest >= 3 },
    { id: 'streak7', emoji: '⚡', title: 'Week Warrior', desc: 'Reach a 7-day streak', unlocked: stats.longest >= 7 },
    { id: 'streak30', emoji: '🏅', title: 'Unstoppable', desc: 'Reach a 30-day streak', unlocked: stats.longest >= 30 },
    { id: 'ten', emoji: '💪', title: 'Regular', desc: 'Log 10 total visits', unlocked: stats.totalVisits >= 10 },
    { id: 'fifty', emoji: '👑', title: 'Gym Royalty', desc: 'Log 50 total visits', unlocked: stats.totalVisits >= 50 },
    { id: 'goal', emoji: '✅', title: 'Goal Crusher', desc: 'Hit your weekly goal', unlocked: stats.weeklyGoalMet },
    { id: 'month', emoji: '📅', title: 'Monthly Mover', desc: '12+ visits in a month', unlocked: stats.visitsThisMonth >= 12 },
  ]
}
