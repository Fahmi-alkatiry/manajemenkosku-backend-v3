-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `no_hp` VARCHAR(191) NULL,
    `role` ENUM('ADMIN', 'PENYEWA') NOT NULL DEFAULT 'PENYEWA',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `kamarId` INTEGER NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_kamarId_key`(`kamarId`),
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

    UNIQUE INDEX `Kamar_nomor_kamar_key`(`nomor_kamar`),
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
    `penyewaId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_kamarId_fkey` FOREIGN KEY (`kamarId`) REFERENCES `Kamar`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pembayaran` ADD CONSTRAINT `Pembayaran_penyewaId_fkey` FOREIGN KEY (`penyewaId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
