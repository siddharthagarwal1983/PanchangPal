import type { SupabaseClient } from '@supabase/supabase-js';
import type { ContentDepth, TraditionCode } from '@panchangpal/shared';
import { getSupabase } from './supabaseClient';
import type { RitualDefinition, RitualStep } from '../domain/ritual';

interface RitualRow { id: string; title: string; intro: string | null; steps: unknown; depth: ContentDepth; }

/** API_GET_RITUAL gateway. Data access remains below the domain/player layers. */
export class RitualRepository {
  private _db?: SupabaseClient;

  // Lazy client, matching AuthRepository. `getSupabase()` as a DEFAULT PARAMETER runs when
  // the module-level singleton below is constructed — i.e. at import — so importing this
  // module anywhere without configuration threw "supabaseUrl is required." before a single
  // line of test or screen code ran. Resolve on first actual use instead.
  constructor(db?: SupabaseClient) {
    this._db = db;
  }

  private get db(): SupabaseClient {
    return (this._db ??= getSupabase());
  }

  /**
   * Today's ritual, or `null` when none is published for this tradition/depth.
   *
   * Absence is NOT an error. This previously threw ERR_RITUAL_EMPTY for a missing row, so
   * "no ritual exists yet" reached the UI as a failed query — the screen showed "Something
   * went wrong" for the ordinary state of having no content, and its empty state could
   * never render. Only a genuine query failure throws now.
   */
  async getToday(tradition: TraditionCode, depth: ContentDepth): Promise<RitualDefinition | null> {
    const { data, error } = await this.db
      .from('ritual')
      .select('id,title,intro,steps,depth')
      .eq('tradition_code', tradition)
      .eq('depth', depth)
      .limit(1)
      .maybeSingle();
    if (error) throw new Error('ERR_RITUAL_UNAVAILABLE');
    if (!data) return null;
    return toRitualDefinition(data as RitualRow);
  }
}

/** `null` when the row carries no usable steps — unplayable content is empty, not broken. */
export function toRitualDefinition(row: RitualRow): RitualDefinition | null {
  const steps = parseSteps(row.steps);
  if (steps.length === 0) return null;
  return { id: row.id, title: row.title, intro: row.intro ?? undefined, depth: row.depth, steps };
}

function parseSteps(value: unknown): RitualStep[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const row = item as { text?: unknown; audio_key?: unknown; duration?: unknown };
    if (typeof row.text !== 'string' || row.text.trim().length === 0) return [];
    return [{ text: row.text, audioKey: typeof row.audio_key === 'string' ? row.audio_key : undefined, durationSeconds: typeof row.duration === 'number' ? row.duration : undefined }];
  });
}

export const ritualRepository = new RitualRepository();
