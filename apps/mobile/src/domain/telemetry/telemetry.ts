/**
 * Pure telemetry mapping (TDD Part 5 §7.1). No SDK, no I/O, no React — just the rules that turn
 * an arbitrary thrown value into the two things §7.1 asks for: an ERR_* code, and the EVT_054
 * client-error event that every ERR_* must produce.
 *
 * The emission half is NOT here. EVT_054 needs the pseudonymous envelope (user_pseudo_id, ts) and
 * a sink — the analytics adapter → `analytics_event` (ADR-013) — which is B4.2. This module builds
 * the event id and its props so the mapping is settled, tested, and identical whichever sink
 * eventually consumes it.
 */
import { ERROR_CODES, type ErrorCode } from '@panchangpal/shared';

/** PDD §11.1 taxonomy: client error. Every ERR_* surfaces as this event (§7.1). */
export const CLIENT_ERROR_EVENT_ID = 'EVT_054';

const KNOWN_CODES = new Set<string>(ERROR_CODES);

/** Whether a string is a code in the shared ERR_* taxonomy. */
export function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === 'string' && KNOWN_CODES.has(value);
}

/**
 * Resolve any thrown value to an ERR_* code.
 *
 * Three shapes reach this in practice: an Edge Function ErrorEnvelope surfaced by supabase-js as
 * `error.context.code` (the shape nine repositories already unwrap by hand), a bare `Error` whose
 * message is sometimes a code, and anything at all from a render crash. Unrecognised input is
 * ERR_UNKNOWN — never the raw message, because a message is free text and free text is where PII
 * gets in (§7.1 `[MANDATORY]` no PII).
 */
export function toErrorCode(value: unknown): ErrorCode {
  if (isErrorCode(value)) return value;

  const envelopeCode = (value as { context?: { code?: unknown } } | null | undefined)?.context?.code;
  if (isErrorCode(envelopeCode)) return envelopeCode;

  const directCode = (value as { code?: unknown } | null | undefined)?.code;
  if (isErrorCode(directCode)) return directCode;

  const message = (value as { message?: unknown } | null | undefined)?.message;
  if (isErrorCode(message)) return message;

  return 'ERR_UNKNOWN';
}

/**
 * The props half of an EVT_054 event. Closed shape: adding a field is a deliberate act.
 *
 * A type alias rather than an interface so it carries an implicit index signature and can be handed
 * straight to the analytics port's prop bag — an interface cannot, and the workaround would be a
 * spread or a cast at the call site, either of which would quietly permit a shape that is not this
 * one.
 */
export type ClientErrorEventProps = {
  code: ErrorCode;
  surface: string;
  recoverable: boolean;
  correlation_id?: string;
};

export interface ClientErrorEvent {
  event_id: typeof CLIENT_ERROR_EVENT_ID;
  props: ClientErrorEventProps;
}

/**
 * Build the EVT_054 event for a failure.
 *
 * `correlation_id` is included only when the server supplied one (ADR-022) — it is a server-minted
 * request id, not a user identifier. Nothing derived from user input is carried: no message, no
 * stack, no route params. If a future caller needs more context, add a named field here with a
 * reason, rather than widening props to `Record<string, unknown>`.
 */
export function toClientErrorEvent(input: {
  code: ErrorCode;
  surface: string;
  recoverable?: boolean;
  correlationId?: string | null;
}): ClientErrorEvent {
  return {
    event_id: CLIENT_ERROR_EVENT_ID,
    props: {
      code: input.code,
      surface: input.surface,
      recoverable: input.recoverable ?? false,
      ...(input.correlationId ? { correlation_id: input.correlationId } : {}),
    },
  };
}
