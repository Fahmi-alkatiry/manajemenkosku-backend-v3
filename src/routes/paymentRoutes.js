import express from 'express';
import {
  createPayment,
  getMyPayments,
  getAllPayments,
  updatePaymentStatus,
} from '../controllers/paymentController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { uploadProof } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Semua rute di bawah ini memerlukan login (diproteksi)
router.use(protect);

// === Rute Penyewa ===

// POST /api/payments -> Membuat pembayaran (Upload bukti)
// Gunakan middleware uploadProof di sini
router.post('/', uploadProof, createPayment);

// GET /api/payments/mypayments -> Melihat riwayat pembayaran sendiri
router.get('/mypayments', getMyPayments);

// === Rute Admin ===

// GET /api/payments -> Melihat semua pembayaran (Hanya Admin)
router.get('/', adminOnly, getAllPayments);

// PUT /api/payments/:id/status -> Konfirmasi/Tolak pembayaran (Hanya Admin)
router.put('/:id/status', adminOnly, updatePaymentStatus);

export default router;