"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { updateProductAction, createProductAction } from "@/app/actions/products"
import { uploadImageAction } from "@/app/actions/storage"
import { X, Upload, Loader2 } from "lucide-react"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CATEGORIES, PRODUCT_TYPES, SKIN_CONCERNS } from "@/lib/constants"

interface Product {
  id: string
  title: string
  price: number
  stock: number
  category: string
  description?: string
  images?: string[]
  product_type?: string
  skin_concern?: string
  sku?: string
  ingredients?: string[]
  application?: string
  warning?: string
}

interface ProductFormDialogProps {
  product: Product | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  mode: "create" | "edit"
}

export function ProductFormDialog({ product, isOpen, onOpenChange, onSuccess, mode }: ProductFormDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    stock: 0,
    category: "",
    productType: "",
    skinConcern: "",
    sku: "",
    ingredients: "",
    application: "",
    warning: "",
  })
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    if (mode === "edit" && product) {
      setFormData({
        title: product.title || "",
        description: product.description || "",
        price: product.price || 0,
        stock: product.stock || 0,
        category: product.category || "",
        productType: product.product_type || "",
        skinConcern: product.skin_concern || "",
        sku: product.sku || "",
        ingredients: product.ingredients ? product.ingredients.join(", ") : "",
        application: product.application || "",
        warning: product.warning || "",
      })
      setImages(product.images || [])
    } else if (mode === "create") {
      setFormData({
        title: "",
        description: "",
        price: 0,
        stock: 0,
        category: "",
        productType: "",
        skinConcern: "",
        sku: "",
        ingredients: "",
        application: "",
        warning: "",
      })
      setImages([])
    }
  }, [product, mode, isOpen])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB")
      return
    }

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const result = await uploadImageAction(formData)

      if (!result.success || !result.url) {
        toast.error(result.error || "Failed to upload image")
        return
      }

      setImages((prev) => [...prev, result.url!])
      toast.success("Image uploaded successfully")
    } catch (error) {
      toast.error("Failed to upload image")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = async (imageUrl: string) => {
    setImages((prev) => prev.filter((img) => img !== imageUrl))
    toast.success("Image removed")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.description || !formData.category || !formData.productType || !formData.sku) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      const productData = {
        ...formData,
        ingredients: formData.ingredients
          .split(",")
          .map((i) => i.trim())
          .filter((i) => i !== ""),
        images,
      }

      let result
      if (mode === "edit" && product?.id) {
        result = await updateProductAction(product.id, true, productData)
      } else {
        result = await createProductAction("admin", true, productData)
      }

      if (result.success) {
        toast.success(result.message)
        onOpenChange(false)
        onSuccess()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error(`Failed to ${mode} product`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] bg-primary-foreground overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add New Product" : "Edit Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Product Images</Label>
            <div className="mt-2 space-y-3">
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {images.map((imageUrl, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                      <Image
                        src={imageUrl || "/placeholder.svg"}
                        alt={`Product image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(imageUrl)}
                        className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:opacity-90"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
                <Label
                  htmlFor="image-upload"
                  className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors"
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      Upload Image
                    </>
                  )}
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Max file size: 5MB. Supported formats: JPG, PNG, WebP
                </p>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (₦) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div>
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number.parseInt(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="productType">Product Type *</Label>
              <Select
                value={formData.productType}
                onValueChange={(value) => setFormData({ ...formData, productType: value })}
              >
                <SelectTrigger id="productType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="skinConcern">Skin Concern</Label>
              <Select
                value={formData.skinConcern}
                onValueChange={(value) => setFormData({ ...formData, skinConcern: value })}
              >
                <SelectTrigger id="skinConcern">
                  <SelectValue placeholder="Select concern" />
                </SelectTrigger>
                <SelectContent>
                  {SKIN_CONCERNS.map((concern) => (
                    <SelectItem key={concern} value={concern}>
                      {concern}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g., REG-001"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="ingredients">Key Ingredients (comma separated)</Label>
            <Textarea
              id="ingredients"
              value={formData.ingredients}
              onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
              placeholder="e.g. Hyaluronic Acid, Vitamin C, Niacinamide"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="application">How to Apply</Label>
            <Textarea
              id="application"
              value={formData.application}
              onChange={(e) => setFormData({ ...formData, application: e.target.value })}
              placeholder="Describe how to use this product..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="warning">Warning / Cautions</Label>
            <Textarea
              id="warning"
              value={formData.warning}
              onChange={(e) => setFormData({ ...formData, warning: e.target.value })}
              placeholder="Any warnings or cautions for usage..."
              rows={2}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploadingImage}>
              {loading ? "Saving..." : mode === "create" ? "Create Product" : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
