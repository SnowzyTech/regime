"use client"

import Image from "next/image"
import { Trash2 } from "lucide-react"

interface CartItemProps {
  item: {
    id: string
    productId: string
    productName: string
    quantity: number
    size?: string
    price: number
    image?: string
  }
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemove: (itemId: string) => void
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1)
    } else {
      onRemove(item.id)
    }
  }

  const handleIncrement = () => {
    onUpdateQuantity(item.id, item.quantity + 1)
  }

  const handleDelete = () => {
    onRemove(item.id)
  }

  return (
    <div className="regime-card flex flex-col xs:flex-row gap-3 sm:gap-4 md:gap-6">
      <div className="w-full xs:w-20 sm:w-24 h-24 bg-muted rounded-lg relative overflow-hidden flex-shrink-0">
        {item.image ? (
          <Image src={item.image || "/placeholder.svg"} alt={item.productName} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold mb-1 text-sm sm:text-base truncate">{item.productName}</h3>
        {item.size && <p className="text-xs sm:text-sm text-muted-foreground mb-2">Size: {item.size}</p>}
        <p className="text-accent font-semibold text-sm sm:text-base">₦{item.price.toLocaleString()}</p>
      </div>
      <div className="flex xs:flex-col sm:flex-row items-center justify-between xs:justify-center gap-3 sm:gap-4">
        <div className="flex items-center border border-border rounded">
          <button
            onClick={handleDecrement}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-muted transition-colors cursor-pointer text-sm"
            aria-label="Decrease quantity"
            type="button"
          >
            −
          </button>
          <span className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-center text-sm">
            {item.quantity}
          </span>
          <button
            onClick={handleIncrement}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-muted transition-colors cursor-pointer text-sm"
            aria-label="Increase quantity"
            type="button"
          >
            +
          </button>
        </div>
        <button
          onClick={handleDelete}
          className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
          aria-label="Remove item from cart"
          type="button"
        >
          <Trash2 size={18} className="text-destructive sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  )
}
