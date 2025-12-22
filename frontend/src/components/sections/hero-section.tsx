"use client"

import { useRef, useState, useEffect } from "react"
import { Leaf, ChevronLeft, ChevronRight } from "lucide-react"

// Hero section data
const heroSections = [
    {
        image: "/test22.avif",
        subtitle: "Smart Farming Solution",
        title: "Grow Smarter with AI-Powered Crop Insights",
        description:
            "Get personalized crop recommendations and predictions based on your soil, climate, and local conditions for maximum yield and sustainability.",
    },
    {
        image: "/test22.avif",
        subtitle: "Data-Driven Agriculture",
        title: "Transform Your Farming with Technology",
        description:
            "Leverage advanced analytics and AI to make informed decisions about your crops and maximize your harvest.",
    },
    {
        image: "/test22.avif",
        subtitle: "Sustainable Practices",
        title: "Farm Smarter, Not Harder",
        description:
            "Reduce resource usage and increase yields with intelligent recommendations tailored to your specific conditions.",
    },
    {
        image: "/test22.avif",
        subtitle: "Future of Farming",
        title: "Join the Agricultural Revolution",
        description:
            "Be part of the next generation of farmers using cutting-edge technology to feed the world sustainably.",
    },
]

export default function HeroSection() {
    const [activeIndex, setActiveIndex] = useState(0)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const slidesContainerRef = useRef<HTMLDivElement>(null)

    // Function to go to the next slide
    const nextSlide = () => {
        if (isTransitioning) return

        setIsTransitioning(true)
        setActiveIndex((prev) => (prev === heroSections.length - 1 ? 0 : prev + 1))

        // Reset transitioning state after animation completes
        setTimeout(() => {
            setIsTransitioning(false)
        }, 1500) // Slightly longer than the transition duration
    }

    // Function to go to the previous slide
    const prevSlide = () => {
        if (isTransitioning) return

        setIsTransitioning(true)
        setActiveIndex((prev) => (prev === 0 ? heroSections.length - 1 : prev - 1))

        // Reset transitioning state after animation completes
        setTimeout(() => {
            setIsTransitioning(false)
        }, 1500) // Slightly longer than the transition duration
    }

    // Function to go to a specific slide
    const goToSlide = (index: number) => {
        if (index === activeIndex || isTransitioning) return

        setIsTransitioning(true)
        setActiveIndex(index)

        // Reset transitioning state after animation completes
        setTimeout(() => {
            setIsTransitioning(false)
        }, 1500) // Slightly longer than the transition duration
    }

    // Update the transform when activeIndex changes
    useEffect(() => {
        if (!slidesContainerRef.current) return

        const translateX = -activeIndex * 100
        slidesContainerRef.current.style.transform = `translateX(${translateX}%)`
    }, [activeIndex])

    return (
        <div className="relative w-full h-screen overflow-hidden bg-black">
            {/* Slides container with horizontal sliding */}
            <div
                ref={slidesContainerRef}
                className="flex w-full h-full will-change-transform"
                style={{
                    transition: "transform 1400ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
            >
                {/* Render all slides side by side */}
                {heroSections.map((section, index) => (
                    <div key={index} className="flex-shrink-0 w-full h-full relative">
                        {/* Background image with subtle zoom effect */}
                        <div
                            className={`absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-10000 ease-out ${
                                index === activeIndex ? "scale-105" : "scale-100"
                            }`}
                            style={{
                                backgroundImage: `url(${section.image || "/placeholder.svg?height=1080&width=1920"})`,
                                transition: "transform 8s ease-out",
                            }}
                        />

                        {/* Overlay with subtle gradient */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30" />

                        {/* Content with fade-in effect */}
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                            <div className="container mx-auto px-4">
                                <div
                                    className={`max-w-3xl mx-auto text-center text-white transition-opacity duration-1000 ${
                                        index === activeIndex ? "opacity-100" : "opacity-0"
                                    }`}
                                >
                                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 mb-4">
                                        <Leaf className="h-4 w-4 mr-2 text-green-400" />
                                        <span className="text-xs font-medium text-green-300">{section.subtitle}</span>
                                    </div>

                                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                                        {section.title.split(" ").map((word, i, arr) =>
                                                i === arr.length - 2 ? (
                                                    <span key={i}>
                          {word}{" "}
                                                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400">
                            {arr[arr.length - 1]}
                          </span>
                        </span>
                                                ) : i === arr.length - 1 ? null : (
                                                    <span key={i}>{word} </span>
                                                ),
                                        )}
                                    </h1>

                                    <p className="text-base md:text-lg text-gray-200/80 max-w-2xl mx-auto">{section.description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation arrows with improved hover effect */}
            <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 flex justify-between items-center px-4 sm:px-6 z-30">
                <button
                    onClick={prevSlide}
                    disabled={isTransitioning}
                    className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all ${
                        isTransitioning ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-110"
                    }`}
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="h-6 w-6 text-white" />
                </button>

                <button
                    onClick={nextSlide}
                    disabled={isTransitioning}
                    className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all ${
                        isTransitioning ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-110"
                    }`}
                    aria-label="Next slide"
                >
                    <ChevronRight className="h-6 w-6 text-white" />
                </button>
            </div>

            {/* Slide indicators with improved active state */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30">
                <div className="flex space-x-3">
                    {heroSections.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            disabled={isTransitioning}
                            className={`rounded-full transition-all duration-500 ${
                                activeIndex === index ? "w-4 h-4 bg-white" : "w-3 h-3 bg-white/40 hover:bg-white/60"
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* Auto-advance slides with 2.5 second interval */}
            <AutoAdvance onAdvance={nextSlide} interval={2500} isTransitioning={isTransitioning} />
        </div>
    )
}

// Component to handle auto-advancing slides
function AutoAdvance({
                         onAdvance,
                         interval = 5000,
                         isTransitioning = false,
                     }: {
    onAdvance: () => void
    interval?: number
    isTransitioning?: boolean
}) {
    useEffect(() => {
        // Only set up the timer if we're not currently transitioning
        if (isTransitioning) return

        const timer = setInterval(() => {
            onAdvance()
        }, interval)

        return () => clearInterval(timer)
    }, [onAdvance, interval, isTransitioning])

    return null
}

