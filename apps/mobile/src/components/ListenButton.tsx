import * as Speech from 'expo-speech';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';
import { useLanguage } from '../i18n/LanguageContext';
import { SPEECH_LOCALES } from '../i18n/types';
import { colors, font, radius, spacing, TOUCH } from '../theme/theme';

/**
 * Reads text aloud with the phone's text-to-speech.
 * Prototype only: the real app will play pre-recorded, reviewed audio (ADR 0011).
 */
export function ListenButton({ text }: { text: string }) {
  const { t, lang } = useLanguage();
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      Speech.stop().catch(() => undefined);
    };
  }, []);

  const onPress = () => {
    if (speaking) {
      Speech.stop().catch(() => undefined);
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    Speech.speak(text, {
      language: SPEECH_LOCALES[lang ?? 'en'],
      rate: 0.9,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => {
        setSpeaking(false);
        Alert.alert(t('listen'), t('speechUnavailable'));
      },
    });
  };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}
    >
      <Text style={styles.text}>{speaking ? `⏹  ${t('stop')}` : `🔊  ${t('listen')}`}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: TOUCH,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  text: { fontSize: font.body, fontWeight: '700', color: colors.primaryDark },
});
