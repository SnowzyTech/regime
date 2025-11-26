"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Users, Beaker, Leaf } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="bg-background overflow-x-hidden">
      <section className="relative min-h-[400px] md:min-h-[500px] flex items-center justify-center overflow-hidden pt-24 md:pt-32 pb-16 md:pb-20 bg-primary-foreground">
        <div className="regime-container text-center px-4 md:px-6">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white mb-4"
          >
            The Intersection of <br className="hidden sm:block" /> Science and Self.
          </motion.h1>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-12 md:py-24 border-b border-border bg-primary text-primary-foreground">
        <div className="regime-container px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="rounded-lg overflow-hidden aspect-square bg-secondary"
            >
              <Image
                src="/abstract-wood-rings-pattern.jpg"
                alt="Our Story"
                width={500}
                height={500}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-primary-foreground mb-4 md:mb-6">
                Our Story
              </h2>
              <p className="text-base md:text-lg text-primary-foreground/90 mb-4 leading-relaxed">
                REGIME was founded on the principle that true radiance comes from scientifically-backed, personalized
                care. We believe in a minimalist approach, focusing on what's essential and effective to deliver
                transforming results.
              </p>
              <p className="text-sm md:text-base text-primary-foreground/80 leading-relaxed">
                Our journey began with a simple vision: to create a sanctuary where dermatological expertise meets
                bespoke care, crafting a personalized path to your skin's best potential.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-12 md:py-24 border-b border-border bg-primary-foreground">
        <div className="regime-container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-10 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-foreground mb-4">Our Philosophy</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Our approach is guided by three core principles that ensure a seamless journey from consultation to
              lasting results.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: Users,
                title: "Bespoke Care",
                description: "Every treatment is tailored to your unique skin profile and personal goals.",
              },
              {
                icon: Beaker,
                title: "Scientific Integrity",
                description: "We utilize only the most advanced, evidence-based dermatological practices.",
              },
              {
                icon: Leaf,
                title: "Lasting Results",
                description: "Our focus is on creating sustainable health and ensuring beauty for your skin.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.2 }}
                className="text-center p-4"
              >
                <div className="mb-4 flex justify-center">
                  <item.icon className="w-10 h-10 md:w-12 md:h-12 text-primary" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">{item.title}</h3>
                <p className="text-sm md:text-base text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet the Founder */}
      <section className="py-12 md:py-24 border-b border-border bg-primary text-primary-foreground">
        <div className="regime-container px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="rounded-lg overflow-hidden aspect-square bg-muted order-2 lg:order-1"
            >
              <Image
                src="/professional-woman-doctor-glasses.png"
                alt="Dr. Evelyn Reed"
                width={500}
                height={500}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="order-1 lg:order-2"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-primary-foreground mb-4">
                Meet The Founder
              </h2>
              <p className="text-sm md:text-base text-primary-foreground/90 mb-4 leading-relaxed">
                Dr. Evelyn Reed is a board-certified dermatologist with over 15 years of experience in cosmetic and
                medical dermatology. Her passion for skin health is matched only by her dedication to her patients,
                combining meticulous attention with a deep scientific approach to care.
              </p>
              <blockquote className="border-l-4 border-white/30 pl-4 md:pl-6 py-3 md:py-4 mb-4 md:mb-6 italic text-sm md:text-base text-primary-foreground/90">
                "Beauty is not about perfection. It's about revealing the health and confidence that lies within. My
                role is to be your guide on that journey."
              </blockquote>
              <p className="text-sm md:text-base text-primary-foreground/70">Dr. Evelyn Reed, MD, FAD</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Space */}
      <section className="py-12 md:py-24 border-b border-border bg-primary-foreground">
        <div className="regime-container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8 md:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-foreground mb-4">The Space</h2>
            <p className="text-base md:text-lg text-muted-foreground">
              Our clinic is designed to be a tranquil escape. Every detail, from the minimalist architecture to the
              thoughtfully curated features, has been created to create an environment that promotes comfort and
              confidence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="rounded-lg overflow-hidden aspect-square bg-muted"
            >
              <Image
                src="/minimalist-clinic-waiting-room.jpg"
                alt="Clinic waiting room"
                width={400}
                height={400}
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
              className="rounded-lg overflow-hidden aspect-square bg-muted"
            >
              <Image
                src="/medical-treatment-bed-clinic.jpg"
                alt="Treatment room"
                width={400}
                height={400}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-24">
        <div className="regime-container text-center px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Begin Your Journey
            </h2>
            <p className="text-base md:text-lg text-primary-foreground/90 max-w-2xl mx-auto mb-6 md:mb-8 px-2">
              Take the first step towards realizing your skin's best potential. Schedule a personal consultation to
              discover your bespoke REGIME.
            </p>
            <Link
              href="/contact"
              className="inline-block px-6 md:px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Book a Consultation
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
