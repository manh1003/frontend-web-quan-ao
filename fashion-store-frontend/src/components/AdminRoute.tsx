import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores'

interface AdminRouteProps {
  children: React.ReactNode
  requiredRole?: string[]
  requiredPermission?: string[]
}

export function AdminRoute({ 
  children, 
  requiredRole = ['ADMIN'], 
  requiredPermission 
}: AdminRouteProps) {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Kiểm tra role
  if (requiredRole && requiredRole.length > 0) {
    const hasRole = user?.roleName && requiredRole.includes(user.roleName)
    if (!hasRole) {
      return <Navigate to="/" replace />
    }
  }

  // Kiểm tra permission (nếu cần)
  if (requiredPermission && requiredPermission.length > 0) {
    const hasPermission = user?.permissions?.some(p => 
      requiredPermission.includes(p)
    )
    if (!hasPermission) {
      return <Navigate to="/" replace />
    }
  }

  return <>{children}</>
}