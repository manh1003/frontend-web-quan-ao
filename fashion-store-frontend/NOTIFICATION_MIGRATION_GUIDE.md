# Hướng dẫn Migration Alert/Confirm sang Toast/Modal

## Tóm tắt

Đã tạo các component tái sử dụng để thay thế `alert()` và `confirm()` browser mặc định:

- **Toast**: Thông báo thành công/lỗi đẹp mắt
- **ConfirmModal**: Modal xác nhận hành động
- **useNotification**: Custom hook để quản lý Toast và Modal

## Cách sử dụng

### 1. Import hook và components

```typescript
import { useNotification } from "@/hooks/useNotification";
import { Toast, ConfirmModal } from "@/components";
```

### 2. Sử dụng trong component

```typescript
export function YourComponent() {
  const {
    showToast,
    hideToast,
    toastState,
    showConfirm,
    hideConfirm,
    handleConfirm,
    confirmState,
  } = useNotification();

  // Thay thế alert("Thành công!")
  const handleSuccess = () => {
    showToast("Thành công!", "success");
  };

  // Thay thế alert("Có lỗi xảy ra")
  const handleError = () => {
    showToast("Có lỗi xảy ra", "error");
  };

  // Thay thế confirm("Bạn có chắc?")
  const handleDelete = () => {
    showConfirm(
      "Xóa sản phẩm",
      "Bạn có chắc chắn muốn xóa sản phẩm này?",
      () => {
        // Logic xóa ở đây
        deleteItem();
        showToast("Đã xóa thành công!", "success");
      }
    );
  };

  return (
    <div>
      {/* Your content */}
      
      {/* Render Toast */}
      {toastState.show && (
        <Toast
          message={toastState.message}
          type={toastState.type}
          onClose={hideToast}
        />
      )}

      {/* Render Confirm Modal */}
      {confirmState.show && (
        <ConfirmModal
          title={confirmState.title}
          message={confirmState.message}
          onConfirm={handleConfirm}
          onCancel={hideConfirm}
        />
      )}
    </div>
  );
}
```

## Các file cần migration

### User-facing pages (Ưu tiên cao)
- ✅ `ProductDetailPage.tsx` - Đã hoàn thành
- ✅ `CartPage.tsx` - Đã hoàn thành
- ⏳ `AddressesTab.tsx` - Cần update (3 alerts)
- ⏳ `OrderDetailPage.tsx` - Cần update (6 alerts/confirms)
- ⏳ `AddressSelectionModal.tsx` - Cần update (3 alerts)

### Admin pages (Ưu tiên trung bình)
- ⏳ `CategoriesPage.tsx` - Cần update (2 alerts, 1 confirm)
- ⏳ `BrandsPage.tsx` - Cần update (2 alerts, 1 confirm)
- ⏳ `BannersPage.tsx` - Cần update (4 alerts, 1 confirm)
- ⏳ `ProductsManagementPage.tsx` - Cần update (2 alerts, 1 confirm)
- ⏳ `ProductFormPage.tsx` - Cần update (nhiều alerts/confirms)
- ⏳ `OrdersManagementPage.tsx` - Cần update (1 alert)
- ⏳ `OrderDetailPage.tsx` (Admin) - Cần update (2 alerts, 1 confirm)
- ⏳ `InventoryManagementPage.tsx` - Cần update (3 alerts, 1 confirm)
- ⏳ `CouponsManagementPage.tsx` - Cần update (1 alert)
- ⏳ `SettingsPage.tsx` - Cần update (1 alert)

### Components
- ⏳ `ImageUpload.tsx` - Cần update (2 alerts)

## Toast Types

- `success` - Màu xanh, icon check
- `error` - Màu đỏ, icon alert
- `warning` - Màu vàng, icon warning
- `info` - Màu xanh dương, icon info

## Confirm Modal Types

- `danger` - Màu đỏ (xóa, hủy)
- `warning` - Màu vàng (cảnh báo)
- `info` - Màu xanh (thông tin)

## Ví dụ Pattern Migration

### Before
```typescript
if (confirm("Bạn có chắc muốn xóa?")) {
  deleteItem();
  alert("Đã xóa thành công!");
}
```

### After
```typescript
showConfirm(
  "Xóa mục",
  "Bạn có chắc chắn muốn xóa mục này?",
  () => {
    deleteItem();
    showToast("Đã xóa thành công!", "success");
  }
);
```

## Next Steps

Tiếp tục migration các file còn lại theo thứ tự ưu tiên:
1. User-facing pages trước
2. Admin pages sau
3. Components cuối cùng