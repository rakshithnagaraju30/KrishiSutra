import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { farmCrops } from '../../api/endpoints';
import type { FarmCrop } from '../../api/types';
import { useApi } from '../../api/useApi';
import { OptionGrid } from '../../components/OptionGrid';
import { Body, Button, Card, ChoiceRow, Field, Heading, LoadState, ProgressBar, Screen } from '../../components/ui';
import { EXPENSE_CATEGORIES, HARVEST_UNITS } from '../../data/farmInputs';
import { cropLook } from '../../data/look';
import { useLanguage } from '../../i18n/LanguageContext';
import { colors, font, radius, spacing } from '../../theme/theme';
import { rupees, todayIso } from '../../utils/format';

/** Route param is the FarmCrop id from the API. */
export default function PlanScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const { t, lang } = useLanguage();
  const rec = useApi(planId ? `farmcrop:${lang}:${planId}` : null, () => farmCrops.get(planId!));
  const [busyTask, setBusyTask] = useState<string | null>(null);

  const fc = rec.data;
  if (!fc) {
    return (
      <Screen>
        <LoadState loading={rec.loading} error={rec.error} offline={rec.offline} hasData={false} onRetry={rec.reload} />
      </Screen>
    );
  }

  const look = cropLook(fc.crop.slug);
  const done = fc.tasks.filter((x) => x.status === 'COMPLETED').length;
  const today = todayIso();

  const toggle = async (task: FarmCrop['tasks'][number]) => {
    setBusyTask(task.id);
    try {
      await farmCrops.setTask(task.id, task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED');
      rec.reload();
    } catch {
      Alert.alert(t('tasks'), t('saveError'));
    } finally {
      setBusyTask(null);
    }
  };

  const remove = () =>
    Alert.alert(t('removeCrop'), t('confirmRemove'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await farmCrops.remove(fc.id);
            router.back();
          } catch {
            Alert.alert(t('removeCrop'), t('saveError'));
          }
        },
      },
    ]);

  return (
    <Screen>
      <Stack.Screen options={{ title: fc.crop.name }} />
      <LoadState loading={false} error={null} offline={rec.offline} hasData onRetry={rec.reload} />

      <Card>
        <View style={styles.headRow}>
          <View style={[styles.icon, { backgroundColor: look.color }]}>
            <Text style={{ fontSize: 40 }}>{look.icon}</Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.name}>{fc.crop.name}</Text>
            <Text style={styles.meta}>
              {fc.farm.name} · {fc.plot.name} · {fc.cultivatedArea} {fc.areaUnitSymbol}
            </Text>
            <Text style={styles.meta}>
              📅 {t('sowingDate')}: {fc.plantingDate ?? '—'}
            </Text>
            {fc.expectedHarvestDate ? (
              <Text style={styles.meta}>
                🧺 {t('expectedHarvest')}: {fc.expectedHarvestDate}
              </Text>
            ) : null}
          </View>
        </View>
        <ProgressBar value={fc.tasks.length ? done / fc.tasks.length : 0} />
        <Text style={styles.meta}>{t('stepsDone', { x: done, y: fc.tasks.length })}</Text>
        {fc.guide && (
          <View style={{ flexDirection: 'row' }}>
            <Button variant="secondary" icon="📖" label={t('openGuide')} onPress={() => router.push(`/stage/${fc.guide!.procedureId}/0`)} />
          </View>
        )}
      </Card>

      <Heading>✅ {t('tasks')}</Heading>
      {fc.tasks.map((task) => {
        const isDone = task.status === 'COMPLETED';
        const late = !isDone && task.dueDate !== null && task.dueDate < today;
        return (
          <Pressable
            key={task.id}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isDone, busy: busyTask === task.id }}
            disabled={busyTask !== null}
            onPress={() => toggle(task)}
            style={({ pressed }) => [styles.task, isDone && styles.taskDone, pressed && { opacity: 0.85 }]}
          >
            <View style={[styles.check, isDone && styles.checkOn]}>
              <Text style={styles.checkText}>{isDone ? '✔' : ''}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.taskTitle, isDone && { textDecorationLine: 'line-through', color: colors.textMuted }]}>{task.title}</Text>
              {task.dueDate ? (
                <Text style={[styles.meta, late && { color: colors.danger, fontWeight: '700' }]}>
                  {late ? `⏰ ${t('overdue')} · ` : ''}
                  {t('dueOn', { date: task.dueDate })}
                </Text>
              ) : null}
            </View>
          </Pressable>
        );
      })}
      {fc.tasks.some((x) => !x.dueDate) && <Body muted>{t('noTaskDates')}</Body>}

      <Expenses fc={fc} onChanged={rec.reload} />
      <Harvests fc={fc} onChanged={rec.reload} />

      <View style={{ flexDirection: 'row', marginTop: spacing.lg }}>
        <Button variant="danger" label={`🗑 ${t('removeCrop')}`} onPress={remove} />
      </View>
    </Screen>
  );
}

