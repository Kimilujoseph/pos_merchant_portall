-- MySQL dump 10.13  Distrib 8.0.42, for Linux (x86_64)
--
-- Host: localhost    Database: captech_development
-- ------------------------------------------------------
-- Server version	8.0.42-0ubuntu0.20.04.1

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
-- Table structure for table `CommissionPayment`
--

DROP TABLE IF EXISTS `CommissionPayment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CommissionPayment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sellerId` int NOT NULL,
  `amountPaid` decimal(10,2) NOT NULL,
  `status` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paymentDate` datetime(3) NOT NULL,
  `periodStartDate` datetime(3) NOT NULL,
  `periodEndDate` datetime(3) NOT NULL,
  `processedById` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `CommissionPayment_sellerId_idx` (`sellerId`),
  KEY `CommissionPayment_processedById_idx` (`processedById`),
  CONSTRAINT `CommissionPayment_processedById_fkey` FOREIGN KEY (`processedById`) REFERENCES `actors` (`_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `CommissionPayment_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `actors` (`_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CommissionPayment`
--

LOCK TABLES `CommissionPayment` WRITE;
/*!40000 ALTER TABLE `CommissionPayment` DISABLE KEYS */;
INSERT INTO `CommissionPayment` VALUES (2,2,50.00,'VOIDED','2025-08-17 10:00:00.000','2025-07-01 00:00:00.000','2025-07-31 23:59:59.000',1),(5,2,50.00,'VOIDED','2025-08-17 10:00:00.000','2025-07-01 00:00:00.000','2025-07-31 23:59:59.000',1),(8,2,45.00,'VOIDED','2025-09-02 13:44:15.924','2025-09-02 13:44:15.924','2025-09-02 13:44:15.924',1),(9,2,100.00,'VOIDED','2025-09-02 13:47:35.196','2025-09-02 13:47:35.196','2025-09-02 13:47:35.196',1),(11,2,500.00,NULL,'2025-09-06 10:35:15.921','2025-09-06 10:35:15.921','2025-09-06 10:35:15.921',1),(13,2,500.00,NULL,'2025-09-14 07:55:13.544','2025-09-14 07:55:13.544','2025-09-14 07:55:13.544',1),(14,2,250.00,NULL,'2025-09-22 05:18:49.088','2025-09-22 05:18:49.088','2025-09-22 05:18:49.088',1),(15,2,50.00,NULL,'2025-09-22 05:20:09.797','2025-09-22 05:20:09.797','2025-09-22 05:20:09.797',1);
/*!40000 ALTER TABLE `CommissionPayment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CommissionPaymentsOnAccessorySales`
--

DROP TABLE IF EXISTS `CommissionPaymentsOnAccessorySales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CommissionPaymentsOnAccessorySales` (
  `accessorySaleId` int NOT NULL,
  `commissionPaymentId` int NOT NULL,
  `assignedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `assignedBy` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`commissionPaymentId`,`accessorySaleId`),
  KEY `CommissionPaymentsOnAccessorySales_accessorySaleId_fkey` (`accessorySaleId`),
  CONSTRAINT `CommissionPaymentsOnAccessorySales_accessorySaleId_fkey` FOREIGN KEY (`accessorySaleId`) REFERENCES `accessorysales` (`_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `CommissionPaymentsOnAccessorySales_commissionPaymentId_fkey` FOREIGN KEY (`commissionPaymentId`) REFERENCES `CommissionPayment` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CommissionPaymentsOnAccessorySales`
--

LOCK TABLES `CommissionPaymentsOnAccessorySales` WRITE;
/*!40000 ALTER TABLE `CommissionPaymentsOnAccessorySales` DISABLE KEYS */;
/*!40000 ALTER TABLE `CommissionPaymentsOnAccessorySales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CommissionPaymentsOnMobileSales`
--

DROP TABLE IF EXISTS `CommissionPaymentsOnMobileSales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CommissionPaymentsOnMobileSales` (
  `mobileSaleId` int NOT NULL,
  `commissionPaymentId` int NOT NULL,
  `assignedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `assignedBy` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`commissionPaymentId`,`mobileSaleId`),
  KEY `CommissionPaymentsOnMobileSales_mobileSaleId_fkey` (`mobileSaleId`),
  CONSTRAINT `CommissionPaymentsOnMobileSales_commissionPaymentId_fkey` FOREIGN KEY (`commissionPaymentId`) REFERENCES `CommissionPayment` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `CommissionPaymentsOnMobileSales_mobileSaleId_fkey` FOREIGN KEY (`mobileSaleId`) REFERENCES `mobilesales` (`_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CommissionPaymentsOnMobileSales`
--

LOCK TABLES `CommissionPaymentsOnMobileSales` WRITE;
/*!40000 ALTER TABLE `CommissionPaymentsOnMobileSales` DISABLE KEYS */;
INSERT INTO `CommissionPaymentsOnMobileSales` VALUES (1,5,'2025-08-17 13:59:54.229','1'),(1,8,'2025-09-02 13:44:18.816','1'),(1,9,'2025-09-02 13:47:35.626','1'),(2,11,'2025-09-06 10:35:16.142','1'),(14,13,'2025-09-14 07:55:13.966','1'),(20,14,'2025-09-22 05:18:51.187','1'),(20,15,'2025-09-22 05:20:10.007','1');
/*!40000 ALTER TABLE `CommissionPaymentsOnMobileSales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Customer`
--

DROP TABLE IF EXISTS `Customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Customer` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phoneNumber` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Customer_phoneNumber_key` (`phoneNumber`),
  UNIQUE KEY `Customer_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Customer`
--

LOCK TABLES `Customer` WRITE;
/*!40000 ALTER TABLE `Customer` DISABLE KEYS */;
INSERT INTO `Customer` VALUES (1,'John Doe','johndoe@example.com','074325674','2025-08-12 12:46:52.579'),(2,'','','','2025-09-05 20:09:44.167'),(3,'Timothy Joseph','ancellotti@gmail.com','072345677','2025-09-06 19:29:47.050'),(4,'Timothy ','emailcustomer@gmail.com','075712347364','2025-09-09 07:07:38.034'),(5,'Timothy Joseph','customer@gmail.com','0745473932','2025-09-09 07:14:33.660'),(7,'Timothy','antontywernner@gmail.com','0757380302','2025-09-12 05:42:54.023'),(8,'Antony Kinuthia','customer46@gmail.com','074534262','2025-09-13 05:27:27.494'),(9,'Peter Londiani','kimilu@gmail.com','07342517256','2025-09-13 05:29:03.966');
/*!40000 ALTER TABLE `Customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DailySalesAnalytics`
--

DROP TABLE IF EXISTS `DailySalesAnalytics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DailySalesAnalytics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date DEFAULT NULL,
  `categoryId` int NOT NULL,
  `shopId` int NOT NULL,
  `sellerId` int NOT NULL,
  `financeId` int DEFAULT NULL,
  `financeStatus` varchar(50) DEFAULT NULL,
  `totalUnitsSold` int DEFAULT NULL,
  `totalRevenue` decimal(18,2) DEFAULT NULL,
  `totalCostOfGoods` decimal(12,2) NOT NULL,
  `grossProfit` decimal(18,2) DEFAULT NULL,
  `totalCommission` decimal(18,2) DEFAULT NULL,
  `totalfinanceAmount` decimal(18,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_unique_daily_sale` (`date`,`categoryId`,`shopId`,`sellerId`,`financeId`,`financeStatus`),
  KEY `idx_date` (`date`),
  KEY `idx_categoryId` (`categoryId`),
  KEY `idx_shopId` (`shopId`),
  KEY `idx_sellerId` (`sellerId`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DailySalesAnalytics`
--

LOCK TABLES `DailySalesAnalytics` WRITE;
/*!40000 ALTER TABLE `DailySalesAnalytics` DISABLE KEYS */;
INSERT INTO `DailySalesAnalytics` VALUES (50,'2025-08-12',1,1,2,1,'paid',1,125000.00,120000.00,5000.00,500.00,0.00),(51,'2025-09-06',1,1,2,1,'pending',13,649400.00,690400.00,-41000.00,6200.00,204000.00),(52,'2025-08-15',2,1,2,1,'paid',1,1700.00,1200.00,500.00,50.00,0.00),(53,'2025-09-06',2,1,2,1,'paid',12,23700.00,14400.00,9300.00,200.00,0.00),(54,'2025-09-06',2,1,2,3,'paid',6,20400.00,7200.00,13200.00,60.00,5100.00),(55,'2025-09-12',1,1,2,1,'pending',1,17000.00,15000.00,2000.00,500.00,17000.00),(56,'2025-09-13',1,1,2,1,'paid',2,280000.00,240000.00,40000.00,1000.00,0.00),(57,'2025-09-13',2,1,2,1,'paid',3,4550.00,3600.00,950.00,300.00,0.00),(58,'2025-09-13',1,1,2,4,'paid',2,290000.00,240000.00,50000.00,1000.00,0.00),(59,'2025-09-13',16,1,2,4,'paid',1,15500.00,15000.00,500.00,500.00,0.00),(60,'2025-09-13',2,1,2,4,'paid',1,1500.00,1200.00,300.00,100.00,0.00),(61,'2025-09-22',16,1,3,3,'pending',1,15000.00,12000.00,3000.00,500.00,15000.00),(62,'2025-09-27',20,1,8,1,'paid',1,25000.00,18000.00,7000.00,500.00,0.00),(63,'2025-09-27',2,1,8,1,'paid',2,3000.00,2400.00,600.00,200.00,0.00);
/*!40000 ALTER TABLE `DailySalesAnalytics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Expense`
--

DROP TABLE IF EXISTS `Expense`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Expense` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `category` enum('RENT','UTILITIES','SUPPLIES','MARKETING','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `expenseDate` datetime(3) NOT NULL,
  `shopId` int DEFAULT NULL,
  `processedById` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Expense_shopId_idx` (`shopId`),
  KEY `Expense_processedById_idx` (`processedById`),
  CONSTRAINT `Expense_processedById_fkey` FOREIGN KEY (`processedById`) REFERENCES `actors` (`_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Expense_shopId_fkey` FOREIGN KEY (`shopId`) REFERENCES `shops` (`_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Expense`
--

LOCK TABLES `Expense` WRITE;
/*!40000 ALTER TABLE `Expense` DISABLE KEYS */;
/*!40000 ALTER TABLE `Expense` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Financer`
--

DROP TABLE IF EXISTS `Financer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Financer` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contactName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Financer_name_key` (`name`),
  UNIQUE KEY `Financer_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Financer`
--

LOCK TABLES `Financer` WRITE;
/*!40000 ALTER TABLE `Financer` DISABLE KEYS */;
INSERT INTO `Financer` VALUES (1,'Mkopa Simu','Mkopa Simu ','075743294857','simu@gmail.com','Eastern BY pass','2025-08-11 13:10:58.356','2025-08-11 13:10:58'),(3,'Onfon Mobile','Onfon Mobile','075743294854','onfon@gmail.com','Mombasa road','2025-09-03 13:09:22.856','2025-09-03 13:09:23'),(4,'Captech ','captech_electronic','0757174430','captech@gmail.com','Pipeline Estate','2025-09-03 14:02:55.139','2025-09-03 14:02:55');
/*!40000 ALTER TABLE `Financer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Notification`
--

DROP TABLE IF EXISTS `Notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Notification` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL,
  `message` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Notification_userId_idx` (`userId`),
  CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `actors` (`_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Notification`
--

LOCK TABLES `Notification` WRITE;
/*!40000 ALTER TABLE `Notification` DISABLE KEYS */;
/*!40000 ALTER TABLE `Notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Payment`
--

DROP TABLE IF EXISTS `Payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Payment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `amount` decimal(10,2) NOT NULL,
  `paymentMethod` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'completed',
  `transactionId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=107 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Payment`
--

LOCK TABLES `Payment` WRITE;
/*!40000 ALTER TABLE `Payment` DISABLE KEYS */;
INSERT INTO `Payment` VALUES (2,125000.00,'cash','completed','23234323423','2025-08-12 13:10:00.010','2025-08-12 13:10:00'),(9,6800.00,'cash','completed','23234323423','2025-08-15 11:55:51.533','2025-08-15 11:55:52'),(20,6800.00,'cash','completed','23234323423','2025-09-06 06:46:04.310','2025-09-06 06:46:04'),(24,3400.00,'cash','completed','23234323423','2025-09-06 06:59:52.680','2025-09-06 06:59:53'),(28,1500.00,'cash','completed','23234323423','2025-09-06 07:25:55.489','2025-09-06 07:25:55'),(30,1500.00,'cash','completed','23234323423','2025-09-06 07:35:34.582','2025-09-06 07:35:35'),(31,1500.00,'cash','completed','23234323423','2025-09-06 07:47:18.519','2025-09-06 07:47:19'),(38,1500.00,'cash','completed','23234323423','2025-09-06 08:18:12.350','2025-09-06 08:18:12'),(40,1500.00,'cash','completed','23234323423','2025-09-06 08:30:10.852','2025-09-06 08:30:11'),(41,1500.00,'cash','completed','23234323423','2025-09-06 08:30:14.020','2025-09-06 08:30:14'),(42,1500.00,'cash','completed','23234323423','2025-09-06 08:31:07.341','2025-09-06 08:31:07'),(43,1500.00,'cash','completed','23234323423','2025-09-06 09:30:18.491','2025-09-06 09:30:18'),(44,1500.00,'cash','completed','23234323423','2025-09-06 09:30:49.971','2025-09-06 09:30:50'),(47,17000.00,'cash','completed','23234323423','2025-09-06 10:33:44.017','2025-09-06 10:33:44'),(49,17000.00,'cash','completed','23234323423','2025-09-06 10:39:40.987','2025-09-06 10:39:41'),(53,17000.00,'cash','completed','23234323423','2025-09-06 10:57:46.024','2025-09-06 10:57:46'),(54,17000.00,'cash','completed','23234323423','2025-09-06 10:57:53.183','2025-09-06 10:57:53'),(57,17000.00,'cash','completed','23234323423','2025-09-06 11:14:53.415','2025-09-06 11:14:53'),(63,17000.00,'cash','completed','23234323423','2025-09-06 11:29:50.761','2025-09-06 11:29:51'),(64,17000.00,'cash','completed','23234323423','2025-09-06 11:30:51.525','2025-09-06 11:30:52'),(65,170000.00,'cash','completed','23234323423','2025-09-06 11:35:01.520','2025-09-06 11:35:02'),(67,1700.00,'cash','completed','23234323423','2025-09-06 11:39:05.757','2025-09-06 11:39:06'),(68,1700.00,'cash','completed','23234323423','2025-09-06 11:40:32.135','2025-09-06 11:40:32'),(69,170000.00,'cash','completed','23234323423','2025-09-06 12:00:53.841','2025-09-06 12:00:54'),(70,170000.00,'cash','completed','23234323423','2025-09-06 12:18:24.158','2025-09-06 12:18:24'),(71,3400.00,'cash','completed','23234323423','2025-09-06 12:26:45.075','2025-09-06 12:26:45'),(72,3400.00,'cash','completed','23234323423','2025-09-06 12:32:24.204','2025-09-06 12:32:24'),(73,3400.00,'cash','completed','23234323423','2025-09-06 13:26:49.878','2025-09-06 13:26:48'),(86,17000.00,'cash','completed','23234323423','2025-09-12 08:32:35.621','2025-09-12 08:32:36'),(95,140000.00,'cash','completed','','2025-09-13 05:15:43.651','2025-09-13 05:15:44'),(96,140000.00,'cash','completed','','2025-09-13 05:17:43.615','2025-09-13 05:17:43'),(97,1500.00,'mpesa','completed','3454567687','2025-09-13 05:19:05.187','2025-09-13 05:19:05'),(98,145000.00,'cash','completed','','2025-09-13 05:27:28.746','2025-09-13 05:27:29'),(99,145000.00,'cash','completed','','2025-09-13 05:29:04.228','2025-09-13 05:29:04'),(100,1500.00,'cash','completed','','2025-09-13 05:29:04.454','2025-09-13 05:29:04'),(101,15500.00,'cash','completed','','2025-09-13 05:49:05.137','2025-09-13 05:49:05'),(102,1500.00,'cash','completed','','2025-09-13 05:49:07.324','2025-09-13 05:49:07'),(103,1550.00,'cash','completed','','2025-09-13 18:08:53.148','2025-09-13 18:08:53'),(104,15000.00,'mpesa','completed','thuy3265854','2025-09-22 05:27:10.341','2025-09-22 05:27:10'),(105,25000.00,'cash','completed','','2025-09-27 12:50:03.534','2025-09-27 12:50:04'),(106,3000.00,'cash','completed','','2025-09-27 12:50:04.246','2025-09-27 12:50:04');
/*!40000 ALTER TABLE `Payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Return`
--

DROP TABLE IF EXISTS `Return`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Return` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mobileSaleId` int DEFAULT NULL,
  `accessorySaleId` int DEFAULT NULL,
  `customerId` int NOT NULL,
  `restock` tinyint(1) DEFAULT '1',
  `refundAmount` decimal(10,0) DEFAULT NULL,
  `reason` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `returnedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `processedBy` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Return_processedBy_idx` (`processedBy`),
  KEY `Return_customerId_idx` (`customerId`),
  KEY `Return_mobileSaleId_fkey` (`mobileSaleId`),
  KEY `Return_accessorySaleId_fkey` (`accessorySaleId`),
  CONSTRAINT `Return_accessorySaleId_fkey` FOREIGN KEY (`accessorySaleId`) REFERENCES `accessorysales` (`_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Return_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Return_mobileSaleId_fkey` FOREIGN KEY (`mobileSaleId`) REFERENCES `mobilesales` (`_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Return_processedBy_fkey` FOREIGN KEY (`processedBy`) REFERENCES `actors` (`_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Return`
--

LOCK TABLES `Return` WRITE;
/*!40000 ALTER TABLE `Return` DISABLE KEYS */;
INSERT INTO `Return` VALUES (4,1,NULL,1,1,11000,'Customer changed their mind.','2025-08-18 09:38:49.215',1),(5,NULL,2,1,1,1500,'Customer changed their mind.','2025-08-18 11:04:24.083',1),(8,NULL,2,1,1,1500,'Customer changed their mind.','2025-08-18 12:05:15.615',1);
/*!40000 ALTER TABLE `Return` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SalaryPayment`
--

DROP TABLE IF EXISTS `SalaryPayment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SalaryPayment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employeeId` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paymentDate` datetime(3) NOT NULL,
  `payPeriodMonth` int NOT NULL,
  `payPeriodYear` int NOT NULL,
  `processedById` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `SalaryPayment_employeeId_idx` (`employeeId`),
  KEY `SalaryPayment_processedById_idx` (`processedById`),
  CONSTRAINT `SalaryPayment_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `actors` (`_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `SalaryPayment_processedById_fkey` FOREIGN KEY (`processedById`) REFERENCES `actors` (`_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SalaryPayment`
--

LOCK TABLES `SalaryPayment` WRITE;
/*!40000 ALTER TABLE `SalaryPayment` DISABLE KEYS */;
INSERT INTO `SalaryPayment` VALUES (1,2,5000.00,'VOIDED','2025-08-17 10:00:00.000',7,2025,1),(2,2,5000.00,'VOIDED','2025-08-17 10:00:00.000',7,2025,1),(3,3,1000.00,'VOIDED','2025-09-03 17:09:37.108',9,2025,1),(4,3,4000.00,NULL,'2025-09-03 17:10:39.023',9,2025,1),(5,3,4000.00,NULL,'2025-09-03 17:10:39.023',9,2025,1);
/*!40000 ALTER TABLE `SalaryPayment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Supplier`
--

DROP TABLE IF EXISTS `Supplier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Supplier` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contactName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Supplier_name_key` (`name`),
  UNIQUE KEY `Supplier_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Supplier`
--

LOCK TABLES `Supplier` WRITE;
/*!40000 ALTER TABLE `Supplier` DISABLE KEYS */;
INSERT INTO `Supplier` VALUES (1,'timothy kinoti ANTONY','timo muchori',NULL,'KINOTI@gmail.com','Nakuru','2025-08-11 13:11:39.373','2025-08-11 13:11:39'),(3,'Montino Alfred','moti',NULL,'montino@gmail.com','Nairobi Kinoti','2025-09-03 18:31:15.175','2025-09-03 18:31:15');
/*!40000 ALTER TABLE `Supplier` ENABLE KEYS */;
UNLOCK TABLES;

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
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `paymentStatus` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PAID',
  `supplierId` int DEFAULT NULL,
  PRIMARY KEY (`_id`),
  UNIQUE KEY `_id_UNIQUE` (`_id`),
  UNIQUE KEY `itemName_UNIQUE` (`batchNumber`),
  KEY `fk_accessories_1_idx` (`CategoryId`),
  KEY `accessories_supplierId_fkey` (`supplierId`),
  CONSTRAINT `accessories_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_accessories_1` FOREIGN KEY (`CategoryId`) REFERENCES `categories` (`_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accessories`
--

LOCK TABLES `accessories` WRITE;
/*!40000 ALTER TABLE `accessories` DISABLE KEYS */;
INSERT INTO `accessories` VALUES (10,'23-339-17','type-C',2,0,NULL,'2025-08-12 14:43:15',0,'available','white',1200,50,0,'2025-09-27 12:39:10','PAID',1),(11,'23-3579-17','type-C',2,0,NULL,'2025-08-12 14:54:23',5,'available','black',1200,100,0,'2025-08-31 18:16:43','PAID',1),(12,'123-456-54','type-normal',2,0,NULL,'2025-08-31 19:28:15',42,'available','yellow',1200,10,0,'2025-09-01 07:30:17','PAID',1),(13,'S13-067453-343','typec',2,0,NULL,'2025-09-27 12:40:15',1,'available','black_variant',NULL,20,0,'2025-09-27 12:40:15','PAID',3),(15,'S13-067453-345','typec',2,0,NULL,'2025-09-27 12:41:00',18,'available','black_variant',NULL,20,0,'2025-09-27 12:41:00','PAID',3);
/*!40000 ALTER TABLE `accessories` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accessoryHistory`
--

LOCK TABLES `accessoryHistory` WRITE;
/*!40000 ALTER TABLE `accessoryHistory` DISABLE KEYS */;
INSERT INTO `accessoryHistory` VALUES (1,1,'2025-08-12 14:43:15',2,'new stock',20,10),(2,1,'2025-08-12 14:54:23',2,'new stock',20,11),(3,1,'2025-08-31 13:32:20',2,'update',11,10),(4,1,'2025-08-31 14:02:45',2,'update',11,10),(5,1,'2025-08-31 14:03:09',2,'update',11,10),(6,1,'2025-08-31 17:59:49',2,'update',20,11),(7,1,'2025-08-31 18:16:13',2,'update',20,11),(8,1,'2025-08-31 18:16:43',2,'update',20,11),(9,1,'2025-08-31 19:28:16',2,'new stock',100,12),(10,1,'2025-09-01 07:30:19',2,'update',62,12),(11,1,'2025-09-27 12:39:10',2,'update',11,10),(12,1,'2025-09-27 12:40:15',2,'new stock',1,13),(13,1,'2025-09-27 12:41:00',2,'new stock',18,15);
/*!40000 ALTER TABLE `accessoryHistory` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accessoryItems`
--

LOCK TABLES `accessoryItems` WRITE;
/*!40000 ALTER TABLE `accessoryItems` DISABLE KEYS */;
INSERT INTO `accessoryItems` VALUES (1,10,1,'sold','2025-08-12 15:57:18',3,'new stock','2025-08-15 08:42:55',1,2),(2,10,1,'sold','2025-08-12 16:01:16',1,'new stock','2025-08-15 09:12:30',2,2),(3,10,2,'pending','2025-08-15 11:18:50',5,'added sock','2025-08-15 11:18:50',3,NULL),(4,10,2,'pending','2025-08-15 11:30:51',3,'added sock','2025-08-15 11:30:51',4,NULL),(5,11,1,'confirmed','2025-08-31 18:46:49',0,'new stock','2025-09-05 07:22:58',5,2),(6,11,1,'sold','2025-08-31 18:47:44',0,'new stock','2025-09-11 14:25:10',6,2),(7,12,1,'confirmed','2025-08-31 19:29:22',18,'new stock','2025-09-05 07:22:43',7,2),(8,12,1,'confirmed','2025-09-01 13:44:01',9,'new stock','2025-09-05 18:50:36',8,2),(9,12,1,'sold','2025-09-01 13:44:03',0,'new stock','2025-09-05 07:29:43',9,2),(10,11,3,'confirmed','2025-09-18 14:24:02',5,'new stock','2025-09-20 15:00:02',10,3),(11,11,3,'confirmed','2025-09-18 14:30:46',1,'added sock','2025-09-20 15:00:00',11,3),(12,12,3,'confirmed','2025-09-18 15:43:16',1,'new stock','2025-09-20 14:59:57',12,3),(13,12,3,'confirmed','2025-09-20 14:52:41',12,'added stock','2025-09-20 14:59:53',13,3),(14,12,3,'confirmed','2025-09-20 14:54:51',2,'added stock','2025-09-20 14:59:56',14,3),(15,10,4,'confirmed','2025-09-27 12:45:45',10,'new stock','2025-09-27 12:47:20',15,8),(16,11,4,'confirmed','2025-09-27 12:45:46',1,'new stock','2025-09-27 12:47:23',16,8),(17,10,3,'pending','2025-09-27 12:54:10',1,'new stock','2025-09-27 12:54:10',17,NULL);
/*!40000 ALTER TABLE `accessoryItems` ENABLE KEYS */;
UNLOCK TABLES;

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
  `status` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'COMPLETED',
  `profit` int unsigned NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `commisssionStatus` enum('pending','paid') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int DEFAULT '0',
  `commission` int DEFAULT '0',
  `categoryId` int DEFAULT NULL,
  `financeStatus` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'paid',
  `financeAmount` int DEFAULT '0',
  `customerId` int DEFAULT NULL,
  `financerId` int DEFAULT NULL,
  `paymentId` int DEFAULT NULL,
  `commissionPaid` int DEFAULT '0',
  PRIMARY KEY (`_id`),
  UNIQUE KEY `_id_UNIQUE` (`_id`),
  KEY `fk_accessorysales_1_idx` (`productID`),
  KEY `fk_accessorysales_2_idx` (`sellerId`),
  KEY `fk_accessorysales_3_idx` (`shopID`),
  KEY `fk_accessorysales_category` (`categoryId`),
  KEY `idx_sales_created` (`createdAt`),
  KEY `accessorysales_customerId_idx` (`customerId`),
  KEY `accessorysales_financerId_idx` (`financerId`),
  KEY `accessorysales_paymentId_idx` (`paymentId`),
  CONSTRAINT `accessorysales_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `accessorysales_financerId_fkey` FOREIGN KEY (`financerId`) REFERENCES `Financer` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `accessorysales_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_accessorysales_1` FOREIGN KEY (`productID`) REFERENCES `accessories` (`_id`),
  CONSTRAINT `fk_accessorysales_2` FOREIGN KEY (`sellerId`) REFERENCES `actors` (`_id`),
  CONSTRAINT `fk_accessorysales_3` FOREIGN KEY (`shopID`) REFERENCES `shops` (`_id`),
  CONSTRAINT `fk_accessorysales_category` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`_id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accessorysales`
--

LOCK TABLES `accessorysales` WRITE;
/*!40000 ALTER TABLE `accessorysales` DISABLE KEYS */;
INSERT INTO `accessorysales` VALUES (2,10,1,2,1700.00,'PARTIALLY_RETURNED',2200,'2025-08-15 11:55:52',NULL,1,0,2,'paid',0,1,1,9,0),(5,10,1,2,3400.00,'COMPLETED',1000,'2025-09-06 06:46:04',NULL,2,100,2,'paid',0,1,1,20,0),(8,12,1,2,3400.00,'COMPLETED',2200,'2025-09-06 06:59:53',NULL,1,10,2,'paid',0,1,1,24,0),(9,12,1,2,1500.00,'COMPLETED',300,'2025-09-06 07:25:56',NULL,1,10,2,'paid',0,1,1,28,0),(11,12,1,2,1500.00,'COMPLETED',300,'2025-09-06 07:35:35',NULL,1,10,2,'paid',0,1,1,30,0),(12,12,1,2,1500.00,'COMPLETED',300,'2025-09-06 07:47:19',NULL,1,10,1,'paid',0,1,1,31,0),(19,12,1,2,1500.00,'COMPLETED',300,'2025-09-06 08:18:12',NULL,1,10,2,'paid',0,1,1,38,0),(21,12,1,2,1500.00,'COMPLETED',300,'2025-09-06 08:30:11',NULL,1,10,2,'paid',0,1,1,40,0),(22,12,1,2,1500.00,'COMPLETED',300,'2025-09-06 08:30:14',NULL,1,10,2,'paid',0,1,1,41,0),(23,12,1,2,1500.00,'COMPLETED',300,'2025-09-06 08:31:07',NULL,1,10,2,'paid',0,1,1,42,0),(24,12,1,2,1500.00,'COMPLETED',300,'2025-09-06 09:30:19',NULL,1,10,2,'paid',0,1,1,43,0),(25,12,1,2,1500.00,'COMPLETED',300,'2025-09-06 09:30:50',NULL,1,10,2,'paid',0,1,1,44,0),(26,11,1,2,1700.00,'COMPLETED',500,'2025-09-06 11:39:06',NULL,1,100,1,'pending',17000,1,1,67,0),(27,11,1,2,1700.00,'COMPLETED',500,'2025-09-06 11:40:32',NULL,1,100,1,'pending',17000,1,1,68,0),(28,12,1,2,3400.00,'COMPLETED',1000,'2025-09-06 12:26:45',NULL,2,20,2,'paid',1700,1,3,71,0),(29,12,1,2,3400.00,'COMPLETED',1000,'2025-09-06 12:32:25',NULL,2,20,2,'paid',1700,1,3,72,0),(30,12,1,2,3400.00,'COMPLETED',1000,'2025-09-06 13:26:51',NULL,2,20,2,'paid',1700,1,3,73,0),(31,11,1,2,1500.00,'COMPLETED',300,'2025-09-13 05:19:06',NULL,1,100,2,'paid',0,2,1,97,0),(32,11,1,2,1500.00,'COMPLETED',300,'2025-09-13 05:29:05',NULL,1,100,2,'paid',0,9,1,100,0),(33,11,1,2,1500.00,'COMPLETED',300,'2025-09-13 05:49:08',NULL,1,100,2,'paid',0,2,4,102,0),(34,11,1,2,1550.00,'COMPLETED',350,'2025-09-13 18:08:54',NULL,1,100,2,'paid',0,2,1,103,0),(35,11,1,8,3000.00,'COMPLETED',600,'2025-09-27 12:50:04',NULL,2,200,2,'paid',0,2,1,106,0);
/*!40000 ALTER TABLE `accessorysales` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accessorytransferhistory`
--

LOCK TABLES `accessorytransferhistory` WRITE;
/*!40000 ALTER TABLE `accessorytransferhistory` DISABLE KEYS */;
INSERT INTO `accessorytransferhistory` VALUES (1,'2025-08-12 15:57:16',2,1,'confirmed','distribution',10,2,1,5,'2025-08-15 08:42:55'),(2,'2025-08-12 16:01:16',2,1,'confirmed','distribution',10,2,1,5,'2025-08-15 09:12:30'),(3,'2025-08-15 11:18:48',1,2,'pending','transfer',10,NULL,2,5,'2025-08-15 11:18:48'),(4,'2025-08-15 11:30:50',1,2,'pending','transfer',10,NULL,2,3,'2025-08-15 11:30:50'),(5,'2025-08-31 18:46:45',2,1,'confirmed','distribution',11,2,1,10,'2025-09-05 07:22:58'),(6,'2025-08-31 18:47:44',2,1,'confirmed','distribution',11,2,1,2,'2025-09-11 14:25:10'),(7,'2025-08-31 19:29:22',2,1,'confirmed','distribution',12,2,1,38,'2025-09-05 07:22:43'),(8,'2025-09-01 13:43:59',2,1,'confirmed','distribution',12,2,1,10,'2025-09-05 18:50:36'),(9,'2025-09-01 13:44:03',2,1,'confirmed','distribution',12,2,1,10,'2025-09-05 07:29:43'),(10,'2025-09-18 14:23:59',1,3,'confirmed','transfer',11,3,2,5,'2025-09-20 15:00:02'),(11,'2025-09-18 14:30:45',1,3,'confirmed','transfer',11,3,2,1,'2025-09-20 15:00:00'),(12,'2025-09-18 15:43:11',1,3,'confirmed','transfer',12,3,2,1,'2025-09-20 14:59:57'),(13,'2025-09-20 14:52:40',1,3,'confirmed','transfer',12,3,2,12,'2025-09-20 14:59:53'),(14,'2025-09-20 14:54:51',1,3,'confirmed','transfer',12,3,2,2,'2025-09-20 14:59:56'),(15,'2025-09-27 12:45:45',2,4,'confirmed','distribution',10,8,1,11,'2025-09-27 12:47:20'),(16,'2025-09-27 12:45:46',2,4,'confirmed','distribution',11,8,1,3,'2025-09-27 12:47:23'),(17,'2025-09-27 12:54:10',4,3,'pending','transfer',10,NULL,8,1,'2025-09-27 12:54:10');
/*!40000 ALTER TABLE `accessorytransferhistory` ENABLE KEYS */;
UNLOCK TABLES;

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
  `baseSalary` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`_id`),
  UNIQUE KEY `_id_UNIQUE` (`_id`),
  UNIQUE KEY `actors_email_key` (`email`),
  UNIQUE KEY `actors_phone_key` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actors`
--

LOCK TABLES `actors` WRITE;
/*!40000 ALTER TABLE `actors` DISABLE KEYS */;
INSERT INTO `actors` VALUES (1,'Timothy Joseph Kimilu','NA','NA','$2a$10$xGzLL.WODRXKfLrWIiWKtOjUBYfk3pkAWslxl0PRsDTgdOniI2Fri','timothyjoseph8580@gmail.com','active','0757174430','manager','https://www.linkedin.com/default_profile_picture.png','https://www.linkedin.com/default_profile_picture.png','https://www.linkedin.com/default_profile_picture.png','2025-08-11 16:06:17',NULL),(2,'Tony Trace Antony','John Matthew','0787654326','$2a$10$9yzYgOyJqXrQEcU1eKWmxOt4lPGSRelAw5./zDVZQC2B5pTIi3qMm','tracee@gmail.com','active','07123453298','seller','https://www.linkedin.com/default_profile_picture.png','https://www.linkedin.com/default_profile_picture.png','https://www.linkedin.com/default_profile_picture.png','2025-08-11 13:13:05',NULL),(3,'Peter Mwangi','Peter Gicheru','0734256767','$2a$10$67YnSdeHOOft7qRS5HOBx.8AodIvUQmud3jEPjimC5TFPzI.Z3bJu','mwangi@gmail.com','active','071235671789','seller','https://www.linkedin.com/default_profile_picture.png','https://www.linkedin.com/default_profile_picture.png','https://www.linkedin.com/default_profile_picture.png','2025-08-27 05:54:51',NULL),(7,'Gabriel Ancellotti ','Kamau ','John','$2a$10$vNMBL2bQ1GFj9rdfDLKFtu58SGBG.WqbNkWzIwd8SrScwud2ByXM.','ancellotti@gmail.com','active','07453838552','seller','https://www.linkedin.com/default_profile_picture.png','https://www.linkedin.com/default_profile_picture.png','https://www.linkedin.com/default_profile_picture.png','2025-09-27 11:35:13',NULL),(8,'Penaldo Gabriel','Kamau James ','0734543732','$2a$10$O7vrLzJEOa45KzOELaAWCONiIxIEA0mVJLevn70QiEVaaEopwbM3.','Penaldo@gmail.com','active','07453627464','seller','https://www.linkedin.com/default_profile_picture.png','https://www.linkedin.com/default_profile_picture.png','https://www.linkedin.com/default_profile_picture.png','2025-09-27 11:36:52',NULL);
/*!40000 ALTER TABLE `actors` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignment`
--

LOCK TABLES `assignment` WRITE;
/*!40000 ALTER TABLE `assignment` DISABLE KEYS */;
INSERT INTO `assignment` VALUES (1,2,1,'2025-08-11 00:00:00','2025-09-14 00:00:00','assigned','2025-08-12 05:12:09'),(2,3,1,'2025-09-01 00:00:00','2025-09-14 00:00:00','removed','2025-09-20 11:58:37'),(3,3,3,'2025-09-18 00:00:00','2025-09-30 00:00:00','assigned','2025-09-18 01:58:10'),(4,8,4,'2025-09-27 00:00:00','2025-09-27 00:00:00','assigned','2025-09-27 09:43:20');
/*!40000 ALTER TABLE `assignment` ENABLE KEYS */;
UNLOCK TABLES;

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
  `category` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`_id`),
  UNIQUE KEY `_id_UNIQUE` (`_id`),
  UNIQUE KEY `itemModel_UNIQUE` (`itemModel`),
  UNIQUE KEY `itemName_UNIQUE` (`itemName`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Samsung','A16S',140000,'mobiles','Samsung',150000,'mobiles'),(2,'Oraimo earphones','XOS',1500,'accessories','Oraimo x',1700,'accessories'),(16,'samsung 4/256 GB','a16s series',15000,'mobiles','Samsung ',17000,'mobiles'),(18,'Samsung_4/128GB','A05s',15500,'mobiles','Samsung',16000,'mobiles'),(20,'samsung 4/256GB','Samsung MI35',22000,'mobiles','samsung',25000,'mobiles');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mobileHistory`
--

LOCK TABLES `mobileHistory` WRITE;
/*!40000 ALTER TABLE `mobileHistory` DISABLE KEYS */;
INSERT INTO `mobileHistory` VALUES (1,1,'2025-08-12 08:14:04',2,'new stock',1,NULL,'2025-08-12 08:14:04'),(2,1,'2025-08-12 08:14:16',2,'new stock',2,NULL,'2025-08-12 08:14:16'),(3,1,'2025-08-12 08:14:25',2,'new stock',3,NULL,'2025-08-12 08:14:25'),(4,1,'2025-08-12 08:14:33',2,'new stock',4,NULL,'2025-08-12 08:14:33'),(5,1,'2025-08-12 08:14:40',2,'new stock',5,NULL,'2025-08-12 08:14:40'),(6,1,'2025-08-12 08:14:48',2,'new stock',6,NULL,'2025-08-12 08:14:48'),(7,1,'2025-08-12 08:14:57',2,'new stock',7,NULL,'2025-08-12 08:14:57'),(8,1,'2025-08-12 09:50:32',2,'new stock',8,NULL,'2025-08-12 09:50:32'),(9,1,'2025-08-12 09:50:42',2,'new stock',9,NULL,'2025-08-12 09:50:42'),(10,1,'2025-08-12 09:51:00',2,'new stock',10,NULL,'2025-08-12 09:51:00'),(11,1,'2025-08-12 09:51:08',2,'new stock',11,NULL,'2025-08-12 09:51:08'),(12,1,'2025-08-12 10:02:05',2,'new stock',12,NULL,'2025-08-12 10:02:05'),(13,1,'2025-08-12 10:02:12',2,'new stock',13,NULL,'2025-08-12 10:02:12'),(14,1,'2025-08-12 10:02:19',2,'new stock',14,NULL,'2025-08-12 10:02:19'),(15,1,'2025-08-12 11:17:55',2,'new stock',15,NULL,'2025-08-12 11:17:55'),(16,1,'2025-08-12 11:18:02',2,'new stock',16,NULL,'2025-08-12 11:18:02'),(17,1,'2025-08-12 11:18:10',2,'new stock',17,NULL,'2025-08-12 11:18:10'),(18,1,'2025-08-12 12:01:13',2,'new stock',18,NULL,'2025-08-12 12:01:13'),(19,1,'2025-08-12 12:03:27',2,'new stock',19,NULL,'2025-08-12 12:03:27'),(20,1,'2025-08-12 12:03:37',2,'new stock',20,NULL,'2025-08-12 12:03:37'),(21,1,'2025-08-12 12:22:24',2,'new stock',21,NULL,'2025-08-12 12:22:24'),(22,1,'2025-08-31 13:58:23',2,'update',16,NULL,'2025-08-31 13:58:23'),(23,1,'2025-08-31 14:02:09',2,'update',16,NULL,'2025-08-31 14:02:09'),(24,1,'2025-08-31 14:04:45',2,'update',16,NULL,'2025-08-31 14:04:45'),(25,1,'2025-08-31 14:05:38',2,'update',16,NULL,'2025-08-31 14:05:38'),(26,1,'2025-08-31 16:38:09',2,'update',20,NULL,'2025-08-31 16:38:09'),(27,1,'2025-08-31 16:38:43',2,'update',16,NULL,'2025-08-31 16:38:43'),(28,1,'2025-08-31 16:38:58',2,'update',20,NULL,'2025-08-31 16:38:58'),(29,1,'2025-08-31 16:39:12',2,'update',20,NULL,'2025-08-31 16:39:12'),(30,1,'2025-08-31 16:39:56',2,'update',21,NULL,'2025-08-31 16:39:56'),(31,1,'2025-08-31 16:54:48',2,'update',17,NULL,'2025-08-31 16:54:48'),(32,1,'2025-08-31 19:04:08',2,'new stock',22,NULL,'2025-08-31 19:04:08'),(33,1,'2025-08-31 19:04:48',2,'new stock',23,NULL,'2025-08-31 19:04:48'),(34,1,'2025-08-31 19:06:09',2,'new stock',25,NULL,'2025-08-31 19:06:09'),(35,1,'2025-08-31 19:12:15',2,'update',22,NULL,'2025-08-31 19:12:15'),(36,1,'2025-08-31 19:12:35',2,'update',22,NULL,'2025-08-31 19:12:35'),(37,1,'2025-08-31 19:13:19',2,'update',22,NULL,'2025-08-31 19:13:19'),(38,1,'2025-09-05 08:22:12',2,'new stock',26,NULL,'2025-09-05 08:22:12'),(39,1,'2025-09-05 08:22:22',2,'new stock',27,NULL,'2025-09-05 08:22:22'),(40,1,'2025-09-05 08:22:31',2,'new stock',28,NULL,'2025-09-05 08:22:31'),(41,1,'2025-09-05 08:22:40',2,'new stock',29,NULL,'2025-09-05 08:22:40'),(42,1,'2025-09-18 08:39:20',2,'new stock',30,NULL,'2025-09-18 08:39:20'),(43,1,'2025-09-27 11:44:53',2,'new stock',31,NULL,'2025-09-27 11:44:53'),(44,1,'2025-09-27 11:44:59',2,'new stock',32,NULL,'2025-09-27 11:44:59'),(45,1,'2025-09-27 11:45:03',2,'new stock',33,NULL,'2025-09-27 11:45:03'),(46,1,'2025-09-27 11:45:09',2,'new stock',34,NULL,'2025-09-27 11:45:09'),(47,1,'2025-09-27 11:45:15',2,'new stock',35,NULL,'2025-09-27 11:45:15'),(48,1,'2025-09-27 11:45:25',2,'new stock',37,NULL,'2025-09-27 11:45:25'),(49,1,'2025-09-27 11:45:31',2,'new stock',38,NULL,'2025-09-27 11:45:31'),(50,1,'2025-09-27 11:45:43',2,'new stock',40,NULL,'2025-09-27 11:45:43'),(51,1,'2025-09-27 11:45:49',2,'new stock',41,NULL,'2025-09-27 11:45:49'),(52,1,'2025-09-27 11:46:12',2,'new stock',44,NULL,'2025-09-27 11:46:12'),(53,1,'2025-09-27 11:46:18',2,'new stock',45,NULL,'2025-09-27 11:46:18'),(54,1,'2025-09-27 11:47:06',2,'update',31,NULL,'2025-09-27 11:47:06'),(55,1,'2025-09-27 11:47:33',2,'update',32,NULL,'2025-09-27 11:47:33');
/*!40000 ALTER TABLE `mobileHistory` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mobileItems`
--

LOCK TABLES `mobileItems` WRITE;
/*!40000 ALTER TABLE `mobileItems` DISABLE KEYS */;
INSERT INTO `mobileItems` VALUES (9,6,1,'sold',2,7,'2025-08-12 09:14:10','new stock',0,'2025-09-05 05:56:24'),(10,5,1,'confirmed',2,6,'2025-08-12 09:14:10','new stock',1,'2025-09-05 05:56:44'),(11,4,1,'sold',2,8,'2025-08-12 09:14:12','new stock',0,'2025-09-05 05:56:40'),(12,7,1,'confirmed',2,5,'2025-08-12 09:14:10','new stock',1,'2025-09-05 05:56:37'),(17,1,1,'confirmed',2,9,'2025-08-12 09:34:08','new stock',1,'2025-09-05 06:10:07'),(18,3,1,'confirmed',2,11,'2025-08-12 09:34:09','new stock',1,'2025-09-05 05:56:48'),(19,2,1,'sold',2,10,'2025-08-12 09:34:09','new stock',0,'2025-09-05 06:10:12'),(23,8,1,'sold',2,12,'2025-08-12 09:52:09','new stock',0,'2025-09-05 05:56:53'),(24,10,1,'transferd',2,13,'2025-08-12 09:52:11','new stock',0,'2025-09-05 06:10:15'),(27,9,1,'sold',2,14,'2025-08-12 09:52:12','new stock',1,'2025-09-05 05:56:59'),(29,14,1,'sold',2,15,'2025-08-12 10:03:00','new stock',1,'2025-09-05 06:10:18'),(30,14,1,'confirmed',2,15,'2025-08-12 10:03:02','new stock',1,'2025-09-05 06:10:18'),(31,12,1,'sold',2,17,'2025-08-12 10:03:02','new stock',0,'2025-09-05 06:10:21'),(32,13,1,'sold',2,16,'2025-08-12 10:03:02','new stock',0,'2025-09-05 06:10:22'),(33,12,1,'sold',2,17,'2025-08-12 10:03:03','new stock',0,'2025-09-05 06:10:21'),(34,13,1,'sold',2,16,'2025-08-12 10:03:03','new stock',0,'2025-09-05 06:10:22'),(37,11,1,'confirmed',2,20,'2025-08-12 10:46:07','new stock',1,'2025-09-05 06:10:22'),(39,15,1,'confirmed',2,22,'2025-08-12 11:19:54','new stock',1,'2025-08-15 09:29:29'),(40,16,1,'confirmed',2,23,'2025-08-12 11:19:54','new stock',1,'2025-08-12 12:36:26'),(41,19,1,'transferd',2,24,'2025-08-12 12:23:24','new stock',0,'2025-08-12 12:36:02'),(42,21,1,'available',2,25,'2025-08-12 12:23:24','new stock',2,'2025-08-12 12:35:22'),(43,19,2,'pending',NULL,26,'2025-08-15 09:31:47','new stock',1,'2025-08-15 09:31:47'),(44,25,1,'sold',2,27,'2025-08-31 19:06:47','new stock',0,'2025-09-05 06:10:22'),(45,23,1,'transferd',2,28,'2025-08-31 19:06:48','new stock',0,'2025-09-05 06:10:23'),(46,22,1,'sold',2,29,'2025-08-31 19:06:48','new stock',0,'2025-09-05 06:10:23'),(47,29,1,'transferd',2,30,'2025-09-18 04:45:06','new stock',0,'2025-09-18 04:47:11'),(48,28,1,'transferd',2,31,'2025-09-18 04:45:07','new stock',0,'2025-09-18 04:47:27'),(49,30,3,'transferd',3,32,'2025-09-18 08:39:57','new stock',0,'2025-09-20 15:00:08'),(50,28,3,'confirmed',3,35,'2025-09-18 08:54:29','new stock',1,'2025-09-20 15:00:10'),(51,29,3,'confirmed',3,36,'2025-09-18 09:20:00','new stock',1,'2025-09-20 15:00:15'),(52,23,3,'sold',3,37,'2025-09-20 14:41:48','new stock',0,'2025-09-20 15:00:13'),(53,10,3,'confirmed',3,38,'2025-09-20 14:41:48','new stock',1,'2025-09-20 15:00:17'),(54,30,1,'pending',NULL,39,'2025-09-22 05:24:49','new stock',1,'2025-09-22 05:24:49'),(55,45,4,'confirmed',8,40,'2025-09-27 11:48:45','new stock',1,'2025-09-27 12:44:45'),(56,41,4,'confirmed',8,41,'2025-09-27 11:48:45','new stock',1,'2025-09-27 12:44:47'),(57,34,4,'sold',8,42,'2025-09-27 11:48:45','new stock',0,'2025-09-27 12:44:50'),(58,33,4,'confirmed',8,43,'2025-09-27 11:48:46','new stock',1,'2025-09-27 12:44:53'),(59,35,4,'transferd',8,44,'2025-09-27 11:48:46','new stock',0,'2025-09-27 12:44:57'),(60,35,3,'pending',NULL,45,'2025-09-27 12:53:53','new stock',1,'2025-09-27 12:53:53');
/*!40000 ALTER TABLE `mobileItems` ENABLE KEYS */;
UNLOCK TABLES;

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
  `paymentStatus` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PAID',
  `supplierId` int DEFAULT NULL,
  PRIMARY KEY (`_id`),
  UNIQUE KEY `_id_UNIQUE` (`_id`),
  UNIQUE KEY `IMEI_UNIQUE` (`IMEI`),
  KEY `fk_mobiles_1_idx` (`CategoryId`),
  KEY `mobiles_supplierId_fkey` (`supplierId`),
  CONSTRAINT `fk_mobiles_1` FOREIGN KEY (`CategoryId`) REFERENCES `categories` (`_id`),
  CONSTRAINT `mobiles_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mobiles`
--

LOCK TABLES `mobiles` WRITE;
/*!40000 ALTER TABLE `mobiles` DISABLE KEYS */;
INSERT INTO `mobiles` VALUES (1,'138012827882399','234-234-6',0,500.00,300.00,120000.00,'black','distributed',1,NULL,'2025-08-12 08:14:02','8/128GB','smartphones','2025-08-12 09:34:06','mobiles','paid',1),(2,'138012827452399','234-234-6',0,500.00,300.00,120000.00,'black','sold',1,NULL,'2025-08-12 08:14:15','8/128GB','smartphones','2025-08-12 09:34:06','mobiles','paid',1),(3,'1380128274231399','234-234-6',0,500.00,300.00,120000.00,'black','distributed',1,NULL,'2025-08-12 08:14:24','8/128GB','smartphones','2025-08-12 09:34:06','mobiles','paid',1),(4,'137128274231399','234-234-6',0,500.00,300.00,120000.00,'black','sold',1,NULL,'2025-08-12 08:14:32','8/128GB','smartphones','2025-08-12 09:14:05','mobiles','paid',1),(5,'1371282566231399','234-234-6',0,500.00,300.00,120000.00,'black','distributed',1,NULL,'2025-08-12 08:14:40','8/128GB','smartphones','2025-08-12 09:14:05','mobiles','paid',1),(6,'1571282566231399','234-234-6',0,500.00,300.00,120000.00,'black','sold',1,NULL,'2025-08-12 08:14:48','8/128GB','smartphones','2025-08-12 09:14:05','mobiles','paid',1),(7,'0571282566231399','234-234-6',0,500.00,300.00,120000.00,'black','distributed',1,NULL,'2025-08-12 08:14:56','8/128GB','smartphones','2025-08-12 09:14:05','mobiles','paid',1),(8,'05712825662399','234-234-6',0,500.00,300.00,120000.00,'black','distributed',1,NULL,'2025-08-12 09:50:31','8/128GB','smartphones','2025-08-12 09:52:08','mobiles','paid',1),(9,'056712825662399','234-234-6',0,500.00,300.00,120000.00,'black','distributed',1,NULL,'2025-08-12 09:50:42','8/128GB','smartphones','2025-08-12 09:52:10','mobiles','paid',1),(10,'056712825662392','234-234-6',0,500.00,300.00,120000.00,'black','distributed',1,NULL,'2025-08-12 09:51:00','8/128GB','smartphones','2025-08-12 09:52:08','mobiles','paid',1),(11,'05671289662392','234-234-6',0,500.00,300.00,120000.00,'black','distributed',1,NULL,'2025-08-12 09:51:07','8/128GB','smartphones','2025-08-12 10:46:07','mobiles','paid',1),(12,'05671287762392','234-234-6',0,500.00,300.00,120000.00,'black','sold',1,NULL,'2025-08-12 10:02:04','8/128GB','smartphones','2025-08-12 10:03:01','mobiles','paid',1),(13,'05671280062392','234-234-6',0,500.00,300.00,120000.00,'black','sold',1,NULL,'2025-08-12 10:02:12','8/128GB','smartphones','2025-08-12 10:03:01','mobiles','paid',1),(14,'07671280062392','234-234-6',0,500.00,300.00,120000.00,'black','distributed',1,NULL,'2025-08-12 10:02:19','8/128GB','smartphones','2025-08-12 10:03:00','mobiles','paid',1),(15,'0767128002392','234-234-6',0,500.00,300.00,120000.00,'black','distributed',1,NULL,'2025-08-12 11:17:55','8/128GB','smartphones','2025-08-12 11:19:54','mobiles','paid',1),(16,'034512327892234','234-234-6',0,1000.00,300.00,13000.00,'black','sold',1,NULL,'2025-08-12 11:18:01','8/128GB','smartphones','2025-08-31 16:38:43','mobiles','paid',1),(17,'345678924562134','234-234-6',1,500.00,300.00,120000.00,'black','available',16,NULL,'2025-08-12 11:18:09','8/128GB','smartphones','2025-08-31 16:54:47','mobiles','paid',1),(18,'07671223440457602392','234-234-6',1,500.00,300.00,120000.00,'black','available',1,NULL,'2025-08-12 12:01:12','8/128GB','smartphones','2025-08-12 12:01:12','mobiles','paid',1),(19,'0767122545543440457602392','234-234-6',0,500.00,300.00,120000.00,'black','distributed',1,NULL,'2025-08-12 12:03:26','8/128GB','smartphones','2025-08-12 12:23:22','mobiles','paid',1),(20,'123456789123456','234-234-6',1,500.00,300.00,120000.00,'black','available',1,NULL,'2025-08-12 12:03:37','8/128GB','smartphones','2025-08-31 16:39:11','mobiles','paid',1),(21,'455434404572392','234-234-6',0,500.00,300.00,120000.00,'black','faulty',1,NULL,'2025-08-12 12:22:23','8/128GB','smartphones','2025-08-31 16:39:54','mobiles','paid',1),(22,'567891234568438','123-456-787',0,500.00,0.00,15000.00,'black','sold',16,NULL,'2025-08-31 19:04:07','8/128GB','smartphone','2025-08-31 19:13:18','mobiles','paid',1),(23,'567891234568436','123-456-787',0,500.00,0.00,12000.00,'black','sold',16,NULL,'2025-08-31 19:04:48','8/128GB','smartphone','2025-08-31 19:06:48','mobiles','paid',1),(25,'567891234568439','123-456-787',0,500.00,0.00,15000.00,'black','sold',16,NULL,'2025-08-31 19:06:09','8/128GB','smartphone','2025-08-31 19:06:47','mobiles','paid',1),(26,'235735243956435','234-3458',1,1000.00,0.00,15000.00,'blue','available',16,NULL,'2025-09-05 08:22:10','8/128GB','smartphone','2025-09-05 08:22:10','mobiles','paid',3),(27,'235735243956436','234-3458',1,1000.00,0.00,15000.00,'blue','available',16,NULL,'2025-09-05 08:22:22','8/128GB','smartphone','2025-09-05 08:22:22','mobiles','paid',3),(28,'235735243956432','234-3458',0,1000.00,0.00,15000.00,'blue','distributed',16,NULL,'2025-09-05 08:22:31','8/128GB','smartphone','2025-09-18 04:45:06','mobiles','paid',3),(29,'235735249956432','234-3458',0,1000.00,0.00,15000.00,'blue','distributed',16,NULL,'2025-09-05 08:22:39','8/128GB','smartphone','2025-09-18 04:45:06','mobiles','paid',3),(30,'234567894235678','234-3458',0,3000.00,0.00,130000.00,'white','distributed',1,NULL,'2025-09-18 08:39:19','8/128GB','smartphone','2025-09-18 08:39:57','mobiles','paid',3),(31,'345475495757393','S13-04394-21',1,500.00,0.00,18000.00,'yellow','available',18,NULL,'2025-09-27 11:44:52','8/128GB','smartphone','2025-09-27 11:47:06','mobiles','paid',3),(32,'345475495757394','S13-04394-21',1,500.00,0.00,18000.00,'yellow','available',1,NULL,'2025-09-27 11:44:59','8/128GB','smartphone','2025-09-27 11:47:33','mobiles','paid',3),(33,'345475495757395','S13-04394-21',0,500.00,0.00,18000.00,'yellow','distributed',20,NULL,'2025-09-27 11:45:03','8/128GB','smartphone','2025-09-27 11:48:46','mobiles','paid',3),(34,'345475495757396','S13-04394-21',0,500.00,0.00,18000.00,'yellow','sold',20,NULL,'2025-09-27 11:45:09','8/128GB','smartphone','2025-09-27 11:48:45','mobiles','paid',3),(35,'345475495757398','S13-04394-21',0,500.00,0.00,18000.00,'yellow','distributed',20,NULL,'2025-09-27 11:45:15','8/128GB','smartphone','2025-09-27 11:48:46','mobiles','paid',3),(37,'345475495757391','S13-04394-21',1,500.00,0.00,18000.00,'yellow','available',20,NULL,'2025-09-27 11:45:25','8/128GB','smartphone','2025-09-27 11:45:25','mobiles','paid',3),(38,'345475495757392','S13-04394-21',1,500.00,0.00,18000.00,'yellow','available',20,NULL,'2025-09-27 11:45:30','8/128GB','smartphone','2025-09-27 11:45:30','mobiles','paid',3),(40,'345475495757343','S13-04394-21',1,500.00,0.00,18000.00,'yellow','available',20,NULL,'2025-09-27 11:45:43','8/128GB','smartphone','2025-09-27 11:45:43','mobiles','paid',3),(41,'345475495757353','S13-04394-21',0,500.00,0.00,18000.00,'yellow','distributed',20,NULL,'2025-09-27 11:45:49','8/128GB','smartphone','2025-09-27 11:48:45','mobiles','paid',3),(44,'345475495757363','S13-04394-21',1,500.00,0.00,18000.00,'yellow','available',20,NULL,'2025-09-27 11:46:12','8/128GB','smartphone','2025-09-27 11:46:12','mobiles','paid',3),(45,'345475495757373','S13-04394-21',0,500.00,0.00,18000.00,'yellow','distributed',20,NULL,'2025-09-27 11:46:18','8/128GB','smartphone','2025-09-27 11:48:45','mobiles','paid',3);
/*!40000 ALTER TABLE `mobiles` ENABLE KEYS */;
UNLOCK TABLES;

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
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `commisssionStatus` enum('pending','paid') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int DEFAULT '0',
  `salesType` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'direct',
  `financeStatus` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'captech',
  `financeAmount` int DEFAULT '0',
  `categoryId` int DEFAULT NULL,
  `commission` int DEFAULT '0',
  `profit` int DEFAULT '0',
  `soldPrice` int DEFAULT '0',
  `status` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'COMPLETED',
  `customerId` int DEFAULT NULL,
  `financerId` int DEFAULT NULL,
  `paymentId` int DEFAULT NULL,
  `commissionPaid` int DEFAULT '0',
  PRIMARY KEY (`_id`),
  UNIQUE KEY `_id_UNIQUE` (`_id`),
  KEY `fk_mobilesales_1_idx` (`productID`),
  KEY `fk_mobilesales_2_idx` (`sellerId`),
  KEY `fk_mobilesales_3_idx` (`shopID`),
  KEY `fk_mobileSales_category` (`categoryId`),
  KEY `idx_sales_created` (`createdAt`),
  KEY `idx_sales_finance_status` (`financeStatus`),
  KEY `mobilesales_customerId_idx` (`customerId`),
  KEY `mobilesales_financerId_idx` (`financerId`),
  KEY `mobilesales_paymentId_idx` (`paymentId`),
  CONSTRAINT `fk_mobilesales_1` FOREIGN KEY (`productID`) REFERENCES `mobiles` (`_id`),
  CONSTRAINT `fk_mobilesales_2` FOREIGN KEY (`sellerId`) REFERENCES `actors` (`_id`),
  CONSTRAINT `fk_mobilesales_3` FOREIGN KEY (`shopID`) REFERENCES `shops` (`_id`),
  CONSTRAINT `fk_mobileSales_category` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`_id`),
  CONSTRAINT `mobilesales_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `mobilesales_financerId_fkey` FOREIGN KEY (`financerId`) REFERENCES `Financer` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `mobilesales_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mobilesales`
--

LOCK TABLES `mobilesales` WRITE;
/*!40000 ALTER TABLE `mobilesales` DISABLE KEYS */;
INSERT INTO `mobilesales` VALUES (1,21,1,2,'2025-08-12 13:10:00','pending',1,'direct','paid',0,1,500,5000,125000,'RETURNED',1,1,2,50),(2,22,1,2,'2025-09-06 10:33:44','pending',2,'direct','pending',17000,1,1000,-13000,17000,'COMPLETED',1,1,47,500),(4,22,1,2,'2025-09-06 10:39:41',NULL,1,'direct','pending',17000,1,500,2000,17000,'COMPLETED',1,1,49,0),(8,25,1,2,'2025-09-06 10:57:46',NULL,1,'direct','pending',17000,1,500,2000,17000,'COMPLETED',1,1,53,0),(9,25,1,2,'2025-09-06 10:57:53',NULL,1,'direct','pending',17000,1,500,2000,17000,'COMPLETED',1,1,54,0),(10,16,1,2,'2025-09-06 11:14:53',NULL,1,'direct','pending',17000,1,1000,4000,17000,'COMPLETED',1,1,57,0),(14,13,1,2,'2025-09-06 11:29:51','paid',1,'direct','pending',17000,1,500,-103000,17000,'COMPLETED',1,1,63,500),(15,13,1,2,'2025-09-06 11:30:52',NULL,1,'direct','pending',17000,1,500,-103000,17000,'COMPLETED',1,1,64,0),(16,13,1,2,'2025-09-06 11:35:02',NULL,1,'direct','pending',17000,1,500,50000,170000,'COMPLETED',1,1,65,0),(17,12,1,2,'2025-09-06 12:00:54',NULL,1,'direct','pending',17000,1,500,50000,170000,'COMPLETED',1,1,69,0),(18,4,1,2,'2025-09-06 12:18:24',NULL,1,'direct','pending',17000,1,500,50000,170000,'COMPLETED',1,1,70,0),(20,22,1,2,'2025-09-12 08:32:36','pending',1,'direct','pending',17000,1,500,2000,17000,'COMPLETED',1,1,86,300),(27,12,1,2,'2025-09-13 05:15:44',NULL,1,'direct','paid',0,1,500,20000,140000,'COMPLETED',2,1,95,0),(28,12,1,2,'2025-09-13 05:17:44',NULL,1,'direct','paid',0,1,500,20000,140000,'COMPLETED',2,1,96,0),(29,6,1,2,'2025-09-13 05:27:29',NULL,1,'direct','paid',0,1,500,25000,145000,'COMPLETED',8,4,98,0),(30,2,1,2,'2025-09-13 05:29:04',NULL,1,'direct','paid',0,1,500,25000,145000,'COMPLETED',9,4,99,0),(31,25,1,2,'2025-09-13 05:49:06',NULL,1,'direct','paid',0,16,500,500,15500,'COMPLETED',2,4,101,0),(32,23,1,3,'2025-09-22 05:27:11',NULL,1,'direct','pending',15000,16,500,3000,15000,'COMPLETED',2,3,104,0),(33,34,1,8,'2025-09-27 12:50:04',NULL,1,'direct','paid',0,20,500,7000,25000,'COMPLETED',2,1,105,0);
/*!40000 ALTER TABLE `mobilesales` ENABLE KEYS */;
UNLOCK TABLES;

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
  `status` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `type` enum('distribution','transfer','return') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `productID` int DEFAULT NULL,
  `transferdBy` int DEFAULT NULL,
  `quantity` int unsigned DEFAULT '0',
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_mobiletransferhistory_confirmedBy` (`confirmedBy`),
  KEY `fk_mobiletransferhistory_fromshop` (`fromshop`),
  KEY `fk_mobiletransferhistory_mobiles` (`productID`),
  KEY `fk_mobiletransferhistory_toshop` (`toshop`),
  KEY `fk_mobiletransferhistory_transferdBy` (`transferdBy`),
  CONSTRAINT `fk_mobiletransferhistory_confirmedBy` FOREIGN KEY (`confirmedBy`) REFERENCES `actors` (`_id`),
  CONSTRAINT `fk_mobiletransferhistory_fromshop` FOREIGN KEY (`fromshop`) REFERENCES `shops` (`_id`),
  CONSTRAINT `fk_mobiletransferhistory_mobiles` FOREIGN KEY (`productID`) REFERENCES `mobiles` (`_id`),
  CONSTRAINT `fk_mobiletransferhistory_toshop` FOREIGN KEY (`toshop`) REFERENCES `shops` (`_id`),
  CONSTRAINT `fk_mobiletransferhistory_transferdBy` FOREIGN KEY (`transferdBy`) REFERENCES `actors` (`_id`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mobiletransferHistory`
--

LOCK TABLES `mobiletransferHistory` WRITE;
/*!40000 ALTER TABLE `mobiletransferHistory` DISABLE KEYS */;
INSERT INTO `mobiletransferHistory` VALUES (5,'2025-08-12 09:14:06',2,1,2,'confirmed','distribution',7,1,1,'2025-09-05 05:56:37'),(6,'2025-08-12 09:14:06',2,1,2,'confirmed','distribution',5,1,1,'2025-09-05 05:56:45'),(7,'2025-08-12 09:14:06',2,1,2,'confirmed','distribution',6,1,1,'2025-09-05 05:56:29'),(8,'2025-08-12 09:14:06',2,1,2,'confirmed','distribution',4,1,1,'2025-09-05 05:56:40'),(9,'2025-08-12 09:34:07',2,1,2,'confirmed','distribution',1,1,1,'2025-09-05 06:10:09'),(10,'2025-08-12 09:34:07',2,1,2,'confirmed','distribution',2,1,1,'2025-09-05 06:10:12'),(11,'2025-08-12 09:34:07',2,1,2,'confirmed','distribution',3,1,1,'2025-09-05 05:56:48'),(12,'2025-08-12 09:52:08',2,1,2,'confirmed','distribution',8,1,1,'2025-09-05 05:56:53'),(13,'2025-08-12 09:52:08',2,1,2,'confirmed','distribution',10,1,1,'2025-09-05 06:10:15'),(14,'2025-08-12 09:52:10',2,1,2,'confirmed','distribution',9,1,1,'2025-09-05 05:56:59'),(15,'2025-08-12 10:03:00',2,1,2,'confirmed','distribution',14,1,1,'2025-09-05 06:10:19'),(16,'2025-08-12 10:03:01',2,1,2,'confirmed','distribution',13,1,1,'2025-09-05 06:10:22'),(17,'2025-08-12 10:03:01',2,1,2,'confirmed','distribution',12,1,1,'2025-09-05 06:10:21'),(20,'2025-08-12 10:46:07',2,1,2,'confirmed','distribution',11,1,1,'2025-09-05 06:10:23'),(22,'2025-08-12 11:19:54',2,1,2,'confirmed','distribution',15,1,1,'2025-08-15 09:29:36'),(23,'2025-08-12 11:19:54',2,1,2,'confirmed','distribution',16,1,1,'2025-08-12 12:36:26'),(24,'2025-08-12 12:23:22',2,1,2,'confirmed','distribution',19,1,1,'2025-08-12 12:36:02'),(25,'2025-08-12 12:23:24',2,1,2,'confirmed','distribution',21,1,1,'2025-08-12 12:35:22'),(26,'2025-08-15 09:31:44',1,2,NULL,'pending','transfer',19,2,1,'2025-08-15 09:31:44'),(27,'2025-08-31 19:06:46',2,1,2,'confirmed','distribution',25,1,1,'2025-09-05 06:10:23'),(28,'2025-08-31 19:06:48',2,1,2,'confirmed','distribution',23,1,1,'2025-09-05 06:10:24'),(29,'2025-08-31 19:06:48',2,1,2,'confirmed','distribution',22,1,1,'2025-09-05 06:10:24'),(30,'2025-09-18 04:45:04',2,1,2,'confirmed','distribution',29,1,1,'2025-09-18 04:47:12'),(31,'2025-09-18 04:45:06',2,1,2,'confirmed','distribution',28,1,1,'2025-09-18 04:47:27'),(32,'2025-09-18 08:39:56',2,3,3,'confirmed','distribution',30,1,1,'2025-09-20 15:00:09'),(35,'2025-09-18 08:54:29',1,3,3,'confirmed','transfer',28,2,1,'2025-09-20 15:00:10'),(36,'2025-09-18 09:19:59',1,3,3,'confirmed','transfer',29,2,1,'2025-09-20 15:00:15'),(37,'2025-09-20 14:41:48',1,3,3,'confirmed','transfer',23,2,1,'2025-09-20 15:00:13'),(38,'2025-09-20 14:41:47',1,3,3,'confirmed','transfer',10,2,1,'2025-09-20 15:00:17'),(39,'2025-09-22 05:24:49',3,1,NULL,'pending','transfer',30,3,1,'2025-09-22 05:24:49'),(40,'2025-09-27 11:48:45',2,4,8,'confirmed','distribution',45,1,1,'2025-09-27 12:44:45'),(41,'2025-09-27 11:48:45',2,4,8,'confirmed','distribution',41,1,1,'2025-09-27 12:44:47'),(42,'2025-09-27 11:48:45',2,4,8,'confirmed','distribution',34,1,1,'2025-09-27 12:44:50'),(43,'2025-09-27 11:48:45',2,4,8,'confirmed','distribution',33,1,1,'2025-09-27 12:44:53'),(44,'2025-09-27 11:48:46',2,4,8,'confirmed','distribution',35,1,1,'2025-09-27 12:44:57'),(45,'2025-09-27 12:53:53',4,3,NULL,'pending','transfer',35,8,1,'2025-09-27 12:53:53');
/*!40000 ALTER TABLE `mobiletransferHistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `shops`
--

LOCK TABLES `shops` WRITE;
/*!40000 ALTER TABLE `shops` DISABLE KEYS */;
INSERT INTO `shops` VALUES (1,'Pokot Resin outlet','Kiambu 26'),(2,'South B','South B'),(3,'Donholm Outlet','Savannah'),(4,'Tassia Complex','Tassia One');
/*!40000 ALTER TABLE `shops` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-28 13:51:13
