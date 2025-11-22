import axios, { AxiosError } from 'axios'

// In dev, use relative baseURL to hit Vite proxy (avoids CORS).
// In production, use explicit API URL from env.
const API_BASE_URL = import.meta.env.DEV
  ? ''
  : import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - thêm token vào header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    const method = (config.method || 'get').toLowerCase()
    const url = config.url || ''
    const isPublicGet =
      method === 'get' &&
      /^\/api\/(products|product-variants|brands|categories|product-categories|product-images)\b/.test(url)

    if (token && config.headers && !isPublicGet) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor - xử lý lỗi và refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any & {
      _retry?: boolean
    }

    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // Nếu đang ở trang login hoặc register, không cần refresh token
      const isAuthEndpoint = originalRequest.url?.includes('/api/auth/')
      if (isAuthEndpoint) {
        return Promise.reject(error)
      }

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        // Gọi API refresh token
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
          refreshToken,
        })

        const body: any = response.data
        const payload = body && typeof body === 'object' && 'data' in body ? body.data : body
        const { accessToken } = payload || {}
        localStorage.setItem('accessToken', accessToken)

        // Retry request với token mới
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
        }
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Refresh token hết hạn -> logout
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')

        // Chỉ redirect nếu không phải đang ở trang login/register
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login'
        }

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
