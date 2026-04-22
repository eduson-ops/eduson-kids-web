const RU = new Intl.PluralRules('ru-RU')

// [one, few, many]
const FORMS = {
  lesson:      ['урок',       'урока',       'уроков']       as const,
  coin:        ['монета',     'монеты',      'монет']        as const,
  point:       ['очко',       'очка',        'очков']        as const,
  minute:      ['минута',     'минуты',      'минут']        as const,
  day:         ['день',       'дня',         'дней']         as const,
  event:       ['событие',    'события',     'событий']      as const,
  achievement: ['достижение', 'достижения',  'достижений']   as const,
  module:      ['модуль',     'модуля',      'модулей']      as const,
  task:        ['задача',     'задачи',      'задач']        as const,
  hour:        ['час',        'часа',        'часов']        as const,
} as const

export type PluralKey = keyof typeof FORMS

export function plural(n: number, key: PluralKey): string {
  const cat = RU.select(n)
  const [one, few, many] = FORMS[key]
  if (cat === 'one') return one
  if (cat === 'few') return few
  return many
}

export function pluralize(n: number, key: PluralKey): string {
  return `${n} ${plural(n, key)}`
}
