import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getLesson, getModuleByLesson, getLesson as getL, KIND_LABEL, getLessonQuiz } from '../lib/curriculum'
import type { Lesson, Module, QuizQuestion } from '../lib/curriculum'
import { markLessonDone, recordQuizResult } from '../lib/progress'
import { ensureAchievementsWatcher } from '../lib/achievements'
import { pluralize } from '../lib/plural'

/**
 * LessonPresentation — автогенерированная презентация урока из curriculum data.
 *
 * Структура 9 слайдов по шаблону 9-step Blockseli:
 *  1. Hero (title + hook)
 *  2. Вспоминалка / мотивация
 *  3. Словарь урока (terms)
 *  4. Учитель моделирует (block-stack demo)
 *  5. Новые блоки
 *  6. Практика по инструкции
 *  7. Дифференциация (3 колонки)
 *  8. Открытая задача + вклад в капстон
 *  9. Итог + «В следующем уроке»
 *
 * Hotkeys: ← → Space, Esc — закрыть.
 */

interface Slide {
  render: (l: Lesson, m: Module, nextLesson?: Lesson) => ReactElement
  badge: string
  emoji: string
}

// ─── QuizSlide ───────────────────────────────────────────────
interface QuizSlideProps {
  quiz: QuizQuestion[]
  answers: Record<number, number>
  onAnswer: (qi: number, opt: number) => void
  submitted: boolean
  correctCount: number
  onSubmit: () => void
  allAnswered: boolean
}
function QuizSlide({
  quiz, answers, onAnswer, submitted, correctCount, onSubmit, allAnswered,
}: QuizSlideProps) {
  const pct = submitted ? correctCount / quiz.length : 0
  const scoreLabel = pct >= 1 ? '🎉 Идеально!'
    : pct >= 0.7 ? '👍 Хорошо!'
    : pct >= 0.5 ? '💪 Норм, но есть куда расти'
    : '🤔 Попробуй ещё — смотри объяснения'

  return (
    <div className="lp-slide lp-quiz">
      <div className="lp-step-head">
        <span className="lp-step-badge">Квиз</span>
        <h2 className="lp-h2">🧠 Проверь себя</h2>
      </div>

      {submitted && (
        <div className={`lp-quiz-summary ${pct >= 0.7 ? 'good' : 'warn'}`}>
          <div className="lp-quiz-score">{correctCount} / {quiz.length}</div>
          <div className="lp-quiz-score-label">{scoreLabel}</div>
        </div>
      )}

      <div className="lp-quiz-questions">
        {quiz.map((q, qi) => (
          <div key={qi} className="lp-quiz-q">
            <div className="lp-quiz-text">
              <span className="lp-quiz-n">{qi + 1}</span>
              {q.text}
            </div>
            <div className="lp-quiz-opts">
              {q.options.map((opt, oi) => {
                const picked = answers[qi] === oi
                const correct = oi === q.correctIdx
                let cls = 'lp-quiz-opt'
                if (submitted) {
                  if (correct) cls += ' correct'
                  else if (picked && !correct) cls += ' wrong'
                } else if (picked) {
                  cls += ' picked'
                }
                return (
                  <button
                    key={oi}
                    className={cls}
                    onClick={() => onAnswer(qi, oi)}
                    disabled={submitted}
                  >
                    <span className="lp-quiz-opt-letter">{String.fromCharCode(65 + oi)}</span>
                    <span>{opt}</span>
                    {submitted && correct && <span className="lp-quiz-check">✓</span>}
                    {submitted && picked && !correct && <span className="lp-quiz-check">✗</span>}
                  </button>
                )
              })}
            </div>
            {submitted && q.explanation && (
              <div className="lp-quiz-explain">💡 {q.explanation}</div>
            )}
          </div>
        ))}
      </div>

      {!submitted && (
        <div className="lp-quiz-submit-row">
          <button
            className="lp-cta"
            onClick={onSubmit}
            disabled={!allAnswered}
            style={{ opacity: allAnswered ? 1 : 0.5, cursor: allAnswered ? 'pointer' : 'not-allowed' }}
          >
            ✓ Проверить ответы
          </button>
          {!allAnswered && (
            <p className="lp-subtle" style={{ marginTop: 8 }}>Ответь на все {pluralize(quiz.length, 'question')} чтобы проверить.</p>
          )}
        </div>
      )}
    </div>
  )
}

