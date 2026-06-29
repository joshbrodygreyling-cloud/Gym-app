import { useRef, useState } from 'react'
import { getApiKey, identifyMachineWithAI, searchExercises, setApiKey } from '../lib/machineId'
import type { VisionResult } from '../lib/machineId'
import type { Exercise } from '../types'
import ExerciseCard from '../components/ExerciseCard'
import { CameraIcon, SparkIcon } from '../components/Icons'

export default function IdentifyPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aiResult, setAiResult] = useState<VisionResult | null>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Exercise[]>([])

  const [showKey, setShowKey] = useState(false)
  const [keyInput, setKeyInput] = useState(getApiKey())
  const hasKey = Boolean(getApiKey())

  const onFile = async (file: File) => {
    setError(null)
    setAiResult(null)
    setPreview(URL.createObjectURL(file))

    if (!getApiKey()) {
      setError('NO_API_KEY')
      return
    }
    setLoading(true)
    try {
      const result = await identifyMachineWithAI(file)
      setAiResult(result)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong'
      setError(msg === 'NO_API_KEY' ? 'NO_API_KEY' : msg)
    } finally {
      setLoading(false)
    }
  }

  const runSearch = (q: string) => {
    setQuery(q)
    setResults(searchExercises(q))
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Identify a Machine</h1>
        <p className="mt-1 text-sm text-white/55">
          Not sure how to use something? Snap a photo and we’ll tell you what it is and how to use it — or search by name.
        </p>
      </div>

      {/* Photo upload */}
      <div className="card space-y-4">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onFile(f)
          }}
        />

        {preview ? (
          <img src={preview} alt="Your machine" className="max-h-72 w-full rounded-xl object-contain" />
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-white/15 py-10 text-white/50 transition hover:border-brand-400/50 hover:text-white/70"
          >
            <CameraIcon className="h-10 w-10" />
            <span className="font-semibold">Tap to take or upload a photo</span>
            <span className="text-xs">JPG or PNG of the machine</span>
          </button>
        )}

        {preview && (
          <button onClick={() => fileRef.current?.click()} className="btn-ghost w-full">
            <CameraIcon className="h-4 w-4" /> Choose a different photo
          </button>
        )}

        {loading && (
          <div className="flex items-center gap-3 text-sm text-brand-200">
            <SparkIcon className="h-5 w-5 animate-spin" />
            Analysing your photo…
          </div>
        )}

        {/* AI result */}
        {aiResult && (
          <div className="space-y-3">
            <div className="rounded-xl border border-brand-400/30 bg-brand-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-200">Identified</p>
              <p className="mt-0.5 text-lg font-bold text-white">{aiResult.rawName}</p>
              <p className="mt-1 text-sm text-white/75">{aiResult.description}</p>
            </div>
            {aiResult.match && (
              <>
                <p className="text-xs text-white/45">Full guide from our library:</p>
                <ExerciseCard exercise={aiResult.match} defaultOpen />
              </>
            )}
          </div>
        )}

        {/* No-key explainer */}
        {error === 'NO_API_KEY' && (
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm">
            <p className="font-semibold text-amber-100">Photo recognition needs a one-time setup</p>
            <p className="mt-1 text-amber-100/80">
              Add a free Anthropic API key to turn on AI photo identification. It’s stored only on this device. No key?
              No problem — just search by name below, it covers every machine in our library.
            </p>
            <button onClick={() => setShowKey((s) => !s)} className="btn-ghost mt-3">
              {showKey ? 'Hide' : hasKey ? 'Update API key' : 'Add API key'}
            </button>
            {showKey && (
              <div className="mt-3 flex gap-2">
                <input
                  className="input"
                  type="password"
                  placeholder="sk-ant-..."
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                />
                <button
                  className="btn-primary shrink-0"
                  onClick={() => {
                    setApiKey(keyInput)
                    setShowKey(false)
                    setError(null)
                  }}
                >
                  Save
                </button>
              </div>
            )}
          </div>
        )}

        {error && error !== 'NO_API_KEY' && (
          <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-100">{error}</div>
        )}
      </div>

      {/* Text search fallback */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-brand-200">Or search by name</h2>
        <input
          className="input"
          placeholder="e.g. lat pulldown, leg press, rowing machine…"
          value={query}
          onChange={(e) => runSearch(e.target.value)}
        />
        {query && results.length === 0 && (
          <p className="text-sm text-white/45">No matches. Try another name or browse the full library.</p>
        )}
        <div className="space-y-3">
          {results.map((ex) => (
            <ExerciseCard key={ex.id} exercise={ex} defaultOpen={results.length === 1} />
          ))}
        </div>
      </div>
    </div>
  )
}
