-- ============================================
-- DỮ LIỆU MẪU CHO HỆ THỐNG QUẢN LÝ CỬA HÀNG QUẦN ÁO
-- File: data.sql
-- Đặt trong: src/main/resources/data.sql
-- ============================================

USE fashion_store;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- 1. DỮ LIỆU VAI TRÒ VÀ PHÂN QUYỀN
-- ============================================

-- Thêm vai trò
INSERT INTO roles (role_name, description) VALUES
('ADMIN', 'Quản trị viên hệ thống - Toàn quyền'),
('MANAGER', 'Quản lý cửa hàng - Quản lý nhân viên và vận hành'),
('SALES', 'Nhân viên bán hàng - Xử lý đơn hàng và tư vấn'),
('WAREHOUSE', 'Nhân viên kho - Quản lý tồn kho và nhập xuất'),
('ACCOUNTANT', 'Kế toán - Quản lý tài chính và báo cáo'),
('CUSTOMER', 'Khách hàng - Mua sắm và quản lý đơn hàng cá nhân');

-- Thêm người dùng (mật khẩu: 123456789 - đã hash bằng BCrypt)
INSERT INTO users (username, email, password_hash, full_name, phone, role_id, is_active, email_verified) VALUES
('admin', 'admin@fashionstore.vn', '$2a$12$aMhICrWiSoqGlW5twyt.CO0yC25usOWBR9oBTOkpNbvHePOqg0AfS', 'Nguyễn Văn Admin', '0901234567', 1, TRUE, TRUE),
('manager01', 'manager@fashionstore.vn', '$2a$12$aMhICrWiSoqGlW5twyt.CO0yC25usOWBR9oBTOkpNbvHePOqg0AfS', 'Trần Thị Lan', '0902345678', 2, TRUE, TRUE),
('sales01', 'sales01@fashionstore.vn', '$2a$12$aMhICrWiSoqGlW5twyt.CO0yC25usOWBR9oBTOkpNbvHePOqg0AfS', 'Lê Văn Minh', '0903456789', 3, TRUE, TRUE),
('sales02', 'sales02@fashionstore.vn', '$2a$12$aMhICrWiSoqGlW5twyt.CO0yC25usOWBR9oBTOkpNbvHePOqg0AfS', 'Phạm Thị Hoa', '0904567890', 3, TRUE, TRUE),
('warehouse01', 'warehouse@fashionstore.vn', '$2a$12$aMhICrWiSoqGlW5twyt.CO0yC25usOWBR9oBTOkpNbvHePOqg0AfS', 'Hoàng Văn Kho', '0905678901', 4, TRUE, TRUE),
('accountant01', 'accountant@fashionstore.vn', '$2a$12$aMhICrWiSoqGlW5twyt.CO0yC25usOWBR9oBTOkpNbvHePOqg0AfS', 'Vũ Thị Thu', '0906789012', 5, TRUE, TRUE);

-- Thêm quyền hạn
INSERT INTO permissions (permission_name, description, module) VALUES
('VIEW_PRODUCTS', 'Xem danh sách sản phẩm', 'PRODUCT'),
('CREATE_PRODUCT', 'Tạo sản phẩm mới', 'PRODUCT'),
('EDIT_PRODUCT', 'Chỉnh sửa sản phẩm', 'PRODUCT'),
('DELETE_PRODUCT', 'Xóa sản phẩm', 'PRODUCT'),
('VIEW_ORDERS', 'Xem đơn hàng', 'ORDER'),
('CREATE_ORDER', 'Tạo đơn hàng', 'ORDER'),
('EDIT_ORDER', 'Chỉnh sửa đơn hàng', 'ORDER'),
('CANCEL_ORDER', 'Hủy đơn hàng', 'ORDER'),
('VIEW_CUSTOMERS', 'Xem khách hàng', 'CUSTOMER'),
('MANAGE_CUSTOMERS', 'Quản lý khách hàng', 'CUSTOMER'),
('VIEW_INVENTORY', 'Xem tồn kho', 'INVENTORY'),
('MANAGE_INVENTORY', 'Quản lý tồn kho', 'INVENTORY'),
('VIEW_REPORTS', 'Xem báo cáo', 'REPORT'),
('MANAGE_USERS', 'Quản lý người dùng', 'USER'),
('MANAGE_SETTINGS', 'Quản lý cấu hình', 'SYSTEM');

-- Phân quyền cho vai trò
-- ADMIN: Toàn quyền
INSERT INTO role_permissions (role_id, permission_id) 
SELECT 1, permission_id FROM permissions;

-- MANAGER: Hầu hết quyền trừ quản lý hệ thống
INSERT INTO role_permissions (role_id, permission_id) VALUES
(2, 1), (2, 2), (2, 3), (2, 5), (2, 6), (2, 7), (2, 8), (2, 9), (2, 10), (2, 11), (2, 12), (2, 13);

-- SALES: Quyền bán hàng
INSERT INTO role_permissions (role_id, permission_id) VALUES
(3, 1), (3, 5), (3, 6), (3, 7), (3, 9), (3, 11);

-- WAREHOUSE: Quyền quản lý kho
INSERT INTO role_permissions (role_id, permission_id) VALUES
(4, 1), (4, 11), (4, 12);

-- ACCOUNTANT: Quyền xem báo cáo
INSERT INTO role_permissions (role_id, permission_id) VALUES
(5, 1), (5, 5), (5, 9), (5, 11), (5, 13);

-- CUSTOMER: Quyền khách hàng (xem sản phẩm, tạo đơn hàng, xem đơn hàng)
INSERT INTO role_permissions (role_id, permission_id) VALUES
(6, 1),  -- VIEW_PRODUCTS
(6, 6),  -- CREATE_ORDER
(6, 5);  -- VIEW_ORDERS

