// src/routes/user.routes.js

import { Router } from 'express';
import {
  getMyProfile,
  updateMyProfile,
  getAllUsers,
  getUserById,
  createTenant,
  updateTenantByAdmin,
  deleteTenant
} from '../controllers/user.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// ===================================
//  RUTE UNTUK USER (PRIBADI)
// ===================================

// GET /api/user/me (Melihat profil sendiri)
router.get(
  '/me',
  [verifyToken],
  getMyProfile
);

// PUT /api/user/me (Update profil sendiri)
router.put(
  '/me',
  [verifyToken],
  updateMyProfile
);

// ===================================
//  RUTE KHUSUS ADMIN
// ===================================

// GET /api/user (Melihat semua user, bisa difilter ?role=PENYEWA)
router.get(
  '/',
  [verifyToken, isAdmin],
  getAllUsers
);

// GET /api/user/1 (Melihat detail 1 user)
router.get(
  '/:id',
  [verifyToken, isAdmin],
  getUserById
);

router.post('/', [verifyToken, isAdmin], createTenant);
router.put('/:id', [verifyToken, isAdmin], updateTenantByAdmin);
router.delete('/:id', [verifyToken, isAdmin], deleteTenant);


export default router;