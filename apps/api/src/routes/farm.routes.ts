/**
 * Farmer-owned data. Every route here requires the device account (requireAuth); the service scopes
 * every query to that user.
 */
import { Router, type RequestHandler } from 'express';
import { currentUserId } from '../middleware/auth.ts';
import { getValidated, validate } from '../middleware/validate.ts';
import type { FarmService } from '../services/farm.service.ts';
import { resolveLanguage } from '../utils/language.ts';
import { sendSuccess } from '../utils/response.ts';
import * as s from '../validators/farm.schemas.ts';

const id = (res: Parameters<RequestHandler>[1]) => getValidated<{ params: { id: string } }>(res).params.id;
const withId = (body?: Parameters<typeof validate>[0]['body']) => validate({ params: s.idParams, ...(body ? { body } : {}) });

export function createFarmRouter(deps: { farms: FarmService; requireAuth: RequestHandler }): Router {
  const { farms } = deps;
  const r = Router();
  r.use(['/farms', '/plots', '/farm-crops', '/tasks', '/expenses', '/harvests'], deps.requireAuth);

  // Farms
  r.get('/farms', async (req, res) => sendSuccess(res, await farms.listFarms(currentUserId(req))));
  r.post('/farms', validate({ body: s.createFarmBody }), async (req, res) => sendSuccess(res, await farms.createFarm(currentUserId(req), req.body), 201));
  r.get('/farms/:id', withId(), async (req, res) => sendSuccess(res, await farms.getFarm(currentUserId(req), id(res))));
  r.patch('/farms/:id', withId(s.updateFarmBody), async (req, res) => sendSuccess(res, await farms.updateFarm(currentUserId(req), id(res), req.body)));
  r.delete('/farms/:id', withId(), async (req, res) => { await farms.deleteFarm(currentUserId(req), id(res)); res.status(204).end(); });

  // Plots, water sources, soil tests
  r.post('/farms/:id/plots', withId(s.createPlotBody), async (req, res) => sendSuccess(res, await farms.createPlot(currentUserId(req), id(res), req.body), 201));
  r.post('/farms/:id/water-sources', withId(s.createWaterSourceBody), async (req, res) => sendSuccess(res, await farms.createWaterSource(currentUserId(req), id(res), req.body), 201));
  r.patch('/plots/:id', withId(s.updatePlotBody), async (req, res) => sendSuccess(res, await farms.updatePlot(currentUserId(req), id(res), req.body)));
  r.delete('/plots/:id', withId(), async (req, res) => { await farms.deletePlot(currentUserId(req), id(res)); res.status(204).end(); });
  r.get('/plots/:id/soil-tests', withId(), async (req, res) => sendSuccess(res, await farms.listSoilTests(currentUserId(req), id(res))));
  r.post('/plots/:id/soil-tests', withId(s.createSoilTestBody), async (req, res) => sendSuccess(res, await farms.createSoilTest(currentUserId(req), id(res), req.body), 201));

  // Cultivations
  r.get('/farm-crops', async (req, res) => sendSuccess(res, await farms.listFarmCrops(currentUserId(req), resolveLanguage(req))));
  r.post('/farm-crops', validate({ body: s.startCropBody }), async (req, res) => sendSuccess(res, await farms.startCrop(currentUserId(req), req.body), 201));
  r.get('/farm-crops/:id', withId(), async (req, res) => sendSuccess(res, await farms.getFarmCrop(currentUserId(req), id(res), resolveLanguage(req))));
  r.patch('/farm-crops/:id', withId(s.updateFarmCropBody), async (req, res) => sendSuccess(res, await farms.updateFarmCrop(currentUserId(req), id(res), req.body)));
  r.delete('/farm-crops/:id', withId(), async (req, res) => { await farms.deleteFarmCrop(currentUserId(req), id(res)); res.status(204).end(); });
  r.post('/farm-crops/:id/tasks', withId(s.createTaskBody), async (req, res) => sendSuccess(res, await farms.createTask(currentUserId(req), id(res), req.body), 201));
  r.post('/farm-crops/:id/activities', withId(s.createActivityBody), async (req, res) => sendSuccess(res, await farms.createActivity(currentUserId(req), id(res), req.body), 201));
  r.post('/farm-crops/:id/expenses', withId(s.createExpenseBody), async (req, res) => sendSuccess(res, await farms.createExpense(currentUserId(req), id(res), req.body), 201));
  r.post('/farm-crops/:id/harvests', withId(s.createHarvestBody), async (req, res) => sendSuccess(res, await farms.createHarvest(currentUserId(req), id(res), req.body), 201));

  // Single records
  r.patch('/tasks/:id', withId(s.updateTaskBody), async (req, res) => sendSuccess(res, await farms.updateTask(currentUserId(req), id(res), req.body)));
  r.delete('/expenses/:id', withId(), async (req, res) => { await farms.deleteExpense(currentUserId(req), id(res)); res.status(204).end(); });
  r.post('/harvests/:id/sales', withId(s.createSaleBody), async (req, res) => sendSuccess(res, await farms.createSale(currentUserId(req), id(res), req.body), 201));
  return r;
}