-- ============================================
-- 2. DỮ LIỆU SẢN PHẨM
-- ============================================

-- Danh mục sản phẩm
INSERT INTO product_categories (category_name, parent_category_id, description, is_active) VALUES
('Áo Nam', NULL, 'Các loại áo dành cho nam', TRUE),
('Áo Nữ', NULL, 'Các loại áo dành cho nữ', TRUE),
('Quần Nam', NULL, 'Các loại quần dành cho nam', TRUE),
('Quần Nữ', NULL, 'Các loại quần dành cho nữ', TRUE),
('Phụ Kiện', NULL, 'Phụ kiện thời trang', TRUE),
('Áo Sơ Mi Nam', 1, 'Áo sơ mi nam công sở và casual', TRUE),
('Áo Thun Nam', 1, 'Áo thun nam các loại', TRUE),
('Áo Polo Nam', 1, 'Áo polo nam', TRUE),
('Áo Sơ Mi Nữ', 2, 'Áo sơ mi nữ công sở và dạo phố', TRUE),
('Áo Thun Nữ', 2, 'Áo thun nữ các loại', TRUE),
('Váy', 2, 'Váy đầm nữ', TRUE),
('Quần Jeans Nam', 3, 'Quần jean nam các kiểu', TRUE),
('Quần Kaki Nam', 3, 'Quần kaki nam', TRUE),
('Quần Jeans Nữ', 4, 'Quần jean nữ các kiểu', TRUE),
('Quần Âu Nữ', 4, 'Quần âu nữ công sở', TRUE);

-- Thương hiệu
INSERT INTO brands (brand_name, description, logo_url, country, website, is_active) VALUES
('ROUTINE', 'Thương hiệu thời trang Việt Nam cao cấp', 'https://example.com/routine-logo.png', 'Việt Nam', 'https://routine.vn', TRUE),
('COOLMATE', 'Thương hiệu thời trang nam hiện đại', 'https://example.com/coolmate-logo.png', 'Việt Nam', 'https://coolmate.me', TRUE),
('OWEN', 'Thời trang nam công sở sang trọng', 'https://example.com/owen-logo.png', 'Việt Nam', 'https://owen.vn', TRUE),
('CANIFA', 'Thời trang gia đình Việt Nam', 'https://example.com/canifa-logo.png', 'Việt Nam', 'https://canifa.com', TRUE),
('ELISE', 'Thời trang nữ văn phòng', 'https://example.com/elise-logo.png', 'Việt Nam', 'https://elise.vn', TRUE),
('UNIQLO', 'Thương hiệu thời trang Nhật Bản', 'https://example.com/uniqlo-logo.png', 'Nhật Bản', 'https://uniqlo.com', TRUE),
('ZARA', 'Thương hiệu thời trang Tây Ban Nha', 'https://example.com/zara-logo.png', 'Tây Ban Nha', 'https://zara.com', TRUE);

-- Sản phẩm chính
INSERT INTO products (sku, product_name, category_id, brand_id, material, description, care_instructions, is_active, created_by) VALUES
('ASM-NAM-001', 'Áo Sơ Mi Nam Oxford Trắng', 6, 3, 'Cotton 100%', 'Áo sơ mi nam Oxford trắng basic, phù hợp công sở và dạo phố', 'Giặt máy ở nhiệt độ 30°C, không tẩy, là ở nhiệt độ trung bình', TRUE, 1),
('ASM-NAM-002', 'Áo Sơ Mi Nam Kẻ Sọc Xanh', 6, 2, 'Cotton 95%, Spandex 5%', 'Áo sơ mi nam kẻ sọc xanh dương, form slim fit hiện đại', 'Giặt tay, không vắt mạnh, phơi nơi thoáng mát', TRUE, 1),
('AT-NAM-001', 'Áo Thun Nam Basic Trơn', 7, 2, 'Cotton 100%', 'Áo thun nam basic nhiều màu, form regular thoải mái', 'Giặt máy bình thường, có thể sấy khô', TRUE, 1),
('AT-NAM-002', 'Áo Thun Nam In Họa Tiết', 7, 1, 'Cotton 95%, Polyester 5%', 'Áo thun nam in họa tiết thời trang, chất liệu thoáng mát', 'Giặt máy 30°C, lộn trái khi giặt để bảo vệ họa tiết', TRUE, 1),
('AP-NAM-001', 'Áo Polo Nam Pique', 8, 4, 'Cotton Pique 100%', 'Áo polo nam pique cao cấp, nhiều màu sắc lựa chọn', 'Giặt máy 40°C, không tẩy, là nhiệt độ thấp', TRUE, 1),
('ASM-NU-001', 'Áo Sơ Mi Nữ Tay Dài Trắng', 9, 5, 'Vải lụa Hàn Quốc', 'Áo sơ mi nữ tay dài trắng công sở sang trọng', 'Giặt tay hoặc giặt khô, là ở nhiệt độ thấp', TRUE, 1),
('AT-NU-001', 'Áo Thun Nữ Croptop', 10, 6, 'Cotton 90%, Spandex 10%', 'Áo thun nữ croptop năng động, trẻ trung', 'Giặt máy 30°C, không sấy khô', TRUE, 1),
('VAY-001', 'Váy Suông Nữ Midi', 11, 5, 'Vải lụa tơ tằm', 'Váy suông nữ dáng midi thanh lịch', 'Giặt khô, tránh ánh nắng trực tiếp', TRUE, 1),
('QJ-NAM-001', 'Quần Jean Nam Slim Fit', 12, 2, 'Denim 98%, Spandex 2%', 'Quần jean nam slim fit co giãn tốt', 'Giặt máy 40°C, lộn trái khi giặt', TRUE, 1),
('QJ-NAM-002', 'Quần Jean Nam Regular Fit', 12, 4, 'Denim 100%', 'Quần jean nam regular fit form rộng thoải mái', 'Giặt tay lần đầu, sau đó có thể giặt máy', TRUE, 1),
('QK-NAM-001', 'Quần Kaki Nam Slim', 13, 3, 'Kaki 97%, Spandex 3%', 'Quần kaki nam slim fit cao cấp', 'Giặt máy 40°C, là nhiệt độ trung bình', TRUE, 1),
('QJ-NU-001', 'Quần Jean Nữ Skinny', 14, 6, 'Denim 96%, Spandex 4%', 'Quần jean nữ skinny ôm dáng hoàn hảo', 'Giặt máy 30°C, lộn trái', TRUE, 1),
('QA-NU-001', 'Quần Âu Nữ Ống Đứng', 15, 5, 'Vải tuyết mưa cao cấp', 'Quần âu nữ ống đứng công sở', 'Giặt khô hoặc giặt tay, là nhiệt độ trung bình', TRUE, 1);

