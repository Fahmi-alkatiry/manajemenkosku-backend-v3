// src/controllers/dashboard.controller.js
import prisma from '../lib/prisma.js';
export const getAdminDashboard = async (req, res) => {
  try {
    // 1. Hitung Statistik Dasar
    const totalKamar = await prisma.kamar.count();
    const kamarDitempati = await prisma.kamar.count({ where: { status: 'Ditempati' } });
    const kamarTersedia = await prisma.kamar.count({ where: { status: 'Tersedia' } });
    
    const totalPenyewa = await prisma.user.count({ where: { role: 'PENYEWA' } });

    // 2. Hitung Keuangan
    const pembayaranPending = await prisma.pembayaran.count({
      where: { status: 'Pending' },
    });
    
    const totalPemasukanAggr = await prisma.pembayaran.aggregate({
      _sum: { jumlah: true },
      where: { status: 'Lunas' },
    });
    const totalRevenue = totalPemasukanAggr._sum.jumlah || 0;

    // 3. Ambil List Pembayaran Pending (DIPERBAIKI UNTUK SKEMA BARU)
    const recentPayments = await prisma.pembayaran.findMany({
      where: { status: 'Pending' },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        // KARENA SKEMA BARU: Pembayaran -> Kontrak -> User & Kamar
        kontrak: {
          include: {
            penyewa: { 
              select: { nama: true } 
            },
            kamar: { 
              select: { nomor_kamar: true } 
            }
          }
        }
      }
    });

    // Format data agar sesuai dengan Frontend
    const formattedRecent = recentPayments.map(p => {
        // Ambil data dari dalam kontrak
        const penyewaNama = p.kontrak?.penyewa?.nama || 'Tanpa Nama';
        const kamarNomor = p.kontrak?.kamar?.nomor_kamar || '-';

        return {
            id: p.id,
            jumlah: p.jumlah,
            bulan: p.bulan,
            tahun: p.tahun,
            status: p.status,
            penyewaNama: penyewaNama,
            kamarNomor: kamarNomor,
        };
    });

    res.status(200).json({
      rooms: {
        total: totalKamar,
        occupied: kamarDitempati,
        available: kamarTersedia,
      },
      tenants: {
        total: totalPenyewa,
      },
      payments: {
        pending: pembayaranPending,
        totalRevenue: totalRevenue,
      },
      recentPendingPayments: formattedRecent,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};