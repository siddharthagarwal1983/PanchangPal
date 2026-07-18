/**
 * Per-subscription Realtime channel-topic suffix (TDD Part 4 §5.4 realtime seam).
 *
 * supabase-js keys channels by topic and returns the EXISTING instance when a topic is
 * already registered. Because `removeChannel()` is asynchronous and repositories fire it
 * un-awaited from an effect cleanup, a fast remount can reach `.channel(topic)` while the
 * previous channel is still registered and subscribed; the subsequent `.on(...)` then
 * throws "cannot add `postgres_changes` callbacks for `realtime:<topic>` after
 * `subscribe()`". Suffixing the topic keeps each subscriber's lifecycle independent.
 *
 * Process-local and monotonic — never persisted, never sent to the server as identity.
 */
let counter = 0;

export function nextChannelId(): number {
  return ++counter;
}
