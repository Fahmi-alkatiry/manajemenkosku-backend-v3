import { prisma } from '../server.js';

// @desc    Membuat kamar baru (Khusus Admin)
// @route   POST /api/rooms
export const createRoom = async (req, res) => {
  const { nomor_kamar, tipe, harga, deskripsi, status } = req.body;

  try {
    const newRoom = await prisma.kamar.create({
      data: {
        nomor_kamar,
        tipe,
        harga,
        deskripsi,
        status: status || 'Tersedia', // Default ke 'Tersedia' jika tidak diisi
      },
    });
    res.status(201).json(newRoom);
  } catch (error) {
    // P2002 adalah kode error Prisma untuk 'unique constraint failed'
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Nomor kamar sudah ada' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mendapatkan semua kamar
// @route   GET /api/rooms
export const getAllRooms = async (req, res) => {
  try {
    // Kita juga mengambil data penyewa jika ada (relasi one-to-one)
    const rooms = await prisma.kamar.findMany({
      include: {
        penyewa: {
          select: { id: true, nama: true, no_hp: true },
        },
      },
      orderBy: {
        nomor_kamar: 'asc',
      }
    });
    res.status(200).json(rooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mendapatkan detail satu kamar
// @route   GET /api/rooms/:id
export const getRoomById = async (req, res) => {
  const { id } = req.params;

  try {
    const room = await prisma.kamar.findUnique({
      where: { id: parseInt(id) },
      include: {
        penyewa: {
          select: { id: true, nama: true, no_hp: true, email: true },
        },
      },
    });

    if (!room) {
      return res.status(404).json({ message: 'Kamar tidak ditemukan' });
    }
    res.status(200).json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update data kamar (Khusus Admin)
// @route   PUT /api/rooms/:id
export const updateRoom = async (req, res) => {
  const { id } = req.params;
  const { nomor_kamar, tipe, harga, deskripsi, status } = req.body;

  try {
    const updatedRoom = await prisma.kamar.update({
      where: { id: parseInt(id) },
      data: {
        nomor_kamar,
        tipe,
        harga,
        deskripsi,
        status,
      },
    });
    res.status(200).json(updatedRoom);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Nomor kamar sudah ada' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Kamar tidak ditemukan' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Hapus kamar (Khusus Admin)
// @route   DELETE /api/rooms/:id
export const deleteRoom = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.kamar.delete({
      where: { id: parseInt(id) },
    });
    res.status(200).json({ message: 'Kamar berhasil dihapus' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Kamar tidak ditemukan' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};