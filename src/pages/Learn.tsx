import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { plural, pluralize } from '../lib/plural'
import PlatformShell from '../components/PlatformShell'
import {
  MODULES,
  ALL_LESSONS,
  getLesson,
  getModuleByLesson,
  getModule,
  KIND_LABEL,
  KIND_COLOR,
  COURSES,
  getCourse,
  KUBIK_COURSE,
  type Course,
  type Lesson,
  type Module,
} from '../lib/curriculum'
import {
  isLessonDone,
  markLessonDone,
  unmarkLesson,
  countDone,
  countDoneInModule,
  getCurrentLesson,
  subscribeProgress,
} from '../lib/progress'
import { renderMd } from '../lib/md'
import NikselIcon, { iconFromEmoji } from '../design/mascot/NikselIcon'

/**
 * Learn — каталог и детали 48-урочного курса Эдюсон Kids.
 * Routes:
 *   /learn                → все модули (карточки с прогрессом)
 *   /learn/module/:N      → все 6 уроков модуля N
 *   /learn/:lessonN       → детали урока (термины/блоки/капстон/презентация)
 */
export default function Learn() {
  const params = useParams()
  const [, force] = useState(0)
  useEffect(() => subscribeProgress(() => force((x) => x + 1)), [])

  // ─── Новые multi-course роуты ───
  if (params.courseSlug) {
    const course = getCourse(params.courseSlug)
    if (!course) return <NotFound />
    if (params.lessonN) {
      const n = Number(params.lessonN) || 1
      const lesson = course.modules.flatMap((m) => m.lessons).find((l) => l.n === n)
      const m = course.modules.find((m) => m.lessons.some((l) => l.n === n))
      return lesson && m ? <LessonPage lesson={lesson} m={m} course={course} /> : <NotFound />
    }
    if (params.moduleN) {
      const n = Number(params.moduleN) || 1
      const m = course.modules.find((mm) => mm.n === n)
      return m ? <ModulePage m={m} course={course} /> : <NotFound />
    }
    return <CourseCatalogPage course={course} />
  }

  // ─── Legacy роуты (Эдюсон Kids only) ───
  if (params.moduleN) {
    const n = Number(params.moduleN) || 1
    const m = getModule(n)
    return m ? <ModulePage m={m} course={KUBIK_COURSE} /> : <NotFound />
  }
  if (params.lessonN) {
    const n = Number(params.lessonN) || 1
    const lesson = getLesson(n)
    const m = getModuleByLesson(n)
    return lesson && m ? <LessonPage lesson={lesson} m={m} course={KUBIK_COURSE} /> : <NotFound />
  }
  const mol = params.moduleOrLesson
  if (mol?.startsWith('module')) {
    const n = Number(mol.replace('module', '').replace('/', '')) || 1
    const m = getModule(n)
    return m ? <ModulePage m={m} course={KUBIK_COURSE} /> : <NotFound />
  }
  const asNum = Number(mol)
  if (asNum && asNum >= 1 && asNum <= 48) {
    const lesson = getLesson(asNum)
    const m = getModuleByLesson(asNum)
    return lesson && m ? <LessonPage lesson={lesson} m={m} course={KUBIK_COURSE} /> : <NotFound />
  }

  // Корень /learn → каталог всех курсов
  return <CoursesCatalog />
}

// ─────────────────────────────────────────────────────────
// Страница 0 · Каталог курсов (LXP верхний уровень)
// ─────────────────────────────────────────────────────────
function CoursesCatalog() {
  return (
    <PlatformShell activeKey="learn">
      <section className="kb-cover kb-cover--ink">
        <div className="kb-cover-meta">
          <span className="eyebrow">Академия Эдюсон · Kids</span>
          <span className="kb-cover-meta-row">
            <span>{COURSES.length} курсов</span>
            <span className="dot" />
            <span>9–15 лет</span>
          </span>
        </div>
        <h1 className="kb-cover-title kb-cover-title--md">
          Курсы<br/><span className="kb-cover-accent">программирования</span>
        </h1>
        <p className="kb-cover-sub">
          Выбери трек по возрасту и формату. Каждый курс — годовая программа
          с поурочными планами, проектами и защитой финального продукта.
        </p>
      </section>

      <div className="curric-modules">
        {COURSES.map((c) => {
          const totalLessons = c.modules.reduce((s, m) => s + m.lessons.length, 0)
          return (
            <Link
              key={c.slug}
              to={`/learn/course/${c.slug}`}
              className="curric-module"
              style={{ '--accent': c.accent } as React.CSSProperties}
            >
              <div className="curric-module-head">
                <span className="curric-module-emoji"><NikselIcon kind={iconFromEmoji(c.emoji)} size={52} /></span>
                <div className="curric-module-meta">
                  <span className="eyebrow">Возраст {c.ageRange} · {c.lessonDurationMin} мин</span>
                  <h3 className="curric-module-title">{c.title}</h3>
                </div>
              </div>
              <p className="curric-module-story">{c.subtitle}</p>
              <div className="curric-module-progress">
                <small>
                  {pluralize(c.modules.length, 'module')} · {pluralize(totalLessons, 'lesson')}
                  {c.source === 'ingested' && ' · импорт'}
                </small>
              </div>
            </Link>
          )
        })}
      </div>
    </PlatformShell>
  )
}

