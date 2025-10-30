import { prisma } from '../server.js';

// @desc    Mendapatkan data laporan pembayaran (JSON)
// @route   GET /api/reports/payments
export const getPaymentReport = async (req, res) => {
  // Ambil filter dari query parameters (contoh: /api/reports/payments?tahun=2025&bulan=Oktober&status=Lunas)
  const { bulan, tahun, status } = req.query;

  // Bangun klausa 'where' secara dinamis berdasarkan filter yang ada
  const whereClause = {
    // Filter status jika ada
    status: status ? status : undefined,
    
    // Filter bulan jika ada
    bulan: bulan ? bulan : undefined,
    
    // Filter tahun jika ada (pastikan diubah ke integer)
    tahun: tahun ? parseInt(tahun) : undefined,
  };

  try {
    const payments = await prisma.pembayaran.findMany({
      where: whereClause,
      include: {
        penyewa: {
          select: { nama: true, no_hp: true },
        },
      },
      orderBy: {
        createdAt: 'asc', // Urutkan dari yang terlama
      },
    });

    // Hitung total dari data yang difilter
    const total = payments.reduce((acc, payment) => acc + payment.jumlah, 0);

    res.status(200).json({
      totalFiltered: payments.length,
      totalAmount: total,
      filters: req.query, // Mengembalikan filter yang digunakan
      data: payments, // Data lengkap untuk diolah Flutter
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getReportSummary = async (req, res) => {
  try {
    // === 1. Statistik Okupansi & Kamar ===
    const totalKamar = await prisma.kamar.count();
    const kamarDitempati = await prisma.kamar.count({
      where: { status: 'Ditempati' },
    });
    const tingkatOkupansi = totalKamar > 0 ? (kamarDitempati / totalKamar) * 100 : 0;

    // === 2. Distribusi Tipe Kamar (Pie Chart) ===
    const distribusiKamar = await prisma.kamar.groupBy({
      by: ['tipe'],
      _count: {
        tipe: true,
      },
    });

    // === 3. Statistik Penyewa ===
    const totalPenyewaAktif = await prisma.user.count({
      where: {
        role: 'PENYEWA',
        kamarId: { not: null }, // Asumsi penyewa aktif = punya kamar
      },
    });

    // === 4. Statistik Pendapatan (Grafik Batang) ===
    // Ambil semua pembayaran Lunas
    const payments = await prisma.pembayaran.findMany({
      where: { status: 'Lunas' },
      select: { jumlah: true, createdAt: true, bulan: true, tahun: true },
    });

    // Hitung total pendapatan
    const totalPendapatan = payments.reduce((acc, p) => acc + p.jumlah, 0);

    // Hitung rata-rata harga sewa (dari kamar yang ditempati)
    const avgHargaResult = await prisma.kamar.aggregate({
      _avg: {
        harga: true,
      },
      where: { status: 'Ditempati' },
    });
    const rataRataHargaSewa = avgHargaResult._avg.harga || 0;

    // === 5. Tren Pendapatan Bulanan (Line Chart) ===
    // (Ini adalah contoh sederhana, idealnya di-group by bulan di database)
    const trenPendapatanBulanan = {}; // { "Jan": 1500000, "Feb": 2000000 }
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    
    for (const payment of payments) {
      const monthIndex = payment.createdAt.getMonth(); // 0-11
      const monthName = monthNames[monthIndex];
      trenPendapatanBulanan[monthName] = (trenPendapatanBulanan[monthName] || 0) + payment.jumlah;
    }

    // Mengisi bulan yang kosong dengan 0
    for (const monthName of monthNames) {
      if (!trenPendapatanBulanan[monthName]) {
        trenPendapatanBulanan[monthName] = 0;
      }
    }

    // === 6. Statistik Tambahan (Tunggakan, dll) ===
    // (Ini memerlukan logika lebih kompleks, misal: cek penyewa aktif yg belum bayar bulan ini)
    // Untuk saat ini kita kirim placeholder
    const totalTunggakanPenyewa = 0; // Placeholder

    res.status(200).json({
      statistikTambahan: {
        tingkatOkupansi: tingkatOkupansi.toFixed(1), // "75.0"
        totalKamarDitempati: kamarDitempati,
        totalKamar: totalKamar,
        rataRataHargaSewa: rataRataHargaSewa,
        totalPenyewaAktif: totalPenyewaAktif,
        pembayaranTepatWaktu: 83, // Placeholder
        totalPenyewaTepatWaktu: 15, // Placeholder
      },
      distribusiTipeKamar: distribusiKamar.map(item => ({
        tipe: item.tipe,
        jumlah: item._count.tipe,
        persentase: (item._count.tipe / totalKamar) * 100,
      })),
      laporanKeuangan: {
        totalPendapatan: totalPendapatan,
        pendapatanBulanIni: trenPendapatanBulanan[monthNames[new Date().getMonth()]] || 0,
        tunggakan: totalTunggakanPenyewa,
      },
      trenPendapatanBulanan: trenPendapatanBulanan, // Data untuk line/bar chart
    });

  } catch (error) {
    console.error('Error getReportSummary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};