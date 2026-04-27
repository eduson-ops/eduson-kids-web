import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PlatformShell from '../components/PlatformShell'
import Niksel from '../design/mascot/Niksel'
import { pluralize } from '../lib/plural'
import { QUIZ_CONFIG, QUIZ_LEVELS, type QuizLevel } from '../lib/constants'

/**
 * /quiz/adaptive — адаптивный квиз (prompt 2.2 из аудита).
 *
 * Механика:
 *   - стартуем с L3 (средняя сложность)
 *   - правильный ответ → L+1, неправильный → L-1 + короткое объяснение
 *   - победа: 5 правильных ответов подряд на уровне ≥ целевого (3 по умолчанию)
 *   - поражение: 8 вопросов не набрал 5 в стрик → предложить повторить
 *
 * Темы на выбор: ?topic=loops|variables|conditions|functions|python-basics
 */

interface Question {
  id: string
  level: QuizLevel
  text: string
  options: string[]
  correct: number
  explanation: string
}

type TopicId = 'python-basics' | 'loops' | 'conditions' | 'functions' | 'variables'

interface Topic {
  id: TopicId
  title: string
  emoji: string
  bank: Question[]
}

// ─── Банк вопросов по темам ───────────────────────

const TOPICS: Topic[] = [
  {
    id: 'python-basics',
    title: 'Основы Python',
    emoji: '🐍',
    bank: [
      { id: 'pb1', level: 1, text: 'Как вывести текст «Привет» на экран?', options: ['say("Привет")', 'print "Привет"', 'echo Привет', 'write(Привет)'], correct: 0, explanation: 'Функция say() — наш способ показать текст в мире. В реальном Python — print().' },
      { id: 'pb2', level: 1, text: 'Какой символ — комментарий в Python?', options: ['//', '#', '--', '/*'], correct: 1, explanation: '# — строчный комментарий. Всё что справа от # — не выполняется.' },
      { id: 'pb3', level: 2, text: 'Сколько будет 7 // 2?', options: ['3.5', '3', '4', '7.5'], correct: 1, explanation: '// — целочисленное деление. 7 разделить на 2 = 3 (остаток 1 отбрасывается).' },
      { id: 'pb4', level: 2, text: 'Какой тип у значения "42"?', options: ['int', 'float', 'str', 'bool'], correct: 2, explanation: 'Кавычки делают значение строкой (str). Без кавычек было бы int.' },
      { id: 'pb5', level: 3, text: 'Что выведет: print(2 ** 3)?', options: ['6', '8', '9', 'Ошибка'], correct: 1, explanation: '** — возведение в степень. 2 в степени 3 = 8.' },
      { id: 'pb6', level: 3, text: 'Что делает len("python")?', options: ['Пишет строку', 'Возвращает 6', 'Возвращает True', 'Возвращает 5'], correct: 1, explanation: 'len() возвращает длину строки. В "python" — 6 символов.' },
      { id: 'pb7', level: 4, text: 'Какой результат: "ab" * 3?', options: ['ababab', '6', 'aaabbb', 'Ошибка'], correct: 0, explanation: 'Умножение строки на число повторяет её. "ab" × 3 = "ababab".' },
      { id: 'pb8', level: 4, text: 'Что выведет: bool("")?', options: ['True', 'False', '0', 'Ошибка'], correct: 1, explanation: 'Пустая строка в булевом контексте — False. Любой непустой текст — True.' },
      { id: 'pb9', level: 5, text: 'list("abc") вернёт…', options: ['"abc"', '["abc"]', "['a', 'b', 'c']", '3'], correct: 2, explanation: 'list() разбирает строку в список посимвольно.' },
      { id: 'pb10', level: 5, text: 'type(3.0 / 1) — какой тип?', options: ['int', 'float', 'str', 'bool'], correct: 1, explanation: 'Деление / всегда даёт float в Python 3, даже если результат целый.' },
    ],
  },
  {
    id: 'loops',
    title: 'Циклы',
    emoji: '🔁',
    bank: [
      { id: 'l1', level: 1, text: 'Какой блок повторит действие 5 раз?', options: ['if', 'for', 'def', 'return'], correct: 1, explanation: 'for — цикл повторения. «for i in range(5)» повторит 5 раз.' },
      { id: 'l2', level: 1, text: 'range(3) даст числа…', options: ['1, 2, 3', '0, 1, 2', '0, 1, 2, 3', '3, 2, 1'], correct: 1, explanation: 'range(N) даёт числа от 0 до N-1. range(3) = 0, 1, 2.' },
      { id: 'l3', level: 2, text: 'Что выведет: for i in range(3): print(i)?', options: ['1 2 3', '0 1 2', '0 1 2 3', '3'], correct: 1, explanation: 'Цикл проходит по 0, 1, 2 и печатает каждое.' },
      { id: 'l4', level: 2, text: 'Как пропустить оставшееся в цикле и перейти к следующей итерации?', options: ['break', 'continue', 'return', 'pass'], correct: 1, explanation: 'continue пропускает остаток тела цикла и сразу идёт на следующий шаг.' },
      { id: 'l5', level: 3, text: 'Сколько раз напечатает «hi» такой код: for i in range(2): for j in range(3): print("hi")?', options: ['5', '6', '8', '32'], correct: 1, explanation: 'Вложенные циклы: 2 × 3 = 6 итераций внутреннего блока.' },
      { id: 'l6', level: 3, text: 'Как досрочно выйти из цикла?', options: ['break', 'exit', 'stop', 'end'], correct: 0, explanation: 'break — прерывает текущий цикл и идёт дальше за ним.' },
      { id: 'l7', level: 4, text: 'for x in [10, 20, 30] — по чему проходит цикл?', options: ['По числам 0..29', 'По элементам 10, 20, 30', 'Три раза по x=30', 'Ошибка'], correct: 1, explanation: 'for x in <коллекция> — берёт элементы по одному.' },
      { id: 'l8', level: 4, text: 'Что делает while True?', options: ['Ничего', 'Цикл один раз', 'Цикл пока выполняется что-то внутри', 'Бесконечный цикл'], correct: 3, explanation: 'True всегда истинно — нужен break внутри иначе зависнет.' },
      { id: 'l9', level: 5, text: 'range(1, 10, 3) даст…', options: ['1 2 3 4 5 6 7 8 9', '1 4 7', '1 3 6 9', '3 6 9'], correct: 1, explanation: 'range(start, stop, step) — с шагом 3. 1 → 4 → 7 (меньше 10).' },
      { id: 'l10', level: 5, text: 'Что даст сумма: sum(range(1, 5))?', options: ['5', '10', '15', '1234'], correct: 1, explanation: '1 + 2 + 3 + 4 = 10. range(1, 5) даёт числа 1..4.' },
    ],
  },
  {
    id: 'conditions',
    title: 'Условия',
    emoji: '❓',
    bank: [
      { id: 'c1', level: 1, text: 'Какое ключевое слово — «если»?', options: ['for', 'if', 'def', 'print'], correct: 1, explanation: 'if — проверка условия. if age >= 10: …' },
      { id: 'c2', level: 1, text: 'Что даст: 5 > 3?', options: ['5', 'True', 'False', 'Ошибка'], correct: 1, explanation: 'Сравнение — булево значение. 5 больше 3 → True.' },
      { id: 'c3', level: 2, text: 'Что выведет: print(10 == 10)?', options: ['10', 'True', 'False', '20'], correct: 1, explanation: '== — проверка равенства. 10 равно 10 → True.' },
      { id: 'c4', level: 2, text: 'Если if = ложно, куда идёт управление?', options: ['else или за if', 'В бесконечный цикл', 'Ошибка', 'Повтор if'], correct: 0, explanation: 'Если условие False — выполняется else (если есть) или следующий код за if.' },
      { id: 'c5', level: 3, text: 'Что выведет код: if 5 > 0 and 0 > -1: print("да")?', options: ['да', 'Ничего', 'True', 'Ошибка'], correct: 0, explanation: 'and — оба условия истинны. 5 > 0 — True, 0 > -1 — True. Выводится «да».' },
      { id: 'c6', level: 3, text: 'not True даёт…', options: ['True', 'False', '0', 'Ошибка'], correct: 1, explanation: 'not — логическое НЕ. Инвертирует: not True = False.' },
      { id: 'c7', level: 4, text: 'Сколько веток в: if a: … elif b: … elif c: … else: …?', options: ['2', '3', '4', 'Бесконечно'], correct: 2, explanation: 'if + elif + elif + else = 4 ветки. Выполнится только одна.' },
      { id: 'c8', level: 4, text: 'bool(0) — это…', options: ['True', 'False', '0', 'Ошибка'], correct: 1, explanation: 'Ноль в булевом контексте — False. Любое другое число — True.' },
      { id: 'c9', level: 5, text: 'Что выведет: x = 7; print("чёт" if x % 2 == 0 else "нечёт")?', options: ['чёт', 'нечёт', '7', 'Ошибка'], correct: 1, explanation: 'Тернарный if. 7 % 2 = 1 → условие False → «нечёт».' },
      { id: 'c10', level: 5, text: 'Как проверить «x в диапазоне 1..10 включительно»?', options: ['if 1 <= x <= 10', 'if 1 < x < 10', 'if x in 1..10', 'if range(1,10)'], correct: 0, explanation: 'Цепочка сравнений 1 <= x <= 10 в Python работает буквально. Удобнее чем (x >= 1) and (x <= 10).' },
    ],
  },
  {
    id: 'variables',
    title: 'Переменные',
    emoji: '📦',
    bank: [
      { id: 'v1', level: 1, text: 'Как сохранить число 5 в переменную name?', options: ['name = 5', 'name == 5', 'set name 5', 'name: 5'], correct: 0, explanation: '= — присваивание. name = 5 положит 5 в переменную name.' },
      { id: 'v2', level: 1, text: 'Что выведет: x = 3; print(x)?', options: ['x', '3', 'Ошибка', 'None'], correct: 1, explanation: 'x хранит 3. print(x) выводит значение переменной.' },
      { id: 'v3', level: 2, text: 'Какое имя недопустимо для переменной?', options: ['my_var', '_var', '2var', 'var2'], correct: 2, explanation: 'Имя не может начинаться с цифры. my_var, _var, var2 — ок.' },
      { id: 'v4', level: 2, text: 'x = 5; x = x + 1. Что в x?', options: ['5', '6', 'Ошибка', '1'], correct: 1, explanation: 'Сначала вычисляется x + 1 (то есть 5 + 1 = 6), потом результат записывается обратно в x.' },
      { id: 'v5', level: 3, text: 'Что выведет: a = "5"; b = 3; print(a + b)?', options: ['8', '53', 'Ошибка', '"8"'], correct: 2, explanation: 'Нельзя сложить строку и число. Нужен int(a) + b → 8 или a + str(b) → "53".' },
      { id: 'v6', level: 3, text: 'Что делает `x, y = 1, 2`?', options: ['Ошибка', 'x = 1, y = 2', 'x = (1,2)', 'x = 2, y = 1'], correct: 1, explanation: 'Tuple-unpacking. x получит 1, y получит 2.' },
      { id: 'v7', level: 4, text: 'После `s = "abc"; s[0] = "X"` произойдёт…', options: ['s = "Xbc"', 'Ошибка', 's = "X"', 'Ничего'], correct: 1, explanation: 'Строки immutable — нельзя менять символ. Нужно собрать новую: s = "X" + s[1:].' },
      { id: 'v8', level: 4, text: 'lst = [1,2,3]; lst.append(4). Что в lst?', options: ['[1,2,3]', '[1,2,3,4]', '[4,1,2,3]', 'Ошибка'], correct: 1, explanation: 'append() добавляет в конец списка. list — мутабельный.' },
      { id: 'v9', level: 5, text: 'x = None; if x: print("есть"). Что выведет?', options: ['есть', 'Ничего', 'None', 'Ошибка'], correct: 1, explanation: 'None в булевом контексте — False, условие не выполнится.' },
      { id: 'v10', level: 5, text: 'global x внутри функции значит…', options: ['Создать новую x', 'Использовать x из-вне функции', 'Удалить x', 'Скопировать x'], correct: 1, explanation: 'global делает x внутри функции ссылкой на глобальную переменную.' },
    ],
  },
  {
    id: 'functions',
    title: 'Функции',
    emoji: '⚡',
    bank: [
      { id: 'f1', level: 1, text: 'Какое ключевое слово объявляет функцию?', options: ['func', 'def', 'function', 'lambda'], correct: 1, explanation: 'def — define. «def hello():» объявляет функцию hello.' },
      { id: 'f2', level: 1, text: 'Как вызвать функцию greet?', options: ['greet', 'call greet', 'greet()', 'run greet'], correct: 2, explanation: 'Круглые скобки — вызов функции. greet() запустит её.' },
      { id: 'f3', level: 2, text: 'Что делает `return 5`?', options: ['Печатает 5', 'Выходит из функции и возвращает 5', 'Создаёт переменную 5', 'Ошибка'], correct: 1, explanation: 'return немедленно прерывает функцию и передаёт значение обратно.' },
      { id: 'f4', level: 2, text: 'Функция без return что возвращает?', options: ['0', '""', 'None', 'Ошибку'], correct: 2, explanation: 'По умолчанию функция возвращает None.' },
      { id: 'f5', level: 3, text: 'Что выведет: def f(x): return x*2; print(f(3))?', options: ['3', '6', 'None', 'x*2'], correct: 1, explanation: 'f(3) → x=3 → return 6 → print(6).' },
      { id: 'f6', level: 3, text: 'Аргумент по умолчанию — это…', options: ['Аргумент без имени', 'Аргумент с заранее заданным значением', 'Первый аргумент', 'Скрытый аргумент'], correct: 1, explanation: 'def f(x=10): — если вызвать f() без x, будет взято 10.' },
      { id: 'f7', level: 4, text: 'def g(*args) — что такое args?', options: ['Ошибка', 'Список аргументов', 'Словарь', 'Один аргумент'], correct: 1, explanation: '*args собирает все позиционные аргументы в tuple (список).' },
      { id: 'f8', level: 4, text: 'lambda x: x+1 — что это?', options: ['Ошибка', 'Анонимная функция', 'Переменная', 'Оператор'], correct: 1, explanation: 'lambda создаёт короткую функцию без def. lambda x: x+1 == def f(x): return x+1.' },
      { id: 'f9', level: 5, text: 'Можно ли внутри функции вызвать её саму?', options: ['Нет', 'Да (рекурсия)', 'Только 1 раз', 'Только если static'], correct: 1, explanation: 'Да — рекурсия. Функция вызывает себя. Нужно условие остановки иначе — бесконечность.' },
      { id: 'f10', level: 5, text: 'Декоратор @staticmethod применяется к…', options: ['Переменной', 'Методу класса', 'Модулю', 'Файлу'], correct: 1, explanation: '@staticmethod — для методов класса, которые не используют self.' },
    ],
  },
]

