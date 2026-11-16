import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { catalog } from '../../api/endpoints';
import type { CropDetail, Procedure } from '../../api/types';
import { useApi } from '../../api/useApi';
import { Body, Button, Card, Heading, LoadState, PrototypeBanner, Screen, Segmented, SourceLine, TrustBadge } from '../../components/ui';
import { categoryIcon, cropLook, stageIcon } from '../../data/look';
import { useLanguage } from '../../i18n/LanguageContext';
import { colors, font, radius, spacing } from '../../theme/theme';
import { stageTiming } from '../../utils/format';

type Tab = 'steps' | 'overview' | 'sources';

/** Route param is the crop slug from the API (e.g. "rice"). */
export default function CropScreen() {
  const { cropId: slug } = useLocalSearchParams<{ cropId: string }>();
  const { t, lang } = useLanguage();
  const [tab, setTab] = useState<Tab>('steps');
  const [guideIndex, setGuideIndex] = useState(0);

  const crop = useApi(slug ? `crop:${lang}:${slug}` : null, () => catalog.crop(slug!));
  const guideId = crop.data?.guides[guideIndex]?.id ?? null;
  const guide = useApi(guideId ? `procedure:${lang}:${guideId}` : null, () => catalog.procedure(guideId!));
  const look = cropLook(slug);

  return (
    <Screen
      footer={
        crop.data ? (
          <Button
            icon="🌱"
            label={t('startTracking')}
            onPress={() => router.push({ pathname: '/start/[slug]', params: { slug: crop.data!.slug, ...(guideId ? { procedureId: guideId } : {}) } })}
          />
        ) : undefined
      }
    >
      <Stack.Screen options={{ title: crop.data?.name ?? '' }} />
      <LoadState loading={crop.loading} error={crop.error} offline={crop.offline} hasData={Boolean(crop.data)} onRetry={crop.reload} />

      {crop.data && (
        <>
          <View style={[styles.hero, { backgroundColor: look.color }]}>
            <Text style={styles.heroEmoji}>{look.icon}</Text>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.heroTitle}>{crop.data.name}</Text>
              {crop.data.scientificName ? <Text style={styles.heroSub}>{crop.data.scientificName}</Text> : null}
              <View style={styles.catRow}>
                {crop.data.categories.map((c) => (
                  <Text key={c.slug} style={styles.catPill}>
                    {categoryIcon(c.slug)} {c.name}
                  </Text>
                ))}
              </View>
            </View>
          </View>

          <Segmented<Tab>
            value={tab}
            onChange={setTab}
            options={[
              { id: 'steps', icon: '🪜', label: t('tabSteps') },
              { id: 'overview', icon: '📄', label: t('tabOverview') },
              { id: 'sources', icon: '📚', label: t('sources') },
            ]}
          />

          {tab === 'steps' && (
            <>
              {crop.data.guides.length > 1 && (
                <Segmented<string>
                  value={String(guideIndex)}
                  onChange={(v) => setGuideIndex(Number(v))}
                  options={crop.data.guides.map((g, i) => ({ id: String(i), label: g.name }))}
                />
              )}
              {crop.data.guides.length === 0 && (
                <Card>
                  <Body muted>{t('noGuide')}</Body>
                </Card>
              )}
              {guideId && <LoadState loading={guide.loading} error={guide.error} offline={guide.offline} hasData={Boolean(guide.data)} onRetry={guide.reload} />}
              {guide.data && <Steps guide={guide.data} />}
            </>
          )}
          {tab === 'overview' && <Overview crop={crop.data} />}
          {tab === 'sources' && <Sources crop={crop.data} guide={guide.data} />}
          <PrototypeBanner />
        </>
      )}
    </Screen>
  );
}

