"use client"

import { useCart } from "@/hooks/use-cart"
import CartItem from "@/components/cart/cart-item"
import Link from "next/link"
import { motion } from "framer-motion"
import { toast } from "sonner"

export default function CartPage() {
  const { cart, clearCart, removeFromCart, updateQuantity } = useCart()

  if (!cart || cart.items.length === 0) {
    return (
      <div className="pt-32 pb-24 bg-accent/60 regime-container min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-light mb-4">Your Cart</h1>
        <p className="text-foreground mb-8">Your cart is empty</p>
        <Link href="/shop" className="regime-button">
          Continue Shopping
        </Link>
      </div>
    )
  }

  const total = cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0)

  const handleClearCart = () => {
    clearCart()
    toast.success("Cart cleared!")
  }

  return (
    <div className="pt-32 pb-24 regime-container bg-primary-foreground">
      <h1 className="text-3xl font-light mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cart.items.map((item) => (
              <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <CartItem item={item} onUpdateQuantity={updateQuantity} onRemove={removeFromCart} />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="regime-card h-fit sticky top-32">
          <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
          <div className="space-y-4 mb-6 pb-6 border-b border-foreground/30">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₦{total.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-4 mb-6 pb-6 border-b border-foreground/30">
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>FREE</span>
            </div>
          </div>
          
          <div className="flex justify-between mb-8 text-lg font-semibold">
            <span>Total</span>
            <span>₦{total.toLocaleString()}</span>
          </div>
          <Link href="/checkout" className="w-full regime-button block text-center">
            Proceed to Checkout
          </Link>
          <button onClick={handleClearCart} className="w-full regime-button-outline mt-4">
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  )
}
