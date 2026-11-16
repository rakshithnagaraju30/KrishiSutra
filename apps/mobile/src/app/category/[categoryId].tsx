import { Stack, useLocalSearchParams } from 'expo-router';
import { catalog } from '../../api/endpoints';
import { useApi } from '../../api/useApi';
import { CropGrid } from '../../components/CropTile';
import { Body, Card, LoadState, Screen } from '../../components/ui';
import { categoryIcon } from '../../data/look';
import { useLanguage } from '../../i18n/LanguageContext';

export default function CategoryScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const { t, lang } = useLanguage();
  const tree = useApi(`categories:${lang}`, () => catalog.categories());
  const crops = useApi(categoryId ? `category:${lang}:${categoryId}` : null, () => catalog.crops({ category: categoryId }));
  const node = tree.data?.find((c) => c.slug === categoryId) ?? tree.data?.flatMap((c) => c.children).find((c) => c.slug === categoryId);

  return (
    <Screen>
      <Stack.Screen options={{ title: node ? `${categoryIcon(node.slug)} ${node.name}` : t('categories') }} />
      <LoadState loading={crops.loading} error={crops.error} offline={crops.offline} hasData={Boolean(crops.data)} onRetry={crops.reload} />
      {crops.data &&
        (crops.data.length ? (
          <CropGrid crops={crops.data} />
        ) : (
          <Card>
            <Body muted>{t('noCropsYet')}</Body>
          </Card>
        ))}
    </Screen>
  );
}
