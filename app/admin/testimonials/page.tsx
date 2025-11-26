"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { createTestimonial, getAllTestimonials, deleteTestimonial, updateTestimonial } from "@/app/actions/testimonials"
import { getProducts } from "@/app/actions/products"
import { Trash2, Plus, Star, Upload, ImageIcon, Edit, Search, X, ArrowLeft } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [filteredTestimonials, setFilteredTestimonials] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const [formData, setFormData] = useState({
    product_id: "",
    user_name: "",
    rating: 5,
    review: "",
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    image_url: "",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTestimonials(testimonials)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredTestimonials(
        testimonials.filter(
          (testimonial) =>
            testimonial.user_name.toLowerCase().includes(query) ||
            testimonial.review.toLowerCase().includes(query) ||
            (testimonial.products?.title && testimonial.products.title.toLowerCase().includes(query)),
        ),
      )
    }
    setCurrentPage(1)
  }, [searchQuery, testimonials])

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentTestimonials = filteredTestimonials.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredTestimonials.length / itemsPerPage)

  async function loadData() {
    try {
      const [tRes, pRes] = await Promise.all([getAllTestimonials(), getProducts()])

      if (tRes.success) {
        setTestimonials(tRes.testimonials)
        setFilteredTestimonials(tRes.testimonials)
      }
      if (pRes.success) setProducts(pRes.products)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.product_id) {
      toast.error("Please select a product")
      return
    }

    if (isEditing && currentId) {
      const res = await updateTestimonial(currentId, formData)
      if (res.success) {
        toast.success("Testimonial updated")
        resetForm()
        loadData()
      } else {
        toast.error("Failed to update testimonial")
      }
    } else {
      const res = await createTestimonial(formData)
      if (res.success) {
        toast.success("Testimonial created")
        resetForm()
        loadData()
      } else {
        toast.error("Failed to create testimonial")
      }
    }
  }

  function resetForm() {
    setIsDialogOpen(false)
    setIsEditing(false)
    setCurrentId(null)
    setFormData({
      product_id: "",
      user_name: "",
      rating: 5,
      review: "",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      image_url: "",
    })
  }

  function handleEdit(testimonial: any) {
    setFormData({
      product_id: testimonial.product_id,
      user_name: testimonial.user_name,
      rating: testimonial.rating,
      review: testimonial.review,
      date: testimonial.date,
      image_url: testimonial.image_url || "",
    })
    setCurrentId(testimonial.id)
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return
    const res = await deleteTestimonial(id)
    if (res.success) {
      toast.success("Deleted")
      loadData()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, image_url: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  if (loading) return <div className="p-12 text-center">Loading...</div>

  return (
    <div className="bg-primary-foreground min-h-screen md:p-4 p-2 ">
      <div className="mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center bg-primary-foreground border p-3 rounded-sm gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-light">Manage Testimonials</h1>
        <button
          onClick={() => {
            setIsEditing(false)
            setCurrentId(null)
            setFormData({
              product_id: "",
              user_name: "",
              rating: 5,
              review: "",
              date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
              image_url: "",
            })
            setIsDialogOpen(true)
          }}
          className="bg-accent text-white text-center md:w-auto w-full px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus size={18} /> Add New Testimonial
        </button>
      </div>

      <div className="mb-6">
        <div className="relative w-full text-foreground">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground" size={18} />
          <input
            type="text"
            placeholder="Search testimonials by name, review or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 py-3 w-full rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] bg-primary-foreground overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product</label>
              <select
                className="w-full p-2 border rounded"
                value={formData.product_id}
                onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                required
              >
                <option value="">Select a product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">User Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={formData.user_name}
                  onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  placeholder="e.g. Jan 30, 2025"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className={`${formData.rating >= star ? "text-yellow-500" : "text-gray-300"}`}
                  >
                    <Star fill={formData.rating >= star ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Review</label>
              <textarea
                className="w-full p-2 border rounded h-24"
                value={formData.review}
                onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">User Image</label>
              <div className="flex items-start gap-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 overflow-hidden relative"
                >
                  {formData.image_url ? (
                    <Image src={formData.image_url || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                  ) : (
                    <ImageIcon className="text-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded mb-2 block"
                  >
                    <Upload size={14} className="inline mr-1" /> Upload Photo
                  </button>
                  <input
                    type="text"
                    className="w-full p-2 border rounded text-sm"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="Or paste image URL..."
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full bg-black text-white py-2 rounded">
              {isEditing ? "Update Testimonial" : "Create Testimonial"}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {currentTestimonials.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          {searchQuery ? "No testimonials found matching your search." : "No testimonials yet."}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentTestimonials.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-lg shadow border overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="w-full h-48 bg-muted relative overflow-hidden">
                  {t.image_url ? (
                    <Image src={t.image_url || "/placeholder.svg"} alt={t.user_name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ImageIcon size={48} className="text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 truncate">{t.products?.title || "Unknown Product"}</h3>

                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">{t.user_name}</p>
                    <div className="flex text-yellow-500">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">{t.review}</p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(t)}
                      className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
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

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded border transition-colors ${
                    currentPage === i + 1 ? "bg-accent text-white border-accent" : "border-border hover:bg-accent/10"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
