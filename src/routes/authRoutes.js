// src/routes/authRoutes.js
import express from 'express';
import { register, login, getAllUser, getMe, changePassword, updateProfileDetails } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe); // <-- TAMBAHKAN RUTE INI
router.put('/change-password', protect, changePassword);
router.put('/details', protect, updateProfileDetails);
router.get('/user', getAllUser);

export default router;