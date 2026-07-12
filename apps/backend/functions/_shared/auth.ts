/**
 * Auth + the handler boundary. Every call carries a Supabase JWT (anonymous or
 * authenticated, ADR-009); service operations validate the JWT then act with the
 * service role (TDD Part 2 §5.0/§4). withHandler wraps a function body with CORS,
 * correlation id, structured logging, and uniform ERR_* error mapping (ADR-022).
 */
import { AppError } from './errors.ts';
import { errorResponse, preflight } from './http.ts';
import { createLogger, newCorrelationId, type Logger } from './logging.ts';

export interface RequestContext {
  correlationId: string;
  log: Logger;
  jwt: string;
}

/** Extract a bearer JWT from the Authorization header; throws ERR_AUTH_EXPIRED if absent. */
export function extractJwt(req: Request): string {
  const auth = req.headers.get('authorization') ?? '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) throw new AppError('ERR_AUTH_EXPIRED', 'Sign-in required.', true, 401);
  return m[1];
}

/**
 * Wrap a handler with cross-cutting concerns. `requireAuth` (default true) enforces a JWT.
 */
export function withHandler(
  fn: string,
  handler: (req: Request, ctx: RequestContext) => Promise<Response>,
  opts: { requireAuth?: boolean } = {},
): (req: Request) => Promise<Response> {
  const requireAuth = opts.requireAuth ?? true;
  return async (req: Request) => {
    if (req.method === 'OPTIONS') return preflight();
    const correlationId = req.headers.get('x-correlation-id') ?? newCorrelationId();
    const log = createLogger({ correlation_id: correlationId, fn });
    try {
      const jwt = requireAuth ? extractJwt(req) : '';
      return await handler(req, { correlationId, log, jwt });
    } catch (err) {
      log.error('handler_error', { error_code: err instanceof AppError ? err.code : 'ERR_UNKNOWN' });
      return errorResponse(err, correlationId);
    }
  };
}
