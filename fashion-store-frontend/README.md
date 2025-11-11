# Fashion Store Frontend

Frontend cho hệ thống web bán quần áo, xây dựng với **React 18 + TypeScript + Vite + Tailwind CSS**.

## 🚀 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool (cực nhanh)
- **Tailwind CSS** - Utility-first CSS
- **Zustand** - State management (nhẹ hơn Redux)
- **React Router v6** - Routing
- **Axios** - HTTP client với JWT interceptor
- **React Hook Form + Zod** - Form validation
- **Lucide React** - Icons

## 📦 Cài đặt

```bash
cd fashion-store-frontend
npm install
```

## 🔧 Cấu hình

File `.env` đã tạo sẵn:

```env
VITE_API_URL=http://localhost:8080
```

## 🏃 Chạy Development

```bash
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:3000**

## 🏗️ Build Production

```bash
npm run build
npm run preview
```

## 📁 Cấu trúc Project

```
fashion-store-frontend/
├── src/
│   ├── api/              # API client & endpoints
│   │   ├── client.ts     # Axios với JWT interceptor
│   │   ├── auth.ts       # Auth API
│   │   ├── products.ts   # Products API
│   │   └── orders.ts     # Orders API
│   │
│   ├── components/       # Reusable components
│   │   ├── Header.tsx    # Header với cart, user menu
│   │   ├── Footer.tsx    # Footer
│   │   ├── Layout.tsx    # Layout wrapper
│   │   └── ProtectedRoute.tsx  # Auth guard
│   │
│   ├── pages/           # Page components
│   │   ├── auth/        # Login, Register
│   │   ├── home/        # Home page với hero section
│   │   ├── products/    # Products listing, detail
│   │   ├── cart/        # Shopping cart
│   │   ├── checkout/    # Checkout flow
│   │   ├── orders/      # Order history
│   │   └── profile/     # User profile
│   │
│   ├── stores/          # Zustand stores
│   │   ├── authStore.ts # Auth state (user, token)
│   │   └── cartStore.ts # Cart state
│   │
│   ├── types/           # TypeScript types
│   │   └── index.ts     # All entities & DTOs
│   │
│   ├── lib/             # Utilities
│   │   └── utils.ts     # Helper functions
│   │
│   ├── App.tsx          # Router setup
│   ├── main.tsx         # Entry point
│   └── index.css        # Tailwind + custom styles
│
├── .env                 # Environment variables
├── tailwind.config.js   # Tailwind config
├── tsconfig.json        # TypeScript config
└── vite.config.ts       # Vite config với alias @/
```

## ✨ Features đã implement

### ✅ Core
- [x] Vite + React + TypeScript setup
- [x] Tailwind CSS với custom design system
- [x] Path alias (`@/`) cho imports
- [x] Responsive design (mobile-first)

### ✅ Authentication
- [x] Login page với form validation
- [x] Register page với xác nhận mật khẩu
- [x] JWT token management (auto refresh)
- [x] Protected routes (redirect nếu chưa login)
- [x] Auth store với Zustand + persist

### ✅ API Integration
- [x] Axios client với JWT interceptor
- [x] Auto refresh token khi hết hạn
- [x] Error handling
- [x] TypeScript types cho tất cả entities

### ✅ State Management
- [x] Auth store (user, token, login/logout)
- [x] Cart store (items, quantity, total)
- [x] LocalStorage persist

### ✅ UI Components
- [x] Header với cart badge, user menu
- [x] Footer với links, social media
- [x] Layout wrapper
- [x] Protected route component

### ✅ Pages
- [x] Home page với hero section, features
- [x] Login page (form validation)
- [x] Register page (form validation)
- [ ] Products page (đang phát triển)
- [ ] Product detail (đang phát triển)
- [ ] Cart page (đang phát triển)
- [ ] Checkout page (đang phát triển)
- [ ] Orders page (đang phát triển)
- [ ] Profile page (đang phát triển)

## 🎨 Design System

### Colors (Tailwind)
```js
primary: {
  50: '#f0f9ff',
  600: '#0284c7', // Main brand color
  700: '#0369a1',
}
```

### Custom CSS Classes
```css
.btn-primary    // Primary button
.btn-secondary  // Secondary button
.btn-outline    // Outline button
.input          // Input field
.label          // Form label
.card           // Card container
```

## 🔐 Authentication Flow

1. User đăng ký/đăng nhập
2. Backend trả về `accessToken` + `refreshToken`
3. Frontend lưu vào localStorage + Zustand store
4. Mọi request tự động thêm `Authorization: Bearer <token>`
5. Nếu 401 → tự động refresh token
6. Nếu refresh fail → logout + redirect login

## 📝 Usage Examples

### Gọi API
```typescript
import { authApi, productsApi } from '@/api'

// Login
const { user, accessToken } = await authApi.login({ username, password })

// Get products
const products = await productsApi.getAll()
```

### Sử dụng Store
```typescript
import { useAuthStore, useCartStore } from '@/stores'

function Component() {
  const { user, login, logout } = useAuthStore()
  const { items, addItem } = useCartStore()
}
```

## 🔗 Backend Integration

Backend phải chạy tại **http://localhost:8080**

**CORS đã được config** trong `SecurityConfig.java`:
- Allowed origins: `http://localhost:3000`, `http://localhost:5173`
- Allowed methods: GET, POST, PUT, PATCH, DELETE, OPTIONS

## 📚 Scripts

```bash
npm run dev      # Development mode
npm run build    # Build production
npm run preview  # Preview production build
```

## 🎯 Cách chạy

1. Chạy backend Spring Boot (`demowebbanquanao`)
2. Chạy frontend: `npm run dev`
3. Mở browser: `http://localhost:3000`
4. Test đăng ký/đăng nhập

---

**Made with ❤️ using React + TypeScript + Tailwind**