// Страница 1 конкретного курса — каталог 8 модулей
function CourseCatalogPage({ course }: { course: Course }) {
  const totalDone = course.slug === 'kubik' ? countDone() : 0
  const lessons = course.modules.flatMap((m) => m.lessons)
  const totalLessons = lessons.length

  return (
    <PlatformShell activeKey="learn">
      <Link to="/learn" className="kb-shell-nav-link" style={{ display: 'inline-block', marginBottom: 16 }}>
        ← Все курсы
      </Link>
      <header style={{ marginBottom: 32 }}>
        <span className="eyebrow">{course.emoji} Курс · возраст {course.ageRange}</span>
        <h1 className="h1" style={{ marginTop: 10 }}>{course.title}</h1>
        <p style={{ fontSize: 17, color: 'var(--ink-soft)', marginTop: 10, maxWidth: 720, lineHeight: 1.55 }}>
          {course.subtitle}
        </p>
      </header>

      <div className="curric-summary">
        <div className="curric-summary-stats">
          <div>
            <div className="eyebrow">Уроков</div>
            <div className="curric-summary-big">{totalLessons}</div>
          </div>
          <div>
            <div className="eyebrow">Модулей</div>
            <div className="curric-summary-big">{course.modules.length}</div>
          </div>
          <div>
            <div className="eyebrow">Прошёл</div>
            <div className="curric-summary-big">{totalDone} / {totalLessons}</div>
          </div>
        </div>
      </div>

      <div className="curric-modules">
        {course.modules.map((m) => {
          const lessonNums = m.lessons.map((l) => l.n)
          const done = course.slug === 'kubik' ? countDoneInModule(m.n, lessonNums) : 0
          const pct = (done / m.lessons.length) * 100
          return (
            <Link
              key={m.n}
              to={`/learn/course/${course.slug}/module/${m.n}`}
              className="curric-module"
              style={{ '--accent': m.accent } as React.CSSProperties}
            >
              <div className="curric-module-head">
                <span className="curric-module-emoji"><NikselIcon kind={iconFromEmoji(m.emoji)} size={52} /></span>
                <div className="curric-module-meta">
                  <span className="eyebrow">Модуль {m.n} · {m.ageAnchor}</span>
                  <h3 className="curric-module-title">{m.title}</h3>
                </div>
              </div>
              <p className="curric-module-story">{m.story}</p>
              <div className="curric-module-capstone">
                <span className="eyebrow">Капстон</span>
                <strong>{m.capstone.name}</strong> · {m.capstone.genre}
              </div>
              <div className="curric-module-progress">
                <div className="kb-progress">
                  <div className="kb-progress-bar" style={{ width: `${pct}%`, background: m.accent }} />
                </div>
                <small>{done} / {m.lessons.length} {plural(m.lessons.length, 'lesson')}</small>
              </div>
            </Link>
          )
        })}
      </div>
    </PlatformShell>
  )
}

