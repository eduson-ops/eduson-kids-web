/**
 * Common TypeScript types for KubiK Eduson Kids web frontend.
 *
 * Centralized barrel of type definitions that are used across
 * multiple files. Types specific to a single module remain in
 * their original location.
 *
 * Strategy:
 *   - Source-of-truth types defined here (Question, Topic) are NEW canonical shapes.
 *   - Types that already had a canonical home (RawCommand,
 *     CheckResult, DeviceTier) are re-exported here so callers
 *     can `import { ... } from 'lib/types'` without breaking
 *     existing imports.
 *
 * Backward-compat: every original `export` from the source
 * module is preserved; this file only adds an additional
 * import path.
 */

// ───────────────────────────────────────────────────────────
// Re-exports from canonical homes (single source-of-truth)
// ───────────────────────────────────────────────────────────

/**
 * Raw command emitted by Pyodide (Python world runtime).
 * Each command has a discriminator `op` plus arbitrary payload fields.
 * @see lib/checkSolution.ts (canonical definition)
 */
export type { RawCommand } from './checkSolution'

/**
 * Result of running a learner's solution against a PuzzleTask check.
 * Contains pass/fail, message, optional partial score and raw commands
 * for preview rendering.
 * @see lib/checkSolution.ts (canonical definition)
 */
export type { CheckResult } from './checkSolution'

/**
 * Device-capability tier used to gate post-processing, shadow map
 * size, physics timestep and starting DPR.
 *   - 'low'    — ≤ 2 GB RAM or ≤ 2 cores or narrow mobile
 *   - 'medium' — default fallback
 *   - 'high'   — desktop with ≥ 8 GB RAM and ≥ 8 cores
 * @see lib/deviceTier.ts (canonical definition)
 */
export type { DeviceTier } from './deviceTier'

/**
 * Quiz question shape used by curriculum lesson decks.
 * MCQ with single correct option.
 * @see lib/curriculum.ts (canonical definition)
 */
export type { QuizQuestion } from './curriculum'

// ───────────────────────────────────────────────────────────
// New canonical shapes (introduced by R2 refactor)
// ───────────────────────────────────────────────────────────

/**
 * Generic MCQ question used by the adaptive trainer / quizzes.
 * `level` follows a 1..5 difficulty ladder so the adaptive engine
 * can step up or down on right/wrong answers.
 */
export interface Question {
  /** Stable id (`pb1`, `loop3`, …). Used for streak-tracking. */
  id: string
  /** Difficulty level 1..5 (used by adaptive ladder). */
  level: 1 | 2 | 3 | 4 | 5
  /** Question text shown to the learner. */
  text: string
  /** Multiple-choice options (typically 4). */
  options: string[]
  /** Index of the correct option in `options`. */
  correct: number
  /** Short explanation shown after the attempt. */
  explanation: string
}

/**
 * Quiz topic — a bag of questions plus presentation metadata.
 * `questions` is the canonical field; legacy code may still use a
 * different shape locally (e.g. `bank: Question[]` in AdaptiveQuiz),
 * which remains supported via its own local interface.
 */
export interface Topic {
  /** Stable topic id (used in URL `?topic=` and analytics). */
  id: string
  /** Human-readable title. */
  title: string
  /** Optional short description for picker UI. */
  description?: string
  /** Optional emoji for visual badge. */
  emoji?: string
  /** Bank of questions of any level. */
  questions: Question[]
}

