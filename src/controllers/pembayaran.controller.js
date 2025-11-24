// src/controllers/pembayaran.controller.js

import prisma from '../lib/prisma.js';

// 1. Membuat Tagihan Baru (Oleh Admin)
export const createPembayaran = async (req, res) => {
  try {
    const { kontrakId, bulan, tahun } = req.body;

    if (!kontrakId || !bulan || !tahun) {
      return res.status(400).json({ message: "Kontrak, bulan, dan tahun wajib diisi" });
    }

    // 1. Ambil data kontrak untuk mendapatkan harga DAN tanggal mulai sewa
    const kontrak = await prisma.kontrak.findUnique({
      where: { id: parseInt(kontrakId) }
    });
    if (!kontrak) {
      return res.status(404).json({ message: "Kontrak tidak ditemukan" });
    }

    // 2. Hitung Tanggal Jatuh Tempo
    // Ambil tanggal 'mulai' dari kontrak (misal: 5)
    const tanggalTagihan = kontrak.tanggal_mulai_sewa.getDate();
    
    // Konversi nama bulan (String) ke angka (0-11)
    const daftarBulan = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const bulanAngka = daftarBulan.indexOf(bulan); // Misal: 'November' -> 10

    // Buat tanggal jatuh tempo (misal: 5 November 2025)
    const jatuhTempo = new Date(tahun, bulanAngka, tanggalTagihan);

    // 3. Buat tagihan baru
    const newPembayaran = await prisma.pembayaran.create({
      data: {
        kontrakId: parseInt(kontrakId),
        bulan,
        tahun: parseInt(tahun),
        jumlah: kontrak.harga_sewa_disepakati,
        status: 'Pending',
        tanggal_jatuh_tempo: jatuhTempo // <-- SIMPAN TANGGAL JATUH TEMPO
      }
    });

    res.status(201).json(newPembayaran);

  } catch (error) {
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


export const getAllPembayaran = async (req, res) => {
  try {
    const adminId = req.user.userId; // ID Admin dari token
    
    // Ambil parameter dari query URL
    // Contoh: /api/pembayaran?bulan=Januari&tahun=2025&status=Lunas
    const { status, bulan, tahun } = req.query; 

    // Buat filter 'where' yang dinamis
    const whereClause = {
      // 1. Filter status (jika ada)
      status: status ? status : undefined,
      
      // 2. Filter Bulan (jika ada)
      bulan: bulan ? bulan : undefined,
      
      // 3. Filter Tahun (jika ada, pastikan jadi integer)
      tahun: tahun ? parseInt(tahun) : undefined,

      // 4. Filter utama: hanya ambil pembayaran dari properti milik admin
      kontrak: {
        kamar: {
          properti: {
            pemilikId: adminId,
          },
        },
      },
    };

    const pembayaran = await prisma.pembayaran.findMany({
      where: whereClause,
      include: { 
        kontrak: {
          include: {
            penyewa: { select: { nama: true } },
            kamar: { 
              select: { 
                nomor_kamar: true,
                properti: { select: { nama_properti: true } }
              } 
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // --- TAMBAHAN: Hitung Total Pemasukan untuk Laporan ---
    // Jika user meminta filter bulan & tahun, kita sekalian hitung totalnya di sini (opsional)
    // Tapi untuk sekarang kita biarkan Flutter yang menghitung dari list agar lebih fleksibel.

    res.status(200).json(pembayaran);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data pembayaran", error: error.message });
  }
};