import Hero from "@/components/sections/hero"
import FeaturedProducts from "@/components/sections/featured-products"
import Community from "@/components/sections/community"
import Philosophy from "@/components/sections/philosophy"
import NewsletterCTA from "@/components/sections/newsletter-cta"

export const metadata = {
  title: "REGIME - Dermatology Skincare | Science-Backed Formulas",
  description: "Dermatology-grade skincare redefined. Science-backed formulas for modern skin health.",
}

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <Hero />
      <FeaturedProducts />
      <Philosophy />
      <Community />
      <NewsletterCTA />
    </main>
  )
}
