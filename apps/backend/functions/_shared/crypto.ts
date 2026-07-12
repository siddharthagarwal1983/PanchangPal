/**
 * HMAC signature verification (RevenueCat webhook, TDD Part 2 §5.6 / ADR-005) using
 * Web Crypto (available in Deno + modern Node). Constant-time compare to resist timing
 * attacks. Pure-ish (uses the standard `crypto.subtle`) — runnable under Vitest (Node 20).
 */
export async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Constant-time string compare. */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export async function verifyHmac(secret: string, payload: string, signature: string): Promise<boolean> {
  if (!secret || !signature) return false;
  const expected = await hmacSha256Hex(secret, payload);
  return timingSafeEqual(expected, signature.toLowerCase());
}
