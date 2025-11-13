# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tổng quan dự án

Ứng dụng web bán quần áo full-stack với kiến trúc **monorepo**:
- **Backend**: Spring Boot 3.5.6 REST API (Java 17) - folder `demowebbanquanao/`
- **Frontend**: React 19 + TypeScript + Vite - folder `fashion-store-frontend/`
- **Database**: MySQL 8 (`fashion_store`) - schema file `fashion_data.sql`

## Cấu trúc Repository

```
webbanquanao/
├── demowebbanquanao/          # Backend (Spring Boot)
│   ├── src/main/java/ut/edu/demowebbanquanao/
│   │   ├── config/            # Security, JWT, CORS
│   │   ├── controller/        # REST endpoints
│   │   ├── service/           # Business logic
│   │   ├── repository/        # JPA repositories
│   │   ├── entity/            # Database entities
│   │   ├── dto/               # Request/Response DTOs
│   │   ├── security/          # JWT provider & filter
│   │   └── exception/         # Error handling
│   ├── src/main/resources/
│   │   ├── schema.sql         # Database schema
│   │   └── data.sql           # Seed data
│   ├── pom.xml                # Maven dependencies
│   └── mvnw.cmd               # Maven wrapper (Windows)
├── fashion-store-frontend/    # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── api/               # API client & modules
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Route pages
│   │   ├── stores/            # Zustand state management
│   │   ├── hooks/             # Custom React hooks
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Helper functions
│   │   └── App.tsx            # Router setup
│   ├── package.json
│   └── vite.config.ts         # Vite + proxy config
└── fashion_data.sql           # Database backup
```

---

# Backend (Spring Boot)

## Lệnh thường dùng

### Windows
```bash
# Di chuyển vào thư mục backend
cd demowebbanquanao

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
cd demowebbanquanao
./mvnw spring-boot:run
./mvnw clean install
```

## Công nghệ Backend

- **Framework**: Spring Boot 3.5.6
- **Java**: 17
- **Build Tool**: Maven (wrapper)
- **Database**: MySQL 8 (utf8mb4_unicode_ci)
- **Security**: Spring Security + JWT (JJWT 0.12.3, HS512)
- **Dependencies**: Spring Data JPA, Spring Validation, Lombok, Spring DevTools

## Kiến trúc Backend

### 1. Security Flow (JWT-based)

- **Authentication**: JWT token qua `/api/auth/login`, refresh token qua `/api/auth/refresh`
- **Authorization**: `JwtAuthenticationFilter` intercept request → validate token → set SecurityContext
- **Public endpoints**: `/api/auth/**`, `/api/public/**`, public GET requests (products, categories, brands)
- **Protected endpoints**: Mọi `/api/**` còn lại require Bearer token
- **JWT Config**:
  - Secret key: 64+ chars (HS512)
  - Access token: 24h (86400000ms)
  - Refresh token: 7 ngày (604800000ms)
  - Config trong `application.properties`

### 2. Layered Architecture

**Controller → Service → Repository → Entity**

- Controller: HTTP handling, input validation
- Service: Business logic, transaction management
- Repository: Database operations (JPA)
- Entity: Database mapping
- DTO: API contracts (request/response)
- GlobalExceptionHandler: Centralized error handling

### 3. REST API Endpoints

**Authentication** (`/api/auth/**`):
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Login → trả JWT token
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Thông tin user hiện tại
- `PUT /api/auth/me` - Cập nhật profile

**Products** (`/api/products`, `/api/product-variants`, `/api/product-categories`, `/api/brands`):
- CRUD operations cho sản phẩm, biến thể, danh mục, thương hiệu
- Product có relationship với ProductVariant (1-N)

**Orders & Customers** (`/api/orders`, `/api/customers`):
- Quản lý đơn hàng và khách hàng
- Customer có addresses (1-N relationship)

**Inventory** (`/api/purchase-orders`, `/api/inventory-transactions`, `/api/suppliers`):
- Đơn nhập hàng, giao dịch kho, nhà cung cấp

**Promotions** (`/api/coupons`, `/api/promotions`):
- Mã giảm giá và khuyến mãi

**Reports & Settings** (`/api/reports`, `/api/settings`):
- Báo cáo và cài đặt website

### 4. Database Schema

