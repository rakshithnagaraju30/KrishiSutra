import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { catalog } from '../../../api/endpoints';
import type { Instruction } from '../../../api/types';
import { useApi } from '../../../api/useApi';
import { ListenButton } from '../../../components/ListenButton';
import { Body, Button, Card, Heading, LoadState, ProgressBar, PrototypeBanner, Screen, SourceLine, TrustBadge } from '../../../components/ui';
import { cropLook, stageIcon } from '../../../data/look';
import { useLanguage } from '../../../i18n/LanguageContext';
import type { StringKey } from '../../../i18n/strings';
import { colors, font, radius, spacing } from '../../../theme/theme';
import { stageTiming } from '../../../utils/format';

const TYPE_LOOK: Record<Instruction['type'], { icon: string; label: StringKey | null; bg: string; fg: string }> = {
  ACTION: { icon: '', label: null, bg: colors.surface, fg: colors.text },
  TIP: { icon: '💡', label: 'tip', bg: colors.warningBg, fg: colors.warningText },
  PRECAUTION: { icon: '⚠️', label: 'insPrecaution', bg: '#FDECEA', fg: colors.danger },
  DECISION: { icon: '🤔', label: 'insDecision', bg: '#E6EEF8', fg: '#2B5C8A' },
  OBSERVATION: { icon: '👀', label: 'insObservation', bg: colors.primaryLight, fg: colors.primaryDark },
};

export default function StageScreen() {
  const params = useLocalSearchParams<{ procedureId: string; stageIndex: string }>();
  const { t, lang } = useLanguage();
  const id = params.procedureId;
  const guide = useApi(id ? `procedure:${lang}:${id}` : null, () => catalog.procedure(id!));
  const index = Number(params.stageIndex ?? 0);

  const stages = guide.data?.stages ?? [];
  const stage = stages[index];
  const total = stages.length;

  if (!stage) {
    return (
      <Screen>
        <LoadState loading={guide.loading} error={guide.error} offline={guide.offline} hasData={Boolean(guide.data)} onRetry={guide.reload} />
        {guide.data && <Body>{t('noResults')}</Body>}
      </Screen>
    );
  }

  const timing = stageTiming(stage, t);
  const spoken = [stage.title, stage.description ?? '', ...stage.instructions.map((i) => `${i.title}. ${i.description}`)].join('. ');
  const goTo = (i: number) => router.replace(`/stage/${id}/${i}`);

  return (
    <Screen
      footer={
        <>
          <Button label={`← ${t('previous')}`} variant="secondary" disabled={index === 0} onPress={() => goTo(index - 1)} />
          {index < total - 1 ? (
            <Button label={`${t('next')} →`} onPress={() => goTo(index + 1)} />
          ) : (
            <Button label={`✔ ${t('finish')}`} onPress={() => router.back()} />
          )}
        </>
      }
    >
      <Stack.Screen options={{ title: t('stepXofY', { x: index + 1, y: total }) }} />
      <ProgressBar value={(index + 1) / total} />
      {guide.offline && <LoadState loading={false} error={null} offline hasData onRetry={guide.reload} />}

      <View style={styles.media}>
        <Text style={styles.mediaEmoji}>{stageIcon(stage.type)}</Text>
        <Text style={styles.mediaCrop}>{cropLook(guide.data?.crop.slug).icon}</Text>
      </View>

      <Text style={styles.title}>{stage.title}</Text>
      {timing ? <Text style={styles.timing}>📅 {timing}</Text> : null}
      {stage.description ? <Body muted>{stage.description}</Body> : null}
      <ListenButton text={spoken} />

      <Card>
        <View style={styles.headRow}>
          <Heading>{t('howToDoIt')}</Heading>
        </View>
        {guide.data && <TrustBadge trust={guide.data.trust} />}
        {stage.instructions.map((ins, i) => {
          const look = TYPE_LOOK[ins.type] ?? TYPE_LOOK.ACTION;
          return (
            <View key={ins.sequence} style={[styles.instruction, look.label && { backgroundColor: look.bg, borderRadius: radius.md, padding: spacing.md }]}>
              <View style={styles.bullet}>
                <Text style={styles.bulletText}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                {look.label ? (
                  <Text style={[styles.typeLabel, { color: look.fg }]}>
                    {look.icon} {t(look.label)}
                  </Text>
                ) : null}
                <Text style={styles.insTitle}>{ins.title}</Text>
                <Text style={styles.instructionText}>{ins.description}</Text>
                {ins.safetyLevel !== 'NONE' && ins.safetyInfo && ins.safetyInfo !== ins.description ? (
                  <Text style={styles.safety}>
                    ⚠️ {t('safetyCaution')}: {ins.safetyInfo}
                  </Text>
                ) : null}
                <SourceLine source={ins.source} />
              </View>
            </View>
          );
        })}
      </Card>

      <Card>
        <Heading>🧰 {t('materials')}</Heading>
        {stage.resources.length === 0 && <Body muted>{t('noneForStep')}</Body>}
        {stage.resources.map((r, i) => (
          <Text key={i} style={styles.listItem}>
            • {r.name}
            {r.description ? ` — ${r.description}` : ''}
          </Text>
        ))}
      </Card>

      <Card>
        <Heading>❌ {t('commonMistakes')}</Heading>
        {stage.mistakes.length === 0 && <Body muted>{t('noneForStep')}</Body>}
        {stage.mistakes.map((m, i) => (
          <View key={i} style={{ gap: 4 }}>
            <Text style={styles.insTitle}>{m.title}</Text>
            {m.consequence ? (
              <Text style={styles.instructionText}>
                {t('mistakeWhy')}: {m.consequence}
              </Text>
            ) : null}
            {m.prevention ? (
              <Text style={styles.instructionText}>
                ✅ {t('mistakeAvoid')}: {m.prevention}
              </Text>
            ) : null}
            <SourceLine source={m.source} />
          </View>
        ))}
      </Card>

      {stage.media.length === 0 && (
        <Card style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 40 }}>▶️ 🖼️</Text>
          <Body muted>{t('videoPending')}</Body>
        </Card>
      )}

      <PrototypeBanner />
    </Screen>
  );
}

const styles = StyleSheet.create({
  media: { height: 160, borderRadius: radius.lg, backgroundColor: '#CFE3C8', alignItems: 'center', justifyContent: 'center' },
  mediaEmoji: { fontSize: 80 },
  mediaCrop: { position: 'absolute', right: spacing.lg, bottom: spacing.md, fontSize: 32 },
  title: { fontSize: font.title, fontWeight: '800', color: colors.text },
  timing: { fontSize: font.body, fontWeight: '700', color: colors.primaryDark },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  instruction: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start', paddingVertical: spacing.sm },
  bullet: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  bulletText: { color: '#fff', fontWeight: '800' },
  typeLabel: { fontSize: 13, fontWeight: '800' },
  insTitle: { fontSize: font.body, fontWeight: '800', color: colors.text },
  instructionText: { fontSize: font.body, lineHeight: 25, color: colors.text },
  safety: { fontSize: font.small, lineHeight: 21, color: colors.danger, fontWeight: '600' },
  listItem: { fontSize: font.body, lineHeight: 25, color: colors.text },
});
