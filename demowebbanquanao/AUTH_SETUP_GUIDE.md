# Hướng Dẫn Cấu Hình API Đăng Nhập, Đăng Ký và Phân Quyền

## 📋 Tổng Quan

Hệ thống authentication và authorization đã được tích hợp hoàn chỉnh với các tính năng:
- ✅ Đăng ký tài khoản mới
- ✅ Đăng nhập với JWT token
- ✅ Refresh token
- ✅ Phân quyền theo Role và Permission
- ✅ Bảo mật endpoint với Spring Security
- ✅ CORS configuration

---

## 🔧 Bước 1: Cấu Hình application.properties

Thêm các cấu hình sau vào file `src/main/resources/application.properties`:

```properties
# Server Configuration
server.port=8080
server.servlet.context-path=/

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/fashion_store?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# JWT Configuration
jwt.secret=your-super-secret-key-must-be-at-least-256-bits-long-for-hs512-algorithm-to-work-properly
jwt.expiration=86400000
jwt.refresh.expiration=604800000

# Logging
logging.level.ut.edu.demowebbanquanao=DEBUG
logging.level.org.springframework.security=DEBUG
```

**Lưu ý quan trọng:**
- `jwt.secret`: Phải có độ dài tối thiểu 256 bits (32 ký tự) cho HS512
- `jwt.expiration`: 86400000 ms = 24 giờ
- `jwt.refresh.expiration`: 604800000 ms = 7 ngày
- Thay `your_password` bằng mật khẩu MySQL thực tế

---

## 🗄️ Bước 2: Thiết Lập Database

### 2.1. Tạo Database và Tables

Database schema đã được định nghĩa trong `src/main/resources/schema.sql`. Chạy file này để tạo các bảng.

### 2.2. Thêm Dữ Liệu Mẫu cho Roles và Permissions

Chạy các câu lệnh SQL sau:

```sql
-- Thêm roles
INSERT INTO roles (role_name, description, created_at) VALUES
('ADMIN', 'Quản trị viên hệ thống', NOW()),
('MANAGER', 'Quản lý cửa hàng', NOW()),
('STAFF', 'Nhân viên bán hàng', NOW()),
('CUSTOMER', 'Khách hàng', NOW());

-- Thêm permissions
INSERT INTO permissions (permission_name, description, module) VALUES
-- User Management
('CREATE_USER', 'Tạo người dùng mới', 'USER'),
('READ_USER', 'Xem thông tin người dùng', 'USER'),
('UPDATE_USER', 'Cập nhật người dùng', 'USER'),
('DELETE_USER', 'Xóa người dùng', 'USER'),

-- Product Management
('CREATE_PRODUCT', 'Tạo sản phẩm mới', 'PRODUCT'),
('READ_PRODUCT', 'Xem sản phẩm', 'PRODUCT'),
('UPDATE_PRODUCT', 'Cập nhật sản phẩm', 'PRODUCT'),
('DELETE_PRODUCT', 'Xóa sản phẩm', 'PRODUCT'),

-- Order Management
('CREATE_ORDER', 'Tạo đơn hàng', 'ORDER'),
('READ_ORDER', 'Xem đơn hàng', 'ORDER'),
('UPDATE_ORDER', 'Cập nhật đơn hàng', 'ORDER'),
('DELETE_ORDER', 'Xóa đơn hàng', 'ORDER'),
('MANAGE_ORDER', 'Quản lý đơn hàng', 'ORDER'),

-- Report
('VIEW_REPORT', 'Xem báo cáo', 'REPORT'),
('EXPORT_REPORT', 'Xuất báo cáo', 'REPORT');

-- Phân quyền cho ADMIN (có tất cả quyền)
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.role_id, p.permission_id 
FROM roles r, permissions p 
WHERE r.role_name = 'ADMIN';

-- Phân quyền cho MANAGER
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.role_id, p.permission_id 
FROM roles r, permissions p 
WHERE r.role_name = 'MANAGER' 
AND p.permission_name IN (
    'READ_USER', 
    'READ_PRODUCT', 'UPDATE_PRODUCT', 
    'CREATE_ORDER', 'READ_ORDER', 'UPDATE_ORDER', 'MANAGE_ORDER',
    'VIEW_REPORT', 'EXPORT_REPORT'
);

-- Phân quyền cho STAFF
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.role_id, p.permission_id 
FROM roles r, permissions p 
WHERE r.role_name = 'STAFF' 
AND p.permission_name IN (
    'READ_PRODUCT',
    'CREATE_ORDER', 'READ_ORDER', 'UPDATE_ORDER'
);

-- Phân quyền cho CUSTOMER
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.role_id, p.permission_id 
FROM roles r, permissions p 
WHERE r.role_name = 'CUSTOMER' 
AND p.permission_name IN (
    'READ_PRODUCT',
    'CREATE_ORDER', 'READ_ORDER'
);

-- Tạo tài khoản admin mẫu (password: admin123)
INSERT INTO users (username, email, password_hash, full_name, phone, role_id, is_active, email_verified, created_at, updated_at)
SELECT 'admin', 'admin@fashion.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye7P/8kP7ZQFH0TbQSXPeqMIpMJnHa1a2', 'Administrator', '0123456789', role_id, TRUE, TRUE, NOW(), NOW()
FROM roles WHERE role_name = 'ADMIN';
```

