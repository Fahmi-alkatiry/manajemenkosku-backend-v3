-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `no_hp` VARCHAR(191) NULL,
    `role` ENUM('ADMIN', 'PENYEWA') NOT NULL DEFAULT 'PENYEWA',
    `alamat` VARCHAR(191) NULL,
    `nik` VARCHAR(191) NULL,
    `foto_ktp` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_nik_key`(`nik`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Properti` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_properti` VARCHAR(191) NOT NULL,
    `alamat` VARCHAR(191) NOT NULL,
    `deskripsi` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `pemilikId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Kamar` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nomor_kamar` VARCHAR(191) NOT NULL,
    `tipe` VARCHAR(191) NOT NULL,
    `harga` DOUBLE NOT NULL,
    `deskripsi` VARCHAR(191) NULL,
    `status` ENUM('Tersedia', 'Ditempati', 'Diperbaiki') NOT NULL DEFAULT 'Tersedia',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `propertiId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Kontrak` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tanggal_mulai_sewa` DATETIME(3) NOT NULL,
    `tanggal_akhir_sewa` DATETIME(3) NOT NULL,
    `status_kontrak` ENUM('AKTIF', 'BERAKHIR', 'BATAL') NOT NULL DEFAULT 'AKTIF',
    `harga_sewa_disepakati` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `penyewaId` INTEGER NOT NULL,
    `kamarId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pembayaran` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bulan` VARCHAR(191) NOT NULL,
    `tahun` INTEGER NOT NULL,
    `jumlah` DOUBLE NOT NULL,
    `status` ENUM('Pending', 'Lunas', 'Ditolak') NOT NULL DEFAULT 'Pending',
    `bukti_pembayaran` VARCHAR(191) NULL,
    `tanggal_bayar` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `kontrakId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Properti` ADD CONSTRAINT `Properti_pemilikId_fkey` FOREIGN KEY (`pemilikId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Kamar` ADD CONSTRAINT `Kamar_propertiId_fkey` FOREIGN KEY (`propertiId`) REFERENCES `Properti`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Kontrak` ADD CONSTRAINT `Kontrak_penyewaId_fkey` FOREIGN KEY (`penyewaId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Kontrak` ADD CONSTRAINT `Kontrak_kamarId_fkey` FOREIGN KEY (`kamarId`) REFERENCES `Kamar`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pembayaran` ADD CONSTRAINT `Pembayaran_kontrakId_fkey` FOREIGN KEY (`kontrakId`) REFERENCES `Kontrak`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