- **Initialization**: `schema.sql` tự động chạy khi start app (`spring.sql.init.mode=always`)
- **JPA**: `spring.jpa.hibernate.ddl-auto=none` → Không auto-generate schema
- **Charset**: UTF-8/utf8mb4_unicode_ci (hỗ trợ tiếng Việt)
- **Timezone**: Asia/Ho_Chi_Minh

**Quan trọng**: Khi thay đổi schema:
1. Sửa `demowebbanquanao/src/main/resources/schema.sql`
2. Restart app để apply changes
3. Cập nhật Entity tương ứng
4. Update DTO nếu cần

### 5. Product Architecture

Sản phẩm có 2 layers:
- **Product**: Thông tin chung (tên, mô tả, category, brand)
- **ProductVariant**: Biến thể cụ thể (size, color, SKU, stock, price) - đơn vị bán thực tế

### 6. API Response Pattern

Dùng `ApiResponse<T>` wrapper:
```java
{
  "success": true,
  "message": "...",
  "data": {...}
}
```

Frontend có helper `unwrap()` để extract `data` hoặc xử lý raw response.

---

# Frontend (React + TypeScript)

## Lệnh thường dùng

```bash
# Di chuyển vào thư mục frontend
cd fashion-store-frontend

# Cài đặt dependencies
npm install

# Chạy dev server (port 3000)
npm run dev

# Build production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## Công nghệ Frontend

- **Framework**: React 19.1.1 + TypeScript
- **Build tool**: Vite 7.1.7
- **Routing**: React Router DOM v7.9.4
- **State management**: Zustand 5.0.8 (với persist middleware)
- **HTTP client**: Axios 1.12.2
- **Form handling**: React Hook Form + Zod validation
- **Styling**: TailwindCSS 3.4.18
- **Icons**: Lucide React
- **Charts**: Recharts (dashboard)

## Kiến trúc Frontend

### 1. Routing Structure

**Public routes** (không yêu cầu đăng nhập):
- `/`, `/products`, `/products/:id` - Trang chủ, sản phẩm
- `/login`, `/register` - Authentication
- `/about`, `/contact` - Thông tin
- `/cart` - Giỏ hàng (xem được, checkout cần login)

**Protected routes** (`ProtectedRoute` wrapper):
- `/checkout` - Thanh toán
- `/orders`, `/orders/:id` - Đơn hàng
- `/profile` - Thông tin cá nhân

**Admin routes** (`AdminRoute` wrapper - check role + permissions):
- `/admin` - Dashboard
- `/admin/products`, `/admin/categories`, `/admin/brands` - Quản lý sản phẩm
- `/admin/orders`, `/admin/customers` - Quản lý đơn hàng & khách hàng
- `/admin/inventory` - Quản lý tồn kho
- `/admin/coupons`, `/admin/banners` - Khuyến mãi
- `/admin/reports`, `/admin/settings` - Báo cáo & cài đặt

### 2. State Management (Zustand)

**authStore** (`src/stores/authStore.ts`):
- State: user, accessToken, refreshToken
- Actions: login, register, logout, setAuth, setUser
- Persist: localStorage key `auth-storage`

**cartStore** (`src/stores/cartStore.ts`):
- State: items[] (variantId, product, variant, quantity)
- Actions: addItem, removeItem, updateQuantity, clearCart
- Version control (v2.0) với migration để clear cart khi structure thay đổi
- Tự động tính total từ salePrice hoặc price
- Persist: localStorage

**themeStore** (`src/stores/themeStore.ts`):
- State: settings (siteName, logo, colors, contact info)
- Sync 2 chiều với server qua settingsApi
- Apply CSS variables cho primary/secondary colors
- Load từ localStorage → sync với server khi app khởi động

### 3. API Integration (`src/api/`)

**API Client** (`client.ts`):
- **Dev mode**: Vite proxy `/api` → `http://localhost:8080` (tránh CORS)
- **Production**: Direct call `VITE_API_URL` env variable
- **Request interceptor**:
  - Tự động thêm `Authorization: Bearer {token}` cho protected endpoints
  - Public endpoints (GET products, brands, categories, images) không cần token
- **Response interceptor**:
  - Bắt 401 → tự động gọi `/api/auth/refresh`
  - Nếu refresh thất bại → logout & redirect `/login`
  - Retry request gốc với token mới (transparent cho user)

**API Modules Pattern**:
```typescript
// Mỗi module export object với methods CRUD
export const productsApi = {
  getAll: async () => Promise<Product[]>
  getById: async (id) => Promise<Product>
  create: async (data) => Promise<Product>
  update: async (id, data) => Promise<Product>
  delete: async (id) => Promise<void>
}
```

