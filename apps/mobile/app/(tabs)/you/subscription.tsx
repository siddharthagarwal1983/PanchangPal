/**
 * SCR_SUBSCRIPTION_001 — Subscription / Upgrade (MOD_subscription, PDD §SCR_SUBSCRIPTION_001,
 * FLOW F1). A calm, always-dismissible product surface reached from the You hub — NEVER an
 * interstitial over the daily ritual (UX-9), and the daily loop is never gated (P4). Plans,
 * purchase, and restore flow through the PaymentAdapter seam (hooks); receipts are validated
 * server-side and entitlement is granted ONLY by the RevenueCat webhook (F-4, household grain) —
 * the client never grants entitlement locally. All documented states are handled:
 * default / skeleton (loading) / empty (unavailable) / offline / error (ERR_PAYMENT_FAILED) /
 * success. No business logic lives here — the screen composes approved CMP_* with tokens-only
 * styling and localized strings. Analytics: EVT_049 on show and EVT_050 on selection fire here;
 * EVT_051/EVT_052 are emitted by the `usePurchase`/`useRestore` seam, so both upgrade surfaces
 * report the same funnel (§11.3 computes free→paid from EVT_051).
 */
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import {
  Screen,
  AppHeader,
  Text,
  Card,
  PlanCard,
  LegalFootnote,
  PrimaryButton,
  InfoBanner,
  Skeleton,
  useTheme,
} from '@panchangpal/ui';
import type { ValueListItem } from '@panchangpal/ui';
import { isEntitled, visibleOfferings, type PlanOffering } from '../../../src/domain/subscription';
import { useEntitlement } from '../../../src/data/hooks/useEntitlement';
import { useFeatureFlag } from '../../../src/data/hooks/useFeatureFlag';
import {
  useConfigurePayments,
  usePlans,
  usePurchase,
  useRestore,
} from '../../../src/data/hooks/useSubscription';
import { useOnline } from '../../../src/data/useOnline';
import { getAnalyticsService } from '../../../src/data/analyticsAdapter';
import {
  planSelectedEvent,
  subscriptionViewedEvent,
} from '../../../src/domain/analytics/subscriptionEvents';
import { t } from '../../../src/i18n';

/** Map a store offering to its localized display fields (prices always come from the store). */
function planView(offering: PlanOffering) {
  const isFamily = offering.kind === 'family';
  const benefits: ValueListItem[] = [
    { id: 'deep-dive', label: t('subscription.benefitDeepDive') },
    { id: 'extended-guru', label: t('subscription.benefitExtendedGuru') },
    { id: 'family-share', label: t('subscription.benefitFamilyShare'), included: isFamily },
  ];
  return {
    name: isFamily ? t('subscription.planFamily') : t('subscription.planIndividual'),
    periodLabel: offering.period === 'year' ? t('subscription.perYear') : t('subscription.perMonth'),
    bestValueLabel: offering.bestValue ? t('subscription.bestValue') : undefined,
    benefits,
  };
}

