-- ============================================
-- MIGRATION: HỆ THỐNG QUẢN LÝ TỒN KHO NÂNG CAO
-- File: inventory_management_migration.sql
-- Mô tả: Thêm các bảng và stored procedures cho quản lý tồn kho thông minh
-- ============================================

USE fashion_store;

-- ============================================
-- GIAI ĐOẠN 1: TẠO CÁC BẢNG MỚI
-- ============================================

-- 1.1. Bảng Cảnh Báo Tồn Kho
CREATE TABLE IF NOT EXISTS stock_alerts (
    alert_id INT PRIMARY KEY AUTO_INCREMENT,
    variant_id INT NOT NULL,
    alert_type ENUM('LOW_STOCK', 'OUT_OF_STOCK', 'OVERSTOCK') NOT NULL,
    current_stock INT NOT NULL,
    threshold_stock INT NOT NULL,
    suggested_order_quantity INT,
    alert_status ENUM('PENDING', 'ACKNOWLEDGED', 'RESOLVED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    resolved_by INT NULL,
    notes TEXT,
    FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by) REFERENCES users(user_id),
    INDEX idx_status (alert_status),
    INDEX idx_variant (variant_id),
    INDEX idx_created (created_at),
    INDEX idx_type (alert_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng cảnh báo tồn kho - theo dõi sản phẩm sắp hết hàng';

-- 1.2. Bảng Đề Xuất Nhập Hàng
CREATE TABLE IF NOT EXISTS reorder_suggestions (
    suggestion_id INT PRIMARY KEY AUTO_INCREMENT,
    variant_id INT NOT NULL,
    supplier_id INT,
    current_stock INT NOT NULL,
    min_stock INT NOT NULL,
    avg_daily_sales DECIMAL(10,2),
    suggested_quantity INT NOT NULL,
    suggested_unit_price DECIMAL(12,2),
    lead_time_days INT DEFAULT 7,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
    status ENUM('PENDING', 'APPROVED', 'ORDERED', 'REJECTED') DEFAULT 'PENDING',
    po_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    notes TEXT,
    FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id),
    FOREIGN KEY (po_id) REFERENCES purchase_orders(po_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_variant (variant_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng đề xuất nhập hàng - tự động tính toán dựa trên lịch sử bán';

-- 1.3. Bảng Dự Báo Tồn Kho
CREATE TABLE IF NOT EXISTS stock_forecast (
    forecast_id INT PRIMARY KEY AUTO_INCREMENT,
    variant_id INT NOT NULL,
    forecast_date DATE NOT NULL,
    predicted_stock INT NOT NULL,
    predicted_sales INT NOT NULL,
    confidence_level DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id) ON DELETE CASCADE,
    UNIQUE KEY unique_variant_date (variant_id, forecast_date),
    INDEX idx_forecast_date (forecast_date),
    INDEX idx_variant (variant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng dự báo tồn kho - dự đoán nhu cầu tương lai';

-- ============================================
-- GIAI ĐOẠN 2: CẬP NHẬT BẢNG HIỆN TẠI
-- ============================================

-- 2.1. Thêm cột vào bảng purchase_orders (chỉ chạy nếu các cột chưa tồn tại)
-- Kiểm tra và thêm từng cột riêng lẻ để tránh lỗi nếu cột đã tồn tại
SET @dbname = DATABASE();
SET @tablename = 'purchase_orders';
SET @columnname = 'approved_by';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT NULL COMMENT ''Người phê duyệt PO'' AFTER created_by')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'approved_at';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TIMESTAMP NULL COMMENT ''Thời gian phê duyệt'' AFTER approved_by')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'received_by';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT NULL COMMENT ''Người nhận hàng'' AFTER approved_at')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'is_auto_generated';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' BOOLEAN DEFAULT FALSE COMMENT ''PO tự động từ suggestion'' AFTER received_by')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'suggestion_id';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT NULL COMMENT ''ID đề xuất gốc'' AFTER is_auto_generated')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Thêm foreign keys nếu chưa có
SET @constraintname = 'fk_po_approved_by';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
   WHERE CONSTRAINT_SCHEMA = @dbname
   AND TABLE_NAME = @tablename
   AND CONSTRAINT_NAME = @constraintname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD CONSTRAINT ', @constraintname, ' FOREIGN KEY (approved_by) REFERENCES users(user_id)')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @constraintname = 'fk_po_received_by';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
   WHERE CONSTRAINT_SCHEMA = @dbname
   AND TABLE_NAME = @tablename
   AND CONSTRAINT_NAME = @constraintname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD CONSTRAINT ', @constraintname, ' FOREIGN KEY (received_by) REFERENCES users(user_id)')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @constraintname = 'fk_po_suggestion';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
   WHERE CONSTRAINT_SCHEMA = @dbname
   AND TABLE_NAME = @tablename
   AND CONSTRAINT_NAME = @constraintname) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD CONSTRAINT ', @constraintname, ' FOREIGN KEY (suggestion_id) REFERENCES reorder_suggestions(suggestion_id)')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 2.2. Thêm cột vào bảng purchase_order_details
SET @tablename = 'purchase_order_details';
SET @columnname = 'expected_receive_date';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' DATE NULL COMMENT ''Ngày dự kiến nhận'' AFTER received_quantity')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'actual_receive_date';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' DATE NULL COMMENT ''Ngày nhận thực tế'' AFTER expected_receive_date')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'quality_check_status';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' ENUM(''PENDING'', ''PASSED'', ''FAILED'', ''PARTIAL'') DEFAULT ''PENDING'' COMMENT ''Trạng thái kiểm tra chất lượng'' AFTER actual_receive_date')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'rejected_quantity';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT DEFAULT 0 COMMENT ''Số lượng bị từ chối'' AFTER quality_check_status')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'notes';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TEXT COMMENT ''Ghi chú chi tiết'' AFTER rejected_quantity')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- ============================================
-- GIAI ĐOẠN 3: STORED PROCEDURES
-- ============================================

