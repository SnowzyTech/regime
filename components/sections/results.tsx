"use client"

import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"

const results = [
  {
    title: "Clinically Proven",
    description: "All formulas are dermatologist-tested and backed by clinical studies for visible results.",
    icon: "✓",
  },
  {
    title: "Science-Backed Ingredients",
    description: "We use pharmaceutical-grade active ingredients at clinically effective concentrations.",
    icon: "✓",
  },
  {
    title: "Suitable for All Skin Types",
    description: "Gentle yet effective formulations work seamlessly with sensitive, oily, dry, and combination skin.",
    icon: "✓",
  },
  {
    title: "No Harmful Chemicals",
    description: "Free from parabens, sulfates, and synthetic fragrances. Clean beauty you can trust.",
    icon: "✓",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
}

export default function ResultsSection() {
  return (
    <section className="py-12 md:py-24 bg-primary-foreground overflow-hidden">
      <div className="regime-container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">Formulated with Precision</h2>
          <p className="text-sm md:text-base text-foreground/80 max-w-2xl mx-auto">
            REGIME products are engineered to deliver maximum efficacy while respecting your skin&apos;s natural balance.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto"
        >
          {results.map((result, index) => (
            <motion.div key={index} variants={itemVariants} className="flex gap-4">
              <div className="flex-shrink-0 mt-1">
                <CheckCircle2 size={24} className="text-accent stroke-2" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{result.title}</h3>
                <p className="text-sm md:text-base text-foreground/70 leading-relaxed">{result.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
