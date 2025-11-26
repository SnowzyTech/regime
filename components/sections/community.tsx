"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Star } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Michelle",
    product: "Love!!!!!",
    rating: 5,
    date: "Apr 26, 2025",
    review: "The cleanser is amazing. I am really seeing a difference with the ONSKN brand.",
    image: "/skincare-product-bottle-cleanser.jpg",
  },
  {
    id: 2,
    name: "Pricilla",
    product: "Fade & Glow Serum",
    rating: 5,
    date: "Jan 30, 2025",
    review:
      "I'm really happy with the Fade and Glow Serum. It's helped even out my skin tone and reduced some of the imperfections. It's easy to use and absorbs quickly, which is perfect for my busy mornings.",
    image: "/african-woman-with-glowing-skin-looking-at-camera.jpg",
  },
  {
    id: 3,
    name: "Kyla",
    product: "Hydrating Gel Cleanser",
    rating: 5,
    date: "Jan 30, 2025",
    review:
      "The Hydrating Cleanser has been a game-changer for me. It cleans my skin really well without drying it out, which is great for my sensitive skin. I've noticed my pores look smaller and my skin looks clearer overall.",
    image: "/woman-with-red-lipstick-holding-skincare-product.jpg",
  },
  {
    id: 4,
    name: "Amara",
    product: "Vitamin C Cream",
    rating: 5,
    date: "Mar 05, 2025",
    review:
      "This brightening cream is amazing! My skin looks more radiant and feels so soft. I've been using it for two months and the dark spots have significantly faded.",
    image: "/smiling-african-woman-with-clear-skin.jpg",
  },
  {
    id: 5,
    name: "Chioma",
    product: "Niacinamide Serum",
    rating: 5,
    date: "Mar 15, 2025",
    review:
      "The niacinamide serum has transformed my skin texture. My pores are less visible and my skin tone is more even. It's lightweight and doesn't make my skin oily.",
    image: "/woman-with-smooth-skin-applying-serum.jpg",
  },
  {
    id: 6,
    name: "Zainab",
    product: "Moisturizer",
    rating: 5,
    date: "Apr 02, 2025",
    review:
      "My skin has never felt this hydrated! This moisturizer is perfect for my dry skin. It absorbs quickly and keeps my skin plump all day long.",
    image: "/woman-with-hydrated-glowing-skin.jpg",
  },
  {
    id: 7,
    name: "Ngozi",
    product: "SPF 50 Sunscreen",
    rating: 5,
    date: "May 08, 2025",
    review:
      "Finally, a sunscreen that doesn't leave a white cast! It's lightweight, non-greasy, and protects my skin perfectly. I wear it every day without fail now.",
    image: "/woman-applying-sunscreen-outdoors.jpg",
  },
]

export default function Community() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-12 md:py-24 bg-background overflow-hidden">
      <div className="regime-container px-4 md:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-start mb-8 md:mb-16"
        >
          WHY PEOPLE LOVE REGIME
        </motion.h2>

        <div className="relative">
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8"
              >
                {[0, 1, 2].map((offset) => {
                  const index = (currentIndex + offset) % testimonials.length
                  const testimonial = testimonials[index]

                  return (
                    <div
                      key={testimonial.id}
                      className={`bg-card flex flex-col sm:flex-row h-auto sm:h-64 w-full overflow-hidden shadow-sm rounded-lg ${
                        offset === 1 ? "hidden sm:flex" : ""
                      } ${offset === 2 ? "hidden md:flex" : ""}`}
                    >
                      <div className="relative h-48 sm:h-full sm:w-40 md:w-48 flex-shrink-0">
                        <Image
                          src={testimonial.image || "/placeholder.svg"}
                          alt={testimonial.product}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="p-4 md:p-5 space-y-2 md:space-y-3 flex-1">
                        <div className="flex justify-between items-center">
                          <div className="flex gap-1">
                            {Array.from({ length: testimonial.rating }).map((_, i) => (
                              <Star key={i} size={11} className="fill-[#d4a574] text-[#d4a574]" />
                            ))}
                          </div>
                          <p className="text-[12px] text-muted-foreground">{testimonial.date}</p>
                        </div>

                        <h3 className="text-lg md:text-xl font-medium text-foreground">{testimonial.product}</h3>

                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 md:line-clamp-4">
                          {testimonial.review}
                        </p>

                        <p className="text-sm text-muted-foreground/80 pt-1 md:pt-2">{testimonial.name}</p>
                      </div>
                    </div>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 md:mt-8 border-t border-primary-foreground" />
        </div>
      </div>
    </section>
  )
}
