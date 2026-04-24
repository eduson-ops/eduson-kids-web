import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Hub from './pages/Hub'
import Login from './pages/Login'
import AchievementToast from './components/AchievementToast'
import MobileAppShell from './components/MobileAppShell'
import ErrorBoundary from './components/ErrorBoundary'
import { ensureAchievementsWatcher } from './lib/achievements'
import { startStreakReminderWatcher } from './lib/streakReminder'
import { seedDemoStateIfEmpty } from './lib/demoSeed'
import { apiGetMe } from './lib/api'
import { saveSession, loadSession } from './lib/auth'
import { useTenantBranding } from './hooks/useTenantBranding'
import './App.css'
import './styles/mobile.css'
import './styles/pages-mobile.css'

// Lazy-load heavy routes so the hub doesn't pull Three.js / Blockly on first paint.
const Play = lazy(() => import('./pages/Play'))
const Home = lazy(() => import('./pages/Home')) // old game lobby → /play
const Studio = lazy(() => import('./pages/Studio'))
const Profile = lazy(() => import('./pages/Profile'))
const Learn = lazy(() => import('./pages/Learn'))
const LessonPresentation = lazy(() => import('./pages/LessonPresentation'))
const SitesHub = lazy(() => import('./pages/SitesHub'))
const SiteEditor = lazy(() => import('./pages/SiteEditor'))
const Parent = lazy(() => import('./pages/Parent'))
const StudentPortfolio = lazy(() => import('./pages/StudentPortfolio'))
const SharedSite = lazy(() => import('./pages/SharedSite'))
const VkCallback = lazy(() => import('./pages/VkCallback'))
const Designbook = lazy(() => import('./pages/Designbook'))
const Billing = lazy(() => import('./pages/Billing'))
const Settings = lazy(() => import('./pages/Settings'))
const Legal = lazy(() => import('./pages/Legal'))
const Teacher = lazy(() => import('./pages/Teacher'))
const Leagues = lazy(() => import('./pages/Leagues'))
const AuthSSO = lazy(() => import('./pages/AuthSSO'))
const Enterprise = lazy(() => import('./pages/Enterprise'))
const Certificate = lazy(() => import('./pages/Certificate'))
const AdaptiveQuiz = lazy(() => import('./pages/AdaptiveQuiz'))
const TrainersHub = lazy(() => import('./pages/TrainersHub'))
const Trainer = lazy(() => import('./pages/Trainer'))
const PythonIDE = lazy(() => import('./pages/PythonIDE'))
const TeacherClasses = lazy(() => import('./pages/TeacherClasses'))
const Chat = lazy(() => import('./pages/Chat'))
const Room = lazy(() => import('./pages/Room'))
const AdminPanel = lazy(() => import('./pages/Admin'))

function RouteLoader({ label }: { label: string }) {
  return (
    <div className="play-loader">
      <div className="spinner" />
      <p>{label}</p>
    </div>
  )
}

// Vite прокидывает сюда '/eduson-kids-web/' в GH Pages, '/' локально, './' в Capacitor.
// BrowserRouter не понимает './' или '.' — для нативного target и dev корень пустой.
const RAW_BASE = import.meta.env.BASE_URL
const ROUTER_BASENAME =
  RAW_BASE === '/' || RAW_BASE === './' || RAW_BASE === '.'
    ? ''
    : RAW_BASE.replace(/\/$/, '')

