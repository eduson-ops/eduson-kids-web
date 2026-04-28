import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import PlatformShell from '../components/PlatformShell'
import Niksel from '../design/mascot/Niksel'
import { useProgress } from '../hooks/useProgress'

/**
 * /leagues — Duolingo-style лиги по недельному XP.
 *
 * 5 лиг: Бронза / Серебро / Золото / Рубин / Алмаз
 * Каждую неделю 30 случайных игроков соревнуются за XP.
 * Воскресенье 23:59 MSK: топ-7 повышаются, низ-7 понижаются.
 *
 * MVP сейчас: генерируется mock-список, собственная позиция
 * рассчитывается из useProgress().completedLessons * 30 + streak * 10.
 *
 * Для B2G (школы): опция командной лиги — классы против классов (планируется).
 * Этика: дети <10 лет могут отключить участие в /settings.
 */

type LeagueKey = 'bronze' | 'silver' | 'gold' | 'ruby' | 'diamond'

interface LeagueInfo {
  key: LeagueKey
  name: string
  gradient: string
  color: string
  minXp: number
}

const LEAGUES: LeagueInfo[] = [
  { key: 'bronze',  name: 'Бронза',  gradient: 'linear-gradient(135deg, #CD7F32, #8B5A2B)', color: '#CD7F32', minXp: 0 },
  { key: 'silver',  name: 'Серебро', gradient: 'linear-gradient(135deg, #C0C0C0, #808080)', color: '#C0C0C0', minXp: 200 },
  { key: 'gold',    name: 'Золото',  gradient: 'linear-gradient(135deg, #FFD43C, #D4A017)', color: '#FFD43C', minXp: 500 },
  { key: 'ruby',    name: 'Рубин',   gradient: 'linear-gradient(135deg, #E8517B, #A1264D)', color: '#E8517B', minXp: 1000 },
  { key: 'diamond', name: 'Алмаз',   gradient: 'linear-gradient(135deg, #A9D8FF, #3E87E8)', color: '#A9D8FF', minXp: 2000 },
]

function leagueForXp(xp: number): LeagueInfo {
  return ([...LEAGUES].reverse().find((l) => xp >= l.minXp) ?? LEAGUES[0])!
}

// ─── Mock leaderboard ─────────────────────────────

const PSEUDONYMS = [
  'ОгнеЛис', 'КрутойДракон', 'КодоМалыш', 'ПитонМастер', 'БлокГерой',
  'ЦиклоКороль', 'СкриптМудрец', 'ЛогикГуру', 'БитИсследователь', 'СтройКуб',
  'ДатаНиндзя', 'СинтаксЗвезда', 'БагОхотник', 'АлгоЧемпион', 'СтекМаг',
  'БайтРыцарь', 'ФункЧародей', 'МассивГик', 'КешВолк', 'ЛямбдаЛев',
  'ГитСтраж', 'СтильМастер', 'ВёрсткиХакер', 'ДжсонДжедай', 'РегексРейнджер',
  'ШеллАкула', 'ТерминалТитан', 'ВимВикинг', 'ЗипЗефир', 'МетаМаг',
]

function genMockEntry(seed: number, leagueMinXp: number, leagueMaxXp: number) {
  const rng = (s: number) => {
    let x = s
    x = (x * 1103515245 + 12345) & 0x7fffffff
    return x / 0x7fffffff
  }
  const xp = Math.floor(leagueMinXp + rng(seed * 13) * (leagueMaxXp - leagueMinXp))
  const avatarColors = ['#6B5CE7', '#FFD43C', '#FF5464', '#48C774', '#4C97FF', '#C879FF', '#FF8C1A', '#FF5AB1']
  return {
    id: `mock-${seed}`,
    name: PSEUDONYMS[seed % PSEUDONYMS.length]!,
    xp,
    avatarColor: avatarColors[seed % avatarColors.length]!,
  }
}

