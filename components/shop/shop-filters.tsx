"use client"

import { useState } from "react"
import { Search, ChevronDown, X } from "lucide-react"
import { SKIN_CONCERNS, PRODUCT_TYPES, CATEGORIES } from "@/lib/constants"

interface ShopFiltersProps {
  filters: {
    search: string
    category: string
    skinConcern: string
    productType: string
  }
  setFilters: (filters: any) => void
  setPage: (page: number) => void
}

export default function ShopFilters({ filters, setFilters, setPage }: ShopFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value })
    setPage(1)
    setOpenDropdown(null)
  }

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown)
  }

  const clearFilter = (key: string) => {
    setFilters({ ...filters, [key]: "" })
    setPage(1)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden w-full mb-4 flex items-center justify-between p-4 bg-card border border-border rounded-lg"
      >
        <span className="font-semibold">Filters</span>
        <ChevronDown size={20} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <div className={`${isOpen ? "block" : "hidden"} lg:block w-full lg:col-span-4`}>
        <div className="regime-card">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative ">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
              {filters.search && (
                <button
                  onClick={() => clearFilter("search")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("category")}
                className="w-full flex items-center justify-between px-4 py-3 bg-secondary border border-border rounded-lg hover:border-accent transition-colors"
              >
                <span className={filters.category ? "text-primary-foreground" : "text-muted-foreground"}>
                  {filters.category || "All Categories"}
                </span>
                <ChevronDown
                  size={20}
                  className={`transition-transform ${openDropdown === "category" ? "rotate-180" : ""}`}
                />
              </button>
              {openDropdown === "category" && (
                <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  <button
                    onClick={() => handleFilterChange("category", "")}
                    className="w-full text-left px-4 py-2 hover:bg-accent/10 transition-colors"
                  >
                    All Categories
                  </button>
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleFilterChange("category", category)}
                      className={`w-full text-left px-4 py-2 hover:bg-accent/10 transition-colors ${
                        filters.category === category ? "bg-accent/10 font-medium" : ""
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Skin Concern Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("skinConcern")}
                className="w-full flex items-center justify-between px-4 py-3 bg-secondary border border-border rounded-lg hover:border-accent transition-colors"
              >
                <span className={filters.skinConcern ? "text-foreground" : "text-muted-foreground"}>
                  {filters.skinConcern || "All Skin Concerns"}
                </span>
                <ChevronDown
                  size={20}
                  className={`transition-transform ${openDropdown === "skinConcern" ? "rotate-180" : ""}`}
                />
              </button>
              {openDropdown === "skinConcern" && (
                <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  <button
                    onClick={() => handleFilterChange("skinConcern", "")}
                    className="w-full text-left px-4 py-2 hover:bg-accent/10 transition-colors"
                  >
                    All Skin Concerns
                  </button>
                  {SKIN_CONCERNS.map((concern) => (
                    <button
                      key={concern}
                      onClick={() => handleFilterChange("skinConcern", concern)}
                      className={`w-full text-left px-4 py-2 hover:bg-accent/10 transition-colors ${
                        filters.skinConcern === concern ? "bg-accent/10 font-medium" : ""
                      }`}
                    >
                      {concern}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Type Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("productType")}
                className="w-full flex items-center justify-between px-4 py-3 bg-secondary border border-border rounded-lg hover:border-accent transition-colors"
              >
                <span className={filters.productType ? "text-foreground" : "text-muted-foreground"}>
                  {filters.productType || "All Product Types"}
                </span>
                <ChevronDown
                  size={20}
                  className={`transition-transform ${openDropdown === "productType" ? "rotate-180" : ""}`}
                />
              </button>
              {openDropdown === "productType" && (
                <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  <button
                    onClick={() => handleFilterChange("productType", "")}
                    className="w-full text-left px-4 py-2 hover:bg-accent/10 transition-colors"
                  >
                    All Product Types
                  </button>
                  {PRODUCT_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleFilterChange("productType", type)}
                      className={`w-full text-left px-4 py-2 hover:bg-accent/10 transition-colors ${
                        filters.productType === type ? "bg-accent/10 font-medium" : ""
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
