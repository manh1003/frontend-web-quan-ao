-- Create website_settings table
CREATE TABLE IF NOT EXISTS website_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    description VARCHAR(500),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default settings
INSERT INTO website_settings (setting_key, setting_value, description) 
VALUES (
    'website_settings',
    '{"siteName":"Fashion Store","siteDescription":"Cửa hàng thời trang trực tuyến","logoUrl":"","faviconUrl":"","contactEmail":"contact@fashionstore.com","contactPhone":"0123456789","address":"123 Đường ABC, Quận 1, TP.HCM","primaryColor":"#6366f1","secondaryColor":"#ec4899"}',
    'Website theme and general settings'
) ON DUPLICATE KEY UPDATE 
    setting_value = VALUES(setting_value),
    description = VALUES(description);