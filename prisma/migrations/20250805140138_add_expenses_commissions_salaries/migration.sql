-- AlterTable
ALTER TABLE `actors` ADD COLUMN `baseSalary` DECIMAL(10, 2) NULL;

-- CreateTable
CREATE TABLE `Expense` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `category` ENUM('RENT', 'UTILITIES', 'SUPPLIES', 'MARKETING', 'OTHER') NOT NULL,
    `expenseDate` DATETIME(3) NOT NULL,
    `shopId` INTEGER NULL,
    `processedById` INTEGER NOT NULL,

    INDEX `Expense_shopId_idx`(`shopId`),
    INDEX `Expense_processedById_idx`(`processedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CommissionPayment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sellerId` INTEGER NOT NULL,
    `amountPaid` DECIMAL(10, 2) NOT NULL,
    `paymentDate` DATETIME(3) NOT NULL,
    `periodStartDate` DATETIME(3) NOT NULL,
    `periodEndDate` DATETIME(3) NOT NULL,
    `processedById` INTEGER NOT NULL,

    INDEX `CommissionPayment_sellerId_idx`(`sellerId`),
    INDEX `CommissionPayment_processedById_idx`(`processedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalaryPayment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `paymentDate` DATETIME(3) NOT NULL,
    `payPeriodMonth` INTEGER NOT NULL,
    `payPeriodYear` INTEGER NOT NULL,
    `processedById` INTEGER NOT NULL,

    INDEX `SalaryPayment_employeeId_idx`(`employeeId`),
    INDEX `SalaryPayment_processedById_idx`(`processedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_shopId_fkey` FOREIGN KEY (`shopId`) REFERENCES `shops`(`_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_processedById_fkey` FOREIGN KEY (`processedById`) REFERENCES `actors`(`_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommissionPayment` ADD CONSTRAINT `CommissionPayment_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `actors`(`_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommissionPayment` ADD CONSTRAINT `CommissionPayment_processedById_fkey` FOREIGN KEY (`processedById`) REFERENCES `actors`(`_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalaryPayment` ADD CONSTRAINT `SalaryPayment_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `actors`(`_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalaryPayment` ADD CONSTRAINT `SalaryPayment_processedById_fkey` FOREIGN KEY (`processedById`) REFERENCES `actors`(`_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
