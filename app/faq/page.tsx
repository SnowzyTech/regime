"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

interface FAQItem {
  question: string
  answer: string
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs: FAQItem[] = [
    {
      question: "Are REGIME products dermatologist-tested?",
      answer:
        "Yes, all REGIME products are formulated by board-certified dermatologists and rigorously tested for safety and efficacy. We conduct clinical trials and dermatological assessments before launch.",
    },
    {
      question: "Can I use REGIME products with sensitive skin?",
      answer:
        "REGIME products are formulated to be gentle and inclusive. However, we recommend doing a patch test first. If you have specific allergies, please review the ingredients list or contact our support team.",
    },
    {
      question: "How long before I see results?",
      answer:
        "Most customers notice visible improvements within 4-6 weeks of consistent use. For best results, use morning and evening as directed and maintain the full routine.",
    },
    {
      question: "Do you offer international shipping?",
      answer:
        "Yes, we ship to 50+ countries. International orders typically arrive within 10-14 business days. Shipping costs and delivery times vary by location.",
    },
    {
      question: "What is your return policy?",
      answer:
        "We offer 30-day returns on unused, unopened products in original packaging. Once we receive and inspect your return, refunds are processed within 5-7 business days.",
    },
    {
      question: "Are REGIME products cruelty-free?",
      answer:
        "Yes, REGIME is 100% cruelty-free and not tested on animals. We are committed to ethical, sustainable skincare practices.",
    },
  ]

  return (
    <div className="pt-32 pb-24 bg-background min-h-screen">
      <div className="regime-container max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16 text-center">
          <h1 className="regime-section-title mb-4">Frequently Asked Questions</h1>
          <p className="regime-section-subtitle">Everything you need to know about REGIME</p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full regime-card text-left flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <span className="font-semibold text-lg">{faq.question}</span>
                <ChevronDown
                  size={24}
                  className={`transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="regime-card mt-2 bg-secondary">
                      <p className="text-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
