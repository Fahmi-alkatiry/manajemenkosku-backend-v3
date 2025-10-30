import { prisma } from '../server.js';

// @desc    Membuat tagihan/pembayaran baru (oleh Penyewa)
// @route   POST /api/payments
export const createPayment = async (req, res) => {
  const { bulan, tahun, jumlah } = req.body;
  const penyewaId = req.user.id; // Diambil dari token (middleware 'protect')

  // Cek apakah file di-upload
  if (!req.file) {
    return res.status(400).json({ message: 'Bukti pembayaran diperlukan' });
  }
  
  // Dapatkan URL file yang bisa diakses
  // req.file.path akan seperti 'uploads\namafile.jpg' (ganti \ jadi /)
  const bukti_pembayaran_url = req.file.path.replace(/\\/g, "/");

  try {
    const newPayment = await prisma.pembayaran.create({
      data: {
        bulan,
        tahun: parseInt(tahun),
        jumlah: parseFloat(jumlah),
        status: 'Pending', // Selalu Pending saat pertama dibuat
        bukti_pembayaran: bukti_pembayaran_url, // Simpan path/URL file
        penyewaId: penyewaId,
      },
    });

    res.status(201).json(newPayment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mendapatkan riwayat pembayaran milik sendiri (Penyewa)
// @route   GET /api/payments/mypayments
export const getMyPayments = async (req, res) => {
  const penyewaId = req.user.id; // Diambil dari token

  try {
    const payments = await prisma.pembayaran.findMany({
      where: { penyewaId: penyewaId },
      // TAMBAHKAN BLOK INI
      include: {
        penyewa: {
          select: {
            nama: true,
            kamar: true,
          },
        },
      },
      // ---------------------
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mendapatkan SEMUA pembayaran (Khusus Admin)
// @route   GET /api/payments
export const getAllPayments = async (req, res) => {
  // Admin bisa filter by status, misal: /api/payments?status=Pending
  const { status } = req.query;

  try {
    const payments = await prisma.pembayaran.findMany({
      where: {
        status: status ? status : undefined, // Filter jika ada query
      },
      include: {
        penyewa: { // Sertakan data penyewa
          select: { id: true, nama: true, kamar: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mengubah status pembayaran (Khusus Admin)
// @route   PUT /api/payments/:id/status
export const updatePaymentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Status baru: 'Lunas' atau 'Ditolak'

  if (!status || (status !== 'Lunas' && status !== 'Ditolak')) {
    return res.status(400).json({ message: 'Status tidak valid' });
  }

  try {
    const updatedPayment = await prisma.pembayaran.update({
      where: { id: parseInt(id) },
      data: {
        status: status,
        // Jika status Lunas, set tanggal bayar
        tanggal_bayar: status === 'Lunas' ? new Date() : null,
      },
    });

    res.status(200).json(updatedPayment);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Pembayaran tidak ditemukan' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};