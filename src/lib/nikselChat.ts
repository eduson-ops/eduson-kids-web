/**
 * nikselChat — клиент Kimi (Moonshot AI) для Никселя-помощника.
 *
 * Возвращает ответ по API, совместимому с OpenAI /v1/chat/completions.
 * Поддерживает вложенные картинки как base64 data URL.
 *
 * ВАЖНО: ключ берётся из VITE_KIMI_API_KEY, т.е. он ЭКСПОНИРУЕТСЯ
 * в клиентском бандле. Для продакшена нужен бэкенд-прокси — здесь
 * MVP-подход для раннего демо.
 */

const API_KEY = import.meta.env.VITE_KIMI_API_KEY as string | undefined
const BASE_URL = (import.meta.env.VITE_KIMI_BASE_URL as string | undefined) ?? 'https://api.moonshot.cn/v1'
const MODEL = (import.meta.env.VITE_KIMI_MODEL as string | undefined) ?? 'moonshot-v1-8k-vision-preview'

const SYSTEM_PROMPT = `Ты — пингвин Никсель, дружелюбный наставник в детской платформе программирования «Эдюсон Kids» (возраст 9–15 лет).

Твоя роль:
— Помогать, а НЕ решать за ребёнка. Никогда не выдавай готовый код решения.
— Задавай наводящие вопросы. Объясняй через простые аналогии (игры, LEGO, повседневная жизнь).
— Если ребёнок прислал скриншот — опиши что видишь и помоги понять проблему.
— Используй простой язык. Короткие предложения.
— Поддерживай и хвали за попытки. Не критикуй.
— Используй максимум 1–2 эмодзи за ответ (если уместно).
— Если вопрос про Python/Blockly — объясни концепт, но код пусть ребёнок напишет сам.
— Если ребёнок застрял — предложи разбить задачу на маленькие шаги.
— Отвечай по-русски, тепло, но не слащаво.

Платформа состоит из:
— Уроки (/learn) — 48 уроков, 8 модулей (блоки → Python)
— Студия (/studio) — 3D-конструктор миров с кодом
— Сайты (/sites) — HTML/CSS песочница
— Играть (/play) — каталог готовых миров
— Родительский (/parent) — отчёт о прогрессе

Если вопрос не связан с платформой или программированием — мягко верни к теме: «Я помогаю с уроками и кодом в Эдюсон Kids. О чём хочешь спросить по платформе?»

Длина ответа: 2–5 предложений. Только при запросе «объясни подробнее» — разверни до абзаца.`

export interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
  image?: string // base64 data URL
}

interface KimiResponse {
  choices?: Array<{ message?: { content?: string } }>
  error?: { message?: string }
}

/**
 * Отправить сообщение Никселю.
 * @param history — предыдущие сообщения диалога (для контекста)
 * @param userText — текущий текст пользователя
 * @param imageDataUrl — опциональная картинка (base64 data URL)
 */
export async function askNiksel(
  history: ChatMessage[],
  userText: string,
  imageDataUrl?: string
): Promise<string> {
  if (!API_KEY) {
    throw new Error('API-ключ не настроен. Добавь VITE_KIMI_API_KEY в .env.local.')
  }

  // Формируем messages массив для OpenAI-совместимого API
  const messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>
  }> = [{ role: 'system', content: SYSTEM_PROMPT }]

  // Добавляем историю (без картинок прошлых сообщений для экономии токенов)
  for (const m of history) {
    messages.push({ role: m.role, content: m.text })
  }

  // Последнее сообщение от пользователя: текст + опционально картинка
  if (imageDataUrl) {
    messages.push({
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: imageDataUrl } },
        { type: 'text', text: userText },
      ],
    })
  } else {
    messages.push({ role: 'user', content: userText })
  }

  const resp = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.6,
      max_tokens: 600,
    }),
  })

  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    throw new Error(`Kimi API ${resp.status}: ${text || resp.statusText}`)
  }

  const data = (await resp.json()) as KimiResponse
  if (data.error) {
    throw new Error(data.error.message ?? 'Kimi вернул ошибку')
  }
  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('Kimi вернул пустой ответ')
  }
  return content.trim()
}
