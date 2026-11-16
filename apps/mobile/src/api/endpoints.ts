/** Typed calls to the KrishiSutra API. */
import { api } from './client';
import type { CategoryNode, CropDetail, CropSummary, Farm, FarmCrop, FarmCropSummary, FarmSummary, Procedure, Recommendation, Weather } from './types';

export const catalog = {
  categories: () => api<CategoryNode[]>('/categories'),
  crops: (filter: { category?: string; q?: string } = {}) => {
    const qs = new URLSearchParams();
    if (filter.category) qs.set('category', filter.category);
    if (filter.q) qs.set('q', filter.q);
    const s = qs.toString();
    return api<CropSummary[]>(`/crops${s ? `?${s}` : ''}`);
  },
  crop: (slug: string) => api<CropDetail>(`/crops/${encodeURIComponent(slug)}`),
  procedure: (id: string) => api<Procedure>(`/procedures/${encodeURIComponent(id)}`),
};

export const weather = (lat: number, lon: number) => api<Weather>(`/weather?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`);

export const farms = {
  list: () => api<FarmSummary[]>('/farms', { auth: true }),
  get: (id: string) => api<Farm>(`/farms/${id}`, { auth: true }),
  create: (body: Record<string, unknown>) => api<Farm>('/farms', { method: 'POST', body, auth: true }),
  update: (id: string, body: Record<string, unknown>) => api<Farm>(`/farms/${id}`, { method: 'PATCH', body, auth: true }),
  addPlot: (farmId: string, body: Record<string, unknown>) => api<unknown>(`/farms/${farmId}/plots`, { method: 'POST', body, auth: true }),
  addWaterSource: (farmId: string, body: Record<string, unknown>) => api<unknown>(`/farms/${farmId}/water-sources`, { method: 'POST', body, auth: true }),
};

export const farmCrops = {
  list: () => api<FarmCropSummary[]>('/farm-crops', { auth: true }),
  get: (id: string) => api<FarmCrop>(`/farm-crops/${id}`, { auth: true }),
  start: (body: Record<string, unknown>) => api<FarmCrop>('/farm-crops', { method: 'POST', body, auth: true }),
  remove: (id: string) => api<void>(`/farm-crops/${id}`, { method: 'DELETE', auth: true }),
  setTask: (taskId: string, status: string) => api<unknown>(`/tasks/${taskId}`, { method: 'PATCH', body: { status }, auth: true }),
  addExpense: (id: string, body: Record<string, unknown>) => api<unknown>(`/farm-crops/${id}/expenses`, { method: 'POST', body, auth: true }),
  removeExpense: (expenseId: string) => api<void>(`/expenses/${expenseId}`, { method: 'DELETE', auth: true }),
  addHarvest: (id: string, body: Record<string, unknown>) => api<unknown>(`/farm-crops/${id}/harvests`, { method: 'POST', body, auth: true }),
};

export const recommendations = {
  create: (body: Record<string, unknown>) => api<Recommendation>('/recommendations', { method: 'POST', body, auth: true }),
};
