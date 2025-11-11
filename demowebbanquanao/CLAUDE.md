# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tổng quan dự án

Ứng dụng web bán quần áo với kiến trúc **frontend/backend tách biệt**:
- **Backend**: Spring Boot 3.5.6 REST API (Java 17) - repository này
- **Frontend**: React (dự định triển khai riêng, chưa có trong repo này)

Backend đã triển khai xong hệ thống authentication JWT-based và các module quản lý cơ bản (sản phẩm, khách hàng, đơn hàng, kho, nhà cung cấp, khuyến mãi).

## Công nghệ sử dụng

- **Framework**: Spring Boot 3.5.6
- **Java**: 17
- **Build Tool**: Maven (wrapper)
- **Database**: MySQL 8 (fashion_store, utf8mb4_unicode_ci)
- **Security**: Spring Security + JWT (JJWT 0.12.3, HS512)
- **Main Dependencies**:
  - Spring Data JPA
  - Spring Validation
  - Lombok
  - Spring DevTools

## Lệnh thường dùng

### Windows (sử dụng mvnw.cmd)

```bash
# Chạy ứng dụng (port 8080)
mvnw.cmd spring-boot:run

# Build
mvnw.cmd clean install

# Build bỏ qua tests
mvnw.cmd clean install -DskipTests

# Chạy tests
mvnw.cmd test

# Chạy một test cụ thể
mvnw.cmd test -Dtest=ClassName#methodName
```

### Linux/Mac

```bash
./mvnw spring-boot:run
./mvnw clean install
```

## Cấu trúc mã nguồn

Package gốc: `ut.edu.demowebbanquanao`

```
src/main/java/ut/edu/demowebbanquanao/
├── config/              # SecurityConfig (JWT, CORS, auth)
├── controller/          # REST endpoints (/api/*)
│   ├── AuthController           # /api/auth/** (register, login)
│   ├── ProductController        # /api/products
│   ├── ProductCategoryController
│   ├── ProductVariantController
│   ├── CustomerController       # /api/customers
│   ├── OrderController          # /api/orders
│   ├── BrandController
│   ├── SupplierController
│   ├── CouponController
│   ├── PromotionController
│   ├── PurchaseOrderController  # Đơn nhập hàng
│   ├── InventoryTransactionController
│   └── ReportController
├── service/             # Business logic layer
├── repository/          # JPA repositories (extend JpaRepository)
├── entity/              # JPA entities (map 1-1 với DB tables)
│   ├── User, Role, Permission   # Hệ thống auth & phân quyền
│   ├── Product, ProductVariant, ProductImage
│   ├── Customer, CustomerAddress
│   ├── Order
│   ├── Brand, Supplier
│   ├── Coupon, Promotion
│   └── PurchaseOrder, InventoryTransaction
├── dto/                 # Data Transfer Objects (request/response)
├── security/            # JwtTokenProvider, JwtAuthenticationFilter
└── exception/           # GlobalExceptionHandler, custom exceptions
```

## Kiến trúc & Pattern chính

### 1. Security Flow (JWT-based)

- **Authentication**: JWT token được tạo qua `/api/auth/login`, refresh token qua `/api/auth/refresh`
- **Authorization**: `JwtAuthenticationFilter` intercept mọi request → validate token → set SecurityContext
- **Public endpoints**: `/api/auth/**`, `/api/public/**`
- **Protected endpoints**: Mọi `/api/**` còn lại require authentication
- **JWT Config**:
  - Secret key: 64+ chars (HS512)
  - Access token: 24h (86400000ms)
  - Refresh token: 7 ngày (604800000ms)
  - Config trong `application.properties` (jwt.secret, jwt.expiration, jwt.refresh-expiration)

### 2. Layered Architecture

**Controller → Service → Repository → Entity**

- Controller chỉ xử lý HTTP, validation input
- Service chứa business logic, transaction management
- Repository chỉ database operations
- Entity map với DB, DTO cho API contract
- GlobalExceptionHandler xử lý lỗi tập trung

### 3. Database Initialization

