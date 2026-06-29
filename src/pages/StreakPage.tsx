import { useState } from 'react'
import { useApp, useStreak } from '../context/AppContext'
import { toDateKey, todayKey } from '../lib/streak'
import { CheckIcon, FlameIcon } from '../components/Icons'

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function StreakPage() {
  const { hasVisit, toggleVisit, logToday, profile } = useApp()
  const stats = useStreak()
  const [viewDate, setViewDate] = useState(new Date())

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const startOffset = (firstDay.getDay() + 6) % 7 // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = todayKey()

  const cells: (Date | null)[] = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))

  const changeMonth = (delta: number) => setViewDate(new Date(year, month + delta, 1))
  const wentToday = hasVisit(today)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Your Streak</h1>
        <p className="mt-1 text-sm text-white/55">
          Consistency beats everything. Tap a day to log (or unlog) a gym visit.
        </p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-500/20 text-orange-300">
            <FlameIcon className="h-6 w-6" />
          </span>
          <div>
            <p className="text-2xl font-extrabold text-white">{stats.current}</p>
            <p className="text-xs text-white/50">current streak</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/20 text-brand-300">
            🏆
          </span>
          <div>
            <p className="text-2xl font-extrabold text-white">{stats.longest}</p>
            <p className="text-xs text-white/50">longest streak</p>
          </div>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-extrabold text-white">{stats.totalVisits}</p>
          <p className="text-xs text-white/50">total visits</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-extrabold text-white">
            {stats.visitsThisWeek}
            <span className="text-sm font-semibold text-white/40">/{profile?.daysPerWeek ?? 3}</span>
          </p>
          <p className="text-xs text-white/50">this week {stats.weeklyGoalMet ? '🎉' : ''}</p>
        </div>
      </div>

      <button onClick={logToday} disabled={wentToday} className={`w-full py-3 ${wentToday ? 'btn-ghost' : 'btn-primary'}`}>
        {wentToday ? (
          <>
            <CheckIcon className="h-5 w-5" /> You’ve checked in today — nice work!
          </>
        ) : (
          <>
            <FlameIcon className="h-5 w-5" /> Check in for today
          </>
        )}
      </button>

      {/* Calendar */}
      <div className="card">
        <div className="mb-3 flex items-center justify-between">
          <button onClick={() => changeMonth(-1)} className="rounded-lg px-3 py-1 text-white/60 hover:bg-white/5">
            ‹
          </button>
          <p className="font-bold text-white">
            {MONTHS[month]} {year}
          </p>
          <button onClick={() => changeMonth(1)} className="rounded-lg px-3 py-1 text-white/60 hover:bg-white/5">
            ›
          </button>
        </div>

        <div className="mb-1 grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold text-white/35">
          {WEEKDAYS.map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((date, i) => {
            if (!date) return <div key={i} />
            const key = toDateKey(date)
            const visited = hasVisit(key)
            const isToday = key === today
            const isFuture = key > today
            return (
              <button
                key={i}
                disabled={isFuture}
                onClick={() => toggleVisit(key)}
                className={`aspect-square rounded-lg text-sm font-semibold transition disabled:opacity-30 ${
                  visited
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                    : 'bg-white/[0.04] text-white/55 hover:bg-white/10'
                } ${isToday ? 'ring-2 ring-brand-300' : ''}`}
              >
                {date.getDate()}
              </button>
            )
          })}
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-white/45">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-brand-500" /> Gym visit
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-white/10 ring-2 ring-brand-300" /> Today
          </span>
        </div>
      </div>

      <p className="text-center text-xs text-white/40">
        {stats.weeklyGoalMet
          ? 'You’ve hit your weekly goal — keep the momentum going! 🔥'
          : `${Math.max(0, (profile?.daysPerWeek ?? 3) - stats.visitsThisWeek)} more visit(s) to hit your weekly goal.`}
      </p>
    </div>
  )
}
