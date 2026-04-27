import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { GAMES, type GameMeta } from '../lib/games'
import PlatformShell from '../components/PlatformShell'
import { CHILD_NAME_KEY } from '../lib/auth'

type TopTab = 'featured' | 'templates'
type BottomTab = 'best' | 'fresh' | 'hot' | 'online'

export default function Home() {
  const navigate = useNavigate()
  const [childName, setChildName] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [topTab, setTopTab] = useState<TopTab>('featured')
  const [bottomTab, setBottomTab] = useState<BottomTab>('best')

  useEffect(() => {
    setChildName(localStorage.getItem(CHILD_NAME_KEY))
  }, [])

  const filteredByQuery = useMemo(() => {
    if (!query) return GAMES
    const q = query.toLowerCase()
    return GAMES.filter((g) => g.title.toLowerCase().includes(q) || g.author.toLowerCase().includes(q))
  }, [query])

  const topRow = useMemo(() => {
    if (topTab === 'templates') return filteredByQuery.filter((g) => g.template)
    return filteredByQuery.filter((g) => g.featured).sort((a, b) => a.rank - b.rank)
  }, [filteredByQuery, topTab])

  const bottomRow = useMemo(() => {
    switch (bottomTab) {
      case 'fresh':
        return filteredByQuery.filter((g) => g.fresh)
      case 'hot':
        return filteredByQuery.filter((g) => g.hot)
      case 'online':
        return filteredByQuery.filter((g) => g.playersOnline > 0).sort((a, b) => b.playersOnline - a.playersOnline)
      case 'best':
      default:
        return filteredByQuery.slice().sort((a, b) => b.likes - a.likes)
    }
  }, [filteredByQuery, bottomTab])

  const onlineCount = GAMES.reduce((s, g) => s + g.playersOnline, 0)

  const playRandom = () => {
    const pool = topRow.length ? topRow : bottomRow
    const pick = pool[Math.floor(Math.random() * pool.length)]
    if (pick) navigate(`/play/${pick.id}`)
  }

  return (
    <PlatformShell activeKey="play">
      {/* Hero row: search + random play */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, marginBottom: 32, alignItems: 'center' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'var(--paper)',
          border: '1.5px solid rgba(21,20,27,.08)',
          borderRadius: 999,
          padding: '10px 20px',
          boxShadow: 'var(--sh-1)',
        }}>
          <span aria-hidden>🔎</span>
          <input
            placeholder="Найти мир…"
            aria-label="Поиск миров"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontFamily: 'var(--f-ui)',
              fontSize: 15,
              fontWeight: 500,
              color: 'var(--ink)',
            }}
          />
        </div>
        <button className="kb-btn kb-btn--secondary" onClick={playRandom} title="Открыть случайный мир">
          🎲 Случайный мир
        </button>
      </section>

      {/* Header row */}
      <header style={{ marginBottom: 24 }}>
        <span className="eyebrow">Каталог миров</span>
        <h1 className="h1" style={{ marginTop: 8, fontSize: 40 }}>
          {childName ? `Привет, ${childName}!` : 'Выбирай свой мир'}
        </h1>
        <p style={{ fontSize: 16, color: 'var(--ink-soft)', marginTop: 8, maxWidth: 600 }}>
          {childName
            ? 'Играй и учись. Каждый мир проверяет навыки из уроков.'
            : 'Каждый мир построен нашими учениками. Поиграй — и создай свой.'}
        </p>
      </header>

      <section style={{ marginBottom: 40 }}>
        <BrandChips<TopTab>
          options={[['featured', 'Рекомендуем'], ['templates', 'Шаблоны']]}
          value={topTab}
          onChange={setTopTab}
        />
        <GameGrid games={topRow} />
      </section>

      <section>
        <BrandChips<BottomTab>
          options={[
            ['best', 'Лучшее'],
            ['fresh', 'Новое'],
            ['hot', 'Горячее'],
            ['online', `Онлайн · ${onlineCount}`],
          ]}
          value={bottomTab}
          onChange={setBottomTab}
        />
        <GameGrid games={bottomRow} withCreateFirst />
      </section>
    </PlatformShell>
  )
}

function BrandChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: [T, string][]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
      {options.map(([k, label]) => (
        <button
          key={k}
          className={`kb-chip ${value === k ? 'kb-chip--active' : ''}`}
          onClick={() => onChange(k)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function GameGrid({ games, withCreateFirst }: { games: GameMeta[]; withCreateFirst?: boolean }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
      gap: 16,
    }}>
      {withCreateFirst && (
        <Link
          to="/studio"
          className="kb-card"
          style={{
            textDecoration: 'none',
            background: 'var(--violet-soft)',
            borderColor: 'var(--violet)',
            borderStyle: 'dashed',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 240,
            transition: 'transform .15s var(--ease)',
          }}
        >
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            background: 'var(--violet)',
            color: 'var(--paper)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            fontFamily: 'var(--f-display)',
            fontWeight: 900,
            boxShadow: '0 4px 0 var(--violet-deep)',
          }}>+</div>
          <div style={{ textAlign: 'center' }}>
            <div className="h3" style={{ fontSize: 16, color: 'var(--violet-ink)' }}>Создай свой мир</div>
            <div style={{ fontSize: 13, color: 'var(--violet-ink)', opacity: 0.7, marginTop: 4 }}>
              Студия Эдюсон Kids
            </div>
          </div>
        </Link>
      )}
      {games.map((g) => <GameCard key={g.id} game={g} />)}
    </div>
  )
}

function GameCard({ game }: { game: GameMeta }) {
  return (
    <Link
      to={`/play/${game.id}`}
      className="kb-card"
      style={{
        textDecoration: 'none',
        padding: 0,
        overflow: 'hidden',
        transition: 'transform .15s var(--ease), box-shadow .15s var(--ease)',
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${game.color}, ${darken(game.color, 0.25)})`,
          minHeight: 140,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {game.playersOnline > 0 && (
          <span style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'rgba(21,20,27,.75)',
            color: 'var(--paper)',
            padding: '3px 10px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
          }}>
            👥 {game.playersOnline}
          </span>
        )}
        <span style={{ fontSize: 64 }}>{game.emoji}</span>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: game.authorColor,
          }} />
          <span style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600 }}>{game.author}</span>
        </div>
        <div className="h3" style={{ fontSize: 15, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={game.title}>{game.title}</div>
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600 }}>
          <span>👁 {formatCount(game.views)}</span>
          <span>❤ {game.likes}</span>
        </div>
      </div>
    </Link>
  )
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`
  return String(n)
}

function darken(hex: string, amount = 0.2): string {
  const h = hex.replace('#', '')
  const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const r = Math.max(0, Math.floor(parseInt(n.slice(0, 2), 16) * (1 - amount)))
  const g = Math.max(0, Math.floor(parseInt(n.slice(2, 4), 16) * (1 - amount)))
  const b = Math.max(0, Math.floor(parseInt(n.slice(4, 6), 16) * (1 - amount)))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
