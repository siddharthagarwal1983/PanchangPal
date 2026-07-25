/**
 * Telemetry mapping + the Null adapter's contract (TDD Part 5 §7.1).
 *
 * The load-bearing assertion here is the no-PII one. §7.1 is `[MANDATORY]` about it, and the
 * cheapest way for user content to reach a crash reporter is an error message forwarded verbatim —
 * "supabaseUrl is required" is harmless, an Ask Guru question quoted back inside a validation
 * error is not. `toErrorCode` therefore returns ERR_UNKNOWN for unrecognised input rather than the
 * message, and EVT_054's props are a closed shape with no free-text field at all.
 */
import {
  CLIENT_ERROR_EVENT_ID,
  NullTelemetryAdapter,
  isErrorCode,
  toClientErrorEvent,
  toErrorCode,
} from '../telemetry';

describe('toErrorCode', () => {
  it('passes through a code from the shared ERR_* taxonomy', () => {
    expect(toErrorCode('ERR_OFFLINE')).toBe('ERR_OFFLINE');
  });

  it('unwraps the supabase-js error envelope shape the repositories already unwrap by hand', () => {
    expect(toErrorCode({ context: { code: 'ERR_AUTH_EXPIRED' } })).toBe('ERR_AUTH_EXPIRED');
  });

  it('reads a direct code property', () => {
    expect(toErrorCode({ code: 'ERR_PAYMENT_FAILED' })).toBe('ERR_PAYMENT_FAILED');
  });

  it('reads an Error whose message is itself a code', () => {
    expect(toErrorCode(new Error('ERR_SYNC_CONFLICT'))).toBe('ERR_SYNC_CONFLICT');
  });

  it.each([
    ['a free-text message', new Error('user@example.com could not be found')],
    ['an unknown code string', 'ERR_NOT_IN_THE_TAXONOMY'],
    ['null', null],
    ['undefined', undefined],
    ['a number', 42],
    ['an empty object', {}],
  ])('returns ERR_UNKNOWN for %s rather than echoing it', (_label, input) => {
    expect(toErrorCode(input)).toBe('ERR_UNKNOWN');
  });

  it('never leaks a free-text message into the returned value', () => {
    const secret = "my question about my mother's health";
    expect(toErrorCode(new Error(secret))).not.toContain('mother');
  });
});

describe('isErrorCode', () => {
  it('accepts taxonomy members and rejects everything else', () => {
    expect(isErrorCode('ERR_UNKNOWN')).toBe(true);
    expect(isErrorCode('ERR_MADE_UP')).toBe(false);
    expect(isErrorCode(undefined)).toBe(false);
  });
});

describe('toClientErrorEvent', () => {
  it('maps a failure to EVT_054 (§7.1: every ERR_* → EVT_054)', () => {
    const event = toClientErrorEvent({ code: 'ERR_OFFLINE', surface: 'error-boundary' });
    expect(event.event_id).toBe(CLIENT_ERROR_EVENT_ID);
    expect(event.event_id).toBe('EVT_054');
    // Property names are PDD §11.2's, not ours: `error_code` and `screen_id`.
    expect(event.props.error_code).toBe('ERR_OFFLINE');
    expect(event.props.screen_id).toBe('error-boundary');
  });

  it('defaults recoverable to false rather than assuming a retry will work', () => {
    expect(toClientErrorEvent({ code: 'ERR_UNKNOWN', surface: 'manual' }).props.recoverable).toBe(
      false,
    );
  });

  it('includes correlation_id only when the server supplied one', () => {
    const withId = toClientErrorEvent({
      code: 'ERR_AI_TIMEOUT',
      surface: 'query',
      correlationId: 'corr-123',
    });
    expect(withId.props.correlation_id).toBe('corr-123');

    const withoutId = toClientErrorEvent({ code: 'ERR_AI_TIMEOUT', surface: 'query' });
    expect(withoutId.props).not.toHaveProperty('correlation_id');

    const withNull = toClientErrorEvent({
      code: 'ERR_AI_TIMEOUT',
      surface: 'query',
      correlationId: null,
    });
    expect(withNull.props).not.toHaveProperty('correlation_id');
  });

  it('emits only the four sanctioned prop keys — no message, stack, or route params', () => {
    const event = toClientErrorEvent({
      code: 'ERR_NETWORK_TIMEOUT',
      surface: 'global-handler',
      recoverable: true,
      correlationId: 'corr-9',
    });
    expect(Object.keys(event.props).sort()).toEqual([
      'correlation_id',
      'error_code',
      'recoverable',
      'screen_id',
    ]);
  });
});

describe('NullTelemetryAdapter', () => {
  it('accepts every port call without throwing', () => {
    // The adapter warns in development on purpose (a dropped report should be visible to whoever
    // is running the app); silence it here so the suite's own output stays readable.
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const adapter = new NullTelemetryAdapter();
    expect(() => {
      adapter.captureError({ code: 'ERR_UNKNOWN', surface: 'manual' }, new Error('boom'));
      adapter.addBreadcrumb({ category: 'navigation', message: 'today' });
      adapter.setUserPseudoId('pseudo-1');
      adapter.setUserPseudoId(null);
    }).not.toThrow();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