**Lưu ý:** Password đã được mã hóa bằng BCrypt. Password mẫu là `admin123`.

---

## 🚀 Bước 3: Chạy Ứng Dụng

```bash
# Build project
mvn clean install

# Run application
mvn spring-boot:run
```

Hoặc chạy từ IDE bằng cách run class `DemowebbanquanaoApplication.java`

---

## 📡 API Endpoints

### 1. Đăng Ký (Register)

**POST** `/api/auth/register`

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "phone": "0987654321",
  "roleId": 4
}
```

**Response (201 Created):**
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400000,
  "user": {
    "userId": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "phone": "0987654321",
    "roleName": "CUSTOMER",
    "permissions": ["READ_PRODUCT", "CREATE_ORDER", "READ_ORDER"],
    "isActive": true,
    "emailVerified": false,
    "lastLogin": null,
    "createdAt": "2025-10-16T10:00:00"
  },
  "permissions": ["READ_PRODUCT", "CREATE_ORDER", "READ_ORDER"]
}
```

---

### 2. Đăng Nhập (Login)

**POST** `/api/auth/login`

**Request Body:**
```json
{
  "usernameOrEmail": "admin",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400000,
  "user": {
    "userId": 1,
    "username": "admin",
    "email": "admin@fashion.com",
    "fullName": "Administrator",
    "phone": "0123456789",
    "roleName": "ADMIN",
    "permissions": ["CREATE_USER", "READ_USER", "UPDATE_USER", "DELETE_USER", ...],
    "isActive": true,
    "emailVerified": true,
    "lastLogin": "2025-10-16T10:05:00",
    "createdAt": "2025-10-16T09:00:00"
  },
  "permissions": ["CREATE_USER", "READ_USER", ...]
}
```

---

### 3. Lấy Thông Tin User Hiện Tại

**GET** `/api/auth/me`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
```

**Response (200 OK):**
```json
{
  "userId": 1,
  "username": "admin",
  "email": "admin@fashion.com",
  "fullName": "Administrator",
  "phone": "0123456789",
  "roleName": "ADMIN",
  "permissions": ["CREATE_USER", "READ_USER", ...],
  "isActive": true,
  "emailVerified": true,
  "lastLogin": "2025-10-16T10:05:00",
  "createdAt": "2025-10-16T09:00:00"
}
```

---

### 4. Refresh Token

**POST** `/api/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9..."
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400000,
  "user": {...},
  "permissions": [...]
}
```

---

### 5. Đăng Xuất

**POST** `/api/auth/logout`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
```

**Response (200 OK):**
```json
{
  "message": "Đăng xuất thành công"
}
```

---

## 🔐 Sử Dụng Phân Quyền trong Controller

### Ví dụ bảo vệ endpoint với annotation

```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    // Chỉ ADMIN mới có thể truy cập
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody UserRequest request) {
        // Logic tạo user
    }
    
    // ADMIN hoặc MANAGER có thể xem
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        // Logic lấy danh sách user
    }
    
    // Kiểm tra permission cụ thể
    @PreAuthorize("hasAuthority('CREATE_PRODUCT')")
    @PostMapping("/products")
    public ResponseEntity<?> createProduct(@RequestBody ProductRequest request) {
        // Logic tạo sản phẩm
    }
}
```

