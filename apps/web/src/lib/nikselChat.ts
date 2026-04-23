/**
 * nikselChat — клиент Никселя-помощника.
 *
 * Стучится в наш backend-прокси (Yandex Cloud Function), НЕ в Moonshot напрямую.
 * Ключ живёт на сервере, клиент его не знает — даже если вытащить весь JS.
 *
 * URL прокси задаётся в VITE_NIKSEL_PROXY_URL (из .env.local).
 * System prompt и guardrails тоже на сервере — клиент только отправляет
 * пользовательский текст + опциональный скриншот.
 */

const PROXY_URL = import.meta.env.VITE_NIKSEL_PROXY_URL as string | undefined

export interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
  image?: string // base64 data URL — хранится локально для истории
}

interface ProxyResponse {
  reply?: string
  error?: string
  detail?: string
}

/**
 * Отправить сообщение Никселю через backend-прокси.
 *
 * @param history    — предыдущие сообщения (отправляются без картинок для экономии)
 * @param userText   — текущий текст пользователя
 * @param imageDataUrl — опциональная картинка (base64 data URL)
 */
export async function askNiksel(
  history: ChatMessage[],
  userText: string,
  imageDataUrl?: string
): Promise<string> {
  if (!PROXY_URL) {
    throw new Error(
      'Никсель-прокси не настроен. Добавь VITE_NIKSEL_PROXY_URL в .env.local. ' +
        'См. infra/yc-niksel-proxy/README.md'
    )
  }

  // Отдаём только текст истории, без картинок прошлых сообщений
  const compactHistory = history.map((m) => ({ role: m.role, text: m.text }))

  const resp = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      history: compactHistory,
      userText,
      imageDataUrl: imageDataUrl ?? null,
    }),
  })

  let data: ProxyResponse = {}
  const cloned = resp.clone()
  try {
    data = (await resp.json()) as ProxyResponse
  } catch {
    const text = await cloned.text().catch(() => '')
    throw new Error(`Прокси вернул не-JSON (${resp.status}): ${text.slice(0, 200)}`)
  }

  if (!resp.ok || data.error) {
    throw new Error(data.error ?? `Прокси ошибка ${resp.status}`)
  }
  if (!data.reply) {
    throw new Error('Прокси вернул пустой ответ')
  }
  return data.reply
}
