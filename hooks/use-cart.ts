"use client"

import { useState, useCallback, useEffect } from "react"

interface CartItem {
  id: string
  productId: string
  productName: string
  quantity: number
  size?: string
  price: number
  image?: string
}

interface Cart {
  items: CartItem[]
}

const CART_STORAGE_KEY = "shopping-cart"

// Global listener for cart changes
let listeners: Array<(cart: Cart) => void> = []

function notifyListeners(cart: Cart) {
  listeners.forEach((listener) => listener(cart))
}

export function subscribeToCart(listener: (cart: Cart) => void) {
  listeners.push(listener)
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

export function useCart() {
  const [cart, setCart] = useState<Cart>({ items: [] })
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY)
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        setCart(parsedCart)
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error)
        setCart({ items: [] })
      }
    }
    setIsInitialized(true)
  }, [])

  // Persist cart to localStorage and notify listeners whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
      notifyListeners(cart)
    }
  }, [cart, isInitialized])

  const addToCart = useCallback(
    (productId: string, quantity = 1, size?: string, productName?: string, price?: number, image?: string) => {
      setCart((prev) => {
        const existingItem = prev.items.find((item) => item.productId === productId && item.size === size)
        if (existingItem) {
          return {
            items: prev.items.map((item) =>
              item.id === existingItem.id ? { ...item, quantity: item.quantity + quantity } : item,
            ),
          }
        }
        return {
          items: [
            ...prev.items,
            {
              id: `${productId}-${size}`,
              productId,
              productName: productName || "Product",
              quantity,
              size,
              price: price || 0,
              image,
            },
          ],
        }
      })
    },
    [],
  )

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prev) => ({ items: prev.items.filter((item) => item.id !== itemId) }))
  }, [])

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    setCart((prev) => ({
      items: prev.items
        .map((item) => (item.id === itemId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0),
    }))
  }, [])

  const clearCart = useCallback(() => {
    setCart({ items: [] })
  }, [])

  return { cart, addToCart, removeFromCart, updateQuantity, clearCart }
}
