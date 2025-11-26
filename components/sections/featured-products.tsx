"use client"

import { useState, useEffect } from "react"
import ProductCard from "@/components/products/product-card"
import { motion } from "framer-motion"

interface Product {
  id: string
  title: string
  price: number
  images: string[]
  description: string
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch("/api/products/featured?limit=4")
        const data = await response.json()
        setProducts(data.products || [])
      } catch (error) {
        console.error("Failed to fetch products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  return (
    <section className="py-12 md:py-24 bg-background">
      <div className="regime-container px-4 md:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-start mb-3 md:mb-4 text-primary-foreground font-bold uppercase"
        >
          REGIME BEST SELLERS
        </motion.h2>
        <p className="text-sm md:text-base text-start text-primary-foreground/80 mb-8">
          Curated skincare essentials for every routine.
        </p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 md:h-96 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.15,
                  ease: "easeOut",
                }}
              >
                <ProductCard product={product} textColor="text-foreground" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
