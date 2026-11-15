import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LanguagePicker } from '../components/LanguagePicker';
import { Button } from '../components/ui';
import { LanguageProvider, useLanguage } from '../i18n/LanguageContext';
import { strings } from '../i18n/strings';
import type { Lang } from '../i18n/types';
import { PlansProvider } from '../state/PlansContext';
import { colors, spacing } from '../theme/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <PlansProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.primary },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: '700' },
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <FirstLaunchLanguageGate />
        </PlansProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

/** Full-screen language choice shown once, before anything else (requirements §4.1). */
function FirstLaunchLanguageGate() {
  const { lang, ready, setLang } = useLanguage();
  const [choice, setChoice] = useState<Lang | null>(null);

  if (!ready) return <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.primary }]} />;
  if (lang) return null;

  const shown: Lang = choice ?? 'kn';
  return (
    <SafeAreaView style={[StyleSheet.absoluteFill, gate.container]}>
      <View style={gate.header}>
        <Text style={gate.logo}>🌱</Text>
        <Text style={gate.appName}>{strings.appName[shown]}</Text>
        <Text style={gate.tagline}>{strings.tagline[shown]}</Text>
      </View>
      <View style={gate.body}>
        <Text style={gate.prompt}>
          {strings.chooseLanguage.kn} / {strings.chooseLanguage.hi} / {strings.chooseLanguage.en}
        </Text>
        <LanguagePicker value={choice} onChange={setChoice} />
      </View>
      <View style={gate.footer}>
        <Button
          label={strings.continue[shown]}
          disabled={!choice}
          onPress={() => choice && setLang(choice)}
        />
      </View>
    </SafeAreaView>
  );
}

const gate = StyleSheet.create({
  container: { backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingVertical: spacing.xl * 1.5,
    gap: spacing.xs,
  },
  logo: { fontSize: 56 },
  appName: { fontSize: 32, fontWeight: '800', color: '#fff' },
  tagline: { fontSize: 18, color: '#E3F2E5' },
  body: { flex: 1, padding: spacing.xl, gap: spacing.lg },
  prompt: { fontSize: 18, fontWeight: '600', color: colors.text, textAlign: 'center', lineHeight: 28 },
  footer: { flexDirection: 'row', padding: spacing.xl },
});
