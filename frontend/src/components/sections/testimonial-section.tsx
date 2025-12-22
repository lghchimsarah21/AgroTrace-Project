"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"

const testimonials = [
    {
        quote:
            "This crop recommendation system has completely transformed our farm's productivity. We've seen a 30% increase in yield by following the AI-powered suggestions.",
        author: "Sarah Johnson",
        role: "Wheat Farmer, Iowa",
        avatar: "/authentification.jpg?height=100&width=100",
    },
    {
        quote:
            "As a first-generation farmer, I needed guidance on what crops would work best on my land. This platform provided exactly what I needed with science-backed recommendations.",
        author: "Michael Chen",
        role: "Small-scale Farmer, California",
        avatar: "/authentification.jpg?height=100&width=100",
    },
    {
        quote:
            "The soil analysis integration and weather prediction features have helped us make better decisions about crop rotation and planting times. It's like having an agronomist on call 24/7.",
        author: "Jessica Williams",
        role: "Agricultural Cooperative Manager, Nebraska",
        avatar: "/authentification.jpg?height=100&width=100",
    },
]

export default function TestimonialSection() {
    const [currentIndex, setCurrentIndex] = useState(0)

    const nextTestimonial = () => {
        setCurrentIndex((prevIndex) => (prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1))
    }

    const prevTestimonial = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1))
    }

    return (
        <section id="testimonials" className="py-20 bg-gradient-to-br from-green-900 to-emerald-900 text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="text-center max-w-3xl mx-auto mb-16"
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold">Success Stories</h2>
                    <p className="mt-4 text-xl text-green-200">
                        Hear from farmers who have transformed their yields with our crop recommendations
                    </p>
                </motion.div>

                <div className="relative max-w-4xl mx-auto">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 md:p-12 shadow-xl"
                    >
                        <Quote className="h-12 w-12 text-green-300 mb-6" />
                        <p className="text-xl md:text-2xl font-medium mb-8">"{testimonials[currentIndex].quote}"</p>
                        <div className="flex items-center">
                            <img
                                src={testimonials[currentIndex].avatar || "/placeholder.svg"}
                                alt={testimonials[currentIndex].author}
                                className="w-14 h-14 rounded-full object-cover mr-4"
                            />
                            <div>
                                <h4 className="font-semibold text-lg">{testimonials[currentIndex].author}</h4>
                                <p className="text-green-200">{testimonials[currentIndex].role}</p>
                            </div>
                        </div>
                    </motion.div>

                    <div className="flex justify-center mt-8 space-x-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={prevTestimonial}
                            className="border-white text-white hover:bg-white/20"
                        >
                            <ChevronLeft className="h-6 w-6" />
                            <span className="sr-only">Previous testimonial</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={nextTestimonial}
                            className="border-white text-white hover:bg-white/20"
                        >
                            <ChevronRight className="h-6 w-6" />
                            <span className="sr-only">Next testimonial</span>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}

