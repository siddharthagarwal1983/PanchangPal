/**
 * Checklist + ChecklistItem (CMP_CHECKLIST, PDD §5.6) — 3–5 curated micro-actions with inline
 * completion. Each item role=checkbox with `checked` announced; not color-only (check icon +
 * label). Toggle is optimistic (the parent hook queues offline + reverts on error). All-done
 * is a calm acknowledgment — no confetti.
 */
import { View, Pressable } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export interface ChecklistItemData {
  id: string;
  label: string;
  complete: boolean;
}

function ChecklistItem({ item, onToggle }: { item: ChecklistItemData; onToggle: (id: string) => void }) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={() => onToggle(item.id)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: item.complete }}
      accessibilityLabel={item.label}
      hitSlop={8}
      style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, minHeight: 44 }}
      testID={`checklist-item-${item.id}`}
    >
      <Text variant="bodyLarge" style={{ color: item.complete ? theme.colors.accent.positive : theme.colors.icon.muted }}>
        {item.complete ? '☑' : '☐'}
      </Text>
      <Text variant="bodyLarge" color={item.complete ? 'tertiary' : 'primary'}>
        {item.label}
      </Text>
    </Pressable>
  );
}

export interface ChecklistProps {
  items: ChecklistItemData[];
  onToggle: (id: string) => void;
  allDoneLabel?: string;
  testID?: string;
}

export function Checklist({ items, onToggle, allDoneLabel, testID }: ChecklistProps) {
  const { theme } = useTheme();
  const allDone = items.length > 0 && items.every((i) => i.complete);
  return (
    <View style={{ gap: theme.spacing.sm }} testID={testID}>
      {items.map((item) => (
        <ChecklistItem key={item.id} item={item} onToggle={onToggle} />
      ))}
      {allDone && allDoneLabel ? (
        <Text variant="labelMedium" color="brand" accessibilityLiveRegion="polite">
          {allDoneLabel}
        </Text>
      ) : null}
    </View>
  );
}
