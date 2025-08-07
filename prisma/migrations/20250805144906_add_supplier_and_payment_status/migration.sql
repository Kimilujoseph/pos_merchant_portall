/*
  Warnings:

  - You are about to drop the `supplier` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `accessories` ADD COLUMN `paymentStatus` VARCHAR(191) NOT NULL DEFAULT 'PAID',
    ADD COLUMN `supplierId` INTEGER NULL;

-- AlterTable
ALTER TABLE `mobiles` ADD COLUMN `paymentStatus` VARCHAR(191) NOT NULL DEFAULT 'PAID',
    ADD COLUMN `supplierId` INTEGER NULL;

-- DropTable
DROP TABLE `supplier`;

-- CreateTable
CREATE TABLE `Supplier` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `contactName` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Supplier_name_key`(`name`),
    UNIQUE INDEX `Supplier_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `accessories` ADD CONSTRAINT `accessories_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mobiles` ADD CONSTRAINT `mobiles_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
