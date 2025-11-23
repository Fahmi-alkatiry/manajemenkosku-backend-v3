// src/middleware/upload.middleware.js
import multer from 'multer';
import path from 'path';

// Konfigurasi Penyimpanan
const storage = (destinationPath) => multer.diskStorage({
  // Tentukan folder tujuan
  destination: (req, file, cb) => {
    cb(null, `public/uploads/${destinationPath}`);
  },
  // Tentukan nama file
  filename: (req, file, cb) => {
    // Buat nama file unik (contoh: KTP-1700000000.jpg)
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

// Filter file (hanya izinkan gambar)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
    cb(null, true);
  } else {
    cb(new Error('Format gambar tidak didukung! Hanya .jpg, .jpeg, .png'), false);
  }
};

// Middleware untuk upload KTP
export const uploadKtp = multer({
  storage: storage('ktp'), // Simpan di 'public/uploads/ktp'
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 2 } // Batas 2MB
}).single('foto_ktp'); // 'foto_ktp' adalah nama field dari form-data

// Middleware untuk upload Bukti Bayar
export const uploadBukti = multer({
  storage: storage('bukti'), // Simpan di 'public/uploads/bukti'
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 2 } // Batas 2MB
}).single('bukti_pembayaran'); // 'bukti_pembayaran' adalah nama field