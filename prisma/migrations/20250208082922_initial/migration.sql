-- CreateTable
CREATE TABLE `accessories` (
    `_id` INTEGER NOT NULL AUTO_INCREMENT,
    `batchNumber` VARCHAR(255) NOT NULL,
    `productType` VARCHAR(255) NULL,
    `CategoryId` INTEGER NOT NULL,
    `faultyItems` INTEGER UNSIGNED NULL DEFAULT 0,
    `barcodePath` VARCHAR(255) NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `availableStock` INTEGER UNSIGNED NULL DEFAULT 0,
    `stockStatus` VARCHAR(255) NULL DEFAULT 'available',
    `color` VARCHAR(255) NULL DEFAULT 'white',
    `productCost` INTEGER NULL,
    `commission` INTEGER NULL,
    `discount` INTEGER NULL,
    `supplierName` VARCHAR(255) NULL,
    `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `_id_UNIQUE`(`_id`),
    UNIQUE INDEX `itemName_UNIQUE`(`batchNumber`),
    INDEX `fk_accessories_1_idx`(`CategoryId`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accessoryHistory` (
    `_id` INTEGER NOT NULL AUTO_INCREMENT,
    `addedBy` INTEGER NOT NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `shopId` INTEGER NOT NULL,
    `type` VARCHAR(45) NOT NULL DEFAULT 'new stock',
    `quantity` INTEGER UNSIGNED NOT NULL,
    `productID` INTEGER NOT NULL,

    UNIQUE INDEX `_id_UNIQUE`(`_id`),
    INDEX `fk_acccessoryHistory_1_idx`(`productID`),
    INDEX `fk_accessoryHistory_1_idx`(`shopId`),
    INDEX `fk_accessoryHistory_2_idx`(`addedBy`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accessoryItems` (
    `_id` INTEGER NOT NULL AUTO_INCREMENT,
    `accessoryID` INTEGER NOT NULL,
    `shopID` INTEGER NOT NULL,
    `status` VARCHAR(45) NOT NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `quantity` INTEGER UNSIGNED NULL,
    `productStatus` VARCHAR(255) NULL DEFAULT 'new stock',
    `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `transferId` INTEGER NULL,
    `confirmedBy` INTEGER NULL,

    UNIQUE INDEX `_id_UNIQUE`(`_id`),
    INDEX `fk_accessoryItems_1_idx`(`shopID`),
    INDEX `fk_accessoryItems_2_idx`(`accessoryID`),
    INDEX `fk_confirmedBy_actor_2`(`confirmedBy`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accessorysales` (
    `_id` INTEGER NOT NULL AUTO_INCREMENT,
    `productID` INTEGER NOT NULL,
    `shopID` INTEGER NOT NULL,
    `sellerId` INTEGER NOT NULL,
    `soldPrice` DECIMAL(10, 2) NOT NULL,
    `profit` INTEGER UNSIGNED NOT NULL,
    `customerName` VARCHAR(45) NULL DEFAULT 'doe',
    `customerEmail` VARCHAR(45) NULL DEFAULT 'doe@gmail.com',
    `customerPhoneNumber` VARCHAR(45) NULL DEFAULT '07000000',
    `paymentmethod` ENUM('mpesa', 'cash', 'creditcard') NULL,
    `finance` INTEGER NOT NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `commisssionStatus` ENUM('pending', 'paid') NULL,
    `quantity` INTEGER NULL DEFAULT 0,
    `commission` INTEGER NULL DEFAULT 0,
    `categoryId` INTEGER NULL,
    `financer` VARCHAR(255) NULL DEFAULT 'captech',
    `financeStatus` VARCHAR(255) NULL DEFAULT 'paid',
    `financeAmount` INTEGER NULL DEFAULT 0,

    UNIQUE INDEX `_id_UNIQUE`(`_id`),
    INDEX `fk_accessorysales_1_idx`(`productID`),
    INDEX `fk_accessorysales_2_idx`(`sellerId`),
    INDEX `fk_accessorysales_3_idx`(`shopID`),
    INDEX `fk_accessorysales_category`(`categoryId`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accessorytransferhistory` (
    `_id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `fromshop` INTEGER NOT NULL,
    `toshop` INTEGER NOT NULL,
    `status` VARCHAR(45) NULL DEFAULT 'pending',
    `type` ENUM('distribution', 'transfer') NULL,
    `productID` INTEGER NOT NULL,
    `confirmedBy` INTEGER NULL,
    `transferdBy` INTEGER NULL,
    `quantity` INTEGER UNSIGNED NULL,
    `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `_id_UNIQUE`(`_id`),
    INDEX `fk_accessorytransferhistory_1_idx`(`productID`),
    INDEX `fk_accessorytransferhistory_2_idx`(`fromshop`),
    INDEX `fk_accessorytransferhistory_3_idx`(`toshop`),
    INDEX `fk_confirmedBy_actor`(`confirmedBy`),
    INDEX `fk_transferdBy_actor`(`transferdBy`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `actors` (
    `_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `nextofkinname` VARCHAR(255) NOT NULL,
    `nextofkinphonenumber` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `workingstatus` VARCHAR(45) NULL DEFAULT 'inactive',
    `phone` VARCHAR(45) NOT NULL,
    `role` VARCHAR(45) NULL DEFAULT 'seller',
    `Idimagebackward` VARCHAR(255) NOT NULL DEFAULT 'https://www.linkedin.com/default_profile_picture.png',
    `Idimagefront` VARCHAR(255) NOT NULL DEFAULT 'https://www.linkedin.com/default_profile_picture.png',
    `profileimage` VARCHAR(255) NULL DEFAULT 'https://www.linkedin.com/default_profile_picture.png',
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `_id_UNIQUE`(`_id`),
    UNIQUE INDEX `actors_email_key`(`email`),
    UNIQUE INDEX `actors_phone_key`(`phone`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assignment` (
    `_id` INTEGER NOT NULL AUTO_INCREMENT,
    `userID` INTEGER NOT NULL,
    `shopID` INTEGER NOT NULL,
    `fromDate` DATETIME(0) NOT NULL,
    `toDate` DATETIME(0) NOT NULL,
    `status` ENUM('assigned', 'removed') NULL,
    `updatedAt` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `_id_UNIQUE`(`_id`),
    INDEX `fk_assignment_1_idx`(`shopID`),
    INDEX `fk_assignment_2_idx`(`userID`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `_id` INTEGER NOT NULL AUTO_INCREMENT,
    `itemName` VARCHAR(45) NULL,
    `itemModel` VARCHAR(45) NOT NULL,
    `minPrice` INTEGER NOT NULL,
    `itemType` ENUM('mobiles', 'accessories') NULL,
    `brand` VARCHAR(255) NULL DEFAULT 'unknown',
    `maxPrice` INTEGER NOT NULL,
    `category` VARCHAR(45) NULL,

    UNIQUE INDEX `_id_UNIQUE`(`_id`),
    UNIQUE INDEX `itemName_UNIQUE`(`itemName`),
    UNIQUE INDEX `itemModel_UNIQUE`(`itemModel`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mobileHistory` (
    `_id` INTEGER NOT NULL AUTO_INCREMENT,
    `addedBy` INTEGER NOT NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `shopId` INTEGER NOT NULL,
    `type` VARCHAR(45) NOT NULL DEFAULT 'new stock',
    `productID` INTEGER NOT NULL,
    `sellerId` INTEGER NULL,
    `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_mobileHistory_1_idx`(`productID`),
    INDEX `fk_mobileHistory_2_idx`(`addedBy`),
    INDEX `fk_mobileHistory_3_idx`(`shopId`),
    INDEX `fk_mobileHistory_seller`(`sellerId`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mobileItems` (
    `_id` INTEGER NOT NULL AUTO_INCREMENT,
    `mobileID` INTEGER NOT NULL,
    `shopID` INTEGER NOT NULL,
    `status` VARCHAR(45) NOT NULL DEFAULT 'pending',
    `confirmedBy` INTEGER NULL,
    `transferId` INTEGER NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `productStatus` VARCHAR(255) NULL DEFAULT 'new stock',
    `quantity` INTEGER UNSIGNED NULL DEFAULT 0,
    `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `_id_UNIQUE`(`_id`),
    INDEX `fk_mobileItems_1_idx`(`shopID`),
    INDEX `fk_mobileItems_2_idx`(`mobileID`),
    INDEX `fk_mobileItems_confirmedBy`(`confirmedBy`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mobilefinance` (
    `_id` INTEGER NOT NULL AUTO_INCREMENT,
    `financer` VARCHAR(45) NOT NULL DEFAULT 'captech',
    `financeAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `financeStatus` VARCHAR(45) NULL DEFAULT 'paid',
    `productID` INTEGER NOT NULL,

    UNIQUE INDEX `_id_UNIQUE`(`_id`),
    INDEX `fk_financer_1_idx`(`productID`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mobiles` (
    `_id` INTEGER NOT NULL AUTO_INCREMENT,
    `IMEI` VARCHAR(255) NULL,
    `batchNumber` VARCHAR(255) NOT NULL DEFAULT '0',
    `availableStock` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    `commission` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `discount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `productCost` DECIMAL(10, 2) NOT NULL,
    `color` VARCHAR(255) NULL DEFAULT 'white',
    `stockStatus` VARCHAR(45) NULL DEFAULT 'available',
    `CategoryId` INTEGER NOT NULL,
    `barcodePath` VARCHAR(255) NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `storage` VARCHAR(45) NULL,
    `phoneType` VARCHAR(45) NULL,
    `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `itemType` VARCHAR(45) NULL DEFAULT 'mobiles',
    `supplierName` VARCHAR(255) NULL,

    UNIQUE INDEX `_id_UNIQUE`(`_id`),
    UNIQUE INDEX `IMEI_UNIQUE`(`IMEI`),
    INDEX `fk_mobiles_1_idx`(`CategoryId`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mobilesales` (
    `_id` INTEGER NOT NULL AUTO_INCREMENT,
    `productID` INTEGER NOT NULL,
    `shopID` INTEGER NOT NULL,
    `sellerId` INTEGER NOT NULL,
    `customerName` VARCHAR(45) NULL DEFAULT 'doe',
    `customerEmail` VARCHAR(45) NULL DEFAULT 'doe@gmail.com',
    `customerPhoneNumber` VARCHAR(45) NULL DEFAULT '07000000',
    `paymentmethod` ENUM('mpesa', 'cash', 'creditcard') NULL,
    `finance` INTEGER NOT NULL,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `commisssionStatus` ENUM('pending', 'paid') NULL,
    `quantity` INTEGER NULL DEFAULT 0,
    `salesType` VARCHAR(255) NULL DEFAULT 'direct',
    `financer` VARCHAR(255) NULL DEFAULT 'captech',
    `financeStatus` VARCHAR(255) NULL DEFAULT 'captech',
    `financeAmount` INTEGER NULL DEFAULT 0,
    `categoryId` INTEGER NULL,
    `commission` INTEGER NULL DEFAULT 0,
    `profit` INTEGER NULL DEFAULT 0,
    `soldPrice` INTEGER NULL DEFAULT 0,

    UNIQUE INDEX `_id_UNIQUE`(`_id`),
    INDEX `fk_mobilesales_1_idx`(`productID`),
    INDEX `fk_mobilesales_2_idx`(`sellerId`),
    INDEX `fk_mobilesales_3_idx`(`shopID`),
    INDEX `fk_mobilesales_4_idx`(`finance`),
    INDEX `fk_mobileSales_category`(`categoryId`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shops` (
    `_id` INTEGER NOT NULL AUTO_INCREMENT,
    `shopName` VARCHAR(25) NOT NULL,
    `address` VARCHAR(25) NOT NULL,

    UNIQUE INDEX `_id_UNIQUE`(`_id`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supplier` (
    `_id` INTEGER NOT NULL AUTO_INCREMENT,
    `supplierAddress` VARCHAR(45) NOT NULL,
    `supplierName` VARCHAR(45) NOT NULL,
    `contact` VARCHAR(45) NULL,

    UNIQUE INDEX `_id_UNIQUE`(`_id`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `session_id` VARCHAR(128) NOT NULL,
    `expires` INTEGER UNSIGNED NOT NULL,
    `data` MEDIUMTEXT NULL,

    PRIMARY KEY (`session_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mobiletransferHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `fromshop` INTEGER NOT NULL,
    `toshop` INTEGER NOT NULL,
    `confirmedBy` INTEGER NULL,
    `status` VARCHAR(45) NULL DEFAULT 'pending',
    `type` ENUM('distribution', 'transfer', 'return') NULL,
    `productID` INTEGER NULL,
    `transferdBy` INTEGER NULL,
    `quantity` INTEGER UNSIGNED NULL DEFAULT 0,
    `updatedAt` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_mobiletransferhistory_confirmedBy`(`confirmedBy`),
    INDEX `fk_mobiletransferhistory_fromshop`(`fromshop`),
    INDEX `fk_mobiletransferhistory_mobiles`(`productID`),
    INDEX `fk_mobiletransferhistory_toshop`(`toshop`),
    INDEX `fk_mobiletransferhistory_transferdBy`(`transferdBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `accessories` ADD CONSTRAINT `fk_accessories_1` FOREIGN KEY (`CategoryId`) REFERENCES `categories`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `accessoryHistory` ADD CONSTRAINT `fk_acccessoryHistory_accessory__1` FOREIGN KEY (`productID`) REFERENCES `accessories`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `accessoryHistory` ADD CONSTRAINT `fk_accessoryHistory_1` FOREIGN KEY (`shopId`) REFERENCES `shops`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `accessoryHistory` ADD CONSTRAINT `fk_accessoryHistory_2` FOREIGN KEY (`addedBy`) REFERENCES `actors`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `accessoryItems` ADD CONSTRAINT `fk_accessoryItems_1` FOREIGN KEY (`shopID`) REFERENCES `shops`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `accessoryItems` ADD CONSTRAINT `fk_accessoryItems_2` FOREIGN KEY (`accessoryID`) REFERENCES `accessories`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `accessoryItems` ADD CONSTRAINT `fk_confirmedBy_actor_2` FOREIGN KEY (`confirmedBy`) REFERENCES `actors`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `accessorysales` ADD CONSTRAINT `fk_accessorysales_1` FOREIGN KEY (`productID`) REFERENCES `accessories`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `accessorysales` ADD CONSTRAINT `fk_accessorysales_2` FOREIGN KEY (`sellerId`) REFERENCES `actors`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `accessorysales` ADD CONSTRAINT `fk_accessorysales_3` FOREIGN KEY (`shopID`) REFERENCES `shops`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `accessorysales` ADD CONSTRAINT `fk_accessorysales_category` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `accessorytransferhistory` ADD CONSTRAINT `fk_accessorytransferhistory_1` FOREIGN KEY (`productID`) REFERENCES `accessories`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `accessorytransferhistory` ADD CONSTRAINT `fk_accessorytransferhistory_2` FOREIGN KEY (`fromshop`) REFERENCES `shops`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `accessorytransferhistory` ADD CONSTRAINT `fk_accessorytransferhistory_3` FOREIGN KEY (`toshop`) REFERENCES `shops`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `accessorytransferhistory` ADD CONSTRAINT `fk_confirmedBy_actor` FOREIGN KEY (`confirmedBy`) REFERENCES `actors`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `accessorytransferhistory` ADD CONSTRAINT `fk_transferdBy_actor` FOREIGN KEY (`transferdBy`) REFERENCES `actors`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `assignment` ADD CONSTRAINT `fk_assignment_1` FOREIGN KEY (`shopID`) REFERENCES `shops`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `assignment` ADD CONSTRAINT `fk_assignment_2` FOREIGN KEY (`userID`) REFERENCES `actors`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobileHistory` ADD CONSTRAINT `fk_mobileHistory_1` FOREIGN KEY (`productID`) REFERENCES `mobiles`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobileHistory` ADD CONSTRAINT `fk_mobileHistory_2` FOREIGN KEY (`addedBy`) REFERENCES `actors`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobileHistory` ADD CONSTRAINT `fk_mobileHistory_3` FOREIGN KEY (`shopId`) REFERENCES `shops`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobileHistory` ADD CONSTRAINT `fk_mobileHistory_seller` FOREIGN KEY (`sellerId`) REFERENCES `actors`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobileItems` ADD CONSTRAINT `fk_mobileItems_1` FOREIGN KEY (`shopID`) REFERENCES `shops`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobileItems` ADD CONSTRAINT `fk_mobileItems_2` FOREIGN KEY (`mobileID`) REFERENCES `mobiles`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobileItems` ADD CONSTRAINT `fk_mobileItems_confirmedBy` FOREIGN KEY (`confirmedBy`) REFERENCES `actors`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobilefinance` ADD CONSTRAINT `fk_financer_1` FOREIGN KEY (`productID`) REFERENCES `mobiles`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobiles` ADD CONSTRAINT `fk_mobiles_1` FOREIGN KEY (`CategoryId`) REFERENCES `categories`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobilesales` ADD CONSTRAINT `fk_mobileSales_category` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobilesales` ADD CONSTRAINT `fk_mobilesales_1` FOREIGN KEY (`productID`) REFERENCES `mobiles`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobilesales` ADD CONSTRAINT `fk_mobilesales_2` FOREIGN KEY (`sellerId`) REFERENCES `actors`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobilesales` ADD CONSTRAINT `fk_mobilesales_3` FOREIGN KEY (`shopID`) REFERENCES `shops`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobilesales` ADD CONSTRAINT `fk_mobilesales_4` FOREIGN KEY (`finance`) REFERENCES `mobilefinance`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobiletransferHistory` ADD CONSTRAINT `fk_mobiletransferhistory_confirmedBy` FOREIGN KEY (`confirmedBy`) REFERENCES `actors`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobiletransferHistory` ADD CONSTRAINT `fk_mobiletransferhistory_fromshop` FOREIGN KEY (`fromshop`) REFERENCES `shops`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobiletransferHistory` ADD CONSTRAINT `fk_mobiletransferhistory_mobiles` FOREIGN KEY (`productID`) REFERENCES `mobiles`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobiletransferHistory` ADD CONSTRAINT `fk_mobiletransferhistory_toshop` FOREIGN KEY (`toshop`) REFERENCES `shops`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `mobiletransferHistory` ADD CONSTRAINT `fk_mobiletransferhistory_transferdBy` FOREIGN KEY (`transferdBy`) REFERENCES `actors`(`_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
