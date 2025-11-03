// src/routes/upload.routes.js
import { Router } from 'express';
import { uploadFotoKtp, uploadBuktiPembayaran } from '../controllers/upload.controller.js';
import { uploadKtp, uploadBukti } from '../middleware/upload.middleware.js'; // Middleware Multer
import { verifyToken } from '../middleware/auth.middleware.js'; // Middleware Auth

const router = Router();

// POST /api/upload/ktp
// Alur: Cek Token -> Multer (uploadKtp) tangkap file -> Controller (uploadFotoKtp)
router.post(
  '/ktp',
  [verifyToken, uploadKtp], // Gunakan middleware uploadKtp
  uploadFotoKtp
);

// POST /api/upload/bukti/123 (123 = ID Pembayaran)
// Alur: Cek Token -> Multer (uploadBukti) tangkap file -> Controller (uploadBuktiPembayaran)
router.post(
  '/bukti/:pembayaranId',
  [verifyToken, uploadBukti], // Gunakan middleware uploadBukti
  uploadBuktiPembayaran
);

export default router;