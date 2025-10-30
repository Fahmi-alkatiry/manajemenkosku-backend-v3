import { prisma } from '../server.js';
import bcrypt from 'bcryptjs';

// @desc    Membuat penyewa baru (oleh Admin)
// @route   POST /api/tenants
export const createTenant = async (req, res) => {
  const { nama, email, password, no_hp, kamarId } = req.body;

  try {
    // 1. Cek apakah email sudah ada
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Buat user baru dengan role PENYEWA
    const newTenant = await prisma.user.create({
      data: {
        nama,
        email,
        password: hashedPassword,
        no_hp,
        role: 'PENYEWA',
        kamarId: kamarId ? parseInt(kamarId) : null, // Langsung assign kamar jika ada
      },
    });

    // 4. Jika kamarId diberikan, update status kamar menjadi Ditempati
    if (kamarId) {
      await prisma.kamar.update({
        where: { id: parseInt(kamarId) },
        data: { status: 'Ditempati' },
      });
    }

    // Jangan kirim password kembali
    const { password: _, ...tenantData } = newTenant;
    res.status(201).json(tenantData);

  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Email sudah digunakan' });
    }
    // Error jika kamarId tidak valid
    if (error.code === 'P2025' || error.code === 'P2003') {
       return res.status(404).json({ message: 'Kamar tidak ditemukan atau sudah ditempati' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mendapatkan semua penyewa
// @route   GET /api/tenants
export const getAllTenants = async (req, res) => {
  try {
    const tenants = await prisma.user.findMany({
      where: { role: 'PENYEWA' },
      select: {
        id: true,
        nama: true,
        email: true,
        no_hp: true,
        role: true,
        kamar: true, // Ambil data kamar yang terhubung
      },
      orderBy: {
        nama: 'asc',
      },
    });
    res.status(200).json(tenants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mendapatkan detail satu penyewa
// @route   GET /api/tenants/:id
export const getTenantById = async (req, res) => {
  const { id } = req.params;

  try {
    const tenant = await prisma.user.findUnique({
      where: { id: parseInt(id), role: 'PENYEWA' },
      select: {
        id: true,
        nama: true,
        email: true,
        no_hp: true,
        kamar: true,
        pembayaran: true, // Ambil histori pembayaran
      },
    });

    if (!tenant) {
      return res.status(404).json({ message: 'Penyewa tidak ditemukan' });
    }
    res.status(200).json(tenant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update data penyewa (oleh Admin)
// @route   PUT /api/tenants/:id
export const updateTenant = async (req, res) => {
  const { id } = req.params;
  // Admin bisa update nama, email, no_hp
  const { nama, email, no_hp } = req.body;

  try {
    const updatedTenant = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        nama,
        email,
        no_hp,
      },
    });

    const { password, ...tenantData } = updatedTenant;
    res.status(200).json(tenantData);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Email sudah digunakan' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Penyewa tidak ditemukan' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Menghapus penyewa (oleh Admin)
// @route   DELETE /api/tenants/:id
export const deleteTenant = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Cari penyewa dulu untuk tahu dia di kamar mana (jika ada)
    const tenant = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    // 2. Jika penyewa punya kamar, kosongkan kamar itu
    if (tenant && tenant.kamarId) {
      await prisma.kamar.update({
        where: { id: tenant.kamarId },
        data: { status: 'Tersedia' },
      });
      // Kita tidak perlu memutuskan relasi (user.kamarId = null)
      // karena 'onDelete: Cascade' tidak di-set, menghapus user
      // tidak akan otomatis mengosongkan kamar. Kita lakukan manual.
    }

    // 3. Hapus penyewa
    // Ini juga akan menghapus pembayaran terkait (karena ada relasi di Pembayaran)
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'Penyewa berhasil dihapus' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Penyewa tidak ditemukan' });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};