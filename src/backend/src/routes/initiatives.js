import { Router } from 'express';
import * as ctrl from '../controllers/initiativesController.js';
import {
  initiativeCreateRules,
  initiativeUpdateRules,
  idParamRule,
} from '../middlewares/validate.js';

const router = Router();

/**
 * GET /api/initiatives/stats
 * Returns initiative counts grouped by status
 */
router.get('/stats', ctrl.getStats);

/**
 * GET /api/initiatives/stats/priority
 * Returns initiative counts and percentages grouped by priority
 */
router.get('/stats/priority', ctrl.getPriorityStats);

/**
 * GET /api/initiatives
 * Query params: status, limit, offset
 */
router.get('/', ctrl.getAll);

/**
 * GET /api/initiatives/:id
 */
router.get('/:id', idParamRule, ctrl.getById);

/**
 * POST /api/initiatives
 */
router.post('/', initiativeCreateRules, ctrl.create);

/**
 * PUT /api/initiatives/:id
 */
router.put('/:id', idParamRule, initiativeUpdateRules, ctrl.update);

/**
 * DELETE /api/initiatives/:id
 */
router.delete('/:id', idParamRule, ctrl.remove);

export default router;
