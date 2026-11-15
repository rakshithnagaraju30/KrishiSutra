import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Body, Button, Card, Heading, ProgressBar, Screen } from '../../components/ui';
import { getCrop, STAGES } from '../../data/catalog';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePlans } from '../../state/PlansContext';
import { colors, font, radius, spacing, TOUCH } from '../../theme/theme';

function shiftDate(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mm}-${dd}`;
}

export default function PlanScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const { t, l } = useLanguage();
  const { plans, toggleStage, updatePlan, removePlan } = usePlans();
  const [confirming, setConfirming] = useState(false);

  const plan = plans.find((p) => p.id === planId);
  const crop = plan ? getCrop(plan.cropId) : undefined;

  if (!plan || !crop) {
    return (
      <Screen>
        <Body>{t('noResults')}</Body>
      </Screen>
    );
  }

  const total = crop.stages.length;
  const done = plan.doneStages.length;

  return (
    <Screen>
      <Stack.Screen options={{ title: l(crop.name) }} />

      <Card>
        <View style={styles.headRow}>
          <View style={[styles.icon, { backgroundColor: crop.color }]}>
            <Text style={{ fontSize: 40 }}>{crop.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{l(crop.name)}</Text>
            <Text style={styles.meta}>
              {t('method')}: {l(crop.method)}
            </Text>
          </View>
        </View>

        <Text style={styles.label}>📅 {t('sowingDate')}</Text>
        <View style={styles.dateRow}>
          <DateButton label="−1" onPress={() => updatePlan(plan.id, { sowingDate: shiftDate(plan.sowingDate, -1) })} />
          <Text style={styles.date}>{plan.sowingDate}</Text>
          <DateButton label="+1" onPress={() => updatePlan(plan.id, { sowingDate: shiftDate(plan.sowingDate, 1) })} />
        </View>

        <Text style={styles.label}>{t('progress')}</Text>
        <ProgressBar value={done / total} />
        <Text style={styles.meta}>{t('stepsDone', { x: done, y: total })}</Text>
      </Card>

      <Heading>{t('growingProcedure')}</Heading>
      <Body muted>{t('markDone')}</Body>
      {crop.stages.map((stageId, index) => {
        const checked = plan.doneStages.includes(index);
        return (
          <View key={stageId} style={[styles.stageRow, checked && styles.stageRowDone]}>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              onPress={() => toggleStage(plan.id, index)}
              style={styles.checkArea}
            >
              <View style={[styles.checkbox, checked && styles.checkboxOn]}>
                {checked && <Text style={styles.checkMark}>✔</Text>}
              </View>
              <Text style={[styles.stageTitle, checked && styles.stageTitleDone]}>
                {index + 1}. {l(STAGES[stageId].title)}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(`/stage/${crop.id}/${index}`)}
              style={styles.guideButton}
            >
              <Text style={styles.guideText}>{t('openGuide')} ›</Text>
            </Pressable>
          </View>
        );
      })}

      <Card style={{ backgroundColor: colors.warningBg, borderColor: colors.warningBg }}>
        <Text style={{ color: colors.warningText, fontSize: font.small }}>🔔 {t('remindersSoon')}</Text>
      </Card>

      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        {confirming ? (
          <>
            <Button label={t('cancel')} variant="secondary" onPress={() => setConfirming(false)} />
            <Button
              label={`🗑 ${t('confirmRemove')}`}
              variant="danger"
              onPress={() => {
                removePlan(plan.id);
                router.back();
              }}
            />
          </>
        ) : (
          <Button label={t('removeCrop')} variant="danger" onPress={() => setConfirming(true)} />
        )}
      </View>
    </Screen>
  );
}

function DateButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.dateButton}>
      <Text style={styles.dateButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: { width: 72, height: 72, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: font.title, fontWeight: '800', color: colors.text },
  meta: { fontSize: 14, color: colors.textMuted },
  label: { fontSize: font.body, fontWeight: '700', color: colors.text, marginTop: spacing.sm },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  date: { flex: 1, textAlign: 'center', fontSize: font.heading, fontWeight: '800', color: colors.text },
  dateButton: {
    width: TOUCH,
    height: TOUCH,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateButtonText: { fontSize: font.body, fontWeight: '800', color: colors.primaryDark },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  stageRowDone: { backgroundColor: '#F1F8F0' },
  checkArea: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, minHeight: 64 },
  checkbox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.primary },
  checkMark: { color: '#fff', fontWeight: '800' },
  stageTitle: { flex: 1, fontSize: font.body, fontWeight: '600', color: colors.text },
  stageTitleDone: { color: colors.textMuted, textDecorationLine: 'line-through' },
  guideButton: {
    alignSelf: 'stretch',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  guideText: { color: colors.primary, fontWeight: '700', fontSize: font.small },
});
