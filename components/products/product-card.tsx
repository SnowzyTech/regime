"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useCart } from "@/hooks/use-cart"
import { useState } from "react"

interface ProductCardProps {
  product: {
    id: string
    title: string
    price: number
    images: string[]
    description: string
    originalPrice?: number
    volume?: string
  }
  textColor?: string
}

export default function ProductCard({ product, textColor }: ProductCardProps) {
  const { addToCart } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const router = useRouter()

  const handleSelectProduct = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsAdding(true)
    router.push(`/shop/${product.id}`)
  }

  // In a real app, this would come from product.images[1]
  const hoverImage = product.images[1] || "/smiling-african-woman-with-clear-skin.jpg"

  // We assume a 10-20% markup for original price visualization
  const originalPrice = product.originalPrice || Math.round(product.price * 1.15)
  const volume = product.volume || "120ml" // Placeholder to match design

  const titleColor = textColor || "text-foreground"
  const priceColor = textColor || "text-foreground"

  return (
    <Link href={`/shop/${product.id}`} className="group block h-full">
      <div className="regime-card p-0 h-full cursor-pointer transition-all duration-300 flex flex-col bg-transparent border-none shadow-none">
        {/* Image Container */}
        <div className="relative overflow-hidden aspect-[3/4] bg-[#f5f2eb] rounded-none mb-4 group-hover:shadow-lg transition-shadow">
          {/* Main Product Image */}
          <Image
            src={product.images?.[0] || "/placeholder.svg?height=600&width=450"}
            alt={product.title}
            fill
            className="object-cover object-center transition-opacity duration-500 group-hover:opacity-0"
          />

          {/* Hover Lifestyle Image */}
          <Image
            src={hoverImage || "/placeholder.svg"}
            alt={`${product.title} lifestyle`}
            fill
            className="object-cover object-center absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />

          {/* Desktop Select Button - Appears on Hover */}
          <div className="absolute bottom-0 left-0 right-0 p-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:block z-10">
            <button
              onClick={handleSelectProduct}
              disabled={isAdding}
              className="w-full font-mono font-bold  py-4 bg-primary-foreground text-foreground hover:bg-primary-foreground/90 transition-colors text-center uppercase tracking-wider text-sm rounded-none"
            >
              Select
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col items-start gap-1">
          <h3 className={`font-bold text-sm uppercase tracking-wide font-mono ${titleColor}`}>{product.title}</h3>

          <div className="flex items-center gap-3 text-lg font-bold">
            <span className={`font-bold text-[18px] font-mono ${priceColor}`}>₦{product.price.toLocaleString()}</span>
            <span className={`${textColor ? "opacity-60" : "text-muted-foreground"} line-through text-sm `}>
              ₦{originalPrice.toLocaleString()}
            </span>
          </div>

          {/* Mobile Select Button - Always Visible */}
          <button
            onClick={handleSelectProduct}
            disabled={isAdding}
            className="w-full mt-3 font-bold border border-foreground/70 py-3 bg-primary-foreground text-foreground hover:bg-primary-foreground/90 cursor-pointer transition-colors text-center uppercase tracking-wider text-xs md:hidden rounded-sm"
          >
            Select
          </button>
        </div>
      </div>
    </Link>
  )
}
