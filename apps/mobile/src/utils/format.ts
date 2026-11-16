import type { StringKey } from '../i18n/strings';
import type { Stage } from '../api/types';

type T = (key: StringKey, vars?: Record<string, string | number>) => string;

/** "Day 15–45 after transplanting", "21 days before transplanting", "Throughout the crop"… only from guide data. */
export function stageTiming(stage: Pick<Stage, 'startDay' | 'endDay' | 'dayAnchor' | 'isContinuous' | 'type'>, t: T): string {
  const { startDay: a, endDay: b } = stage;
  const anchor = stage.dayAnchor === 'TRANSPLANTING' ? t('afterTransplanting') : stage.dayAnchor === 'SOWING' || stage.dayAnchor === 'PLANTING' ? t('afterSowing') : '';
  if (a !== null && a < 0 && stage.dayAnchor === 'TRANSPLANTING' && (b === null || b <= 0)) return t('daysBeforeTransplanting', { a: -a });
  if (a !== null && b !== null) return `${a === b ? t('dayN', { a }) : t('dayRange', { a, b })} ${anchor}`.trim();
  if (a !== null) return `${stage.isContinuous ? t('fromDay', { a }) : t('dayN', { a })} ${anchor}`.trim();
  if (stage.isContinuous) return t('ongoing');
  if (stage.type === 'HARVESTING' || stage.type === 'POST_HARVEST') return t('whenReady');
  return '';
}

export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function shiftDate(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y!, m! - 1, d! + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function rupees(n: number): string {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}
