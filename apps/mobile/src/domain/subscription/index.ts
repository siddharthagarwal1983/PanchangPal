/**
 * MOD_subscription domain barrel. Pure types + entitlement logic + the PaymentAdapter port. The
 * data layer (subscriptionRepository / hooks) and UI import from here; nothing here imports the
 * data layer or a vendor SDK (dependency direction, TDD Part 1 §5).
 */
export {
  PREMIUM_CAPABILITIES,
  type Entitlement,
  type EntitlementKind,
  type GateResult,
  type PremiumCapability,
  type SubStatus,
} from './types';
export {
  activeKind,
  hasFamily,
  isCapabilityUnlocked,
  isEntitled,
  rowToEntitlement,
  rowsToEntitlements,
  type EntitlementRow,
} from './entitlement';
export {
  NullPaymentAdapter,
  type PaymentAdapter,
  type PlanOffering,
  type PurchaseOutcome,
  type PurchaseResult,
} from './PaymentAdapter';
