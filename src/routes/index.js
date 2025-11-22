import { Router } from 'express';
import authRoutes from './auth.routes.js';
import propertiRoutes from './properti.routes.js';
import kamarRoutes from './kamar.routes.js';
import kontrakRoutes from './kontrak.routes.js';
import pembayaranRoutes from './pembayaran.routes.js';
import userRoutes from './user.routes.js';
import uploadRoutes from './upload.routes.js';
import dashboardRoutes from './dashboard.routes.js'; // <-- 1. IMPORT BARU

const router = Router();

// Gunakan /auth untuk semua rute di auth.routes.js
router.use('/auth', authRoutes);

// Gunakan /properti untuk semua rute di properti.routes.js
router.use('/properti', propertiRoutes);

// Gunakan /kamar untuk semua rute di kamar.routes.js
router.use('/kamar', kamarRoutes);

// Gunakan /kontrak untuk semua rute di kontrak.routes.js
router.use('/kontrak', kontrakRoutes);

// Gunakan /pembayaran untuk semua rute di pembayaran.routes.js
router.use('/pembayaran', pembayaranRoutes);

// Gunakan /user untuk semua rute di user.routes.js
router.use('/user', userRoutes);

// Gunakan /upload untuk semua rute di upload.routes.js
router.use('/upload', uploadRoutes);

// Gunakan /dashboard untuk semua rute di dashboard.routes.js
router.use('/dashboard', dashboardRoutes);



export default router;