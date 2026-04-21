import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { GAMES, type GameMeta } from '../lib/games'

type TopTab = 'featured' | 'templates'
type BottomTab = 'best' | 'fresh' | 'hot' | 'online'

export default function Home() {
  const navigate = useNavigate()
  const [childName, setChildName] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [topTab, setTopTab] = useState<TopTab>('featured')
  const [bottomTab, setBottomTab] = useState<BottomTab>('best')

  useEffect(() => {
    setChildName(localStorage.getItem('ek_child_name'))
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

  const logout = () => {
    localStorage.removeItem('ek_child_code')
    localStorage.removeItem('ek_child_name')
    setChildName(null)
  }

  const playRandom = () => {
    const pool = topRow.length ? topRow : bottomRow
    const pick = pool[Math.floor(Math.random() * pool.length)]
    if (pick) navigate(`/play/${pick.id}`)
  }

  return (
    <div className="lobby-v2">
      <header className="lobby-topbar">
        <div className="search-pill">
          <span className="search-icon" aria-hidden>🔎</span>
          <input
            className="search-input"
            placeholder="Найти…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="lobby-auth">
          {/* Аватар-котик виден всегда — ведёт в /profile с 3D-превью */}
          <Link
            to="/profile"
            className="avatar-btn"
            aria-label="Мой аватар"
            title="Мой аватар"
          >
            <span aria-hidden>🐱</span>
          </Link>
          {childName ? (
            <>
              <span className="hello">Привет, {childName}</span>
              <button
                className="btn ghost tiny"
                onClick={logout}
                aria-label="Выйти"
              >
                выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="icon-btn" aria-label="Регистрация">
                <span aria-hidden>👤</span>
                <span className="plus-bubble" aria-hidden>+</span>
              </Link>
              <Link to="/login" className="login-cat">
                Войти
                <span className="login-cat-icon" aria-hidden>🐱</span>
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="lobby-section-v2">
        <TabChips<TopTab>
          options={[
            ['featured', 'рекомендуем'],
            ['templates', 'шаблоны'],
          ]}
          value={topTab}
          onChange={setTopTab}
        />
        <GameGrid games={topRow} />
      </section>

      <section className="lobby-section-v2">
        <TabChips<BottomTab>
          options={[
            ['best', 'лучшее'],
            ['fresh', 'новое'],
            ['hot', 'горячее'],
            ['online', `онлайн  ${onlineCount}`],
          ]}
          value={bottomTab}
          onChange={setBottomTab}
        />
        <GameGrid games={bottomRow} withCreateFirst />
      </section>

      <button className="play-fab" onClick={playRandom} aria-label="Играть">
        <span className="fab-icon" aria-hidden>🎮</span>
        <span>играть</span>
      </button>
    </div>
  )
}

function TabChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: [T, string][]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="tab-chips">
      {options.map(([k, label]) => (
        <button
          key={k}
          className={`tab-chip ${value === k ? 'active' : ''}`}
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
    <div className="game-grid-v2">
      {withCreateFirst && (
        <Link to="/studio" className="game-card-v2 create-card-v2">
          <div className="thumb-v2 create-thumb-v2">
            <span className="plus-big">＋</span>
          </div>
          <div className="card-meta">
            <div className="author-line">
              <span className="author-dot" style={{ background: '#a4a9bc' }} />
              <span className="author-name">Твоя игра</span>
            </div>
            <div className="game-title-v2">Создать свою игру</div>
          </div>
        </Link>
      )}
      {games.map((g) => (
        <GameCard key={g.id} game={g} />
      ))}
    </div>
  )
}

function GameCard({ game }: { game: GameMeta }) {
  return (
    <Link to={`/play/${game.id}`} className="game-card-v2">
      <div
        className="thumb-v2"
        style={{
          background: `linear-gradient(135deg, ${game.color}, ${darken(game.color, 0.25)})`,
        }}
      >
        {game.playersOnline > 0 && (
          <span className="players-badge-v2">👥 {game.playersOnline}</span>
        )}
        <span className="thumb-emoji-v2">{game.emoji}</span>
      </div>
      <div className="card-meta">
        <div className="author-line">
          <span
            className="author-dot"
            style={{ background: game.authorColor }}
            aria-hidden
          />
          <span className="author-name">{game.author}</span>
        </div>
        <div className="game-title-v2">{game.title}</div>
        <div className="stats-line">
          <span className="stat">
            <span aria-hidden>👁</span> {formatCount(game.views)}
          </span>
          <span className="stat">
            <span aria-hidden>❤</span> {game.likes}
          </span>
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
