/**
 * Server-side error telemetry mapping (TDD Part 5 §7.1).
 *
 * The assertion that matters is the same one the client's suite makes: an error's message never
 * reaches telemetry. On the server that risk is sharper — an unknown error here is usually a
 * library's, and a Postgres or fetch failure will happily put a query, a row, or a URL with a token
 * in its message. The report carries the ERR_* code and the correlation id, which is enough to find
 * the structured log line that holds the safe detail.
 */
import { describe, expect, it } from 'vitest';
import { AppError } from './errors.ts';
import {
  NullServerTelemetry,
  describeServerTelemetry,
  toServerErrorReport,
} from './telemetry.ts';

const CTX = { fn: 'ask-guru', correlationId: 'corr-1' };

describe('toServerErrorReport', () => {
  it('carries the AppError code, function, correlation id and recoverability', () => {
    const err = new AppError('ERR_RAG_LOW_CONFIDENCE', 'Not confident enough.', true, 422);
    expect(toServerErrorReport(err, CTX)).toEqual({
      code: 'ERR_RAG_LOW_CONFIDENCE',
      fn: 'ask-guru',
      correlation_id: 'corr-1',
      recoverable: true,
    });
  });

  it('preserves recoverable: false', () => {
    const err = new AppError('ERR_SUBSCRIPTION_INVALID', 'Invalid.', false, 402);
    expect(toServerErrorReport(err, CTX).recoverable).toBe(false);
  });

  it('maps an unknown error to ERR_UNKNOWN', () => {
    expect(toServerErrorReport(new Error('boom'), CTX).code).toBe('ERR_UNKNOWN');
    expect(toServerErrorReport('a string', CTX).code).toBe('ERR_UNKNOWN');
    expect(toServerErrorReport(null, CTX).code).toBe('ERR_UNKNOWN');
  });

  it('never carries an error message — not even from an AppError', () => {
    const leaky = new Error('select * from app_user where email = someone@example.com');
    const report = toServerErrorReport(leaky, CTX);

    expect(Object.keys(report).sort()).toEqual(['code', 'correlation_id', 'fn', 'recoverable']);
    expect(JSON.stringify(report)).not.toContain('example.com');
    expect(JSON.stringify(report)).not.toContain('app_user');
  });
});

describe('describeServerTelemetry', () => {
  it("reports 'none' and stays quiet when no DSN is configured — the deferral is expected", () => {
    expect(describeServerTelemetry(undefined)).toEqual({ backend: 'none' });
    expect(describeServerTelemetry('')).toEqual({ backend: 'none' });
  });

  it('warns when a DSN is configured but no client can consume it', () => {
    const status = describeServerTelemetry('https://public@o0.ingest.sentry.io/0');
    expect(status.backend).toBe('none');
    expect(status.warning).toMatch(/NOT.*reported/);
  });
});

describe('NullServerTelemetry', () => {
  it('accepts a report without throwing', () => {
    const telemetry = new NullServerTelemetry();
    expect(() =>
      telemetry.captureError(toServerErrorReport(new Error('x'), CTX), new Error('x')),
    ).not.toThrow();
  });
});