**Helper function** (`unwrap`):
- Hỗ trợ cả response format `{ success, message, data }` và raw payload
- Tự động extract `data` nếu có wrapper

**Các API modules**:
- `auth.ts` - Authentication & profile
- `products.ts`, `categories.ts`, `brands.ts` - Product catalog
- `orders.ts`, `customers.ts` - Order & customer management
- `inventory.ts`, `promotions.ts`, `banners.ts` - Inventory & promotions
- `reports.ts`, `settings.ts` - Reports & settings
- `vietnamAddress.ts` - Vietnam address (provinces/districts/wards)

### 4. Route Guards

**ProtectedRoute** (`src/components/ProtectedRoute.tsx`):
- Check `isAuthenticated` từ authStore
- Redirect `/login` nếu chưa đăng nhập

**AdminRoute** (`src/components/AdminRoute.tsx`):
- Check `isAuthenticated` + `roleName === 'ADMIN'`
- Check permissions cho specific routes
- Redirect nếu không đủ quyền

### 5. Authentication Flow

1. **Login/Register** → Call API → Lưu tokens + user vào:
   - Zustand authStore (persist)
   - localStorage (accessToken, refreshToken, user)

2. **Mọi request** → Request interceptor thêm `Authorization: Bearer {token}`

3. **401 Error** → Response interceptor:
   - Gọi `/api/auth/refresh` với refreshToken
   - Lưu accessToken mới vào store & localStorage
   - Retry request gốc

4. **Refresh fail** → Clear tokens & redirect `/login`

### 6. Custom Hooks

- `useNotification.ts` - Toast notifications
- `useVietnamAddress.ts` - Load provinces/districts/wards
- `useDocumentSettings.ts` - Sync document title/favicon từ settings

---

# Development Workflow

## Setup môi trường

### 1. Database Setup

```bash
# Tạo database MySQL
mysql -u root -p
CREATE DATABASE fashion_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Import schema (nếu cần)
mysql -u root -p fashion_store < fashion_data.sql
```

**Lưu ý**: Backend tự động chạy `schema.sql` khi start, nên không cần import thủ công trừ khi muốn restore data.

### 2. Backend Setup

```bash
cd demowebbanquanao

# Cấu hình database trong src/main/resources/application.properties:
spring.datasource.url=jdbc:mysql://localhost:3306/fashion_store
spring.datasource.username=root
spring.datasource.password=your_password

# Chạy backend
mvnw.cmd spring-boot:run
```

Backend chạy port **8080**.

### 3. Frontend Setup

```bash
cd fashion-store-frontend

# Cài đặt dependencies
npm install

# Cấu hình env (nếu production):
# Tạo file .env với VITE_API_URL=http://your-backend-url

# Chạy frontend
npm run dev
```

Frontend chạy port **3000** (Vite dev server).

## Development Flow

### 1. Backend Changes

**Thêm/sửa Entity**:
1. Sửa `src/main/resources/schema.sql`
2. Restart Spring Boot để apply schema
3. Tạo/cập nhật Entity class
4. Tạo/cập nhật DTO tương ứng
5. Update Service & Controller

**Thêm API mới**:
1. Tạo DTO (request/response)
2. Thêm method trong Service
3. Thêm endpoint trong Controller
4. Test với Postman (có sẵn `Fashion_Store_API.postman_collection.json`)

### 2. Frontend Changes

**Thêm API client**:
1. Định nghĩa TypeScript types trong `src/types/`
2. Tạo API module trong `src/api/` (follow pattern existing modules)
3. Use trong components với try-catch + error handling

**Thêm trang mới**:
1. Tạo component trong `src/pages/`
2. Thêm route trong `src/App.tsx`
3. Nếu cần authentication: wrap với `<ProtectedRoute>`
4. Nếu cần admin: wrap với `<AdminRoute>`

**Thêm global state**:
1. Tạo store trong `src/stores/` (follow Zustand pattern)
2. Thêm persist middleware nếu cần lưu localStorage
3. Use trong components với `useStore()`

## Testing & Debugging

### Backend
- **SQL logs**: Check console (enabled `spring.jpa.show-sql=true`)
- **DevTools**: Auto-restart khi code change
- **Postman**: Import `Fashion_Store_API.postman_collection.json`