// ─────────────────────────────────────────────────────────
// Страница 2 · Детали модуля (6 уроков)
// ─────────────────────────────────────────────────────────
function ModulePage({ m, course }: { m: Module; course: Course }) {
  const done = course.slug === 'kubik' ? countDoneInModule(m.n, m.lessons.map((l) => l.n)) : 0
  const parentUrl = course.slug === 'kubik' ? '/learn' : `/learn/course/${course.slug}`

  return (
    <PlatformShell activeKey="learn">
      <Link to={parentUrl} className="kb-shell-nav-link" style={{ display: 'inline-block', marginBottom: 16 }}>
        ← Все модули {course.slug === 'kubik' ? '' : `· ${course.title}`}
      </Link>
      <header className="curric-module-hero" style={{ '--accent': m.accent } as React.CSSProperties}>
        <div>
          <span className="eyebrow">Модуль {m.n} · 6 уроков · возраст {m.ageAnchor}</span>
          <h1 className="h1" style={{ margin: '10px 0 12px', display: 'flex', gap: 14, alignItems: 'center' }}>
            <span style={{ fontSize: 48 }}>{m.emoji}</span> {m.title}
          </h1>
          <p className="curric-module-story-big">{m.story}</p>
          <div className="curric-capstone-pill">
            <strong>🏆 Капстон:</strong> {m.capstone.name} · жанр {m.capstone.genre}
            {m.capstone.worldId && (
              <Link to={`/play/${m.capstone.worldId}`} className="kb-btn kb-btn--sm" style={{ marginLeft: 12 }}>
                ▶ Сыграть в эталон
              </Link>
            )}
          </div>
        </div>
        <div className="curric-module-hero-progress">
          <div className="curric-summary-big">{done}/6</div>
          <small>пройдено</small>
        </div>
      </header>

      <div className="curric-lesson-list">
        {m.lessons.map((l, idx) => {
          // DEV: все уроки разблокированы на время разработки
          void idx
          const isDone = isLessonDone(l.n)
          const unlocked = true

          const lessonHref = course.slug === 'kubik'
            ? `/learn/lesson/${l.n}`
            : `/learn/course/${course.slug}/lesson/${l.n}`
          return (
            <Link
              key={l.n}
              to={unlocked ? lessonHref : '#'}
              className={`curric-lesson-card ${!unlocked ? 'locked' : ''} ${isDone ? 'done' : ''}`}
              style={{ '--accent': KIND_COLOR[l.kind] } as React.CSSProperties}
            >
              <div className="curric-lesson-n">
                {isDone ? '✓' : l.n}
              </div>
              <div className="curric-lesson-body">
                <div className="curric-lesson-meta">
                  <span className="curric-lesson-kind">{KIND_LABEL[l.kind]}</span>
                  <span className="curric-lesson-local">L{l.localN}/6</span>
                </div>
                <h4 className="curric-lesson-title">{l.title}</h4>
                <p className="curric-lesson-hook">{l.hook}</p>
              </div>
              <div className="curric-lesson-cta">
                {!unlocked ? '🔒' : isDone ? 'Пройдено' : 'Открыть →'}
              </div>
            </Link>
          )
        })}
      </div>
    </PlatformShell>
  )
}