-- Biến thể sản phẩm (màu sắc và size)
INSERT INTO product_variants (product_id, color, size, variant_sku, cost_price, retail_price, sale_price, stock_quantity, min_stock_threshold, is_active) VALUES
-- Áo Sơ Mi Nam Oxford Trắng
(1, 'Trắng', 'S', 'ASM-NAM-001-TR-S', 150000, 299000, NULL, 50, 10, TRUE),
(1, 'Trắng', 'M', 'ASM-NAM-001-TR-M', 150000, 299000, NULL, 80, 10, TRUE),
(1, 'Trắng', 'L', 'ASM-NAM-001-TR-L', 150000, 299000, NULL, 60, 10, TRUE),
(1, 'Trắng', 'XL', 'ASM-NAM-001-TR-XL', 150000, 299000, NULL, 40, 10, TRUE),
-- Áo Sơ Mi Nam Kẻ Sọc Xanh
(2, 'Xanh Dương', 'M', 'ASM-NAM-002-XD-M', 180000, 349000, 299000, 45, 10, TRUE),
(2, 'Xanh Dương', 'L', 'ASM-NAM-002-XD-L', 180000, 349000, 299000, 55, 10, TRUE),
(2, 'Xanh Dương', 'XL', 'ASM-NAM-002-XD-XL', 180000, 349000, 299000, 35, 10, TRUE),
-- Áo Thun Nam Basic
(3, 'Đen', 'M', 'AT-NAM-001-DE-M', 80000, 199000, NULL, 100, 15, TRUE),
(3, 'Đen', 'L', 'AT-NAM-001-DE-L', 80000, 199000, NULL, 90, 15, TRUE),
(3, 'Trắng', 'M', 'AT-NAM-001-TR-M', 80000, 199000, NULL, 95, 15, TRUE),
(3, 'Trắng', 'L', 'AT-NAM-001-TR-L', 80000, 199000, NULL, 85, 15, TRUE),
(3, 'Xám', 'M', 'AT-NAM-001-XA-M', 80000, 199000, NULL, 75, 15, TRUE),
(3, 'Xám', 'L', 'AT-NAM-001-XA-L', 80000, 199000, NULL, 70, 15, TRUE),
-- Áo Thun Nam In Họa Tiết
(4, 'Đen', 'M', 'AT-NAM-002-DE-M', 100000, 249000, 199000, 60, 10, TRUE),
(4, 'Đen', 'L', 'AT-NAM-002-DE-L', 100000, 249000, 199000, 50, 10, TRUE),
(4, 'Trắng', 'M', 'AT-NAM-002-TR-M', 100000, 249000, 199000, 55, 10, TRUE),
-- Áo Polo Nam
(5, 'Đen', 'M', 'AP-NAM-001-DE-M', 120000, 279000, NULL, 70, 10, TRUE),
(5, 'Đen', 'L', 'AP-NAM-001-DE-L', 120000, 279000, NULL, 65, 10, TRUE),
(5, 'Navy', 'M', 'AP-NAM-001-NV-M', 120000, 279000, NULL, 60, 10, TRUE),
(5, 'Navy', 'L', 'AP-NAM-001-NV-L', 120000, 279000, NULL, 55, 10, TRUE),
-- Áo Sơ Mi Nữ
(6, 'Trắng', 'S', 'ASM-NU-001-TR-S', 180000, 399000, NULL, 40, 8, TRUE),
(6, 'Trắng', 'M', 'ASM-NU-001-TR-M', 180000, 399000, NULL, 50, 8, TRUE),
(6, 'Trắng', 'L', 'ASM-NU-001-TR-L', 180000, 399000, NULL, 35, 8, TRUE),
-- Áo Thun Nữ Croptop
(7, 'Đen', 'S', 'AT-NU-001-DE-S', 70000, 179000, 149000, 80, 12, TRUE),
(7, 'Đen', 'M', 'AT-NU-001-DE-M', 70000, 179000, 149000, 75, 12, TRUE),
(7, 'Trắng', 'S', 'AT-NU-001-TR-S', 70000, 179000, 149000, 70, 12, TRUE),
(7, 'Trắng', 'M', 'AT-NU-001-TR-M', 70000, 179000, 149000, 65, 12, TRUE),
-- Váy Suông Nữ
(8, 'Đen', 'S', 'VAY-001-DE-S', 200000, 499000, NULL, 30, 8, TRUE),
(8, 'Đen', 'M', 'VAY-001-DE-M', 200000, 499000, NULL, 35, 8, TRUE),
(8, 'Navy', 'S', 'VAY-001-NV-S', 200000, 499000, NULL, 25, 8, TRUE),
(8, 'Navy', 'M', 'VAY-001-NV-M', 200000, 499000, NULL, 30, 8, TRUE),
-- Quần Jean Nam Slim
(9, 'Xanh Đậm', '30', 'QJ-NAM-001-XD-30', 200000, 449000, 399000, 45, 10, TRUE),
(9, 'Xanh Đậm', '31', 'QJ-NAM-001-XD-31', 200000, 449000, 399000, 50, 10, TRUE),
(9, 'Xanh Đậm', '32', 'QJ-NAM-001-XD-32', 200000, 449000, 399000, 55, 10, TRUE),
(9, 'Đen', '30', 'QJ-NAM-001-DE-30', 200000, 449000, 399000, 40, 10, TRUE),
(9, 'Đen', '31', 'QJ-NAM-001-DE-31', 200000, 449000, 399000, 45, 10, TRUE),
-- Quần Jean Nam Regular
(10, 'Xanh Nhạt', '31', 'QJ-NAM-002-XN-31', 180000, 399000, NULL, 50, 10, TRUE),
(10, 'Xanh Nhạt', '32', 'QJ-NAM-002-XN-32', 180000, 399000, NULL, 55, 10, TRUE),
(10, 'Xanh Nhạt', '33', 'QJ-NAM-002-XN-33', 180000, 399000, NULL, 45, 10, TRUE),
-- Quần Kaki Nam
(11, 'Be', '30', 'QK-NAM-001-BE-30', 160000, 379000, NULL, 40, 10, TRUE),
(11, 'Be', '31', 'QK-NAM-001-BE-31', 160000, 379000, NULL, 45, 10, TRUE),
(11, 'Navy', '30', 'QK-NAM-001-NV-30', 160000, 379000, NULL, 35, 10, TRUE),
(11, 'Navy', '31', 'QK-NAM-001-NV-31', 160000, 379000, NULL, 40, 10, TRUE),
-- Quần Jean Nữ Skinny
(12, 'Xanh Đậm', '27', 'QJ-NU-001-XD-27', 190000, 429000, 379000, 45, 10, TRUE),
(12, 'Xanh Đậm', '28', 'QJ-NU-001-XD-28', 190000, 429000, 379000, 50, 10, TRUE),
(12, 'Xanh Đậm', '29', 'QJ-NU-001-XD-29', 190000, 429000, 379000, 40, 10, TRUE),
(12, 'Đen', '27', 'QJ-NU-001-DE-27', 190000, 429000, 379000, 35, 10, TRUE),
-- Quần Âu Nữ
(13, 'Đen', 'S', 'QA-NU-001-DE-S', 170000, 449000, NULL, 30, 8, TRUE),
(13, 'Đen', 'M', 'QA-NU-001-DE-M', 170000, 449000, NULL, 35, 8, TRUE),
(13, 'Navy', 'S', 'QA-NU-001-NV-S', 170000, 449000, NULL, 28, 8, TRUE),
(13, 'Navy', 'M', 'QA-NU-001-NV-M', 170000, 449000, NULL, 32, 8, TRUE);

