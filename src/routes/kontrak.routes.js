// src/routes/kontrak.routes.js

import { Router } from 'express';
import {
  createKontrak,
  updateKontrakStatus,
  getKontrakByProperti,
  getMyKontrak
} from '../controllers/kontrak.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// ===================================
//  RUTE KHUSUS ADMIN
// ===================================

// POST /api/kontrak (Membuat kontrak baru)
router.post(
  '/',
  [verifyToken, isAdmin],
  createKontrak
);

// PUT /api/kontrak/status/1 (Mengubah status kontrak)
router.put(
  '/status/:kontrakId',
  [verifyToken, isAdmin],
  updateKontrakStatus
);

// GET /api/kontrak/properti/1 (Melihat semua kontrak di 1 properti)
router.get(
  '/properti/:propertiId',
  [verifyToken, isAdmin],
  getKontrakByProperti
);

// ===================================
//  RUTE KHUSUS PENYEWA
// ===================================

// GET /api/kontrak/saya (Penyewa melihat kontraknya sendiri)
router.get(
  '/saya',
  [verifyToken], // Cukup verifyToken, tidak perlu isAdmin
  getMyKontrak
);

export default router;