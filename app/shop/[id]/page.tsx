"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/hooks/use-cart"
import { motion } from "framer-motion"
import { ShoppingCart, Plus, Minus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import ProductTestimonials from "@/components/product-testimonials"
import { getTestimonialsByProduct, type Testimonial } from "@/app/actions/testimonials"

interface Product {
  id: string
  title: string
  price: number
  description: string
  images: string[]
  ingredients: string[]
  application?: string
  stock: number
  skin_concern?: string
  product_type: string
  warning?: string
}

function RelatedProductsSection({ currentProduct, allProducts }: { currentProduct: Product; allProducts: Product[] }) {
  let related = allProducts.filter((p) => p.skin_concern === currentProduct.skin_concern && p.id !== currentProduct.id)

  if (related.length === 0) {
    related = allProducts.filter((p) => p.id !== currentProduct.id).slice(0, 2)
  }

  if (related.length === 0) return null

  return (
    <section className="w-full bg-secondary/20 py-20">
      <div className="regime-container">
        <h2 className="text-4xl font-bold text-foreground mb-12 text-start uppercase">You might also Like</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {related.map((product) => (
            <Link href={`/shop/${product.id}`} key={product.id} className="group block bg-transparent">
              <div className="aspect-[3/4] w-full relative bg-[#F5F5F5] overflow-hidden mb-6">
                <Image
                  src={product.images[0] || "/placeholder.svg"}
                  alt={product.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex justify-between items-start px-1">
                <div>
                  <h3 className="font-bold text-foreground/80 text-lg uppercase tracking-wide mb-1">{product.title}</h3>
                </div>
                <p className="text-foreground/80 text-lg font-mono font-bold">₦{product.price.toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [allProducts, setAllProducts] = useState<Product[]>([]) // Store all products for filtering
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState("30ml / 10 fl oz")
  const [activeTab, setActiveTab] = useState("description")
  const { addToCart } = useCart()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${id}`)
        const data = await response.json()
        setProduct(data.product)

        const testimonialResult = await getTestimonialsByProduct(id)
        if (testimonialResult.success) {
          setTestimonials(testimonialResult.testimonials)
        }

        const allRes = await fetch(`/api/products?limit=100`) // Fetch enough to filter
        const allData = await allRes.json()
        setAllProducts(allData.products || [])
      } catch (error) {
        console.error("Failed to fetch product:", error)
        toast.error("Failed to load product")
      }
    }

    fetchProduct()
  }, [id])

  if (!product) {
    return (
      <div className="pt-32 pb-24 regime-container min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  const handleAddToCart = () => {
    addToCart(product.id, quantity, selectedSize, product.title, product.price, product.images[0])
    toast.success(`${product.title} - ${quantity} item(s) added to cart!`)
  }

  const sizes = ["30ml / 10 fl oz", "50ml / 1.7 fl oz", "100ml / 3.4 fl oz"]

  return (
    <div className="pt-32 bg-primary-foreground">
      <div className="regime-container pb-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-2 text-sm text-foreground mb-8"
        >
          <Link href="/" className="hover:text-accent text-foreground">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-accent text-foreground">
            Shop
          </Link>
          <span>/</span>
          <span className="text-background font-bold font-mono">{product.title.split(" ").slice(0, 2).join(" ")}</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="mb-6 rounded-lg overflow-hidden bg-secondary aspect-square">
              <Image
                src={product.images[selectedImage] || "/placeholder.svg?height=600&width=600"}
                alt={product.title}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-24 h-24 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? "border-accent" : "border-border"
                    }`}
                  >
                    <Image
                      src={image || "/placeholder.svg?height=100&width=100"}
                      alt={`${product.title} ${index + 1}`}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold font-sans uppercase text-foreground/90 mb-2">{product.title}</h1>
            <p className="text-lg text-foreground/80 mb-6 font-sans">{product.description}</p>
            <p className="text-3xl font-bold text-accent mb-10 font-mono">₦{product.price.toLocaleString()}</p>

            {/* <div className="mb-8">
              <label className="block text-sm font-semibold mb-3">Size</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-input focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {sizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div> */}

            <div className="mb-8">
              <label className="block text-sm font-semibold mb-3 font-mono">Quantity</label>
              <div className="flex items-center border border-border rounded-lg w-fit font-mono">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-muted transition-colors"
                >
                  <Minus size={18} />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-muted transition-colors">
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full py-3  font-mono bg-background font-bold text-primary-foreground shadow-lg hover:opacity-90 transition-opacity mb-4 flex items-center justify-center gap-2 cursor-pointer rounded-sm"
            >
              <ShoppingCart size={20} />
              Add to Bag
            </button>

            <p
              className={`text-sm font-mono font-bold ${product.stock > 0 ? "text-accent font-bold" : "text-red-600"}`}
            >
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </p>

            <div className="mt-8 space-y-4">
              <div className="border-b border-foreground/60">
                <button
                  onClick={() => setActiveTab(activeTab === "description" ? "" : "description")}
                  className="w-full py-4 flex items-center justify-between hover:text-accent transition-colors"
                >
                  <h3 className="font-semibold uppercase text-sm tracking-wider">Description</h3>
                  <span className="text-xl">{activeTab === "description" ? "−" : "+"}</span>
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: activeTab === "description" ? "auto" : 0,
                    opacity: activeTab === "description" ? 1 : 0,
                  }}
                  className="overflow-hidden"
                >
                  <div className="pb-4">
                    <p className="text-foreground/80 leading-relaxed">{product.description}</p>
                  </div>
                </motion.div>
              </div>

              <div className="border-b border-foreground/60">
                <button
                  onClick={() => setActiveTab(activeTab === "ingredients" ? "" : "ingredients")}
                  className="w-full py-4 flex items-center justify-between hover:text-accent transition-colors"
                >
                  <h3 className="font-semibold uppercase text-sm tracking-wider">Key Ingredients</h3>
                  <span className="text-xl">{activeTab === "ingredients" ? "−" : "+"}</span>
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: activeTab === "ingredients" ? "auto" : 0,
                    opacity: activeTab === "ingredients" ? 1 : 0,
                  }}
                  className="overflow-hidden"
                >
                  <div className="pb-4">
                    <ul className="space-y-2">
                      {product.ingredients.map((ingredient) => (
                        <li key={ingredient} className="flex items-center gap-3 text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                          <span className="text-foreground/80">{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </div>

              <div className="border-b border-foreground/60">
                <button
                  onClick={() => setActiveTab(activeTab === "application" ? "" : "application")}
                  className="w-full py-4 flex items-center justify-between hover:text-accent transition-colors"
                >
                  <h3 className="font-semibold uppercase text-sm tracking-wider">How to Apply</h3>
                  <span className="text-xl">{activeTab === "application" ? "−" : "+"}</span>
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: activeTab === "application" ? "auto" : 0,
                    opacity: activeTab === "application" ? 1 : 0,
                  }}
                  className="overflow-hidden"
                >
                  <div className="pb-4">
                    <p className="text-foreground/80 leading-relaxed">
                      {product.application ||
                        "Apply a pea-sized amount to clean, damp skin. Pat gently until fully absorbed. Use morning and/or evening as directed."}
                    </p>
                  </div>
                </motion.div>
              </div>

              <div className="border-b border-foreground/80">
                <button
                  onClick={() => setActiveTab(activeTab === "warning" ? "" : "warning")}
                  className="w-full py-4 flex items-center justify-between hover:text-red-500 transition-colors"
                >
                  <h3 className="font-semibold uppercase text-sm tracking-wider">Warning / Cautions</h3>
                  <span className="text-xl">{activeTab === "warning" ? "−" : "+"}</span>
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: activeTab === "warning" ? "auto" : 0,
                    opacity: activeTab === "warning" ? 1 : 0,
                  }}
                  className="overflow-hidden"
                >
                  <div className="pb-4">
                    <p className="text-foreground/80 leading-relaxed">
                      {product.warning ||
                        "For external use only. Avoid direct contact with eyes. Discontinue use if irritation occurs."}
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <ProductTestimonials productId={id} />

      {product && <RelatedProductsSection currentProduct={product} allProducts={allProducts} />}
    </div>
  )
}
