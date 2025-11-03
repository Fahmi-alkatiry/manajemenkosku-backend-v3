// src/routes/pembayaran.routes.js

import { Router } from 'express';
import {
  createPembayaran,
  konfirmasiPembayaran,
  getPembayaranByKontrak,
  getMyPembayaran
} from '../controllers/pembayaran.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// ===================================
//  RUTE KHUSUS ADMIN
// ===================================

// POST /api/pembayaran (Membuat tagihan baru)
router.post(
  '/',
  [verifyToken, isAdmin],
  createPembayaran
);

// PUT /api/pembayaran/konfirmasi/1 (Konfirmasi Lunas / Ditolak)
router.put(
  '/konfirmasi/:pembayaranId',
  [verifyToken, isAdmin],
  konfirmasiPembayaran
);

// ===================================
//  RUTE UNTUK SEMUA USER (TERAUTENTIKASI)
// ===================================

// GET /api/pembayaran/kontrak/1 (Melihat riwayat bayar 1 kontrak)
router.get(
  '/kontrak/:kontrakId',
  [verifyToken],
  getPembayaranByKontrak
);

// GET /api/pembayaran/saya (Penyewa melihat semua tagihannya)
router.get(
  '/saya',
  [verifyToken], // Cukup login, tidak perlu admin
  getMyPembayaran
);

export default router;