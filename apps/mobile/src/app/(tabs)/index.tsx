import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PrototypeBanner, Screen, Title } from '../../components/ui';
import { WeatherCard } from '../../components/WeatherCard';
import { useLanguage } from '../../i18n/LanguageContext';
import type { StringKey } from '../../i18n/strings';
import { useMyFarm } from '../../state/useMyFarm';
import { colors, font, radius, spacing } from '../../theme/theme';

export default function HomeScreen() {
  const { t } = useLanguage();
  const my = useMyFarm();
  const farmCoords = my.farm && my.farm.latitude !== null && my.farm.longitude !== null ? { latitude: my.farm.latitude, longitude: my.farm.longitude } : null;

  return (
    <Screen>
      <Title>{t('homeGreeting')} 🙏</Title>
      <WeatherCard farmCoords={farmCoords} />

      <BigCard
        icon="🧭"
        title={t('homeWhatToGrow')}
        subtitle={t('homeWhatToGrowSub')}
        color="#E3F2E5"
        onPress={() => router.navigate('/suggest')}
      />
      <BigCard
        icon="🌱"
        title={t('homeHowToGrow')}
        subtitle={t('homeHowToGrowSub')}
        color="#FFF4CC"
        onPress={() => router.navigate('/grow')}
      />
      <BigCard
        icon="📋"
        title={t('tabMyCrops')}
        subtitle={t('homeMyCropsSub')}
        color="#E6EEF8"
        onPress={() => router.navigate('/my-crops')}
      />
      <BigCard
        icon="🏡"
        title={my.farm ? my.farm.name : t('myFarm')}
        subtitle={t('myFarmSub')}
        color="#F3E6D3"
        onPress={() => router.push('/farm')}
      />
      <PrototypeBanner />

      <Text style={styles.soonHeading}>{t('comingSoon')}</Text>
      <View style={styles.soonGrid}>
        {(
          [
            ['🧪', 'featSoil'],
            ['₹', 'featMarket'],
            ['🎧', 'featExpert'],
          ] as [string, StringKey][]
        ).map(([icon, key]) => (
          <View key={key} style={styles.soonTile}>
            <Text style={styles.soonIcon}>{icon}</Text>
            <Text style={styles.soonText}>{t(key)}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

function BigCard({
  icon,
  title,
  subtitle,
  color,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.bigCard, { backgroundColor: color }, pressed && { opacity: 0.85 }]}
    >
      <Text style={styles.bigIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.bigTitle}>{title}</Text>
        <Text style={styles.bigSub}>{subtitle}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bigCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    minHeight: 96,
  },
  bigIcon: { fontSize: 42 },
  bigTitle: { fontSize: font.heading, fontWeight: '800', color: colors.text },
  bigSub: { fontSize: font.small, color: colors.textMuted, marginTop: 2 },
  chevron: { fontSize: 32, color: colors.textMuted },
  soonHeading: { fontSize: font.body, fontWeight: '700', color: colors.textMuted, marginTop: spacing.md },
  soonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  soonTile: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    opacity: 0.7,
  },
  soonIcon: { fontSize: 26, color: colors.primary, fontWeight: '800' },
  soonText: { fontSize: font.small, color: colors.text, textAlign: 'center', fontWeight: '600' },
});
