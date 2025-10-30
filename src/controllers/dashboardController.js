    import { prisma } from '../server.js';

// @desc    Mendapatkan data statistik untuk Dashboard Admin
// @route   GET /api/dashboard/admin
export const getAdminDashboard = async (req, res) => {
  try {
    // 1. Statistik Kamar
    const totalKamar = await prisma.kamar.count();
    const kamarDitempati = await prisma.kamar.count({
      where: { status: 'Ditempati' },
    });
    const kamarTersedia = await prisma.kamar.count({
      where: { status: 'Tersedia' },
    });

    // 2. Statistik Penyewa
    const totalPenyewa = await prisma.user.count({
      where: { role: 'PENYEWA' },
    });

    // 3. Statistik Pembayaran
    const pembayaranPending = await prisma.pembayaran.count({
      where: { status: 'Pending' },
    });
    const totalPemasukan = await prisma.pembayaran.aggregate({
      _sum: {
        jumlah: true,
      },
      where: {
        status: 'Lunas',
      },
    });

    // 4. Pembayaran terbaru (5 terakhir)
    const pembayaranTerbaru = await prisma.pembayaran.findMany({
      where: { status: 'Pending' },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        penyewa: { select: { nama: true } },
      },
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
        totalRevenue: totalPemasukan._sum.jumlah || 0,
      },
      recentPendingPayments: pembayaranTerbaru,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mendapatkan data statistik untuk Dashboard Penyewa
// @route   GET /api/dashboard/tenant
export const getTenantDashboard = async (req, res) => {
  const penyewaId = req.user.id;

  try {
    // 1. Dapatkan info kamar penyewa
    const myKamar = await prisma.kamar.findFirst({
      where: { penyewa: { id: penyewaId } },
    });

    // 2. Dapatkan riwayat pembayaran (5 terakhir)
    const myPayments = await prisma.pembayaran.findMany({
      where: { penyewaId: penyewaId },
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 3. Cek pembayaran 'Pending'
    const pendingPayment = await prisma.pembayaran.findFirst({
      where: {
        penyewaId: penyewaId,
        status: 'Pending',
      },
    });

    res.status(200).json({
      roomDetails: myKamar,
      paymentHistory: myPayments,
      hasPendingPayment: pendingPayment ? true : false,
      pendingPaymentDetails: pendingPayment,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};