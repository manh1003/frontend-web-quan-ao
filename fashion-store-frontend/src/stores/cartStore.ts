import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product, ProductVariant } from '@/types'

// Version để track thay đổi structure
const CART_STORAGE_VERSION = '2.0'

interface CartState {
  items: CartItem[]
  total: number
  version: string

  // Actions
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void
  removeItem: (variantId: number) => void
  updateQuantity: (variantId: number, quantity: number) => void
  clearCart: () => void
  getItemCount: () => number
  calculateTotal: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      version: CART_STORAGE_VERSION,

      addItem: (product, variant, quantity = 1) => {
        const items = get().items
        const existingItem = items.find(
          (item) => item.variantId === variant.variantId
        )

        if (existingItem) {
          // Tăng số lượng nếu đã có trong giỏ
          set({
            items: items.map((item) =>
              item.variantId === variant.variantId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          })
        } else {
          // Thêm mới vào giỏ
          set({
            items: [
              ...items,
              {
                variantId: variant.variantId,
                product,
                variant,
                quantity,
              },
            ],
          })
        }

        get().calculateTotal()
      },

      removeItem: (variantId) => {
        set({
          items: get().items.filter((item) => item.variantId !== variantId),
        })
        get().calculateTotal()
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId)
          return
        }

        set({
          items: get().items.map((item) =>
            item.variantId === variantId ? { ...item, quantity } : item
          ),
        })
        get().calculateTotal()
      },

      clearCart: () => {
        set({ items: [], total: 0 })
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      calculateTotal: () => {
        const total = get().items.reduce((sum, item) => {
          // Sử dụng salePrice nếu có (giá khuyến mãi), không thì dùng price (giá bán lẻ)
          const price = item.variant.salePrice || item.variant.price
          return sum + price * item.quantity
        }, 0)
        set({ total })
      },
    }),
    {
      name: 'cart-storage',
      version: 2,
      // Migration function để xử lý khi structure thay đổi
      migrate: (persistedState: any, version: number) => {
        // Nếu là version cũ (hoặc không có version), clear cart
        if (!persistedState.version || persistedState.version !== CART_STORAGE_VERSION) {
          console.log('Cart structure changed, clearing old cart data')
          return {
            items: [],
            total: 0,
            version: CART_STORAGE_VERSION,
          }
        }
        return persistedState
      },
    }
  )
)