-- Hình ảnh sản phẩm
INSERT INTO product_images (product_id, variant_id, image_url, is_primary, display_order) VALUES
-- Áo Sơ Mi Nam Oxford Trắng
(1, NULL, 'https://example.com/products/asm-nam-001-main.jpg', TRUE, 1),
(1, NULL, 'https://example.com/products/asm-nam-001-detail1.jpg', FALSE, 2),
(1, NULL, 'https://example.com/products/asm-nam-001-detail2.jpg', FALSE, 3),
-- Áo Sơ Mi Nam Kẻ Sọc
(2, NULL, 'https://example.com/products/asm-nam-002-main.jpg', TRUE, 1),
(2, NULL, 'https://example.com/products/asm-nam-002-detail1.jpg', FALSE, 2),
-- Áo Thun Nam Basic
(3, NULL, 'https://example.com/products/at-nam-001-main.jpg', TRUE, 1),
(3, 8, 'https://example.com/products/at-nam-001-black.jpg', FALSE, 2),
(3, 10, 'https://example.com/products/at-nam-001-white.jpg', FALSE, 3),
(3, 12, 'https://example.com/products/at-nam-001-grey.jpg', FALSE, 4),
-- Áo Thun In Họa Tiết
(4, NULL, 'https://example.com/products/at-nam-002-main.jpg', TRUE, 1),
-- Áo Polo
(5, NULL, 'https://example.com/products/ap-nam-001-main.jpg', TRUE, 1),
-- Áo Sơ Mi Nữ
(6, NULL, 'https://example.com/products/asm-nu-001-main.jpg', TRUE, 1),
(6, NULL, 'https://example.com/products/asm-nu-001-detail1.jpg', FALSE, 2),
-- Áo Thun Nữ Croptop
(7, NULL, 'https://example.com/products/at-nu-001-main.jpg', TRUE, 1),
-- Váy Suông
(8, NULL, 'https://example.com/products/vay-001-main.jpg', TRUE, 1),
(8, NULL, 'https://example.com/products/vay-001-detail1.jpg', FALSE, 2),
-- Quần Jean Nam Slim
(9, NULL, 'https://example.com/products/qj-nam-001-main.jpg', TRUE, 1),
-- Quần Jean Nam Regular
(10, NULL, 'https://example.com/products/qj-nam-002-main.jpg', TRUE, 1),
-- Quần Kaki Nam
(11, NULL, 'https://example.com/products/qk-nam-001-main.jpg', TRUE, 1),
-- Quần Jean Nữ
(12, NULL, 'https://example.com/products/qj-nu-001-main.jpg', TRUE, 1),
-- Quần Âu Nữ
(13, NULL, 'https://example.com/products/qa-nu-001-main.jpg', TRUE, 1);

