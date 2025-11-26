"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, Edit2, Trash2, Search, ArrowLeft } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { deleteProductAction } from "@/app/actions/products"
import { ProductFormDialog } from "@/components/admin/product-form-dialog"
import { Input } from "@/components/ui/input"

interface Product {
  id: string
  title: string
  price: number
  stock: number
  category: string
  description?: string
  images?: string[]
  ingredients?: string[]
  application?: string
  product_type?: string
  skin_concern?: string
  sku?: string
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("edit")
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/admin/session", {
          credentials: "include",
        })
        if (!response.ok) {
          router.push("/admin/login")
        }
      } catch {
        router.push("/admin/login")
      }
      setLoading(false)
    }

    checkAuth()
  }, [router])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products?page=1&limit=100")
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
        setFilteredProducts(data.products || [])
      }
    } catch (error) {
      console.error("Failed to fetch products:", error)
      toast.error("Failed to load products")
    }
  }

  useEffect(() => {
    if (!loading) {
      fetchProducts()
    }
  }, [loading])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProducts(products)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredProducts(
        products.filter(
          (product) =>
            product.title.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query) ||
            (product.sku && product.sku.toLowerCase().includes(query)),
        ),
      )
    }
  }, [searchQuery, products])

  const handleCreate = () => {
    setSelectedProduct(null)
    setDialogMode("create")
    setIsFormOpen(true)
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setDialogMode("edit")
    setIsFormOpen(true)
  }

  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.title}"?`)) return

    try {
      const result = await deleteProductAction(product.id, true)
      if (result.success) {
        toast.success(result.message)
        fetchProducts()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error("Failed to delete product")
    }
  }

  if (loading) {
    return <div className="pt-8 text-center">Loading...</div>
  }

  return (
    <div className="pb-24 bg-primary-foreground min-h-screen">
      <div className="mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center bg-primary-foreground border p-3 rounded-sm gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </div>

      <div className="mb-6">
        <div className="flex flex-col w-full md:flex-row items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <button
            onClick={handleCreate}
            className="regime-button cursor-pointer flex bg-secondary text-foreground items-center w-full md:w-auto mt-5 justify-center gap-2 whitespace-nowrap"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>

        <div className="relative w-full text-foreground">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground" size={18} />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full text-foreground bg-secondary"
          />
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="regime-card text-center py-16">
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? "No products found matching your search."
              : "No products found. Create your first product to get started."}
          </p>
          {!searchQuery && (
            <button onClick={handleCreate} className="regime-button inline-flex items-center gap-2">
              <Plus size={20} />
              Create First Product
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="regime-card overflow-hidden hover:shadow-lg transition-shadow">
              <div className="w-full h-48 bg-muted relative overflow-hidden rounded-t-lg">
                {product.images && product.images[0] ? (
                  <Image
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 line-clamp-2">{product.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{product.category || "N/A"}</p>

                <div className="flex items-center justify-between mb-4">
                  <p className="text-xl font-semibold text-accent">₦{product.price.toLocaleString()}</p>
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded ${
                      product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {product.stock} in stock
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-3 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity text-sm"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProductFormDialog
        product={selectedProduct}
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={() => {
          setSelectedProduct(null)
          fetchProducts()
        }}
        mode={dialogMode}
      />
    </div>
  )
}
