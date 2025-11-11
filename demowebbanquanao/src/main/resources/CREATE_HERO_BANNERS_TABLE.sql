-- Create Hero Banners Table for Homepage Management
-- This table stores dynamic hero banners that can be managed from admin dashboard

CREATE TABLE IF NOT EXISTS hero_banners (
    banner_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL COMMENT 'Banner title/heading',
    subtitle VARCHAR(500) COMMENT 'Banner subtitle/description',
    image_url VARCHAR(500) NOT NULL COMMENT 'URL or path to banner image',
    link_url VARCHAR(500) COMMENT 'Link when banner is clicked',
    button_text VARCHAR(100) COMMENT 'Text for CTA button',
    display_order INT DEFAULT 0 COMMENT 'Order for displaying banners (lower = first)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether banner is currently active',
    start_date DATETIME COMMENT 'When banner should start showing',
    end_date DATETIME COMMENT 'When banner should stop showing',
    background_color VARCHAR(50) COMMENT 'Background color (hex or name)',
    text_color VARCHAR(50) COMMENT 'Text color (hex or name)',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active_order (is_active, display_order),
    INDEX idx_date_range (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample banners
INSERT INTO hero_banners (title, subtitle, image_url, link_url, button_text, display_order, is_active, start_date, end_date, background_color, text_color) VALUES
('Bộ Sưu Tập Mùa Đông 2024', 'Khám phá những xu hướng thời trang mới nhất với chất lượng cao cấp và giá cả phải chăng', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800', '/products', 'Mua sắm ngay', 0, TRUE, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), '#6366f1', '#ffffff'),
('Giảm Giá Đến 50%', 'Ưu đãi đặc biệt cho khách hàng mới. Áp dụng cho tất cả sản phẩm!', 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800', '/products', 'Xem ngay', 1, TRUE, NOW(), DATE_ADD(NOW(), INTERVAL 15 DAY), '#ec4899', '#ffffff'),
('Thời Trang Công Sở', 'Sang trọng, lịch sự và chuyên nghiệp. Phù hợp cho môi trường làm việc hiện đại', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800', '/products?category=2', 'Khám phá', 2, FALSE, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), '#3b82f6', '#ffffff');

-- Verification query
SELECT * FROM hero_banners ORDER BY display_order ASC;







