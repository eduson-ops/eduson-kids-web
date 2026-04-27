/**
 * Application-wide constants
 * Centralized magic numbers for KubiK Eduson Kids web app.
 *
 * Goals:
 *   - Single source of truth for tunable values
 *   - Strict typing via `as const`
 *   - JSDoc on every constant explaining where it's used
 */

// ──────────────────────────────────────────────────────────────
// Simulation / world
// ──────────────────────────────────────────────────────────────

/**
 * Bounds of the player simulation grid (used in
 * `checkSolution.simulatePlayer` / `newSim` to detect when the
 * pingüin walks off the playable field).
 *
 * Coordinates are in grid cells, axis-aligned.
 */
export const SIM_BOUNDS = {
  MIN_X: -20,
  MAX_X: 20,
  MIN_Z: -20,
  MAX_Z: 20,
} as const

/**
 * Angle normalization range (degrees).
 *
 * `simulatePlayer` keeps `angleDeg` modulo `FULL_CIRCLE` and
 * normalizes back into `[MIN, MAX]` so callers always see a
 * canonical signed angle.
 */
export const ANGLE_RANGE = {
  /** 360 — modulo for full rotation */
  FULL_CIRCLE: 360,
  /** 180 — half-circle threshold */
  HALF_CIRCLE: 180,
  /** Min allowed normalized angle (inclusive) */
  MIN: -180,
  /** Max allowed normalized angle (inclusive) */
  MAX: 180,
} as const

/**
 * Default starting orientation for a fresh sim.
 * 0° = facing −Z (forward).
 */
export const SIM_DEFAULT_ANGLE = 0 as const

// ──────────────────────────────────────────────────────────────
// Adaptive quiz
// ──────────────────────────────────────────────────────────────

/**
 * Quiz difficulty levels (1 = easiest, 5 = hardest).
 * Used by `AdaptiveQuiz` to clamp level transitions.
 */
export const QUIZ_LEVELS = {
  MIN: 1,
  MAX: 5,
} as const

/** TS-level union of valid quiz levels — keep in sync with `QUIZ_LEVELS`. */
export type QuizLevel = 1 | 2 | 3 | 4 | 5

/**
 * Quiz tuning parameters.
 *  - START_LEVEL: where the runner spawns the player
 *  - WIN_LEVEL: minimum level required to register a "win"
 *  - WIN_STREAK: correct answers in a row to win
 *  - MAX_QUESTIONS: hard cap before lose-screen kicks in
 *  - HOT_STREAK: streak threshold to highlight HUD chip
 *  - LOSE_DELAY_MS: ms before flipping to lose phase after final feedback
 */
export const QUIZ_CONFIG = {
  START_LEVEL: 3,
  WIN_LEVEL: 3,
  WIN_STREAK: 5,
  MAX_QUESTIONS: 8,
  HOT_STREAK: 3,
  LOSE_DELAY_MS: 1500,
} as const

// ──────────────────────────────────────────────────────────────
// Python IDE
// ──────────────────────────────────────────────────────────────

/**
 * Maximum entries kept in the Python IDE run history.
 * Used by `PythonIDE` for both in-memory state and persisted
 * `localStorage` slice.
 */
export const HISTORY_LIMIT = 5 as const

// ──────────────────────────────────────────────────────────────
// Output / preview
// ──────────────────────────────────────────────────────────────

/**
 * Maximum stdout lines previewed inline in `checkOutputMatch`
 * error details before truncation with `…`.
 */
export const OUTPUT_PREVIEW_LIMIT = 6 as const

/**
 * Minimum number of function calls required by the
 * `uses-feature` check when `call3` is requested.
 */
export const USES_FEATURE_MIN_CALLS = 3 as const

// ──────────────────────────────────────────────────────────────
// TestTab / world runtime
// ──────────────────────────────────────────────────────────────

/** Degrees-to-radians multiplier (π/180). */
export const DEG_TO_RAD = Math.PI / 180

/** Frame rate used for obj_glide_to and live-mode command steps. */
export const ANIM_FPS = 30 as const

/** Interval (ms) between on_tick calls for scripted objects. */
export const TICK_INTERVAL_MS = 1000 as const

/** Minimum allowed object scale (obj_change_size clamp). */
export const SCALE_MIN = 0.1 as const

/** Maximum allowed object scale (obj_change_size clamp). */
export const SCALE_MAX = 10 as const

/** Command step (ms) in live/autorun mode — faster than COMMAND_STEP_MS. */
export const LIVE_STEP_MS = 30 as const
