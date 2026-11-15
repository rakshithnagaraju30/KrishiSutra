import { Stack, useLocalSearchParams } from 'expo-router';
import { CropGrid } from '../../components/CropTile';
import { Body, Card, Screen } from '../../components/ui';
import { cropsInCategory, getCategory } from '../../data/catalog';
import { useLanguage } from '../../i18n/LanguageContext';

export default function CategoryScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const { t, l } = useLanguage();
  const category = getCategory(categoryId);
  const crops = category ? cropsInCategory(category.id) : [];

  return (
    <Screen>
      <Stack.Screen options={{ title: category ? `${category.icon} ${l(category.name)}` : t('categories') }} />
      {crops.length ? (
        <CropGrid crops={crops} />
      ) : (
        <Card>
          <Body muted>{t('noCropsYet')}</Body>
        </Card>
      )}
    </Screen>
  );
}