-- ============================================
-- 3. DỮ LIỆU NHÀ CUNG CẤP
-- ============================================

INSERT INTO suppliers (supplier_name, contact_person, email, phone, address, tax_code, payment_terms, is_active) VALUES
('Công Ty TNHH Vải Việt Nam', 'Nguyễn Văn A', 'contact@vaivietnam.com', '0281234567', '123 Đường ABC, Quận 1, TP.HCM', '0123456789', 'Thanh toán trong 30 ngày', TRUE),
('Công Ty CP Dệt May Hà Nội', 'Trần Thị B', 'info@detmayhanoi.vn', '0241234567', '456 Đường XYZ, Hoàn Kiếm, Hà Nội', '0987654321', 'Thanh toán trong 45 ngày', TRUE),
('Công Ty TNHH Thời Trang Quốc Tế', 'Lê Văn C', 'sales@fashionintl.com', '0283456789', '789 Đường DEF, Quận 3, TP.HCM', '0112233445', 'Thanh toán ngay', TRUE),
('Xưởng May Gia Đình', 'Phạm Văn D', 'xuongmay@gmail.com', '0909123456', '321 Đường GHI, Bình Thạnh, TP.HCM', '0556677889', 'Thanh toán trong 15 ngày', TRUE);

-- Đơn nhập hàng
INSERT INTO purchase_orders (po_number, supplier_id, order_date, expected_date, received_date, total_amount, status, created_by) VALUES
('PO-2025-001', 1, '2025-01-05', '2025-01-20', '2025-01-18', 45000000, 'RECEIVED', 5),
('PO-2025-002', 2, '2025-01-10', '2025-01-25', '2025-01-24', 38500000, 'RECEIVED', 5),
('PO-2025-003', 3, '2025-01-15', '2025-02-01', NULL, 52000000, 'APPROVED', 5),
('PO-2025-004', 4, '2025-01-20', '2025-02-05', NULL, 28000000, 'PENDING', 5);

-- Chi tiết đơn nhập hàng
INSERT INTO purchase_order_details (po_id, variant_id, quantity, unit_price, received_quantity) VALUES
-- PO-2025-001
(1, 1, 100, 150000, 100),
(1, 2, 150, 150000, 150),
(1, 8, 200, 80000, 200),
(1, 17, 120, 120000, 120),
-- PO-2025-002
(2, 21, 80, 180000, 80),
(2, 32, 100, 200000, 100),
(2, 40, 90, 160000, 90),
-- PO-2025-003
(3, 29, 70, 200000, 0),
(3, 44, 85, 190000, 0),
(3, 48, 60, 170000, 0),
-- PO-2025-004
(4, 5, 80, 180000, 0),
(4, 14, 100, 100000, 0);

-- ============================================
-- 4. DỮ LIỆU TỒN KHO
-- ============================================

-- Giao dịch nhập kho từ PO
INSERT INTO inventory_transactions (variant_id, transaction_type, quantity, reference_type, reference_id, created_by) VALUES
-- Từ PO-2025-001
(1, 'IN', 100, 'purchase_order', 1, 5),
(2, 'IN', 150, 'purchase_order', 1, 5),
(8, 'IN', 200, 'purchase_order', 1, 5),
(17, 'IN', 120, 'purchase_order', 1, 5),
-- Từ PO-2025-002
(21, 'IN', 80, 'purchase_order', 2, 5),
(32, 'IN', 100, 'purchase_order', 2, 5),
(40, 'IN', 90, 'purchase_order', 2, 5);

-- ============================================
-- 5. DỮ LIỆU KHÁCH HÀNG
-- ============================================

INSERT INTO customers (email, phone, full_name, gender, date_of_birth, customer_tier, total_orders, total_spent, is_active) VALUES
('nguyenvana@gmail.com', '0912345678', 'Nguyễn Văn A', 'MALE', '1990-05-15', 'VIP', 15, 18500000, TRUE),
('tranthib@gmail.com', '0923456789', 'Trần Thị B', 'FEMALE', '1995-08-20', 'REGULAR', 8, 6200000, TRUE),
('levanc@gmail.com', '0934567890', 'Lê Văn C', 'MALE', '1988-12-10', 'REGULAR', 5, 3800000, TRUE),
('phamthid@gmail.com', '0945678901', 'Phạm Thị D', 'FEMALE', '1992-03-25', 'VIP', 12, 14300000, TRUE),
('hoangvane@gmail.com', '0956789012', 'Hoàng Văn E', 'MALE', '1985-07-18', 'REGULAR', 6, 4500000, TRUE),
('vuongthif@gmail.com', '0967890123', 'Vương Thị F', 'FEMALE', '1998-11-05', 'NEW', 2, 1200000, TRUE),
('dangvang@gmail.com', '0978901234', 'Đặng Văn G', 'MALE', '1993-09-30', 'REGULAR', 7, 5600000, TRUE),
('dothih@gmail.com', '0989012345', 'Đỗ Thị H', 'FEMALE', '1996-04-12', 'POTENTIAL', 3, 2100000, TRUE);

