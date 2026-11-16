import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { farmCrops } from '../../api/endpoints';
import { Body, Button, Card, ChoiceRow, Field, Heading, LoadState, Screen } from '../../components/ui';
import { cropLook } from '../../data/look';
import { useLanguage } from '../../i18n/LanguageContext';
import { useMyFarm } from '../../state/useMyFarm';
import { colors, font, radius, spacing, TOUCH } from '../../theme/theme';
import { shiftDate, todayIso } from '../../utils/format';

export default function StartTrackingScreen() {
  const { slug, procedureId } = useLocalSearchParams<{ slug: string; procedureId?: string }>();
  const { t } = useLanguage();
  const my = useMyFarm();
  const [plotId, setPlotId] = useState<string | null>(null);
  const [date, setDate] = useState(todayIso());
  const [area, setArea] = useState('');
  const [busy, setBusy] = useState(false);
  const look = cropLook(slug);

  const plots = my.farm?.plots ?? [];
  const plot = plots.find((p) => p.id === plotId) ?? null;
  useEffect(() => {
    if (!plotId && plots[0]) {
      setPlotId(plots[0].id);
      setArea(String(plots[0].area));
    }
  }, [plotId, plots]);

  const start = async () => {
    const value = Number(area);
    if (!plot || !(value > 0) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return Alert.alert(t('startTracking'), t('required'));
    setBusy(true);
    try {
      const fc = await farmCrops.start({
        plotId: plot.id,
        cropSlug: slug,
        ...(procedureId ? { procedureId } : {}),
        plantingDate: date,
        cultivatedArea: value,
        areaUnit: plot.areaUnit,
      });
      router.replace(`/plan/${fc.id}`);
    } catch {
      Alert.alert(t('startTracking'), t('saveError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen footer={my.farm ? <Button label={busy ? t('saving') : `🌱 ${t('start')}`} disabled={busy || !plot} onPress={start} /> : undefined}>
      <Stack.Screen options={{ title: `${look.icon} ${t('startTracking')}` }} />
      <LoadState loading={my.loading} error={my.error} offline={my.offline} hasData={Boolean(my.farm) || my.hasNone} onRetry={my.reload} />

      {my.hasNone && (
        <Card style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 48 }}>🏡</Text>
          <Body>{t('needFarmFirst')}</Body>
          <View style={{ flexDirection: 'row', alignSelf: 'stretch' }}>
            <Button label={`${t('farmSetup')} →`} onPress={() => router.push('/farm')} />
          </View>
        </Card>
      )}

      {my.farm && (
        <>
          <Heading>{t('choosePlot')}</Heading>
          <ChoiceRow
            options={plots.map((p) => ({ id: p.id, label: `${p.name} · ${p.area} ${p.areaUnitSymbol}` }))}
            value={plotId}
            onChange={(id) => {
              setPlotId(id);
              const p = plots.find((x) => x.id === id);
              if (p) setArea(String(p.area));
            }}
          />

          <Heading>📅 {t('sowingDate')}</Heading>
          <View style={styles.dateRow}>
            <DateButton label="−7" onPress={() => setDate((d) => shiftDate(d, -7))} />
            <DateButton label="−1" onPress={() => setDate((d) => shiftDate(d, -1))} />
            <Text style={styles.date}>{date}</Text>
            <DateButton label="+1" onPress={() => setDate((d) => shiftDate(d, 1))} />
            <DateButton label="+7" onPress={() => setDate((d) => shiftDate(d, 7))} />
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Button variant="secondary" label={t('today')} onPress={() => setDate(todayIso())} />
          </View>

          <Field label={`${t('landArea')}${plot ? ` (${plot.areaUnitSymbol})` : ''}`} value={area} onChange={(v) => setArea(v.replace(/[^0-9.]/g, ''))} numeric />
          <Body muted>{t('noTaskDates')}</Body>
        </>
      )}
    </Screen>
  );
}

function DateButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.dateButton, pressed && { opacity: 0.8 }]}>
      <Text style={styles.dateButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  date: { flex: 1, textAlign: 'center', fontSize: font.heading, fontWeight: '800', color: colors.text },
  dateButton: {
    minWidth: TOUCH,
    minHeight: TOUCH,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateButtonText: { fontSize: font.body, fontWeight: '800', color: colors.primaryDark },
});
