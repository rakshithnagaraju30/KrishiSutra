import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { catalog } from '../../api/endpoints';
import { useApi } from '../../api/useApi';
import { CropGrid } from '../../components/CropTile';
import { Body, Heading, LoadState, PrototypeBanner, Screen } from '../../components/ui';
import { categoryIcon } from '../../data/look';
import { useLanguage } from '../../i18n/LanguageContext';
import { colors, font, radius, spacing, TOUCH } from '../../theme/theme';

/** Simple on-phone search so it also works offline (names come in the chosen language). */
function matches(name: string, q: string) {
  return name.toLowerCase().includes(q.toLowerCase());
}

export default function GrowScreen() {
  const { t, lang } = useLanguage();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 400);
    return () => clearTimeout(id);
  }, [query]);

  const tree = useApi(`categories:${lang}`, () => catalog.categories());
  const all = useApi(`crops:${lang}`, () => catalog.crops());
  // Server search also finds names in other languages; falls back to on-phone search.
  const search = useApi(debounced ? `search:${lang}:${debounced}` : null, () => catalog.crops({ q: debounced }), { cache: false });

  const roots = tree.data ?? [];
  const crops = useMemo(() => {
    const list = all.data ?? [];
    if (query.trim()) {
      if (search.data && debounced === query.trim()) return search.data;
      return list.filter((c) => matches(c.name, query.trim()));
    }
    if (filter === 'all') return list;
    const node = roots.find((r) => r.slug === filter);
    const slugs = new Set([filter, ...(node?.children.map((c) => c.slug) ?? [])]);
    return list.filter((c) => c.categories.some((cat) => slugs.has(cat.slug)));
  }, [all.data, search.data, query, debounced, filter, roots]);

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

      <LoadState loading={all.loading} error={all.error} offline={all.offline} hasData={Boolean(all.data)} onRetry={() => { all.reload(); tree.reload(); }} />

      {!query.trim() && roots.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label={t('all')} active={filter === 'all'} onPress={() => setFilter('all')} />
          {roots.filter((c) => c.totalCropCount > 0).map((c) => (
            <Chip key={c.slug} label={`${categoryIcon(c.slug)} ${c.name}`} active={filter === c.slug} onPress={() => setFilter(c.slug)} />
          ))}
        </ScrollView>
      )}

      {all.data && (crops.length ? <CropGrid crops={crops} /> : <Body muted>{t('noResults')}</Body>)}

      {roots.length > 0 && <Heading>{t('categories')}</Heading>}
      <View style={styles.categoryGrid}>
        {roots.map((c) => (
          <Pressable
            key={c.slug}
            accessibilityRole="button"
            onPress={() => router.push(`/category/${c.slug}`)}
            style={({ pressed }) => [styles.category, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.categoryIcon}>{categoryIcon(c.slug)}</Text>
            <Text style={styles.categoryName} numberOfLines={2}>
              {c.name}
            </Text>
            <Text style={styles.categoryCount}>{c.totalCropCount > 0 ? `${c.totalCropCount}` : t('comingSoon')}</Text>
          </Pressable>
        ))}
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
