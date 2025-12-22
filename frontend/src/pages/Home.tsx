"use client"

import { useAuth } from "@/config/AuthProvider.tsx"
import { MenuBar } from "@/pages/MenuBar.tsx"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"

import {ArrowUp} from "lucide-react";

import "../Styles/home.css"
import {Button} from "@/components/ui/button.tsx";

function Home() {
    const { user } = useAuth()
    console.log("--->", user)


    // Add state to track scrolling
    const [isScrolling, setIsScrolling] = useState(false)

    const [showTopArrow, setShowTopArrow] = useState(false)

    // Add state to track scroll position for debugging
    const [scrollPosition, setScrollPosition] = useState(0)
    // Add state to track scroll progress (0-100%)
    const [scrollProgress, setScrollProgress] = useState(0)

    // Reference to the scrollable container
    const containerRef = useRef(null)

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
                    (el) => el.scrollHeight > el.clientHeight && ["auto", "scroll"].includes(getComputedStyle(el).overflowY),
                ) || window
            )
        }

        // Wait for component to fully render
        setTimeout(() => {
            const scrollableElement = findScrollableParent()
            console.log("Scrollable element found:", scrollableElement.tagName || "Window")

            // Calculate max scroll distance
            const getMaxScroll = () => {
                if (scrollableElement === window) {
                    return document.documentElement.scrollHeight - window.innerHeight
                } else {
                    return scrollableElement.scrollHeight - scrollableElement.clientHeight
                }
            }

            // Initial check
            const initialPos = scrollableElement === window ? window.scrollY : scrollableElement.scrollTop

            setScrollPosition(initialPos)
            setIsScrolling(initialPos > 10)

            // Calculate initial progress
            const maxScroll = getMaxScroll()
            const initialProgress = maxScroll > 0 ? (initialPos / maxScroll) * 100 : 0
            setScrollProgress(initialProgress)


            let scrollTimeout;

            // Scroll handler
            const handleScroll = () => {
                const currentPos = scrollableElement === window ? window.scrollY : scrollableElement.scrollTop

                setShowTopArrow(true);

                // When scrolling stops, enable animation after a delay
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    setShowTopArrow(false);
                }, 800);

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
                scrollableElement.addEventListener("scroll", handleScroll, { passive: true })
            }

            // Clean up
            return () => {
                if (scrollableElement === window) {
                    window.removeEventListener("scroll", handleScroll)
                } else {
                    scrollableElement.removeEventListener("scroll", handleScroll)
                }
            }
        }, 500) // Small delay to ensure DOM is fully rendered
    }, [])

    return (
        <div className="app-container" ref={containerRef}>
            <div ref={containerRef} id="top"></div>
            {/* Navbar with integrated progress bar */}
            <div className="fixed top-0 left-0 right-0 z-50">
                {/* Pass isScrolling to MenuBar to change background */}
                <MenuBar isScrolling={isScrolling} />

                {/* Progress bar that appears below the navbar when scrolling */}
                <motion.div
                    className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                    initial={{ width: "0%" }}
                    animate={{
                        width: `${scrollProgress}%`,
                        opacity: isScrolling ? 1 : 0,
                        transition: { duration: 0.2 },
                    }}
                />
            </div>

            <div className="content-container">
                <h1 className="text-2xl font-bold text-gray-900 mt-4">Home Page</h1>
                <p className="mt-4 text-gray-700">Welcome to the application.</p>
                <p className="mt-2 text-gray-500">Scroll to see the navbar change color and the progress bar extend.</p>

                {/* Content sections */}
                {Array.from({ length: 20 }).map((_, i) => (
                    <div
                        key={i}
                        className="content-section"
                        style={{
                            height: "500px",
                            margin: "20px 0",
                            padding: "20px",
                            backgroundColor: i % 2 === 0 ? "#f9fafb" : "#f3f4f6",
                            borderRadius: "8px",
                        }}
                    >
                        <h2 className="text-xl font-semibold text-gray-800">Section {i + 1}</h2>
                        <p className="mt-4 text-gray-600">Content for section {i + 1}.</p>
                    </div>
                ))}
            </div>

            {/* Fixed debug panel with more info */}
            {(!showTopArrow && scrollPosition > 100) && (
            <motion.div
                className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-50 cursor-pointer transition-all duration-300 flex items-center justify-center"
                initial={{ y: 0 }}
                animate={{ y: [0, -25, 0] }} // Moves up and down
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                onClick={() => {
                    document.getElementById("top")?.scrollIntoView({ behavior: "smooth" });
                }}
            >
                <ArrowUp size={24} />
            </motion.div>
            )}
        </div>
    )
}

export default Home

