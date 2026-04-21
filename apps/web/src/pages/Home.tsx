import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { GAMES, type GameMeta } from '../lib/games'

export default function Home() {
  const navigate = useNavigate()
  const [childName, setChildName] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<GameMeta['category'] | 'all'>('all')

  useEffect(() => {
    setChildName(localStorage.getItem('ek_child_name'))
  }, [])

  const filtered = useMemo(() => {
    return GAMES.filter((g) => {
      if (activeCategory !== 'all' && g.category !== activeCategory) return false
      if (query && !g.title.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
  }, [query, activeCategory])

  const featured = filtered.filter((g) => g.featured).sort((a, b) => a.rank - b.rank)
  const best = filtered.slice().sort((a, b) => b.playersOnline - a.playersOnline)

  const logout = () => {
    localStorage.removeItem('ek_child_code')
    localStorage.removeItem('ek_child_name')
    setChildName(null)
    navigate('/login')
  }

  return (
    <div className="lobby">
      <header className="lobby-top">
        <div className="lobby-brand">
          <span className="logo" aria-hidden>🎮</span>
          <strong>Eduson Kids</strong>
        </div>

        <nav className="lobby-nav">
          <input
            className="lobby-search"
            placeholder="🔎 поиск игр"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Link to="/studio" className="btn ghost">+ Создать свою игру</Link>
          {childName ? (
            <div className="lobby-who">
              <span>Привет, {childName}</span>
              <button className="btn ghost tiny" onClick={logout}>выйти</button>
            </div>
          ) : (
            <Link to="/login" className="btn">Войти 🐱</Link>
          )}
        </nav>
      </header>

      <div className="lobby-chips">
        {(
          [
            ['all', 'Все'],
            ['obby', 'Обби'],
            ['sandbox', 'Песочница'],
            ['rp', 'RP'],
            ['race', 'Гонки'],
            ['sim', 'Симуляторы'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            className={`chip ${activeCategory === key ? 'active' : ''}`}
            onClick={() => setActiveCategory(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <section className="lobby-section">
        <h2>рекомендуем</h2>
        <GameGrid games={featured} />
      </section>

      <section className="lobby-section">
        <h2>лучшее</h2>
        <GameGrid games={best} showCreateCard />
      </section>

      <footer className="lobby-foot">
        <small>© 2026 Eduson Kids · Stage 1 MVP · данные в РФ (152-ФЗ)</small>
      </footer>
    </div>
  )
}

function GameGrid({ games, showCreateCard }: { games: GameMeta[]; showCreateCard?: boolean }) {
  return (
    <div className="game-grid">
      {showCreateCard && (
        <Link to="/studio" className="game-card create-card">
          <div className="thumb create-thumb">
            <span className="plus">+</span>
          </div>
          <div className="game-title">Создать свою игру</div>
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
    <Link to={`/play/${game.id}`} className="game-card">
      <div
        className="thumb"
        style={{
          background: `linear-gradient(135deg, ${game.color}, ${darken(game.color, 0.25)})`,
        }}
      >
        <span className="thumb-emoji">{game.emoji}</span>
        {game.playersOnline > 0 && (
          <span className="players-badge">👥 {game.playersOnline}</span>
        )}
      </div>
      <div className="game-title">{game.title}</div>
      <div className="game-author">🐱 {game.author}</div>
    </Link>
  )
}

function darken(hex: string, amount = 0.2): string {
  const h = hex.replace('#', '')
  const n = h.length === 3
    ? h.split('').map((c) => c + c).join('')
    : h
  const r = Math.max(0, Math.floor(parseInt(n.slice(0, 2), 16) * (1 - amount)))
  const g = Math.max(0, Math.floor(parseInt(n.slice(2, 4), 16) * (1 - amount)))
  const b = Math.max(0, Math.floor(parseInt(n.slice(4, 6), 16) * (1 - amount)))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
