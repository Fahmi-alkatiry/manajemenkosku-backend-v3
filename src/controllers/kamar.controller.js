// src/controllers/kamar.controller.js

import prisma from '../lib/prisma.js';

// 1. Membuat Kamar baru
export const createKamar = async (req, res) => {
  try {
    const { nomor_kamar, tipe, harga, deskripsi, status, propertiId } = req.body;
    
    // Validasi data input
    if (!nomor_kamar || !tipe || !harga || !propertiId) {
      return res.status(400).json({ message: "Nomor kamar, tipe, harga, dan propertiId wajib diisi" });
    }

    // TODO: Nanti kita bisa tambahkan validasi untuk mengecek
    // apakah 'propertiId' ini benar-benar milik admin yang sedang login.

    const newKamar = await prisma.kamar.create({
      data: {
        nomor_kamar,
        tipe,
        harga: parseFloat(harga), // Pastikan harga adalah angka
        deskripsi,
        status: status || 'Tersedia', // Default ke Tersedia
        propertiId: parseInt(propertiId), // Pastikan propertiId adalah angka
      },
    });

    res.status(201).json(newKamar);
  } catch (error) {
    res.status(500).json({ message: "Gagal membuat kamar", error: error.message });
  }
};

// 2. Melihat semua kamar di satu properti
export const getKamarByProperti = async (req, res) => {
  try {
    const { propertiId } = req.params; // Ambil dari parameter URL

    const kamar = await prisma.kamar.findMany({
      where: {
        propertiId: parseInt(propertiId),
      },
      include: {
        // Kita bisa sertakan info properti jika perlu
        properti: {
          select: {
            nama_properti: true,
          }
        }
      }
    });

    res.status(200).json(kamar);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data kamar", error: error.message });
  }
};

// 3. Mengupdate data kamar
export const updateKamar = async (req, res) => {
  try {
    const { kamarId } = req.params;
    const { nomor_kamar, tipe, harga, deskripsi, status } = req.body;

    const updatedKamar = await prisma.kamar.update({
      where: {
        id: parseInt(kamarId),
      },
      data: {
        nomor_kamar,
        tipe,
        harga: harga ? parseFloat(harga) : undefined,
        deskripsi,
        status,
      },
    });

    res.status(200).json(updatedKamar);
  } catch (error) {
    res.status(500).json({ message: "Gagal update kamar", error: error.message });
  }
};


// 4. Menghapus kamar
export const deleteKamar = async (req, res) => {
  try {
    const { kamarId } = req.params;

    // Hati-hati: Pastikan tidak ada kontrak aktif sebelum menghapus
    // (Ini logika tambahan, untuk sekarang kita hapus langsung)

    await prisma.kamar.delete({
      where: {
        id: parseInt(kamarId),
      },
    });

    res.status(200).json({ message: "Kamar berhasil dihapus" });
  } catch (error) {
    // Jika error karena ada relasi (misal: ada kontrak), akan gagal
    res.status(500).json({ message: "Gagal menghapus kamar", error: error.message });
  }
};