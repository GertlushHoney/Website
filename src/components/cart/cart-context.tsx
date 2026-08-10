'use client'

import { createContext, useContext, useState, useTransition, type ReactNode } from 'react'
import {
  addToCart as addToCartAction,
  updateCartLine as updateCartLineAction,
  removeCartLine as removeCartLineAction,
  type Cart,
} from '@/lib/shopify/cart'

type CartContextValue = {
  cart: Cart | null
  isOpen: boolean
  isPending: boolean
  error: string | null
  open: () => void
  close: () => void
  addItem: (variantId: string, quantity: number) => void
  updateItem: (lineId: string, quantity: number) => void
  removeItem: (lineId: string) => void
}

const CartContext = createContext<CartContextValue | null>(null)

// Seeded with a server-fetched cart (see src/app/(site)/layout.tsx) so the
// basket count is correct on first paint, then kept in sync purely from
// each mutation's own response — no separate re-fetch needed, since every
// Shopify cart mutation already returns the full updated cart.
export function CartProvider({
  initialCart,
  children,
}: {
  initialCart: Cart | null
  children: ReactNode
}) {
  const [cart, setCart] = useState(initialCart)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function addItem(variantId: string, quantity: number) {
    setError(null)
    startTransition(async () => {
      try {
        const updated = await addToCartAction(variantId, quantity)
        setCart(updated)
        setIsOpen(true)
      } catch {
        setError("Couldn't add that to your basket — please try again.")
      }
    })
  }

  function updateItem(lineId: string, quantity: number) {
    setError(null)
    startTransition(async () => {
      try {
        setCart(await updateCartLineAction(lineId, quantity))
      } catch {
        setError("Couldn't update your basket — please try again.")
      }
    })
  }

  function removeItem(lineId: string) {
    setError(null)
    startTransition(async () => {
      try {
        setCart(await removeCartLineAction(lineId))
      } catch {
        setError("Couldn't update your basket — please try again.")
      }
    })
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        isPending,
        error,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        addItem,
        updateItem,
        removeItem,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
