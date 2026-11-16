import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Option } from '../data/farmInputs';
import { useLanguage } from '../i18n/LanguageContext';
import { colors, font, radius, spacing } from '../theme/theme';

/** Large picture-style options (soil types, water sources, seasons). */
export function OptionGrid({
  options,
  selected,
  onToggle,
  swatch,
}: {
  options: Option[];
  selected: string[];
  onToggle: (id: string) => void;
  swatch?: boolean;
}) {
  const { l } = useLanguage();
  return (
    <View style={styles.optionGrid}>
      {options.map((o) => {
        const active = selected.includes(o.id);
        return (
          <Pressable
            key={o.id}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onToggle(o.id)}
            style={[styles.option, active && styles.optionActive]}
          >
            {swatch ? <View style={[styles.swatch, { backgroundColor: o.color }]} /> : <Text style={styles.optionIcon}>{o.icon}</Text>}
            <Text style={[styles.optionText, active && { color: '#fff' }]}>{l(o.name)}</Text>
            {active && <Text style={styles.optionCheck}>✔</Text>}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  option: {
    width: '48%',
    flexGrow: 1,
    minHeight: 96,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    gap: spacing.xs,
  },
  optionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionIcon: { fontSize: 34 },
  swatch: { width: 52, height: 40, borderRadius: radius.sm, borderWidth: 1, borderColor: 'rgba(0,0,0,0.15)' },
  optionText: { fontSize: font.body, fontWeight: '700', color: colors.text, textAlign: 'center' },
  optionCheck: { position: 'absolute', top: 8, right: 10, color: '#fff', fontSize: 18, fontWeight: '800' },
});
