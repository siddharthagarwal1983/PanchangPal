/**
 * AccountRepository — CCPA export completeness (TDD Part 2 §6.4, Part 5 §6.2).
 *
 * The defect these tests exist for: `EXPORT_TABLES` fetches every row set with
 * `.eq('user_id', …)`, but `message` keys on `conversation_id`. So the export returned each
 * conversation's HEADER — its id and title — with none of the messages in it, and did so
 * silently, because an empty row set and an unreachable row set look identical in the output.
 *
 * It was harmless while Ask Guru is gated off and wrong the moment `GURU_LIVE` flips, which is the
 * kind of gap a data-rights request finds rather than a test. Messages are also the most personal
 * free text in the product.
 */
import { describe, it, expect } from 'vitest';
import { AccountRepository } from './accountRepo.ts';

const USER = '11111111-1111-4111-8111-111111111111';

interface Query {
  table: string;
  eq?: [string, string];
  in?: [string, string[]];
}

/**
 * Minimal supabase-js double: records the queries issued and replays fixture rows. Deliberately
 * thin — the behaviour under test is *which queries get made*, not what postgrest does with them.
 */
function fakeDb(rows: Record<string, unknown[]>, queries: Query[] = []) {
  return {
    queries,
    from(table: string) {
      const q: Query = { table };
      const result = { data: rows[table] ?? [], error: null };
      const builder = {
        select() {
          return builder;
        },
        eq(col: string, val: string) {
          q.eq = [col, val];
          queries.push(q);
          return Promise.resolve(result);
        },
        in(col: string, vals: string[]) {
          q.in = [col, vals];
          queries.push(q);
          return Promise.resolve(result);
        },
      };
      return builder;
    },
  };
}

// deno-lint-ignore-file no-explicit-any
const repoFor = (rows: Record<string, unknown[]>, queries: Query[] = []) =>
  new AccountRepository(fakeDb(rows, queries) as never);

describe('AccountRepository.exportOwnedRows — the export is complete', () => {
  it('includes the messages inside the exported conversations', async () => {
    const queries: Query[] = [];
    const repo = repoFor(
      {
        conversation: [{ id: 'c1', user_id: USER, title: 'Thread' }],
        message: [
          { id: 'm1', conversation_id: 'c1', role: 'user', content: 'the question I asked' },
          { id: 'm2', conversation_id: 'c1', role: 'assistant', content: 'the answer I got' },
        ],
      },
      queries,
    );

    const out = await repo.exportOwnedRows(USER);

    expect(out.message).toHaveLength(2);
    // The content itself, not just the row count — the point of the export is the text.
    expect(JSON.stringify(out.message)).toContain('the question I asked');

    // Fetched by conversation_id, which is the only way to reach them.
    const messageQuery = queries.find((q) => q.table === 'message');
    expect(messageQuery?.in).toEqual(['conversation_id', ['c1']]);
  });

  it('scopes messages to this user\'s conversations only', async () => {
    const queries: Query[] = [];
    const repo = repoFor(
      { conversation: [{ id: 'c1' }, { id: 'c2' }], message: [] },
      queries,
    );

    await repo.exportOwnedRows(USER);

    // Only the caller's own conversation ids may reach the `in` clause. A missing scope here would
    // export other people's messages, turning a data-rights feature into a data breach.
    expect(queries.find((q) => q.table === 'message')?.in).toEqual([
      'conversation_id',
      ['c1', 'c2'],
    ]);
  });

  it('emits an empty message set rather than omitting the key when there are no conversations', async () => {
    // A consumer should not have to tell "no messages" apart from "this export predates message
    // support" — and it must not issue an `in ()` query with an empty list either.
    const queries: Query[] = [];
    const repo = repoFor({ conversation: [] }, queries);

    const out = await repo.exportOwnedRows(USER);

    expect(out.message).toEqual([]);
    expect(queries.find((q) => q.table === 'message')).toBeUndefined();
  });

  it('does not export message_source — that is corpus reference, not user data', async () => {
    const repo = repoFor({ conversation: [{ id: 'c1' }], message: [{ id: 'm1' }] });

    const out = await repo.exportOwnedRows(USER);

    // The mirror of the bug being fixed: handing back the product's own library rows under the
    // heading "your data" is as wrong as omitting the user's own text.
    expect(out.message_source).toBeUndefined();
  });

  it('still exports the six user_id-keyed row sets §6.2 names', async () => {
    const queries: Query[] = [];
    const repo = repoFor({ conversation: [] }, queries);

    await repo.exportOwnedRows(USER);

    expect(queries.filter((q) => q.eq?.[0] === 'user_id').map((q) => q.table)).toEqual([
      'user_profile',
      'personal_date',
      'conversation',
      'streak',
      'ritual_completion',
      'checklist_completion',
    ]);
    // Every one scoped to the caller — the B6.2 invariant, restated where it is easy to regress.
    expect(queries.every((q) => !q.eq || q.eq[1] === USER)).toBe(true);
  });
});
