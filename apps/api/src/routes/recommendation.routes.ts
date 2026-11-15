import { Router, type RequestHandler } from 'express';
import { currentUserId } from '../middleware/auth.ts';
import { getValidated, validate } from '../middleware/validate.ts';
import type { RecommendationService } from '../services/recommendation.service.ts';
import { resolveLanguage } from '../utils/language.ts';
import { sendSuccess } from '../utils/response.ts';
import { idParams } from '../validators/farm.schemas.ts';
import { recommendationBody } from '../validators/recommendation.schemas.ts';

/** "What should I grow?" — runs are saved to the farmer's account. */
export function createRecommendationRouter(deps: { recommendations: RecommendationService; requireAuth: RequestHandler }): Router {
  const r = Router();
  r.use('/recommendations', deps.requireAuth);
  r.post('/recommendations', validate({ body: recommendationBody }), async (req, res) =>
    sendSuccess(res, await deps.recommendations.create(currentUserId(req), req.body, resolveLanguage(req)), 201));
  r.get('/recommendations', async (req, res) => sendSuccess(res, await deps.recommendations.list(currentUserId(req))));
  r.get('/recommendations/:id', validate({ params: idParams }), async (req, res) =>
    sendSuccess(res, await deps.recommendations.get(getValidated<{ params: { id: string } }>(res).params.id, currentUserId(req), resolveLanguage(req))));
  return r;
}
