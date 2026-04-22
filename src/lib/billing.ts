/**
 * Billing — учёт купленных/потраченных уроков и платежей.
 * MVP-stub: всё в localStorage, никаких реальных списаний.
 * В production поменяется на вызовы бэкенд-API (см. architecture/backend_v1.md).
 */

const KEY = 'ek_billing_v1'

export interface Purchase {
  id: string
  kind: 'installment-48' | 'subscription' | 'pack-10'
  amountRub: number
  lessons: number
  createdAt: number
}

export interface Subscription {
  active: boolean
  pricePerMonthRub: number
  /** дата следующего списания (timestamp). null если не активна */
  nextChargeAt: number | null
  /** дата отмены (в законных 14 дн охлаждения или по cancel) */
  cancelledAt: number | null
}

export interface BillingState {
  /** Уроков куплено всего (вечная сумма pluses) */
  lessonsPaid: number
  /** Уроков использовано (инкремент при markLessonDone) */
  lessonsUsed: number
  purchases: Purchase[]
  subscription: Subscription
}

const DEFAULT_STATE: BillingState = {
  lessonsPaid: 0,
  lessonsUsed: 0,
  purchases: [],
  subscription: {
    active: false,
    pricePerMonthRub: 5937,
    nextChargeAt: null,
    cancelledAt: null,
  },
}

function load(): BillingState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT_STATE
    const parsed = JSON.parse(raw) as BillingState
    return { ...DEFAULT_STATE, ...parsed, subscription: { ...DEFAULT_STATE.subscription, ...parsed.subscription } }
  } catch {
    return DEFAULT_STATE
  }
}
function save(s: BillingState) {
  try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* quota */ }
}

const listeners = new Set<() => void>()
function emit() { for (const l of listeners) l() }
export function subscribeBilling(l: () => void): () => void {
  listeners.add(l)
  return () => { listeners.delete(l) }
}

let state: BillingState = load()

export function getBilling(): BillingState { return state }

/** Рассрочка 48 уроков за 71 244 ₽ (через банк, разовое зачисление). */
export function buyInstallment48(): Purchase {
  const p: Purchase = {
    id: `p-${Date.now()}`,
    kind: 'installment-48',
    amountRub: 71244,
    lessons: 48,
    createdAt: Date.now(),
  }
  state = {
    ...state,
    lessonsPaid: state.lessonsPaid + 48,
    purchases: [p, ...state.purchases],
  }
  save(state)
  emit()
  return p
}

/** Подписка с авто-списанием 5937 ₽/мес (закон 14-дневное право отказа + cancel в 1 клик). */
export function startSubscription(): void {
  const nextMonth = Date.now() + 30 * 24 * 3600_000
  state = {
    ...state,
    subscription: {
      active: true,
      pricePerMonthRub: 5937,
      nextChargeAt: nextMonth,
      cancelledAt: null,
    },
  }
  save(state)
  emit()
}

/** Отмена подписки — по 152-ФЗ / ЗоЗПП не требует объяснений, 1 клик. */
export function cancelSubscription(): void {
  state = {
    ...state,
    subscription: {
      ...state.subscription,
      active: false,
      nextChargeAt: null,
      cancelledAt: Date.now(),
    },
  }
  save(state)
  emit()
}

/** Дополнительный пак на 10 уроков (9 900 ₽). */
export function buyPack10(): Purchase {
  const p: Purchase = {
    id: `p-${Date.now()}`,
    kind: 'pack-10',
    amountRub: 9900,
    lessons: 10,
    createdAt: Date.now(),
  }
  state = {
    ...state,
    lessonsPaid: state.lessonsPaid + 10,
    purchases: [p, ...state.purchases],
  }
  save(state)
  emit()
  return p
}

/** Вызывается из progress.ts при завершении урока — списывает 1 урок из пакета. */
export function useLesson(): void {
  if (state.lessonsUsed >= state.lessonsPaid) return   // нет оплаченных — не списываем
  state = { ...state, lessonsUsed: state.lessonsUsed + 1 }
  save(state)
  emit()
}

export function lessonsRemaining(): number {
  return Math.max(0, state.lessonsPaid - state.lessonsUsed)
}

export function formatRub(n: number): string {
  return n.toLocaleString('ru-RU') + ' ₽'
}