---

## 🧪 Test với Postman

### 1. Import Collection

Tạo Collection mới trong Postman với các request sau:

### 2. Test Flow

1. **Register**: Tạo tài khoản mới
2. **Login**: Đăng nhập và lấy token
3. **Get Current User**: Test với token vừa lấy được
4. **Access Protected Endpoint**: Test phân quyền
5. **Refresh Token**: Làm mới token khi hết hạn
6. **Logout**: Đăng xuất

### 3. Thiết Lập Environment Variables

Trong Postman, tạo environment với các biến:
- `baseUrl`: `http://localhost:8080`
- `accessToken`: (sẽ được set tự động sau login)
- `refreshToken`: (sẽ được set tự động sau login)

### 4. Pre-request Script cho Login

Thêm script sau vào tab "Tests" của request Login:

```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("accessToken", jsonData.accessToken);
    pm.environment.set("refreshToken", jsonData.refreshToken);
}
```

---

## ⚠️ Xử Lý Lỗi Thường Gặp

### 1. JWT Token không hợp lệ

**Lỗi:** `Invalid JWT signature` hoặc `Expired JWT token`

**Giải pháp:**
- Kiểm tra `jwt.secret` trong `application.properties` phải khớp
- Token có thể đã hết hạn, sử dụng refresh token để lấy token mới

### 2. Access Denied

**Lỗi:** `403 Forbidden`

**Giải pháp:**
- Kiểm tra user có role/permission phù hợp không
- Xem lại cấu hình `@PreAuthorize` trên endpoint

### 3. Database Connection Error

**Lỗi:** `Unable to acquire JDBC Connection`

**Giải pháp:**
- Kiểm tra MySQL đã chạy chưa
- Kiểm tra username/password trong `application.properties`
- Kiểm tra database `fashion_store` đã được tạo chưa

### 4. Spring Security Dependencies Not Found

**Lỗi:** Package `org.springframework.security` does not exist

**Giải pháp:**
```bash
mvn clean install
```

---

## 📊 Cấu Trúc Roles và Permissions

| Role | Permissions |
|------|-------------|
| **ADMIN** | Tất cả permissions |
| **MANAGER** | READ_USER, READ_PRODUCT, UPDATE_PRODUCT, CREATE_ORDER, READ_ORDER, UPDATE_ORDER, MANAGE_ORDER, VIEW_REPORT, EXPORT_REPORT |
| **STAFF** | READ_PRODUCT, CREATE_ORDER, READ_ORDER, UPDATE_ORDER |
| **CUSTOMER** | READ_PRODUCT, CREATE_ORDER, READ_ORDER |

---

## 🔍 Debug và Logging

Để debug authentication flow, bật logging:

```properties
logging.level.ut.edu.demowebbanquanao.security=DEBUG
logging.level.org.springframework.security=DEBUG
```

---

## 📝 Ghi Chú

1. **Password Encoding**: Hệ thống sử dụng BCrypt để mã hóa mật khẩu
2. **Token Storage**: Client phải lưu accessToken và refreshToken (localStorage/sessionStorage)
3. **CORS**: Mặc định cho phép tất cả origins. Sửa trong `SecurityConfig.java` nếu cần
4. **Database Schema**: Đã được tạo sẵn trong `schema.sql`

---

## ✅ Checklist Hoàn Thành

- [x] Dependencies đã được thêm vào `pom.xml`
- [x] Entity classes (User, Role, Permission)
- [x] Repository interfaces
- [x] DTO classes (LoginRequest, RegisterRequest, AuthResponse, UserDTO)
- [x] JwtTokenProvider
- [x] JwtAuthenticationFilter
- [x] SecurityConfig
- [x] CustomUserDetailsService
- [x] AuthService
- [x] AuthController
- [x] Exception handling
- [ ] Cấu hình `application.properties`
- [ ] Chạy SQL scripts để tạo roles và permissions
- [ ] Test API với Postman

---

Hệ thống authentication và authorization đã được thiết lập hoàn chỉnh! 🎉