import PlatformShell from '../components/PlatformShell'
import Niksel from '../design/mascot/Niksel'
import { Link } from 'react-router-dom'

/**
 * Дизайнбук — внутренняя страница с визуальными стандартами бренда.
 * Видна в sidenav, чтобы команда и co-founder могли свериться со
 * стилем. Показывает палитру, тип, кнопки, блоки, иконки, тон голоса.
 *
 * Это не продуктовая фича для ребёнка — а живая Spa-страница брендбука.
 */

const COLORS = [
  { name: 'Фиалка', key: 'violet', hex: '#6B5CE7', role: 'Движение · основной' },
  { name: 'Солнце', key: 'yellow', hex: '#FFD43C', role: 'Логика · акцент' },
  { name: 'Мята',   key: 'mint',   hex: '#9FE8C7', role: 'Данные' },
  { name: 'Зефир',  key: 'pink',   hex: '#FFB4C8', role: 'События' },
  { name: 'Небо',   key: 'sky',    hex: '#A9D8FF', role: 'Внешний мир' },
  { name: 'Лиса',   key: 'orange', hex: '#FF9454', role: 'Звук' },
  { name: 'Чернила', key: 'ink',   hex: '#15141B', role: 'Текст · шапки' },
  { name: 'Бумага', key: 'paper',  hex: '#FFFBF3', role: 'Фон · карточки' },
]

const ICONS = [
  { label: 'Старт',    svg: '▶' },
  { label: 'Пауза',    svg: '⏸' },
  { label: 'Стоп',     svg: '⏹' },
  { label: 'Перезапуск', svg: '↻' },
  { label: 'Сохранить', svg: '💾' },
  { label: 'Опубликовать', svg: '📤' },
  { label: 'Урок',     svg: '📚' },
  { label: 'Студия',   svg: '🧱' },
  { label: 'Сайт',     svg: '🌐' },
  { label: 'Монета',   svg: '💰' },
  { label: 'Ачивка',   svg: '🏆' },
  { label: 'Стрик',    svg: '🔥' },
]

const BLOCKS = [
  { cls: 'kb-block--move',  label: 'двигаться →', kind: 'Движение' },
  { cls: 'kb-block--logic', label: 'если · иначе', kind: 'Логика' },
  { cls: 'kb-block--data',  label: 'счёт + 1',    kind: 'Данные' },
  { cls: 'kb-block--event', label: 'когда клик',  kind: 'События' },
  { cls: 'kb-block--world', label: 'установить небо', kind: 'Мир' },
  { cls: 'kb-block--sound', label: 'сыграть ноту',    kind: 'Звук' },
]

const GOOD_VOICE = [
  'Ты построил первый блок. Теперь соберём из них пирамидку.',
  'Ошибся? Отлично — значит, ты пробовал. Давай посмотрим, что произошло.',
  'Ты автор. Мы просто даём кирпичики.',
]

const BAD_VOICE = [
  'Неправильно! Попробуй еще раз.',
  'Ой-ой, малыш, куда же ты тыкаешь?',
  'Молодец, ты нажал на кнопку! Так держать!',
]

