import prisma from '../lib/prisma.js';

// 1. Controller untuk Membuat Properti
export const createProperti = async (req, res) => {
  // Kita tahu req.user ada dari middleware
  const adminId = req.user.userId;
  const { nama_properti, alamat, deskripsi } = req.body;

  try {
    const newProperti = await prisma.properti.create({
      data: {
        nama_properti,
        alamat,
        deskripsi,
        pemilikId: adminId, // Relasi ke User (Admin)
      },
    });
    res.status(201).json(newProperti);
    console.log(newProperti);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. READ (Get All)
export const getAllProperti = async (req, res) => {
  try {
    const properti = await prisma.properti.findMany({
      include: {
        pemilik: { // Sertakan info pemilik
          select: {
            nama: true,
            no_hp: true
          }
        }
      }
    });
    res.status(200).json(properti);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data properti", error: error.message });
  }
};

// 3. READ (Get by ID)
export const getPropertiById = async (req, res) => {
  try {
    const { id } = req.params;
    const properti = await prisma.properti.findUnique({
      where: { id: parseInt(id) },
      include: {
        kamar: true, // Langsung sertakan daftar kamar di properti ini
      },
    });

    if (!properti) {
      return res.status(404).json({ message: "Properti tidak ditemukan" });
    }

    res.status(200).json(properti);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data properti", error: error.message });
  }
};

// 4. UPDATE
export const updateProperti = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_properti, alamat, deskripsi } = req.body;
    const adminId = req.user.userId;

    // 1. Cek kepemilikan
    const properti = await prisma.properti.findUnique({
      where: { id: parseInt(id) },
    });

    if (!properti) {
      return res.status(404).json({ message: "Properti tidak ditemukan" });
    }
    
    // Keamanan: Pastikan hanya pemilik yang bisa mengedit
    if (properti.pemilikId !== adminId) {
      return res.status(403).json({ message: "Akses ditolak: Anda bukan pemilik properti ini" });
    }

    // 2. Jika aman, update
    const updatedProperti = await prisma.properti.update({
      where: { id: parseInt(id) },
      data: {
        nama_properti,
        alamat,
        deskripsi,
      },
    });

    res.status(200).json(updatedProperti);
  } catch (error) {
    res.status(500).json({ message: "Gagal update properti", error: error.message });
  }
};

// 5. DELETE
export const deleteProperti = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.userId;

    // 1. Cek kepemilikan
    const properti = await prisma.properti.findUnique({
      where: { id: parseInt(id) },
    });

    if (!properti) {
      return res.status(404).json({ message: "Properti tidak ditemukan" });
    }
    
    // Keamanan: Pastikan hanya pemilik yang bisa menghapus
    if (properti.pemilikId !== adminId) {
      return res.status(403).json({ message: "Akses ditolak: Anda bukan pemilik properti ini" });
    }

    // 2. Jika aman, hapus
    await prisma.properti.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: "Properti berhasil dihapus" });
  } catch (error) {
    // Tangani error jika properti tidak bisa dihapus (misal: masih ada kamar)
    if (error.code === 'P2003') { // Error foreign key constraint
      return res.status(400).json({ message: "Gagal menghapus: Masih ada kamar yang terdaftar di properti ini." });
    }
    res.status(500).json({ message: "Gagal menghapus properti", error: error.message });
  }
};