/**
 * Error handling for Edge Functions (ADR-022 / TDD Part 1 §7.4). Every failure maps
 * to an ERR_* code and returns the uniform envelope { code, message, correlation_id,
 * recoverable }. Raw stack traces / model text are NEVER leaked (ADR-030).
 *
 * Pure module (no Deno globals) — Vitest-testable.
 */
import type { ErrorCode } from '@panchangpal/shared';

export interface ErrorEnvelope {
  code: ErrorCode;
  message: string;
  correlation_id: string;
  recoverable: boolean;
}

export class AppError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly recoverable = true,
    readonly httpStatus = 400,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/** Map an AppError (or unknown) to the wire envelope. Unknown → ERR_UNKNOWN, no internals leaked. */
export function toEnvelope(err: unknown, correlationId: string): ErrorEnvelope {
  if (err instanceof AppError) {
    return {
      code: err.code,
      message: err.message,
      correlation_id: correlationId,
      recoverable: err.recoverable,
    };
  }
  return {
    code: 'ERR_UNKNOWN',
    message: 'Something went wrong. Please try again.',
    correlation_id: correlationId,
    recoverable: true,
  };
}

export function httpStatusFor(err: unknown): number {
  return err instanceof AppError ? err.httpStatus : 500;
}
