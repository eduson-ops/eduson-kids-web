import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PlatformShell from '../components/PlatformShell'
import { api } from '../api/client'
import { saveSession } from '../lib/auth'
import { setAccessToken } from '../lib/authStorage'

type Status = 'loading' | 'error' | 'success'

export default function GuestJoin() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [status, setStatus] = useState<Status>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!token) { setStatus('error'); setErrorMsg('Код не найден'); return }

    api.post<{ accessToken: string; type: string }>('/guest/redeem', { token })
      .then(({ accessToken, type }) => {
        setAccessToken(accessToken)
        saveSession({ role: 'guest', name: 'Гость' })
        setStatus('success')
        // Redirect after short delay so user sees success state
        setTimeout(() => {
          if (type === 'masterclass') {
            navigate('/learn')
          } else {
            navigate('/guest')
          }
        }, 1200)
      })
      .catch((e: Error & { status?: number }) => {
        setStatus('error')
        if (e.status === 401) {
          setErrorMsg('Код истёк или уже использован. Попросите наставника выдать новый.')
        } else if (e.status === 404) {
          setErrorMsg('Код не найден. Проверьте правильность ввода.')
        } else {
          setErrorMsg(e.message || 'Произошла ошибка. Попробуйте ещё раз.')
        }
      })
  }, [token, navigate])

  return (
    <PlatformShell>
      <div style={{ maxWidth: 480, margin: '80px auto 40px', padding: '0 20px' }}>
        {status === 'loading' && (
          <div className="kb-card" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <h2 style={{ fontFamily: 'var(--f-display)', fontWeight: 900, fontSize: 22, marginBottom: 8, color: 'var(--ink)' }}>
              Проверяю код…
            </h2>
            <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>Один момент</p>
          </div>
        )}

        {status === 'success' && (
          <div className="kb-card" style={{ padding: 40, textAlign: 'center', background: 'var(--mint-soft)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontFamily: 'var(--f-display)', fontWeight: 900, fontSize: 22, marginBottom: 8, color: 'var(--mint-ink)' }}>
              Добро пожаловать!
            </h2>
            <p style={{ color: 'var(--mint-ink)', opacity: 0.8, fontSize: 14 }}>
              Переходим на платформу…
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="kb-card" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
            <h2 style={{ fontFamily: 'var(--f-display)', fontWeight: 900, fontSize: 22, marginBottom: 12, color: 'var(--ink)' }}>
              Не получилось войти
            </h2>
            <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              {errorMsg}
            </p>
            <button
              className="kb-btn kb-btn--secondary"
              onClick={() => navigate('/guest')}
            >
              ← Вернуться на главную
            </button>
          </div>
        )}
      </div>
    </PlatformShell>
  )
}
