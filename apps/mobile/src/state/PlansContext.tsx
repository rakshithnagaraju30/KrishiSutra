import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

/** A farmer's own crop being tracked (stored only on this phone in the prototype). */
export type CropPlan = {
  id: string;
  cropId: string;
  /** ISO date (yyyy-mm-dd). */
  sowingDate: string;
  /** Indexes of stages marked as done. */
  doneStages: number[];
  createdAt: string;
};

type PlansContextValue = {
  plans: CropPlan[];
  addPlan: (cropId: string) => CropPlan;
  updatePlan: (id: string, changes: Partial<Omit<CropPlan, 'id'>>) => void;
  removePlan: (id: string) => void;
  toggleStage: (id: string, stageIndex: number) => void;
};

const STORAGE_KEY = 'krishisutra.plans.v1';
const PlansContext = createContext<PlansContextValue | null>(null);

export function todayIso(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function PlansProvider({ children }: { children: ReactNode }) {
  const [plans, setPlans] = useState<CropPlan[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setPlans(JSON.parse(raw) as CropPlan[]);
      })
      .catch(() => undefined)
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(plans)).catch(() => undefined);
  }, [plans, loaded]);

  const addPlan = useCallback((cropId: string) => {
    const plan: CropPlan = {
      id: newId(),
      cropId,
      sowingDate: todayIso(),
      doneStages: [],
      createdAt: new Date().toISOString(),
    };
    setPlans((prev) => [plan, ...prev]);
    return plan;
  }, []);

  const updatePlan = useCallback((id: string, changes: Partial<Omit<CropPlan, 'id'>>) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...changes } : p)));
  }, []);

  const removePlan = useCallback((id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const toggleStage = useCallback((id: string, stageIndex: number) => {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const done = p.doneStages.includes(stageIndex)
          ? p.doneStages.filter((i) => i !== stageIndex)
          : [...p.doneStages, stageIndex];
        return { ...p, doneStages: done };
      }),
    );
  }, []);

  const value = useMemo(
    () => ({ plans, addPlan, updatePlan, removePlan, toggleStage }),
    [plans, addPlan, updatePlan, removePlan, toggleStage],
  );

  return <PlansContext.Provider value={value}>{children}</PlansContext.Provider>;
}

export function usePlans(): PlansContextValue {
  const ctx = useContext(PlansContext);
  if (!ctx) throw new Error('usePlans must be used inside PlansProvider');
  return ctx;
}
