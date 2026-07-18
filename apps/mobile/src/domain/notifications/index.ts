/**
 * MOD_notifications domain barrel. Pure types + logic + the NotificationAdapter port. The data
 * layer (notificationRepository / hooks) and UI import from here; nothing here imports the data
 * layer or a vendor SDK (dependency direction, TDD Part 1 §5).
 */
export {
  DEFAULT_NOTIF_PREFS,
  NOTIF_CHANNEL_ORDER,
  type NotifChannelPrefs,
  type NotifPrefs,
  type NotifPrefsPatch,
  type PermissionStatus,
  type QuietHours,
} from './types';
export {
  DEFAULT_NOTIFICATION_ROUTE,
  applyNotifPatch,
  isChannelEnabled,
  isValidHHMM,
  isValidQuietHours,
  notifPrefsFromBlob,
  notifPrefsToBlob,
  resolveNotificationRoute,
  routeForDeepLink,
  routeForNotifType,
  shouldOfferReask,
  shouldPrime,
  structuredNotifPrefs,
  type NotifPrefsBlob,
} from './notifications';
export {
  NullNotificationAdapter,
  type NotificationAdapter,
  type NotificationResponse,
} from './NotificationAdapter';
