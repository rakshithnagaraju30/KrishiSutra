import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CropGrid } from '../../components/CropTile';
import { Body, Heading, PrototypeBanner, Screen } from '../../components/ui';
import { CATEGORIES, CROPS, cropsInCategory, searchCrops } from '../../data/catalog';
import { useLanguage } from '../../i18n/LanguageContext';
import { colors, font, radius, spacing, TOUCH } from '../../theme/theme';

export default function GrowScreen() {
  const { t, l } = useLanguage();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string>('all');

  const crops = useMemo(() => {
    if (query.trim()) return searchCrops(query);
    return filter === 'all' ? CROPS : cropsInCategory(filter);
  }, [query, filter]);

  return (
    <Screen>
      <Body muted>{t('growSubtitle')}</Body>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={`🔍  ${t('searchPlaceholder')}`}
        placeholderTextColor={colors.textMuted}
        style={styles.search}
        accessibilityLabel={t('searchPlaceholder')}
      />

      {!query.trim() && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label={t('all')} active={filter === 'all'} onPress={() => setFilter('all')} />
          {CATEGORIES.filter((c) => cropsInCategory(c.id).length > 0).map((c) => (
            <Chip
              key={c.id}
              label={`${c.icon} ${l(c.name)}`}
              active={filter === c.id}
              onPress={() => setFilter(c.id)}
            />
          ))}
        </ScrollView>
      )}

      {crops.length ? <CropGrid crops={crops} /> : <Body muted>{t('noResults')}</Body>}

      <Heading>{t('categories')}</Heading>
      <View style={styles.categoryGrid}>
        {CATEGORIES.map((c) => {
          const count = cropsInCategory(c.id).length;
          return (
            <Pressable
              key={c.id}
              accessibilityRole="button"
              onPress={() => router.push(`/category/${c.id}`)}
              style={({ pressed }) => [styles.category, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.categoryIcon}>{c.icon}</Text>
              <Text style={styles.categoryName} numberOfLines={2}>
                {l(c.name)}
              </Text>
              <Text style={styles.categoryCount}>{count > 0 ? `${count}` : t('comingSoon')}</Text>
            </Pressable>
          );
        })}
      </View>
      <PrototypeBanner />
    </Screen>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  search: {
    minHeight: TOUCH,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    fontSize: font.body,
    color: colors.text,
  },
  chips: { gap: spacing.sm, paddingVertical: spacing.xs },
  chip: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: font.small, fontWeight: '600', color: colors.text },
  chipTextActive: { color: '#fff' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  category: {
    width: '31%',
    flexGrow: 1,
    minHeight: 110,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  categoryIcon: { fontSize: 30 },
  categoryName: { fontSize: 14, fontWeight: '700', color: colors.text, textAlign: 'center' },
  categoryCount: { fontSize: 12, color: colors.textMuted },
});
