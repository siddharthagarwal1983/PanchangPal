/**
 * ERR_* error taxonomy — the single source consumed by DB, API, and client
 * (PDD §3.0.2 / §3.0A.3; TDD Part 1 §7.4, ADR-022). Never diverge these values
 * across layers. The user-facing copy for each code lives in PDD §13.5.
 */
export const ERROR_CODES = [
    'ERR_AI_ERROR',
    'ERR_AI_TIMEOUT',
    'ERR_AUDIO_UNAVAILABLE',
    'ERR_AUTH_EXPIRED',
    'ERR_AUTH_FAILED',
    'ERR_AUTH_MERGE_CONFLICT',
    'ERR_CALENDAR_ERROR',
    'ERR_FESTIVAL_CONFLICT',
    'ERR_GPS_DISABLED',
    'ERR_INVITE_EXPIRED',
    'ERR_LOCATION_DENIED',
    'ERR_NETWORK_TIMEOUT',
    'ERR_NOTIF_DENIED',
    'ERR_OFFLINE',
    'ERR_PANCHANG_UNAVAILABLE',
    'ERR_PAYMENT_FAILED',
    'ERR_POOR_NETWORK',
    'ERR_RAG_EMPTY',
    'ERR_RAG_LOW_CONFIDENCE',
    'ERR_SUBSCRIPTION_INVALID',
    'ERR_SYNC_CONFLICT',
    'ERR_TITHI_AMBIGUOUS',
    'ERR_UNKNOWN',
];
//# sourceMappingURL=errors.js.map