"use client"

import { useState, useEffect } from "react"
import ShopHeader from "@/components/shop/shop-header"
import ShopFilters from "@/components/shop/shop-filters"
import ProductGrid from "@/components/shop/product-grid"

export default function ShopPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    skinConcern: "",
    productType: "",
  })
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (filters.search) params.append("search", filters.search)
        if (filters.category) params.append("category", filters.category)
        if (filters.skinConcern) params.append("skinConcern", filters.skinConcern)
        if (filters.productType) params.append("productType", filters.productType)
        params.append("page", currentPage.toString())
        params.append("limit", "50")

        const response = await fetch(`/api/products?${params.toString()}`)
        const data = await response.json()
        setProducts(data.products || [])
      } catch (error) {
        console.error("Failed to fetch products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [filters, currentPage])

  return (
    <div className="overflow-x-hidden">
      <div className="pt-20 pb-0 px-4 md:px-6 bg-background">
        <ShopHeader />
      </div>

      <div className="bg-primary-foreground px-4 md:px-6 lg:px-9 py-8 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
          <ShopFilters filters={filters} setFilters={setFilters} setPage={setCurrentPage} />
          <ProductGrid products={products} loading={loading} />
        </div>
      </div>
    </div>
  )
}
