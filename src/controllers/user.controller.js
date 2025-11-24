// src/controllers/user.controller.js

import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';

// 1. Melihat Profil Saya (User yang sedang login)
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // Diambil dari token

    const user = await prisma.user.findUnique({
      where: { id: userId },
      // Hapus password dari respons
      select: {
        id: true,
        nama: true,
        email: true,
        no_hp: true,
        role: true,
        alamat: true,
        nik: true,
        foto_ktp: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil profil", error: error.message });
  }
};

// 2. Update Profil Saya (User yang sedang login)
export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // Diambil dari token
    const { nama, no_hp, alamat, password } = req.body;

    const dataToUpdate = {
      nama,
      no_hp,
      alamat,
    };

    // Jika user juga ingin mengganti password
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      dataToUpdate.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    // Hapus password dari respons
    delete updatedUser.password;

    res.status(200).json({ message: "Profil berhasil diupdate", data: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Gagal update profil", error: error.message });
  }
};

// 3. Melihat Daftar Semua User (Hanya Admin)
// 3. Melihat Daftar Semua User
export const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const whereClause = role ? { role } : {};

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        nama: true,
        email: true,
        no_hp: true,
        role: true,
        alamat: true,
        foto_ktp: true,
        // --- UPDATE DI SINI ---
        // Ambil 1 kontrak aktif terbaru untuk info kamar
        kontrak: {
          where: { status_kontrak: 'AKTIF' },
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            kamar: {
              select: {
                nomor_kamar: true,
                properti: {
                  select: { nama_properti: true }
                }
              }
            }
          }
        }
      },
      orderBy: { nama: 'asc' }
    });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Gagal ambil data", error: error.message });
  }
};

// 4. Melihat Detail User Tertentu (Hanya Admin)
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        nama: true,
        email: true,
        no_hp: true,
        role: true,
        alamat: true,
        nik: true,
        foto_ktp: true,
        createdAt: true,
        kontrak: { // Tampilkan juga riwayat kontraknya
          include: {
            kamar: {
              select: { nomor_kamar: true }
            }
          }
        }
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil detail user", error: error.message });
  }
};

export const createTenant = async (req, res) => {
  try {
    const { nama, email, password, no_hp, alamat } = req.body;

    // Hash password default (misal admin set password awal)
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        nama,
        email,
        password: hashedPassword,
        no_hp,
        alamat,
        role: 'PENYEWA', // Paksa role jadi PENYEWA
      },
    });

    res.status(201).json({ message: "Penyewa berhasil ditambahkan", data: newUser });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }
    res.status(500).json({ message: "Gagal menambah penyewa", error: error.message });
  }
};

// 6. UPDATE: Edit Data Penyewa (Oleh Admin)
export const updateTenantByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, email, no_hp, alamat, password } = req.body;

    const dataToUpdate = { nama, email, no_hp, alamat };

    // Jika Admin mau reset password penyewa
    if (password && password.trim() !== "") {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
    });

    res.status(200).json({ message: "Data penyewa diupdate", data: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Gagal update penyewa", error: error.message });
  }
};

// 7. DELETE: Hapus Penyewa (Oleh Admin)
export const deleteTenant = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah punya kontrak aktif (Opsional: cegah hapus jika ada kontrak)
    // Tapi untuk sekarang kita langsung hapus saja (Prisma akan error jika ada relasi restrict)
    
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: "Penyewa berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus (Mungkin masih ada data kontrak terkait)", error: error.message });
  }
};