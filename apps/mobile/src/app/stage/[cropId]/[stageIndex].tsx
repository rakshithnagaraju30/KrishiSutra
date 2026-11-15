import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ListenButton } from '../../../components/ListenButton';
import { Badge, Body, Button, Card, Heading, ProgressBar, PrototypeBanner, Screen, Segmented } from '../../../components/ui';
import { getCrop, STAGES } from '../../../data/catalog';
import { useLanguage } from '../../../i18n/LanguageContext';
import { colors, font, radius, spacing } from '../../../theme/theme';

type Tab = 'guide' | 'video' | 'images';

export default function StageScreen() {
  const params = useLocalSearchParams<{ cropId: string; stageIndex: string }>();
  const crop = getCrop(params.cropId);
  const index = Number(params.stageIndex ?? 0);
  const { t, l } = useLanguage();
  const [tab, setTab] = useState<Tab>('guide');

  if (!crop || !Number.isInteger(index) || index < 0 || index >= crop.stages.length) {
    return (
      <Screen>
        <Body>{t('noResults')}</Body>
      </Screen>
    );
  }

  const total = crop.stages.length;
  const stage = STAGES[crop.stages[index]];
  const title = l(stage.title);
  const description = t('stageDescription', { crop: l(crop.name), stage: title });
  const instructions = [1, 2, 3].map((n) => t('sampleInstruction', { n }));
  const spoken = [title, description, ...instructions].join('. ');

  const goTo = (i: number) => router.replace(`/stage/${crop.id}/${i}`);

  return (
    <Screen
      footer={
        <>
          <Button
            label={`← ${t('previous')}`}
            variant="secondary"
            disabled={index === 0}
            onPress={() => goTo(index - 1)}
          />
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

      <View style={styles.media}>
        <Text style={styles.mediaEmoji}>{stage.icon}</Text>
        <Text style={styles.mediaCrop}>{crop.icon}</Text>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Body muted>{description}</Body>
      <ListenButton text={spoken} />

      <Segmented<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { id: 'guide', label: t('guide') },
          { id: 'video', label: t('video') },
          { id: 'images', label: t('images') },
        ]}
      />

      {tab === 'guide' && (
        <>
          <Card>
            <View style={styles.headRow}>
              <Heading>{t('howToDoIt')}</Heading>
              <Badge kind="pending" />
            </View>
            {instructions.map((text, i) => (
              <View key={i} style={styles.instruction}>
                <View style={styles.bullet}>
                  <Text style={styles.bulletText}>{i + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{text}</Text>
              </View>
            ))}
          </Card>
          <InfoCard icon="🧰" title={t('materials')} />
          <InfoCard icon="❌" title={t('commonMistakes')} />
          <InfoCard icon="⚠️" title={t('warnings')} />
          <View style={styles.tip}>
            <Text style={styles.tipTitle}>💡 {t('tip')}</Text>
            <Text style={styles.tipText}>{t('samplePlaceholder')}</Text>
          </View>
          <Card>
            <Text style={styles.sourceLabel}>📚 {t('source')}</Text>
            <Body muted>{t('sourcePending')}</Body>
          </Card>
        </>
      )}

      {tab === 'video' && (
        <Card style={styles.mediaCard}>
          <Text style={{ fontSize: 48 }}>▶️</Text>
          <Body muted>{t('videoPending')}</Body>
        </Card>
      )}

      {tab === 'images' && (
        <Card style={styles.mediaCard}>
          <Text style={{ fontSize: 48 }}>🖼️</Text>
          <Body muted>{t('imagesPending')}</Body>
        </Card>
      )}

      <PrototypeBanner />
    </Screen>
  );
}

function InfoCard({ icon, title }: { icon: string; title: string }) {
  const { t } = useLanguage();
  return (
    <Card>
      <Heading>
        {icon} {title}
      </Heading>
      <Body muted>{t('samplePlaceholder')}</Body>
    </Card>
  );
}

const styles = StyleSheet.create({
  media: {
    height: 180,
    borderRadius: radius.lg,
    backgroundColor: '#CFE3C8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaEmoji: { fontSize: 80 },
  mediaCrop: { position: 'absolute', right: spacing.lg, bottom: spacing.md, fontSize: 32 },
  title: { fontSize: font.title, fontWeight: '800', color: colors.text },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  instruction: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  bullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  bulletText: { color: '#fff', fontWeight: '800' },
  instructionText: { flex: 1, fontSize: font.body, lineHeight: 25, color: colors.text },
  tip: { backgroundColor: colors.warningBg, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.xs },
  tipTitle: { fontSize: font.body, fontWeight: '800', color: colors.warningText },
  tipText: { fontSize: font.body, color: colors.warningText, lineHeight: 25 },
  sourceLabel: { fontSize: font.body, fontWeight: '700', color: colors.text },
  mediaCard: { alignItems: 'center', paddingVertical: spacing.xl },
});
