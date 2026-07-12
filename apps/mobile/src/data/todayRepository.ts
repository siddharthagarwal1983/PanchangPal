/**
 * TodayRepository (TDD Part 4 §5.1) — the data gateway for the Today loop. Wraps the
 * SVC_panchang Edge Function (API_GET_TODAY, API_POST_RITUAL_COMPLETE) and checklist reads/
 * writes via supabase-js. Errors normalize to the ERR_* envelope. Ritual completion is
 * optimistic + offline-queued by the hook (§6); this performs the calls.
 *
 * Panchang: API_GET_TODAY returns ERR_PANCHANG_UNAVAILABLE while the engine is blocked
 * (ADR-033) → mapped to { status: 'unavailable' }. No fabricated values, ever.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from './supabaseClient';
import type { PanchangResult, TodayQuery } from '../domain/panchang/PanchangProvider';

export interface ChecklistItemDto {
  id: string;
  label: string;
  complete: boolean;
}

export class TodayRepository {
  constructor(private db: SupabaseClient = getSupabase()) {}

  async getToday(q: TodayQuery): Promise<PanchangResult> {
    const { data, error } = await this.db.functions.invoke('panchang/today', {
      body: q,
    });
    if (error) {
      // The Edge Function returns the ERR_* envelope; treat panchang errors as "unavailable"
      // so the card degrades calmly and the rest of Home stays usable (AC-HOME-04).
      const code = (error as { context?: { code?: string } }).context?.code;
      return { status: 'unavailable', reason: code === 'ERR_OFFLINE' ? 'ERR_OFFLINE' : 'ERR_PANCHANG_UNAVAILABLE' };
    }
    if (!data || data.status === 'unavailable') {
      return { status: 'unavailable', reason: 'ERR_PANCHANG_UNAVAILABLE' };
    }
    return data as PanchangResult;
  }

  async completeRitual(input: { ritual_id: string; local_date: string; client_id: string; idempotency_key: string }): Promise<{ current_len: number; best_len: number; grace_remaining: number; grace_used: boolean }> {
    const { data, error } = await this.db.functions.invoke('panchang/ritual/complete', { body: input });
    if (error) throw new Error((error as { context?: { code?: string } }).context?.code ?? 'ERR_SYNC_CONFLICT');
    return data.streak;
  }

  async getChecklist(localDate: string): Promise<ChecklistItemDto[]> {
    const { data } = await this.db
      .from('checklist_item')
      .select('id, label')
      .order('order', { ascending: true })
      .limit(5);
    const { data: completions } = await this.db
      .from('checklist_completion')
      .select('item_id')
      .eq('local_date', localDate);
    const done = new Set((completions ?? []).map((c: { item_id: string }) => c.item_id));
    return (data ?? []).map((i: { id: string; label: string }) => ({ id: i.id, label: i.label, complete: done.has(i.id) }));
  }

  async toggleChecklist(input: { item_id: string; local_date: string; client_id: string }): Promise<void> {
    await this.db.from('checklist_completion').upsert(
      { item_id: input.item_id, local_date: input.local_date, client_id: input.client_id, completed_at: new Date().toISOString() },
      { onConflict: 'user_id,item_id,local_date', ignoreDuplicates: true },
    );
  }
}

export const todayRepository = new TodayRepository();