export default function App() {
  // Apply tenant branding CSS vars on mount; silent no-op if backend offline.
  const tenant = useTenantBranding()

  useEffect(() => {
    if (tenant?.name && typeof document !== 'undefined') {
      document.title = tenant.name
    }
  }, [tenant?.name])

  useEffect(() => {
    // Demo-mode seed — pre-fills progress so empty session looks lived-in
    // for sales calls / screenshots. Gated by VITE_DEMO_SEED build flag.
    if (import.meta.env.VITE_DEMO_SEED === 'true') {
      seedDemoStateIfEmpty()
    }
    ensureAchievementsWatcher()
    // Hydrate session from backend if we have a token but no session
    apiGetMe().then((me) => {
      if (!me) return
      const existing = loadSession()
      if (!existing || existing.name !== me.name) {
        saveSession({
          role: me.role as 'child' | 'parent' | 'teacher',
          name: me.name,
          login: me.login,
          email: me.email,
        })
      }
    }).catch(() => { /* backend offline — stay local */ })
    return startStreakReminderWatcher()
  }, [])
  return (
    <BrowserRouter basename={ROUTER_BASENAME}>
      <AchievementToast />
      <MobileAppShell>
      <ErrorBoundary>
      <Routes>
        {/* New brand front door */}
        <Route path="/" element={<Hub />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/learn"
          element={
            <Suspense fallback={<RouteLoader label="Открываю уроки…" />}>
              <Learn />
            </Suspense>
          }
        />
        <Route
          path="/learn/module/:moduleN"
          element={
            <Suspense fallback={<RouteLoader label="Открываю модуль…" />}>
              <Learn />
            </Suspense>
          }
        />
        <Route
          path="/learn/lesson/:lessonN"
          element={
            <Suspense fallback={<RouteLoader label="Открываю урок…" />}>
              <Learn />
            </Suspense>
          }
        />
        <Route
          path="/learn/lesson/:lessonN/present"
          element={
            <Suspense fallback={<RouteLoader label="Загружаю презентацию…" />}>
              <LessonPresentation />
            </Suspense>
          }
        />
        {/* Multi-course routes (LXP) */}
        <Route
          path="/learn/course/:courseSlug"
          element={
            <Suspense fallback={<RouteLoader label="Открываю курс…" />}>
              <Learn />
            </Suspense>
          }
        />
        <Route
          path="/learn/course/:courseSlug/module/:moduleN"
          element={
            <Suspense fallback={<RouteLoader label="Открываю модуль…" />}>
              <Learn />
            </Suspense>
          }
        />
        <Route
          path="/learn/course/:courseSlug/lesson/:lessonN"
          element={
            <Suspense fallback={<RouteLoader label="Открываю урок…" />}>
              <Learn />
            </Suspense>
          }
        />

        {/* Backward-compat: старый /learn/:id (Эдюсон Kids only) */}
        <Route
          path="/learn/:moduleOrLesson"
          element={
            <Suspense fallback={<RouteLoader label="Открываю…" />}>
              <Learn />
            </Suspense>
          }
        />

        {/* VK OAuth callback */}
        <Route
          path="/auth/vk/callback"
          element={
            <Suspense fallback={<RouteLoader label="Входим через VK…" />}>
              <VkCallback />
            </Suspense>
          }
        />

        <Route
          path="/play"
          element={
            <Suspense fallback={<RouteLoader label="Открываем лобби…" />}>
              <Home />
            </Suspense>
          }
        />
        <Route
          path="/play/:gameId"
          element={
            <Suspense fallback={<RouteLoader label="Загружаем 3D-движок…" />}>
              <Play />
            </Suspense>
          }
        />

        <Route
          path="/studio"
          element={
            <Suspense fallback={<RouteLoader label="Открываем студию…" />}>
              <Studio />
            </Suspense>
          }
        />
        <Route
          path="/studio/:projectId"
          element={
            <Suspense fallback={<RouteLoader label="Открываем студию…" />}>
              <Studio />
            </Suspense>
          }
        />

        <Route
          path="/share"
          element={
            <Suspense fallback={<RouteLoader label="Открываю сайт…" />}>
              <SharedSite />
            </Suspense>
          }
        />

        <Route
          path="/sites"
          element={
            <Suspense fallback={<RouteLoader label="Открываю сайты…" />}>
              <SitesHub />
            </Suspense>
          }
        />
        <Route
          path="/sites/:siteId"
          element={
            <Suspense fallback={<RouteLoader label="Открываю редактор сайта…" />}>
              <SiteEditor />
            </Suspense>
          }
        />

        <Route
          path="/parent"
          element={
            <Suspense fallback={<RouteLoader label="Открываю кабинет родителя…" />}>
              <Parent />
            </Suspense>
          }
        />
        <Route
          path="/me"
          element={
            <Suspense fallback={<RouteLoader label="Открываю портфолио…" />}>
              <StudentPortfolio />
            </Suspense>
          }
        />
        <Route
          path="/designbook"
          element={
            <Suspense fallback={<RouteLoader label="Открываю дизайнбук…" />}>
              <Designbook />
            </Suspense>
          }
        />
        <Route
          path="/billing"
          element={
            <Suspense fallback={<RouteLoader label="Открываю оплату…" />}>
              <Billing />
            </Suspense>
          }
        />
        <Route
          path="/settings"
          element={
            <Suspense fallback={<RouteLoader label="Открываю настройки…" />}>
              <Settings />
            </Suspense>
          }
        />
        <Route
          path="/legal"
          element={
            <Suspense fallback={<RouteLoader label="Открываю документ…" />}>
              <Legal />
            </Suspense>
          }
        />
        <Route
          path="/legal/:doc"
          element={
            <Suspense fallback={<RouteLoader label="Открываю документ…" />}>
              <Legal />
            </Suspense>
          }
        />
        <Route
          path="/teacher"
          element={
            <Suspense fallback={<RouteLoader label="Открываю кабинет учителя…" />}>
              <Teacher />
            </Suspense>
          }
        />
        <Route
          path="/leagues"
          element={
            <Suspense fallback={<RouteLoader label="Открываю лиги…" />}>
              <Leagues />
            </Suspense>
          }
        />
        <Route
          path="/auth/sso"
          element={
            <Suspense fallback={<RouteLoader label="Открываю SSO…" />}>
              <AuthSSO />
            </Suspense>
          }
        />
        <Route
          path="/enterprise"
          element={
            <Suspense fallback={<RouteLoader label="Открываю для школ…" />}>
              <Enterprise />
            </Suspense>
          }
        />
        <Route
          path="/cert/:id"
          element={
            <Suspense fallback={<RouteLoader label="Загружаю сертификат…" />}>
              <Certificate />
            </Suspense>
          }
        />
        <Route
          path="/quiz"
          element={
            <Suspense fallback={<RouteLoader label="Открываю квиз…" />}>
              <AdaptiveQuiz />
            </Suspense>
          }
        />

        <Route path="/teacher/classes" element={<Suspense fallback={<RouteLoader label="Открываю классы…" />}><TeacherClasses /></Suspense>} />
        <Route path="/trainers" element={<Suspense fallback={<RouteLoader label="Открываю тренажёры…" />}><TrainersHub /></Suspense>} />
        <Route path="/trainers/:trainerId/:puzzleN" element={<Suspense fallback={<RouteLoader label="Открываю задачу…" />}><Trainer /></Suspense>} />
        <Route path="/python-ide" element={<Suspense fallback={<RouteLoader label="Открываю Python IDE…" />}><PythonIDE /></Suspense>} />
        <Route path="/chat" element={<Suspense fallback={<RouteLoader label="Открываю чат…" />}><Chat /></Suspense>} />
        <Route path="/room/:roomId" element={<Suspense fallback={<RouteLoader label="Подключаюсь к занятию…" />}><Room /></Suspense>} />
        <Route path="/admin" element={<Suspense fallback={<RouteLoader label="Открываю администрирование…" />}><AdminPanel /></Suspense>} />

        {/* /character — исторический псевдоним. Настоящий 3D-редактор героя живёт в /profile. */}
        <Route path="/character" element={<Navigate to="/profile" replace />} />

        <Route
          path="/profile"
          element={
            <Suspense fallback={<RouteLoader label="Открываю профиль…" />}>
              <Profile />
            </Suspense>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </ErrorBoundary>
      </MobileAppShell>
    </BrowserRouter>
  )
}
