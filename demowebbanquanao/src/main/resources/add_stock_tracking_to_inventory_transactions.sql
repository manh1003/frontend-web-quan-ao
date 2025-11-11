-- Migration: Thêm cột stock_before và stock_after vào bảng inventory_transactions
-- Mục đích: Theo dõi số lượng tồn kho trước và sau mỗi giao dịch

ALTER TABLE inventory_transactions
ADD COLUMN stock_before INT NULL COMMENT 'Số lượng tồn kho trước giao dịch',
ADD COLUMN stock_after INT NULL COMMENT 'Số lượng tồn kho sau giao dịch';

-- Cập nhật dữ liệu hiện có (nếu có)
-- Lưu ý: Đối với dữ liệu cũ, có thể cần tính toán lại stock_before và stock_after
-- dựa trên lịch sử giao dịch. Script này chỉ set NULL cho dữ liệu cũ.

-- Thêm index để tăng hiệu suất truy vấn
CREATE INDEX idx_inventory_transactions_created_at ON inventory_transactions(created_at DESC);
CREATE INDEX idx_inventory_transactions_variant_created ON inventory_transactions(variant_id, created_at DESC);