export default function AdaptiveQuiz() {
  const [searchParams] = useSearchParams()
  const topicParam = searchParams.get('topic') as TopicId | null
  const [topicId, setTopicId] = useState<TopicId | null>(topicParam && TOPICS.find((t) => t.id === topicParam) ? topicParam : null)

  if (!topicId) {
    return <TopicPicker onPick={setTopicId} />
  }

  const topic = TOPICS.find((t) => t.id === topicId) ?? TOPICS[0]
  return <QuizRunner topic={topic} onExit={() => setTopicId(null)} />
}

// ─── Topic picker ────────────────────────────────

function TopicPicker({ onPick }: { onPick: (id: TopicId) => void }) {
  return (
    <PlatformShell>
      <section className="kb-cover kb-cover--violet">
        <div className="kb-cover-meta">
          <span className="eyebrow">Адаптивный квиз · Khan-style</span>
        </div>
        <h1 className="kb-cover-title kb-cover-title--md">
          Квиз по<br/><span className="kb-cover-accent">программированию.</span>
        </h1>
        <p className="kb-cover-sub">
          Сложность подстраивается под тебя. 5 правильных ответов подряд —
          и уровень закрыт. Ошибся — объясню почему и дам чуть проще.
        </p>
        <div className="kb-cover-mascot" aria-hidden>
          <Niksel pose="think" size={240} />
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 className="h2" style={{ marginBottom: 16 }}>Выбери тему</h2>
        <div className="kb-grid-3">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              onClick={() => onPick(t.id)}
              className="kb-card"
              style={{
                cursor: 'pointer',
                border: '2px solid rgba(21,20,27,.08)',
                background: 'var(--paper)',
                textAlign: 'left',
                font: 'inherit',
                color: 'inherit',
                padding: 20,
              }}
            >
              <div style={{ fontSize: 40 }} aria-hidden>{t.emoji}</div>
              <h3 className="h3" style={{ marginTop: 10, fontSize: 17 }}>{t.title}</h3>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 6 }}>
                {pluralize(t.bank.length, 'question')} · 5 уровней сложности
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="kb-card" style={{ padding: 20, fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--ink)' }}>Как работает адаптация?</strong>
        <br />
        Старт с L3 (средняя сложность). Правильный ответ → L+1. Неправильный → L-1 + короткое объяснение.
        Победа: <strong>5 правильных подряд на L≥3</strong>. Поражение: <strong>8 вопросов без серии в 5</strong> — можно повторить.
        <br /><br />
        <Link to="/">← Назад на главную</Link>
      </section>
    </PlatformShell>
  )
}

