import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Body, Button, Card, ProgressBar, Screen } from '../../components/ui';
import { getCrop } from '../../data/catalog';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePlans } from '../../state/PlansContext';
import { colors, font, radius, spacing } from '../../theme/theme';

export default function MyCropsScreen() {
  const { t, l } = useLanguage();
  const { plans } = usePlans();

  if (!plans.length) {
    return (
      <Screen>
        <Card style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
          <Text style={{ fontSize: 56 }}>🌱</Text>
          <Body muted>{t('myCropsEmpty')}</Body>
          <View style={{ flexDirection: 'row', alignSelf: 'stretch', marginTop: spacing.md }}>
            <Button label={t('goToGrow')} onPress={() => router.navigate('/grow')} />
          </View>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      {plans.map((plan) => {
        const crop = getCrop(plan.cropId);
        if (!crop) return null;
        const total = crop.stages.length;
        const done = plan.doneStages.length;
        return (
          <Pressable
            key={plan.id}
            accessibilityRole="button"
            onPress={() => router.push(`/plan/${plan.id}`)}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
          >
            <View style={[styles.icon, { backgroundColor: crop.color }]}>
              <Text style={{ fontSize: 36 }}>{crop.icon}</Text>
            </View>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={styles.name}>{l(crop.name)}</Text>
              <Text style={styles.meta}>
                {t('sowingDate')}: {plan.sowingDate}
              </Text>
              <ProgressBar value={done / total} />
              <Text style={styles.meta}>{t('stepsDone', { x: done, y: total })}</Text>
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
