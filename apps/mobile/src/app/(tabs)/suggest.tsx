import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { recommendations } from '../../api/endpoints';
import type { Recommendation } from '../../api/types';
import { OptionGrid } from '../../components/OptionGrid';
import { Body, Button, Card, ChoiceRow, Field, Heading, ProgressBar, PrototypeBanner, Screen, SourceLine } from '../../components/ui';
import { SEASONS, SOIL_TEST_FIELDS, SOIL_TYPES, WATER_SOURCES } from '../../data/farmInputs';
import { cropLook } from '../../data/look';
import { useLanguage } from '../../i18n/LanguageContext';
import type { StringKey } from '../../i18n/strings';
import { useMyFarm } from '../../state/useMyFarm';
import { colors, font, radius, spacing } from '../../theme/theme';

type Answers = {
  village: string;
  district: string;
  soil: string | null;
  water: string[];
  availability: 'PERENNIAL' | 'SEASONAL' | 'UNKNOWN';
  soilTest: Record<string, string>;
  season: string | null;
  budget: string;
  areaAcres: string;
  plotId: string | null;
};

const EMPTY: Answers = {
  village: '',
  district: '',
  soil: null,
  water: [],
  availability: 'UNKNOWN',
  soilTest: {},
  season: null,
  budget: '',
  areaAcres: '',
  plotId: null,
};

const STEPS = ['location', 'soil', 'water', 'soilTest', 'season', 'budget'] as const;
type Step = (typeof STEPS)[number];

export default function SuggestScreen() {
  const { t } = useLanguage();
  const my = useMyFarm();
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
          {my.farm && my.farm.plots[0] && (
            <ChoiceRow
              options={my.farm.plots.map((p) => ({ id: p.id, label: `🏡 ${t('useMyFarm')}: ${p.name}` }))}
              value={answers.plotId}
              onChange={(id) => {
                const plot = my.farm!.plots.find((p) => p.id === id);
                setAnswers((a) => ({
                  ...a,
                  plotId: a.plotId === id ? null : id,
                  soil: plot?.soilType ?? a.soil,
                  water: a.water.length ? a.water : my.farm!.waterSources.map((w) => w.type),
                  availability: (my.farm!.waterSources.find((w) => w.availability === 'PERENNIAL')
                    ? 'PERENNIAL'
                    : my.farm!.waterSources.find((w) => w.availability === 'SEASONAL')
                      ? 'SEASONAL'
                      : a.availability) as Answers['availability'],
                  village: a.village || my.farm!.village || '',
                  district: a.district || my.farm!.district || '',
                  areaAcres: plot && plot.areaUnit === 'ACRE' ? String(plot.area) : a.areaAcres,
                }));
              }}
            />
          )}
          <Field value={answers.village} onChange={(v) => set('village', v)} placeholder={t('villagePlaceholder')} />
          <Field value={answers.district} onChange={(v) => set('district', v)} placeholder={t('districtPlaceholder')} />
          <Body muted>{t('stateKarnataka')}</Body>
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
          {answers.water.length > 0 && (
            <>
              <Text style={styles.subq}>{t('waterAllYear')}</Text>
              <ChoiceRow
                options={[
                  { id: 'PERENNIAL' as const, label: t('yesAllYear') },
                  { id: 'SEASONAL' as const, label: t('someMonths') },
                  { id: 'UNKNOWN' as const, label: t('notSure') },
                ]}
                value={answers.availability}
                onChange={(v) => set('availability', v)}
              />
            </>
          )}
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
          <Field
            label={t('areaAcres')}
            value={answers.areaAcres}
            onChange={(v) => set('areaAcres', v.replace(/[^0-9.]/g, ''))}
            placeholder="2"
            numeric
          />
        </>
      )}
    </Screen>
  );
}

function buildRequest(a: Answers) {
  const soilTest = SOIL_TEST_FIELDS.flatMap((f) => {
    const raw = a.soilTest[f.id]?.trim();
    const value = raw ? Number(raw) : NaN;
    return Number.isFinite(value) ? [{ parameter: f.parameter, value, unit: f.unitCode }] : [];
  });
  const budget = a.budget.trim() ? Number(a.budget) : NaN;
  const area = a.areaAcres.trim() ? Number(a.areaAcres) : NaN;
  return {
    ...(a.plotId ? { plotId: a.plotId } : {}),
    ...(a.district.trim() ? { district: a.district.trim() } : {}),
    state: 'Karnataka',
    ...(a.soil && a.soil !== 'UNKNOWN' ? { soilType: a.soil } : {}),
    ...(a.water.length ? { waterSources: a.water.map((type) => ({ type, availability: a.availability })) } : {}),
    ...(soilTest.length ? { soilTest } : {}),
    ...(a.season ? { season: a.season } : {}),
    ...(Number.isFinite(budget) ? { budget } : {}),
    ...(Number.isFinite(area) && area > 0 ? { area, areaUnit: 'ACRE' } : {}),
  };
}

