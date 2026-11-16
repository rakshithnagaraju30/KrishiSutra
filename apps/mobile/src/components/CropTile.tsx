import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { CropSummary } from '../api/types';
import { cropLook } from '../data/look';
import { colors, font, radius, spacing } from '../theme/theme';

export function CropTile({ crop }: { crop: CropSummary }) {
  const look = cropLook(crop.slug);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={crop.name}
      onPress={() => router.push(`/crop/${crop.slug}`)}
      style={({ pressed }) => [styles.tile, pressed && { opacity: 0.85 }]}
    >
      <View style={[styles.image, { backgroundColor: look.color }]}>
        <Text style={styles.emoji}>{look.icon}</Text>
      </View>
      <View style={styles.labelRow}>
        <Text style={styles.label} numberOfLines={2}>
          {crop.name}
        </Text>
        <Text style={styles.chevron}>›</Text>
      </View>
    </Pressable>
  );
}

export function CropGrid({ crops }: { crops: CropSummary[] }) {
  return (
    <View style={styles.grid}>
      {crops.map((c) => (
        <View key={c.slug} style={styles.cell}>
          <CropTile crop={c} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xs },
  cell: { width: '50%', padding: spacing.xs },
  tile: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: { height: 104, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 60 },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 56,
  },
  label: { flex: 1, fontSize: font.body, fontWeight: '700', color: colors.text },
  chevron: { fontSize: 26, color: colors.textMuted, marginLeft: spacing.xs },
});
