import { Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { farms } from '../api/endpoints';
import type { Farm } from '../api/types';
import { useMyFarm } from '../state/useMyFarm';
import { OptionGrid } from '../components/OptionGrid';
import { Body, Button, Card, ChoiceRow, Field, Heading, LoadState, Screen } from '../components/ui';
import { AREA_UNITS, SOIL_TYPES, WATER_SOURCES } from '../data/farmInputs';
import { useLanguage } from '../i18n/LanguageContext';
import { colors, font, spacing } from '../theme/theme';
import { getDeviceLocation } from '../utils/location';

type Availability = 'PERENNIAL' | 'SEASONAL' | 'UNKNOWN';

export default function FarmScreen() {
  const { t } = useLanguage();
  const my = useMyFarm();

  return (
    <Screen>
      <Stack.Screen options={{ title: `🏡 ${t('myFarm')}` }} />
      <LoadState loading={my.loading} error={my.error} offline={my.offline} hasData={Boolean(my.farm) || my.hasNone} onRetry={my.reload} />
      {my.hasNone && <FarmForm onSaved={my.reload} />}
      {my.farm && <FarmView farm={my.farm} onChanged={my.reload} />}
    </Screen>
  );
}

function PlotFields({
  value,
  onChange,
}: {
  value: { name: string; area: string; unit: string; soil: string | null };
  onChange: (v: { name: string; area: string; unit: string; soil: string | null }) => void;
}) {
  const { t } = useLanguage();
  return (
    <>
      <Field label={t('plotName')} value={value.name} onChange={(name) => onChange({ ...value, name })} placeholder={`${t('plot')} 1`} />
      <Field label={t('landArea')} value={value.area} onChange={(a) => onChange({ ...value, area: a.replace(/[^0-9.]/g, '') })} placeholder="2" numeric />
      <ChoiceRow options={AREA_UNITS.map((u) => ({ id: u.id, label: t(u.key) }))} value={value.unit} onChange={(unit) => onChange({ ...value, unit })} />
      <Text style={styles.q}>🟤 {t('qSoil')}</Text>
      <OptionGrid options={SOIL_TYPES} selected={value.soil ? [value.soil] : []} onToggle={(soil) => onChange({ ...value, soil })} swatch />
    </>
  );
}

function FarmForm({ onSaved }: { onSaved: () => void }) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [plot, setPlot] = useState({ name: '', area: '', unit: 'ACRE', soil: null as string | null });
  const [water, setWater] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Availability>('UNKNOWN');
  const [busy, setBusy] = useState(false);

  const area = Number(plot.area);
  const valid = name.trim().length > 0 && area > 0;

  const save = async () => {
    if (!valid) {
      Alert.alert(t('farmSetup'), t('required'));
      return;
    }
    setBusy(true);
    try {
      const farm = await farms.create({
        name: name.trim(),
        state: 'Karnataka',
        ...(village.trim() ? { village: village.trim() } : {}),
        ...(district.trim() ? { district: district.trim() } : {}),
        ...(coords ?? {}),
      });
      const created = (await farms.addPlot(farm.id, {
        name: plot.name.trim() || `${t('plot')} 1`,
        area,
        areaUnit: plot.unit,
        ...(plot.soil && plot.soil !== 'UNKNOWN' ? { soilType: plot.soil } : {}),
      })) as { id: string };
      for (const type of water) await farms.addWaterSource(farm.id, { type, availability, plotIds: [created.id] });
      onSaved();
    } catch {
      Alert.alert(t('farmSetup'), t('saveError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Heading>🏡 {t('farmSetup')}</Heading>
      <Field label={t('farmName')} value={name} onChange={setName} placeholder={t('farmNamePlaceholder')} />
      <Field label={t('location')} value={village} onChange={setVillage} placeholder={t('villagePlaceholder')} />
      <Field value={district} onChange={setDistrict} placeholder={t('districtPlaceholder')} />
      <Body muted>{t('stateKarnataka')}</Body>
      <View style={{ flexDirection: 'row' }}>
        <Button
          variant="secondary"
          icon="📍"
          label={coords ? t('locationSaved') : t('useMyLocation')}
          onPress={async () => {
            const c = await getDeviceLocation();
            if (c) setCoords(c);
            else Alert.alert(t('location'), t('locationDenied'));
          }}
        />
      </View>
      <PlotFields value={plot} onChange={setPlot} />
      <Text style={styles.q}>💧 {t('qWater')}</Text>
      <Body muted>{t('chooseAll')}</Body>
      <OptionGrid options={WATER_SOURCES} selected={water} onToggle={(id) => setWater((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]))} />
      {water.length > 0 && (
        <>
          <Text style={styles.q}>{t('waterAllYear')}</Text>
          <ChoiceRow<Availability>
            options={[
              { id: 'PERENNIAL', label: t('yesAllYear') },
              { id: 'SEASONAL', label: t('someMonths') },
              { id: 'UNKNOWN', label: t('notSure') },
            ]}
            value={availability}
            onChange={setAvailability}
          />
        </>
      )}
      <View style={{ flexDirection: 'row', marginTop: spacing.md }}>
        <Button label={busy ? t('saving') : `✔ ${t('save')}`} disabled={busy} onPress={save} />
      </View>
    </>
  );
}

function FarmView({ farm, onChanged }: { farm: Farm; onChanged: () => void }) {
  const { t, l } = useLanguage();
  const [adding, setAdding] = useState(false);
  const [plot, setPlot] = useState({ name: '', area: '', unit: 'ACRE', soil: null as string | null });
  const [busy, setBusy] = useState(false);
  const soilName = (code: string | null) => {
    const o = SOIL_TYPES.find((s) => s.id === code);
    return o ? l(o.name) : '—';
  };
  const waterName = (code: string) => {
    const o = WATER_SOURCES.find((s) => s.id === code);
    return o ? `${o.icon} ${l(o.name)}` : code;
  };

  const addLocation = async () => {
    const c = await getDeviceLocation();
    if (!c) return Alert.alert(t('location'), t('locationDenied'));
    try {
      await farms.update(farm.id, c);
      onChanged();
    } catch {
      Alert.alert(t('location'), t('saveError'));
    }
  };

  const addPlot = async () => {
    const area = Number(plot.area);
    if (!(area > 0)) return Alert.alert(t('addPlot'), t('required'));
    setBusy(true);
    try {
      await farms.addPlot(farm.id, {
        name: plot.name.trim() || `${t('plot')} ${farm.plots.length + 1}`,
        area,
        areaUnit: plot.unit,
        ...(plot.soil && plot.soil !== 'UNKNOWN' ? { soilType: plot.soil } : {}),
      });
      setAdding(false);
      setPlot({ name: '', area: '', unit: 'ACRE', soil: null });
      onChanged();
    } catch {
      Alert.alert(t('addPlot'), t('saveError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Card>
        <Text style={styles.farmName}>🏡 {farm.name}</Text>
        <Body muted>{[farm.village, farm.district, farm.state].filter(Boolean).join(', ') || '—'}</Body>
        {farm.latitude !== null ? (
          <Body muted>📍 {t('locationSaved')}</Body>
        ) : (
          <View style={{ flexDirection: 'row' }}>
            <Button variant="secondary" icon="📍" label={t('useMyLocation')} onPress={addLocation} />
          </View>
        )}
      </Card>

      <Heading>{t('plot')}</Heading>
      {farm.plots.map((p) => (
        <Card key={p.id}>
          <Text style={styles.plotName}>🟩 {p.name}</Text>
          <Body muted>
            {p.area} {p.areaUnitSymbol} · {soilName(p.soilType)}
          </Body>
        </Card>
      ))}

      {farm.waterSources.length > 0 && (
        <Card>
          <Heading>💧 {t('waterSource')}</Heading>
          {farm.waterSources.map((w) => (
            <Body key={w.id}>{waterName(w.type)}</Body>
          ))}
        </Card>
      )}

      {adding ? (
        <>
          <PlotFields value={plot} onChange={setPlot} />
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <Button label={t('cancel')} variant="secondary" onPress={() => setAdding(false)} />
            <Button label={busy ? t('saving') : t('save')} disabled={busy} onPress={addPlot} />
          </View>
        </>
      ) : (
        <View style={{ flexDirection: 'row' }}>
          <Button icon="➕" variant="secondary" label={t('addPlot')} onPress={() => setAdding(true)} />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  q: { fontSize: font.heading, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
  farmName: { fontSize: font.heading, fontWeight: '800', color: colors.text },
  plotName: { fontSize: font.body, fontWeight: '800', color: colors.text },
});
