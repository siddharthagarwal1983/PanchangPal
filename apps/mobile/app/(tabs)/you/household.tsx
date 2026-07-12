/**
 * SCR_HOUSEHOLD_001 — Household (MOD_you). The real feature (replacing the M6 Increment 1 shell):
 * members with roles + content depth, owner management (add local member, edit role/depth, remove),
 * and an invite entry (SCR_HOUSEHOLD_INVITE_001). Membership is server-authoritative and RLS-scoped;
 * HOOK_useHousehold subscribes to Realtime member changes so joins/edits appear live (TDD §5.4).
 * Household is cross-device, so anonymous users see a calm deferred-auth prompt (UX-2) — never a
 * dead end and never gating the daily loop. No business logic here: the screen composes approved
 * CMP_* (MemberRow / RolePicker / SegmentedControl / SettingsRow) with tokens-only styling and
 * localized strings; no household data is fabricated.
 */
import { useState } from 'react';
import { View, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import {
  Screen,
  AppHeader,
  Text,
  Card,
  PrimaryButton,
  SettingsRow,
  MemberRow,
  RolePicker,
  SegmentedControl,
  useTheme,
  type SegmentedOption,
} from '@panchangpal/ui';
import type { ContentDepth, MemberRole } from '@panchangpal/shared';
import {
  useHousehold,
  useAddMember,
  useRemoveMember,
  useUpdateMember,
  useCreateHousehold,
} from '../../../src/data/hooks/useHousehold';
import {
  activeMemberCount,
  canManage,
  isSolo,
  memberInitials,
  DEFAULT_MEMBER_INPUT,
  type Household,
  type HouseholdMember,
} from '../../../src/domain/household';
import { useOnline } from '../../../src/data/useOnline';
import { useSessionStore } from '../../../src/store/session';
import { t } from '../../../src/i18n';

const ROLE_OPTIONS: SegmentedOption<MemberRole>[] = [
  { value: 'anchor', label: t('household.roleAnchor') },
  { value: 'parent', label: t('household.roleParent') },
  { value: 'elder', label: t('household.roleElder') },
  { value: 'youth', label: t('household.roleYouth') },
  { value: 'other', label: t('household.roleOther') },
];
const DEPTH_OPTIONS: SegmentedOption<ContentDepth>[] = [
  { value: 'quick', label: t('household.depthQuick') },
  { value: 'deep', label: t('household.depthDeep') },
];

function roleLabel(role: MemberRole): string {
  return ROLE_OPTIONS.find((o) => o.value === role)?.label ?? role;
}
function depthLabel(depth: ContentDepth): string {
  return DEPTH_OPTIONS.find((o) => o.value === depth)?.label ?? depth;
}
function memberCountLabel(n: number): string {
  return n === 1 ? t('household.memberCountOne') : t('household.memberCount', { count: n });
}

/** Owner-editable member: role + depth controls (optimistic) and a remove action with confirm. */
function ManagedMember({ member, ownerId }: { member: HouseholdMember; ownerId: string }) {
  const { theme } = useTheme();
  const update = useUpdateMember();
  const remove = useRemoveMember();
  const isOwner = member.userId === ownerId;

  const confirmRemove = () =>
    Alert.alert(t('household.removeConfirmTitle', { name: member.displayName }), t('household.removeConfirmBody'), [
      { text: t('household.cancel'), style: 'cancel' },
      { text: t('household.removeConfirm'), style: 'destructive', onPress: () => remove.mutate(member.id) },
    ]);

  return (
    <Card testID={`member-${member.id}`}>
      <View style={{ gap: theme.spacing.md }}>
        <MemberRow
          initials={memberInitials(member.displayName)}
          name={member.displayName}
          subtitle={`${roleLabel(member.role)} · ${depthLabel(member.depth)}`}
          ownerBadgeLabel={isOwner ? t('household.ownerBadge') : undefined}
          onRemove={isOwner ? undefined : confirmRemove}
          removeLabel={t('household.remove')}
        />
        <RolePicker<MemberRole>
          options={ROLE_OPTIONS}
          value={member.role}
          onChange={(role) => update.mutate({ memberId: member.id, patch: { role } })}
          label={t('household.roleLabel')}
          testID={`member-${member.id}-role`}
        />
        <View style={{ gap: theme.spacing.sm }}>
          <Text variant="labelMedium" color="secondary" accessibilityRole="header">
            {t('household.depthLabel')}
          </Text>
          <SegmentedControl<ContentDepth>
            options={DEPTH_OPTIONS}
            value={member.depth}
            onChange={(depth) => update.mutate({ memberId: member.id, patch: { depth } })}
            accessibilityLabel={t('household.depthLabel')}
            testID={`member-${member.id}-depth`}
          />
        </View>
      </View>
    </Card>
  );
}

/** Owner-only inline form to add a local (uninvited) member the household tracks. */
function AddMemberForm({ household }: { household: Household }) {
  const { theme } = useTheme();
  const add = useAddMember(household.id);
  const [name, setName] = useState('');
  const [role, setRole] = useState<MemberRole>(DEFAULT_MEMBER_INPUT.role);
  const [depth, setDepth] = useState<ContentDepth>(DEFAULT_MEMBER_INPUT.depth);

  const onAdd = () => {
    const displayName = name.trim();
    if (!displayName) return;
    add.mutate(
      { displayName, role, depth },
      { onSuccess: () => { setName(''); setRole(DEFAULT_MEMBER_INPUT.role); setDepth(DEFAULT_MEMBER_INPUT.depth); } },
    );
  };

  return (
    <Card testID="add-member-form">
      <View style={{ gap: theme.spacing.md }}>
        <Text variant="titleSmall">{t('household.addMember')}</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t('household.addMemberName')}
          placeholderTextColor={theme.colors.text.placeholder}
          accessibilityLabel={t('household.addMemberName')}
          testID="add-member-name"
          maxLength={40}
          style={{
            minHeight: 48,
            borderWidth: 1,
            borderColor: theme.colors.border.default,
            borderRadius: theme.radius.md,
            paddingHorizontal: theme.spacing.md,
            color: theme.colors.text.primary,
            backgroundColor: theme.colors.surface.input,
          }}
        />
        <RolePicker<MemberRole> options={ROLE_OPTIONS} value={role} onChange={setRole} label={t('household.roleLabel')} testID="add-member-role" />
        <View style={{ gap: theme.spacing.sm }}>
          <Text variant="labelMedium" color="secondary" accessibilityRole="header">
            {t('household.depthLabel')}
          </Text>
          <SegmentedControl<ContentDepth>
            options={DEPTH_OPTIONS}
            value={depth}
            onChange={setDepth}
            accessibilityLabel={t('household.depthLabel')}
            testID="add-member-depth"
          />
        </View>
        {add.isError ? (
          <Text variant="bodySmall" color="danger" accessibilityLiveRegion="polite">
            {t('household.saveError')}
          </Text>
        ) : null}
        <PrimaryButton label={t('household.addMemberCta')} onPress={onAdd} loading={add.isPending} disabled={name.trim().length === 0} testID="add-member-submit" />
      </View>
    </Card>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <View style={{ gap: theme.spacing.sm }}>
      <Text variant="labelMedium" color="secondary" accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

export default function HouseholdScreen() {
  const online = useOnline();
  const { theme } = useTheme();
  const status = useSessionStore((s) => s.status);
  const userId = useSessionStore((s) => s.userId);
  const isAuthenticated = status === 'authenticated';

  const { data: household, isLoading, isError, refetch } = useHousehold();
  const createHousehold = useCreateHousehold();

  // Deferred-auth gate (UX-2): household is cross-device, so anonymous users get a calm prompt.
  if (!isAuthenticated) {
    return (
      <Screen offline={!online} scroll edges={['top']} testID="household-screen">
        <AppHeader title={t('household.title')} onBack={() => router.back()} backLabel={t('actions.back')} />
        <View style={{ paddingTop: theme.spacing.md }}>
          <Card testID="household-signin-prompt">
            <View style={{ gap: theme.spacing.sm }}>
              <Text variant="titleSmall">{t('household.signInTitle')}</Text>
              <Text variant="bodyMedium" color="secondary">
                {t('household.signInBody')}
              </Text>
              <PrimaryButton label={t('household.signIn')} onPress={() => router.push('/(onboarding)/sign-in')} testID="household-signin" />
            </View>
          </Card>
        </View>
      </Screen>
    );
  }

  const owner = canManage(household, userId);
  const solo = isSolo(household);

  return (
    <Screen
      scroll
      edges={['top']}
      offline={!online}
      loading={isLoading}
      error={isError ? { message: t('household.error'), onRetry: () => void refetch() } : null}
      testID="household-screen"
    >
      <AppHeader title={t('household.title')} onBack={() => router.back()} backLabel={t('actions.back')} />

      {!household ? (
        // Authenticated but no household yet → calm create prompt (never a dead end).
        <View style={{ paddingTop: theme.spacing.md }}>
          <Card testID="household-create-prompt">
            <View style={{ gap: theme.spacing.sm }}>
              <Text variant="titleSmall">{t('household.createTitle')}</Text>
              <Text variant="bodyMedium" color="secondary">
                {t('household.createBody')}
              </Text>
              {createHousehold.isError ? (
                <Text variant="bodySmall" color="danger" accessibilityLiveRegion="polite">
                  {t('household.saveError')}
                </Text>
              ) : null}
              <PrimaryButton
                label={t('household.createCta')}
                onPress={() => createHousehold.mutate(t('household.defaultName'))}
                loading={createHousehold.isPending}
                testID="household-create"
              />
            </View>
          </Card>
        </View>
      ) : (
        <View style={{ gap: theme.spacing.xl, paddingTop: theme.spacing.md }}>
          <View style={{ gap: theme.spacing.xs }}>
            <Text variant="titleLarge">{household.name}</Text>
            <Text variant="bodyMedium" color="secondary">
              {memberCountLabel(activeMemberCount(household))}
            </Text>
          </View>

          <Section title={t('household.membersSection')}>
            <View style={{ gap: theme.spacing.md }}>
              {household.members
                .filter((m) => m.isActive)
                .map((m) =>
                  owner ? (
                    <ManagedMember key={m.id} member={m} ownerId={household.ownerId} />
                  ) : (
                    <Card key={m.id} testID={`member-${m.id}`}>
                      <MemberRow
                        initials={memberInitials(m.displayName)}
                        name={m.displayName}
                        subtitle={`${roleLabel(m.role)} · ${depthLabel(m.depth)}`}
                        ownerBadgeLabel={m.userId === household.ownerId ? t('household.ownerBadge') : undefined}
                      />
                    </Card>
                  ),
                )}
            </View>
          </Section>

          {owner ? (
            <>
              <SettingsRow
                title={t('household.inviteEntry')}
                description={t('household.inviteEntryHint')}
                value="→"
                onPress={() => router.push('/(tabs)/you/invite')}
                testID="household-invite-entry"
              />
              <AddMemberForm household={household} />
            </>
          ) : null}

          {solo && owner ? (
            <Text variant="bodySmall" color="secondary" style={{ textAlign: 'center' }}>
              {t('household.subtitle')}
            </Text>
          ) : null}
        </View>
      )}
    </Screen>
  );
}
</content>
