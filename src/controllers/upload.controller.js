// src/controllers/upload.controller.js
import prisma from '../lib/prisma.js';
import path from 'path';

// Fungsi untuk mengubah path ala Windows (jika perlu) menjadi URL path
const getPublicUrl = (filePath) => {
  if (!filePath) return null;
  // Ganti backslash (\) dengan slash (/) dan pastikan diawali /uploads
  const relativePath = path.relative('public', filePath).replace(/\\/g, '/');
  return `/${relativePath}`;
};

// 1. Upload Foto KTP (untuk user yang sedang login)
export const uploadFotoKtp = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Tidak ada file yang di-upload" });
    }

    const userId = req.user.userId; // Ambil dari token
    const filePath = getPublicUrl(req.file.path); // -> /uploads/ktp/foto_ktp-12345.jpg

    // Update path di database
    await prisma.user.update({
      where: { id: userId },
      data: { foto_ktp: filePath }
    });

    res.status(200).json({ message: "Foto KTP berhasil di-upload", path: filePath });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Upload Bukti Pembayaran (untuk ID pembayaran spesifik)
export const uploadBuktiPembayaran = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Tidak ada file yang di-upload" });
    }

    const { pembayaranId } = req.params; // Ambil dari URL
    const filePath = getPublicUrl(req.file.path);

    // Update path di database
    await prisma.pembayaran.update({
      where: { id: parseInt(pembayaranId) },
      data: { bukti_pembayaran: filePath }
    });

    res.status(200).json({ message: "Bukti pembayaran berhasil di-upload", path: filePath });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};