### Frontend
- **Vite HMR**: Auto reload khi code change
- **Browser DevTools**:
  - Network tab để xem API requests
  - Console để xem logs
  - Application → LocalStorage để xem stores
- **React DevTools**: Inspect component tree & state

---

# Quy ước phát triển

## Backend Naming Conventions

- **Entity**: PascalCase, số ít (Product, Customer, Order)
- **Repository**: `{Entity}Repository`
- **Service**: `{Entity}Service`
- **Controller**: `{Entity}Controller`
- **REST paths**: `/api/{resources}` (số nhiều, kebab-case)
- **DTO**: `{Purpose}Request/Response` hoặc `{Purpose}DTO`

## Frontend Naming Conventions

- **Components**: PascalCase (ProductCard.tsx, Header.tsx)
- **Pages**: PascalCase (HomePage.tsx, ProductDetailPage.tsx)
- **API modules**: camelCase (productsApi, ordersApi)
- **Stores**: camelCase với suffix Store (authStore, cartStore)
- **Hooks**: camelCase với prefix use (useNotification, useVietnamAddress)
- **Utils**: camelCase (formatPrice, cn - classnames util)

## TypeScript Usage

- **Strict mode enabled**: Luôn định nghĩa types cho API response & store state
- **Types location**: `src/types/` cho shared types
- **No `any`**: Tránh dùng `any`, dùng `unknown` hoặc proper types

## Security Notes

- **Passwords**: BCrypt hashing (backend)
- **JWT Secret**: Thay đổi `jwt.secret` trong production (hiện tại là placeholder)
- **CORS**: Backend đã config cho `http://localhost:3000` (dev)
- **XSS Protection**: React tự động escape output
- **Public endpoints**: Chỉ GET requests cho product catalog, không cần auth

---

# Trạng thái hiện tại

## Đã implement

✅ **Backend**:
- Authentication & Authorization (JWT với auto-refresh)
- User/Role/Permission management
- Product catalog (Category, Brand, Product, Variant, Image)
- Customer & Address management
- Order management
- Supplier & Purchase Order
- Inventory tracking
- Coupon & Promotion
- Report endpoints
- Website settings

✅ **Frontend**:
- Customer UI (trang chủ, sản phẩm, giỏ hàng, checkout)
- Admin dashboard với permission-based navigation
- Product management (CRUD products, variants, categories, brands)
- Order & customer management
- Inventory management
- Coupon & banner management
- Reports & analytics
- Website settings (theme, contact info)
- Authentication với auto-refresh token
- Vietnam address integration

## Chưa implement

⬜ **Backend**:
- Order status workflow automation
- Email/SMS notifications
- Payment gateway integration
- Shipping integration
- Advanced analytics
- File upload service (hiện tại dùng URL)

⬜ **Frontend**:
- Payment integration UI
- Real-time notifications
- Advanced search & filters
- Product reviews & ratings
- Wishlist feature

---

# Lưu ý quan trọng

1. **MySQL phải chạy trước** khi start backend
2. **Backend chạy port 8080**, frontend chạy port 3000
3. **Dev mode**: Frontend proxy `/api` → backend (không cần config CORS)
4. **Production**: Cần config `VITE_API_URL` env variable
5. **JWT tokens**: Access token 24h, refresh token 7 ngày
6. **Auto-refresh**: Frontend tự động refresh token khi 401, transparent cho user
7. **Schema changes**: Sửa `schema.sql` → restart backend → update Entity
8. **Foreign keys**: Schema có nhiều FK constraints → xóa theo đúng thứ tự
9. **Timezone**: Backend config `Asia/Ho_Chi_Minh`
10. **Charset**: UTF-8/utf8mb4_unicode_ci (hỗ trợ tiếng Việt)

## Path Aliases

- **Frontend**: `@` → `./src` (configured in `vite.config.ts`)
- **Backend**: Standard Java package structure

## Environment Variables

**Frontend** (`.env`):
- `VITE_API_URL` - Backend URL (production only, dev dùng proxy)

**Backend** (`application.properties`):
- `spring.datasource.url` - MySQL connection string
- `spring.datasource.username` - MySQL username
- `spring.datasource.password` - MySQL password
- `jwt.secret` - JWT secret key (64+ chars)
- `jwt.expiration` - Access token expiration (ms)
- `jwt.refresh-expiration` - Refresh token expiration (ms)