-- 3.1. Procedure: Kiểm tra và tạo cảnh báo tồn kho
DELIMITER //

DROP PROCEDURE IF EXISTS check_and_create_stock_alerts//

CREATE PROCEDURE check_and_create_stock_alerts()
BEGIN
    -- Tạo cảnh báo LOW_STOCK
    INSERT INTO stock_alerts (variant_id, alert_type, current_stock, threshold_stock, suggested_order_quantity, alert_status)
    SELECT 
        pv.variant_id,
        'LOW_STOCK',
        pv.stock_quantity,
        pv.min_stock_threshold,
        GREATEST(pv.min_stock_threshold * 2 - pv.stock_quantity, pv.min_stock_threshold),
        'PENDING'
    FROM product_variants pv
    WHERE pv.stock_quantity <= pv.min_stock_threshold
    AND pv.stock_quantity > 0
    AND pv.is_active = TRUE
    AND NOT EXISTS (
        SELECT 1 FROM stock_alerts sa 
        WHERE sa.variant_id = pv.variant_id 
        AND sa.alert_status = 'PENDING'
        AND sa.created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
    );
    
    -- Tạo cảnh báo OUT_OF_STOCK
    INSERT INTO stock_alerts (variant_id, alert_type, current_stock, threshold_stock, suggested_order_quantity, alert_status)
    SELECT 
        pv.variant_id,
        'OUT_OF_STOCK',
        pv.stock_quantity,
        pv.min_stock_threshold,
        pv.min_stock_threshold * 3,
        'PENDING'
    FROM product_variants pv
    WHERE pv.stock_quantity <= 0
    AND pv.is_active = TRUE
    AND NOT EXISTS (
        SELECT 1 FROM stock_alerts sa 
        WHERE sa.variant_id = pv.variant_id 
        AND sa.alert_status = 'PENDING'
        AND sa.created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
    );
    
    SELECT CONCAT('Đã tạo ', ROW_COUNT(), ' cảnh báo tồn kho mới') AS result;
END//

DELIMITER ;

-- 3.2. Procedure: Tạo đề xuất nhập hàng thông minh
DELIMITER //

DROP PROCEDURE IF EXISTS generate_reorder_suggestions//

