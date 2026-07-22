// =========================================================================
// AI containment feature flag (Phase 1A — PF-001 / PF-002).
// Fail-closed: AI provider calls (OpenAI / Anthropic) are DISABLED unless the
// AI_FEATURES_ENABLED environment variable is explicitly set to "true".
//
// This exists so that external processing of minors' data cannot happen until
// runtime consent/assent enforcement is implemented. It is a server-side kill
// switch — a client-side UI flag is not sufficient.
//
// Pure module (no Deno/Node APIs) so it is unit-testable under vitest and
// importable from Deno edge functions alike.
// =========================================================================

/**
 * Parse the AI_FEATURES_ENABLED flag value. FAIL-CLOSED by design:
 *   - missing / null / undefined  → false
 *   - empty / whitespace          → false
 *   - "false" / anything else      → false
 *   - only the exact token "true" (case-insensitive, trimmed) → true
 *
 * NEVER use Boolean(value) truthiness here: Boolean("false") === true would
 * fail OPEN and send student data to a third-party AI provider.
 */
export function parseAiEnabled(raw: string | null | undefined): boolean {
  if (typeof raw !== "string") return false;
  return raw.trim().toLowerCase() === "true";
}

/**
 * Stable JSON body returned when AI is disabled. Contains no environment or
 * configuration details — only a safe, user-facing message.
 */
export const AI_DISABLED_BODY = {
  error: "AI features are currently disabled.",
} as const;

/**
 * HTTP status for the disabled state. 503 Service Unavailable communicates a
 * deliberate, temporary "feature off" condition (distinct from 401 auth / 500
 * error) without leaking why.
 */
export const AI_DISABLED_STATUS = 503;
