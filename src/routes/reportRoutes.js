import express from "express";
import { getPaymentReport, getReportSummary } from "../controllers/reportController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Semua rute di bawah ini diproteksi dan hanya untuk Admin
router.use(protect, adminOnly);

// GET /api/reports/payments -> Mendapatkan data laporan pembayaran (JSON)
router.get("/payments", getPaymentReport);

// RUTE BARU untuk Halaman Laporan (mengembalikan statistik)
router.get('/summary', getReportSummary);

export default router;
