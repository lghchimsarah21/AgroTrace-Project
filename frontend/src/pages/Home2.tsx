"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { ArrowUp } from "lucide-react"
import HeroSection from "@/components/sections/hero-section"
import FeatureSection from "@/components/sections/feature-section"
import HowItWorksSection from "@/components/sections/how-it-works"
import TestimonialSection from "@/components/sections/testimonial-section"
import CTASection from "@/components/sections/cta-section"
import Navbar from "@/components/navbar"

export default function Home() {
    // Add state to track scrolling
    const [isScrolling, setIsScrolling] = useState(false)
    const [showTopArrow, setShowTopArrow] = useState(false)
    const [scrollPosition, setScrollPosition] = useState(0)
    const [scrollProgress, setScrollProgress] = useState(0)

    // Reference to the scrollable container
    const containerRef = useRef<HTMLDivElement>(null)
    const topRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Find the scrollable element
        const findScrollableParent = () => {
            // Try to find which element is actually scrolling
            const elements = [
                document.documentElement, // <html>
                document.body, // <body>
                containerRef.current, // Our container
                document.querySelector(".app-container"),
                document.querySelector(".content-container"),
            ].filter(Boolean)

            return (
                elements.find(
                    (el) =>
                        el &&
                        el.scrollHeight > el.clientHeight &&
                        ["auto", "scroll"].includes(getComputedStyle(el as Element).overflowY),
                ) || window
            )
        }

        // Wait for component to fully render
        setTimeout(() => {
            const scrollableElement = findScrollableParent()
            console.log(
                "Scrollable element found:",
                scrollableElement === window ? "Window" : (scrollableElement as Element).tagName,
            )

            // Calculate max scroll distance
            const getMaxScroll = () => {
                if (scrollableElement === window) {
                    return document.documentElement.scrollHeight - window.innerHeight
                } else {
                    return (scrollableElement as Element).scrollHeight - (scrollableElement as Element).clientHeight
                }
            }

            // Initial check
            const initialPos = scrollableElement === window ? window.scrollY : (scrollableElement as Element).scrollTop

            setScrollPosition(initialPos)
            setIsScrolling(initialPos > 10)
            setShowTopArrow(initialPos > 100)

            // Calculate initial progress
            const maxScroll = getMaxScroll()
            const initialProgress = maxScroll > 0 ? (initialPos / maxScroll) * 100 : 0
            setScrollProgress(initialProgress)

            let scrollTimeout: NodeJS.Timeout

            // Scroll handler
            const handleScroll = () => {
                const currentPos = scrollableElement === window ? window.scrollY : (scrollableElement as Element).scrollTop

                setShowTopArrow(currentPos > 100)

                // When scrolling stops, hide arrow after a delay
                clearTimeout(scrollTimeout)
                scrollTimeout = setTimeout(() => {
                    if (currentPos <= 100) {
                        setShowTopArrow(false)
                    }
                }, 800)

                setScrollPosition(currentPos)
                setIsScrolling(currentPos > 10)

                // Calculate progress percentage
                const maxScroll = getMaxScroll()
                const progress = maxScroll > 0 ? (currentPos / maxScroll) * 100 : 0
                setScrollProgress(progress)
            }

            // Add event listener to the correct element
            if (scrollableElement === window) {
                window.addEventListener("scroll", handleScroll, { passive: true })
            } else {
                ;(scrollableElement as Element).addEventListener("scroll", handleScroll, { passive: true })
            }

            // Clean up
            return () => {
                if (scrollableElement === window) {
                    window.removeEventListener("scroll", handleScroll)
                } else {
                    ;(scrollableElement as Element).removeEventListener("scroll", handleScroll)
                }
            }
        }, 500) // Small delay to ensure DOM is fully rendered
    }, [])

    // Add a function to handle smooth scrolling for all anchor links
    useEffect(() => {
        // Handle smooth scrolling for all anchor links
        const handleAnchorClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            const anchor = target.closest("a")

            if (anchor && anchor.hash && anchor.hash.startsWith("#")) {
                e.preventDefault()
                const targetElement = document.querySelector(anchor.hash)
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: "smooth" })
                }
            }
        }

        document.addEventListener("click", handleAnchorClick)

        return () => {
            document.removeEventListener("click", handleAnchorClick)
        }
    }, [])

    const scrollToTop = () => {
        if (topRef.current) {
            topRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }

    return (
        <div className="app-container" ref={containerRef}>
            <div ref={topRef} id="top"></div>

            {/* Navbar with integrated progress bar */}
            <div className="fixed top-0 left-0 right-0 z-50">
                <Navbar isScrolling={isScrolling}
                scrollToTop={scrollToTop}
                />

                {/* Progress bar that appears below the navbar when scrolling */}
                <motion.div
                    className="h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"
                    initial={{ width: "0%" }}
                    animate={{
                        width: `${scrollProgress}%`,
                        opacity: isScrolling ? 1 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                />
            </div>

            <div className="content-container">
                <HeroSection />
                <FeatureSection />
                <HowItWorksSection />
                <TestimonialSection />
                <CTASection />
            </div>

            {/* Scroll to top button */}
            {showTopArrow && (
                <motion.div
                    className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg z-50 cursor-pointer transition-all duration-300 flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        y: [0, -10, 0],
                    }}
                    transition={{
                        duration: 0.3,
                        y: { repeat: Number.POSITIVE_INFINITY, duration: 1.5, ease: "easeInOut" },
                    }}
                    onClick={scrollToTop}
                >
                    <ArrowUp size={24} />
                </motion.div>
            )}
        </div>
    )
}

