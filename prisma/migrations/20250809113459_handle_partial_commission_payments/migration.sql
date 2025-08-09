-- AlterTable
ALTER TABLE `accessorysales` ADD COLUMN `commissionPaid` INTEGER NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `mobilesales` ADD COLUMN `commissionPaid` INTEGER NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `CommissionPaymentsOnMobileSales` (
    `mobileSaleId` INTEGER NOT NULL,
    `commissionPaymentId` INTEGER NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `assignedBy` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`commissionPaymentId`, `mobileSaleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CommissionPaymentsOnAccessorySales` (
    `accessorySaleId` INTEGER NOT NULL,
    `commissionPaymentId` INTEGER NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `assignedBy` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`commissionPaymentId`, `accessorySaleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CommissionPaymentsOnMobileSales` ADD CONSTRAINT `CommissionPaymentsOnMobileSales_mobileSaleId_fkey` FOREIGN KEY (`mobileSaleId`) REFERENCES `mobilesales`(`_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommissionPaymentsOnMobileSales` ADD CONSTRAINT `CommissionPaymentsOnMobileSales_commissionPaymentId_fkey` FOREIGN KEY (`commissionPaymentId`) REFERENCES `CommissionPayment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommissionPaymentsOnAccessorySales` ADD CONSTRAINT `CommissionPaymentsOnAccessorySales_accessorySaleId_fkey` FOREIGN KEY (`accessorySaleId`) REFERENCES `accessorysales`(`_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommissionPaymentsOnAccessorySales` ADD CONSTRAINT `CommissionPaymentsOnAccessorySales_commissionPaymentId_fkey` FOREIGN KEY (`commissionPaymentId`) REFERENCES `CommissionPayment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
