/**
 * Repositories must be importable and constructible WITHOUT Supabase configuration.
 *
 * Regression guard for a defect that reached M8: every repository took the client as a
 * default parameter — `constructor(private readonly db: SupabaseClient = getSupabase())`.
 * A default parameter is evaluated at construction, and for a module-level singleton that
 * means at import. With EXPO_PUBLIC_SUPABASE_URL absent, supabase-js threw "supabaseUrl is
 * required." while a route module was still evaluating, so expo-router never saw the route's
 * default export and rendered "Page could not be found" instead of a calm error state. It
 * also made the repositories untestable: importing one detonated before any test ran.
 *
 * This suite deliberately sets no configuration. Construction must resolve nothing; only an
 * actual query may touch the client. If someone reintroduces an eager default parameter,
 * these imports fail exactly as they did before.
 */
import { RitualRepository } from '../ritualRepository';
import { TodayRepository } from '../todayRepository';
import { ProfileRepository } from '../profileRepository';
import { HouseholdRepository } from '../householdRepository';
import { AccountRepository } from '../accountRepository';
import { NotificationRepository } from '../notificationRepository';
import { SubscriptionRepository } from '../subscriptionRepository';
import { FeatureFlagRepository } from '../featureFlagRepository';
import { CalendarRepository } from '../calendarRepository';
import { AuthRepository } from '../authRepository';

describe('repository construction without configuration', () => {
  it.each([
    ['RitualRepository', () => new RitualRepository()],
    ['TodayRepository', () => new TodayRepository()],
    ['ProfileRepository', () => new ProfileRepository()],
    ['HouseholdRepository', () => new HouseholdRepository()],
    ['AccountRepository', () => new AccountRepository()],
    ['NotificationRepository', () => new NotificationRepository()],
    ['SubscriptionRepository', () => new SubscriptionRepository()],
    ['FeatureFlagRepository', () => new FeatureFlagRepository()],
    ['CalendarRepository', () => new CalendarRepository()],
    ['AuthRepository', () => new AuthRepository()],
  ])('%s constructs without touching the Supabase client', (_name, construct) => {
    expect(() => construct()).not.toThrow();
  });

  it('has no Supabase configuration in this environment', () => {
    // Guards the guard: if config leaked in, the assertions above would pass vacuously.
    expect(process.env.EXPO_PUBLIC_SUPABASE_URL ?? '').toBe('');
  });
});
