/**
 * Классный журнал — хранение классов и учеников.
 * MVP: localStorage. В prod → API.
 *
 * Логин: transliterate(firstName + '-' + lastName) + '-' + classSuffix
 * PIN: 6 цифр
 */

export const CLASSROOMS_CLASSROOMS_KEY = 'ek_classrooms'

export interface Student {
  firstName: string
  lastName: string
  login: string
  pin: string
}

export interface Classroom {
  id: string
  name: string
  teacherId: string
  students: Student[]
  createdAt: number
}

function load(): Classroom[] {
  try {
    const raw = localStorage.getItem(CLASSROOMS_KEY)
    return raw ? (JSON.parse(raw) as Classroom[]) : []
  } catch { return [] }
}
function save(list: Classroom[]) {
  try { localStorage.setItem(CLASSROOMS_KEY, JSON.stringify(list)) } catch { /* quota */ }
}

/** Транслитерация: кириллица → латиница */
const CYR_MAP: Record<string, string> = {
  а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'zh',з:'z',и:'i',й:'y',
  к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',
  х:'kh',ц:'ts',ч:'ch',ш:'sh',щ:'shch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya',
}
function transliterate(str: string): string {
  return str
    .toLowerCase()
    .split('')
    .map((c) => CYR_MAP[c] ?? (c.match(/[a-z0-9-]/) ? c : ''))
    .join('')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Генерация логина: masha-ivanova-3a */
function generateLogin(firstName: string, lastName: string, classSuffix: string): string {
  const base = transliterate(firstName) + '-' + transliterate(lastName)
  const suffix = transliterate(classSuffix.toLowerCase())
  return (base + (suffix ? '-' + suffix : '')).replace(/--+/g, '-')
}

/** Генерация 6-значного PIN */
function generatePin(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

/** Парсинг ФИО из блока текста (одна строка = один ученик) */
export function parseRoster(text: string, classSuffix: string): Student[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\s+/)
      const lastName  = parts[0] ?? 'Фамилия'
      const firstName = parts[1] ?? 'Имя'
      return {
        firstName,
        lastName,
        login: generateLogin(firstName, lastName, classSuffix),
        pin: generatePin(),
      }
    })
}

/** Создать класс и сохранить */
export function createClassroom(name: string, teacherId: string, students: Student[]): Classroom {
  const cls: Classroom = {
    id: `cls-${Date.now()}`,
    name,
    teacherId,
    students,
    createdAt: Date.now(),
  }
  const list = load()
  list.push(cls)
  save(list)
  return cls
}

export function getClassrooms(): Classroom[] { return load() }

export function deleteClassroom(id: string): void {
  save(load().filter((c) => c.id !== id))
}

/** Проверка пина при логине ученика (заглушка: пин в localStorage) */
export function checkPin(login: string, pin: string): boolean {
  const classrooms = load()
  for (const cls of classrooms) {
    const student = cls.students.find((s) => s.login === login)
    if (student && student.pin === pin) return true
  }
  return false
}
