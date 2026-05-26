import { Router } from 'express';
import { requestController } from '../controllers/RequestController';

const router = Router();

// GET /api/requests?type=...&urgency=...
router.get('/', (req, res, next) => requestController.getAll(req, res, next));

// GET /api/requests/:id/history  — must come before /:id to avoid conflict
router.get('/:id/history', (req, res, next) => requestController.getHistory(req, res, next));

// GET /api/requests/:id
router.get('/:id', (req, res, next) => requestController.getById(req, res, next));

// POST /api/requests
router.post('/', (req, res, next) => requestController.create(req, res, next));

// PATCH /api/requests/:id/status
router.patch('/:id/status', (req, res, next) => requestController.updateStatus(req, res, next));

export default router;
