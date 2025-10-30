// src/controllers/authController.js
import { prisma } from '../server.js'; // Pastikan path import ini benar
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// REGISTER
export const register = async (req, res) => {
  // Menggunakan field dari skema Anda: nama, email, password, no_hp, role
  const { nama, email, password, no_hp, role, } = req.body;

  try {
    // 1. Cek apakah email sudah ada
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Buat user baru
    const newUser = await prisma.user.create({
      data: {
        nama,
        email,
        password: hashedPassword,
        no_hp,
        role: role || 'PENYEWA', // Default ke PENYEWA jika tidak dispesifikasi
      },
    });

    // Catatan: Saat register, 'kamarId' sengaja dibiarkan null.
    // Penugasan kamar (linking User ke Kamar) akan dilakukan oleh Admin
    // melalui endpoint lain (misal: PUT /api/tenants/:id/assign-room)

    res.status(201).json({ message: 'User berhasil dibuat', userId: newUser.id });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Cari user berdasarkan email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Email atau password salah' });
    }

    // 2. Cek password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email atau password salah' });
    }

    // 3. Buat JWT Token
    const token = jwt.sign(
      { 
        userId: user.id, // Menggunakan ID integer dari skema Anda
        role: user.role 
      },
      process.env.JWT_SECRET, // Pastikan ini ada di file .env
      { expiresIn: '1d' } // Token berlaku 1 hari
    );

    // 4. Kirim response (sesuai skema Anda)
    res.status(200).json({
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
        no_hp: user.no_hp,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get current user data
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  // Middleware 'protect' sudah dijalankan sebelumnya
  // dan menempelkan data user ke req.user
  
  try {
    // Kita cari ulang untuk data yang paling update (opsional, tapi bagus)
    const user = await prisma.user.findUnique({
     where: { id: req.user.id },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        no_hp: true,
        alamat: true, // <-- TAMBAHKAN INI
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id; // Diambil dari middleware 'protect'

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Password lama dan baru diperlukan' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password baru minimal 6 karakter' });
  }

  try {
    // 1. Ambil data user
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // 2. Cek password lama
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password lama salah' });
    }

    // 3. Hash password baru
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 4. Update password di database
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: 'Password berhasil diubah' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const getAllUser = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateProfileDetails = async (req, res) => {
  const { nama, no_hp, alamat } = req.body;
  const userId = req.user.id; // Diambil dari middleware 'protect'

  try {
   const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        nama,
        no_hp,
        alamat, // <-- TAMBAHKAN INI
      },
      select: { // Pastikan 'alamat' ada di select
        id: true,
        nama: true,
        email: true,
        role: true,
        no_hp: true,
        alamat: true, // <-- TAMBAHKAN INI
      },
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};