-- Địa chỉ khách hàng
INSERT INTO customer_addresses (customer_id, recipient_name, phone, address_line, ward, district, city, is_default) VALUES
(1, 'Nguyễn Văn A', '0912345678', '123 Đường Lê Lợi', 'Phường Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', TRUE),
(1, 'Nguyễn Văn A', '0912345678', '456 Đường Nguyễn Huệ', 'Phường Bến Thành', 'Quận 1', 'TP. Hồ Chí Minh', FALSE),
(2, 'Trần Thị B', '0923456789', '789 Đường Trần Hưng Đạo', 'Phường Cầu Ông Lãnh', 'Quận 1', 'TP. Hồ Chí Minh', TRUE),
(3, 'Lê Văn C', '0934567890', '321 Đường Lý Tự Trọng', 'Phường Phạm Ngũ Lão', 'Quận 1', 'TP. Hồ Chí Minh', TRUE),
(4, 'Phạm Thị D', '0945678901', '654 Đường Pasteur', 'Phường 6', 'Quận 3', 'TP. Hồ Chí Minh', TRUE),
(5, 'Hoàng Văn E', '0956789012', '987 Đường Võ Văn Tần', 'Phường 5', 'Quận 3', 'TP. Hồ Chí Minh', TRUE),
(6, 'Vương Thị F', '0967890123', '147 Đường Hai Bà Trưng', 'Phường Đa Kao', 'Quận 1', 'TP. Hồ Chí Minh', TRUE),
(7, 'Đặng Văn G', '0978901234', '258 Đường Điện Biên Phủ', 'Phường 6', 'Quận Bình Thạnh', 'TP. Hồ Chí Minh', TRUE),
(8, 'Đỗ Thị H', '0989012345', '369 Đường Xô Viết Nghệ Tĩnh', 'Phường 21', 'Quận Bình Thạnh', 'TP. Hồ Chí Minh', TRUE);

-- ============================================
-- 6. DỮ LIỆU ĐƠN HÀNG
-- ============================================

INSERT INTO orders (order_number, customer_id, order_date, status, shipping_address_id, shipping_method, shipping_code, shipping_fee, payment_method, payment_status, subtotal, discount_amount, total_amount, created_by) VALUES
('ORD-2025-001', 1, '2025-01-21 10:30:00', 'DELIVERED', 1, 'Giao hàng nhanh', 'GHN123456', 30000, 'COD', 'PAID', 897000, 50000, 877000, 3),
('ORD-2025-002', 2, '2025-01-22 14:20:00', 'DELIVERED', 3, 'Giao hàng tiêu chuẩn', 'GHTK234567', 25000, 'Banking', 'PAID', 1295000, 100000, 1220000, 3),
('ORD-2025-003', 3, '2025-01-23 09:15:00', 'SHIPPING', 4, 'Giao hàng nhanh', 'GHN345678', 30000, 'COD', 'UNPAID', 796000, 0, 826000, 4),
('ORD-2025-004', 4, '2025-01-24 16:45:00', 'DELIVERED', 5, 'Giao hàng tiêu chuẩn', 'GHTK456789', 25000, 'Momo', 'PAID', 1427000, 150000, 1302000, 3),
('ORD-2025-005', 5, '2025-01-25 11:00:00', 'PROCESSING', 6, 'Giao hàng nhanh', 'GHN567890', 30000, 'COD', 'UNPAID', 597000, 0, 627000, 4),
('ORD-2025-006', 1, '2025-01-26 13:30:00', 'CONFIRMED', 2, 'Giao hàng tiêu chuẩn', 'GHTK678901', 25000, 'Banking', 'PAID', 1696000, 200000, 1521000, 3),
('ORD-2025-007', 6, '2025-01-27 15:20:00', 'PENDING', 7, 'Giao hàng nhanh', NULL, 30000, 'COD', 'UNPAID', 498000, 0, 528000, 4),
('ORD-2025-008', 7, '2025-01-28 10:10:00', 'DELIVERED', 8, 'Giao hàng tiêu chuẩn', 'GHTK789012', 25000, 'COD', 'PAID', 1177000, 80000, 1122000, 3),
('ORD-2025-009', 8, '2025-01-29 14:50:00', 'CANCELLED', 9, 'Giao hàng nhanh', NULL, 30000, 'Banking', 'UNPAID', 757000, 0, 787000, 4),
('ORD-2025-010', 4, '2025-01-30 09:30:00', 'SHIPPING', 5, 'Giao hàng nhanh', 'GHN890123', 30000, 'COD', 'UNPAID', 1096000, 100000, 1026000, 3);

-- Chi tiết đơn hàng
INSERT INTO order_details (order_id, variant_id, quantity, unit_price, discount_amount) VALUES
-- ORD-2025-001
(1, 2, 2, 299000, 30000),
(1, 8, 1, 199000, 10000),
(1, 17, 1, 279000, 10000),
-- ORD-2025-002
(2, 32, 2, 499000, 80000),
(2, 14, 1, 249000, 20000),
(2, 24, 1, 179000, 0),
-- ORD-2025-003
(3, 40, 1, 379000, 0),
(3, 1, 1, 299000, 0),
(3, 10, 1, 199000, 0),
-- ORD-2025-004
(4, 44, 2, 429000, 100000),
(4, 21, 1, 399000, 50000),
(4, 25, 1, 179000, 0),
-- ORD-2025-005
(5, 3, 2, 299000, 0),
-- ORD-2025-006
(6, 33, 2, 449000, 100000),
(6, 48, 1, 449000, 50000),
(6, 29, 1, 499000, 50000),
-- ORD-2025-007
(7, 8, 2, 199000, 0),
(7, 12, 1, 199000, 0),
-- ORD-2025-008
(8, 32, 1, 449000, 40000),
(8, 40, 1, 379000, 20000),
(8, 5, 1, 349000, 20000),
-- ORD-2025-009
(9, 24, 3, 179000, 0),
(9, 10, 1, 199000, 0),
-- ORD-2025-010
(10, 44, 2, 429000, 80000),
(10, 17, 1, 279000, 20000);

