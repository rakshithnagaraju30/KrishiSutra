/**
 * Loads translations for many records in one query and returns a lookup that falls back to the
 * canonical English text stored on the record itself.
 *
 *   const t = await loadTranslations(prisma, 'cropId', ids, 'kn');
 *   t(crop.id, 'NAME', crop.commonName)   // Kannada name, or English if not translated yet
 */
import type { PrismaClient } from '../../generated/prisma/client.ts';
import type { TranslatableField } from '../../generated/prisma/enums.ts';
import type { LanguageCode } from '../utils/language.ts';

export type TranslationTarget =
  | 'cropCategoryId'
  | 'cropId'
  | 'cropVarietyId'
  | 'growingProcedureId'
  | 'growingStageId'
  | 'stageInstructionId'
  | 'stageResourceId'
  | 'stageCommonMistakeId'
  | 'mediaAssetId'
  | 'soilTypeId'
  | 'seasonId'
  | 'regionId'
  | 'agronomicParameterId'
  | 'waterSourceTypeId'
  | 'stageTypeId'
  | 'cultivationMethodId';

export type Translate = (id: string, field: TranslatableField, fallback: string) => string;
export type TranslateOptional = (id: string, field: TranslatableField, fallback: string | null) => string | null;

export async function loadTranslations(
  prisma: PrismaClient,
  target: TranslationTarget,
  ids: readonly string[],
  language: LanguageCode,
): Promise<Translate & { optional: TranslateOptional }> {
  const map = new Map<string, string>();
  const unique = [...new Set(ids)];
  if (language !== 'en' && unique.length > 0) {
    const rows = await prisma.translation.findMany({
      where: { [target]: { in: unique }, language: { code: language } },
      select: { [target]: true, field: true, value: true },
    });
    for (const row of rows as unknown as Array<Record<string, string>>) {
      map.set(`${row[target]}:${row.field}`, row.value!);
    }
  }
  const translate = ((id: string, field: TranslatableField, fallback: string) => map.get(`${id}:${field}`) ?? fallback) as Translate & {
    optional: TranslateOptional;
  };
  translate.optional = (id, field, fallback) => map.get(`${id}:${field}`) ?? fallback;
  return translate;
}
