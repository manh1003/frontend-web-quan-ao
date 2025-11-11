-- ============================================
-- CƠ SỞ DỮ LIỆU QUẢN LÝ CỬA HÀNG QUẦN ÁO
-- File: schema.sql
-- Đặt trong: src/main/resources/schema.sql
-- ============================================

-- Tạo database nếu chưa tồn tại
CREATE DATABASE IF NOT EXISTS fashion_store
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE fashion_store;

-- Xóa các bảng cũ nếu tồn tại (theo đúng thứ tự foreign key)
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `activity_logs`;
DROP TABLE IF EXISTS `brands`;
DROP TABLE IF EXISTS `coupon_usage`;
DROP TABLE IF EXISTS `coupons`;
DROP TABLE IF EXISTS `customer_addresses`;
DROP TABLE IF EXISTS `customers`;
DROP TABLE IF EXISTS `hero_banners`;
DROP TABLE IF EXISTS `inventory_transactions`;
DROP TABLE IF EXISTS `order_details`;
DROP TABLE IF EXISTS `order_status_history`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `permissions`;
DROP TABLE IF EXISTS `product_categories`;
DROP TABLE IF EXISTS `product_images`;
DROP TABLE IF EXISTS `product_variants`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `promotion_products`;
DROP TABLE IF EXISTS `promotions`;
DROP TABLE IF EXISTS `purchase_order_details`;
DROP TABLE IF EXISTS `purchase_orders`;
DROP TABLE IF EXISTS `related_products`;
DROP TABLE IF EXISTS `reorder_suggestions`;
DROP TABLE IF EXISTS `role_permissions`;
DROP TABLE IF EXISTS `roles`;
DROP TABLE IF EXISTS `stock_alerts`;
DROP TABLE IF EXISTS `stock_forecast`;
DROP TABLE IF EXISTS `suppliers`;
DROP TABLE IF EXISTS `system_settings`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `website_settings`;


SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 1. QUẢN LÝ NGƯỜI DÙNG & PHÂN QUYỀN
-- ============================================

-- Bảng vai trò
CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng người dùng (nhân viên)
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng quyền hạn chi tiết
CREATE TABLE `permissions` (
  `permission_id` int NOT NULL AUTO_INCREMENT,
  `permission_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `module` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`permission_id`),
  UNIQUE KEY `permission_name` (`permission_name`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng phân quyền theo vai trò
CREATE TABLE `role_permissions` (
  `role_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `permission_id` (`permission_id`),
  CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE,
  CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`permission_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. QUẢN LÝ SẢN PHẨM
-- ============================================

-- Bảng loại sản phẩm
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

-- Bảng thương hiệu
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

-- Bảng sản phẩm chính
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

-- Bảng biến thể sản phẩm (theo màu và size)
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

-- Bảng hình ảnh sản phẩm
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

-- ============================================
-- 3. QUẢN LÝ NHÀ CUNG CẤP
-- ============================================

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

-- Bảng đơn nhập hàng
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

-- Chi tiết đơn nhập hàng
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

-- ============================================
-- 4. QUẢN LÝ TỒN KHO
-- ============================================

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

-- ============================================
-- 5. QUẢN LÝ KHÁCH HÀNG
-- ============================================

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

-- Địa chỉ khách hàng
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

-- ============================================
-- 6. QUẢN LÝ ĐƠN HÀNG
-- ============================================

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

-- Chi tiết đơn hàng
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

-- Lịch sử trạng thái đơn hàng
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

-- ============================================
-- 7. MARKETING & KHUYẾN MÃI
-- ============================================

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

-- Lịch sử sử dụng coupon
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

-- Chương trình khuyến mãi
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

-- Sản phẩm áp dụng khuyến mãi
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

-- ============================================
-- 8. NHẬT KÝ HOẠT ĐỘNG
-- ============================================

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

-- ============================================
-- 9. CẤU HÌNH HỆ THỐNG
-- ============================================

CREATE TABLE `system_settings` (
  `setting_id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` text COLLATE utf8mb4_unicode_ci,
  `description` text COLLATE utf8mb4_unicode_ci,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 10. GỢI Ý SẢN PHẨM LIÊN QUAN
-- ============================================

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

-- ============================================
-- Hero Banners Table for Homepage Management
-- ============================================
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


-- ============================================
-- QUẢN LÝ TỒN KHO NÂNG CAO
-- ============================================

-- Bảng cảnh báo tồn kho
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

-- Bảng đề xuất nhập hàng
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

-- Bảng dự báo tồn kho
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


-- ============================================
-- VIEWS HỖ TRỢ BÁO CÁO
-- ============================================

-- View: Tổng quan tồn kho
CREATE OR REPLACE VIEW v_inventory_overview AS
SELECT
    pv.variant_id,
    p.product_id,
    p.product_name,
    pv.color,
    pv.size,
    pv.variant_sku,
    pv.stock_quantity,
    pv.min_stock_threshold,
    pv.retail_price,
    pv.cost_price,
    (pv.stock_quantity * COALESCE(pv.cost_price, pv.retail_price * 0.6)) as inventory_value,
    CASE
        WHEN pv.stock_quantity <= 0 THEN 'OUT_OF_STOCK'
        WHEN pv.stock_quantity <= pv.min_stock_threshold * 0.5 THEN 'CRITICAL'
        WHEN pv.stock_quantity <= pv.min_stock_threshold THEN 'LOW'
        WHEN pv.stock_quantity > pv.min_stock_threshold * 3 THEN 'OVERSTOCK'
        ELSE 'NORMAL'
    END as stock_status,
    b.brand_name,
    pc.category_name
FROM product_variants pv
JOIN products p ON pv.product_id = p.product_id
LEFT JOIN brands b ON p.brand_id = b.brand_id
LEFT JOIN product_categories pc ON p.category_id = pc.category_id
WHERE pv.is_active = TRUE;

-- View: Sản phẩm cần nhập hàng
CREATE OR REPLACE VIEW v_products_need_reorder AS
SELECT
    pv.variant_id,
    p.product_name,
    pv.color,
    pv.size,
    pv.stock_quantity,
    pv.min_stock_threshold,
    COALESCE(rs.suggested_quantity, pv.min_stock_threshold * 2) as suggested_quantity,
    COALESCE(rs.priority, 'MEDIUM') as priority,
    rs.status as suggestion_status,
    rs.created_at as suggestion_date
FROM product_variants pv
JOIN products p ON pv.product_id = p.product_id
LEFT JOIN reorder_suggestions rs ON pv.variant_id = rs.variant_id
    AND rs.status IN ('PENDING', 'APPROVED')
WHERE pv.stock_quantity <= pv.min_stock_threshold
AND pv.is_active = TRUE
ORDER BY
    CASE
        WHEN pv.stock_quantity <= 0 THEN 1
        WHEN pv.stock_quantity <= pv.min_stock_threshold * 0.5 THEN 2
        ELSE 3
    END,
    pv.stock_quantity ASC;

-- View: Lịch sử nhập xuất tồn
CREATE OR REPLACE VIEW v_inventory_movement AS
SELECT
    it.transaction_id,
    it.variant_id,
    p.product_name,
    pv.color,
    pv.size,
    it.transaction_type,
    it.quantity,
    it.reference_type,
    it.reference_id,
    it.notes,
    u.full_name as created_by_name,
    it.created_at
FROM inventory_transactions it
JOIN product_variants pv ON it.variant_id = pv.variant_id
JOIN products p ON pv.product_id = p.product_id
LEFT JOIN users u ON it.created_by = u.user_id
ORDER BY it.created_at DESC;
