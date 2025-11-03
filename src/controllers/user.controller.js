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
export const getAllUsers = async (req, res) => {
  try {
    // Ambil query param 'role' jika ada (misal: /api/user?role=PENYEWA)
    const { role } = req.query;

    const whereClause = {};
    if (role) {
      whereClause.role = role; // Filter berdasarkan role
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        nama: true,
        email: true,
        no_hp: true,
        role: true,
      },
      orderBy: {
        nama: 'asc'
      }
    });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil daftar user", error: error.message });
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