function Expenses({ fc, onChanged }: { fc: FarmCrop; onChanged: () => void }) {
  const { t, l } = useLanguage();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const catName = (id: string) => {
    const c = EXPENSE_CATEGORIES.find((x) => x.id === id);
    return c ? `${c.icon} ${l(c.name)}` : id;
  };

  const save = async () => {
    const value = Number(amount);
    if (!category || !(value >= 0) || amount === '') return Alert.alert(t('addExpense'), t('required'));
    setBusy(true);
    try {
      await farmCrops.addExpense(fc.id, { category, amount: value, expenseDate: todayIso() });
      setOpen(false);
      setCategory(null);
      setAmount('');
      onChanged();
    } catch {
      Alert.alert(t('addExpense'), t('saveError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <Heading>₹ {t('expenses')}</Heading>
      {fc.expenses.length === 0 && <Body muted>{t('nothingYet')}</Body>}
      {fc.expenses.map((e) => (
        <View key={e.id} style={styles.row}>
          <Text style={styles.rowLabel}>
            {catName(e.category)} · {e.date}
          </Text>
          <Text style={styles.rowValue}>{rupees(e.amount)}</Text>
        </View>
      ))}
      <View style={styles.row}>
        <Text style={[styles.rowLabel, { fontWeight: '800' }]}>{t('totalSpent')}</Text>
        <Text style={[styles.rowValue, { color: colors.primaryDark }]}>{rupees(fc.totals.expenses)}</Text>
      </View>
      {open ? (
        <>
          <OptionGrid options={EXPENSE_CATEGORIES} selected={category ? [category] : []} onToggle={setCategory} />
          <Field label={t('amountRs')} value={amount} onChange={(v) => setAmount(v.replace(/[^0-9.]/g, ''))} numeric />
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <Button variant="secondary" label={t('cancel')} onPress={() => setOpen(false)} />
            <Button label={busy ? t('saving') : t('save')} disabled={busy} onPress={save} />
          </View>
        </>
      ) : (
        <View style={{ flexDirection: 'row' }}>
          <Button variant="secondary" icon="➕" label={t('addExpense')} onPress={() => setOpen(true)} />
        </View>
      )}
    </Card>
  );
}

function Harvests({ fc, onChanged }: { fc: FarmCrop; onChanged: () => void }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState<string>('KILOGRAM');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    const value = Number(qty);
    if (!(value > 0)) return Alert.alert(t('addHarvest'), t('required'));
    setBusy(true);
    try {
      await farmCrops.addHarvest(fc.id, { harvestDate: todayIso(), quantity: value, unit });
      setOpen(false);
      setQty('');
      onChanged();
    } catch {
      Alert.alert(t('addHarvest'), t('saveError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <Heading>🧺 {t('harvests')}</Heading>
      {fc.harvests.length === 0 && <Body muted>{t('nothingYet')}</Body>}
      {fc.harvests.map((h) => (
        <View key={h.id} style={styles.row}>
          <Text style={styles.rowLabel}>
            #{h.number} · {h.date}
          </Text>
          <Text style={styles.rowValue}>
            {h.quantity} {h.unitSymbol}
          </Text>
        </View>
      ))}
      {open ? (
        <>
          <Field label={t('quantity')} value={qty} onChange={(v) => setQty(v.replace(/[^0-9.]/g, ''))} numeric />
          <ChoiceRow options={HARVEST_UNITS.map((u) => ({ id: u.id, label: u.label }))} value={unit} onChange={setUnit} />
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <Button variant="secondary" label={t('cancel')} onPress={() => setOpen(false)} />
            <Button label={busy ? t('saving') : t('save')} disabled={busy} onPress={save} />
          </View>
        </>
      ) : (
        <View style={{ flexDirection: 'row' }}>
          <Button variant="secondary" icon="➕" label={t('addHarvest')} onPress={() => setOpen(true)} />
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: { width: 72, height: 72, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: font.heading, fontWeight: '800', color: colors.text },
  meta: { fontSize: 14, color: colors.textMuted },
  task: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    minHeight: 64,
  },
  taskDone: { backgroundColor: colors.primaryLight },
  check: { width: 32, height: 32, borderRadius: 8, borderWidth: 2, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.primary },
  checkText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  taskTitle: { fontSize: font.body, fontWeight: '700', color: colors.text },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { flex: 1, fontSize: font.small, color: colors.text },
  rowValue: { fontSize: font.body, fontWeight: '800', color: colors.text },
});
