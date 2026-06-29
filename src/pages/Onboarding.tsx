import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ProfileForm from '../components/ProfileForm'
import { DumbbellIcon } from '../components/Icons'

export default function Onboarding() {
  const { saveProfile } = useApp()
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="text-center">
        <span className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/20 text-brand-300">
          <DumbbellIcon className="h-7 w-7" />
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Welcome to Fit<span className="text-brand-400">Forge</span>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-white/55">
          Your complete gym companion. Tell us about yourself and your goal, and we’ll forge a personalised workout plan,
          help you use any machine, and keep your streak alive.
        </p>
      </div>

      <ProfileForm
        submitLabel="Build my plan →"
        onSubmit={(p) => {
          saveProfile(p)
          navigate('/')
        }}
      />
    </div>
  )
}
