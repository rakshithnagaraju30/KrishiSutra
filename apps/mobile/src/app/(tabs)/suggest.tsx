import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Badge, Body, Button, Card, Heading, ProgressBar, PrototypeBanner, Screen } from '../../components/ui';
import { CROPS, getCategory } from '../../data/catalog';
import { SEASONS, SOIL_TEST_FIELDS, SOIL_TYPES, WATER_SOURCES, type Option } from '../../data/farmInputs';
import { useLanguage } from '../../i18n/LanguageContext';
import type { StringKey } from '../../i18n/strings';
import { colors, font, radius, spacing, TOUCH } from '../../theme/theme';

type Answers = {
  village: string;
  district: string;
  soil: string | null;
  water: string[];
  soilTest: Record<string, string>;
  season: string | null;
  budget: string;
};

const EMPTY: Answers = {
  village: '',
  district: '',
  soil: null,
  water: [],
  soilTest: {},
  season: null,
  budget: '',
};

const STEPS = ['location', 'soil', 'water', 'soilTest', 'season', 'budget'] as const;
type Step = (typeof STEPS)[number];

export default function SuggestScreen() {
  const { t } = useLanguage();
  const [answers, setAnswers] = useState<Answers>(EMPTY);
  const [step, setStep] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const set = <K extends keyof Answers>(key: K, value: Answers[K]) => setAnswers((a) => ({ ...a, [key]: value }));

  if (showResults) {
    return (
      <Results
        answers={answers}
        onRestart={() => {
          setAnswers(EMPTY);
          setStep(0);
          setShowResults(false);
        }}
      />
    );
  }

  const current: Step = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const optional = current === 'soilTest' || current === 'budget';
  const next = () => (isLast ? setShowResults(true) : setStep((s) => s + 1));

  return (
    <Screen
      footer={
        <>
          <Button
            label={`← ${t('back')}`}
            variant="secondary"
            disabled={step === 0}
            onPress={() => setStep((s) => s - 1)}
          />
          <Button label={isLast ? t('seeResults') : optional ? `${t('skip')} / ${t('next')}` : `${t('next')} →`} onPress={next} />
        </>
      }
    >
      <Text style={styles.stepLabel}>{t('wizardStep', { x: step + 1, y: STEPS.length })}</Text>
      <ProgressBar value={(step + 1) / STEPS.length} />

      {current === 'location' && (
        <>
          <Text style={styles.question}>📍 {t('qLocation')}</Text>
          <Field value={answers.village} onChange={(v) => set('village', v)} placeholder={t('villagePlaceholder')} />
          <Field value={answers.district} onChange={(v) => set('district', v)} placeholder={t('districtPlaceholder')} />
          <Body muted>{t('stateKarnataka')}</Body>
          <Body muted>🛰️ {t('gpsSoon')}</Body>
        </>
      )}

      {current === 'soil' && (
        <>
          <Text style={styles.question}>🟤 {t('qSoil')}</Text>
          <OptionGrid options={SOIL_TYPES} selected={answers.soil ? [answers.soil] : []} onToggle={(id) => set('soil', id)} swatch />
        </>
      )}

      {current === 'water' && (
        <>
          <Text style={styles.question}>💧 {t('qWater')}</Text>
          <Body muted>{t('chooseAll')}</Body>
          <OptionGrid
            options={WATER_SOURCES}
            selected={answers.water}
            onToggle={(id) =>
              set('water', answers.water.includes(id) ? answers.water.filter((w) => w !== id) : [...answers.water, id])
            }
          />
        </>
      )}

      {current === 'soilTest' && (
        <>
          <Text style={styles.question}>🧪 {t('qSoilTest')}</Text>
          <Body muted>{t('soilTestHelp')}</Body>
          <View style={styles.soilGrid}>
            {SOIL_TEST_FIELDS.map((f) => (
              <View key={f.id} style={styles.soilField}>
                <Text style={styles.soilLabel}>
                  {f.label}
                  {f.unit ? ` (${f.unit})` : ''}
                </Text>
                <Field
                  value={answers.soilTest[f.id] ?? ''}
                  onChange={(v) => set('soilTest', { ...answers.soilTest, [f.id]: v.replace(/[^0-9.]/g, '') })}
                  placeholder="—"
                  numeric
                />
              </View>
            ))}
          </View>
        </>
      )}

      {current === 'season' && (
        <>
          <Text style={styles.question}>🗓️ {t('qSeason')}</Text>
          <OptionGrid
            options={SEASONS}
            selected={answers.season ? [answers.season] : []}
            onToggle={(id) => set('season', id)}
          />
        </>
      )}

      {current === 'budget' && (
        <>
          <Text style={styles.question}>₹ {t('qBudget')}</Text>
          <Field
            value={answers.budget}
            onChange={(v) => set('budget', v.replace(/[^0-9]/g, ''))}
            placeholder={t('budgetPlaceholder')}
            numeric
          />
        </>
      )}
    </Screen>
  );
}

