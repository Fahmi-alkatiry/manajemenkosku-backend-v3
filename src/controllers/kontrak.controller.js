// src/controllers/kontrak.controller.js

import prisma from '../lib/prisma.js';

// 1. Membuat Kontrak baru (Admin)
export const createKontrak = async (req, res) => {
  try {
    const {
      penyewaId,
      kamarId,
      tanggal_mulai_sewa,
      tanggal_akhir_sewa,
      harga_sewa_disepakati
    } = req.body;

    // Validasi
    if (!penyewaId || !kamarId || !tanggal_mulai_sewa || !tanggal_akhir_sewa || !harga_sewa_disepakati) {
      return res.status(400).json({ message: "Semua field wajib diisi" });
    }

    // Cek apakah kamar tersedia
    const kamar = await prisma.kamar.findUnique({
      where: { id: parseInt(kamarId) }
    });
    if (kamar.status !== 'Tersedia') {
      return res.status(400).json({ message: "Kamar ini tidak tersedia (sudah ditempati atau diperbaiki)" });
    }

    // Gunakan transaksi untuk membuat kontrak DAN update status kamar
    const [newKontrak, updatedKamar] = await prisma.$transaction([
      // 1. Buat Kontrak
      prisma.kontrak.create({
        data: {
          penyewaId: parseInt(penyewaId),
          kamarId: parseInt(kamarId),
          tanggal_mulai_sewa: new Date(tanggal_mulai_sewa),
          tanggal_akhir_sewa: new Date(tanggal_akhir_sewa),
          harga_sewa_disepakati: parseFloat(harga_sewa_disepakati),
          status_kontrak: 'AKTIF' // Langsung aktif
        }
      }),
      // 2. Update Status Kamar
      prisma.kamar.update({
        where: { id: parseInt(kamarId) },
        data: { status: 'Ditempati' }
      })
    ]);

    res.status(201).json({ newKontrak, updatedKamar });

  } catch (error) {
    res.status(500).json({ message: "Gagal membuat kontrak", error: error.message });
  }
};

// 2. Mengubah Status Kontrak (misal: Menjadi Berakhir) (Admin)
export const updateKontrakStatus = async (req, res) => {
  try {
    const { kontrakId } = req.params;
    const { status_kontrak } = req.body; // Misal: "BERAKHIR" atau "BATAL"

    if (!status_kontrak) {
      return res.status(400).json({ message: "Status kontrak wajib diisi" });
    }

    // Dapatkan data kontrak dulu untuk tahu kamarId-nya
    const kontrak = await prisma.kontrak.findUnique({
      where: { id: parseInt(kontrakId) }
    });

    if (!kontrak) {
      return res.status(404).json({ message: "Kontrak tidak ditemukan" });
    }

    // Gunakan transaksi
    const [updatedKontrak] = await prisma.$transaction([
      // 1. Update Kontrak
      prisma.kontrak.update({
        where: { id: parseInt(kontrakId) },
        data: { status_kontrak: status_kontrak }
      }),
      // 2. Update Kamar JIKA kontrak diakhiri/dibatalkan
      ...(status_kontrak === 'BERAKHIR' || status_kontrak === 'BATAL'
        ? [
            prisma.kamar.update({
              where: { id: kontrak.kamarId },
              data: { status: 'Tersedia' } // Kembalikan status kamar
            })
          ]
        : []) // Jika status "AKTIF", jangan lakukan apa-apa pada kamar
    ]);
    
    res.status(200).json(updatedKontrak);
  } catch (error) {
    res.status(500).json({ message: "Gagal update status kontrak", error: error.message });
  }
};


// 3. Melihat semua kontrak di satu properti (Admin)
export const getKontrakByProperti = async (req, res) => {
  try {
    const { propertiId } = req.params;

    const kontrak = await prisma.kontrak.findMany({
      where: {
        kamar: { // Ambil kontrak yang kamarnya ada di propertiId ini
          propertiId: parseInt(propertiId)
        }
      },
      include: {
        penyewa: { // Sertakan data penyewa
          select: { nama: true, no_hp: true }
        },
        kamar: { // Sertakan data kamar
          select: { nomor_kamar: true }
        }
      },
      orderBy: {
        createdAt: 'desc' // Tampilkan yang terbaru
      }
    });

    res.status(200).json(kontrak);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data kontrak", error: error.message });
  }
};

// 4. Melihat kontrak saya (Penyewa)
export const getMyKontrak = async (req, res) => {
  try {
    const penyewaId = req.user.userId; // Ambil dari token

    const kontrak = await prisma.kontrak.findMany({
      where: {
        penyewaId: penyewaId,
        // status_kontrak: 'AKTIF' // Opsional: tampilkan yang aktif saja
      },
      include: {
        kamar: {
          include: {
            properti: { // Tampilkan juga data propertinya
              select: { nama_properti: true, alamat: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json(kontrak);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data kontrak", error: error.message });
  }
};
export const getAllKontrak = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const { status } = req.query;

    const whereClause = {
      status_kontrak: status ? status : undefined,
      kamar: {
        properti: {
          pemilikId: adminId,
        },
      },
    };

    // ===================================
    // ==       PERBAIKAN DI SINI       ==
    // ===================================

    // Kita ganti 'include' menjadi 'select' agar bisa
    // menyertakan field dari 'Kontrak' ITU SENDIRI.
    const kontrak = await prisma.kontrak.findMany({
      where: whereClause,
      select: {
        // Data Kontrak
        id: true,
        tanggal_mulai_sewa: true, // <-- INI YANG HILANG
        tanggal_akhir_sewa: true, // <-- INI YANG HILANG

        // Data Relasi
        penyewa: {
          select: { nama: true }
        },
        kamar: {
          select: { 
            nomor_kamar: true,
            properti: {
              select: { nama_properti: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    // ===================================

    res.status(200).json(kontrak);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data kontrak", error: error.message });
  }
};