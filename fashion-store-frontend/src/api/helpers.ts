// Helper to support both wrapped ApiResponse { success, message, data }
// and raw payloads from backend controllers
export function unwrap<T>(body: any): T {
  if (body && typeof body === 'object' && 'data' in body && body.data !== undefined) {
    return body.data as T
  }
    return body as T
}

