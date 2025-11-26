"use client"

import ProductCard from "@/components/products/product-card"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

interface ProductGridProps {
  products: any[]
  loading: boolean
}

export default function ProductGrid({ products, loading }: ProductGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-muted-foreground">No products found. Try adjusting your filters.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              duration: 0.6,
              delay: index * 0.2, // Increased delay for more noticeable "one by one" effect
              ease: "easeOut",
            }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-12">
        {[...Array(5)].map((_, i) => (
          <button
            key={i}
            className="w-10 h-10 rounded border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  )
}
