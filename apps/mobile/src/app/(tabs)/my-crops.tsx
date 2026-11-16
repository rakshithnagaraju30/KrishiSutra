import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { farmCrops } from '../../api/endpoints';
import { useApi } from '../../api/useApi';
import { Body, Button, Card, LoadState, ProgressBar, Screen } from '../../components/ui';
import { cropLook } from '../../data/look';
import { useLanguage } from '../../i18n/LanguageContext';
import { colors, font, radius, spacing } from '../../theme/theme';

export default function MyCropsScreen() {
  const { t, lang } = useLanguage();
  const list = useApi(`farmcrops:${lang}`, () => farmCrops.list());
  const first = useRef(true);

  // Refresh when coming back from a crop record (tasks ticked, crop removed…).
  useFocusEffect(
    useCallback(() => {
      if (first.current) first.current = false;
      else list.reload();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  return (
    <Screen>
      <View style={{ flexDirection: 'row' }}>
        <Button variant="secondary" icon="🏡" label={t('myFarm')} onPress={() => router.push('/farm')} />
      </View>
      <LoadState loading={list.loading} error={list.error} offline={list.offline} hasData={Boolean(list.data)} onRetry={list.reload} />

      {list.data && list.data.length === 0 && (
        <Card style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
          <Text style={{ fontSize: 56 }}>🌱</Text>
          <Body muted>{t('myCropsEmpty')}</Body>
          <View style={{ flexDirection: 'row', alignSelf: 'stretch', marginTop: spacing.md }}>
            <Button label={t('goToGrow')} onPress={() => router.navigate('/grow')} />
          </View>
        </Card>
      )}

      {list.data?.map((fc) => {
        const look = cropLook(fc.crop.slug);
        return (
          <Pressable
            key={fc.id}
            accessibilityRole="button"
            onPress={() => router.push(`/plan/${fc.id}`)}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
          >
            <View style={[styles.icon, { backgroundColor: look.color }]}>
              <Text style={{ fontSize: 36 }}>{look.icon}</Text>
            </View>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={styles.name}>{fc.crop.name}</Text>
              <Text style={styles.meta}>
                {fc.plot.name} · {t('sowingDate')}: {fc.plantingDate ?? '—'}
              </Text>
              <ProgressBar value={fc.tasks.total ? fc.tasks.done / fc.tasks.total : 0} />
              <Text style={styles.meta}>{t('stepsDone', { x: fc.tasks.done, y: fc.tasks.total })}</Text>
              {fc.tasks.overdue > 0 && <Text style={[styles.meta, { color: colors.danger, fontWeight: '700' }]}>⏰ {t('overdue')}: {fc.tasks.overdue}</Text>}
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  icon: { width: 64, height: 64, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: font.heading, fontWeight: '800', color: colors.text },
  meta: { fontSize: 14, color: colors.textMuted },
  chevron: { fontSize: 28, color: colors.textMuted },
});
