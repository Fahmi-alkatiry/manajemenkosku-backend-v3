// src/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import path from 'path'; // <--- TAMBAHKAN INI
import { fileURLToPath } from 'url'; // <--- TAMBAHKAN INI

// Import Routes
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import tenantRoutes from './routes/tenantRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js'; // <--- TAMBAHKAN INI
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

// Setup untuk mendapatkan __dirname di ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Inisialisasi Prisma Client
export const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- MEMBUAT FOLDER UPLOADS STATIS (PUBLIK) ---
// Ini akan membuat file di '/uploads' bisa diakses
// Contoh: http://localhost:5000/uploads/namafile.jpg
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'))); // <--- TAMBAHKAN INI

// Test Route
app.get('/', (req, res) => {
  res.send('API Manajemen KosKu Berjalan!');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/payments', paymentRoutes); // <--- TAMBAKAN INI
app.use('/api/dashboard', dashboardRoutes); // <--- TAMBAHKAN INI
app.use('/api/reports', reportRoutes); // <--- TAMBAKAN INI

// ... (Error handler dan app.listen)

// Error Handling Middleware (Sederhana)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Terjadi kesalahan pada server!');
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});