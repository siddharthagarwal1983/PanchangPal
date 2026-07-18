/**
 * Contextual paywall sheet (TDD Part 4 §3.1 `modal/*` — "bottom sheets, dialogs, paywall").
 * A COMPOSITION of CMP_BOTTOM_SHEET + CMP_PLAN_CARD, not a new component (PDD §3 note).
 *
 * It is a ROUTE rather than a shared component on purpose: MOD_guru and MOD_you both open it, and
 * a feature never imports another feature (TDD §2.2) — contextual cross-links go through
 * navigation intents. Callers push `/modal/paywall?capability=…`.
 *
 * Rules honored here: ALWAYS dismissible (AC-SUB-01); never an interstitial over the ritual
 * (UX-9 — only opened from an affordance the user tapped); the daily loop is never gated (P4).
 * Purchase flows through the PaymentAdapter seam; entitlement is NEVER granted on device (F-4).
 * The Family plan is hidden unless FF_FAMILY_PLAN is on (ADR-021).
 */
import { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  BottomSheet,
  PlanCard,
  PrimaryButton,
  SettingsRow,
  Text,
  InfoBanner,
  Skeleton,
  useTheme,
} from '@panchangpal/ui';
import type { ValueListItem } from '@panchangpal/ui';
import {
  PREMIUM_CAPABILITIES,
  visibleOfferings,
  type PlanOffering,
  type PremiumCapability,
} from '../../src/domain/subscription';
import { useFeatureFlag } from '../../src/data/hooks/useFeatureFlag';
import { usePlans, usePurchase } from '../../src/data/hooks/useSubscription';
import { useOnline } from '../../src/data/useOnline';
import { t } from '../../src/i18n';

/** Capability-specific framing — falls back to the generic upgrade copy for anything else. */
function promptFor(capability: PremiumCapability | null): { title: string; body: string } {
  if (capability === 'deep_dive_content') {
    return { title: t('settings.deepLockedTitle'), body: t('settings.deepLockedBody') };
  }
  if (capability === 'extended_ask_guru') {
    return { title: t('guru.upgradeTitle'), body: t('guru.upgradeBody') };
  }
  return { title: t('subscription.title'), body: t('subscription.subtitle') };
}

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

function asCapability(value: unknown): PremiumCapability | null {
  return typeof value === 'string' && (PREMIUM_CAPABILITIES as readonly string[]).includes(value)
    ? (value as PremiumCapability)
    : null;
}

export default function PaywallSheet() {
  const online = useOnline();
  const { theme } = useTheme();
  const { capability } = useLocalSearchParams<{ capability?: string }>();

  const familyPlanEnabled = useFeatureFlag('FF_FAMILY_PLAN');
  const plans = usePlans();
  const purchase = usePurchase();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const prompt = promptFor(asCapability(capability));
  const offerings = visibleOfferings(plans.data, familyPlanEnabled);
  const purchaseFailed = purchase.data?.outcome === 'failed' || purchase.data?.outcome === 'unavailable';

  // Dismissing the sheet returns to whatever opened it (valid back-stack, §3.2).
  const dismiss = () => router.back();

  // On success the webhook grants entitlement (Realtime propagates it) — close on the warm note.
  const onPurchase = () => {
    if (!selectedId) return;
    purchase.mutate(selectedId, {
      onSuccess: (result) => {
        if (result.outcome === 'success') dismiss();
      },
    });
  };

  return (
    <BottomSheet visible title={prompt.title} onDismiss={dismiss} testID="paywall-sheet">
      <Text variant="bodyMedium" color="secondary">
        {prompt.body}
      </Text>

      {purchaseFailed ? (
        <InfoBanner message={t('subscription.paymentFailed')} tone="warning" testID="paywall-payment-failed" />
      ) : null}

      {plans.isLoading ? (
        <View style={{ gap: theme.spacing.md }} testID="paywall-skeleton">
          <Skeleton height={140} radiusToken="lg" />
        </View>
      ) : offerings.length === 0 ? (
        <InfoBanner message={t('subscription.unavailable')} tone="info" testID="paywall-unavailable" />
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
                onSelect={(id) => setSelectedId(id) /* EVT_050 (Plan Selected) */}
                testID={`paywall-plan-${offering.kind}`}
              />
            );
          })}

          <PrimaryButton
            label={t('subscription.subscribe')}
            onPress={onPurchase}
            disabled={!selectedId || !online}
            loading={purchase.isPending}
            testID="paywall-subscribe"
          />
        </View>
      )}

      {/* Always an exit, and a path to the full screen (plan comparison, restore, legal). */}
      <SettingsRow
        title={t('subscription.seeAllPlans')}
        onPress={() => router.replace('/(tabs)/you/subscription')}
        testID="paywall-see-all"
      />
      <SettingsRow title={t('actions.notNow')} onPress={dismiss} testID="paywall-dismiss" />
    </BottomSheet>
  );
}
