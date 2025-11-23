// backend/src/routes/auth.routes.js
import { Router } from 'express';
import { register, login, getAllUsers } from '../controllers/auth.controller.js';

const router = Router();

// Endpoint: /api/auth/register
router.post('/register', register);

// Endpoint: /api/auth/login
router.post('/login', login);

router.get('/users', getAllUsers);

export default router;