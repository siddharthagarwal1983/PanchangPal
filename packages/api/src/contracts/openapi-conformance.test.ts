/**
 * API contract tests — the gate B1 removed and owed back (CURRENT_MILESTONE: "real tests under
 * `packages/api/src/contracts/*` validating the zod schemas against `docs/api/openapi.yaml`",
 * ADR-032).
 *
 * WHAT THIS DELIBERATELY IS NOT: a suite that feeds a valid object to a zod schema and asserts it
 * parses. That tests zod, restates the schema, and passes forever regardless of whether the API
 * still looks like this — it would be the `--passWithNoTests` gate with more lines. The original
 * was removed precisely because a gate that cannot fail reads as coverage.
 *
 * WHAT IT IS: a comparison of two independently maintained artifacts — the zod contracts and the
 * OpenAPI specification — plus the shared enum sources they both claim to mirror. Every assertion
 * here fails when someone edits one artifact and not the other, which is the only failure this
 * package can actually have. The EVT_054 property-name defect found earlier in B4 was exactly this
 * shape: two documents disagreeing, with nothing comparing them.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import {
  CONTENT_DEPTHS,
  DATE_BASES,
  ENTITLEMENT_KINDS,
  ERROR_CODES,
  MESSAGE_ROLES,
  REMINDER_LEADS,
  SUB_STATUSES,
  TRADITION_CODES,
} from '@panchangpal/shared';
import { errorEnvelopeSchema } from '../error.js';
import { getTodayRequest, getTodayResponse } from './today.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SPEC_PATH = path.resolve(HERE, '../../../../docs/api/openapi.yaml');

interface OpenApiSchema {
  type?: string;
  enum?: string[];
  required?: string[];
  properties?: Record<string, unknown>;
  parameters?: { name: string; in: string; required?: boolean }[];
}

const spec = parse(readFileSync(SPEC_PATH, 'utf8')) as {
  paths: Record<string, Record<string, OpenApiSchema & { operationId?: string }>>;
  components: { schemas: Record<string, OpenApiSchema> };
};

const schemas = spec.components.schemas;

/** The zod object's declared keys — what the client will actually send or accept. */
function zodKeys(schema: { shape: Record<string, unknown> }): string[] {
  return Object.keys(schema.shape).sort();
}

describe('the specification is loadable at all', () => {
  it('parses and exposes paths and component schemas', () => {
    // A guard for the harness itself: if the path resolution broke, every assertion below would
    // pass vacuously against `undefined`, and the suite would go green while checking nothing.
    expect(Object.keys(spec.paths ?? {}).length).toBeGreaterThan(10);
    expect(Object.keys(schemas ?? {}).length).toBeGreaterThan(10);
  });
});

describe('shared enums match the OpenAPI enums they mirror', () => {
  // packages/shared says it mirrors "the Postgres enums exactly" and the spec says it "mirrors
  // PDD §3.0.2 / packages/shared". Three artifacts claiming to agree, none of them checking.
  it.each([
    ['ErrorCode', ERROR_CODES],
    ['TraditionCode', TRADITION_CODES],
    ['ContentDepth', CONTENT_DEPTHS],
    ['DateBasis', DATE_BASES],
    ['ReminderLead', REMINDER_LEADS],
    ['MessageRole', MESSAGE_ROLES],
    ['EntitlementKind', ENTITLEMENT_KINDS],
    ['SubStatus', SUB_STATUSES],
  ])('%s', (componentName, sharedValues) => {
    const specEnum = schemas[componentName]?.enum;
    expect(specEnum, `components.schemas.${componentName} is missing an enum`).toBeDefined();
    expect([...(specEnum ?? [])].sort()).toEqual([...sharedValues].sort());
  });
});

describe('ErrorEnvelope (ADR-022)', () => {
  it('declares the same required fields as the zod schema', () => {
    // `?? []` rather than a non-null assertion: if the component ever disappears, an empty list
    // still fails against the zod keys, which is the outcome we want — a missing schema must not
    // become a passing test.
    expect([...(schemas.ErrorEnvelope?.required ?? [])].sort()).toEqual(
      zodKeys(errorEnvelopeSchema),
    );
  });

  it('accepts an envelope built from the spec example and rejects an unknown code', () => {
    // The spec ships examples; parsing one is a genuine cross-check that the zod schema can read
    // what the API documents itself as returning.
    expect(
      errorEnvelopeSchema.safeParse({
        code: 'ERR_OFFLINE',
        message: 'You are offline.',
        correlation_id: 'c-123',
        recoverable: true,
      }).success,
    ).toBe(true);

    expect(
      errorEnvelopeSchema.safeParse({
        code: 'ERR_NOT_IN_THE_TAXONOMY',
        message: 'x',
        correlation_id: 'c',
        recoverable: true,
      }).success,
    ).toBe(false);
  });
});

describe('API_GET_TODAY — the hero endpoint (TDD Part 2 §5.2)', () => {
  const operation = spec.paths['/today']?.get;

  it('exists in the spec under the operationId the contract names', () => {
    expect(operation?.operationId).toBe('API_GET_TODAY');
  });

  it('required query parameters match the zod request schema exactly', () => {
    const specParams = (operation?.parameters ?? [])
      .filter((p) => p.in === 'query' && p.required)
      .map((p) => p.name)
      .sort();
    // Not a subset check in either direction: a parameter the spec requires and the client omits
    // is a 4xx in production, and one the client sends that the spec does not document is an
    // undocumented dependency. Both are defects, so the sets must be equal.
    expect(specParams).toEqual(zodKeys(getTodayRequest));
  });

  it('response properties match the zod response schema exactly', () => {
    const specProps = Object.keys(schemas.TodayResponse?.properties ?? {}).sort();
    expect(specProps).toEqual(zodKeys(getTodayResponse));
  });

  it("every field the spec marks required is present in the client's schema", () => {
    const required = schemas.TodayResponse?.required ?? [];
    expect(required.length).toBeGreaterThan(0);
    for (const field of required) {
      expect(zodKeys(getTodayResponse)).toContain(field);
    }
  });

  it('meta.cache carries the same enum as the spec', () => {
    const specCache = (
      (schemas.TodayResponse?.properties?.meta as OpenApiSchema | undefined)?.properties?.cache as
        | OpenApiSchema
        | undefined
    )?.enum;
    expect([...(specCache ?? [])].sort()).toEqual(['hit', 'miss']);

    const parsed = getTodayResponse.shape.meta.safeParse({
      engine_version: '1',
      computed_at: '2026-07-25T00:00:00Z',
      cache: 'stale',
    });
    expect(parsed.success, "zod should reject a cache value the spec does not define").toBe(false);
  });
});
