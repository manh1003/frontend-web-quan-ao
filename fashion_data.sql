-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: fashion_store
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_logs` (
  `log_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `table_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `record_id` int DEFAULT NULL,
  `old_value` json DEFAULT NULL,
  `new_value` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `idx_user_date` (`user_id`,`created_at`),
  KEY `idx_table_record` (`table_name`,`record_id`),
  KEY `idx_action` (`action`),
  CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
INSERT INTO `activity_logs` VALUES (1,1,'LOGIN','users',1,NULL,NULL,'127.0.0.1',NULL,'2025-10-23 08:15:48'),(2,3,'CREATE','orders',1,NULL,'{\"customer_id\": 1, \"total_amount\": 877000}','192.168.1.10',NULL,'2025-10-23 08:15:48'),(3,5,'UPDATE','orders',1,'{\"status\": \"confirmed\"}','{\"status\": \"processing\"}','192.168.1.15',NULL,'2025-10-23 08:15:48'),(4,4,'UPDATE','orders',9,'{\"status\": \"pending\"}','{\"status\": \"cancelled\"}','192.168.1.12',NULL,'2025-10-23 08:15:48');
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `brands`
--

DROP TABLE IF EXISTS `brands`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brands` (
  `brand_id` int NOT NULL AUTO_INCREMENT,
  `brand_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `logo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`brand_id`),
  UNIQUE KEY `brand_name` (`brand_name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brands`
--

LOCK TABLES `brands` WRITE;
/*!40000 ALTER TABLE `brands` DISABLE KEYS */;
INSERT INTO `brands` VALUES (1,'ROUTINE','Thương hiệu thời trang Việt Nam cao cấp','https://example.com/routine-logo.png','Việt Nam','https://routine.vn',1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(2,'COOLMATE','Thương hiệu thời trang nam hiện đại','https://example.com/coolmate-logo.png','Việt Nam','https://coolmate.me',1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(3,'OWEN','Thời trang nam công sở sang trọng','https://example.com/owen-logo.png','Việt Nam','https://owen.vn',1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(4,'CANIFA','Thời trang gia đình Việt Nam','https://example.com/canifa-logo.png','Việt Nam','https://canifa.com',1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(5,'ELISE','Thời trang nữ văn phòng','https://example.com/elise-logo.png','Việt Nam','https://elise.vn',1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(6,'UNIQLO','Thương hiệu thời trang Nhật Bản','https://example.com/uniqlo-logo.png','Nhật Bản','https://uniqlo.com',1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(7,'ZARA','Thương hiệu thời trang Tây Ban Nha','https://example.com/zara-logo.png','Tây Ban Nha','https://zara.com',1,'2025-10-23 08:15:47','2025-10-23 08:15:47');
/*!40000 ALTER TABLE `brands` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupon_usage`
--

DROP TABLE IF EXISTS `coupon_usage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupon_usage` (
  `usage_id` int NOT NULL AUTO_INCREMENT,
  `coupon_id` int NOT NULL,
  `order_id` int NOT NULL,
  `customer_id` int NOT NULL,
  `discount_amount` decimal(10,2) NOT NULL,
  `used_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`usage_id`),
  KEY `order_id` (`order_id`),
  KEY `idx_coupon` (`coupon_id`),
  KEY `idx_customer` (`customer_id`),
  CONSTRAINT `coupon_usage_ibfk_1` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`coupon_id`),
  CONSTRAINT `coupon_usage_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  CONSTRAINT `coupon_usage_ibfk_3` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupon_usage`
--

LOCK TABLES `coupon_usage` WRITE;
/*!40000 ALTER TABLE `coupon_usage` DISABLE KEYS */;
INSERT INTO `coupon_usage` VALUES (1,2,2,2,100000.00,'2025-10-23 08:15:47'),(2,4,4,4,150000.00,'2025-10-23 08:15:47'),(3,4,6,1,200000.00,'2025-10-23 08:15:47');
/*!40000 ALTER TABLE `coupon_usage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `coupon_id` int NOT NULL AUTO_INCREMENT,
  `coupon_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `coupon_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `discount_type` enum('PERCENTAGE','FIXED_AMOUNT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `min_order_amount` decimal(12,2) DEFAULT '0.00',
  `max_discount_amount` decimal(10,2) DEFAULT NULL,
  `usage_limit` int DEFAULT NULL,
  `used_count` int DEFAULT '0',
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`coupon_id`),
  UNIQUE KEY `coupon_code` (`coupon_code`),
  KEY `idx_coupon_code` (`coupon_code`),
  KEY `idx_dates` (`start_date`,`end_date`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
INSERT INTO `coupons` VALUES (1,'WELCOME10','Mã Chào Mừng 10%','Giảm 10% cho đơn hàng đầu tiên','PERCENTAGE',10.00,500000.00,100000.00,1,0,'2025-01-01 00:00:00','2025-12-31 23:59:59',1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(2,'TET2025','Mã Tết 2025','Giảm 100K cho đơn hàng Tết','FIXED_AMOUNT',100000.00,1000000.00,NULL,1000,0,'2025-01-20 00:00:00','2025-02-10 23:59:59',1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(3,'FREESHIP','Miễn Phí Vận Chuyển','Miễn phí vận chuyển','FIXED_AMOUNT',30000.00,300000.00,NULL,NULL,0,'2025-01-01 00:00:00','2025-03-31 23:59:59',1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(4,'VIP20','Mã VIP 20%','Giảm 20% cho khách hàng VIP','PERCENTAGE',20.00,1500000.00,500000.00,NULL,0,'2025-01-01 00:00:00','2025-12-31 23:59:59',1,'2025-10-23 08:15:47','2025-10-23 08:15:47');
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_addresses`
--

DROP TABLE IF EXISTS `customer_addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_addresses` (
  `address_id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `recipient_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address_line` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `ward` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `district` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`address_id`),
  KEY `idx_customer` (`customer_id`),
  CONSTRAINT `customer_addresses_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_addresses`
--

LOCK TABLES `customer_addresses` WRITE;
/*!40000 ALTER TABLE `customer_addresses` DISABLE KEYS */;
INSERT INTO `customer_addresses` VALUES (1,1,'Nguyễn Văn A','0912345678','123 Đường Lê Lợi','Phường Bến Nghé','Quận 1','TP. Hồ Chí Minh',1,'2025-10-23 08:15:47'),(2,1,'Nguyễn Văn A','0912345678','456 Đường Nguyễn Huệ','Phường Bến Thành','Quận 1','TP. Hồ Chí Minh',0,'2025-10-23 08:15:47'),(3,2,'Trần Thị B','0923456789','789 Đường Trần Hưng Đạo','Phường Cầu Ông Lãnh','Quận 1','TP. Hồ Chí Minh',1,'2025-10-23 08:15:47'),(4,3,'Lê Văn C','0934567890','321 Đường Lý Tự Trọng','Phường Phạm Ngũ Lão','Quận 1','TP. Hồ Chí Minh',1,'2025-10-23 08:15:47'),(5,4,'Phạm Thị D','0945678901','654 Đường Pasteur','Phường 6','Quận 3','TP. Hồ Chí Minh',1,'2025-10-23 08:15:47'),(6,5,'Hoàng Văn E','0956789012','987 Đường Võ Văn Tần','Phường 5','Quận 3','TP. Hồ Chí Minh',1,'2025-10-23 08:15:47'),(7,6,'Vương Thị F','0967890123','147 Đường Hai Bà Trưng','Phường Đa Kao','Quận 1','TP. Hồ Chí Minh',1,'2025-10-23 08:15:47'),(8,7,'Đặng Văn G','0978901234','258 Đường Điện Biên Phủ','Phường 6','Quận Bình Thạnh','TP. Hồ Chí Minh',1,'2025-10-23 08:15:47'),(9,8,'Đỗ Thị H','0989012345','369 Đường Xô Viết Nghệ Tĩnh','Phường 21','Quận Bình Thạnh','TP. Hồ Chí Minh',1,'2025-10-23 08:15:47'),(10,9,'Nguyễn Văn Admin','0901234567','123, duong so 1','Phường Hàng Bông','Quận Hoàn Kiếm','Thành phố Hà Nội',0,'2025-10-23 08:56:29'),(11,9,'Nguyễn Văn Admin','0901234567','123, duong so 1','Xã Hương Nhượng','Huyện Lạc Sơn','Tỉnh Hoà Bình',0,'2025-10-23 09:49:27'),(12,9,'Nguyễn Văn Admin','0901234567','123, duong so 1','Phường Cửa Nam','Quận Hoàn Kiếm','Thành phố Hà Nội',0,'2025-10-23 09:51:18'),(13,9,'Nguyễn Văn Admin','0901234567','123, duong so 1','Xã Nam Quan','Huyện Lộc Bình','Tỉnh Lạng Sơn',0,'2025-10-23 09:56:48'),(14,9,'Nguyễn Văn Admin','0901234567','123, duong so 1','Xã Liên Minh','Huyện Võ Nhai','Tỉnh Thái Nguyên',0,'2025-10-24 06:36:01'),(15,9,'Nguyễn Văn Admin','0901234567','123, duong so 1','Xã Thọ Văn','Huyện Tam Nông','Tỉnh Phú Thọ',0,'2025-10-24 06:46:28'),(16,9,'Nguyễn Văn Admin','0901234567','123, duong so 1','Phường Yên Hải','Thị xã Quảng Yên','Tỉnh Quảng Ninh',0,'2025-10-24 08:31:47');
/*!40000 ALTER TABLE `customer_addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `customer_id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gender` enum('MALE','FEMALE','OTHER') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `customer_tier` enum('NEW','REGULAR','VIP','POTENTIAL') COLLATE utf8mb4_unicode_ci DEFAULT 'NEW',
  `total_orders` int DEFAULT '0',
  `total_spent` decimal(15,2) DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`customer_id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_phone` (`phone`),
  KEY `idx_tier` (`customer_tier`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'nguyenvana@gmail.com','0912345678','Nguyễn Văn A','MALE','1990-05-15','VIP',15,18500000.00,NULL,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(2,'tranthib@gmail.com','0923456789','Trần Thị B','FEMALE','1995-08-20','REGULAR',8,6200000.00,NULL,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(3,'levanc@gmail.com','0934567890','Lê Văn C','MALE','1988-12-10','REGULAR',5,3800000.00,NULL,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(4,'phamthid@gmail.com','0945678901','Phạm Thị D','FEMALE','1992-03-25','VIP',12,14300000.00,NULL,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(5,'hoangvane@gmail.com','0956789012','Hoàng Văn E','MALE','1985-07-18','REGULAR',6,4500000.00,NULL,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(6,'vuongthif@gmail.com','0967890123','Vương Thị F','FEMALE','1998-11-05','NEW',2,1200000.00,NULL,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(7,'dangvang@gmail.com','0978901234','Đặng Văn G','MALE','1993-09-30','REGULAR',7,5600000.00,NULL,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(8,'dothih@gmail.com','0989012345','Đỗ Thị H','FEMALE','1996-04-12','POTENTIAL',3,2100000.00,NULL,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(9,'admin@fashionstore.vn','0901234567','Nguyễn Văn Admin',NULL,NULL,'REGULAR',5,1745000.00,NULL,1,'2025-10-23 08:56:29','2025-10-24 09:55:43');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hero_banners`
--

DROP TABLE IF EXISTS `hero_banners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hero_banners` (
  `banner_id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tiêu đề banner',
  `subtitle` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Phụ đề/mô tả',
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'URL hình ảnh',
  `link_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Link khi click banner',
  `button_text` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Text của nút CTA',
  `display_order` int DEFAULT '0' COMMENT 'Thứ tự hiển thị (số nhỏ = ưu tiên)',
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Đang hoạt động?',
  `start_date` datetime DEFAULT NULL COMMENT 'Ngày bắt đầu hiển thị',
  `end_date` datetime DEFAULT NULL COMMENT 'Ngày kết thúc hiển thị',
  `background_color` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Màu nền',
  `text_color` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Màu chữ',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`banner_id`),
  KEY `idx_active_order` (`is_active`,`display_order`),
  KEY `idx_date_range` (`start_date`,`end_date`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hero_banners`
--

LOCK TABLES `hero_banners` WRITE;
/*!40000 ALTER TABLE `hero_banners` DISABLE KEYS */;
INSERT INTO `hero_banners` VALUES (1,'Bộ Sưu Tập Xuân Hè','Khám phá phong cách mới – nhẹ nhàng, năng động và tràn đầy sức sống','https://plus.unsplash.com/premium_photo-1664202526559-e21e9c0fb46a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170','','Xem ngay',0,1,NULL,NULL,'#6366f1','#ffffff','2025-10-20 23:51:52','2025-10-24 15:27:36'),(2,'Bộ Sưu Tập Mùa Đông','Khám phá những xu hướng thời trang mới nhất với chất lượng cao cấp và giá cả phải chăng','https://plus.unsplash.com/premium_photo-1673356302101-e69975f7109a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170','/products','Mua sắm ngay',0,1,'2025-10-20 23:52:07','2025-11-19 23:52:07','#6366f1','#ffffff','2025-10-20 23:52:07','2025-10-24 15:22:00'),(3,'Giảm Giá Đến 50%','Ưu đãi đặc biệt cho khách hàng mới. Áp dụng cho tất cả sản phẩm!','https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800','/products','Xem ngay',1,0,'2025-10-20 23:52:07','2025-11-04 23:52:07','#ec4899','#ffffff','2025-10-20 23:52:07','2025-10-24 15:27:48'),(4,'Thời Trang Công Sở','Sang trọng, lịch sự và chuyên nghiệp. Phù hợp cho môi trường làm việc hiện đại','https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800','/products','Khám phá',2,1,'2025-10-20 23:52:07','2025-12-19 23:52:07','#3b82f6','#ffffff','2025-10-20 23:52:07','2025-10-20 23:52:48'),(5,'Bộ Sưu Tập Mùa Đông','Khám phá những xu hướng thời trang mới nhất với chất lượng cao cấp và giá cả phải chăng','https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800','/products','Mua sắm ngay',0,0,'2025-10-20 23:53:07','2025-11-19 23:53:07','#6366f1','#ffffff','2025-10-20 23:53:07','2025-10-24 15:21:19'),(6,'Giảm Giá Đến 50%','Ưu đãi đặc biệt cho khách hàng mới. Áp dụng cho tất cả sản phẩm!','https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800','/products','Xem ngay',1,1,'2025-10-20 23:53:07','2025-11-04 23:53:07','#ec4899','#ffffff','2025-10-20 23:53:07','2025-10-20 23:53:07'),(7,'Thời Trang Công Sở','Sang trọng, lịch sự và chuyên nghiệp. Phù hợp cho môi trường làm việc hiện đại','https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800','/products','Khám phá',2,0,'2025-10-20 23:53:07','2025-12-19 23:53:07','#3b82f6','#ffffff','2025-10-20 23:53:07','2025-10-20 23:53:07'),(8,'Bộ Sưu Tập Mùa Đông 2024','Khám phá những xu hướng thời trang mới nhất với chất lượng cao cấp và giá cả phải chăng','https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800','/products','Mua sắm ngay',0,0,'2025-10-23 14:16:24','2025-11-22 14:16:24','#6366f1','#ffffff','2025-10-23 14:16:24','2025-10-24 15:23:35'),(9,'Giảm Giá Đến 50%','Ưu đãi đặc biệt cho khách hàng mới. Áp dụng cho tất cả sản phẩm!','https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800','/products','Xem ngay',1,1,'2025-10-23 14:16:24','2025-11-07 14:16:24','#ec4899','#ffffff','2025-10-23 14:16:24','2025-10-23 14:16:24'),(10,'Thời Trang Công Sở','Sang trọng, lịch sự và chuyên nghiệp. Phù hợp cho môi trường làm việc hiện đại','https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800','/products','Khám phá',2,0,'2025-10-23 14:16:24','2025-12-22 14:16:24','#3b82f6','#ffffff','2025-10-23 14:16:24','2025-10-23 14:16:24'),(11,'Bộ Sưu Tập Mùa Đông 2024','Khám phá những xu hướng thời trang mới nhất với chất lượng cao cấp và giá cả phải chăng','https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800','/products','Mua sắm ngay',0,1,'2025-10-23 14:58:36','2025-11-22 14:58:36','#6366f1','#ffffff','2025-10-23 14:58:36','2025-10-23 14:58:36'),(12,'Giảm Giá Đến 50%','Ưu đãi đặc biệt cho khách hàng mới. Áp dụng cho tất cả sản phẩm!','https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800','/products','Xem ngay',1,1,'2025-10-23 14:58:36','2025-11-07 14:58:36','#ec4899','#ffffff','2025-10-23 14:58:36','2025-10-23 14:58:36'),(13,'Thời Trang Công Sở','Sang trọng, lịch sự và chuyên nghiệp. Phù hợp cho môi trường làm việc hiện đại','https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800','/products','Khám phá',2,0,'2025-10-23 14:58:36','2025-12-22 14:58:36','#3b82f6','#ffffff','2025-10-23 14:58:36','2025-10-23 14:58:36'),(14,'Bộ Sưu Tập Mùa Đông 2024','Khám phá những xu hướng thời trang mới nhất với chất lượng cao cấp và giá cả phải chăng','https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800','/products','Mua sắm ngay',0,0,'2025-10-23 14:59:30','2025-11-22 14:59:30','#6366f1','#ffffff','2025-10-23 14:59:30','2025-10-24 15:21:23'),(15,'Giảm Giá Đến 50%','Ưu đãi đặc biệt cho khách hàng mới. Áp dụng cho tất cả sản phẩm!','https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800','/products','Xem ngay',1,1,'2025-10-23 14:59:30','2025-11-07 14:59:30','#ec4899','#ffffff','2025-10-23 14:59:30','2025-10-23 14:59:30'),(16,'Thời Trang Công Sở','Sang trọng, lịch sự và chuyên nghiệp. Phù hợp cho môi trường làm việc hiện đại','https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800','/products','Khám phá',2,0,'2025-10-23 14:59:30','2025-12-22 14:59:30','#3b82f6','#ffffff','2025-10-23 14:59:30','2025-10-23 14:59:30'),(17,'Bộ Sưu Tập Mùa Đông 2024','Khám phá những xu hướng thời trang mới nhất với chất lượng cao cấp và giá cả phải chăng','https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800','/products','Mua sắm ngay',0,0,'2025-10-23 15:00:14','2025-11-22 15:00:14','#6366f1','#ffffff','2025-10-23 15:00:14','2025-10-24 15:23:38'),(18,'Giảm Giá Đến 50%','Ưu đãi đặc biệt cho khách hàng mới. Áp dụng cho tất cả sản phẩm!','https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800','/products','Xem ngay',1,0,'2025-10-23 15:00:14','2025-11-07 15:00:14','#ec4899','#ffffff','2025-10-23 15:00:14','2025-10-24 15:21:07'),(19,'Thời Trang Công Sở','Sang trọng, lịch sự và chuyên nghiệp. Phù hợp cho môi trường làm việc hiện đại','https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800','/products','Khám phá',2,0,'2025-10-23 15:00:14','2025-12-22 15:00:14','#3b82f6','#ffffff','2025-10-23 15:00:14','2025-10-23 15:00:14'),(20,'Bộ Sưu Tập Mùa Đông 2024','Khám phá những xu hướng thời trang mới nhất với chất lượng cao cấp và giá cả phải chăng','https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800','/products','Mua sắm ngay',0,0,'2025-10-23 15:02:30','2025-11-22 15:02:30','#6366f1','#ffffff','2025-10-23 15:02:30','2025-10-24 15:27:45'),(21,'Giảm Giá Đến 50%','Ưu đãi đặc biệt cho khách hàng mới. Áp dụng cho tất cả sản phẩm!','https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800','/products','Xem ngay',1,1,'2025-10-23 15:02:30','2025-11-07 15:02:30','#ec4899','#ffffff','2025-10-23 15:02:30','2025-10-23 15:02:30'),(23,'Bộ Sưu Tập Mùa Đông 2024','Khám phá những xu hướng thời trang mới nhất với chất lượng cao cấp và giá cả phải chăng','https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1171','/products','Mua sắm ngay',0,1,'2025-10-23 15:02:35','2025-11-22 15:02:35','#6366f1','#ffffff','2025-10-23 15:02:35','2025-10-24 15:23:22'),(24,'Giảm Giá Đến 50%','Ưu đãi đặc biệt cho khách hàng mới. Áp dụng cho tất cả sản phẩm!','https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800','/products','Xem ngay',1,1,'2025-10-23 15:02:35','2025-11-07 15:02:35','#ec4899','#ffffff','2025-10-23 15:02:35','2025-10-23 15:02:35'),(25,'Thời Trang Công Sở','Sang trọng, lịch sự và chuyên nghiệp. Phù hợp cho môi trường làm việc hiện đại','https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800','/products','Khám phá',2,0,'2025-10-23 15:02:35','2025-12-22 15:02:35','#3b82f6','#ffffff','2025-10-23 15:02:35','2025-10-23 15:02:35'),(26,'Bộ Sưu Tập Mùa Đông 2024','Khám phá những xu hướng thời trang mới nhất với chất lượng cao cấp và giá cả phải chăng','https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800','/products','Mua sắm ngay',0,1,'2025-10-23 15:12:01','2025-11-22 15:12:01','#6366f1','#ffffff','2025-10-23 15:12:01','2025-10-23 15:12:01'),(27,'Giảm Giá Đến 50%','Ưu đãi đặc biệt cho khách hàng mới. Áp dụng cho tất cả sản phẩm!','https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800','/products','Xem ngay',1,1,'2025-10-23 15:12:01','2025-11-07 15:12:01','#ec4899','#ffffff','2025-10-23 15:12:01','2025-10-23 15:12:01'),(28,'Thời Trang Công Sở','Sang trọng, lịch sự và chuyên nghiệp. Phù hợp cho môi trường làm việc hiện đại','https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800','/products','Khám phá',2,0,'2025-10-23 15:12:01','2025-12-22 15:12:01','#3b82f6','#ffffff','2025-10-23 15:12:01','2025-10-23 15:12:01'),(29,'Bộ Sưu Tập Mùa Đông 2024','Khám phá những xu hướng thời trang mới nhất với chất lượng cao cấp và giá cả phải chăng','https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800','/products','Mua sắm ngay',0,0,'2025-10-23 15:14:58','2025-11-22 15:14:58','#6366f1','#ffffff','2025-10-23 15:14:58','2025-10-24 15:23:30'),(30,'Giảm Giá Đến 50%','Ưu đãi đặc biệt cho khách hàng mới. Áp dụng cho tất cả sản phẩm!','https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800','/products','Xem ngay',1,1,'2025-10-23 15:14:58','2025-11-07 15:14:58','#ec4899','#ffffff','2025-10-23 15:14:58','2025-10-23 15:14:58'),(31,'Thời Trang Công Sở','Sang trọng, lịch sự và chuyên nghiệp. Phù hợp cho môi trường làm việc hiện đại','https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800','/products','Khám phá',2,0,'2025-10-23 15:14:58','2025-12-22 15:14:58','#3b82f6','#ffffff','2025-10-23 15:14:58','2025-10-23 15:14:58'),(32,'Bộ Sưu Tập Mùa Đông 2024','Khám phá những xu hướng thời trang mới nhất với chất lượng cao cấp và giá cả phải chăng','https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800','/products','Mua sắm ngay',0,0,'2025-10-23 15:15:48','2025-11-22 15:15:48','#6366f1','#ffffff','2025-10-23 15:15:48','2025-10-24 15:23:32'),(33,'Giảm Giá Đến 50%','Ưu đãi đặc biệt cho khách hàng mới. Áp dụng cho tất cả sản phẩm!','https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800','/products','Xem ngay',1,1,'2025-10-23 15:15:48','2025-11-07 15:15:48','#ec4899','#ffffff','2025-10-23 15:15:48','2025-10-23 15:15:48');
/*!40000 ALTER TABLE `hero_banners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_transactions`
--

DROP TABLE IF EXISTS `inventory_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_transactions` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `variant_id` int NOT NULL,
  `transaction_type` enum('IN','OUT','ADJUSTMENT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `stock_before` int DEFAULT NULL COMMENT 'Số lượng tồn kho trước giao dịch',
  `stock_after` int DEFAULT NULL COMMENT 'Số lượng tồn kho sau giao dịch',
  `reference_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` int DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`transaction_id`),
  KEY `created_by` (`created_by`),
  KEY `idx_variant_date` (`variant_id`,`created_at`),
  KEY `idx_transaction_type` (`transaction_type`),
  KEY `idx_created_at` (`created_at` DESC),
  CONSTRAINT `inventory_transactions_ibfk_1` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`),
  CONSTRAINT `inventory_transactions_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_transactions`
--

LOCK TABLES `inventory_transactions` WRITE;
/*!40000 ALTER TABLE `inventory_transactions` DISABLE KEYS */;
INSERT INTO `inventory_transactions` VALUES (1,1,'IN',100,NULL,NULL,'purchase_order',1,NULL,5,'2025-10-23 08:15:47'),(2,2,'IN',150,NULL,NULL,'purchase_order',1,NULL,5,'2025-10-23 08:15:47'),(3,8,'IN',200,NULL,NULL,'purchase_order',1,NULL,5,'2025-10-23 08:15:47'),(4,17,'IN',120,NULL,NULL,'purchase_order',1,NULL,5,'2025-10-23 08:15:47'),(5,21,'IN',80,NULL,NULL,'purchase_order',2,NULL,5,'2025-10-23 08:15:47'),(6,32,'IN',100,NULL,NULL,'purchase_order',2,NULL,5,'2025-10-23 08:15:47'),(7,40,'IN',90,NULL,NULL,'purchase_order',2,NULL,5,'2025-10-23 08:15:47'),(8,2,'OUT',-2,NULL,NULL,'order',1,NULL,3,'2025-10-23 08:15:47'),(9,8,'OUT',-1,NULL,NULL,'order',1,NULL,3,'2025-10-23 08:15:47'),(10,17,'OUT',-1,NULL,NULL,'order',1,NULL,3,'2025-10-23 08:15:47'),(11,32,'OUT',-2,NULL,NULL,'order',2,NULL,3,'2025-10-23 08:15:47'),(12,14,'OUT',-1,NULL,NULL,'order',2,NULL,3,'2025-10-23 08:15:47'),(13,24,'OUT',-1,NULL,NULL,'order',2,NULL,3,'2025-10-23 08:15:47'),(14,40,'OUT',-1,NULL,NULL,'order',3,NULL,4,'2025-10-23 08:15:47'),(15,1,'OUT',-1,NULL,NULL,'order',3,NULL,4,'2025-10-23 08:15:47'),(16,10,'OUT',-1,NULL,NULL,'order',3,NULL,4,'2025-10-23 08:15:47'),(17,44,'OUT',-2,NULL,NULL,'order',4,NULL,3,'2025-10-23 08:15:47'),(18,21,'OUT',-1,NULL,NULL,'order',4,NULL,3,'2025-10-23 08:15:47'),(19,25,'OUT',-1,NULL,NULL,'order',4,NULL,3,'2025-10-23 08:15:47'),(20,3,'OUT',-2,NULL,NULL,'order',5,NULL,4,'2025-10-23 08:15:47'),(21,33,'OUT',-2,NULL,NULL,'order',6,NULL,3,'2025-10-23 08:15:47'),(22,48,'OUT',-1,NULL,NULL,'order',6,NULL,3,'2025-10-23 08:15:47'),(23,29,'OUT',-1,NULL,NULL,'order',6,NULL,3,'2025-10-23 08:15:47'),(24,32,'OUT',-1,NULL,NULL,'order',8,NULL,3,'2025-10-23 08:15:47'),(25,40,'OUT',-1,NULL,NULL,'order',8,NULL,3,'2025-10-23 08:15:47'),(26,5,'OUT',-1,NULL,NULL,'order',8,NULL,3,'2025-10-23 08:15:47'),(27,44,'OUT',-2,NULL,NULL,'order',10,NULL,3,'2025-10-23 08:15:47'),(28,17,'OUT',-1,NULL,NULL,'order',10,NULL,3,'2025-10-23 08:15:47'),(29,1,'OUT',1,50,49,'ORDER',14,'Xuất kho cho đơn hàng ORD-20251023-165647-278 (đã giao)',NULL,'2025-10-23 09:57:07'),(30,7,'OUT',1,35,34,'ORDER',15,'Xuất kho cho đơn hàng ORD-20251024-133600-887 (đã giao)',NULL,'2025-10-24 06:36:30'),(31,21,'OUT',1,40,39,'ORDER',16,'Xuất kho cho đơn hàng ORD-20251024-134627-063 (đã giao)',NULL,'2025-10-24 06:47:05'),(32,24,'OUT',1,80,79,'ORDER',17,'Xuất kho cho đơn hàng ORD-20251024-153146-811 (đã giao)',NULL,'2025-10-24 08:32:09'),(33,37,'IN',1,50,51,'ORDER_CANCEL',18,'Hoàn trả hàng do hủy đơn ORD-20251024-164012-106',NULL,'2025-10-24 09:54:22'),(34,24,'IN',1,79,80,'ORDER_CANCEL',17,'Hoàn trả hàng do hủy đơn ORD-20251024-153146-811',NULL,'2025-10-24 09:55:43'),(35,44,'IN',1,45,46,'ORDER_CANCEL',19,'Hoàn trả hàng do hủy đơn ORD-20251024-170029-519',NULL,'2025-10-24 10:00:41'),(36,17,'IN',1,70,71,'ORDER_CANCEL',20,'Hoàn trả hàng do hủy đơn ORD-20251024-170129-314',NULL,'2025-10-24 10:02:05');
/*!40000 ALTER TABLE `inventory_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_details`
--

DROP TABLE IF EXISTS `order_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_details` (
  `order_detail_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `variant_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `total_price` decimal(15,2) GENERATED ALWAYS AS (((`quantity` * `unit_price`) - `discount_amount`)) STORED,
  PRIMARY KEY (`order_detail_id`),
  KEY `idx_order` (`order_id`),
  KEY `idx_variant` (`variant_id`),
  CONSTRAINT `order_details_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `order_details_ibfk_2` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_details`
--

LOCK TABLES `order_details` WRITE;
/*!40000 ALTER TABLE `order_details` DISABLE KEYS */;
INSERT INTO `order_details` (`order_detail_id`, `order_id`, `variant_id`, `quantity`, `unit_price`, `discount_amount`) VALUES (1,1,2,2,299000.00,30000.00),(2,1,8,1,199000.00,10000.00),(3,1,17,1,279000.00,10000.00),(4,2,32,2,499000.00,80000.00),(5,2,14,1,249000.00,20000.00),(6,2,24,1,179000.00,0.00),(7,3,40,1,379000.00,0.00),(8,3,1,1,299000.00,0.00),(9,3,10,1,199000.00,0.00),(10,4,44,2,429000.00,100000.00),(11,4,21,1,399000.00,50000.00),(12,4,25,1,179000.00,0.00),(13,5,3,2,299000.00,0.00),(14,6,33,2,449000.00,100000.00),(15,6,48,1,449000.00,50000.00),(16,6,29,1,499000.00,50000.00),(17,7,8,2,199000.00,0.00),(18,7,12,1,199000.00,0.00),(19,8,32,1,449000.00,40000.00),(20,8,40,1,379000.00,20000.00),(21,8,5,1,349000.00,20000.00),(22,9,24,3,179000.00,0.00),(23,9,10,1,199000.00,0.00),(24,10,44,2,429000.00,80000.00),(25,10,17,1,279000.00,20000.00),(26,11,5,2,299000.00,0.00),(27,12,1,1,299000.00,0.00),(28,13,1,1,299000.00,0.00),(29,14,1,1,299000.00,0.00),(30,15,7,1,299000.00,0.00),(31,16,21,1,399000.00,0.00),(32,17,24,1,149000.00,0.00),(33,18,37,1,399000.00,0.00),(34,19,44,1,379000.00,0.00),(35,20,17,1,279000.00,0.00);
/*!40000 ALTER TABLE `order_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_status_history`
--

DROP TABLE IF EXISTS `order_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_status_history` (
  `history_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `from_status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `to_status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `changed_by` int DEFAULT NULL,
  `changed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`history_id`),
  KEY `changed_by` (`changed_by`),
  KEY `idx_order` (`order_id`),
  CONSTRAINT `order_status_history_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `order_status_history_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_status_history`
--

LOCK TABLES `order_status_history` WRITE;
/*!40000 ALTER TABLE `order_status_history` DISABLE KEYS */;
INSERT INTO `order_status_history` VALUES (1,1,NULL,'PENDING','Đơn hàng được tạo',3,'2025-10-23 08:15:47'),(2,1,'PENDING','CONFIRMED','Xác nhận đơn hàng',3,'2025-10-23 08:15:47'),(3,1,'CONFIRMED','PROCESSING','Đang chuẩn bị hàng',5,'2025-10-23 08:15:47'),(4,1,'PROCESSING','SHIPPING','Đã giao cho đơn vị vận chuyển',5,'2025-10-23 08:15:47'),(5,1,'SHIPPING','DELIVERED','Giao hàng thành công',3,'2025-10-23 08:15:47'),(6,2,NULL,'PENDING','Đơn hàng được tạo',3,'2025-10-23 08:15:47'),(7,2,'PENDING','CONFIRMED','Xác nhận đơn hàng và thanh toán',3,'2025-10-23 08:15:47'),(8,2,'CONFIRMED','PROCESSING','Đang chuẩn bị hàng',5,'2025-10-23 08:15:47'),(9,2,'PROCESSING','SHIPPING','Đã giao cho đơn vị vận chuyển',5,'2025-10-23 08:15:47'),(10,2,'SHIPPING','DELIVERED','Giao hàng thành công',3,'2025-10-23 08:15:47'),(11,3,NULL,'PENDING','Đơn hàng được tạo',4,'2025-10-23 08:15:47'),(12,3,'PENDING','CONFIRMED','Xác nhận đơn hàng',4,'2025-10-23 08:15:47'),(13,3,'CONFIRMED','PROCESSING','Đang chuẩn bị hàng',5,'2025-10-23 08:15:47'),(14,3,'PROCESSING','SHIPPING','Đã giao cho đơn vị vận chuyển',5,'2025-10-23 08:15:47'),(15,4,NULL,'PENDING','Đơn hàng được tạo',3,'2025-10-23 08:15:47'),(16,4,'PENDING','CONFIRMED','Xác nhận đơn hàng và thanh toán Momo',3,'2025-10-23 08:15:47'),(17,4,'CONFIRMED','PROCESSING','Đang chuẩn bị hàng',5,'2025-10-23 08:15:47'),(18,4,'PROCESSING','SHIPPING','Đã giao cho đơn vị vận chuyển',5,'2025-10-23 08:15:47'),(19,4,'SHIPPING','DELIVERED','Giao hàng thành công',3,'2025-10-23 08:15:47'),(20,5,NULL,'PENDING','Đơn hàng được tạo',4,'2025-10-23 08:15:47'),(21,5,'PENDING','CONFIRMED','Xác nhận đơn hàng',4,'2025-10-23 08:15:47'),(22,5,'CONFIRMED','PROCESSING','Đang chuẩn bị hàng',5,'2025-10-23 08:15:47'),(23,6,NULL,'PENDING','Đơn hàng được tạo',3,'2025-10-23 08:15:47'),(24,6,'PENDING','CONFIRMED','Xác nhận đơn hàng và thanh toán',3,'2025-10-23 08:15:47'),(25,7,NULL,'PENDING','Đơn hàng được tạo',4,'2025-10-23 08:15:47'),(26,8,NULL,'PENDING','Đơn hàng được tạo',3,'2025-10-23 08:15:47'),(27,8,'PENDING','CONFIRMED','Xác nhận đơn hàng',3,'2025-10-23 08:15:47'),(28,8,'CONFIRMED','PROCESSING','Đang chuẩn bị hàng',5,'2025-10-23 08:15:47'),(29,8,'PROCESSING','SHIPPING','Đã giao cho đơn vị vận chuyển',5,'2025-10-23 08:15:47'),(30,8,'SHIPPING','DELIVERED','Giao hàng thành công',3,'2025-10-23 08:15:47'),(31,9,NULL,'PENDING','Đơn hàng được tạo',4,'2025-10-23 08:15:47'),(32,9,'PENDING','CANCELLED','Khách hàng hủy đơn',4,'2025-10-23 08:15:47'),(33,10,NULL,'PENDING','Đơn hàng được tạo',3,'2025-10-23 08:15:47'),(34,10,'PENDING','CONFIRMED','Xác nhận đơn hàng',3,'2025-10-23 08:15:47'),(35,10,'CONFIRMED','PROCESSING','Đang chuẩn bị hàng',5,'2025-10-23 08:15:47'),(36,10,'PROCESSING','SHIPPING','Đã giao cho đơn vị vận chuyển',5,'2025-10-23 08:15:47');
/*!40000 ALTER TABLE `order_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` int DEFAULT NULL,
  `order_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('PENDING','CONFIRMED','PROCESSING','SHIPPING','DELIVERED','CANCELLED','RETURNED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `shipping_address_id` int DEFAULT NULL,
  `shipping_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipping_code` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipping_fee` decimal(10,2) DEFAULT '0.00',
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_status` enum('UNPAID','PAID','REFUNDED') COLLATE utf8mb4_unicode_ci DEFAULT 'UNPAID',
  `subtotal` decimal(15,2) NOT NULL,
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `total_amount` decimal(15,2) NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `cancellation_reason` text COLLATE utf8mb4_unicode_ci,
  `return_reason` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `shipping_address_id` (`shipping_address_id`),
  KEY `created_by` (`created_by`),
  KEY `idx_order_number` (`order_number`),
  KEY `idx_status` (`status`),
  KEY `idx_order_date` (`order_date`),
  KEY `idx_customer` (`customer_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`),
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`shipping_address_id`) REFERENCES `customer_addresses` (`address_id`),
  CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'ORD-2025-001',1,'2025-01-21 03:30:00','DELIVERED',1,'Giao hàng nhanh','GHN123456',30000.00,'COD','PAID',897000.00,50000.00,877000.00,NULL,3,'2025-10-23 08:15:47','2025-10-23 08:15:47',NULL,NULL),(2,'ORD-2025-002',2,'2025-01-22 07:20:00','DELIVERED',3,'Giao hàng tiêu chuẩn','GHTK234567',25000.00,'Banking','PAID',1295000.00,100000.00,1220000.00,NULL,3,'2025-10-23 08:15:47','2025-10-23 08:15:47',NULL,NULL),(3,'ORD-2025-003',3,'2025-01-23 02:15:00','SHIPPING',4,'Giao hàng nhanh','GHN345678',30000.00,'COD','UNPAID',796000.00,0.00,826000.00,NULL,4,'2025-10-23 08:15:47','2025-10-23 08:15:47',NULL,NULL),(4,'ORD-2025-004',4,'2025-01-24 09:45:00','DELIVERED',5,'Giao hàng tiêu chuẩn','GHTK456789',25000.00,'Momo','PAID',1427000.00,150000.00,1302000.00,NULL,3,'2025-10-23 08:15:47','2025-10-23 08:15:47',NULL,NULL),(5,'ORD-2025-005',5,'2025-01-25 04:00:00','PROCESSING',6,'Giao hàng nhanh','GHN567890',30000.00,'COD','UNPAID',597000.00,0.00,627000.00,NULL,4,'2025-10-23 08:15:47','2025-10-23 08:15:47',NULL,NULL),(6,'ORD-2025-006',1,'2025-01-26 06:30:00','CONFIRMED',2,'Giao hàng tiêu chuẩn','GHTK678901',25000.00,'Banking','PAID',1696000.00,200000.00,1521000.00,NULL,3,'2025-10-23 08:15:47','2025-10-23 08:15:47',NULL,NULL),(7,'ORD-2025-007',6,'2025-01-27 08:20:00','PENDING',7,'Giao hàng nhanh',NULL,30000.00,'COD','UNPAID',498000.00,0.00,528000.00,NULL,4,'2025-10-23 08:15:47','2025-10-23 08:15:47',NULL,NULL),(8,'ORD-2025-008',7,'2025-01-28 03:10:00','DELIVERED',8,'Giao hàng tiêu chuẩn','GHTK789012',25000.00,'COD','PAID',1177000.00,80000.00,1122000.00,NULL,3,'2025-10-23 08:15:47','2025-10-23 08:15:47',NULL,NULL),(9,'ORD-2025-009',8,'2025-01-29 07:50:00','CANCELLED',9,'Giao hàng nhanh',NULL,30000.00,'Banking','UNPAID',757000.00,0.00,787000.00,NULL,4,'2025-10-23 08:15:47','2025-10-23 08:15:47',NULL,NULL),(10,'ORD-2025-010',4,'2025-01-30 02:30:00','SHIPPING',5,'Giao hàng nhanh','GHN890123',30000.00,'COD','UNPAID',1096000.00,100000.00,1026000.00,NULL,3,'2025-10-23 08:15:47','2025-10-23 08:15:47',NULL,NULL),(11,'ORD-20251023-155628-080',9,'2025-10-23 08:56:29','DELIVERED',10,'STANDARD',NULL,0.00,'COD','UNPAID',598000.00,0.00,598000.00,'',NULL,'2025-10-23 08:56:29','2025-10-23 08:57:07',NULL,NULL),(12,'ORD-20251023-164927-395',9,'2025-10-23 09:49:27','DELIVERED',11,'STANDARD',NULL,30000.00,'COD','PAID',299000.00,0.00,329000.00,'',NULL,'2025-10-23 09:49:27','2025-10-23 09:49:47',NULL,NULL),(13,'ORD-20251023-165117-727',9,'2025-10-23 09:51:18','DELIVERED',12,'STANDARD',NULL,30000.00,'COD','PAID',299000.00,0.00,329000.00,'',NULL,'2025-10-23 09:51:18','2025-10-23 09:51:32',NULL,NULL),(14,'ORD-20251023-165647-278',9,'2025-10-23 09:56:48','DELIVERED',13,'STANDARD',NULL,30000.00,'COD','PAID',299000.00,0.00,329000.00,'',NULL,'2025-10-23 09:56:48','2025-10-23 09:57:07',NULL,NULL),(15,'ORD-20251024-133600-887',9,'2025-10-24 06:36:01','DELIVERED',14,'STANDARD',NULL,30000.00,'COD','PAID',299000.00,0.00,329000.00,'',NULL,'2025-10-24 06:36:01','2025-10-24 06:36:30',NULL,NULL),(16,'ORD-20251024-134627-063',9,'2025-10-24 06:46:28','DELIVERED',15,'STANDARD',NULL,30000.00,'COD','PAID',399000.00,0.00,429000.00,'',NULL,'2025-10-24 06:46:28','2025-10-24 06:47:05',NULL,NULL),(17,'ORD-20251024-153146-811',9,'2025-10-24 08:31:47','RETURNED',16,'STANDARD',NULL,30000.00,'COD','REFUNDED',149000.00,0.00,179000.00,'',NULL,'2025-10-24 08:31:47','2025-10-24 09:55:43',NULL,NULL),(18,'ORD-20251024-164012-106',9,'2025-10-24 09:40:12','CANCELLED',16,'STANDARD',NULL,30000.00,'COD','UNPAID',399000.00,0.00,429000.00,'',NULL,'2025-10-24 09:40:12','2025-10-24 09:54:22',NULL,NULL),(19,'ORD-20251024-170029-519',9,'2025-10-24 10:00:30','CANCELLED',11,'STANDARD',NULL,30000.00,'COD','UNPAID',379000.00,0.00,409000.00,'',NULL,'2025-10-24 10:00:30','2025-10-24 10:00:41',NULL,NULL),(20,'ORD-20251024-170129-314',9,'2025-10-24 10:01:29','CANCELLED',11,'STANDARD',NULL,30000.00,'COD','UNPAID',279000.00,0.00,309000.00,'giao vào buổi trưa',NULL,'2025-10-24 10:01:29','2025-10-24 10:02:05',NULL,NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `permission_id` int NOT NULL AUTO_INCREMENT,
  `permission_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `module` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`permission_id`),
  UNIQUE KEY `permission_name` (`permission_name`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES (1,'VIEW_PRODUCTS','Xem danh sách sản phẩm','PRODUCT'),(2,'CREATE_PRODUCT','Tạo sản phẩm mới','PRODUCT'),(3,'EDIT_PRODUCT','Chỉnh sửa sản phẩm','PRODUCT'),(4,'DELETE_PRODUCT','Xóa sản phẩm','PRODUCT'),(5,'VIEW_ORDERS','Xem đơn hàng','ORDER'),(6,'CREATE_ORDER','Tạo đơn hàng','ORDER'),(7,'EDIT_ORDER','Chỉnh sửa đơn hàng','ORDER'),(8,'CANCEL_ORDER','Hủy đơn hàng','ORDER'),(9,'VIEW_CUSTOMERS','Xem khách hàng','CUSTOMER'),(10,'MANAGE_CUSTOMERS','Quản lý khách hàng','CUSTOMER'),(11,'VIEW_INVENTORY','Xem tồn kho','INVENTORY'),(12,'MANAGE_INVENTORY','Quản lý tồn kho','INVENTORY'),(13,'VIEW_REPORTS','Xem báo cáo','REPORT'),(14,'MANAGE_USERS','Quản lý người dùng','USER'),(15,'MANAGE_SETTINGS','Quản lý cấu hình','SYSTEM');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_categories`
--

DROP TABLE IF EXISTS `product_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_category_id` int DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`category_id`),
  KEY `parent_category_id` (`parent_category_id`),
  KEY `idx_category_name` (`category_name`),
  CONSTRAINT `product_categories_ibfk_1` FOREIGN KEY (`parent_category_id`) REFERENCES `product_categories` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_categories`
--

LOCK TABLES `product_categories` WRITE;
/*!40000 ALTER TABLE `product_categories` DISABLE KEYS */;
INSERT INTO `product_categories` VALUES (1,'Áo Nam',NULL,'Các loại áo dành cho nam',1,'2025-10-23 08:15:47'),(2,'Áo Nữ',NULL,'Các loại áo dành cho nữ',1,'2025-10-23 08:15:47'),(3,'Quần Nam',NULL,'Các loại quần dành cho nam',1,'2025-10-23 08:15:47'),(4,'Quần Nữ',NULL,'Các loại quần dành cho nữ',1,'2025-10-23 08:15:47'),(5,'Phụ Kiện',NULL,'Phụ kiện thời trang',1,'2025-10-23 08:15:47'),(6,'Áo Sơ Mi Nam',1,'Áo sơ mi nam công sở và casual',1,'2025-10-23 08:15:47'),(7,'Áo Thun Nam',1,'Áo thun nam các loại',1,'2025-10-23 08:15:47'),(8,'Áo Polo Nam',1,'Áo polo nam',1,'2025-10-23 08:15:47'),(9,'Áo Sơ Mi Nữ',2,'Áo sơ mi nữ công sở và dạo phố',1,'2025-10-23 08:15:47'),(10,'Áo Thun Nữ',2,'Áo thun nữ các loại',1,'2025-10-23 08:15:47'),(11,'Váy',2,'Váy đầm nữ',1,'2025-10-23 08:15:47'),(12,'Quần Jeans Nam',3,'Quần jean nam các kiểu',1,'2025-10-23 08:15:47'),(13,'Quần Kaki Nam',3,'Quần kaki nam',1,'2025-10-23 08:15:47'),(14,'Quần Jeans Nữ',4,'Quần jean nữ các kiểu',1,'2025-10-23 08:15:47'),(15,'Quần Âu Nữ',4,'Quần âu nữ công sở',1,'2025-10-23 08:15:47');
/*!40000 ALTER TABLE `product_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `image_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `variant_id` int DEFAULT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`image_id`),
  KEY `idx_product` (`product_id`),
  KEY `idx_variant` (`variant_id`),
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `product_images_ibfk_2` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (19,11,NULL,'https://example.com/products/qk-nam-001-main.jpg',1,1,'2025-10-23 08:15:47'),(22,1,NULL,'https://cdn.hstatic.net/products/200000588671/dsc02233_c53955e1f6e948de8b5a42e71f242003_grande.jpg',0,0,'2025-10-24 08:48:23'),(24,1,NULL,'https://cdn.hstatic.net/products/200000588671/dsc02235_0470455602504070a52fffa0a231d38f_master.jpg',0,0,'2025-10-24 08:49:01'),(25,2,NULL,'https://salt.tikicdn.com/cache/750x750/ts/product/2c/10/8f/fb76860521e365f7421d34d458db9bb6.png.webp',0,0,'2025-10-24 08:50:30'),(26,3,NULL,'https://salt.tikicdn.com/cache/750x750/ts/product/ce/c1/b7/6e53717818c6bcb019abbd830c053bde.png.webp',0,0,'2025-10-24 08:51:43'),(27,4,NULL,'https://bizweb.dktcdn.net/100/055/043/products/na29-navy.jpg?v=1703068964930',0,0,'2025-10-24 08:56:01'),(28,5,NULL,'https://salt.tikicdn.com/cache/750x750/ts/product/6a/62/19/cfffc56394e865a5d594d35b0342da96.png.webp',0,0,'2025-10-24 08:57:10'),(29,5,NULL,'https://salt.tikicdn.com/cache/750x750/ts/product/03/d7/b5/a031adb376387276a6d2be53daffed61.jpg.webp',0,0,'2025-10-24 08:57:20'),(30,6,NULL,'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/424658/item/goods_00_424658_3x4.jpg?width=423',0,0,'2025-10-24 08:59:11'),(31,7,NULL,'https://vn-live-01.slatic.net/p/f5b4661b024693417389f424e30c6356.jpg',0,0,'2025-10-24 09:00:57'),(32,8,NULL,'https://salt.tikicdn.com/cache/750x750/ts/product/98/16/9a/df77321992e4d0be0a5432b82be37324.jpg.webp',0,0,'2025-10-24 09:01:41'),(33,9,NULL,'https://salt.tikicdn.com/cache/750x750/ts/product/f1/c7/58/4454005555f8d29af6028c0016fcc20c.png.webp',0,0,'2025-10-24 09:02:28'),(34,10,NULL,'https://salt.tikicdn.com/cache/750x750/ts/product/90/f6/9b/e8b222826e5467507df45492bbb54c53.jpg.webp',0,0,'2025-10-24 09:03:12'),(35,12,NULL,'https://salt.tikicdn.com/cache/750x750/ts/product/51/17/83/92af85515b5b1e8f847b8c6da1ee76d1.jpg.webp',0,0,'2025-10-24 09:04:15'),(36,13,NULL,'https://salt.tikicdn.com/cache/750x750/ts/product/26/6d/d0/0e1a949007f2f446952b4bd90d8f9d88.jpg.webp',0,0,'2025-10-24 09:04:51');
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variants`
--

DROP TABLE IF EXISTS `product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variants` (
  `variant_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `color` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `size` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `variant_sku` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cost_price` decimal(12,2) DEFAULT NULL,
  `retail_price` decimal(12,2) NOT NULL,
  `sale_price` decimal(12,2) DEFAULT NULL,
  `stock_quantity` int DEFAULT '0',
  `min_stock_threshold` int DEFAULT '10',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`variant_id`),
  UNIQUE KEY `variant_sku` (`variant_sku`),
  KEY `idx_variant_sku` (`variant_sku`),
  KEY `idx_stock` (`stock_quantity`),
  KEY `idx_product` (`product_id`),
  CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variants`
--

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
INSERT INTO `product_variants` VALUES (1,1,'Trắng','S','ASM-NAM-001-TR-S',150000.00,299000.00,NULL,49,10,1,'2025-10-23 08:15:47','2025-10-23 09:57:07'),(2,1,'Trắng','M','ASM-NAM-001-TR-M',150000.00,299000.00,NULL,80,10,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(3,1,'Trắng','L','ASM-NAM-001-TR-L',150000.00,299000.00,NULL,60,10,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(4,1,'Trắng','XL','ASM-NAM-001-TR-XL',150000.00,299000.00,NULL,40,10,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(5,2,'Xanh Dương','M','ASM-NAM-002-XD-M',180000.00,349000.00,299000.00,45,10,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(6,2,'Xanh Dương','L','ASM-NAM-002-XD-L',180000.00,349000.00,299000.00,55,10,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(7,2,'Xanh Dương','XL','ASM-NAM-002-XD-XL',180000.00,349000.00,299000.00,34,10,1,'2025-10-23 08:15:47','2025-10-24 06:36:30'),(8,3,'Đen','M','AT-NAM-001-DE-M',80000.00,199000.00,NULL,100,15,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(9,3,'Đen','L','AT-NAM-001-DE-L',80000.00,199000.00,NULL,90,15,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(10,3,'Trắng','M','AT-NAM-001-TR-M',80000.00,199000.00,NULL,95,15,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(11,3,'Trắng','L','AT-NAM-001-TR-L',80000.00,199000.00,NULL,85,15,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(12,3,'Xám','M','AT-NAM-001-XA-M',80000.00,199000.00,NULL,75,15,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(13,3,'Xám','L','AT-NAM-001-XA-L',80000.00,199000.00,NULL,70,15,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(14,4,'Đen','M','AT-NAM-002-DE-M',100000.00,249000.00,199000.00,60,10,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(15,4,'Đen','L','AT-NAM-002-DE-L',100000.00,249000.00,199000.00,50,10,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(16,4,'Trắng','M','AT-NAM-002-TR-M',100000.00,249000.00,199000.00,55,10,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(17,5,'Đen','M','AP-NAM-001-DE-M',120000.00,279000.00,NULL,71,10,1,'2025-10-23 08:15:47','2025-10-24 10:02:05'),(18,5,'Đen','L','AP-NAM-001-DE-L',120000.00,279000.00,NULL,65,10,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(19,5,'Navy','M','AP-NAM-001-NV-M',120000.00,279000.00,NULL,60,10,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(20,5,'Navy','L','AP-NAM-001-NV-L',120000.00,279000.00,NULL,55,10,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(21,6,'Trắng','S','ASM-NU-001-TR-S',180000.00,399000.00,NULL,39,8,1,'2025-10-23 08:15:47','2025-10-24 06:47:05'),(22,6,'Trắng','M','ASM-NU-001-TR-M',180000.00,399000.00,NULL,50,8,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(23,6,'Trắng','L','ASM-NU-001-TR-L',180000.00,399000.00,NULL,35,8,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(24,7,'Đen','S','AT-NU-001-DE-S',70000.00,179000.00,149000.00,80,12,1,'2025-10-23 08:15:47','2025-10-24 09:55:43'),(25,7,'Đen','M','AT-NU-001-DE-M',70000.00,179000.00,149000.00,75,12,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(26,7,'Trắng','S','AT-NU-001-TR-S',70000.00,179000.00,149000.00,70,12,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(27,7,'Trắng','M','AT-NU-001-TR-M',70000.00,179000.00,149000.00,65,12,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(28,8,'Đen','S','VAY-001-DE-S',200000.00,499000.00,NULL,30,8,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(29,8,'Đen','M','VAY-001-DE-M',200000.00,499000.00,NULL,35,8,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(30,8,'Navy','S','VAY-001-NV-S',200000.00,499000.00,NULL,25,8,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(31,8,'Navy','M','VAY-001-NV-M',200000.00,499000.00,NULL,30,8,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(32,9,'Xanh Đậm','30','QJ-NAM-001-XD-30',200000.00,449000.00,399000.00,45,10,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(33,9,'Xanh Đậm','31','QJ-NAM-001-XD-31',200000.00,449000.00,399000.00,50,10,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(34,9,'Xanh Đậm','32','QJ-NAM-001-XD-32',200000.00,449000.00,399000.00,55,10,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(35,9,'Đen','30','QJ-NAM-001-DE-30',200000.00,449000.00,399000.00,40,10,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(36,9,'Đen','31','QJ-NAM-001-DE-31',200000.00,449000.00,399000.00,45,10,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(37,10,'Xanh Nhạt','31','QJ-NAM-002-XN-31',180000.00,399000.00,NULL,51,10,1,'2025-10-23 08:15:47','2025-10-24 09:54:22'),(38,10,'Xanh Nhạt','32','QJ-NAM-002-XN-32',180000.00,399000.00,NULL,55,10,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(39,10,'Xanh Nhạt','33','QJ-NAM-002-XN-33',180000.00,399000.00,NULL,45,10,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(40,11,'Be','30','QK-NAM-001-BE-30',160000.00,379000.00,NULL,40,10,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(41,11,'Be','31','QK-NAM-001-BE-31',160000.00,379000.00,NULL,45,10,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(42,11,'Navy','30','QK-NAM-001-NV-30',160000.00,379000.00,NULL,35,10,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(43,11,'Navy','31','QK-NAM-001-NV-31',160000.00,379000.00,NULL,40,10,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(44,12,'Xanh Đậm','27','QJ-NU-001-XD-27',190000.00,429000.00,379000.00,46,10,1,'2025-10-23 08:15:47','2025-10-24 10:00:41'),(45,12,'Xanh Đậm','28','QJ-NU-001-XD-28',190000.00,429000.00,379000.00,50,10,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(46,12,'Xanh Đậm','29','QJ-NU-001-XD-29',190000.00,429000.00,379000.00,40,10,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(47,12,'Đen','27','QJ-NU-001-DE-27',190000.00,429000.00,379000.00,35,10,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(48,13,'Đen','S','QA-NU-001-DE-S',170000.00,449000.00,NULL,30,8,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(49,13,'Đen','M','QA-NU-001-DE-M',170000.00,449000.00,NULL,35,8,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(50,13,'Navy','S','QA-NU-001-NV-S',170000.00,449000.00,NULL,28,8,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(51,13,'Navy','M','QA-NU-001-NV-M',170000.00,449000.00,NULL,32,8,1,'2025-10-23 08:15:47','2025-10-23 08:15:47');
/*!40000 ALTER TABLE `product_variants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `sku` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` int DEFAULT NULL,
  `brand_id` int DEFAULT NULL,
  `material` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `care_instructions` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `created_by` (`created_by`),
  KEY `idx_product_name` (`product_name`),
  KEY `idx_sku` (`sku`),
  KEY `idx_category` (`category_id`),
  KEY `idx_brand` (`brand_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`category_id`),
  CONSTRAINT `products_ibfk_2` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`brand_id`),
  CONSTRAINT `products_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'ASM-NAM-001','Áo Sơ Mi Nam Oxford Trắng',6,3,'Cotton 100%','Áo sơ mi nam Oxford trắng basic, phù hợp công sở và dạo phố','Giặt máy ở nhiệt độ 30°C, không tẩy, là ở nhiệt độ trung bình',1,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(2,'ASM-NAM-002','Áo Sơ Mi Nam Kẻ Sọc Xanh',6,2,'Cotton 95%, Spandex 5%','Áo sơ mi nam kẻ sọc xanh dương, form slim fit hiện đại','Giặt tay, không vắt mạnh, phơi nơi thoáng mát',1,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(3,'AT-NAM-001','Áo Thun Nam Basic Trơn',7,2,'Cotton 100%','Áo thun nam basic nhiều màu, form regular thoải mái','Giặt máy bình thường, có thể sấy khô',1,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(4,'AT-NAM-002','Áo Thun Nam In Họa Tiết',7,1,'Cotton 95%, Polyester 5%','Áo thun nam in họa tiết thời trang, chất liệu thoáng mát','Giặt máy 30°C, lộn trái khi giặt để bảo vệ họa tiết',1,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(5,'AP-NAM-001','Áo Polo Nam Pique',8,4,'Cotton Pique 100%','Áo polo nam pique cao cấp, nhiều màu sắc lựa chọn','Giặt máy 40°C, không tẩy, là nhiệt độ thấp',1,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(6,'ASM-NU-001','Áo Sơ Mi Nữ Tay Dài Trắng',9,5,'Vải lụa Hàn Quốc','Áo sơ mi nữ tay dài trắng công sở sang trọng','Giặt tay hoặc giặt khô, là ở nhiệt độ thấp',1,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(7,'AT-NU-001','Áo Thun Nữ Croptop',10,6,'Cotton 90%, Spandex 10%','Áo thun nữ croptop năng động, trẻ trung','Giặt máy 30°C, không sấy khô',1,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(8,'VAY-001','Váy Suông Nữ Midi',11,5,'Vải lụa tơ tằm','Váy suông nữ dáng midi thanh lịch','Giặt khô, tránh ánh nắng trực tiếp',1,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(9,'QJ-NAM-001','Quần Jean Nam Slim Fit',12,2,'Denim 98%, Spandex 2%','Quần jean nam slim fit co giãn tốt','Giặt máy 40°C, lộn trái khi giặt',1,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(10,'QJ-NAM-002','Quần Jean Nam Regular Fit',12,4,'Denim 100%','Quần jean nam regular fit form rộng thoải mái','Giặt tay lần đầu, sau đó có thể giặt máy',1,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(11,'QK-NAM-001','Quần Kaki Nam Slim',13,3,'Kaki 97%, Spandex 3%','Quần kaki nam slim fit cao cấp','Giặt máy 40°C, là nhiệt độ trung bình',1,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(12,'QJ-NU-001','Quần Jean Nữ Skinny',14,6,'Denim 96%, Spandex 4%','Quần jean nữ skinny ôm dáng hoàn hảo','Giặt máy 30°C, lộn trái',1,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(13,'QA-NU-001','Quần Âu Nữ Ống Đứng',15,5,'Vải tuyết mưa cao cấp','Quần âu nữ ống đứng công sở','Giặt khô hoặc giặt tay, là nhiệt độ trung bình',1,1,'2025-10-23 08:15:47','2025-10-23 08:15:47');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotion_products`
--

DROP TABLE IF EXISTS `promotion_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotion_products` (
  `promotion_product_id` int NOT NULL AUTO_INCREMENT,
  `promotion_id` int NOT NULL,
  `product_id` int NOT NULL,
  `discount_percentage` decimal(5,2) DEFAULT NULL,
  `discount_fixed_amount` decimal(10,2) DEFAULT NULL,
  `min_quantity` int DEFAULT '1',
  `max_quantity` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`promotion_product_id`),
  UNIQUE KEY `unique_promotion_product` (`promotion_id`,`product_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `promotion_products_ibfk_1` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`promotion_id`) ON DELETE CASCADE,
  CONSTRAINT `promotion_products_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotion_products`
--

LOCK TABLES `promotion_products` WRITE;
/*!40000 ALTER TABLE `promotion_products` DISABLE KEYS */;
INSERT INTO `promotion_products` VALUES (1,1,2,15.00,NULL,1,NULL,'2025-10-23 08:15:48'),(2,1,4,20.00,NULL,1,NULL,'2025-10-23 08:15:48'),(3,1,7,10.00,NULL,1,NULL,'2025-10-23 08:15:48'),(4,1,9,15.00,NULL,1,NULL,'2025-10-23 08:15:48'),(5,1,12,15.00,NULL,1,NULL,'2025-10-23 08:15:48');
/*!40000 ALTER TABLE `promotion_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotions`
--

DROP TABLE IF EXISTS `promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotions` (
  `promotion_id` int NOT NULL AUTO_INCREMENT,
  `promotion_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `promotion_type` enum('PRODUCT_DISCOUNT','BUY_X_GET_Y','BUNDLE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`promotion_id`),
  KEY `idx_dates` (`start_date`,`end_date`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotions`
--

LOCK TABLES `promotions` WRITE;
/*!40000 ALTER TABLE `promotions` DISABLE KEYS */;
INSERT INTO `promotions` VALUES (1,'Sale cuối mùa','Giảm giá hàng loạt sản phẩm cuối mùa','PRODUCT_DISCOUNT','2025-02-15 00:00:00','2025-02-28 23:59:59',1,'2025-10-23 08:15:47'),(2,'Mua 1 tặng 1','Mua 1 áo thun tặng 1 áo thun cùng loại','BUY_X_GET_Y','2025-03-01 00:00:00','2025-03-15 23:59:59',1,'2025-10-23 08:15:47');
/*!40000 ALTER TABLE `promotions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_order_details`
--

DROP TABLE IF EXISTS `purchase_order_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_order_details` (
  `po_detail_id` int NOT NULL AUTO_INCREMENT,
  `po_id` int NOT NULL,
  `variant_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `total_price` decimal(15,2) GENERATED ALWAYS AS ((`quantity` * `unit_price`)) STORED,
  `received_quantity` int DEFAULT '0',
  `expected_receive_date` date DEFAULT NULL COMMENT 'Ngày dự kiến nhận',
  `actual_receive_date` date DEFAULT NULL COMMENT 'Ngày nhận thực tế',
  `quality_check_status` enum('PENDING','PASSED','FAILED','PARTIAL') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING' COMMENT 'Trạng thái kiểm tra chất lượng',
  `rejected_quantity` int DEFAULT '0' COMMENT 'Số lượng bị từ chối',
  `notes` text COLLATE utf8mb4_unicode_ci COMMENT 'Ghi chú chi tiết',
  PRIMARY KEY (`po_detail_id`),
  KEY `idx_po` (`po_id`),
  KEY `idx_variant` (`variant_id`),
  CONSTRAINT `purchase_order_details_ibfk_1` FOREIGN KEY (`po_id`) REFERENCES `purchase_orders` (`po_id`) ON DELETE CASCADE,
  CONSTRAINT `purchase_order_details_ibfk_2` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_order_details`
--

LOCK TABLES `purchase_order_details` WRITE;
/*!40000 ALTER TABLE `purchase_order_details` DISABLE KEYS */;
INSERT INTO `purchase_order_details` (`po_detail_id`, `po_id`, `variant_id`, `quantity`, `unit_price`, `received_quantity`, `expected_receive_date`, `actual_receive_date`, `quality_check_status`, `rejected_quantity`, `notes`) VALUES (1,1,1,100,150000.00,100,NULL,NULL,'PENDING',0,NULL),(2,1,2,150,150000.00,150,NULL,NULL,'PENDING',0,NULL),(3,1,8,200,80000.00,200,NULL,NULL,'PENDING',0,NULL),(4,1,17,120,120000.00,120,NULL,NULL,'PENDING',0,NULL),(5,2,21,80,180000.00,80,NULL,NULL,'PENDING',0,NULL),(6,2,32,100,200000.00,100,NULL,NULL,'PENDING',0,NULL),(7,2,40,90,160000.00,90,NULL,NULL,'PENDING',0,NULL),(8,3,29,70,200000.00,0,NULL,NULL,'PENDING',0,NULL),(9,3,44,85,190000.00,0,NULL,NULL,'PENDING',0,NULL),(10,3,48,60,170000.00,0,NULL,NULL,'PENDING',0,NULL),(11,4,5,80,180000.00,0,NULL,NULL,'PENDING',0,NULL),(12,4,14,100,100000.00,0,NULL,NULL,'PENDING',0,NULL);
/*!40000 ALTER TABLE `purchase_order_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase_orders`
--

DROP TABLE IF EXISTS `purchase_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase_orders` (
  `po_id` int NOT NULL AUTO_INCREMENT,
  `po_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplier_id` int NOT NULL,
  `order_date` date NOT NULL,
  `expected_date` date DEFAULT NULL,
  `received_date` date DEFAULT NULL,
  `total_amount` decimal(15,2) DEFAULT NULL,
  `status` enum('PENDING','APPROVED','RECEIVED','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` int DEFAULT NULL,
  `approved_by` int DEFAULT NULL COMMENT 'Người phê duyệt PO',
  `approved_at` timestamp NULL DEFAULT NULL COMMENT 'Thời gian phê duyệt',
  `received_by` int DEFAULT NULL COMMENT 'Người nhận hàng',
  `is_auto_generated` tinyint(1) DEFAULT '0' COMMENT 'PO tự động từ suggestion',
  `suggestion_id` int DEFAULT NULL COMMENT 'ID đề xuất gốc',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`po_id`),
  UNIQUE KEY `po_number` (`po_number`),
  KEY `supplier_id` (`supplier_id`),
  KEY `created_by` (`created_by`),
  KEY `idx_po_number` (`po_number`),
  KEY `idx_status` (`status`),
  KEY `idx_order_date` (`order_date`),
  KEY `fk_po_approved_by` (`approved_by`),
  KEY `fk_po_received_by` (`received_by`),
  KEY `fk_po_suggestion` (`suggestion_id`),
  CONSTRAINT `fk_po_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fk_po_received_by` FOREIGN KEY (`received_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fk_po_suggestion` FOREIGN KEY (`suggestion_id`) REFERENCES `reorder_suggestions` (`suggestion_id`),
  CONSTRAINT `purchase_orders_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`),
  CONSTRAINT `purchase_orders_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase_orders`
--

LOCK TABLES `purchase_orders` WRITE;
/*!40000 ALTER TABLE `purchase_orders` DISABLE KEYS */;
INSERT INTO `purchase_orders` VALUES (1,'PO-2025-001',1,'2025-01-05','2025-01-20','2025-01-18',45000000.00,'RECEIVED',NULL,5,NULL,NULL,NULL,0,NULL,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(2,'PO-2025-002',2,'2025-01-10','2025-01-25','2025-01-24',38500000.00,'RECEIVED',NULL,5,NULL,NULL,NULL,0,NULL,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(3,'PO-2025-003',3,'2025-01-15','2025-02-01',NULL,52000000.00,'APPROVED',NULL,5,NULL,NULL,NULL,0,NULL,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(4,'PO-2025-004',4,'2025-01-20','2025-02-05',NULL,28000000.00,'PENDING',NULL,5,NULL,NULL,NULL,0,NULL,'2025-10-23 08:15:47','2025-10-23 08:15:47');
/*!40000 ALTER TABLE `purchase_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `related_products`
--

DROP TABLE IF EXISTS `related_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `related_products` (
  `relation_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `related_product_id` int NOT NULL,
  `relation_type` enum('similar','complement','alternative') COLLATE utf8mb4_unicode_ci DEFAULT 'similar',
  `display_order` int DEFAULT '0',
  PRIMARY KEY (`relation_id`),
  UNIQUE KEY `unique_relation` (`product_id`,`related_product_id`),
  KEY `related_product_id` (`related_product_id`),
  KEY `idx_product` (`product_id`),
  CONSTRAINT `related_products_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `related_products_ibfk_2` FOREIGN KEY (`related_product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `related_products`
--

LOCK TABLES `related_products` WRITE;
/*!40000 ALTER TABLE `related_products` DISABLE KEYS */;
INSERT INTO `related_products` VALUES (1,1,11,'complement',0),(2,2,11,'complement',0),(3,9,3,'complement',0),(4,9,5,'complement',0),(5,10,3,'complement',0),(6,10,5,'complement',0),(7,13,6,'complement',0);
/*!40000 ALTER TABLE `related_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reorder_suggestions`
--

DROP TABLE IF EXISTS `reorder_suggestions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reorder_suggestions` (
  `suggestion_id` int NOT NULL AUTO_INCREMENT,
  `variant_id` int NOT NULL,
  `supplier_id` int DEFAULT NULL,
  `current_stock` int NOT NULL,
  `min_stock` int NOT NULL,
  `avg_daily_sales` decimal(10,2) DEFAULT NULL,
  `suggested_quantity` int NOT NULL,
  `suggested_unit_price` decimal(12,2) DEFAULT NULL,
  `lead_time_days` int DEFAULT '7',
  `priority` enum('LOW','MEDIUM','HIGH','URGENT') COLLATE utf8mb4_unicode_ci DEFAULT 'MEDIUM',
  `status` enum('PENDING','APPROVED','ORDERED','REJECTED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `po_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`suggestion_id`),
  KEY `supplier_id` (`supplier_id`),
  KEY `po_id` (`po_id`),
  KEY `created_by` (`created_by`),
  KEY `idx_status` (`status`),
  KEY `idx_priority` (`priority`),
  KEY `idx_variant` (`variant_id`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `reorder_suggestions_ibfk_1` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`) ON DELETE CASCADE,
  CONSTRAINT `reorder_suggestions_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`),
  CONSTRAINT `reorder_suggestions_ibfk_3` FOREIGN KEY (`po_id`) REFERENCES `purchase_orders` (`po_id`),
  CONSTRAINT `reorder_suggestions_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng đề xuất nhập hàng - tự động tính toán dựa trên lịch sử bán hàng';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reorder_suggestions`
--

LOCK TABLES `reorder_suggestions` WRITE;
/*!40000 ALTER TABLE `reorder_suggestions` DISABLE KEYS */;
/*!40000 ALTER TABLE `reorder_suggestions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `role_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `permission_id` (`permission_id`),
  CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE,
  CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`permission_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
INSERT INTO `role_permissions` VALUES (1,1),(2,1),(3,1),(4,1),(5,1),(6,1),(1,2),(2,2),(1,3),(2,3),(1,4),(1,5),(2,5),(3,5),(5,5),(6,5),(1,6),(2,6),(3,6),(6,6),(1,7),(2,7),(3,7),(1,8),(2,8),(1,9),(2,9),(3,9),(5,9),(1,10),(2,10),(1,11),(2,11),(3,11),(4,11),(5,11),(1,12),(2,12),(4,12),(1,13),(2,13),(5,13),(1,14),(1,15);
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'ADMIN','Quản trị viên hệ thống - Toàn quyền','2025-10-23 08:15:47'),(2,'MANAGER','Quản lý cửa hàng - Quản lý nhân viên và vận hành','2025-10-23 08:15:47'),(3,'SALES','Nhân viên bán hàng - Xử lý đơn hàng và tư vấn','2025-10-23 08:15:47'),(4,'WAREHOUSE','Nhân viên kho - Quản lý tồn kho và nhập xuất','2025-10-23 08:15:47'),(5,'ACCOUNTANT','Kế toán - Quản lý tài chính và báo cáo','2025-10-23 08:15:47'),(6,'CUSTOMER','Khách hàng - Mua sắm và quản lý đơn hàng cá nhân','2025-10-23 08:15:47');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_alerts`
--

DROP TABLE IF EXISTS `stock_alerts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_alerts` (
  `alert_id` int NOT NULL AUTO_INCREMENT,
  `variant_id` int NOT NULL,
  `alert_type` enum('LOW_STOCK','OUT_OF_STOCK','OVERSTOCK') COLLATE utf8mb4_unicode_ci NOT NULL,
  `current_stock` int NOT NULL,
  `threshold_stock` int NOT NULL,
  `suggested_order_quantity` int DEFAULT NULL,
  `alert_status` enum('PENDING','ACKNOWLEDGED','RESOLVED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `resolved_by` int DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`alert_id`),
  KEY `resolved_by` (`resolved_by`),
  KEY `idx_status` (`alert_status`),
  KEY `idx_variant` (`variant_id`),
  KEY `idx_created` (`created_at`),
  KEY `idx_type` (`alert_type`),
  CONSTRAINT `stock_alerts_ibfk_1` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`) ON DELETE CASCADE,
  CONSTRAINT `stock_alerts_ibfk_2` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng cảnh báo tồn kho - theo dõi sản phẩm sắp hết hàng';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_alerts`
--

LOCK TABLES `stock_alerts` WRITE;
/*!40000 ALTER TABLE `stock_alerts` DISABLE KEYS */;
/*!40000 ALTER TABLE `stock_alerts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_forecast`
--

DROP TABLE IF EXISTS `stock_forecast`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_forecast` (
  `forecast_id` int NOT NULL AUTO_INCREMENT,
  `variant_id` int NOT NULL,
  `forecast_date` date NOT NULL,
  `predicted_stock` int NOT NULL,
  `predicted_sales` int NOT NULL,
  `confidence_level` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`forecast_id`),
  UNIQUE KEY `unique_variant_date` (`variant_id`,`forecast_date`),
  KEY `idx_forecast_date` (`forecast_date`),
  KEY `idx_variant` (`variant_id`),
  CONSTRAINT `stock_forecast_ibfk_1` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng dự báo tồn kho - dự đoán nhu cầu tương lai';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_forecast`
--

LOCK TABLES `stock_forecast` WRITE;
/*!40000 ALTER TABLE `stock_forecast` DISABLE KEYS */;
/*!40000 ALTER TABLE `stock_forecast` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `supplier_id` int NOT NULL AUTO_INCREMENT,
  `supplier_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_person` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `tax_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_terms` text COLLATE utf8mb4_unicode_ci,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`supplier_id`),
  KEY `idx_supplier_name` (`supplier_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (1,'Công Ty TNHH Vải Việt Nam','Nguyễn Văn A','contact@vaivietnam.com','0281234567','123 Đường ABC, Quận 1, TP.HCM','0123456789','Thanh toán trong 30 ngày',NULL,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(2,'Công Ty CP Dệt May Hà Nội','Trần Thị B','info@detmayhanoi.vn','0241234567','456 Đường XYZ, Hoàn Kiếm, Hà Nội','0987654321','Thanh toán trong 45 ngày',NULL,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(3,'Công Ty TNHH Thời Trang Quốc Tế','Lê Văn C','sales@fashionintl.com','0283456789','789 Đường DEF, Quận 3, TP.HCM','0112233445','Thanh toán ngay',NULL,1,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(4,'Xưởng May Gia Đình','Phạm Văn D','xuongmay@gmail.com','0909123456','321 Đường GHI, Bình Thạnh, TP.HCM','0556677889','Thanh toán trong 15 ngày',NULL,1,'2025-10-23 08:15:47','2025-10-23 08:15:47');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `setting_id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` text COLLATE utf8mb4_unicode_ci,
  `description` text COLLATE utf8mb4_unicode_ci,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` VALUES (1,'STORE_NAME','Fashion Store','Tên cửa hàng hiển thị trên hệ thống','2025-10-23 08:15:48'),(2,'STORE_ADDRESS','123 Đường ABC, Quận 1, TP.HCM','Địa chỉ cửa hàng','2025-10-23 08:15:48'),(3,'DEFAULT_SHIPPING_FEE','25000','Phí vận chuyển mặc định','2025-10-23 08:15:48'),(4,'VAT_RATE','8','Tỷ lệ thuế VAT (%)','2025-10-23 08:15:48');
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role_id` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `email_verified` tinyint(1) DEFAULT '0',
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  KEY `idx_username` (`username`),
  KEY `idx_email` (`email`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','admin@fashionstore.vn','$2a$12$aMhICrWiSoqGlW5twyt.CO0yC25usOWBR9oBTOkpNbvHePOqg0AfS','Nguyễn Văn Admin','0901234567',1,1,1,'2025-10-24 10:17:53','2025-10-23 08:15:47','2025-10-24 10:17:53'),(2,'manager01','manager@fashionstore.vn','$2a$12$aMhICrWiSoqGlW5twyt.CO0yC25usOWBR9oBTOkpNbvHePOqg0AfS','Trần Thị Lan','0902345678',2,1,1,NULL,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(3,'sales01','sales01@fashionstore.vn','$2a$12$aMhICrWiSoqGlW5twyt.CO0yC25usOWBR9oBTOkpNbvHePOqg0AfS','Lê Văn Minh','0903456789',3,1,1,NULL,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(4,'sales02','sales02@fashionstore.vn','$2a$12$aMhICrWiSoqGlW5twyt.CO0yC25usOWBR9oBTOkpNbvHePOqg0AfS','Phạm Thị Hoa','0904567890',3,1,1,NULL,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(5,'warehouse01','warehouse@fashionstore.vn','$2a$12$aMhICrWiSoqGlW5twyt.CO0yC25usOWBR9oBTOkpNbvHePOqg0AfS','Hoàng Văn Kho','0905678901',4,1,1,NULL,'2025-10-23 08:15:47','2025-10-23 08:15:47'),(6,'accountant01','accountant@fashionstore.vn','$2a$12$aMhICrWiSoqGlW5twyt.CO0yC25usOWBR9oBTOkpNbvHePOqg0AfS','Vũ Thị Thu','0906789012',5,1,1,NULL,'2025-10-23 08:15:47','2025-10-23 08:15:47');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `website_settings`
--

DROP TABLE IF EXISTS `website_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `website_settings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` text COLLATE utf8mb4_unicode_ci,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`),
  KEY `idx_setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `website_settings`
--

LOCK TABLES `website_settings` WRITE;
/*!40000 ALTER TABLE `website_settings` DISABLE KEYS */;
INSERT INTO `website_settings` VALUES (1,'website_settings','{\"siteName\":\"Thời trang mới\",\"siteDescription\":\"Cửa hàng thời trang trực tuyến\",\"logoUrl\":\"\",\"faviconUrl\":\"\",\"contactEmail\":\"contact@fashionstore.com\",\"contactPhone\":\"0123456789\",\"address\":\"123 Đường ABC, Quận 1, TP.HCM\",\"primaryColor\":\"#298128\",\"secondaryColor\":\"#ec4899\"}','Website theme and general settings','2025-10-24 11:14:08');
/*!40000 ALTER TABLE `website_settings` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-24 18:22:05