const MISSING_LABEL: Record<string, StringKey> = {
  LOCATION: 'location', SOIL_TYPE: 'soilType', WATER_SOURCE: 'waterSource', SOIL_TEST: 'soilTest', SEASON: 'season', BUDGET: 'budget',
};
const CRITERION_LABEL: Record<string, StringKey> = {
  SEASON: 'season', SOIL_TYPE: 'soilType', SOIL_TEST: 'soilTest', SOIL_PH: 'soilPh', WATER_NEED: 'waterNeeds', REGION: 'region', BUDGET: 'budget',
};
const RESULT_ICON = { SUITABLE: '✅', CAUTION: '⚠️', UNSUITABLE: '❌', UNKNOWN: '❔' } as const;
const LEVEL_COLOR: Record<string, string> = {
  HIGHLY_SUITABLE: colors.primary, SUITABLE: colors.primary, MODERATELY_SUITABLE: colors.estimate, NOT_SUITABLE: colors.danger, UNKNOWN: colors.pendingText,
};

function Results({ answers, onRestart }: { answers: Answers; onRestart: () => void }) {
  const { t, lang } = useLanguage();
  const [result, setResult] = useState<Recommendation | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    setFailed(false);
    recommendations
      .create(buildRequest(answers))
      .then((r) => alive && setResult(r))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [answers, attempt]);

  return (
    <Screen footer={<Button label={`🔄 ${t('startOver')}`} variant="secondary" onPress={onRestart} />}>
      <Text style={styles.question}>{t('resultsTitle')}</Text>

      {!result && !failed && (
        <Card style={{ alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Body muted>{t('checking')}</Body>
          <Body muted>{t('serverWaking')}</Body>
        </Card>
      )}
      {failed && (
        <Card style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 40 }}>📶</Text>
          <Body>{t('loadError')}</Body>
          <View style={{ flexDirection: 'row', alignSelf: 'stretch' }}>
            <Button label={`↻ ${t('retry')}`} onPress={() => setAttempt((n) => n + 1)} />
          </View>
        </Card>
      )}

      {result && (
        <>
          <Card>
            <Text style={styles.metricLabel}>{t('dataCompleteness')}</Text>
            <Text style={styles.metricValue}>{Math.round(result.dataCompletenessPct ?? 0)}%</Text>
            <ProgressBar value={(result.dataCompletenessPct ?? 0) / 100} />
            {result.missingInputs.length ? (
              <>
                <Text style={[styles.metricLabel, { marginTop: spacing.sm }]}>⚠️ {t('missingInfo')}</Text>
                {result.missingInputs.map((key) => (
                  <Text key={key} style={styles.missingItem}>
                    • {MISSING_LABEL[key] ? t(MISSING_LABEL[key]!) : key}
                  </Text>
                ))}
                <Body muted>{t('missingInfoHelp')}</Body>
                {result.missingInputs.includes('SOIL_TEST') && <Body muted>🧪 {t('soilTestTip')}</Body>}
              </>
            ) : (
              <Body>✅ {t('allInfoGiven')}</Body>
            )}
          </Card>

          <Card style={{ backgroundColor: colors.primaryLight, borderColor: colors.primaryLight }}>
            <Body>{t('ruleNote')}</Body>
          </Card>

          {result.items.map((item) => {
            const look = cropLook(item.crop.slug);
            const levelKey = `suit${item.suitability}` as StringKey;
            return (
              <Card key={item.id}>
                <View style={styles.resultHead}>
                  <View style={[styles.resultIcon, { backgroundColor: look.color }]}>
                    <Text style={{ fontSize: 34 }}>{look.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.resultName}>
                      {item.rank}. {item.crop.name}
                    </Text>
                    <Text style={[styles.level, { color: LEVEL_COLOR[item.suitability] ?? colors.text }]}>{t(levelKey)}</Text>
                  </View>
                </View>
                {item.reasons.map((r, i) => (
                  <View key={i} style={styles.reason}>
                    <Text style={styles.reasonIcon}>{RESULT_ICON[r.result]}</Text>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={styles.reasonTitle}>
                        {CRITERION_LABEL[r.criterion] ? t(CRITERION_LABEL[r.criterion]!) : r.criterion} — {t(`res${r.result}` as StringKey)}
                      </Text>
                      {lang === 'en' || r.observed || r.required ? (
                        <Text style={styles.reasonText}>
                          {lang === 'en' ? r.message : [r.observed, r.required].filter(Boolean).join(' → ')}
                        </Text>
                      ) : null}
                      <SourceLine source={r.source} />
                    </View>
                  </View>
                ))}
                <Button label={`${t('viewGuide')} →`} variant="secondary" onPress={() => router.push(`/crop/${item.crop.slug}`)} />
              </Card>
            );
          })}
          <PrototypeBanner />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stepLabel: { fontSize: font.small, color: colors.textMuted, fontWeight: '600' },
  question: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
  subq: { fontSize: font.heading, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
  soilGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  soilField: { width: '47%', flexGrow: 1, gap: 4 },
  soilLabel: { fontSize: font.small, fontWeight: '700', color: colors.text },
  metricLabel: { fontSize: font.body, fontWeight: '700', color: colors.text },
  metricValue: { fontSize: 32, fontWeight: '800', color: colors.primary },
  missingItem: { fontSize: font.body, color: colors.text },
  resultHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  resultIcon: { width: 60, height: 60, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  resultName: { fontSize: font.heading, fontWeight: '800', color: colors.text },
  level: { fontSize: font.body, fontWeight: '800', marginTop: 2 },
  reason: { flexDirection: 'row', gap: spacing.sm, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  reasonIcon: { fontSize: 18, marginTop: 1 },
  reasonTitle: { fontSize: font.small, fontWeight: '700', color: colors.text },
  reasonText: { fontSize: 13, color: colors.textMuted, lineHeight: 19 },
});