function Results({ answers, onRestart }: { answers: Answers; onRestart: () => void }) {
  const { t, l } = useLanguage();

  const checks: [StringKey, boolean][] = [
    ['location', Boolean(answers.village.trim() || answers.district.trim())],
    ['soilType', Boolean(answers.soil && answers.soil !== 'unknown')],
    ['waterSource', answers.water.length > 0],
    ['soilTest', Object.values(answers.soilTest).some((v) => v.trim() !== '')],
    ['season', Boolean(answers.season)],
    ['budget', answers.budget.trim() !== ''],
  ];
  const given = checks.filter(([, ok]) => ok).length;
  const missing = checks.filter(([, ok]) => !ok).map(([key]) => key);

  return (
    <Screen footer={<Button label={`🔄 ${t('startOver')}`} variant="secondary" onPress={onRestart} />}>
      <Text style={styles.question}>{t('resultsTitle')}</Text>
      <PrototypeBanner />

      <Card>
        <Text style={styles.metricLabel}>{t('dataCompleteness')}</Text>
        <Text style={styles.metricValue}>
          {given} / {checks.length}
        </Text>
        <ProgressBar value={given / checks.length} />
        {missing.length ? (
          <>
            <Text style={[styles.metricLabel, { marginTop: spacing.sm }]}>⚠️ {t('missingInfo')}</Text>
            {missing.map((key) => (
              <Text key={key} style={styles.missingItem}>
                • {t(key)}
              </Text>
            ))}
            <Body muted>{t('missingInfoHelp')}</Body>
            {missing.includes('soilTest') && <Body muted>🧪 {t('soilTestTip')}</Body>}
          </>
        ) : (
          <Body>✅ {t('allInfoGiven')}</Body>
        )}
      </Card>

      <Card style={{ backgroundColor: colors.primaryLight, borderColor: colors.primaryLight }}>
        <Body>{t('resultsPrototypeNote')}</Body>
      </Card>

      <Heading>{t('supportedCropsNote')}</Heading>
      {CROPS.map((crop) => (
        <Card key={crop.id}>
          <View style={styles.resultHead}>
            <View style={[styles.resultIcon, { backgroundColor: crop.color }]}>
              <Text style={{ fontSize: 34 }}>{crop.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.resultName}>{l(crop.name)}</Text>
              <Text style={styles.resultCats}>
                {crop.categoryIds.map((id) => l(getCategory(id)?.name ?? { en: id, kn: id, hi: id })).join(' · ')}
              </Text>
            </View>
          </View>
          <ResultRow label={t('suitability')} value={t('notCalculated')} />
          <ResultRow label={t('whyRecommended')} value={t('pendingVerified')} />
          <ResultRow label={t('duration')} value={t('pendingVerified')} />
          <ResultRow label={t('costOfCultivation')} value={t('notAvailable')} />
          <ResultRow label={t('expectedYield')} value={t('notAvailable')} />
          <ResultRow label={t('risks')} value={t('pendingVerified')} />
          <Button label={`${t('viewGuide')} →`} variant="secondary" onPress={() => router.push(`/crop/${crop.id}`)} />
        </Card>
      ))}
    </Screen>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.resultRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.resultLabel}>{label}</Text>
        <Text style={styles.resultValue}>{value}</Text>
      </View>
      <Badge kind="pending" />
    </View>
  );
}

function Field({
  value,
  onChange,
  placeholder,
  numeric,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  numeric?: boolean;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      keyboardType={numeric ? 'decimal-pad' : 'default'}
      accessibilityLabel={placeholder}
      style={styles.input}
    />
  );
}

function OptionGrid({
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
            {swatch ? (
              <View style={[styles.swatch, { backgroundColor: o.color }]} />
            ) : (
              <Text style={styles.optionIcon}>{o.icon}</Text>
            )}
            <Text style={[styles.optionText, active && { color: '#fff' }]}>{l(o.name)}</Text>
            {active && <Text style={styles.optionCheck}>✔</Text>}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  stepLabel: { fontSize: font.small, color: colors.textMuted, fontWeight: '600' },
  question: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
  input: {
    minHeight: TOUCH,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    fontSize: font.body,
    color: colors.text,
  },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  option: {
    width: '48%',
    flexGrow: 1,
    minHeight: 104,
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
  soilGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  soilField: { width: '47%', flexGrow: 1, gap: 4 },
  soilLabel: { fontSize: font.small, fontWeight: '700', color: colors.text },
  metricLabel: { fontSize: font.body, fontWeight: '700', color: colors.text },
  metricValue: { fontSize: 32, fontWeight: '800', color: colors.primary },
  missingItem: { fontSize: font.body, color: colors.text },
  resultHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  resultIcon: { width: 60, height: 60, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  resultName: { fontSize: font.heading, fontWeight: '800', color: colors.text },
  resultCats: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultLabel: { fontSize: font.small, fontWeight: '700', color: colors.text },
  resultValue: { fontSize: 13, color: colors.textMuted },
});