export default function Designbook() {
  return (
    <PlatformShell activeKey="designbook">
      <section className="kb-cover kb-cover--ink">
        <div className="kb-cover-meta">
          <span className="eyebrow">Дизайнбук · v1.0</span>
          <span className="kb-cover-meta-row">
            <span>Эдусон Kids</span><span className="dot" /><span>2026</span>
          </span>
        </div>
        <h1 className="kb-cover-title kb-cover-title--md">
          Как мы<br/><span className="kb-cover-accent">выглядим</span>
        </h1>
        <p className="kb-cover-sub">
          Палитра, типографика, блоки, голос и&nbsp;правила использования бренда.
          Всё, что нужно команде и&nbsp;партнёрам, чтобы оставаться на&nbsp;одной волне.
        </p>
      </section>

      {/* Палитра */}
      <section style={{ marginBottom: 60 }}>
        <header style={{ marginBottom: 20 }}>
          <span className="eyebrow">01 · Палитра</span>
          <h2 className="h2" style={{ marginTop: 8 }}>Цвет — это система, не украшение</h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: 15, marginTop: 8, maxWidth: 640 }}>
            Каждый цвет означает тип блока. Ребёнок учится читать код по цвету.
          </p>
        </header>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {COLORS.map((c) => (
            <div
              key={c.key}
              style={{
                background: c.hex,
                color: isDark(c.hex) ? '#FFFBF3' : '#15141B',
                padding: 18,
                borderRadius: 18,
                minHeight: 140,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 0 rgba(21,20,27,.12)',
              }}
            >
              <div>
                <div style={{ fontFamily: 'var(--f-display)', fontWeight: 900, fontSize: 22 }}>{c.name}</div>
                <div style={{ fontSize: 12, opacity: .82, marginTop: 4 }}>{c.role}</div>
              </div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, opacity: .7, textTransform: 'uppercase' }}>
                {c.hex}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Типографика */}
      <section style={{ marginBottom: 60 }}>
        <header style={{ marginBottom: 20 }}>
          <span className="eyebrow">02 · Типографика</span>
          <h2 className="h2" style={{ marginTop: 8 }}>Nunito 900 + JetBrains Mono</h2>
        </header>
        <div className="kb-card kb-card--feature">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <ScaleRow size="80px" weight={900} label="H1 · Cover" sample="Эдусон Kids" />
            <ScaleRow size="56px" weight={900} label="H1 · Section" sample="Курсы программирования" />
            <ScaleRow size="32px" weight={800} label="H2" sample="Что такое блок" />
            <ScaleRow size="20px" weight={800} label="H3" sample="Модуль 1: Первые шаги" />
            <ScaleRow size="15px" weight={600} label="Body" sample="Собираем программу из цветных блоков" />
            <ScaleRow size="11px" weight={600} label="Eyebrow" sample="АКАДЕМИЯ ЭДУСОН · KIDS" mono />
          </div>
        </div>
      </section>

      {/* Кнопки */}
      <section style={{ marginBottom: 60 }}>
        <header style={{ marginBottom: 20 }}>
          <span className="eyebrow">03 · Кнопки</span>
          <h2 className="h2" style={{ marginTop: 8 }}>Chunky — с&nbsp;ощутимой тенью</h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: 15, marginTop: 8, maxWidth: 640 }}>
            Shadow <code>0 4px 0</code> создаёт ощущение LEGO-блока. При нажатии — опускается на&nbsp;3px вниз.
          </p>
        </header>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="kb-btn kb-btn--lg">▶ Primary</button>
          <button className="kb-btn kb-btn--lg kb-btn--secondary">★ Secondary</button>
          <button className="kb-btn kb-btn--lg kb-btn--ghost">Ghost</button>
          <button className="kb-btn kb-btn--lg" disabled>Disabled</button>
          <button className="kb-btn">Small Primary</button>
          <button className="kb-btn kb-btn--sm kb-btn--ghost">Tiny Ghost</button>
        </div>
      </section>

      {/* Блоки */}
      <section style={{ marginBottom: 60 }}>
        <header style={{ marginBottom: 20 }}>
          <span className="eyebrow">04 · Блоки кода</span>
          <h2 className="h2" style={{ marginTop: 8 }}>6 категорий · 6 цветов</h2>
        </header>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {BLOCKS.map((b) => (
            <div key={b.cls} className="kb-card" style={{ padding: 18 }}>
              <div className={`kb-block ${b.cls}`} style={{
                background: 'var(--c)',
                color: 'var(--ci)',
                padding: '12px 16px',
                borderRadius: 12,
                fontFamily: 'var(--f-display)',
                fontWeight: 800,
                fontSize: 15,
                boxShadow: '0 4px 0 rgba(0,0,0,.25)',
                display: 'inline-block',
              }}>
                {b.label}
              </div>
              <div className="eyebrow" style={{ marginTop: 8 }}>{b.kind}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Иконки */}
      <section style={{ marginBottom: 60 }}>
        <header style={{ marginBottom: 20 }}>
          <span className="eyebrow">05 · Иконки</span>
          <h2 className="h2" style={{ marginTop: 8 }}>Крупные, понятные, без&nbsp;деталей</h2>
        </header>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
          {ICONS.map((i) => (
            <div key={i.label} className="kb-card" style={{
              padding: 20,
              alignItems: 'center',
              textAlign: 'center',
              gap: 8,
            }}>
              <div style={{ fontSize: 36, lineHeight: 1 }}>{i.svg}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600 }}>{i.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Маскот */}
      <section style={{ marginBottom: 60 }}>
        <header style={{ marginBottom: 20 }}>
          <span className="eyebrow">06 · Маскот</span>
          <h2 className="h2" style={{ marginTop: 8 }}>Пингвин Никсель — проводник</h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: 15, marginTop: 8, maxWidth: 640 }}>
            Подбадривает, отмечает прогресс, появляется в&nbsp;ключевые моменты. Не&nbsp;навязывается.
          </p>
        </header>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {(['idle', 'wave', 'think', 'celebrate', 'code', 'confused'] as const).map((p) => (
            <div key={p} className="kb-card" style={{ alignItems: 'center', textAlign: 'center' }}>
              <Niksel pose={p} size={140} />
              <div className="eyebrow" style={{ marginTop: 6 }}>{p}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Voice */}
      <section style={{ marginBottom: 60 }}>
        <header style={{ marginBottom: 20 }}>
          <span className="eyebrow">07 · Голос и тон</span>
          <h2 className="h2" style={{ marginTop: 8 }}>Уважаем ребёнка как&nbsp;автора</h2>
        </header>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="kb-card" style={{ borderLeft: '4px solid var(--mint-deep)' }}>
            <div className="eyebrow" style={{ color: 'var(--mint-ink)' }}>✓ Так говорим</div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
              {GOOD_VOICE.map((v) => (
                <li key={v} className="kb-state kb-state--success" style={{ display: 'block', padding: '10px 14px' }}>
                  {v}
                </li>
              ))}
            </ul>
          </div>
          <div className="kb-card" style={{ borderLeft: '4px solid var(--pink-deep)' }}>
            <div className="eyebrow" style={{ color: 'var(--pink-ink)' }}>✕ Так — нет</div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
              {BAD_VOICE.map((v) => (
                <li key={v} className="kb-state kb-state--error" style={{ display: 'block', padding: '10px 14px', textDecoration: 'line-through', textDecorationColor: 'rgba(0,0,0,.25)' }}>
                  {v}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 6 правил */}
      <section style={{ marginBottom: 60 }}>
        <header style={{ marginBottom: 20 }}>
          <span className="eyebrow">08 · Принципы</span>
          <h2 className="h2" style={{ marginTop: 8 }}>6 правил, на&nbsp;которых всё держится</h2>
        </header>
        <ol style={{ display: 'flex', flexDirection: 'column', gap: 18, margin: 0, padding: 0, listStyle: 'none' }}>
          {[
            ['Блок — это мысль', 'Всё, что можно представить как блок — представляем. Кнопки, карточки, достижения, аватары. Скруглённый прямоугольник с зазором — базовая форма системы.'],
            ['Ребёнок — автор, не зритель', 'Интерфейс всегда оставляет место для действия. Пустые состояния предлагают собрать первый блок, а не читать нотации.'],
            ['Цвет работает', 'Фиолетовый — движение, жёлтый — логика, мятный — данные, розовый — события, небесный — внешний мир. Ребёнок учится читать код через цвет.'],
            ['Растём вместе с пользователем', 'Для 5–7 лет — крупная типографика, маскот на каждом шагу. Для 13–16 — плотнее, строже, ближе к настоящему редактору кода.'],
            ['Без инфантилизма', 'Мы не сюсюкаем. Не используем «детский» комик-стиль, мультяшные градиенты, пузыри-смайлы. Детям нужен серьёзный инструмент, который уважает их как авторов.'],
            ['Родитель видит то же, что ребёнок', 'Родительский кабинет не живёт отдельной жизнью. Те же блоки, те же цвета, та же карта курса — только с показателями прогресса сверху.'],
          ].map(([title, body], i) => (
            <li key={title} className="kb-card" style={{ flexDirection: 'row', gap: 24, alignItems: 'flex-start' }}>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 14, fontWeight: 700, color: 'var(--violet)', minWidth: 36 }}>0{i + 1}</div>
              <div>
                <h3 className="h3" style={{ marginBottom: 6 }}>{title}</h3>
                <p style={{ color: 'var(--ink-soft)', fontSize: 15, margin: 0, maxWidth: 720, lineHeight: 1.55 }}>{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Footer */}
      <section style={{
        padding: '32px 0',
        borderTop: '1px solid rgba(21,20,27,.08)',
        display: 'flex',
        gap: 20,
        flexWrap: 'wrap',
        alignItems: 'baseline',
        fontSize: 13,
        color: 'var(--ink-soft)',
      }}>
        <div style={{ fontFamily: 'var(--f-mono)', letterSpacing: '.06em' }}>Эдусон Kids · Дизайнбук v1.0 · 2026</div>
        <Link to="/" style={{ color: 'var(--violet)', fontWeight: 700 }}>На главную →</Link>
      </section>
    </PlatformShell>
  )
}

function ScaleRow({ size, weight, label, sample, mono }: { size: string; weight: number; label: string; sample: string; mono?: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 24, alignItems: 'baseline', paddingBottom: 14, borderBottom: '1px solid rgba(21,20,27,.08)' }}>
      <div style={{ fontSize: 11, fontFamily: 'var(--f-mono)', color: 'var(--ink-soft)', letterSpacing: '.04em' }}>
        {label}<br/><span style={{ opacity: .5 }}>{size} · {weight}</span>
      </div>
      <div style={{
        fontFamily: mono ? 'var(--f-mono)' : 'var(--f-display)',
        fontSize: size,
        fontWeight: weight,
        lineHeight: 1.05,
        letterSpacing: parseInt(size) >= 48 ? '-0.03em' : '-0.015em',
        color: 'var(--ink)',
        textTransform: label === 'Eyebrow' ? 'uppercase' : 'none',
      }}>
        {sample}
      </div>
    </div>
  )
}

function isDark(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
}
