-- Add cancellation_reason and return_reason columns to orders table
ALTER TABLE orders 
ADD COLUMN cancellation_reason TEXT,
ADD COLUMN return_reason TEXT;

-- Add comments for documentation
COMMENT ON COLUMN orders.cancellation_reason IS 'Lý do hủy đơn hàng do khách hàng cung cấp';
COMMENT ON COLUMN orders.return_reason IS 'Lý do hoàn trả đơn hàng do khách hàng cung cấp';