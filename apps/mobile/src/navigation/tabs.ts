/**
 * Tab-bar selection (TDD Part 4 §3.1, UX-1: Today / Calendar / Ask Guru / You).
 *
 * CMP_BOTTOM_TAB_BAR is supplied through Expo Router's `tabBar` render prop, which hands
 * over the FULL navigator state. `options={{ href: null }}` only suppresses the default
 * tab bar's button — the route remains in `state.routes` — so a custom tab bar that maps
 * the state directly renders every registered screen (ritual, guru/chat, you/settings,
 * you/delete-account …) instead of the four tabs. Selection therefore has to be explicit.
 *
 * Pure so it is unit-testable and the layout stays logic-free.
 */

/** The four tab destinations, in UX-1 order. The key is the Expo Router route name. */
export const TAB_ROUTE_NAMES = [
  'today/index',
  'calendar/index',
  'guru/index',
  'you/index',
] as const;

export type TabRouteName = (typeof TAB_ROUTE_NAMES)[number];

export interface RouteLike {
  key: string;
  name: string;
}

export interface VisibleTab {
  key: string;
  name: string;
  focused: boolean;
}

/** True when a route name is one of the four tabs. */
export function isTabRoute(name: string): name is TabRouteName {
  return (TAB_ROUTE_NAMES as readonly string[]).includes(name);
}

/**
 * The tabs to render, in UX-1 order, with focus resolved.
 *
 * `focused` compares the route KEY against the active route rather than comparing array
 * positions: once non-tab routes are filtered out, the surviving indices no longer line up
 * with `state.index`, so a positional check highlights the wrong tab (or none) as soon as a
 * nested screen is open.
 */
export function visibleTabs(routes: readonly RouteLike[], activeIndex: number): VisibleTab[] {
  const activeKey = routes[activeIndex]?.key;
  const activeName = routes[activeIndex]?.name;
  return TAB_ROUTE_NAMES.flatMap((name) => {
    const route = routes.find((r) => r.name === name);
    if (!route) return [];
    // A nested screen (e.g. you/settings) keeps its parent tab highlighted by prefix, so the
    // bar never goes blank while the user is inside a tab's stack.
    const focused =
      route.key === activeKey ||
      (activeName !== undefined && !isTabRoute(activeName) && activeName.split('/')[0] === name.split('/')[0]);
    return [{ key: route.key, name: route.name, focused }];
  });
}
