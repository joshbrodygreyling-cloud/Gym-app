import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ProfileForm from '../components/ProfileForm'
import { getApiKey, setApiKey } from '../lib/machineId'

export default function ProfilePage() {
  const { profile, saveProfile, resetAll } = useApp()
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)
  const [keyInput, setKeyInput] = useState(getApiKey())
  const [keySaved, setKeySaved] = useState(false)

  if (!profile) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Profile & Settings</h1>
        <p className="mt-1 text-sm text-white/55">Update your details and we’ll rebuild your plan to match.</p>
      </div>

      {saved && (
        <div className="rounded-xl border border-brand-400/30 bg-brand-500/10 p-3 text-sm text-brand-100">
          Saved! Your workout plan has been updated.
        </div>
      )}

      <ProfileForm
        initial={profile}
        submitLabel="Save & rebuild plan"
        onSubmit={(p) => {
          saveProfile(p)
          setSaved(true)
          window.scrollTo({ top: 0, behavior: 'smooth' })
          setTimeout(() => setSaved(false), 2500)
        }}
      />

      {/* API key */}
      <div className="card space-y-3">
        <h3 className="text-sm font-bold text-brand-200">AI photo identification (optional)</h3>
        <p className="text-xs text-white/55">
          Add an Anthropic API key to enable identifying machines from a photo. It’s stored only on this device and used
          solely for your photo lookups.
        </p>
        <div className="flex gap-2">
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
              setKeySaved(true)
              setTimeout(() => setKeySaved(false), 2000)
            }}
          >
            Save
          </button>
        </div>
        {keySaved && <p className="text-xs text-brand-300">API key saved on this device.</p>}
      </div>

      {/* Danger zone */}
      <div className="card space-y-3 border-red-400/20">
        <h3 className="text-sm font-bold text-red-300">Reset</h3>
        <p className="text-xs text-white/55">This clears your profile, plan and entire streak history from this device.</p>
        <button
          className="btn border border-red-400/30 bg-red-500/10 text-red-200 hover:bg-red-500/20"
          onClick={() => {
            if (confirm('Reset everything? This cannot be undone.')) {
              resetAll()
              navigate('/onboarding')
            }
          }}
        >
          Reset all data
        </button>
      </div>
    </div>
  )
}
