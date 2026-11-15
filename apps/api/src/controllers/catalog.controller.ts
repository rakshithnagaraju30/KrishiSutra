import type { RequestHandler } from 'express';
import { getValidated } from '../middleware/validate.ts';
import type { CatalogService } from '../services/catalog.service.ts';
import { resolveLanguage } from '../utils/language.ts';
import { sendSuccess } from '../utils/response.ts';

export function createCatalogController(catalog: CatalogService) {
  const reference: RequestHandler = async (req, res) => sendSuccess(res, await catalog.reference(resolveLanguage(req)));
  const categories: RequestHandler = async (req, res) => sendSuccess(res, await catalog.categoryTree(resolveLanguage(req)));
  const crops: RequestHandler = async (req, res) => {
    const { query } = getValidated<{ query: { category?: string; q?: string } }>(res);
    sendSuccess(res, await catalog.listCrops(resolveLanguage(req), query));
  };
  const crop: RequestHandler = async (req, res) => {
    const { params } = getValidated<{ params: { slug: string } }>(res);
    sendSuccess(res, await catalog.cropDetail(resolveLanguage(req), params.slug));
  };
  const procedure: RequestHandler = async (req, res) => {
    const { params } = getValidated<{ params: { id: string } }>(res);
    sendSuccess(res, await catalog.procedure(resolveLanguage(req), params.id));
  };
  return { reference, categories, crops, crop, procedure };
}