-- Lịch sử trạng thái đơn hàng
INSERT INTO order_status_history (order_id, from_status, to_status, notes, changed_by) VALUES
-- ORD-2025-001
(1, NULL, 'PENDING', 'Đơn hàng được tạo', 3),
(1, 'PENDING', 'CONFIRMED', 'Xác nhận đơn hàng', 3),
(1, 'CONFIRMED', 'PROCESSING', 'Đang chuẩn bị hàng', 5),
(1, 'PROCESSING', 'SHIPPING', 'Đã giao cho đơn vị vận chuyển', 5),
(1, 'SHIPPING', 'DELIVERED', 'Giao hàng thành công', 3),
-- ORD-2025-002
(2, NULL, 'PENDING', 'Đơn hàng được tạo', 3),
(2, 'PENDING', 'CONFIRMED', 'Xác nhận đơn hàng và thanh toán', 3),
(2, 'CONFIRMED', 'PROCESSING', 'Đang chuẩn bị hàng', 5),
(2, 'PROCESSING', 'SHIPPING', 'Đã giao cho đơn vị vận chuyển', 5),
(2, 'SHIPPING', 'DELIVERED', 'Giao hàng thành công', 3),
-- ORD-2025-003
(3, NULL, 'PENDING', 'Đơn hàng được tạo', 4),
(3, 'PENDING', 'CONFIRMED', 'Xác nhận đơn hàng', 4),
(3, 'CONFIRMED', 'PROCESSING', 'Đang chuẩn bị hàng', 5),
(3, 'PROCESSING', 'SHIPPING', 'Đã giao cho đơn vị vận chuyển', 5),
-- ORD-2025-004
(4, NULL, 'PENDING', 'Đơn hàng được tạo', 3),
(4, 'PENDING', 'CONFIRMED', 'Xác nhận đơn hàng và thanh toán Momo', 3),
(4, 'CONFIRMED', 'PROCESSING', 'Đang chuẩn bị hàng', 5),
(4, 'PROCESSING', 'SHIPPING', 'Đã giao cho đơn vị vận chuyển', 5),
(4, 'SHIPPING', 'DELIVERED', 'Giao hàng thành công', 3),
-- ORD-2025-005
(5, NULL, 'PENDING', 'Đơn hàng được tạo', 4),
(5, 'PENDING', 'CONFIRMED', 'Xác nhận đơn hàng', 4),
(5, 'CONFIRMED', 'PROCESSING', 'Đang chuẩn bị hàng', 5),
-- ORD-2025-006
(6, NULL, 'PENDING', 'Đơn hàng được tạo', 3),
(6, 'PENDING', 'CONFIRMED', 'Xác nhận đơn hàng và thanh toán', 3),
-- ORD-2025-007
(7, NULL, 'PENDING', 'Đơn hàng được tạo', 4),
-- ORD-2025-008
(8, NULL, 'PENDING', 'Đơn hàng được tạo', 3),
(8, 'PENDING', 'CONFIRMED', 'Xác nhận đơn hàng', 3),
(8, 'CONFIRMED', 'PROCESSING', 'Đang chuẩn bị hàng', 5),
(8, 'PROCESSING', 'SHIPPING', 'Đã giao cho đơn vị vận chuyển', 5),
(8, 'SHIPPING', 'DELIVERED', 'Giao hàng thành công', 3),
-- ORD-2025-009
(9, NULL, 'PENDING', 'Đơn hàng được tạo', 4),
(9, 'PENDING', 'CANCELLED', 'Khách hàng hủy đơn', 4),
-- ORD-2025-010
(10, NULL, 'PENDING', 'Đơn hàng được tạo', 3),
(10, 'PENDING', 'CONFIRMED', 'Xác nhận đơn hàng', 3),
(10, 'CONFIRMED', 'PROCESSING', 'Đang chuẩn bị hàng', 5),
(10, 'PROCESSING', 'SHIPPING', 'Đã giao cho đơn vị vận chuyển', 5);

-- Giao dịch xuất kho từ đơn hàng
INSERT INTO inventory_transactions (variant_id, transaction_type, quantity, reference_type, reference_id, created_by) VALUES
-- ORD-2025-001
(2, 'OUT', -2, 'order', 1, 3),
(8, 'OUT', -1, 'order', 1, 3),
(17, 'OUT', -1, 'order', 1, 3),
-- ORD-2025-002
(32, 'OUT', -2, 'order', 2, 3),
(14, 'OUT', -1, 'order', 2, 3),
(24, 'OUT', -1, 'order', 2, 3),
-- ORD-2025-003
(40, 'OUT', -1, 'order', 3, 4),
(1, 'OUT', -1, 'order', 3, 4),
(10, 'OUT', -1, 'order', 3, 4),
-- ORD-2025-004
(44, 'OUT', -2, 'order', 4, 3),
(21, 'OUT', -1, 'order', 4, 3),
(25, 'OUT', -1, 'order', 4, 3),
-- ORD-2025-005
(3, 'OUT', -2, 'order', 5, 4),
-- ORD-2025-006
(33, 'OUT', -2, 'order', 6, 3),
(48, 'OUT', -1, 'order', 6, 3),
(29, 'OUT', -1, 'order', 6, 3),
-- ORD-2025-008
(32, 'OUT', -1, 'order', 8, 3),
(40, 'OUT', -1, 'order', 8, 3),
(5, 'OUT', -1, 'order', 8, 3),
-- ORD-2025-010
(44, 'OUT', -2, 'order', 10, 3),
(17, 'OUT', -1, 'order', 10, 3);

