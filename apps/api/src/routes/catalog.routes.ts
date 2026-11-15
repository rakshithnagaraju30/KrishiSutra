import { Router } from 'express';
import { createCatalogController } from '../controllers/catalog.controller.ts';
import { validate } from '../middleware/validate.ts';
import type { CatalogService } from '../services/catalog.service.ts';
import { cropSlugParams, listCropsQuery, procedureIdParams } from '../validators/catalog.schemas.ts';

/** Public knowledge endpoints (no sign-in needed). */
export function createCatalogRouter(catalog: CatalogService): Router {
  const router = Router();
  const c = createCatalogController(catalog);
  router.get('/reference', c.reference);
  router.get('/categories', c.categories);
  router.get('/crops', validate({ query: listCropsQuery }), c.crops);
  router.get('/crops/:slug', validate({ params: cropSlugParams }), c.crop);
  router.get('/procedures/:id', validate({ params: procedureIdParams }), c.procedure);
  return router;
}
