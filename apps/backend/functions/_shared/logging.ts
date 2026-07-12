/**
 * Structured JSON logging with a correlation id (TDD Part 1 §1.10 / §7.4; ADR-023).
 * NEVER logs PII, secrets, or PII-bearing prompts (ADR-031). One correlation id per
 * request threads logs → traces → the client's EVT_054.
 *
 * Pure module — Vitest-testable (inject the sink).
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogFields {
  correlation_id: string;
  fn: string;
  [k: string]: unknown;
}

export function newCorrelationId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `c-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createLogger(base: LogFields, sink: (line: string) => void = console.log) {
  const emit = (level: LogLevel, msg: string, fields?: Record<string, unknown>) =>
    sink(JSON.stringify({ level, msg, ts: new Date().toISOString(), ...base, ...fields }));
  return {
    debug: (m: string, f?: Record<string, unknown>) => emit('debug', m, f),
    info: (m: string, f?: Record<string, unknown>) => emit('info', m, f),
    warn: (m: string, f?: Record<string, unknown>) => emit('warn', m, f),
    error: (m: string, f?: Record<string, unknown>) => emit('error', m, f),
  };
}
export type Logger = ReturnType<typeof createLogger>;
