import express from 'express';
import {
  createTenant,
  getAllTenants,
  getTenantById,
  updateTenant,
  deleteTenant,
} from '../controllers/tenantController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Semua rute di bawah ini diproteksi dan hanya untuk Admin
router.use(protect, adminOnly);

// POST /api/tenants -> Membuat penyewa baru
router.post('/', createTenant);

// GET /api/tenants -> Mendapat semua penyewa
router.get('/', getAllTenants);

// GET /api/tenants/:id -> Mendapat detail satu penyewa
router.get('/:id', getTenantById);

// PUT /api/tenants/:id -> Update data penyewa
router.put('/:id', updateTenant);

// DELETE /api/tenants/:id -> Hapus penyewa
router.delete('/:id', deleteTenant);

export default router;