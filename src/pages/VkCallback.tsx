import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { exchangeVkCode, verifyState } from '../lib/vkAuth'

const VK_SUCCESS_FLASH_MS = 600 // show "Готово" briefly before redirect

/**
 * VkCallback — обработчик redirect'а с id.vk.com.
 * URL: /auth/vk/callback?code=...&state=...&device_id=...
 *
 * Шаги:
 *   1) Проверить state (CSRF)
 *   2) Обменять code на access_token через exchangeVkCode()
 *   3) Сохранить в localStorage
 *   4) Redirect на профиль (или на параметр `next` из sessionStorage)
 */
export default function VkCallback() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'exchanging' | 'error' | 'done'>('exchanging')
  const [errorMsg, setErrorMsg] = useState<string>('')

  useEffect(() => {
    const code = params.get('code')
    const state = params.get('state') ?? ''
    const deviceId = params.get('device_id') ?? undefined
    const vkError = params.get('error')

    if (vkError) {
      setStatus('error')
      setErrorMsg(params.get('error_description') || `VK error: ${vkError}`)
      return
    }
    if (!code) {
      setStatus('error')
      setErrorMsg('Нет code в callback')
      return
    }
    if (!verifyState(state)) {
      setStatus('error')
      setErrorMsg('State не совпадает — возможна CSRF-атака. Попробуй войти заново.')
      return
    }

    exchangeVkCode(code, deviceId)
      .then((user) => {
        setStatus('done')
        const next = sessionStorage.getItem('ek_vk_next') || '/profile'
        sessionStorage.removeItem('ek_vk_next')
        setTimeout(() => navigate(next, { replace: true }), VK_SUCCESS_FLASH_MS)
         
        void user
      })
      .catch((e: Error) => {
        setStatus('error')
        setErrorMsg(e.message)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className="vk-callback">
      <div className="vk-callback-card">
        {status === 'exchanging' && (
          <>
            <div className="vk-callback-spinner" aria-hidden />
            <h2>Входим через VK…</h2>
            <p>Секунду, проверяем твой вход.</p>
          </>
        )}
        {status === 'done' && (
          <>
            <div className="vk-callback-check">✓</div>
            <h2>Готово</h2>
            <p>Открываю профиль…</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="vk-callback-error">✕</div>
            <h2>Не получилось войти</h2>
            <p>{errorMsg}</p>
            <button
              className="kb-btn"
              onClick={() => navigate('/login', { replace: true })}
            >
              Попробовать снова
            </button>
          </>
        )}
      </div>
    </main>
  )
}
