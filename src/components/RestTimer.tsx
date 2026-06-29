import { useEffect, useRef, useState } from 'react'

/** A compact countdown rest timer. Starts at `seconds`, beeps softly at 0. */
export default function RestTimer({ seconds }: { seconds: number }) {
  const [remaining, setRemaining] = useState(seconds)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            window.clearInterval(intervalRef.current!)
            setRunning(false)
            beep()
            return 0
          }
          return r - 1
        })
      }, 1000)
    }
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
  }, [running])

  const reset = () => {
    setRunning(false)
    setRemaining(seconds)
  }

  const mm = String(Math.floor(remaining / 60)).padStart(1, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  const pct = seconds > 0 ? (remaining / seconds) * 100 : 0

  return (
    <div className="flex items-center gap-3 rounded-xl bg-black/30 px-3 py-2">
      <div className="relative grid h-12 w-12 shrink-0 place-items-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke="#23a168"
            strokeWidth="3"
            strokeDasharray={`${(pct / 100) * 94.2} 94.2`}
            strokeLinecap="round"
          />
        </svg>
        <span className="text-[11px] font-bold tabular-nums text-white">
          {mm}:{ss}
        </span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => (running ? setRunning(false) : remaining === 0 ? reset() : setRunning(true))}
          className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-400"
        >
          {running ? 'Pause' : remaining === 0 ? 'Reset' : remaining === seconds ? 'Start rest' : 'Resume'}
        </button>
        {remaining !== seconds && (
          <button onClick={reset} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/5">
            Reset
          </button>
        )}
      </div>
    </div>
  )
}

function beep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc.start()
    osc.stop(ctx.currentTime + 0.4)
  } catch {
    /* audio not available */
  }
}
