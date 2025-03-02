-- MySQL dump 10.13  Distrib 8.0.41, for Linux (x86_64)
--
-- Host: localhost    Database: captech
-- ------------------------------------------------------
-- Server version	8.0.41-0ubuntu0.20.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `accessories`
--

DROP TABLE IF EXISTS `accessories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accessories` (
  `_id` int NOT NULL AUTO_INCREMENT,
  `batchNumber` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productType` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CategoryId` int NOT NULL,
  `faultyItems` int unsigned DEFAULT '0',
  `barcodePath` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `availableStock` int unsigned DEFAULT '0',
  `stockStatus` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'available',
  `color` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'white',
  `productCost` int DEFAULT NULL,
  `commission` int DEFAULT NULL,
  `discount` int DEFAULT NULL,
  `supplierName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`_id`),
  UNIQUE KEY `_id_UNIQUE` (`_id`),
  UNIQUE KEY `itemName_UNIQUE` (`batchNumber`),
  KEY `fk_accessories_1_idx` (`CategoryId`),
  CONSTRAINT `fk_accessories_1` FOREIGN KEY (`CategoryId`) REFERENCES `categories` (`_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `accessoryHistory`
--

DROP TABLE IF EXISTS `accessoryHistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accessoryHistory` (
  `_id` int NOT NULL AUTO_INCREMENT,
  `addedBy` int NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `shopId` int NOT NULL,
  `type` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'new stock',
  `quantity` int unsigned NOT NULL,
  `productID` int NOT NULL,
  PRIMARY KEY (`_id`),
  UNIQUE KEY `_id_UNIQUE` (`_id`),
  KEY `fk_acccessoryHistory_1_idx` (`productID`),
  KEY `fk_accessoryHistory_1_idx` (`shopId`),
  KEY `fk_accessoryHistory_2_idx` (`addedBy`),
  CONSTRAINT `fk_acccessoryHistory_accessory__1` FOREIGN KEY (`productID`) REFERENCES `accessories` (`_id`),
  CONSTRAINT `fk_accessoryHistory_1` FOREIGN KEY (`shopId`) REFERENCES `shops` (`_id`),
  CONSTRAINT `fk_accessoryHistory_2` FOREIGN KEY (`addedBy`) REFERENCES `actors` (`_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `accessoryItems`
--

DROP TABLE IF EXISTS `accessoryItems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accessoryItems` (
  `_id` int NOT NULL AUTO_INCREMENT,
  `accessoryID` int NOT NULL,
  `shopID` int NOT NULL,
  `status` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `quantity` int unsigned DEFAULT NULL,
  `productStatus` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'new stock',
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `transferId` int DEFAULT NULL,
  `confirmedBy` int DEFAULT NULL,
  PRIMARY KEY (`_id`),
  UNIQUE KEY `_id_UNIQUE` (`_id`),
  KEY `fk_accessoryItems_1_idx` (`shopID`),
  KEY `fk_accessoryItems_2_idx` (`accessoryID`),
  KEY `fk_confirmedBy_actor_2` (`confirmedBy`),
  CONSTRAINT `fk_accessoryItems_1` FOREIGN KEY (`shopID`) REFERENCES `shops` (`_id`),
  CONSTRAINT `fk_accessoryItems_2` FOREIGN KEY (`accessoryID`) REFERENCES `accessories` (`_id`),
  CONSTRAINT `fk_confirmedBy_actor_2` FOREIGN KEY (`confirmedBy`) REFERENCES `actors` (`_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `accessorysales`
--

DROP TABLE IF EXISTS `accessorysales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accessorysales` (
  `_id` int NOT NULL AUTO_INCREMENT,
  `productID` int NOT NULL,
  `shopID` int NOT NULL,
  `sellerId` int NOT NULL,
  `soldPrice` decimal(10,2) NOT NULL,
  `profit` int unsigned NOT NULL,
  `customerName` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT 'doe',
  `customerEmail` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT 'doe@gmail.com',
  `customerPhoneNumber` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT '07000000',
  `paymentmethod` enum('mpesa','cash','creditcard') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `commisssionStatus` enum('pending','paid') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int DEFAULT '0',
  `commission` int DEFAULT '0',
  `categoryId` int DEFAULT NULL,
  `financer` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'captech',
  `financeStatus` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'paid',
  `financeAmount` int DEFAULT '0',
  PRIMARY KEY (`_id`),
  UNIQUE KEY `_id_UNIQUE` (`_id`),
  KEY `fk_accessorysales_1_idx` (`productID`),
  KEY `fk_accessorysales_2_idx` (`sellerId`),
  KEY `fk_accessorysales_3_idx` (`shopID`),
  KEY `fk_accessorysales_category` (`categoryId`),
  CONSTRAINT `fk_accessorysales_1` FOREIGN KEY (`productID`) REFERENCES `accessories` (`_id`),
  CONSTRAINT `fk_accessorysales_2` FOREIGN KEY (`sellerId`) REFERENCES `actors` (`_id`),
  CONSTRAINT `fk_accessorysales_3` FOREIGN KEY (`shopID`) REFERENCES `shops` (`_id`),
  CONSTRAINT `fk_accessorysales_category` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `accessorytransferhistory`
--

DROP TABLE IF EXISTS `accessorytransferhistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accessorytransferhistory` (
  `_id` int NOT NULL AUTO_INCREMENT,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `fromshop` int NOT NULL,
  `toshop` int NOT NULL,
  `status` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `type` enum('distribution','transfer') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `productID` int NOT NULL,
  `confirmedBy` int DEFAULT NULL,
  `transferdBy` int DEFAULT NULL,
  `quantity` int unsigned DEFAULT NULL,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`_id`),
  UNIQUE KEY `_id_UNIQUE` (`_id`),
  KEY `fk_accessorytransferhistory_1_idx` (`productID`),
  KEY `fk_accessorytransferhistory_2_idx` (`fromshop`),
  KEY `fk_accessorytransferhistory_3_idx` (`toshop`),
  KEY `fk_confirmedBy_actor` (`confirmedBy`),
  KEY `fk_transferdBy_actor` (`transferdBy`),
  CONSTRAINT `fk_accessorytransferhistory_1` FOREIGN KEY (`productID`) REFERENCES `accessories` (`_id`),
  CONSTRAINT `fk_accessorytransferhistory_2` FOREIGN KEY (`fromshop`) REFERENCES `shops` (`_id`),
  CONSTRAINT `fk_accessorytransferhistory_3` FOREIGN KEY (`toshop`) REFERENCES `shops` (`_id`),
  CONSTRAINT `fk_confirmedBy_actor` FOREIGN KEY (`confirmedBy`) REFERENCES `actors` (`_id`),
  CONSTRAINT `fk_transferdBy_actor` FOREIGN KEY (`transferdBy`) REFERENCES `actors` (`_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `actors`
--

DROP TABLE IF EXISTS `actors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actors` (
  `_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nextofkinname` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nextofkinphonenumber` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `workingstatus` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT 'inactive',
  `phone` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT 'seller',
  `Idimagebackward` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'https://www.linkedin.com/default_profile_picture.png',
  `Idimagefront` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'https://www.linkedin.com/default_profile_picture.png',
  `profileimage` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'https://www.linkedin.com/default_profile_picture.png',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`_id`),
  UNIQUE KEY `_id_UNIQUE` (`_id`),
  UNIQUE KEY `actors_email_key` (`email`),
  UNIQUE KEY `actors_phone_key` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `assignment`
--

DROP TABLE IF EXISTS `assignment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assignment` (
  `_id` int NOT NULL AUTO_INCREMENT,
  `userID` int NOT NULL,
  `shopID` int NOT NULL,
  `fromDate` datetime NOT NULL,
  `toDate` datetime NOT NULL,
  `status` enum('assigned','removed') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`_id`),
  UNIQUE KEY `_id_UNIQUE` (`_id`),
  KEY `fk_assignment_1_idx` (`shopID`),
  KEY `fk_assignment_2_idx` (`userID`),
  CONSTRAINT `fk_assignment_1` FOREIGN KEY (`shopID`) REFERENCES `shops` (`_id`),
  CONSTRAINT `fk_assignment_2` FOREIGN KEY (`userID`) REFERENCES `actors` (`_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `_id` int NOT NULL AUTO_INCREMENT,
  `itemName` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `itemModel` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `minPrice` int NOT NULL,
  `itemType` enum('mobiles','accessories') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `brand` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'unknown',
  `maxPrice` int NOT NULL,
  PRIMARY KEY (`_id`),
  UNIQUE KEY `_id_UNIQUE` (`_id`),
  UNIQUE KEY `itemModel_UNIQUE` (`itemModel`),
  UNIQUE KEY `itemName_UNIQUE` (`itemName`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mobileHistory`
--

DROP TABLE IF EXISTS `mobileHistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mobileHistory` (
  `_id` int NOT NULL AUTO_INCREMENT,
  `addedBy` int NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `shopId` int NOT NULL,
  `type` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'new stock',
  `productID` int NOT NULL,
  `sellerId` int DEFAULT NULL,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`_id`),
  KEY `fk_mobileHistory_1_idx` (`productID`),
  KEY `fk_mobileHistory_2_idx` (`addedBy`),
  KEY `fk_mobileHistory_3_idx` (`shopId`),
  KEY `fk_mobileHistory_seller` (`sellerId`),
  CONSTRAINT `fk_mobileHistory_1` FOREIGN KEY (`productID`) REFERENCES `mobiles` (`_id`),
  CONSTRAINT `fk_mobileHistory_2` FOREIGN KEY (`addedBy`) REFERENCES `actors` (`_id`),
  CONSTRAINT `fk_mobileHistory_3` FOREIGN KEY (`shopId`) REFERENCES `shops` (`_id`),
  CONSTRAINT `fk_mobileHistory_seller` FOREIGN KEY (`sellerId`) REFERENCES `actors` (`_id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mobileItems`
--

DROP TABLE IF EXISTS `mobileItems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mobileItems` (
  `_id` int NOT NULL AUTO_INCREMENT,
  `mobileID` int NOT NULL,
  `shopID` int NOT NULL,
  `status` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `confirmedBy` int DEFAULT NULL,
  `transferId` int DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `productStatus` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'new stock',
  `quantity` int unsigned DEFAULT '0',
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`_id`),
  UNIQUE KEY `_id_UNIQUE` (`_id`),
  KEY `fk_mobileItems_1_idx` (`shopID`),
  KEY `fk_mobileItems_2_idx` (`mobileID`),
  KEY `fk_mobileItems_confirmedBy` (`confirmedBy`),
  CONSTRAINT `fk_mobileItems_1` FOREIGN KEY (`shopID`) REFERENCES `shops` (`_id`),
  CONSTRAINT `fk_mobileItems_2` FOREIGN KEY (`mobileID`) REFERENCES `mobiles` (`_id`),
  CONSTRAINT `fk_mobileItems_confirmedBy` FOREIGN KEY (`confirmedBy`) REFERENCES `actors` (`_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mobilefinance`
--

DROP TABLE IF EXISTS `mobilefinance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mobilefinance` (
  `_id` int NOT NULL AUTO_INCREMENT,
  `financer` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'captech',
  `financeAmount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `financeStatus` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT 'paid',
  `productID` int NOT NULL,
  PRIMARY KEY (`_id`),
  UNIQUE KEY `_id_UNIQUE` (`_id`),
  KEY `fk_financer_1_idx` (`productID`),
  CONSTRAINT `fk_financer_1` FOREIGN KEY (`productID`) REFERENCES `mobiles` (`_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mobiles`
--

DROP TABLE IF EXISTS `mobiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mobiles` (
  `_id` int NOT NULL AUTO_INCREMENT,
  `IMEI` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `batchNumber` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `availableStock` int unsigned NOT NULL DEFAULT '1',
  `commission` decimal(10,2) NOT NULL DEFAULT '0.00',
  `discount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `productCost` decimal(10,2) NOT NULL,
  `color` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'white',
  `stockStatus` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT 'available',
  `CategoryId` int NOT NULL,
  `barcodePath` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `storage` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phoneType` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `itemType` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT 'mobiles',
  `supplierName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`_id`),
  UNIQUE KEY `_id_UNIQUE` (`_id`),
  UNIQUE KEY `IMEI_UNIQUE` (`IMEI`),
  KEY `fk_mobiles_1_idx` (`CategoryId`),
  CONSTRAINT `fk_mobiles_1` FOREIGN KEY (`CategoryId`) REFERENCES `categories` (`_id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mobilesales`
--

DROP TABLE IF EXISTS `mobilesales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mobilesales` (
  `_id` int NOT NULL AUTO_INCREMENT,
  `productID` int NOT NULL,
  `shopID` int NOT NULL,
  `sellerId` int NOT NULL,
  `customerName` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT 'doe',
  `customerEmail` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT 'doe@gmail.com',
  `customerPhoneNumber` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT '07000000',
  `paymentmethod` enum('mpesa','cash','creditcard') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `finance` int NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `commisssionStatus` enum('pending','paid') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int DEFAULT '0',
  `salesType` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'direct',
  `financer` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'captech',
  `financeStatus` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'captech',
  `financeAmount` int DEFAULT '0',
  `categoryId` int DEFAULT NULL,
  `commission` int DEFAULT '0',
  `profit` int DEFAULT '0',
  `soldPrice` int DEFAULT '0',
  PRIMARY KEY (`_id`),
  UNIQUE KEY `_id_UNIQUE` (`_id`),
  KEY `fk_mobilesales_1_idx` (`productID`),
  KEY `fk_mobilesales_2_idx` (`sellerId`),
  KEY `fk_mobilesales_3_idx` (`shopID`),
  KEY `fk_mobilesales_4_idx` (`finance`),
  KEY `fk_mobileSales_category` (`categoryId`),
  CONSTRAINT `fk_mobilesales_1` FOREIGN KEY (`productID`) REFERENCES `mobiles` (`_id`),
  CONSTRAINT `fk_mobilesales_2` FOREIGN KEY (`sellerId`) REFERENCES `actors` (`_id`),
  CONSTRAINT `fk_mobilesales_3` FOREIGN KEY (`shopID`) REFERENCES `shops` (`_id`),
  CONSTRAINT `fk_mobilesales_4` FOREIGN KEY (`finance`) REFERENCES `mobilefinance` (`_id`),
  CONSTRAINT `fk_mobileSales_category` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mobiletransferHistory`
--

DROP TABLE IF EXISTS `mobiletransferHistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mobiletransferHistory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `fromshop` int NOT NULL,
  `toshop` int NOT NULL,
  `confirmedBy` int DEFAULT NULL,
  `status` varchar(45) DEFAULT 'pending',
  `type` enum('distribution','transfer','return') DEFAULT NULL,
  `productID` int DEFAULT NULL,
  `transferdBy` int DEFAULT NULL,
  `quantity` int unsigned DEFAULT '0',
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_mobiletransferhistory_mobiles` (`productID`),
  KEY `fk_mobiletransferhistory_fromshop` (`fromshop`),
  KEY `fk_mobiletransferhistory_toshop` (`toshop`),
  KEY `fk_mobiletransferhistory_confirmedBy` (`confirmedBy`),
  KEY `fk_mobiletransferhistory_transferdBy` (`transferdBy`),
  CONSTRAINT `fk_mobiletransferhistory_confirmedBy` FOREIGN KEY (`confirmedBy`) REFERENCES `actors` (`_id`),
  CONSTRAINT `fk_mobiletransferhistory_fromshop` FOREIGN KEY (`fromshop`) REFERENCES `shops` (`_id`),
  CONSTRAINT `fk_mobiletransferhistory_mobiles` FOREIGN KEY (`productID`) REFERENCES `mobiles` (`_id`),
  CONSTRAINT `fk_mobiletransferhistory_toshop` FOREIGN KEY (`toshop`) REFERENCES `shops` (`_id`),
  CONSTRAINT `fk_mobiletransferhistory_transferdBy` FOREIGN KEY (`transferdBy`) REFERENCES `actors` (`_id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `shops`
--

DROP TABLE IF EXISTS `shops`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shops` (
  `_id` int NOT NULL AUTO_INCREMENT,
  `shopName` varchar(25) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(25) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`_id`),
  UNIQUE KEY `_id_UNIQUE` (`_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `supplier`
--

DROP TABLE IF EXISTS `supplier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier` (
  `_id` int NOT NULL AUTO_INCREMENT,
  `supplierAddress` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplierName` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`_id`),
  UNIQUE KEY `_id_UNIQUE` (`_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-08  0:12:04
