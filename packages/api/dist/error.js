import { z } from 'zod';
import { ERROR_CODES } from '@panchangpal/shared';
/** zod schema for the uniform error envelope (ADR-022 / TDD Part 1 §7.4). */
export const errorEnvelopeSchema = z.object({
    code: z.enum(ERROR_CODES),
    message: z.string(),
    correlation_id: z.string(),
    recoverable: z.boolean(),
});
/**
 * Optional API version header (ADR-032). Backend supports current + previous minor
 * (N and N-1); omitting it selects the current version.
 */
export const API_VERSION_HEADER = 'X-PanchangPal-API-Version';
//# sourceMappingURL=error.js.map