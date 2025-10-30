-- AlterTable
ALTER TABLE `user` ADD COLUMN `alamat` VARCHAR(191) NULL,
    ADD COLUMN `tanggal_akhir_sewa` DATETIME(3) NULL,
    ADD COLUMN `tanggal_mulai_sewa` DATETIME(3) NULL;