-- ============================================
-- 7. DỮ LIỆU MARKETING & KHUYẾN MÃI
-- ============================================

INSERT INTO coupons (coupon_code, coupon_name, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, start_date, end_date, is_active) VALUES
('WELCOME10', 'Mã Chào Mừng 10%', 'Giảm 10% cho đơn hàng đầu tiên', 'PERCENTAGE', 10, 500000, 100000, 1, '2025-01-01 00:00:00', '2025-12-31 23:59:59', TRUE),
('TET2025', 'Mã Tết 2025', 'Giảm 100K cho đơn hàng Tết', 'FIXED_AMOUNT', 100000, 1000000, NULL, 1000, '2025-01-20 00:00:00', '2025-02-10 23:59:59', TRUE),
('FREESHIP', 'Miễn Phí Vận Chuyển', 'Miễn phí vận chuyển', 'FIXED_AMOUNT', 30000, 300000, NULL, NULL, '2025-01-01 00:00:00', '2025-03-31 23:59:59', TRUE),
('VIP20', 'Mã VIP 20%', 'Giảm 20% cho khách hàng VIP', 'PERCENTAGE', 20, 1500000, 500000, NULL, '2025-01-01 00:00:00', '2025-12-31 23:59:59', TRUE);

INSERT INTO coupon_usage (coupon_id, order_id, customer_id, discount_amount) VALUES
(2, 2, 2, 100000),
(4, 4, 4, 150000),
(4, 6, 1, 200000);

INSERT INTO promotions (promotion_name, description, promotion_type, start_date, end_date, is_active) VALUES
('Sale cuối mùa', 'Giảm giá hàng loạt sản phẩm cuối mùa', 'PRODUCT_DISCOUNT', '2025-02-15 00:00:00', '2025-02-28 23:59:59', TRUE),
('Mua 1 tặng 1', 'Mua 1 áo thun tặng 1 áo thun cùng loại', 'BUY_X_GET_Y', '2025-03-01 00:00:00', '2025-03-15 23:59:59', TRUE);

INSERT INTO promotion_products (promotion_id, product_id, discount_percentage) VALUES
(1, 2, 15.00),
(1, 4, 20.00),
(1, 7, 10.00),
(1, 9, 15.00),
(1, 12, 15.00);

-- ============================================
-- 8. NHẬT KÝ HOẠT ĐỘNG
-- ============================================

INSERT INTO activity_logs (user_id, action, table_name, record_id, old_value, new_value, ip_address) VALUES
(1, 'LOGIN', 'users', 1, NULL, NULL, '127.0.0.1'),
(3, 'CREATE', 'orders', 1, NULL, '{"customer_id": 1, "total_amount": 877000}', '192.168.1.10'),
(5, 'UPDATE', 'orders', 1, '{"status": "confirmed"}', '{"status": "processing"}', '192.168.1.15'),
(4, 'UPDATE', 'orders', 9, '{"status": "pending"}', '{"status": "cancelled"}', '192.168.1.12');

-- ============================================
-- 9. CẤU HÌNH HỆ THỐNG
-- ============================================

INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('STORE_NAME', 'Fashion Store', 'Tên cửa hàng hiển thị trên hệ thống'),
('STORE_ADDRESS', '123 Đường ABC, Quận 1, TP.HCM', 'Địa chỉ cửa hàng'),
('DEFAULT_SHIPPING_FEE', '25000', 'Phí vận chuyển mặc định'),
('VAT_RATE', '8', 'Tỷ lệ thuế VAT (%)');

-- ============================================
-- 10. GỢI Ý SẢN PHẨM LIÊN QUAN
-- ============================================

INSERT INTO related_products (product_id, related_product_id, relation_type) VALUES
-- Áo sơ mi nam có thể đi với quần kaki
(1, 11, 'complement'),
(2, 11, 'complement'),
-- Quần jean nam có thể đi với áo thun hoặc polo
(9, 3, 'complement'),
(9, 5, 'complement'),
(10, 3, 'complement'),
(10, 5, 'complement'),
-- Quần âu nữ có thể đi với áo sơ mi nữ
(13, 6, 'complement');

-- ============================================
-- Hero Banners Sample Data
-- ============================================
INSERT INTO hero_banners (title, subtitle, image_url, link_url, button_text, display_order, is_active, start_date, end_date, background_color, text_color) VALUES
('Bộ Sưu Tập Mùa Đông 2024', 'Khám phá những xu hướng thời trang mới nhất với chất lượng cao cấp và giá cả phải chăng', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800', '/products', 'Mua sắm ngay', 0, TRUE, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), '#6366f1', '#ffffff'),
('Giảm Giá Đến 50%', 'Ưu đãi đặc biệt cho khách hàng mới. Áp dụng cho tất cả sản phẩm!', 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800', '/products', 'Xem ngay', 1, TRUE, NOW(), DATE_ADD(NOW(), INTERVAL 15 DAY), '#ec4899', '#ffffff'),
('Thời Trang Công Sở', 'Sang trọng, lịch sự và chuyên nghiệp. Phù hợp cho môi trường làm việc hiện đại', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800', '/products', 'Khám phá', 2, FALSE, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), '#3b82f6', '#ffffff');

SET FOREIGN_KEY_CHECKS = 1;