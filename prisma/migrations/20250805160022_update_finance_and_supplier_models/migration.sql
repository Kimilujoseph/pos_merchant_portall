/*
  Warnings:

  - You are about to drop the column `supplierName` on the `accessories` table. All the data in the column will be lost.
  - You are about to drop the column `finance` on the `accessorysales` table. All the data in the column will be lost.
  - You are about to drop the column `financer` on the `accessorysales` table. All the data in the column will be lost.
  - You are about to drop the column `supplierName` on the `mobiles` table. All the data in the column will be lost.
  - You are about to drop the column `finance` on the `mobilesales` table. All the data in the column will be lost.
  - You are about to drop the column `financer` on the `mobilesales` table. All the data in the column will be lost.
  - You are about to drop the `mobilefinance` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `mobilefinance` DROP FOREIGN KEY `fk_financer_1`;

-- DropForeignKey
ALTER TABLE `mobilesales` DROP FOREIGN KEY `fk_mobilesales_4`;

-- DropIndex
DROP INDEX `fk_mobilesales_4_idx` ON `mobilesales`;

-- AlterTable
ALTER TABLE `accessories` DROP COLUMN `supplierName`;

-- AlterTable
ALTER TABLE `accessorysales` DROP COLUMN `finance`,
    DROP COLUMN `financer`,
    ADD COLUMN `financerId` INTEGER NULL;

-- AlterTable
ALTER TABLE `mobiles` DROP COLUMN `supplierName`;

-- AlterTable
ALTER TABLE `mobilesales` DROP COLUMN `finance`,
    DROP COLUMN `financer`,
    ADD COLUMN `financerId` INTEGER NULL;

-- DropTable
DROP TABLE `mobilefinance`;

-- CreateTable
CREATE TABLE `Financer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `contactName` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Financer_name_key`(`name`),
    UNIQUE INDEX `Financer_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `accessorysales_financerId_idx` ON `accessorysales`(`financerId`);

-- CreateIndex
CREATE INDEX `mobilesales_financerId_idx` ON `mobilesales`(`financerId`);

-- AddForeignKey
ALTER TABLE `accessorysales` ADD CONSTRAINT `accessorysales_financerId_fkey` FOREIGN KEY (`financerId`) REFERENCES `Financer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mobilesales` ADD CONSTRAINT `mobilesales_financerId_fkey` FOREIGN KEY (`financerId`) REFERENCES `Financer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
