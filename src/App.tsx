import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Hub from './pages/Hub'
import Login from './pages/Login'
import AchievementToast from './components/AchievementToast'
import './App.css'

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

function RouteLoader({ label }: { label: string }) {
  return (
    <div className="play-loader">
      <div className="spinner" />
      <p>{label}</p>
    </div>
  )
}

// Vite прокидывает сюда '/eduson-kids-web/' в проде и '/' локально.
const ROUTER_BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '')

export default function App() {
  return (
    <BrowserRouter basename={ROUTER_BASENAME}>
      <AchievementToast />
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
    </BrowserRouter>
  )
}