const SLIDES: Slide[] = [
  {
    badge: 'Начало',
    emoji: '🚀',
    render: (l, m) => (
      <div className="lp-slide lp-hero">
        <div className="lp-eyebrow">Модуль {m.n} · Урок {l.n} · {KIND_LABEL[l.kind]}</div>
        <h1 className="lp-title">{l.title}</h1>
        <p className="lp-hook">{l.hook}</p>
        <div className="lp-hero-tags">
          <span className="lp-tag">⏱ 45 минут</span>
          <span className="lp-tag">🎯 возраст {m.ageAnchor}</span>
          <span className="lp-tag" style={{ background: `${m.accent}25`, color: m.accent }}>{m.emoji} {m.title}</span>
        </div>
      </div>
    ),
  },
  {
    badge: 'Шаг 2 · Вспоминалка',
    emoji: '🧠',
    render: (l, m) => {
      const prev = getL(l.n - 1)
      const isFirstInModule = l.localN === 1
      return (
        <div className="lp-slide">
          <div className="lp-step-head">
            <span className="lp-step-badge">Шаг 2</span>
            <h2 className="lp-h2">🧠 Вспомни прошлый урок</h2>
          </div>
          {prev ? (
            <div className="lp-recall">
              <p>На прошлом занятии ({prev.title}) мы разобрали:</p>
              <div className="lp-recall-terms">
                {prev.terms.slice(0, 3).map((t) => (
                  <span key={t} className="lp-term">📖 {t}</span>
                ))}
              </div>
              <p className="lp-recall-hint">
                💡 {isFirstInModule
                  ? 'Это первый урок нового модуля — вспоминаем что было в прошлом.'
                  : 'Быстрый quiz: что это значило? Ответь себе вслух.'}
              </p>
            </div>
          ) : (
            <div className="lp-recall">
              <p>🎉 Твой самый первый урок программирования. Готов?</p>
            </div>
          )}
          <p className="lp-subtle">Сегодня: <b>{l.hook}</b></p>
          {/* suppress unused m */}
          {void m}
        </div>
      )
    },
  },
  {
    badge: 'Шаг 3 · Словарь',
    emoji: '📖',
    render: (l) => (
      <div className="lp-slide">
        <div className="lp-step-head">
          <span className="lp-step-badge">Шаг 3</span>
          <h2 className="lp-h2">📖 Словарь урока</h2>
        </div>
        {l.terms.length > 0 ? (
          <div className="lp-terms-grid">
            {l.terms.map((t) => (
              <div key={t} className="lp-term-card">
                <div className="lp-term-icon">📘</div>
                <div className="lp-term-name">{t}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="lp-empty">Этот урок без новых терминов — сегодня практикуем уже знакомое.</div>
        )}
      </div>
    ),
  },
  {
    badge: 'Шаг 4 · Учитель',
    emoji: '👨‍🏫',
    render: (l, m) => (
      <div className="lp-slide">
        <div className="lp-step-head">
          <span className="lp-step-badge">Шаг 4</span>
          <h2 className="lp-h2">👨‍🏫 Учитель показывает</h2>
        </div>
        <div className="lp-teacher">
          <p className="lp-teacher-quote">
            «Сейчас я думаю-вслух. Смотрите и повторяйте за мной.»
          </p>
          <div className="lp-demo">
            <div className="lp-demo-step">
              <span className="lp-demo-num">1</span>
              Открою Студию → Скрипт
            </div>
            <div className="lp-demo-step">
              <span className="lp-demo-num">2</span>
              Возьму блок <b>{l.newBlocks[0] ?? '@при запуске'}</b>
            </div>
            <div className="lp-demo-step">
              <span className="lp-demo-num">3</span>
              Соберу {l.hook.toLowerCase()}
            </div>
            <div className="lp-demo-step">
              <span className="lp-demo-num">4</span>
              Нажму ▶ Тест — смотрим результат
            </div>
          </div>
          <p className="lp-teacher-after">
            Твой капстон модуля — <b>{m.capstone.name}</b>. Сегодня мы ближе к нему на один шаг.
          </p>
        </div>
      </div>
    ),
  },
  {
    badge: 'Шаг 4.5 · Блоки',
    emoji: '🧩',
    render: (l) => (
      <div className="lp-slide">
        <div className="lp-step-head">
          <span className="lp-step-badge">Новое</span>
          <h2 className="lp-h2">🧩 Новые блоки сегодня</h2>
        </div>
        {l.newBlocks.length > 0 ? (
          <div className="lp-blocks">
            {l.newBlocks.map((b, i) => (
              <div key={b} className="lp-block-card" style={{ animationDelay: `${i * 80}ms` }}>
                <code>{b}</code>
              </div>
            ))}
            <p className="lp-subtle">Найди их в палитре в соответствующих категориях.</p>
          </div>
        ) : null}
      </div>
    ),
  },
  {
    badge: 'Шаг 5 · Практика',
    emoji: '✋',
    render: (l, m) => (
      <div className="lp-slide">
        <div className="lp-step-head">
          <span className="lp-step-badge">Шаг 5</span>
          <h2 className="lp-h2">✋ Твоя очередь</h2>
        </div>
        <ol className="lp-practice">
          <li><b>1.</b> Открой Студию (вкладка <code>/studio</code>)</li>
          <li><b>2.</b> Собери скрипт из блоков по инструкции учителя</li>
          <li><b>3.</b> Переключись на ▶ Тест</li>
          <li><b>4.</b> Проверь: {l.hook.toLowerCase()}</li>
          <li><b>5.</b> Сохрани как часть {m.capstone.name}</li>
        </ol>
        <Link to="/studio" className="lp-cta">🧱 Открыть Студию прямо сейчас</Link>
      </div>
    ),
  },
  {
    badge: 'Шаг 6 · Диффер.',
    emoji: '🎨',
    render: (l) => (
      <div className="lp-slide">
        <div className="lp-step-head">
          <span className="lp-step-badge">Шаг 6</span>
          <h2 className="lp-h2">🎨 Уровни сложности</h2>
        </div>
        {l.differentiation ? (
          <div className="lp-diff">
            <div className="lp-diff-card" style={{ borderColor: '#34C38A' }}>
              <div className="lp-diff-tag" style={{ color: '#34C38A' }}>🟢 9-10 лет</div>
              <p>{l.differentiation.easy}</p>
            </div>
            <div className="lp-diff-card" style={{ borderColor: '#FFD43C' }}>
              <div className="lp-diff-tag" style={{ color: '#FFD43C' }}>🟡 11-12 лет</div>
              <p>{l.differentiation.mid}</p>
            </div>
            <div className="lp-diff-card" style={{ borderColor: '#ff5464' }}>
              <div className="lp-diff-tag" style={{ color: '#ff5464' }}>🔴 13-15 лет</div>
              <p>{l.differentiation.hard}</p>
            </div>
          </div>
        ) : (
          <div className="lp-empty">Выбери свой уровень вместе с учителем.</div>
        )}
      </div>
    ),
  },
  {
    badge: 'Шаг 8 · Капстон',
    emoji: '🏆',
    render: (l, m) => (
      <div className="lp-slide">
        <div className="lp-step-head">
          <span className="lp-step-badge">Шаг 8</span>
          <h2 className="lp-h2">🏆 Вклад в капстон</h2>
        </div>
        <div className="lp-capstone" style={{ borderColor: m.accent }}>
          <div className="lp-capstone-title">{m.capstone.name}</div>
          <div className="lp-capstone-meta">{m.emoji} жанр: {m.capstone.genre}</div>
          <p className="lp-capstone-contribution">
            <strong>После этого урока в твоей игре появится:</strong><br />
            {l.capstoneContribution}
          </p>
          {m.capstone.worldId && (
            <Link to={`/play/${m.capstone.worldId}`} className="lp-cta">
              ▶ Сыграть в эталон капстона
            </Link>
          )}
        </div>
      </div>
    ),
  },
  {
    badge: 'Шаг 9 · Итог',
    emoji: '⏭',
    render: (l, m, nextLesson) => (
      <div className="lp-slide lp-final">
        <div className="lp-step-head">
          <span className="lp-step-badge">Шаг 9</span>
          <h2 className="lp-h2">⏭ Итог + что дальше</h2>
        </div>
        <div className="lp-final-card" style={{ borderColor: m.accent }}>
          <p className="lp-mantra">
            Закончи вслух: <i>«Сегодня я научился <b>{l.title.toLowerCase()}</b>. Теперь я могу <b>{l.capstoneContribution}</b>.»</i>
          </p>
          {nextLesson ? (
            <div className="lp-next-lesson">
              <div className="lp-eyebrow">Следующий урок</div>
              <h3>Урок {nextLesson.n}: {nextLesson.title}</h3>
              <p>{nextLesson.hook}</p>
            </div>
          ) : (
            <div className="lp-next-lesson">
              <div className="lp-eyebrow">Ты на финише!</div>
              <h3>🎉 Все 48 уроков пройдены</h3>
              <p>Ты завершил годовой курс Эдюсон Kids. Получи сертификат у учителя.</p>
            </div>
          )}
        </div>
      </div>
    ),
  },
]

export default function LessonPresentation() {
  const { lessonN } = useParams()
  const navigate = useNavigate()
  const [idx, setIdx] = useState(0)
  const n = Number(lessonN) || 1

  const lesson = useMemo(() => getLesson(n), [n])
  const module_ = useMemo(() => getModuleByLesson(n), [n])
  const nextLesson = useMemo(() => getLesson(n + 1), [n])
  const quiz = useMemo(() => (lesson ? getLessonQuiz(lesson) : []), [lesson])

  useEffect(() => { ensureAchievementsWatcher() }, [])

  // Quiz state (storage всех ответов — ключ = индекс вопроса)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)

  // Reset answers when lesson changes
  useEffect(() => { setAnswers({}); setQuizSubmitted(false) }, [n])

  // Динамический список слайдов: базовые 9 + quiz-слайд если есть вопросы
  const totalSlides = SLIDES.length + (quiz.length > 0 ? 1 : 0)
  const quizIdx = SLIDES.length
  const onQuizSlide = quiz.length > 0 && idx === quizIdx
  const pct = ((idx + 1) / totalSlides) * 100

  // Keep refs fresh so the keydown handler (registered once) sees current values.
  const totalSlidesRef = useRef(totalSlides)
  totalSlidesRef.current = totalSlides
  const onQuizSlideRef = useRef(onQuizSlide)
  onQuizSlideRef.current = onQuizSlide
  const quizSubmittedRef = useRef(quizSubmitted)
  quizSubmittedRef.current = quizSubmitted

  const goNext = () => setIdx((i) => Math.min(totalSlides - 1, i + 1))
  const goPrev = () => setIdx((i) => Math.max(0, i - 1))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault()
        if (onQuizSlideRef.current && !quizSubmittedRef.current) return
        setIdx((i) => Math.min(totalSlidesRef.current - 1, i + 1))
      }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)) }
      if (e.key === 'Escape') navigate(`/learn/lesson/${n}`)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [n, navigate])

  if (!lesson || !module_) {
    return (
      <div className="lp-wrap">
        <div className="lp-slide lp-empty-page">
          <h2>Урок не найден</h2>
          <Link to="/learn" className="lp-cta">← В каталог</Link>
        </div>
      </div>
    )
  }

  const onAnswer = (qi: number, opt: number) => {
    if (quizSubmitted) return
    setAnswers((a) => ({ ...a, [qi]: opt }))
  }
  const onSubmitQuiz = () => {
    if (quiz.length === 0) return
    const correct = quiz.reduce<number>(
      (s: number, q: QuizQuestion, i: number) => s + (answers[i] === q.correctIdx ? 1 : 0),
      0
    )
    recordQuizResult(n, correct, quiz.length)
    setQuizSubmitted(true)
  }
  const correctCount = quiz.reduce<number>(
    (s: number, q: QuizQuestion, i: number) => s + (answers[i] === q.correctIdx ? 1 : 0), 0
  )
  const allAnswered = quiz.length > 0 && quiz.every((_q: QuizQuestion, i: number) => answers[i] !== undefined)

  return (
    <div className="lp-wrap">
      <header className="lp-header">
        <Link to={`/learn/lesson/${n}`} className="lp-close" title="Закрыть (Esc)">← Назад к уроку</Link>
        <div className="lp-header-info">
          <span>Модуль {module_.n} · Урок {n} из 48</span>
          {!onQuizSlide && idx < SLIDES.length && (
            <span>· {SLIDES[idx].emoji} {SLIDES[idx].badge}</span>
          )}
          {onQuizSlide && <span>· 🧠 Квиз</span>}
        </div>
        <div className="lp-counter">{idx + 1} / {totalSlides}</div>
      </header>

      <div className="lp-progress-bar">
        <div className="lp-progress-fill" style={{ width: `${pct}%`, background: module_.accent }} />
      </div>

      <main className="lp-main">
        {onQuizSlide ? (
          <QuizSlide
            quiz={quiz}
            answers={answers}
            onAnswer={onAnswer}
            submitted={quizSubmitted}
            correctCount={correctCount}
            onSubmit={onSubmitQuiz}
            allAnswered={allAnswered}
          />
        ) : (
          SLIDES[idx].render(lesson, module_, nextLesson)
        )}
      </main>

      <footer className="lp-footer">
        <button
          className="lp-nav-btn"
          onClick={goPrev}
          disabled={idx === 0}
        >← Назад</button>
        <div className="lp-dots" role="tablist" aria-label="Слайды урока">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              className={`lp-dot ${i === idx ? 'active' : ''}`}
              onClick={() => setIdx(i)}
              role="tab"
              aria-selected={i === idx}
              aria-label={`Слайд ${i + 1}`}
            />
          ))}
        </div>
        {idx < totalSlides - 1 ? (
          <button
            className="lp-nav-btn lp-nav-next"
            onClick={goNext}
            disabled={onQuizSlide && !quizSubmitted}
            title={onQuizSlide && !quizSubmitted ? 'Сначала ответь на квиз' : ''}
          >Дальше →</button>
        ) : (
          <button
            className="lp-nav-btn lp-nav-next"
            onClick={() => { markLessonDone(n); navigate(nextLesson ? `/learn/lesson/${n + 1}` : '/learn') }}
          >
            ✓ Урок пройден →
          </button>
        )}
      </footer>
    </div>
  )
}