export default function Leagues() {
  const p = useProgress()
  // Мой XP: урок = 30 XP, стрик-день = 10 XP
  const myXp = p.completedLessons * 30 + p.streak * 10
  const myLeague = leagueForXp(myXp)
  const [viewLeagueKey, setViewLeagueKey] = useState<LeagueKey>(myLeague.key)
  const viewLeague = LEAGUES.find((l) => l.key === viewLeagueKey) ?? myLeague

  // Генерим 29 моков + вставляем «меня» по реальному XP
  const board = useMemo(() => {
    const leagueMin = viewLeague.minXp
    const nextLeague = LEAGUES[LEAGUES.indexOf(viewLeague) + 1]
    const leagueMax = nextLeague ? nextLeague.minXp : leagueMin + 1000
    const mocks = Array.from({ length: 29 }, (_, i) => genMockEntry(i + LEAGUES.indexOf(viewLeague) * 100 + 1, leagueMin, leagueMax))
    const isMyLeague = viewLeagueKey === myLeague.key
    const entries = isMyLeague
      ? [...mocks, { id: 'me', name: 'Ты', xp: myXp, avatarColor: '#6B5CE7', isMe: true }]
      : mocks.map((m) => ({ ...m, isMe: false }))
    entries.sort((a, b) => b.xp - a.xp)
    return entries
  }, [viewLeagueKey, myXp, myLeague.key, viewLeague])

  const myIndex = board.findIndex((e) => 'isMe' in e && e.isMe)

  return (
    <PlatformShell>
      <section
        className="kb-cover"
        style={{
          background: viewLeague.gradient,
          color: '#fff',
        }}
      >
        <div className="kb-cover-meta">
          <span className="eyebrow" style={{ color: '#FFD43C', fontWeight: 700 }}>ЛИГА НЕДЕЛИ</span>
          <span className="kb-cover-meta-row" style={{ color: 'rgba(255,255,255,.9)' }}>
            <span>30 игроков</span>
            <span className="dot" />
            <span>До воскресенья</span>
          </span>
        </div>
        <h1 className="kb-cover-title kb-cover-title--md" style={{ color: '#fff' }}>
          {viewLeague.name}<span style={{ color: '#FFD43C' }}>.</span>
        </h1>
        <p className="kb-cover-sub" style={{ color: '#fff', opacity: 0.92 }}>
          Топ-7 повысятся, низ-7 опустятся. Зарабатывай XP за уроки (+30), квизы (+10), стрик (+10/день).
          {myIndex >= 0 && ` Ты на ${myIndex + 1}-м месте.`}
        </p>
        <div className="kb-cover-mascot kb-cover-mascot--lower" aria-hidden>
          <Niksel pose={myIndex >= 0 && myIndex < 7 ? 'celebrate' : 'wave'} size={220} />
        </div>
      </section>

      {/* League switcher */}
      <section style={{ marginBottom: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {LEAGUES.map((l) => {
          const isMy = l.key === myLeague.key
          const isView = l.key === viewLeagueKey
          return (
            <button
              key={l.key}
              onClick={() => setViewLeagueKey(l.key)}
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                border: isView ? `2.5px solid ${l.color}` : '2px solid rgba(21,20,27,.1)',
                background: isView ? `${l.color}22` : 'var(--paper)',
                cursor: 'pointer',
                fontFamily: 'var(--f-display)',
                fontWeight: 800,
                fontSize: 13,
                color: 'var(--ink)',
                position: 'relative',
              }}
            >
              {l.name}
              {isMy && (
                <span
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -4,
                    background: 'var(--violet)',
                    color: '#fff',
                    fontSize: 9,
                    padding: '1px 6px',
                    borderRadius: 8,
                    fontWeight: 900,
                    letterSpacing: '0.5px',
                  }}
                >
                  ТЫ
                </span>
              )}
            </button>
          )
        })}
      </section>

      {/* Leaderboard */}
      <section style={{ marginBottom: 40 }}>
        <div className="kb-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', background: viewLeague.gradient, color: '#fff', fontFamily: 'var(--f-display)', fontWeight: 900, fontSize: 15 }}>
            🏆 {viewLeague.name} · Топ-30 этой недели
          </div>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {board.map((e, i) => {
              const isMe = 'isMe' in e && e.isMe
              const isPromo = i < 7
              const isDemo = i >= 23
              return (
                <li
                  key={e.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '10px 20px',
                    background: isMe ? 'rgba(107,92,231,.08)' : 'transparent',
                    borderBottom: '1px solid rgba(21,20,27,.04)',
                    borderLeft: isMe ? '4px solid var(--violet)' : '4px solid transparent',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      textAlign: 'center',
                      fontFamily: 'var(--f-display)',
                      fontWeight: 900,
                      fontSize: 16,
                      color: isPromo ? 'var(--mint-deep, #3DB07A)' : isDemo ? '#c33' : 'var(--ink-soft)',
                    }}
                  >
                    {i + 1}
                    {isPromo && i === 0 && <span style={{ fontSize: 12, marginLeft: 2 }}>🥇</span>}
                    {isPromo && i === 1 && <span style={{ fontSize: 12, marginLeft: 2 }}>🥈</span>}
                    {isPromo && i === 2 && <span style={{ fontSize: 12, marginLeft: 2 }}>🥉</span>}
                  </div>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: e.avatarColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 900,
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                    aria-hidden
                  >
                    {e.name[0]!}
                  </div>
                  <span style={{ flex: 1, fontWeight: isMe ? 800 : 600, fontSize: 14 }}>
                    {e.name}
                    {isMe && <span style={{ marginLeft: 8, color: 'var(--violet)', fontSize: 11, fontWeight: 900, letterSpacing: '0.5px' }}>· ЭТО ТЫ</span>}
                  </span>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13, fontWeight: 700, color: isMe ? 'var(--violet)' : 'var(--ink)' }}>
                    {e.xp} XP
                  </span>
                </li>
              )
            })}
          </ol>
          <div style={{ padding: '10px 20px', fontSize: 11, color: 'var(--ink-soft)', background: 'var(--paper-2)', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <span>🟢 Топ-7 → повышение</span>
            <span>🔴 Низ-7 → понижение</span>
            <span>Остальные — остаются в {viewLeague.name}</span>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 40 }}>
        <div className="kb-card" style={{ padding: 18, fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.55 }}>
          <strong>Этика:</strong> в текущем MVP показываются псевдонимы (без настоящих имён/фамилий). Для школ в B2G-контуре планируется вариант «Ученик #23 из 5А» по ФЗ-152.
          Участие в лигах можно выключить в <Link to="/settings">/settings</Link> (для детей младше 10 лет — по умолчанию off).
        </div>
      </section>
    </PlatformShell>
  )
}
