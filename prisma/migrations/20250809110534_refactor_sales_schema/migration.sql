/*
  Warnings:

  - You are about to drop the column `saleId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `customerEmail` on the `accessorysales` table. All the data in the column will be lost.
  - You are about to drop the column `customerName` on the `accessorysales` table. All the data in the column will be lost.
  - You are about to drop the column `customerPhoneNumber` on the `accessorysales` table. All the data in the column will be lost.
  - You are about to drop the column `paymentmethod` on the `accessorysales` table. All the data in the column will be lost.
  - You are about to drop the column `customerEmail` on the `mobilesales` table. All the data in the column will be lost.
  - You are about to drop the column `customerName` on the `mobilesales` table. All the data in the column will be lost.
  - You are about to drop the column `customerPhoneNumber` on the `mobilesales` table. All the data in the column will be lost.
  - You are about to drop the column `paymentmethod` on the `mobilesales` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Payment` DROP FOREIGN KEY `accessory_payments_saleId_fkey`;

-- DropForeignKey
ALTER TABLE `Payment` DROP FOREIGN KEY `mobile_payments_saleId_fkey`;

-- DropIndex
DROP INDEX `accessory_payments_saleId_fkey` ON `Payment`;

-- AlterTable
ALTER TABLE `Payment` DROP COLUMN `saleId`;

-- AlterTable
ALTER TABLE `accessorysales` DROP COLUMN `customerEmail`,
    DROP COLUMN `customerName`,
    DROP COLUMN `customerPhoneNumber`,
    DROP COLUMN `paymentmethod`,
    ADD COLUMN `paymentId` INTEGER NULL;

-- AlterTable
ALTER TABLE `mobilesales` DROP COLUMN `customerEmail`,
    DROP COLUMN `customerName`,
    DROP COLUMN `customerPhoneNumber`,
    DROP COLUMN `paymentmethod`,
    ADD COLUMN `paymentId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `accessorysales_paymentId_idx` ON `accessorysales`(`paymentId`);

-- CreateIndex
CREATE INDEX `mobilesales_paymentId_idx` ON `mobilesales`(`paymentId`);

-- AddForeignKey
ALTER TABLE `accessorysales` ADD CONSTRAINT `accessorysales_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mobilesales` ADD CONSTRAINT `mobilesales_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
