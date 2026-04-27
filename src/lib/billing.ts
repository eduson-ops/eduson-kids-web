/**
 * Billing — учёт купленных/потраченных уроков и платежей.
 * MVP-stub: всё в localStorage, никаких реальных списаний.
 * В production поменяется на вызовы бэкенд-API (см. architecture/backend_v1.md).
 *
 * Тарифы:
 *   Free Trial           — 7 дней бесплатно, автоподключение подписки на 8-й день
 *   Monthly              — 5 937 ₽/мес, отмена в 1 клик
 *   Annual               — 49 900 ₽/год (−30%, экв. 4 158 ₽/мес)
 *   Family-2             — 8 937 ₽/мес (−25% vs 2× monthly)
 *   Family-3             — 11 937 ₽/мес (−33% vs 3× monthly)
 *   Installment-48       — 71 244 ₽ разово (12 мес × 5 937 через банк)
 *   Pack-10              — 9 900 ₽ разовая докупка
 */

const KEY = 'ek_billing_v1'

export type PurchaseKind =
  | 'installment-48'
  | 'subscription-monthly'
  | 'subscription-annual'
  | 'subscription-family-2'
  | 'subscription-family-3'
  | 'pack-10'

export interface Purchase {
  id: string
  kind: PurchaseKind
  amountRub: number
  lessons: number
  createdAt: number
}

export type SubscriptionPlan =
  | 'none'
  | 'trial'
  | 'monthly'
  | 'annual'
  | 'family-2'
  | 'family-3'

export interface Subscription {
  active: boolean
  plan: SubscriptionPlan
  pricePerMonthRub: number
  /** дата следующего списания (timestamp). null если не активна */
  nextChargeAt: number | null
  /** дата отмены (в законных 14 дн охлаждения или по cancel) */
  cancelledAt: number | null
  /** число детей в семейной подписке (1 для monthly/annual) */
  seats: number
  /** Когда закончится trial — если пользователь не отменит, списание */
  trialEndsAt: number | null
}

export interface BillingState {
  /** Уроков куплено всего (вечная сумма pluses) */
  lessonsPaid: number
  /** Уроков использовано (инкремент при markLessonDone) */
  lessonsUsed: number
  purchases: Purchase[]
  subscription: Subscription
  /** Реферальный код текущего пользователя (выдаётся автоматом) */
  referralCode: string
  /** Сколько людей пришло по моей ссылке и оплатили */
  referralConverts: number
  /** Сколько месяцев бесплатных бонусов накопил через рефералов */
  referralBonusMonths: number
}

function genReferralCode(): string {
  // Короткий 6-символьный код из имени/времени
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return code
}

const DEFAULT_STATE: BillingState = {
  lessonsPaid: 0,
  lessonsUsed: 0,
  purchases: [],
  subscription: {
    active: false,
    plan: 'none',
    pricePerMonthRub: 5937,
    nextChargeAt: null,
    cancelledAt: null,
    seats: 1,
    trialEndsAt: null,
  },
  referralCode: genReferralCode(),
  referralConverts: 0,
  referralBonusMonths: 0,
}

function load(): BillingState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT_STATE
    const parsed = JSON.parse(raw) as Partial<BillingState>
    const loadedSub = parsed.subscription ?? {}
    const s: BillingState = {
      ...DEFAULT_STATE,
      ...parsed,
      subscription: { ...DEFAULT_STATE.subscription, ...loadedSub } as Subscription,
    }
    // Lazy migration: если нет реферального кода — сгенерировать
    if (!s.referralCode) s.referralCode = genReferralCode()
    return s
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

// ─── Plans info ────────────────────────────────────────

export const PLAN_INFO: Record<Exclude<SubscriptionPlan, 'none'>, {
  label: string
  pricePerMonth: number
  totalRubIfYear?: number
  seats: number
  saving?: string
}> = {
  trial:     { label: 'Пробный — 7 дней', pricePerMonth: 0, seats: 1 },
  monthly:   { label: 'Месячная', pricePerMonth: 5937, seats: 1 },
  annual:    { label: 'Годовая', pricePerMonth: 4158, totalRubIfYear: 49900, seats: 1, saving: 'экономия 21 344 ₽/год' },
  'family-2':{ label: 'Семейная · 2 ребёнка', pricePerMonth: 8937, seats: 2, saving: '−25%' },
  'family-3':{ label: 'Семейная · 3 ребёнка', pricePerMonth: 11937, seats: 3, saving: '−33%' },
}

// ─── Purchases ─────────────────────────────────────────

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

/** 7-дневный бесплатный период. Карта не списывается до дня 8. */
export function startTrial(): void {
  const now = Date.now()
  const trialEnd = now + 7 * 24 * 3600_000
  state = {
    ...state,
    subscription: {
      active: true,
      plan: 'trial',
      pricePerMonthRub: 0,
      nextChargeAt: trialEnd,
      trialEndsAt: trialEnd,
      cancelledAt: null,
      seats: 1,
    },
  }
  save(state)
  emit()
}

/** Запуск платной подписки по конкретному плану. */
export function startSubscription(plan: Exclude<SubscriptionPlan, 'none' | 'trial'> = 'monthly'): void {
  const info = PLAN_INFO[plan]
  const periodMs = plan === 'annual' ? 365 * 24 * 3600_000 : 30 * 24 * 3600_000
  state = {
    ...state,
    subscription: {
      active: true,
      plan,
      pricePerMonthRub: info.pricePerMonth,
      nextChargeAt: Date.now() + periodMs,
      trialEndsAt: null,
      cancelledAt: null,
      seats: info.seats,
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
      plan: 'none',
      nextChargeAt: null,
      trialEndsAt: null,
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

/** Применить промокод — stub: поддерживает 'FRIEND14' (+14 дней), 'YEARSALE' (-40%). */
export function applyPromo(code: string): { ok: boolean; message: string } {
  const normalized = code.trim().toUpperCase()
  if (normalized === 'FRIEND14') {
    // Продлеваем trial на 14 дней, если активен
    if (state.subscription.plan === 'trial' && state.subscription.trialEndsAt) {
      const newEnd = state.subscription.trialEndsAt + 14 * 24 * 3600_000
      state = {
        ...state,
        subscription: { ...state.subscription, trialEndsAt: newEnd, nextChargeAt: newEnd },
      }
      save(state)
      emit()
      return { ok: true, message: '✓ +14 дней к пробному периоду' }
    }
    return { ok: false, message: 'Промокод работает только во время пробного периода' }
  }
  if (normalized === 'YEARSALE') {
    return { ok: false, message: 'Промокод применяется при оформлении годовой подписки' }
  }
  return { ok: false, message: 'Неизвестный промокод' }
}


/** Вызывается из progress.ts при завершении урока — списывает 1 урок из пакета. */
export function useLesson(): void {
  if (state.lessonsUsed >= state.lessonsPaid) return
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