function Steps({ guide }: { guide: Procedure }) {
  const { t } = useLanguage();
  return (
    <View style={{ gap: spacing.sm }}>
      <View style={styles.headRow}>
        <Heading>{guide.name}</Heading>
      </View>
      <TrustBadge trust={guide.trust} />
      {guide.description ? <Body muted>{guide.description}</Body> : null}
      {guide.stages.map((stage, index) => {
        const timing = stageTiming(stage, t);
        return (
          <Pressable
            key={stage.id}
            accessibilityRole="button"
            onPress={() => router.push(`/stage/${guide.id}/${index}`)}
            style={({ pressed }) => [styles.stepRow, pressed && { opacity: 0.85 }]}
          >
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.stepBody}>
              <Text style={styles.stepTitle}>{stage.title}</Text>
              {timing ? <Text style={styles.stepDays}>📅 {timing}</Text> : null}
            </View>
            <View style={styles.stepThumb}>
              <Text style={{ fontSize: 28 }}>{stageIcon(stage.type)}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const MONTHS: Record<string, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};
const monthName = (m: number) => MONTHS.en![m - 1] ?? String(m);

function Overview({ crop }: { crop: CropDetail }) {
  const { t } = useLanguage();
  const fmtReq = (r: CropDetail['requirements'][number]) =>
    r.min !== null || r.max !== null
      ? `${r.min ?? '…'}${r.max !== null && r.max !== r.min ? `–${r.max}` : ''} ${r.unit ?? ''}`.trim()
      : r.level ?? '';
  return (
    <>
      {crop.description ? (
        <Card>
          <Heading>{t('aboutCrop')}</Heading>
          <Body>{crop.description}</Body>
        </Card>
      ) : null}

      <Card>
        <Heading>🗓️ {t('seasons')}</Heading>
        {crop.seasons.length === 0 && <Body muted>{t('notInGuideYet')}</Body>}
        {crop.seasons.map((s, i) => (
          <View key={`${s.code}-${i}`} style={styles.fact}>
            <Text style={styles.factLabel}>
              {s.name}
              {s.sowingStartMonth ? ` · ${monthName(s.sowingStartMonth)}–${monthName(s.sowingEndMonth ?? s.sowingStartMonth)}` : ''}
              {s.region ? ` · ${s.region}` : ''}
            </Text>
            {s.notes ? <Text style={styles.factNote}>{s.notes}</Text> : null}
            <TrustBadge trust={s.trust} />
          </View>
        ))}
      </Card>

      <Card>
        <Heading>🟤 {t('suitableSoils')}</Heading>
        {crop.soils.length === 0 && <Body muted>{t('notInGuideYet')}</Body>}
        {crop.soils.map((s) => (
          <View key={s.code} style={styles.fact}>
            <Text style={styles.factLabel}>{s.name}</Text>
            {s.notes ? <Text style={styles.factNote}>{s.notes}</Text> : null}
            <TrustBadge trust={s.trust} />
          </View>
        ))}
      </Card>

      <Card>
        <Heading>💧 {t('needs')}</Heading>
        {crop.requirements.length === 0 && <Body muted>{t('notInGuideYet')}</Body>}
        {crop.requirements.map((r, i) => (
          <View key={`${r.parameter}-${i}`} style={styles.fact}>
            <Text style={styles.factLabel}>
              {r.name}: {fmtReq(r)}
            </Text>
            {r.notes ? <Text style={styles.factNote}>{r.notes}</Text> : null}
            <TrustBadge trust={r.trust} />
          </View>
        ))}
      </Card>
    </>
  );
}

function Sources({ crop, guide }: { crop: CropDetail; guide: Procedure | null }) {
  const { t } = useLanguage();
  const seen = new Map<string, NonNullable<CropDetail['soils'][number]['source']>>();
  const add = (s: CropDetail['soils'][number]['source']) => {
    if (s && !seen.has(s.id)) seen.set(s.id, s);
  };
  crop.seasons.forEach((s) => add(s.source));
  crop.soils.forEach((s) => add(s.source));
  crop.requirements.forEach((r) => add(r.source));
  guide?.stages.forEach((st) => st.instructions.forEach((i) => add(i.source)));
  return (
    <Card>
      <Heading>📚 {t('sources')}</Heading>
      {[...seen.values()].map((s) => (
        <SourceLine key={s.id} source={s} />
      ))}
      {seen.size === 0 && <Body muted>{t('notInGuideYet')}</Body>}
    </Card>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, borderRadius: radius.lg, padding: spacing.lg },
  heroEmoji: { fontSize: 64 },
  heroTitle: { fontSize: font.title, fontWeight: '800', color: colors.text },
  heroSub: { fontSize: font.small, color: colors.textMuted, fontStyle: 'italic' },
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
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
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
  stepNumber: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  stepBody: { flex: 1 },
  stepTitle: { fontSize: font.body, fontWeight: '700', color: colors.text },
  stepDays: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  stepThumb: { width: 56, height: 48, borderRadius: radius.sm, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  chevron: { fontSize: 26, color: colors.textMuted },
  fact: { gap: 4, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  factLabel: { fontSize: font.body, fontWeight: '700', color: colors.text },
  factNote: { fontSize: font.small, color: colors.textMuted, lineHeight: 21 },
});