export default function SubscriptionScreen() {
  const online = useOnline();
  const { theme } = useTheme();

  useConfigurePayments();
  // The Family plan is an OFFERING gate (ADR-021): hidden until FF_FAMILY_PLAN is on, so Individual
  // stays the default. Fails closed — an unreadable flag never exposes an unreleased plan.
  const familyPlanEnabled = useFeatureFlag('FF_FAMILY_PLAN');
  const entitlement = useEntitlement();
  const plans = usePlans();
  const purchase = usePurchase();
  const restore = useRestore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // EVT_049 Subscription Viewed (AC-SUB-01). Empty dependency list so it fires ONCE per mount: this
  // is the denominator of §11.3's free→paid rate, and a view counted twice understates conversion.
  useEffect(() => {
    const event = subscriptionViewedEvent('screen');
    getAnalyticsService().track(event.eventId, event.props);
  }, []);

  const alreadyPremium = isEntitled(entitlement.data);
  const justPurchased = purchase.data?.outcome === 'success';
  const purchaseFailed = purchase.data?.outcome === 'failed' || purchase.data?.outcome === 'unavailable';
  const offerings = visibleOfferings(plans.data, familyPlanEnabled);

  const back = () => router.back();

  return (
    <Screen scroll edges={['top']} offline={!online} testID="subscription-screen">
      <AppHeader title={t('subscription.title')} onBack={back} backLabel={t('actions.back')} />

      <View style={{ gap: theme.spacing.xl, paddingTop: theme.spacing.md }}>
        {/* Success / already-premium — warm confirmation (AC-SUB-02); benefits live. */}
        {justPurchased || alreadyPremium ? (
          <Card testID="subscription-active">
            <View accessibilityRole="alert" style={{ gap: theme.spacing.sm }}>
              <Text variant="titleLarge" color="primary">
                {justPurchased ? t('subscription.successTitle') : t('subscription.activeTitle')}
              </Text>
              <Text variant="bodyMedium" color="secondary">
                {justPurchased ? t('subscription.successBody') : t('subscription.activeBody')}
              </Text>
            </View>
          </Card>
        ) : (
          <>
            <Text variant="bodyLarge" color="secondary">
              {t('subscription.subtitle')}
            </Text>

            {/* ERR_PAYMENT_FAILED — clear reason, no grant, retry available (AC-SUB-03). */}
            {purchaseFailed ? (
              <InfoBanner message={t('subscription.paymentFailed')} tone="warning" testID="subscription-payment-failed" />
            ) : null}

            {/* Skeleton (loading) → Empty (unavailable) → Plans (default). */}
            {plans.isLoading ? (
              <View style={{ gap: theme.spacing.md }} testID="subscription-skeleton">
                <Skeleton height={140} radiusToken="lg" />
                <Skeleton height={140} radiusToken="lg" />
              </View>
            ) : offerings.length === 0 ? (
              <InfoBanner message={t('subscription.unavailable')} tone="info" testID="subscription-unavailable" />
            ) : (
              <View
                accessibilityRole="radiogroup"
                accessibilityLabel={t('subscription.selectHint')}
                style={{ gap: theme.spacing.md }}
              >
                {offerings.map((offering) => {
                  const view = planView(offering);
                  return (
                    <PlanCard
                      key={offering.id}
                      id={offering.id}
                      name={view.name}
                      priceLabel={offering.priceLabel}
                      periodLabel={view.periodLabel}
                      benefits={view.benefits}
                      includedLabel={t('subscription.included')}
                      excludedLabel={t('subscription.notIncluded')}
                      bestValueLabel={view.bestValueLabel}
                      selected={selectedId === offering.id}
                      loading={purchase.isPending}
                      onSelect={(id) => {
                        setSelectedId(id);
                        const event = planSelectedEvent(offering.kind, 'screen');
                        getAnalyticsService().track(event.eventId, event.props);
                      }}
                      testID={`plan-${offering.kind}`}
                    />
                  );
                })}

                <PrimaryButton
                  label={t('subscription.subscribe')}
                  onPress={() => {
                    const chosen = offerings.find((o) => o.id === selectedId);
                    if (chosen) purchase.mutate({ planId: chosen.id, plan: chosen.kind });
                  }}
                  disabled={!selectedId || !online}
                  loading={purchase.isPending}
                  testID="subscription-subscribe"
                />
              </View>
            )}

            {/* Restore is always attemptable (AC-SUB-04); disabled while offline. */}
            <View style={{ gap: theme.spacing.sm }}>
              <PrimaryButton
                label={t('subscription.restore')}
                onPress={() => restore.mutate()}
                disabled={!online || restore.isPending}
                loading={restore.isPending}
                testID="subscription-restore"
              />
              <Text variant="bodySmall" color="tertiary">
                {t('subscription.restoreHint')}
              </Text>
            </View>

            <LegalFootnote
              text={t('subscription.legal')}
              links={[
                { id: 'terms', label: t('subscription.legalTerms'), onPress: () => { /* opens legal doc */ } },
                { id: 'privacy', label: t('subscription.legalPrivacy'), onPress: () => { /* opens legal doc */ } },
              ]}
              testID="subscription-legal"
            />
          </>
        )}
      </View>
    </Screen>
  );
}
