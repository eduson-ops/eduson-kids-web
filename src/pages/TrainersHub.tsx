import { Link } from 'react-router-dom'
import PlatformShell from '../components/PlatformShell'
import { TRAINERS, getSolvedCount, getNextUnsolved } from '../lib/puzzles'

export default function TrainersHub() {
  return (
    <PlatformShell activeKey="learn">
      <section className="kb-cover kb-cover--violet" style={{ marginBottom: 32 }}>
        <div className="kb-cover-meta">
          <span className="eyebrow">Тренажёры · chess.com для кода</span>
        </div>
        <h1 className="kb-cover-title kb-cover-title--md">
          Решай <span className="kb-cover-accent">короткие задачи</span>
        </h1>
        <p className="kb-cover-sub">
          50 мини-задач на движение, циклы, условия и функции. Хочешь — блоками, хочешь — Python.
          Каждая задача — 1-3 минуты. Ошибся? Получишь подсказку.
        </p>
      </section>

      <section className="trainers-grid kb-grid-2">
        {TRAINERS.map((t) => {
          const solved = getSolvedCount(t.id)
          const nextN = getNextUnsolved(t.id)
          const pct = Math.round((solved / 10) * 100)
          return (
            <article key={t.id} className="trainer-card" style={{ ['--trainer-color' as string]: t.color }}>
              <span className="trainer-card-bar" aria-hidden />
              <div className="trainer-card-head">
                <span className="trainer-card-emoji" aria-hidden>{t.emoji}</span>
                <div className="trainer-card-titles">
                  <h3 className="trainer-card-title">{t.title}</h3>
                  <p className="trainer-card-tagline">{t.tagline}</p>
                </div>
              </div>
              <p className="trainer-card-desc">{t.description}</p>

              <div className="trainer-card-progress">
                <div className="trainer-card-progress-head">
                  <span>
                    <strong>{solved}/10</strong> решено
                  </span>
                  <span className="trainer-card-progress-pct">{pct}%</span>
                </div>
                <div className="trainer-card-progress-bar">
                  <div
                    className="trainer-card-progress-fill"
                    style={{ width: `${pct}%`, background: t.color }}
                  />
                </div>
              </div>

              <div className="trainer-card-actions">
                <Link
                  to={`/trainers/${t.id}/${nextN}`}
                  className="kb-btn trainer-card-btn"
                >
                  {solved > 0 && solved < 10
                    ? `Продолжить · задача ${nextN}`
                    : solved === 10
                      ? 'Пройти снова'
                      : 'Начать'}
                </Link>
              </div>
            </article>
          )
        })}
      </section>

      <section className="trainers-how">
        <h2 className="h2">Как это работает?</h2>
        <div className="kb-grid-3 trainers-how-grid">
          <div className="kb-card">
            <div className="trainers-how-num">1</div>
            <h3 className="h3">Читай задачу</h3>
            <p>Каждая задача — короткое описание. Сверху — что нужно сделать.</p>
          </div>
          <div className="kb-card">
            <div className="trainers-how-num">2</div>
            <h3 className="h3">Выбери способ</h3>
            <p>Собери программу из блоков или напиши на Python. Переключайся прямо на лету.</p>
          </div>
          <div className="kb-card">
            <div className="trainers-how-num">3</div>
            <h3 className="h3">Проверь</h3>
            <p>Нажми «Проверить» — сразу узнаешь верно ли. Ошибся? Бери следующую подсказку.</p>
          </div>
        </div>
      </section>
    </PlatformShell>
  )
}
