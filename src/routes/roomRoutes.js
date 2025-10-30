import express from 'express';
import {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
} from '../controllers/roomController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// === Rute yang Diproteksi ===
// `protect` akan memverifikasi token
// `adminOnly` akan cek role

// POST /api/rooms -> Membuat kamar baru (Hanya Admin)
router.post('/', protect, adminOnly, createRoom);

// PUT /api/rooms/:id -> Update kamar (Hanya Admin)
router.put('/:id', protect, adminOnly, updateRoom);

// DELETE /api/rooms/:id -> Hapus kamar (Hanya Admin)
router.delete('/:id', protect, adminOnly, deleteRoom);


// === Rute Publik (atau Terautentikasi) ===
// Kita asumsikan semua user (Admin & Penyewa) bisa melihat data kamar

// GET /api/rooms -> Lihat semua kamar (Semua user terautentikasi)
router.get('/', protect, getAllRooms);

// GET /api/rooms/:id -> Lihat detail kamar (Semua user terautentikasi)
router.get('/:id', protect, getRoomById);

export default router;