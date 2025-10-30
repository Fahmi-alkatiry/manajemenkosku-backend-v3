import multer from 'multer';
import path from 'path';
import fs from 'fs'; // <--- 1. TAMBAHKAN IMPORT INI

const uploadDir = 'uploads/'; // <--- 2. TENTUKAN NAMA FOLDER

// Konfigurasi penyimpanan untuk multer
const storage = multer.diskStorage({
  // Tentukan folder tujuan
  destination: (req, file, cb) => {
    // 3. CEK JIKA FOLDER BELUM ADA
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir); // BUAT FOLDERNYA
    }
    cb(null, uploadDir); // GUNAKAN FOLDER ITU
  },
  // Buat nama file yang unik (untuk menghindari nama file yang sama)
  filename: (req, file, cb) => {
    // Format: fieldname-timestamp-extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Filter file (hanya izinkan gambar)
const fileFilter = (req, file, cb) => {
  // Tipe file yang diizinkan (jpeg, jpg, png, pdf)
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung (hanya JPEG, PNG, atau PDF)'), false);
  }
};

// Inisialisasi multer dengan konfigurasi
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // Batas 5MB per file
  },
  fileFilter: fileFilter,
});

export const uploadProof = upload.single('bukti_pembayaran');