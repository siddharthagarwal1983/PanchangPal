import { z } from 'zod';
import { TRADITION_CODES } from '@panchangpal/shared';

/**
 * API_GET_TODAY — hero endpoint contract (TDD Part 2 §5.2; OpenAPI operationId
 * API_GET_TODAY). Deterministic + cacheable (ADR-010). This is the reference
 * implementation showing how §5 contracts are expressed as zod; the remaining
 * API_* contracts follow the same pattern and are generated from docs/api/openapi.yaml
 * (F-8 backend-owned).
 */
export const getTodayRequest = z.object({
  lat: z.number(),
  lng: z.number(),
  tz: z.string(), // IANA tz (ADR-026)
  tradition: z.enum(TRADITION_CODES),
  local_date: z.string(), // YYYY-MM-DD
});
export type GetTodayRequest = z.infer<typeof getTodayRequest>;

const muhurta = z.object({ name: z.string(), state: z.string(), label: z.string() });

export const panchangSchema = z.object({
  tithi: z.string(),
  nakshatra: z.string(),
  yoga: z.string(),
  karana: z.string(),
  sunrise: z.string(),
  sunset: z.string(),
  muhurta: z.array(muhurta),
  rahu_kaal: z.string(),
});

export const ritualStepSchema = z.object({
  text: z.string(),
  audio_key: z.string().optional(),
  duration: z.number().int().positive().optional(),
});

export const getTodayResponse = z.object({
  panchang: panchangSchema,
  ritual: z.object({
    id: z.string().uuid(),
    title: z.string(),
    intro: z.string().optional(),
    steps: z.array(ritualStepSchema).min(1),
    audio_key: z.string().optional(),
    depth: z.enum(['quick', 'deep']),
  }),
  festival: z
    .object({ id: z.string().uuid(), name: z.string(), significance: z.string() })
    .nullable(),
  rotating: z.object({ type: z.enum(['quote', 'fact', 'on_this_day']), text: z.string() }),
  streak: z.object({ current_len: z.number().int(), grace_remaining: z.number().int() }),
  meta: z.object({
    engine_version: z.string(),
    computed_at: z.string(),
    cache: z.enum(['hit', 'miss']),
  }),
});
export type GetTodayResponse = z.infer<typeof getTodayResponse>;
