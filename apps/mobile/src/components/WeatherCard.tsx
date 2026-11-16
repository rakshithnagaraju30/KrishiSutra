import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { weather } from '../api/endpoints';
import { useApi } from '../api/useApi';
import { WEATHER_ICONS } from '../data/look';
import { useLanguage } from '../i18n/LanguageContext';
import { colors, font, radius, spacing } from '../theme/theme';
import { getDeviceLocation } from '../utils/location';
import { Body, Button } from './ui';

const LOCATION_KEY = 'krishisutra.weather.location';
type Coords = { latitude: number; longitude: number };

/** Live weather from the API (Open-Meteo). Uses the farm location, else the phone's location. */
export function WeatherCard({ farmCoords }: { farmCoords: Coords | null }) {
  const { t } = useLanguage();
  const [saved, setSaved] = useState<Coords | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(LOCATION_KEY)
      .then((raw) => raw && setSaved(JSON.parse(raw) as Coords))
      .catch(() => undefined);
  }, []);

  const coords = farmCoords ?? saved;
  const key = coords ? `weather:${coords.latitude.toFixed(2)},${coords.longitude.toFixed(2)}` : null;
  const w = useApi(key, () => weather(coords!.latitude, coords!.longitude));

  const locate = async () => {
    const c = await getDeviceLocation();
    if (!c) return setDenied(true);
    setDenied(false);
    setSaved(c);
    AsyncStorage.setItem(LOCATION_KEY, JSON.stringify(c)).catch(() => undefined);
  };

  if (!coords) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>⛅ {t('weather')}</Text>
        <Body muted>{denied ? t('locationDenied') : t('weatherNeedsLocation')}</Body>
        <View style={{ flexDirection: 'row' }}>
          <Button icon="📍" label={t('useMyLocation')} onPress={locate} />
        </View>
      </View>
    );
  }

  const data = w.data;
  return (
    <Pressable accessibilityRole="button" onPress={w.reload} style={styles.card}>
      <Text style={styles.title}>⛅ {t('weather')}</Text>
      {!data && w.loading && <ActivityIndicator color={colors.primary} />}
      {!data && w.error && <Body muted>{t('loadError')}</Body>}
      {data && (
        <>
          <View style={styles.nowRow}>
            <Text style={styles.nowIcon}>{WEATHER_ICONS[data.current.condition] ?? '🌡️'}</Text>
            <Text style={styles.temp}>{data.current.temperatureC !== null ? `${Math.round(data.current.temperatureC)}°C` : '—'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.meta}>💧 {t('humidity')}: {data.current.relativeHumidityPct ?? '—'}%</Text>
              <Text style={styles.meta}>🌧️ {t('rain')}: {data.current.precipitationMm ?? 0} mm</Text>
              <Text style={styles.meta}>🌬️ {t('wind')}: {data.current.windSpeedKmph ?? '—'} km/h</Text>
            </View>
          </View>
          <View style={styles.days}>
            {data.daily.slice(0, 5).map((d) => (
              <View key={d.date} style={styles.day}>
                <Text style={styles.dayDate}>{d.date.slice(8, 10)}/{d.date.slice(5, 7)}</Text>
                <Text style={styles.dayIcon}>{WEATHER_ICONS[d.condition] ?? '🌡️'}</Text>
                <Text style={styles.dayTemp}>
                  {d.temperatureMaxC !== null ? Math.round(d.temperatureMaxC) : '—'}°/{d.temperatureMinC !== null ? Math.round(d.temperatureMinC) : '—'}°
                </Text>
                <Text style={styles.dayRain}>☔ {d.precipitationProbabilityPct ?? '—'}%</Text>
              </View>
            ))}
          </View>
          {(data.stale || w.offline) && <Text style={styles.small}>{t('weatherOld')}</Text>}
          <Text style={styles.small}>{data.source.attribution}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#E6F1FB', borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
  title: { fontSize: font.heading, fontWeight: '800', color: colors.text },
  nowRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  nowIcon: { fontSize: 44 },
  temp: { fontSize: 36, fontWeight: '800', color: colors.text },
  meta: { fontSize: 14, color: colors.text },
  days: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { alignItems: 'center', gap: 2, flex: 1 },
  dayDate: { fontSize: 12, color: colors.textMuted, fontWeight: '700' },
  dayIcon: { fontSize: 24 },
  dayTemp: { fontSize: 13, fontWeight: '700', color: colors.text },
  dayRain: { fontSize: 12, color: '#2B5C8A' },
  small: { fontSize: 12, color: colors.textMuted },
});