CREATE PROCEDURE generate_reorder_suggestions()
BEGIN
    INSERT INTO reorder_suggestions (
        variant_id, 
        supplier_id,
        current_stock, 
        min_stock, 
        avg_daily_sales,
        suggested_quantity, 
        suggested_unit_price,
        priority,
        status,
        created_by
    )
    SELECT 
        pv.variant_id,
        (SELECT po.supplier_id 
         FROM purchase_orders po
         JOIN purchase_order_details pod ON po.po_id = pod.po_id
         WHERE pod.variant_id = pv.variant_id
         AND po.status = 'RECEIVED'
         ORDER BY po.received_date DESC
         LIMIT 1) as supplier_id,
        pv.stock_quantity as current_stock,
        pv.min_stock_threshold as min_stock,
        COALESCE(
            (SELECT ABS(SUM(it.quantity)) / 30.0
             FROM inventory_transactions it
             WHERE it.variant_id = pv.variant_id
             AND it.transaction_type = 'OUT'
             AND it.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)),
            1
        ) as avg_daily_sales,
        GREATEST(
            (pv.min_stock_threshold * 2) - pv.stock_quantity,
            CEILING(COALESCE(
                (SELECT ABS(SUM(it.quantity)) / 30.0 * 14
                 FROM inventory_transactions it
                 WHERE it.variant_id = pv.variant_id
                 AND it.transaction_type = 'OUT'
                 AND it.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)),
                pv.min_stock_threshold
            ))
        ) as suggested_quantity,
        COALESCE(pv.cost_price, pv.retail_price * 0.6) as suggested_unit_price,
        CASE 
            WHEN pv.stock_quantity <= 0 THEN 'URGENT'
            WHEN pv.stock_quantity <= pv.min_stock_threshold * 0.5 THEN 'HIGH'
            WHEN pv.stock_quantity <= pv.min_stock_threshold THEN 'MEDIUM'
            ELSE 'LOW'
        END as priority,
        'PENDING' as status,
        1 as created_by
    FROM product_variants pv
    WHERE pv.stock_quantity <= pv.min_stock_threshold
    AND pv.is_active = TRUE
    AND NOT EXISTS (
        SELECT 1 FROM reorder_suggestions rs
        WHERE rs.variant_id = pv.variant_id
        AND rs.status IN ('PENDING', 'APPROVED', 'ORDERED')
    )
    AND NOT EXISTS (
        SELECT 1 FROM purchase_order_details pod
        JOIN purchase_orders po ON pod.po_id = po.po_id
        WHERE pod.variant_id = pv.variant_id
        AND po.status IN ('PENDING', 'APPROVED')
    );
    
    SELECT CONCAT('Đã tạo ', ROW_COUNT(), ' đề xuất nhập hàng mới') AS result;
END//

DELIMITER ;

-- 3.3. Procedure: Tự động tạo PO từ suggestion
DELIMITER //

DROP PROCEDURE IF EXISTS create_po_from_suggestion//

CREATE PROCEDURE create_po_from_suggestion(
    IN p_suggestion_id INT,
    IN p_user_id INT
)
BEGIN
    DECLARE v_po_id INT;
    DECLARE v_po_number VARCHAR(50);
    DECLARE v_supplier_id INT;
    DECLARE v_variant_id INT;
    DECLARE v_quantity INT;
    DECLARE v_unit_price DECIMAL(12,2);
    
    -- Lấy thông tin suggestion
    SELECT supplier_id, variant_id, suggested_quantity, suggested_unit_price
    INTO v_supplier_id, v_variant_id, v_quantity, v_unit_price
    FROM reorder_suggestions
    WHERE suggestion_id = p_suggestion_id
    AND status = 'APPROVED';
    
    -- Tạo PO number
    SET v_po_number = CONCAT('PO', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(FLOOR(RAND() * 10000), 4, '0'));
    
    -- Tạo Purchase Order
    INSERT INTO purchase_orders (
        po_number, supplier_id, order_date, expected_date, 
        status, is_auto_generated, suggestion_id, created_by
    ) VALUES (
        v_po_number, v_supplier_id, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY),
        'PENDING', TRUE, p_suggestion_id, p_user_id
    );
    
    SET v_po_id = LAST_INSERT_ID();
    
    -- Tạo PO Details
    INSERT INTO purchase_order_details (
        po_id, variant_id, quantity, unit_price, expected_receive_date
    ) VALUES (
        v_po_id, v_variant_id, v_quantity, v_unit_price, DATE_ADD(CURDATE(), INTERVAL 7 DAY)
    );
    
    -- Cập nhật suggestion status
    UPDATE reorder_suggestions
    SET status = 'ORDERED', po_id = v_po_id
    WHERE suggestion_id = p_suggestion_id;
    
    SELECT v_po_id as po_id, v_po_number as po_number, 'PO đã được tạo thành công' as message;
END//

DELIMITER ;

-- ============================================
-- GIAI ĐOẠN 4: TRIGGERS
-- ============================================

