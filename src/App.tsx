import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useApp } from './context/AppContext'
import { CameraIcon, ChartIcon, DumbbellIcon, FlameIcon, HomeIcon, UserIcon } from './components/Icons'
import Dashboard from './pages/Dashboard'
import Onboarding from './pages/Onboarding'
import PlanPage from './pages/PlanPage'
import IdentifyPage from './pages/IdentifyPage'
import StreakPage from './pages/StreakPage'
import LibraryPage from './pages/LibraryPage'
import ProfilePage from './pages/ProfilePage'
import NutritionPage from './pages/NutritionPage'
import ToolsPage from './pages/ToolsPage'
import TrackerPage from './pages/TrackerPage'

const NAV = [
  { to: '/', label: 'Home', icon: HomeIcon, end: true },
  { to: '/plan', label: 'Plan', icon: DumbbellIcon, end: false },
  { to: '/track', label: 'Track', icon: ChartIcon, end: false },
  { to: '/identify', label: 'Identify', icon: CameraIcon, end: false },
  { to: '/streak', label: 'Streak', icon: FlameIcon, end: false },
]

function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0a1812]/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-2xl items-stretch justify-between px-2">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition ${
                isActive ? 'text-brand-300' : 'text-white/45 hover:text-white/80'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-[#07120d]/80 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <NavLink to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500/20 text-brand-300">
            <DumbbellIcon className="h-5 w-5" />
          </span>
          <span className="text-lg font-extrabold tracking-tight">
            Lift<span className="text-brand-400">IQ</span>
          </span>
        </NavLink>
        <NavLink
          to="/profile"
          className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-white/70 hover:text-white"
          aria-label="Profile"
        >
          <UserIcon className="h-5 w-5" />
        </NavLink>
      </div>
    </header>
  )
}

export default function App() {
  const { profile } = useApp()
  const location = useLocation()

  // First run -> force onboarding (except when already there).
  if (!profile && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  if (location.pathname === '/onboarding') {
    return (
      <div className="mx-auto min-h-full max-w-2xl px-4 py-6">
        <Onboarding />
      </div>
    )
  }

  return (
    <div className="min-h-full pb-24">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-5">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/identify" element={<IdentifyPage />} />
          <Route path="/streak" element={<StreakPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/track" element={<TrackerPage />} />
          <Route path="/nutrition" element={<NutritionPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}
