import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LANGUAGE_NAMES, LANGUAGES, type Lang } from '../i18n/types';
import { colors, font, radius, spacing } from '../theme/theme';

export function LanguagePicker({ value, onChange }: { value: Lang | null; onChange: (lang: Lang) => void }) {
  return (
    <View style={styles.list}>
      {LANGUAGES.map((code) => {
        const selected = code === value;
        return (
          <Pressable
            key={code}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(code)}
            style={[styles.option, selected && styles.optionSelected]}
          >
            <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{LANGUAGE_NAMES[code]}</Text>
            <Text style={[styles.check, selected && styles.optionTextSelected]}>{selected ? '✔' : ''}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  option: {
    minHeight: 64,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  optionText: { fontSize: 22, fontWeight: '700', color: colors.text },
  optionTextSelected: { color: '#fff' },
  check: { fontSize: font.heading, color: colors.primary },
});
