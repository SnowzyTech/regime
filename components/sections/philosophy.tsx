"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export default function Philosophy() {
  return (
    <section className="py-12 md:py-24 bg-primary-foreground overflow-hidden">
      <div className="regime-container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.0, ease: "easeOut" }}
          >
            <div className="aspect-square rounded-lg bg-muted overflow-hidden relative">
              <Image
                src="/minimalist-skincare-laboratory-with-clean-products.jpg"
                alt="Skincare laboratory"
                fill
                className="object-cover"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.0, ease: "easeOut", delay: 0.3 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6">Our Philosophy</h2>
            <p className="text-sm md:text-base text-foreground mb-4 md:mb-6 leading-relaxed">
              At REGIME, we believe that skincare should be both scientifically sound and luxuriously simple. Every
              formula is crafted by dermatologists and tested rigorously to deliver visible results without compromise.
            </p>
            <button className="regime-button">Read More</button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
