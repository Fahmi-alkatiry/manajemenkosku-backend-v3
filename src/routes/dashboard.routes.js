// src/routes/dashboard.routes.js
import { Router } from 'express';
import { getAdminDashboard } from '../controllers/dashboard.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/dashboard/stats
router.get('/admin', [verifyToken, isAdmin], getAdminDashboard);

export default router;