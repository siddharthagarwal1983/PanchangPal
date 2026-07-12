import type { SupabaseClient } from '@supabase/supabase-js';
import type { ContentDepth, TraditionCode } from '@panchangpal/shared';
import { getSupabase } from './supabaseClient';
import type { RitualDefinition, RitualStep } from '../domain/ritual';

interface RitualRow { id: string; title: string; intro: string | null; steps: unknown; depth: ContentDepth; }

/** API_GET_RITUAL gateway. Data access remains below the domain/player layers. */
export class RitualRepository {
  constructor(private readonly db: SupabaseClient = getSupabase()) {}

  async getToday(tradition: TraditionCode, depth: ContentDepth): Promise<RitualDefinition> {
    const { data, error } = await this.db
      .from('ritual')
      .select('id,title,intro,steps,depth')
      .eq('tradition_code', tradition)
      .eq('depth', depth)
      .limit(1)
      .maybeSingle();
    if (error) throw new Error('ERR_RITUAL_UNAVAILABLE');
    if (!data) throw new Error('ERR_RITUAL_EMPTY');
    return toRitualDefinition(data as RitualRow);
  }
}

export function toRitualDefinition(row: RitualRow): RitualDefinition {
  const steps = parseSteps(row.steps);
  if (steps.length === 0) throw new Error('ERR_RITUAL_EMPTY');
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
