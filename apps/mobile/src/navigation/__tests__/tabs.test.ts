import { visibleTabs, isTabRoute, TAB_ROUTE_NAMES } from '../tabs';

/**
 * The navigator state as Expo Router actually hands it to a custom `tabBar`: every
 * registered screen, including those declared `href: null` and the file routes Expo
 * Router auto-registers. Ordered as declared in app/(tabs)/_layout.tsx.
 */
const ALL_ROUTES = [
  { key: 'k-today', name: 'today/index' },
  { key: 'k-ritual', name: 'today/ritual' },
  { key: 'k-calendar', name: 'calendar/index' },
  { key: 'k-guru', name: 'guru/index' },
  { key: 'k-chat', name: 'guru/chat' },
  { key: 'k-history', name: 'guru/history' },
  { key: 'k-you', name: 'you/index' },
  { key: 'k-notifications', name: 'you/notifications' },
  { key: 'k-settings', name: 'you/settings' },
  { key: 'k-household', name: 'you/household' },
  { key: 'k-subscription', name: 'you/subscription' },
  { key: 'k-delete', name: 'you/delete-account' },
];

describe('visibleTabs', () => {
  it('renders exactly the four UX-1 tabs, not every registered route', () => {
    // Regression: mapping state.routes directly put all 12 screens in the tab bar —
    // ritual, guru/chat, and the whole You stack — with raw route names as labels.
    const tabs = visibleTabs(ALL_ROUTES, 0);
    expect(tabs.map((t) => t.name)).toEqual([...TAB_ROUTE_NAMES]);
    expect(tabs).toHaveLength(4);
  });

  it('keeps UX-1 order regardless of navigator ordering', () => {
    const shuffled = [...ALL_ROUTES].reverse();
    expect(visibleTabs(shuffled, 0).map((t) => t.name)).toEqual([...TAB_ROUTE_NAMES]);
  });

  it('focuses the active tab', () => {
    const tabs = visibleTabs(ALL_ROUTES, 2); // calendar/index
    expect(tabs.filter((t) => t.focused).map((t) => t.name)).toEqual(['calendar/index']);
  });

  it('keeps the parent tab focused while inside its nested stack', () => {
    // you/settings is index 8. Comparing array positions instead of keys would leave the
    // bar with nothing focused the moment a nested screen opened.
    const tabs = visibleTabs(ALL_ROUTES, 8);
    expect(tabs.filter((t) => t.focused).map((t) => t.name)).toEqual(['you/index']);
  });

  it('focuses the Today tab from the ritual screen', () => {
    const tabs = visibleTabs(ALL_ROUTES, 1); // today/ritual
    expect(tabs.filter((t) => t.focused).map((t) => t.name)).toEqual(['today/index']);
  });

  it('omits a tab that is not registered rather than emitting a broken entry', () => {
    const withoutCalendar = ALL_ROUTES.filter((r) => r.name !== 'calendar/index');
    const tabs = visibleTabs(withoutCalendar, 0);
    expect(tabs.map((t) => t.name)).toEqual(['today/index', 'guru/index', 'you/index']);
  });

  it('tolerates an out-of-range active index', () => {
    expect(() => visibleTabs(ALL_ROUTES, 99)).not.toThrow();
    expect(visibleTabs(ALL_ROUTES, 99).every((t) => !t.focused)).toBe(true);
  });

  it('classifies tab vs non-tab routes', () => {
    expect(isTabRoute('today/index')).toBe(true);
    expect(isTabRoute('you/settings')).toBe(false);
    expect(isTabRoute('you/delete-account')).toBe(false);
  });
});