-- 4.1. Trigger: Tự động cập nhật tồn kho khi nhận hàng
DELIMITER //

DROP TRIGGER IF EXISTS after_po_received//

CREATE TRIGGER after_po_received
AFTER UPDATE ON purchase_orders
FOR EACH ROW
BEGIN
    IF NEW.status = 'RECEIVED' AND OLD.status != 'RECEIVED' THEN
        -- Tự động tạo inventory transactions
        INSERT INTO inventory_transactions (
            variant_id,
            transaction_type,
            quantity,
            reference_type,
            reference_id,
            notes,
            created_by
        )
        SELECT 
            pod.variant_id,
            'IN',
            pod.received_quantity,
            'purchase_order',
            NEW.po_id,
            CONCAT('Nhập hàng từ PO: ', NEW.po_number),
            NEW.received_by
        FROM purchase_order_details pod
        WHERE pod.po_id = NEW.po_id
        AND pod.received_quantity > 0
        AND NOT EXISTS (
            SELECT 1 FROM inventory_transactions it
            WHERE it.reference_type = 'purchase_order'
            AND it.reference_id = NEW.po_id
            AND it.variant_id = pod.variant_id
        );
        
        -- Cập nhật stock quantity
        UPDATE product_variants pv
        JOIN purchase_order_details pod ON pv.variant_id = pod.variant_id
        SET pv.stock_quantity = pv.stock_quantity + pod.received_quantity
        WHERE pod.po_id = NEW.po_id
        AND pod.received_quantity > 0;
        
        -- Đánh dấu reorder suggestion là ORDERED
        UPDATE reorder_suggestions
        SET status = 'ORDERED', po_id = NEW.po_id
        WHERE suggestion_id = NEW.suggestion_id
        AND status = 'APPROVED';
        
        -- Resolve các stock alerts liên quan
        UPDATE stock_alerts sa
        JOIN purchase_order_details pod ON sa.variant_id = pod.variant_id
        SET sa.alert_status = 'RESOLVED',
            sa.resolved_at = NOW(),
            sa.resolved_by = NEW.received_by,
            sa.notes = CONCAT('Đã nhập hàng từ PO: ', NEW.po_number)
        WHERE pod.po_id = NEW.po_id
        AND sa.alert_status = 'PENDING';
    END IF;
END//

DELIMITER ;

-- 4.2. Trigger: Tự động tạo cảnh báo khi stock giảm
DELIMITER //

DROP TRIGGER IF EXISTS after_stock_update//

CREATE TRIGGER after_stock_update
AFTER UPDATE ON product_variants
FOR EACH ROW
BEGIN
    -- Nếu stock giảm xuống dưới threshold
    IF NEW.stock_quantity <= NEW.min_stock_threshold AND OLD.stock_quantity > NEW.min_stock_threshold THEN
        INSERT INTO stock_alerts (
            variant_id, 
            alert_type, 
            current_stock, 
            threshold_stock, 
            suggested_order_quantity,
            alert_status
        ) VALUES (
            NEW.variant_id,
            IF(NEW.stock_quantity <= 0, 'OUT_OF_STOCK', 'LOW_STOCK'),
            NEW.stock_quantity,
            NEW.min_stock_threshold,
            GREATEST(NEW.min_stock_threshold * 2 - NEW.stock_quantity, NEW.min_stock_threshold),
            'PENDING'
        );
    END IF;
END//

DELIMITER ;

-- ============================================
-- GIAI ĐOẠN 5: VIEWS HỖ TRỢ BÁO CÁO
-- ============================================

-- 5.1. View: Tổng quan tồn kho
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

-- 5.2. View: Sản phẩm cần nhập hàng
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

-- 5.3. View: Lịch sử nhập xuất tồn
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

-- ============================================
-- GIAI ĐOẠN 6: DỮ LIỆU MẪU (OPTIONAL)
-- ============================================

-- Chèn một số cảnh báo mẫu để test
-- INSERT INTO stock_alerts (variant_id, alert_type, current_stock, threshold_stock, suggested_order_quantity)
-- SELECT variant_id, 'LOW_STOCK', stock_quantity, min_stock_threshold, min_stock_threshold * 2
-- FROM product_variants
-- WHERE stock_quantity <= min_stock_threshold
-- LIMIT 5;

-- ============================================
-- KẾT THÚC MIGRATION
-- ============================================

SELECT 'Migration hoàn tất! Hệ thống quản lý tồn kho đã được nâng cấp.' as status;