- **Schema**: `src/main/resources/schema.sql` - tự động chạy mỗi lần start app
- **Data**: `src/main/resources/data.sql` - seed initial data
- **JPA**: `spring.jpa.hibernate.ddl-auto=none` → KHÔNG auto-generate schema, chỉ dùng SQL scripts
- **Charset**: UTF-8/utf8mb4_unicode_ci cho Vietnamese support
- **Timezone**: Asia/Ho_Chi_Minh

### 4. Product Variant Architecture

Sản phẩm có 2 layer:
- **Product**: Thông tin chung (tên, mô tả, category, brand)
- **ProductVariant**: Biến thể cụ thể (size, color, SKU, stock, price) - đây là đơn vị bán hàng thực tế

### 5. API Response Pattern

Dùng `ApiResponse<T>` wrapper:

```java
{
  "success": true,
  "message": "...",
  "data": {...}
}
```

## Quy ước phát triển

### Naming Conventions

- **Entity**: PascalCase, số ít (Product, Customer, Order)
- **Repository**: `{Entity}Repository`
- **Service**: `{Entity}Service`
- **Controller**: `{Entity}Controller`
- **REST paths**: `/api/{resources}` (số nhiều, kebab-case)
- **DTO**: `{Purpose}DTO` hoặc `{Purpose}Request/Response`

### Database Schema Changes

**QUAN TRỌNG**:
1. Sửa `schema.sql` trước
2. Restart app để apply changes (do `spring.sql.init.mode=always`)
3. Cập nhật Entity tương ứng
4. Update DTO nếu cần

### Security Notes

- **Passwords**: BCrypt hashing (via PasswordEncoder)
- **JWT Secret**: Thay đổi `jwt.secret` trong production (current là placeholder)
- **Method Security**: Có thể dùng `@PreAuthorize` annotations (đã enable `@EnableMethodSecurity`)

## Trạng thái hiện tại

**Đã implement**:
- ✅ Authentication & Authorization (JWT)
- ✅ User/Role/Permission management
- ✅ Product catalog (Category, Brand, Product, Variant, Image)
- ✅ Customer & Customer Address
- ✅ Order management
- ✅ Supplier & Purchase Order (đơn nhập hàng)
- ✅ Inventory tracking
- ✅ Coupon & Promotion
- ✅ Report endpoints (basic structure)

**Chưa implement**:
- Order status workflow automation
- Email/SMS notifications
- Payment gateway integration
- Shipping integration
- Advanced reporting/analytics
- File upload for images
- Activity logs tracking

## Tích hợp Frontend (React)

Dự án này là **pure backend API**, không serve frontend. Khi tích hợp với React frontend:

### CORS Configuration

Backend đã cấu hình Spring Security nhưng **cần thêm CORS config** trong `SecurityConfig.java`:

```java
.cors(cors -> cors.configurationSource(request -> {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:5173"));
    config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(Arrays.asList("*"));
    config.setAllowCredentials(true);
    return config;
}))
```

### API Endpoints cho Frontend

**Authentication Flow**:
```
POST /api/auth/register  → Đăng ký (body: username, email, password, fullName, phone)
POST /api/auth/login     → Login (body: username, password) → trả về JWT token
POST /api/auth/refresh   → Refresh token
```

**Protected APIs** (cần Bearer token trong header):
```
GET    /api/products              → Danh sách sản phẩm
GET    /api/products/{id}         → Chi tiết sản phẩm
GET    /api/product-categories    → Danh mục
GET    /api/brands                → Thương hiệu
POST   /api/orders                → Tạo đơn hàng
GET    /api/customers/me          → Thông tin user hiện tại
```

### Frontend Setup (khuyến nghị)

```bash
# Tạo React app (trong folder riêng, không trong repo này)
npm create vite@latest fashion-store-frontend -- --template react

# Dependencies cần thiết
npm install axios react-router-dom zustand
```

**Axios config mẫu**:
```javascript
// api/client.js
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor để attach JWT token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

## Lưu ý quan trọng

1. **MySQL phải chạy trước** khi start app, password trong `application.properties`
2. **DevTools enabled** → auto-restart khi code change
3. **SQL logs**: `spring.jpa.show-sql=true` → xem SQL trong console
4. **Foreign keys**: Schema có nhiều FK constraints → phải xóa theo đúng thứ tự
5. **Backend chạy port 8080**, frontend thường dùng 3000 (CRA) hoặc 5173 (Vite)
