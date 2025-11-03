import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Hapus data lama (opsional, tapi bagus untuk reset)
  console.log('Menghapus data lama...');
  await prisma.pembayaran.deleteMany();
  await prisma.kontrak.deleteMany();
  await prisma.kamar.deleteMany();
  await prisma.properti.deleteMany();
  await prisma.user.deleteMany();

  // === 2. Buat User (ADMIN & PENYEWA) ===
  console.log('Membuat Users...');
  const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
  const hashedPasswordBudi = await bcrypt.hash('budi123', 10);
  const hashedPasswordAni = await bcrypt.hash('ani123', 10);

  const admin = await prisma.user.create({
    data: {
      nama: 'Admin Kos',
      email: 'admin@kos.com',
      password: hashedPasswordAdmin,
      role: 'ADMIN',
      no_hp: '081234567890',
      nik: '3500000000000001',
      foto_ktp: '/uploads/ktp/admin.jpg',
    },
  });

  const budi = await prisma.user.create({
    data: {
      nama: 'Budi Santoso',
      email: 'budi@gmail.com',
      password: hashedPasswordBudi,
      role: 'PENYEWA',
      no_hp: '081111111111',
      nik: '3500000000000002',
      foto_ktp: '/uploads/ktp/budi.jpg',
    },
  });

  const ani = await prisma.user.create({
    data: {
      nama: 'Ani Lestari',
      email: 'ani@gmail.com',
      password: hashedPasswordAni,
      role: 'PENYEWA',
      no_hp: '082222222222',
    },
  });

  // === 3. Buat Properti (Kos) ===
  console.log('Membuat Properti...');
  const properti1 = await prisma.properti.create({
    data: {
      nama_properti: 'Kos Mawar Asri',
      alamat: 'Jl. Melati No. 10, Jakarta',
      deskripsi: 'Kos nyaman dan bersih, dekat kampus.',
      pemilikId: admin.id, // <-- Relasi ke Admin
    },
  });

  const properti2 = await prisma.properti.create({
    data: {
      nama_properti: 'Kontrakan Jaya',
      alamat: 'Jl. Anggrek No. 5, Surabaya',
      deskripsi: 'Kontrakan 1 rumah, 3 kamar tidur.',
      pemilikId: admin.id, // <-- Relasi ke Admin
    },
  });

  // === 4. Buat Kamar ===
  console.log('Membuat Kamar...');
  // Kamar untuk Kos Mawar Asri
  const kamar101 = await prisma.kamar.create({
    data: {
      nomor_kamar: '101',
      tipe: 'Kamar Mandi Dalam + AC',
      harga: 800000,
      status: 'Tersedia',
      propertiId: properti1.id, // <-- Relasi ke Kos Mawar
    },
  });

  const kamar102 = await prisma.kamar.create({
    data: {
      nomor_kamar: '102',
      tipe: 'Kamar Mandi Luar',
      harga: 500000,
      status: 'Ditempati', // <-- Akan ditempati Budi
      propertiId: properti1.id,
    },
  });

  // Unit untuk Kontrakan Jaya
  const unitKontrakan = await prisma.kamar.create({
    data: {
      nomor_kamar: 'Unit A1',
      tipe: 'Rumah Tipe 45',
      harga: 15000000, // Harga per tahun
      status: 'Tersedia',
      propertiId: properti2.id, // <-- Relasi ke Kontrakan Jaya
    },
  });

  // === 5. Buat Kontrak (Sewa) ===
  console.log('Membuat Kontrak...');
  // Budi menyewa Kamar 102
  const kontrakBudi = await prisma.kontrak.create({
    data: {
      tanggal_mulai_sewa: new Date('2025-01-01'),
      tanggal_akhir_sewa: new Date('2025-12-31'),
      status_kontrak: 'AKTIF',
      // Harga asli kamar 500rb, tapi Budi dapat diskon
      harga_sewa_disepakati: 450000, // <-- Menggunakan Solusi 1
      penyewaId: budi.id, // <-- Relasi ke Budi
      kamarId: kamar102.id, // <-- Relasi ke Kamar 102
    },
  });

  // === 6. Buat Pembayaran ===
  console.log('Membuat Pembayaran...');
  // Pembayaran Budi yang sudah Lunas
  await prisma.pembayaran.create({
    data: {
      bulan: 'Oktober',
      tahun: 2025,
      jumlah: 450000,
      status: 'Lunas',
      bukti_pembayaran: '/uploads/bukti/budi_okt.jpg',
      tanggal_bayar: new Date('2025-10-05'),
      kontrakId: kontrakBudi.id, // <-- Relasi ke kontrak Budi
    },
  });

  // Pembayaran Budi yang masih Pending
  await prisma.pembayaran.create({
    data: {
      bulan: 'November',
      tahun: 2025,
      jumlah: 450000,
      status: 'Pending',
      kontrakId: kontrakBudi.id, // <-- Relasi ke kontrak Budi
    },
  });

  console.log('Seeding selesai.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Tutup koneksi
    await prisma.$disconnect();
  });