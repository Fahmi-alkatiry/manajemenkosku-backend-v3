import express from 'express';
import { getAdminDashboard, getTenantDashboard } from '../controllers/dashboardController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Semua rute di bawah ini memerlukan login
router.use(protect);

// GET /api/dashboard/admin -> Hanya untuk Admin
router.get('/admin', adminOnly, getAdminDashboard);

// GET /api/dashboard/tenant -> Hanya untuk Penyewa
// Kita tidak perlu middleware 'penyewaOnly' khusus,
// karena controllernya sudah mengambil data berdasarkan req.user.id
// Tapi kita bisa cek jika rolenya PENYEWA
router.get('/tenant', (req, res, next) => {
    if (req.user.role !== 'PENYEWA') {
        return res.status(403).json({ message: 'Akses ditolak, khusus Penyewa' });
    }
    next();
}, getTenantDashboard);

export default router;