/**
 * native-boot.ts — ранний bootstrap нативных фич.
 *
 * Импортируется в самом верху main.tsx, ДО mount'а React. Задачи:
 *   1. Попросить splash подождать (нативный splash уйдёт сам через MobileAppShell.hideSplash()).
 *   2. Инициализировать status-bar style заранее — чтобы избежать мигания.
 *   3. Повесить глобальный global error/unhandledrejection no-op для Capacitor.
 *
 * Всё что касается back-button / keyboard / app-state живёт в MobileAppShell,
 * т.к. там у нас есть доступ к react-router.
 *
 * Все вызовы — fire-and-forget; ошибки глотаем.
 */

import { isNativePlatform, setStatusBarStyle, hideSplash } from './native'

function boot() {
  if (!isNativePlatform()) return

  // Тёмный контент на светлом фоне / светлый контент на тёмном — под брендинг.
  void setStatusBarStyle('light')

  // Подстраховочный hide splash через 2.5с — если MobileAppShell по какой-то
  // причине не смонтируется (redirect-loop и т.п.), пользователь не застрянет.
  setTimeout(() => {
    void hideSplash()
  }, 2500)
}

try {
  boot()
} catch {
  // Никогда не блокируем загрузку web-приложения из-за нативного bootstrap.
}
