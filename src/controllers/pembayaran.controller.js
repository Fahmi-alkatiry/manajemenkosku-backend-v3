// src/controllers/pembayaran.controller.js

import prisma from '../lib/prisma.js';

// 1. Membuat Tagihan Baru (Oleh Admin)
export const createPembayaran = async (req, res) => {
  try {
    const { kontrakId, bulan, tahun } = req.body;

    // 1. Validasi input
    if (!kontrakId || !bulan || !tahun) {
      return res.status(400).json({ message: "Kontrak, bulan, dan tahun wajib diisi" });
    }

    // 2. Ambil data kontrak untuk mendapatkan harga
    const kontrak = await prisma.kontrak.findUnique({
      where: { id: parseInt(kontrakId) }
    });
    if (!kontrak) {
      return res.status(404).json({ message: "Kontrak tidak ditemukan" });
    }

    // 3. Buat tagihan baru
    const newPembayaran = await prisma.pembayaran.create({
      data: {
        kontrakId: parseInt(kontrakId),
        bulan,
        tahun: parseInt(tahun),
        // Ambil jumlah tagihan dari harga yang disepakati di kontrak
        jumlah: kontrak.harga_sewa_disepakati,
        status: 'Pending' // Status default saat tagihan dibuat
      }
    });

    res.status(201).json(newPembayaran);

  } catch (error) {
    // Handle jika tagihan duplikat (misal: bulan & tahun sama untuk 1 kontrak)
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "Tagihan untuk bulan dan tahun tersebut sudah ada" });
    }
    res.status(500).json({ message: "Gagal membuat tagihan", error: error.message });
  }
};

// 2. Konfirmasi Pembayaran (Oleh Admin)
export const konfirmasiPembayaran = async (req, res) => {
  try {
    const { pembayaranId } = req.params;
    // Status baru bisa 'Lunas' atau 'Ditolak'
    const { status } = req.body; 

    if (!status || (status !== 'Lunas' && status !== 'Ditolak')) {
      return res.status(400).json({ message: "Status harus 'Lunas' atau 'Ditolak'" });
    }

    const dataToUpdate = {
      status: status,
    };

    // Jika Lunas, catat tanggal bayarnya
    if (status === 'Lunas') {
      dataToUpdate.tanggal_bayar = new Date();
    }

    const updatedPembayaran = await prisma.pembayaran.update({
      where: { id: parseInt(pembayaranId) },
      data: dataToUpdate
    });

    res.status(200).json(updatedPembayaran);

  } catch (error) {
    res.status(500).json({ message: "Gagal konfirmasi pembayaran", error: error.message });
  }
};

// 3. Melihat Riwayat Pembayaran per Kontrak (Admin & Penyewa)
export const getPembayaranByKontrak = async (req, res) => {
  try {
    const { kontrakId } = req.params;

    // TODO: Tambahkan cek keamanan apakah user ini boleh melihat kontrak tsb

    const pembayaran = await prisma.pembayaran.findMany({
      where: { kontrakId: parseInt(kontrakId) },
      orderBy: [
        { tahun: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.status(200).json(pembayaran);

  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil riwayat pembayaran", error: error.message });
  }
};

// 4. Melihat Semua Tagihan Saya (Oleh Penyewa)
export const getMyPembayaran = async (req, res) => {
  try {
    const penyewaId = req.user.userId; // Ambil dari token

    const pembayaran = await prisma.pembayaran.findMany({
      where: {
        kontrak: { // Filter pembayaran berdasarkan kontrak milik si penyewa
          penyewaId: penyewaId
        }
      },
      include: { // Sertakan info kontrak & kamar
        kontrak: {
          include: {
            kamar: {
              select: { nomor_kamar: true }
            }
          }
        }
      },
      orderBy: [
        { tahun: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.status(200).json(pembayaran);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil tagihan", error: error.message });
  }
};