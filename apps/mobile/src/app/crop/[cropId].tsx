import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Badge, Body, Button, Card, Heading, PendingFact, PrototypeBanner, Screen, Segmented } from '../../components/ui';
import { getCategory, getCrop, STAGES, type Crop } from '../../data/catalog';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePlans } from '../../state/PlansContext';
import { colors, font, radius, spacing } from '../../theme/theme';

type Tab = 'overview' | 'steps' | 'calendar' | 'cost' | 'tips';

export default function CropScreen() {
  const { cropId } = useLocalSearchParams<{ cropId: string }>();
  const crop = getCrop(cropId);
  const { t, l } = useLanguage();
  const { plans, addPlan } = usePlans();
  const [tab, setTab] = useState<Tab>('steps');

  if (!crop) {
    return (
      <Screen>
        <Body>{t('noResults')}</Body>
      </Screen>
    );
  }

  const existing = plans.find((p) => p.cropId === crop.id);

  return (
    <Screen
      footer={
        existing ? (
          <Button icon="📋" label={t('alreadyTracking')} variant="secondary" onPress={() => router.push(`/plan/${existing.id}`)} />
        ) : (
          <Button
            icon="🌱"
            label={t('startTracking')}
            onPress={() => {
              const plan = addPlan(crop.id);
              router.push(`/plan/${plan.id}`);
            }}
          />
        )
      }
    >
      <Stack.Screen options={{ title: l(crop.name) }} />

      <View style={[styles.hero, { backgroundColor: crop.color }]}>
        <Text style={styles.heroEmoji}>{crop.icon}</Text>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.heroTitle}>{l(crop.name)}</Text>
          <Text style={styles.heroSub}>
            {t('method')}: {l(crop.method)}
          </Text>
          <View style={styles.catRow}>
            {crop.categoryIds.map((id) => {
              const c = getCategory(id);
              return c ? (
                <Text key={id} style={styles.catPill}>
                  {c.icon} {l(c.name)}
                </Text>
              ) : null;
            })}
          </View>
        </View>
      </View>

      <Segmented<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { id: 'overview', icon: '📄', label: t('tabOverview') },
          { id: 'steps', icon: '🪜', label: t('tabSteps') },
          { id: 'calendar', icon: '📅', label: t('tabCalendar') },
          { id: 'cost', icon: '₹', label: t('tabCost') },
          { id: 'tips', icon: '💡', label: t('tabTips') },
        ]}
      />

      {tab === 'overview' && <Overview crop={crop} />}
      {tab === 'steps' && <Steps crop={crop} />}
      {tab === 'calendar' && <Calendar crop={crop} />}
      {tab === 'cost' && (
        <Card>
          <PendingFact label={t('costOfCultivation')} />
          <PendingFact label={t('expectedYield')} />
        </Card>
      )}
      {tab === 'tips' && (
        <Card>
          <Heading>💡 {t('tip')}</Heading>
          <Body muted>{t('samplePlaceholder')}</Body>
        </Card>
      )}
      <PrototypeBanner />
    </Screen>
  );
}

function Overview({ crop }: { crop: Crop }) {
  const { t } = useLanguage();
  const [variety, setVariety] = useState(0);
  return (
    <>
      <Card>
        <Body muted>{t('samplePlaceholder')}</Body>
        <PendingFact label={t('duration')} />
        <PendingFact label={t('seasons')} />
        <PendingFact label={t('soilNeeds')} />
        <PendingFact label={t('waterNeeds')} />
      </Card>
      <Heading>{t('chooseVariety')}</Heading>
      <View style={{ gap: spacing.sm }}>
        {[1, 2].map((n, i) => (
          <Pressable
            key={n}
            accessibilityRole="radio"
            accessibilityState={{ selected: variety === i }}
            onPress={() => setVariety(i)}
            style={[styles.variety, variety === i && styles.varietyActive]}
          >
            <Text style={[styles.varietyText, variety === i && { color: '#fff' }]}>
              {crop.icon} {t('sampleVariety')} {n}
            </Text>
            <Badge kind="pending" />
          </Pressable>
        ))}
      </View>
      <Body muted>{t('varietiesPending')}</Body>
    </>
  );
}

function Steps({ crop }: { crop: Crop }) {
  const { t, l } = useLanguage();
  return (
    <View style={{ gap: spacing.sm }}>
      <Heading>{t('growingProcedure')}</Heading>
      {crop.stages.map((stageId, index) => {
        const stage = STAGES[stageId];
        const last = index === crop.stages.length - 1;
        return (
          <Pressable
            key={stageId}
            accessibilityRole="button"
            onPress={() => router.push(`/stage/${crop.id}/${index}`)}
            style={({ pressed }) => [styles.stepRow, pressed && { opacity: 0.85 }]}
          >
            <View style={styles.timeline}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              {!last && <View style={styles.timelineLine} />}
            </View>
            <View style={styles.stepBody}>
              <Text style={styles.stepTitle}>{l(stage.title)}</Text>
              <Text style={styles.stepDays}>{t('daysPending')}</Text>
            </View>
            <View style={styles.stepThumb}>
              <Text style={{ fontSize: 28 }}>{stage.icon}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Calendar({ crop }: { crop: Crop }) {
  const { t, l } = useLanguage();
  return (
    <Card>
      <Body muted>📅 {t('calendarNote')}</Body>
      {crop.stages.map((stageId, index) => (
        <View key={stageId} style={styles.calRow}>
          <Text style={styles.calIndex}>{index + 1}</Text>
          <Text style={styles.calTitle}>{l(STAGES[stageId].title)}</Text>
          <Text style={styles.calDays}>{t('daysPending')}</Text>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, borderRadius: radius.lg, padding: spacing.lg },
  heroEmoji: { fontSize: 64 },
  heroTitle: { fontSize: font.title, fontWeight: '800', color: colors.text },
  heroSub: { fontSize: font.small, color: colors.textMuted, fontWeight: '600' },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  catPill: {
    fontSize: 13,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    color: colors.text,
    overflow: 'hidden',
  },
  variety: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  varietyActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  varietyText: { fontSize: font.body, fontWeight: '700', color: colors.text },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    minHeight: 76,
  },
  timeline: { alignItems: 'center', alignSelf: 'stretch', justifyContent: 'center' },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  timelineLine: { position: 'absolute', top: '75%', width: 2, height: 30, backgroundColor: colors.primaryLight },
  stepBody: { flex: 1 },
  stepTitle: { fontSize: font.body, fontWeight: '700', color: colors.text },
  stepDays: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  stepThumb: {
    width: 56,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: { fontSize: 26, color: colors.textMuted },
  calRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  calIndex: { width: 24, fontWeight: '800', color: colors.primary, fontSize: font.body },
  calTitle: { flex: 1, fontSize: font.small, color: colors.text, fontWeight: '600' },
  calDays: { fontSize: 13, color: colors.textMuted },
});
