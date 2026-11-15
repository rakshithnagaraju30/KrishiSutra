import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useLanguage } from '../i18n/LanguageContext';
import { colors, font, radius, spacing, TOUCH } from '../theme/theme';

export function Screen({
  children,
  scroll = true,
  edges = ['left', 'right'],
  footer,
}: {
  children: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  footer?: ReactNode;
}) {
  return (
    <SafeAreaView style={styles.screen} edges={edges}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.scrollContent, { flex: 1 }]}>{children}</View>
      )}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

export function PrototypeBanner() {
  const { t } = useLanguage();
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Text style={styles.bannerIcon}>🧪</Text>
      <Text style={styles.bannerText}>{t('prototypeBanner')}</Text>
    </View>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Heading({ children }: { children: ReactNode }) {
  return <Text style={styles.heading}>{children}</Text>;
}

export function Body({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return <Text style={[styles.body, muted && { color: colors.textMuted }]}>{children}</Text>;
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  icon,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  icon?: string;
}) {
  const bg =
    variant === 'primary' ? colors.primary : variant === 'danger' ? colors.surface : colors.primaryLight;
  const fg = variant === 'primary' ? '#fff' : variant === 'danger' ? colors.danger : colors.primaryDark;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: disabled ? 0.4 : pressed ? 0.85 : 1 },
        variant === 'danger' && { borderWidth: 1, borderColor: colors.danger },
      ]}
    >
      <Text style={[styles.buttonText, { color: fg }]}>
        {icon ? `${icon}  ` : ''}
        {label}
      </Text>
    </Pressable>
  );
}

export type BadgeKind = 'verified' | 'estimate' | 'pending';

export function Badge({ kind }: { kind: BadgeKind }) {
  const { t } = useLanguage();
  const map = {
    verified: { bg: colors.primaryLight, fg: colors.verified, label: t('labelVerified'), icon: '✔' },
    estimate: { bg: '#FFF0D6', fg: colors.estimate, label: t('labelEstimate'), icon: '≈' },
    pending: { bg: colors.pendingBg, fg: colors.pendingText, label: t('labelPending'), icon: '⏳' },
  }[kind];
  return (
    <View style={[styles.badge, { backgroundColor: map.bg }]}>
      <Text style={[styles.badgeText, { color: map.fg }]}>
        {map.icon} {map.label}
      </Text>
    </View>
  );
}

/** A labelled fact row whose value is not yet available from a verified source. */
export function PendingFact({ label }: { label: string }) {
  const { t } = useLanguage();
  return (
    <View style={styles.factRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.factLabel}>{label}</Text>
        <Text style={styles.factValue}>{t('pendingVerified')}</Text>
      </View>
      <Badge kind="pending" />
    </View>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string; icon?: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.segmented}>
      {options.map((o) => {
        const active = o.id === value;
        return (
          <Pressable
            key={o.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.id)}
            style={[styles.segment, active && styles.segmentActive]}
          >
            {o.icon ? <Text style={styles.segmentIcon}>{o.icon}</Text> : null}
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
    </View>
  );
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xl * 2, gap: spacing.md },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.warningBg,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  bannerIcon: { fontSize: 20 },
  bannerText: { flex: 1, color: colors.warningText, fontSize: font.small, lineHeight: 21 },
  title: { fontSize: font.title, fontWeight: '700', color: colors.text },
  heading: { fontSize: font.heading, fontWeight: '700', color: colors.text, marginTop: spacing.sm },
  body: { fontSize: font.body, color: colors.text, lineHeight: 25 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    minHeight: TOUCH,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  buttonText: { fontSize: font.body, fontWeight: '700' },
  badge: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  badgeText: { fontSize: 13, fontWeight: '700' },
  factRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  factLabel: { fontSize: font.body, fontWeight: '600', color: colors.text },
  factValue: { fontSize: font.small, color: colors.textMuted, marginTop: 2 },
  segmented: { gap: spacing.sm, paddingVertical: spacing.xs },
  segment: {
    minHeight: TOUCH,
    minWidth: 76,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  segmentIcon: { fontSize: 18 },
  segmentText: { fontSize: font.small, color: colors.text, fontWeight: '600' },
  segmentTextActive: { color: '#fff' },
  progressTrack: { height: 10, borderRadius: 5, backgroundColor: colors.primaryLight, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary },
});