// ─── Quiz runner ──────────────────────────────────

type Phase = 'question' | 'feedback' | 'win' | 'lose'

function QuizRunner({ topic, onExit }: { topic: Topic; onExit: () => void }) {
  const [level, setLevel] = useState<QuizLevel>(QUIZ_CONFIG.START_LEVEL)
  const [streak, setStreak] = useState(0)
  const [asked, setAsked] = useState(0)
  const [currentQ, setCurrentQ] = useState<Question | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [phase, setPhase] = useState<Phase>('question')
  const [history, setHistory] = useState<{ levelAt: number; correct: boolean }[]>([])

  const askedIds = useMemo(() => new Set(history.map((_, i) => i)), [history])

  // Выбрать новый вопрос на текущем уровне (не повторяя)
  const pickQuestion = useMemo(() => {
    return (currentLevel: QuizLevel): Question | null => {
      const asked = new Set(history.map((h, i) => `${h.levelAt}-${i}`))
      const pool = topic.bank.filter((q) => q.level === currentLevel && !asked.has(q.id))
      if (pool.length === 0) {
        // Fallback: любой вопрос с ближайшего уровня
        const anyUnasked = topic.bank.filter((q) => !askedIds.has(topic.bank.indexOf(q)))
        return anyUnasked[0] ?? topic.bank[0]
      }
      return pool[Math.floor(Math.random() * pool.length)]
    }
  }, [topic, history, askedIds])

  useEffect(() => {
    if (!currentQ && phase === 'question') {
      setCurrentQ(pickQuestion(level))
    }
  }, [currentQ, phase, level, pickQuestion])

  const onPick = (idx: number) => {
    if (phase !== 'question' || !currentQ) return
    setSelected(idx)
    const correct = idx === currentQ.correct
    setHistory((h) => [...h, { levelAt: currentQ.level, correct }])
    setAsked((n) => n + 1)
    if (correct) {
      const newStreak = streak + 1
      setStreak(newStreak)
      // Победа: WIN_STREAK правильных подряд на L≥WIN_LEVEL
      if (newStreak >= QUIZ_CONFIG.WIN_STREAK && level >= QUIZ_CONFIG.WIN_LEVEL) {
        setPhase('win')
        return
      }
      // Повысить уровень (но не выше QUIZ_LEVELS.MAX)
      if (level < QUIZ_LEVELS.MAX) setLevel((level + 1) as QuizLevel)
    } else {
      setStreak(0)
      // Понизить уровень (но не ниже QUIZ_LEVELS.MIN)
      if (level > QUIZ_LEVELS.MIN) setLevel((level - 1) as QuizLevel)
    }
    setPhase('feedback')
    // Поражение: MAX_QUESTIONS вопросов и стрик < WIN_STREAK
    if (asked + 1 >= QUIZ_CONFIG.MAX_QUESTIONS && (streak + (correct ? 1 : 0)) < QUIZ_CONFIG.WIN_STREAK) {
      setTimeout(() => setPhase('lose'), QUIZ_CONFIG.LOSE_DELAY_MS)
    }
  }

  const onNext = () => {
    setSelected(null)
    setCurrentQ(null)
    setPhase('question')
  }

  const onRestart = () => {
    setLevel(QUIZ_CONFIG.START_LEVEL)
    setStreak(0)
    setAsked(0)
    setCurrentQ(null)
    setSelected(null)
    setPhase('question')
    setHistory([])
  }

  if (!currentQ && phase !== 'win' && phase !== 'lose') {
    return (
      <PlatformShell>
        <div style={{ padding: 40, textAlign: 'center' }}>Загрузка…</div>
      </PlatformShell>
    )
  }

  return (
    <PlatformShell>
      {/* HUD */}
      <section style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <button className="kb-btn kb-btn--sm" onClick={onExit}>← Другая тема</button>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 13 }}>
          <span className="kb-card" style={{ padding: '6px 12px', margin: 0 }}>
            {topic.emoji} <strong>{topic.title}</strong>
          </span>
          <span className="kb-card" style={{ padding: '6px 12px', margin: 0 }}>
            Уровень <strong style={{ color: 'var(--violet)' }}>L{level}</strong>
          </span>
          <span className="kb-card" style={{ padding: '6px 12px', margin: 0, background: streak >= QUIZ_CONFIG.HOT_STREAK ? 'var(--yellow-soft)' : undefined }}>
            🔥 Стрик <strong>{streak}</strong>/{QUIZ_CONFIG.WIN_STREAK}
          </span>
          <span className="kb-card" style={{ padding: '6px 12px', margin: 0 }}>
            Вопрос <strong>{asked + (phase === 'question' ? 1 : 0)}</strong>
          </span>
        </div>
      </section>

      {phase === 'win' && (
        <section className="kb-card kb-card--feature" style={{ textAlign: 'center', padding: 40, background: 'linear-gradient(135deg, #9FE8C7, #2E8C5F)', color: '#fff' }}>
          <div style={{ fontSize: 80 }}>🎉</div>
          <h2 style={{ color: '#fff', margin: '16px 0 8px', fontFamily: 'var(--f-display)', fontWeight: 900, fontSize: 32 }}>
            Победа!
          </h2>
          <p style={{ color: '#fff', opacity: 0.95, fontSize: 16 }}>
            5 правильных ответов подряд на уровне L{level}. Тема <strong>{topic.title}</strong> освоена!
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
            <button className="kb-btn kb-btn--lg" onClick={onRestart} style={{ background: '#FFD43C', color: '#15141b', fontWeight: 900 }}>
              🔁 Ещё раз
            </button>
            <button className="kb-btn kb-btn--lg kb-btn--ghost" onClick={onExit} style={{ color: '#fff', boxShadow: 'inset 0 0 0 2px rgba(255,255,255,.6)' }}>
              Другая тема
            </button>
          </div>
        </section>
      )}

      {phase === 'lose' && (
        <section className="kb-card kb-card--feature" style={{ textAlign: 'center', padding: 40, background: 'var(--pink-soft)' }}>
          <div style={{ fontSize: 64 }}>🐧</div>
          <h2 style={{ margin: '16px 0 8px', fontFamily: 'var(--f-display)', fontWeight: 900, fontSize: 26 }}>
            Пока не получилось 5 подряд
          </h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: 15 }}>
            Прошёл 8 вопросов. Бывает! Повтори — теперь знаешь что спрашивают. Я рядом 🐧
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
            <button className="kb-btn kb-btn--lg kb-btn--secondary" onClick={onRestart}>
              🔁 Попробовать снова
            </button>
            <button className="kb-btn kb-btn--lg" onClick={onExit}>Другая тема</button>
          </div>
        </section>
      )}

      {(phase === 'question' || phase === 'feedback') && currentQ && (
        <section className="kb-card kb-card--feature" style={{ padding: 32, maxWidth: 760, margin: '0 auto' }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>L{currentQ.level} · Вопрос</div>
          <h2 className="h2" style={{ marginTop: 0, fontSize: 22, lineHeight: 1.35 }}>
            {currentQ.text}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
            {currentQ.options.map((opt, i) => {
              const isSelected = selected === i
              const isCorrect = i === currentQ.correct
              let bg = 'var(--paper)'
              let border = '2px solid rgba(21,20,27,.12)'
              let color = 'var(--ink)'
              if (phase === 'feedback') {
                if (isCorrect) {
                  bg = 'rgba(46, 140, 95, 0.12)'
                  border = '2px solid var(--mint-deep, #2E8C5F)'
                } else if (isSelected && !isCorrect) {
                  bg = 'rgba(232, 81, 123, 0.12)'
                  border = '2px solid #E8517B'
                  color = '#6A1A33'
                }
              }
              return (
                <button
                  key={i}
                  onClick={() => onPick(i)}
                  disabled={phase !== 'question'}
                  style={{
                    padding: '14px 18px',
                    borderRadius: 12,
                    background: bg,
                    border,
                    color,
                    cursor: phase === 'question' ? 'pointer' : 'default',
                    fontFamily: 'var(--f-ui)',
                    fontSize: 15,
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <strong style={{ marginRight: 10, color: 'var(--ink-soft)' }}>{String.fromCharCode(65 + i)}.</strong>
                  {opt}
                  {phase === 'feedback' && isCorrect && <span style={{ marginLeft: 10 }}>✓</span>}
                  {phase === 'feedback' && isSelected && !isCorrect && <span style={{ marginLeft: 10 }}>✗</span>}
                </button>
              )
            })}
          </div>

          {phase === 'feedback' && (
            <div
              style={{
                marginTop: 20,
                padding: 16,
                background: selected === currentQ.correct ? 'rgba(46, 140, 95, 0.08)' : 'rgba(232, 81, 123, 0.08)',
                borderRadius: 12,
                borderLeft: `4px solid ${selected === currentQ.correct ? 'var(--mint-deep, #2E8C5F)' : '#E8517B'}`,
              }}
            >
              <strong style={{ display: 'block', marginBottom: 6 }}>
                {selected === currentQ.correct ? '✓ Правильно!' : '✗ Не совсем'}
              </strong>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>{currentQ.explanation}</p>
              <button className="kb-btn kb-btn--secondary" onClick={onNext} style={{ marginTop: 12 }}>
                Дальше →
              </button>
            </div>
          )}
        </section>
      )}
    </PlatformShell>
  )
}
