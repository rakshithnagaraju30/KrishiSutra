import Constants from 'expo-constants';
import { Text } from 'react-native';
import { LanguagePicker } from '../../components/LanguagePicker';
import { Body, Card, Heading, Screen } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';
import { colors } from '../../theme/theme';

export default function SettingsScreen() {
  const { t, lang, setLang } = useLanguage();
  return (
    <Screen>
      <Heading>🌐 {t('language')}</Heading>
      <LanguagePicker value={lang} onChange={setLang} />
      <Body muted>{t('translationDraft')}</Body>

      <Heading>ℹ️ {t('about')}</Heading>
      <Card>
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.primary }}>
          🌱 {t('appName')} — {t('prototypeTitle')}
        </Text>
        <Body>{t('prototypeAbout')}</Body>
        <Body muted>
          {t('version')}: {Constants.expoConfig?.version ?? '—'}
        </Body>
      </Card>
    </Screen>
  );
}
