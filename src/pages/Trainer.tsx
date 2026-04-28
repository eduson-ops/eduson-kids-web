import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PlatformShell from '../components/PlatformShell'
import PuzzleEditor, { type PuzzleSolvedEvent } from '../components/PuzzleEditor'
import DetectiveBoard from '../components/DetectiveBoard'
import {
  getTrainer,
  getPuzzle,
  markSolved,
  getSolvedSet,
  type StorySlide,
} from '../lib/puzzles'
import { recordActivity, touchStreak } from '../lib/progress'
import { useToast } from '../hooks/useToast'

const STREAK_KEY = 'ek_puzzle_streak'

function bumpPuzzleStreak(): number {
  try {
    const raw = localStorage.getItem(STREAK_KEY)
    const n = raw ? Number(raw) || 0 : 0
    const next = n + 1
    localStorage.setItem(STREAK_KEY, String(next))
    return next
  } catch {
    return 0
  }
}

function StorySlideOverlay({ slide, onClose }: { slide: StorySlide; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => { dialogRef.current?.focus() }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div ref={dialogRef} className="story-slide" role="dialog" aria-modal="true" tabIndex={-1} aria-label={slide.title} onClick={onClose}>
      <div className="story-slide-card" onClick={(e) => e.stopPropagation()}>
        <div className="story-slide-emoji" aria-hidden>{slide.emoji}</div>
        <div className="story-slide-chapter">{slide.chapter}</div>
        <h2 className="story-slide-title">{slide.title}</h2>
        <p className="story-slide-text" style={{ whiteSpace: 'pre-line' }}>{slide.text}</p>
        <button className="kb-btn story-slide-btn" type="button" onClick={onClose}>
          Продолжить →
        </button>
      </div>
    </div>
  )
}

export default function Trainer() {
  const { trainerId, puzzleN } = useParams<{ trainerId: string; puzzleN: string }>()
  const navigate = useNavigate()
  const { toast, show } = useToast()

  const n = Math.max(1, Math.min(10, Number(puzzleN) || 1))
  const trainer = trainerId ? getTrainer(trainerId) : undefined
  const task = trainerId ? getPuzzle(trainerId, n) : undefined

  const [activeSlide, setActiveSlide] = useState<StorySlide | null>(null)
  const [shownSlides, setShownSlides] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (task?.beforeSlide) {
      const key = task.id
      if (!shownSlides.has(key)) {
        setActiveSlide(task.beforeSlide)
        setShownSlides((prev) => new Set([...prev, key]))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id])

  const closeSlide = useCallback(() => setActiveSlide(null), [])

  const solvedSet = useMemo(() => {
    if (!trainerId) return new Set<number>()
    return getSolvedSet(trainerId)
  }, [trainerId, n])

  const goNext = useCallback(() => {
    if (!trainerId) return
    if (n >= 10) {
      navigate('/trainers')
    } else {
      navigate(`/trainers/${trainerId}/${n + 1}`)
    }
  }, [n, navigate, trainerId])

  const handleSolved = useCallback(
    (ev: PuzzleSolvedEvent) => {
      if (!trainerId) return
      markSolved(trainerId, ev.task.n)
      recordActivity({ coins: ev.task.reward.coins, minutes: 2 })
      touchStreak()
      const streak = bumpPuzzleStreak()
      show(
        `Решено! +${ev.task.reward.coins} монет${streak > 1 ? ` · серия ${streak}` : ''}`,
        'success',
      )
    },
    [trainerId, show],
  )

  if (!trainer || !task) {
    return (
      <PlatformShell activeKey="trainers">
        <div className="kb-card">
          <h2 className="h2">Тренажёр не найден</h2>
          <p>Кажется, такой задачи нет.</p>
          <Link to="/trainers" className="kb-btn kb-btn--secondary">
            ← К каталогу
          </Link>
        </div>
      </PlatformShell>
    )
  }

  const solvedCount = solvedSet.size
  const stars = Math.max(0, Math.min(5, Math.round(solvedCount / 2)))

  return (
    <PlatformShell activeKey="trainers">
      {activeSlide && <StorySlideOverlay slide={activeSlide} onClose={closeSlide} />}

      <nav className="puzzle-breadcrumbs">
        <Link to="/">Главная</Link>
        <span> / </span>
        <Link to="/trainers">Тренажёры</Link>
        <span> / </span>
        <span>{trainer.title}</span>
      </nav>

      <header className="puzzle-header kb-card">
        <div className="puzzle-header-left">
          <span className="puzzle-header-emoji" aria-hidden>
            {trainer.emoji}
          </span>
          <div>
            <div className="puzzle-header-title">{trainer.title}</div>
            <div className="puzzle-header-sub">
              Задача {n}/10 ·{' '}
              <span className="puzzle-header-stars" aria-label={`${stars} из 5`}>
                {'★'.repeat(stars)}
                {'☆'.repeat(5 - stars)}
              </span>{' '}
              · решено {solvedCount}/10
            </div>
          </div>
        </div>
        <div className="puzzle-header-nav">
          <button
            className="kb-btn kb-btn--ghost kb-btn--sm"
            type="button"
            aria-label="Предыдущая задача"
            onClick={() => navigate(`/trainers/${trainer.id}/${Math.max(1, n - 1)}`)}
            disabled={n <= 1}
          >
            ←
          </button>
          <button
            className="kb-btn kb-btn--ghost kb-btn--sm"
            type="button"
            aria-label="Следующая задача"
            onClick={() => navigate(`/trainers/${trainer.id}/${Math.min(10, n + 1)}`)}
            disabled={n >= 10}
          >
            →
          </button>
        </div>
      </header>

      {trainerId === 'detective' && (
        <DetectiveBoard n={n} solvedCount={solvedCount} />
      )}

      <PuzzleEditor
        task={task}
        onSolved={handleSolved}
        onNext={goNext}
        initialMode={trainerId === 'detective' ? 'python' : 'blocks'}
      />

      {toast && (
        <div className={`kb-toast kb-toast--${toast.kind}`} key={toast.key}>
          {toast.msg}
        </div>
      )}
    </PlatformShell>
  )
}
