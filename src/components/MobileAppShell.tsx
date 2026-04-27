import { useEffect, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import MobileTabBar from './MobileTabBar'
import AudioUnlockHint from './AudioUnlockHint'
import { useIsMobile } from '../hooks/useIsMobile'
import {
  subscribeBackButton,
  subscribeKeyboard,
  subscribeAppState,
  hideSplash,
  setStatusBarStyle,
  exitApp,
  isNativePlatform,
} from '../lib/native'

/**
 * Маршруты, где таб-бар нужно скрыть (fullscreen-режимы).
 * Проверка делается по pathname, поэтому тестим prefix/regex, а не params.
 */
function shouldHideTabBar(pathname: string): boolean {
  // /play/:gameId — fullscreen 3D-игра
  if (/^\/play\/[^/]+$/.test(pathname)) return true
  // /room/:roomId — fullscreen видеозвонок
  if (/^\/room\/[^/]+$/.test(pathname)) return true
  // /studio/:projectId — у Studio собственная мобильная панель
  if (/^\/studio\/[^/]+$/.test(pathname)) return true
  // /learn/lesson/:n/present — презентационный режим
  if (/^\/learn\/lesson\/[^/]+\/present$/.test(pathname)) return true
  return false
}

interface MobileAppShellProps {
  children: ReactNode
}

/**
 * MobileAppShell — корневая обёртка, монтирующая нативные подписки и таб-бар.
 * Рендерится всегда (и на десктопе), но таб-бар показывает только на мобилке.
 */
export default function MobileAppShell({ children }: MobileAppShellProps) {
  const loc = useLocation()
  const nav = useNavigate()
  const isMobile = useIsMobile()

  // --- Boot-effects (один раз) -----------------------------------------------
  useEffect(() => {
    void hideSplash()
    void setStatusBarStyle('light')
  }, [])

  // --- Back-button (Android hardware / Capacitor) ----------------------------
  useEffect(() => {
    const unsub = subscribeBackButton((ev) => {
      // На корне приложения — закрываем; иначе — шаг назад.
      const atRoot = window.location.pathname === '/' || window.location.pathname === ''
      if (ev.canGoBack && !atRoot) {
        nav(-1)
        return
      }
      if (atRoot) {
        void exitApp()
        return
      }
      nav('/')
    })
    return unsub
  }, [nav])

  // --- Keyboard → CSS variable --kb-height -----------------------------------
  useEffect(() => {
    const root = document.documentElement
    const setKb = (h: number) => root.style.setProperty('--kb-height', `${h}px`)
    setKb(0)
    const unsub = subscribeKeyboard(
      (h) => setKb(h),
      () => setKb(0),
    )
    return () => {
      unsub()
      root.style.removeProperty('--kb-height')
    }
  }, [])

  // --- App state: фоновый режим → кастомное событие для Socket.io потребителей
  useEffect(() => {
    const unsub = subscribeAppState((isActive) => {
      const name = isActive ? 'app:foreground' : 'app:background'
      try {
        window.dispatchEvent(new CustomEvent(name))
      } catch {
        // ignore
      }
    })
    return unsub
  }, [])

  const showTabBar = isMobile && !shouldHideTabBar(loc.pathname)

  // Добавляем bottom-padding, чтобы контент не уезжал под таб-бар.
  // Делаем через inline-style на обёртке, а не на body — не трогаем глобальный CSS.
  const wrapperStyle: React.CSSProperties = showTabBar
    ? {
        // 56px высота таб-бара + safe-area-inset-bottom
        paddingBottom: 'calc(56px + env(safe-area-inset-bottom))',
        minHeight: '100%',
      }
    : {}

  return (
    <>
      <div style={wrapperStyle} data-native={isNativePlatform() ? 'true' : 'false'}>
        {children}
      </div>
      {showTabBar && <MobileTabBar />}
      {isMobile && <AudioUnlockHint />}
    </>
  )
}
