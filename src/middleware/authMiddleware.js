import jwt from 'jsonwebtoken';
import { prisma } from '../server.js';

// Middleware untuk memverifikasi token JWT
export const protect = async (req, res, next) => {
  let token;

  // Cek apakah header 'Authorization' ada dan dimulai dengan 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 1. Ambil token dari header (format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // 2. Verifikasi token menggunakan JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Ambil data user dari database (tanpa password) dan pasang ke 'req'
      // 'decoded.userId' berasal dari payload token yang kita buat saat login
      req.user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, role: true, nama: true },
      });

      // 4. Lanjutkan ke controller berikutnya
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Tidak terautentikasi, token gagal' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Tidak terautentikasi, tidak ada token' });
  }
};

// Middleware untuk memeriksa role Admin
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next(); // Lanjutkan jika user adalah ADMIN
  } else {
    res.status(403).json({ message: 'Akses ditolak, khusus Admin' });
  }
};