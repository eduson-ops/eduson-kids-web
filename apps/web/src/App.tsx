import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import './App.css'

// Lazy-load heavy routes so the lobby doesn't pull Three.js / Blockly on first paint.
const Play = lazy(() => import('./pages/Play'))
const Studio = lazy(() => import('./pages/Studio'))
const Profile = lazy(() => import('./pages/Profile'))

function RouteLoader({ label }: { label: string }) {
  return (
    <div className="play-loader">
      <div className="spinner" />
      <p>{label}</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/profile"
          element={
            <Suspense fallback={<RouteLoader label="Открываю профиль…" />}>
              <Profile />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
