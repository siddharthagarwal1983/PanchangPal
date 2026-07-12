import { z } from 'zod';
/** zod schema for the uniform error envelope (ADR-022 / TDD Part 1 §7.4). */
export declare const errorEnvelopeSchema: z.ZodObject<{
    code: z.ZodEnum<["ERR_AI_ERROR", "ERR_AI_TIMEOUT", "ERR_AUDIO_UNAVAILABLE", "ERR_AUTH_EXPIRED", "ERR_AUTH_FAILED", "ERR_AUTH_MERGE_CONFLICT", "ERR_CALENDAR_ERROR", "ERR_FESTIVAL_CONFLICT", "ERR_GPS_DISABLED", "ERR_INVITE_EXPIRED", "ERR_LOCATION_DENIED", "ERR_NETWORK_TIMEOUT", "ERR_NOTIF_DENIED", "ERR_OFFLINE", "ERR_PANCHANG_UNAVAILABLE", "ERR_PAYMENT_FAILED", "ERR_POOR_NETWORK", "ERR_RAG_EMPTY", "ERR_RAG_LOW_CONFIDENCE", "ERR_SUBSCRIPTION_INVALID", "ERR_SYNC_CONFLICT", "ERR_TITHI_AMBIGUOUS", "ERR_UNKNOWN"]>;
    message: z.ZodString;
    correlation_id: z.ZodString;
    recoverable: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    code: "ERR_AI_ERROR" | "ERR_AI_TIMEOUT" | "ERR_AUDIO_UNAVAILABLE" | "ERR_AUTH_EXPIRED" | "ERR_AUTH_FAILED" | "ERR_AUTH_MERGE_CONFLICT" | "ERR_CALENDAR_ERROR" | "ERR_FESTIVAL_CONFLICT" | "ERR_GPS_DISABLED" | "ERR_INVITE_EXPIRED" | "ERR_LOCATION_DENIED" | "ERR_NETWORK_TIMEOUT" | "ERR_NOTIF_DENIED" | "ERR_OFFLINE" | "ERR_PANCHANG_UNAVAILABLE" | "ERR_PAYMENT_FAILED" | "ERR_POOR_NETWORK" | "ERR_RAG_EMPTY" | "ERR_RAG_LOW_CONFIDENCE" | "ERR_SUBSCRIPTION_INVALID" | "ERR_SYNC_CONFLICT" | "ERR_TITHI_AMBIGUOUS" | "ERR_UNKNOWN";
    message: string;
    correlation_id: string;
    recoverable: boolean;
}, {
    code: "ERR_AI_ERROR" | "ERR_AI_TIMEOUT" | "ERR_AUDIO_UNAVAILABLE" | "ERR_AUTH_EXPIRED" | "ERR_AUTH_FAILED" | "ERR_AUTH_MERGE_CONFLICT" | "ERR_CALENDAR_ERROR" | "ERR_FESTIVAL_CONFLICT" | "ERR_GPS_DISABLED" | "ERR_INVITE_EXPIRED" | "ERR_LOCATION_DENIED" | "ERR_NETWORK_TIMEOUT" | "ERR_NOTIF_DENIED" | "ERR_OFFLINE" | "ERR_PANCHANG_UNAVAILABLE" | "ERR_PAYMENT_FAILED" | "ERR_POOR_NETWORK" | "ERR_RAG_EMPTY" | "ERR_RAG_LOW_CONFIDENCE" | "ERR_SUBSCRIPTION_INVALID" | "ERR_SYNC_CONFLICT" | "ERR_TITHI_AMBIGUOUS" | "ERR_UNKNOWN";
    message: string;
    correlation_id: string;
    recoverable: boolean;
}>;
export type ErrorEnvelopeDto = z.infer<typeof errorEnvelopeSchema>;
/**
 * Optional API version header (ADR-032). Backend supports current + previous minor
 * (N and N-1); omitting it selects the current version.
 */
export declare const API_VERSION_HEADER = "X-PanchangPal-API-Version";
//# sourceMappingURL=error.d.ts.map