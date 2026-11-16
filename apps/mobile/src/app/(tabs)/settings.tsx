import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { checkServer, DEFAULT_SERVER, getServer, setServer } from '../../api/client';
import { LanguagePicker } from '../../components/LanguagePicker';
import { Body, Button, Card, Field, Heading, Screen } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';
import { colors, spacing } from '../../theme/theme';

export default function SettingsScreen() {
  const { t, lang, setLang } = useLanguage();
  const [server, setServerText] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'ok' | 'fail'>('idle');

  useEffect(() => {
    getServer().then(setServerText).catch(() => undefined);
  }, []);

  const test = async () => {
    setStatus('checking');
    await setServer(server);
    const current = await getServer();
    setServerText(current);
    const r = await checkServer(current);
    setStatus(r.ok ? 'ok' : 'fail');
  };

  return (
    <Screen>
      <Heading>🌐 {t('language')}</Heading>
      <LanguagePicker value={lang} onChange={setLang} />
      <Body muted>{t('translationDraft')}</Body>

      <Heading>🔒 {t('dataPrivacy')}</Heading>
      <Card>
        <Body>{t('deviceAccount')}</Body>
      </Card>

      <Heading>🖥️ {t('serverAddress')}</Heading>
      <Card>
        <Field value={server} onChange={(v) => { setServerText(v); setStatus('idle'); }} placeholder={DEFAULT_SERVER} />
        <Body muted>{t('serverHelp')}</Body>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <Button variant="secondary" label={t('useDefault')} onPress={() => { setServerText(DEFAULT_SERVER); setStatus('idle'); }} />
          <Button label={status === 'checking' ? t('loading') : t('testConnection')} disabled={status === 'checking'} onPress={test} />
        </View>
        {status === 'ok' && <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 17 }}>{t('connected')}</Text>}
        {status === 'fail' && (
          <>
            <Text style={{ color: colors.danger, fontWeight: '800', fontSize: 17 }}>{t('notConnected')}</Text>
            <Body muted>{t('serverWaking')}</Body>
          </>
        )}
      </Card>

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
