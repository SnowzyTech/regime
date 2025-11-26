"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Star, Loader2 } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { getTestimonialsByProduct, type Testimonial } from "@/app/actions/testimonials"

interface ProductTestimonialsProps {
  productId: string
}

export function ProductTestimonials({ productId }: ProductTestimonialsProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await getTestimonialsByProduct(productId)
        if (res.success) {
          setTestimonials(res.testimonials)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [productId])

  if (loading) {
    return (
      <section className="py-24 bg-[#FDFBF7] flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C6A87C]" />
      </section>
    )
  }

  if (!testimonials || testimonials.length === 0) return null

  return (
    <section className="py-24 bg-background">
      <div className="regime-container">
        <h2 className="text-4xl font-bold uppercase text-start mb-16 text-foreground">
          Why people Love <br /> Regime
        </h2>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 10000,
              stopOnInteraction: false,
            }),
          ]}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {testimonials.map((testimonial) => (
              <CarouselItem key={testimonial.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="bg-white p-8 h-full flex flex-col shadow-sm hover:shadow-md transition-all duration-500 min-h-[30px]">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={`${i < testimonial.rating ? "fill-[#C6A87C] text-[#C6A87C]" : "fill-gray-200 text-gray-200"}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400 font-mono tracking-wider">{testimonial.date}</span>
                  </div>

                  <p className="text-gray-600 leading-relaxed text-sm flex-grow line-clamp-4 mb-6">
                    {testimonial.review}
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                      {testimonial.image_url ? (
                        <Image
                          src={testimonial.image_url || "/placeholder.svg"}
                          alt={testimonial.user_name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">
                          {testimonial.user_name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{testimonial.user_name}</p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:block">
            <CarouselPrevious className="-left-12 border-none bg-transparent hover:bg-transparent text-gray-400 hover:text-[#C6A87C]" />
            <CarouselNext className="-right-12 border-none bg-transparent hover:bg-transparent text-gray-400 hover:text-[#C6A87C]" />
          </div>
        </Carousel>

        <div className="mt-12 max-w-5xl mx-auto border-t border-primary-foreground" />
      </div>
    </section>
  )
}

export default ProductTestimonials