// ─────────────────────────────────────────────────────────
// Страница 3 · Деталь конкретного урока
// ─────────────────────────────────────────────────────────
function LessonPage({ lesson, m, course }: { lesson: Lesson; m: Module; course: Course }) {
  const isDone = course.slug === 'kubik' ? isLessonDone(lesson.n) : false
  // Для мульти-курсов next/prev берём из course.modules, не глобального Эдюсон Kids getLesson
  const flat = course.modules.flatMap((mm) => mm.lessons)
  const idx = flat.findIndex((l) => l.n === lesson.n)
  const nextLesson = idx >= 0 ? flat[idx + 1] : undefined
  const prevLesson = idx >= 0 ? flat[idx - 1] : undefined
  const moduleHref = course.slug === 'kubik'
    ? `/learn/module/${m.n}`
    : `/learn/course/${course.slug}/module/${m.n}`

  return (
    <PlatformShell activeKey="learn">
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <Link to={moduleHref} className="kb-shell-nav-link">
          ← Модуль {m.n}: {m.title}
        </Link>
        <span style={{ color: 'var(--ink-soft)', fontSize: 13 }}>·</span>
        <span className="eyebrow">Урок {lesson.n} из 48 · {KIND_LABEL[lesson.kind]}</span>
      </div>

      <header className="curric-lesson-hero">
        <h1 className="h1" style={{ margin: '0 0 12px' }}>{lesson.title}</h1>
        <p className="curric-lesson-hook-big">{lesson.hook}</p>
      </header>

      <div className="curric-lesson-grid">
        {/* Основная колонка */}
        <section>
          {/* Presentation + Studio CTA */}
          <div className="kb-card kb-card--feature" style={{ marginBottom: 18 }}>
            <div className="eyebrow">Интерактивная презентация</div>
            <h3 className="h3" style={{ margin: '8px 0 14px' }}>Запустить урок на экране</h3>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {course.slug === 'kubik' && (
                <Link to={`/learn/lesson/${lesson.n}/present`} className="kb-btn kb-btn--lg">
                  ▶ Открыть презентацию
                </Link>
              )}
              {lesson.htmlFile && (
                <a
                  href={lesson.htmlFile}
                  target="_blank"
                  rel="noopener"
                  className="kb-btn kb-btn--lg"
                >
                  ▶ Презентация урока
                </a>
              )}
              {course.slug === 'kubik' && (
                <Link to="/studio" className="kb-btn kb-btn--secondary">
                  🧱 Открыть Студию
                </Link>
              )}
              {lesson.guideFile && (
                <a
                  href={lesson.guideFile}
                  target="_blank"
                  rel="noopener"
                  className="kb-btn kb-btn--secondary"
                >
                  📖 Методичка учителя
                </a>
              )}
            </div>
          </div>

          {/* Ingested-content: Цель, Образовательные результаты, Мини-проект, ДЗ */}
          {lesson.goal && (
            <div className="kb-card" style={{ marginBottom: 18 }}>
              <div className="eyebrow">Цель занятия</div>
              <div className="curric-lesson-md">{renderMd(lesson.goal)}</div>
            </div>
          )}
          {lesson.outcomes && (
            <div className="kb-card" style={{ marginBottom: 18 }}>
              <div className="eyebrow">Образовательные результаты</div>
              <div className="curric-lesson-md">{renderMd(lesson.outcomes)}</div>
            </div>
          )}
          {lesson.miniProject && (
            <div className="kb-card" style={{ marginBottom: 18, borderLeft: `4px solid ${m.accent}` }}>
              <div className="eyebrow">Мини-проект урока</div>
              <div className="curric-lesson-md">{renderMd(lesson.miniProject)}</div>
            </div>
          )}
          {lesson.homework && (
            <div className="kb-card" style={{ marginBottom: 18 }}>
              <div className="eyebrow">Домашнее задание</div>
              <div className="curric-lesson-md">{renderMd(lesson.homework)}</div>
            </div>
          )}

          {/* Новые термины */}
          {(() => {
            const cleanTerms = lesson.terms.filter((t) => !t.includes(':') && t.length < 40)
            return cleanTerms.length > 0 && (
              <div className="kb-card" style={{ marginBottom: 18 }}>
                <div className="eyebrow">Новые термины</div>
                <div className="curric-chips">
                  {cleanTerms.map((t) => (
                    <span key={t} className="curric-chip">📖 {t}</span>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Новые блоки */}
          {lesson.newBlocks.length > 0 && (
            <div className="kb-card" style={{ marginBottom: 18 }}>
              <div className="eyebrow">Новые блоки</div>
              <div className="curric-chips">
                {lesson.newBlocks.map((b) => (
                  <code key={b} className="curric-chip curric-chip-block">🧩 {b}</code>
                ))}
              </div>
            </div>
          )}

          {/* Дифференциация */}
          {lesson.differentiation && (
            <div className="kb-card" style={{ marginBottom: 18 }}>
              <div className="eyebrow">Дифференциация по возрасту</div>
              <div className="curric-diff">
                <div><b className="curric-diff-tag" style={{ color: '#34C38A' }}>🟢 9-10 лет</b>
                  <div>{lesson.differentiation.easy}</div></div>
                <div><b className="curric-diff-tag" style={{ color: '#FFD43C' }}>🟡 11-12 лет</b>
                  <div>{lesson.differentiation.mid}</div></div>
                <div><b className="curric-diff-tag" style={{ color: '#ff5464' }}>🔴 13-15 лет</b>
                  <div>{lesson.differentiation.hard}</div></div>
              </div>
            </div>
          )}

          {/* Капстон-вклад */}
          {lesson.capstoneContribution && (
            <div className="kb-card" style={{ marginBottom: 18, borderLeft: `4px solid ${m.accent}` }}>
              <div className="eyebrow">Вклад в капстон</div>
              <p style={{ margin: '6px 0 0' }}><strong>{m.capstone.name}:</strong> {lesson.capstoneContribution}</p>
            </div>
          )}

          {/* Действия */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 24 }}>
            {course.slug === 'kubik' && (!isDone ? (
              <button className="kb-btn kb-btn--lg" onClick={() => markLessonDone(lesson.n)}>
                ✓ Отметить пройденным
              </button>
            ) : (
              <button className="kb-btn kb-btn--secondary" onClick={() => unmarkLesson(lesson.n)}>
                ↺ Снять отметку
              </button>
            ))}
            {nextLesson && (
              <Link
                to={course.slug === 'kubik' ? `/learn/lesson/${nextLesson.n}` : `/learn/course/${course.slug}/lesson/${nextLesson.n}`}
                className="kb-btn kb-btn--secondary kb-btn--lg"
              >
                Урок {nextLesson.n}: {nextLesson.title} →
              </Link>
            )}
          </div>
        </section>

        {/* Сайдбар: прошлый/следующий урок + прогресс */}
        <aside className="curric-side">
          <div className="kb-card">
            <div className="eyebrow">Этот урок</div>
            <h4 style={{ margin: '6px 0 8px' }}>{KIND_LABEL[lesson.kind]}</h4>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: 0 }}>
              {lesson.kind === 'recall' && 'Первые 10 мин — повторяем прошлый модуль. Остальные 35 — новая тема.'}
              {lesson.kind === 'concept' && 'Новая идея с метафорой из реального мира + демо учителя.'}
              {lesson.kind === 'practice' && 'Пошаговая практика под инструкцию. Повторяем за учителем.'}
              {lesson.kind === 'project' && 'Собираем капстон модуля — это твой выход недели.'}
              {lesson.kind === 'defense' && 'Публичная защита — 2 мин презентация, взаимооценка, рубрика.'}
            </p>
          </div>

          <nav className="kb-card" style={{ marginTop: 14 }}>
            <div className="eyebrow">Навигация</div>
            {(() => {
              const mkLesson = (n: number) =>
                course.slug === 'kubik' ? `/learn/lesson/${n}` : `/learn/course/${course.slug}/lesson/${n}`
              const mkModule = (n: number) =>
                course.slug === 'kubik' ? `/learn/module/${n}` : `/learn/course/${course.slug}/module/${n}`
              return (
                <>
                  {prevLesson && prevLesson.moduleN === lesson.moduleN && (
                    <Link to={mkLesson(prevLesson.n)} className="curric-side-nav">
                      ← L{prevLesson.n}: {prevLesson.title}
                    </Link>
                  )}
                  {nextLesson && nextLesson.moduleN === lesson.moduleN && (
                    <Link to={mkLesson(nextLesson.n)} className="curric-side-nav">
                      L{nextLesson.n}: {nextLesson.title} →
                    </Link>
                  )}
                  {nextLesson && nextLesson.moduleN !== lesson.moduleN && (
                    <Link to={mkModule(nextLesson.moduleN)} className="curric-side-nav">
                      Следующий модуль: M{nextLesson.moduleN} →
                    </Link>
                  )}
                </>
              )
            })()}
          </nav>

          <div className="kb-card" style={{ marginTop: 14, background: `${m.accent}15` }}>
            <div className="eyebrow">Капстон модуля</div>
            <strong>🏆 {m.capstone.name}</strong>
            <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: '4px 0 8px' }}>жанр: {m.capstone.genre}</p>
            {m.capstone.worldId && (
              <Link to={`/play/${m.capstone.worldId}`} className="kb-btn kb-btn--sm" style={{ width: '100%' }}>
                ▶ Сыграть в эталон
              </Link>
            )}
          </div>
        </aside>
      </div>
    </PlatformShell>
  )
}

function NotFound() {
  return (
    <PlatformShell activeKey="learn">
      <div className="kb-card kb-card--feature" style={{ textAlign: 'center', padding: '48px 40px' }}>
        <NikselIcon kind="logic" size={100} />
        <h2 className="h2" style={{ margin: '16px 0 10px' }}>Урок не найден</h2>
        <p style={{ color: 'var(--ink-soft)', marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>
          Никсель обыскал все коридоры — такой страницы нет. Вернись в каталог!
        </p>
        <Link to="/learn" className="kb-btn kb-btn--lg">← В каталог</Link>
      </div>
    </PlatformShell>
  )
}
