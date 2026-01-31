"use client"
import { motion } from "framer-motion"

export default function ShopHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="mb-8 md:mb-16 pt-4 md:pt-6"
    >
      <div className="flex items-center gap-2 text-sm text-primary-foreground mb-4 md:mb-6">
        <span>Home</span>
        <span>/</span>
        <span>Shop</span>
      </div>

      <div className="space-y-3 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground break-words">
          Our Formulations
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-primary-foreground/90 font-mono max-w-2xl mx-auto px-2">
          Explore our curated formulations designed for optimal skin health and vitality.
        </p>
      </div>
    </motion.div>
  )
}
