"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Menu, X, Leaf, ChevronDown, LogIn, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link, useNavigate } from "react-router"
import { useAuth } from "@/config/AuthProvider"
import SignInDropdown from "@/pages/sign-in-dropdown.tsx"
import LoadingOverlay from "@/components/loading-overlay"

interface NavbarProps {
    isScrolling: boolean
}

export default function Navbar({ isScrolling }: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [activeSection, setActiveSection] = useState<string>("top")
    const [loadingMessage, setLoadingMessage] = useState<string>("")
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [isSignInOpen, setIsSignInOpen] = useState(false)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const signInButtonRef = useRef<HTMLDivElement>(null)
    const profileButtonRef = useRef<HTMLDivElement>(null)
    const auth = useAuth()
    const isLoggedIn = auth.isLoggedIn
    const user = auth.user
    const logout = auth.logout
    const navigate = useNavigate()

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    const toggleDropdown = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsDropdownOpen(!isDropdownOpen)
    }

    const toggleSignInDropdown = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsSignInOpen(!isSignInOpen)
    }

    const toggleProfileDropdown = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsProfileOpen(!isProfileOpen)
    }

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsProfileOpen(false)
        setIsLoading(true)
        setLoadingMessage("Signing out...")

        // Set a timeout of 3 seconds before completing logout
        setTimeout(() => {
            logout()
            setIsLoading(false)
            navigate("/")
        }, 1500)
    }

    const handleProfileClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsProfileOpen(false)
        setIsLoading(true)
        setLoadingMessage("redirecting to Profile...")
        setTimeout(() => {
            setIsLoading(false)
            navigate("/Profile")
        }, 1500)
    }

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Handle "Get Started" dropdown
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }

            // Handle Sign In dropdown - only close if clicking outside both the dropdown and its button
            if (isSignInOpen) {
                const target = event.target as Node
                const signInButton = signInButtonRef.current

                // Check if the click is outside the sign-in button and its dropdown
                if (signInButton && !signInButton.contains(target) && !target.closest(".sign-in-dropdown")) {
                    setIsSignInOpen(false)
                }
            }

            // Handle Profile dropdown - only close if clicking outside both the dropdown and its button
            if (isProfileOpen) {
                const target = event.target as Node
                const profileButton = profileButtonRef.current

                // Check if the click is outside the profile button and its dropdown
                if (profileButton && !profileButton.contains(target) && !target.closest(".profile-dropdown")) {
                    setIsProfileOpen(false)
                }
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isSignInOpen, isProfileOpen])

    // Track active section based on scroll position
    useEffect(() => {
        const sections = ["features", "how-it-works", "testimonials"]

        const observerOptions = {
            root: null,
            rootMargin: "-20% 0px -70% 0px", // Adjust these values to control when a section is considered active
            threshold: 0,
        }

        const observerCallback: IntersectionObserverCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id)
                }
            })
        }

        const observer = new IntersectionObserver(observerCallback, observerOptions)

        // Observe all sections
        sections.forEach((id) => {
            const element = document.getElementById(id)
            if (element) observer.observe(element)
        })

        // Special case for top section (when scrolled to top)
        const handleScroll = () => {
            if (window.scrollY < 100) {
                setActiveSection("top")
            }
        }

        window.addEventListener("scroll", handleScroll)

        return () => {
            sections.forEach((id) => {
                const element = document.getElementById(id)
                if (element) observer.unobserve(element)
            })
            window.removeEventListener("scroll", handleScroll)
        }
    }, [])

    // Helper function to determine if a link is active
    const isActive = (sectionId: string) => activeSection === sectionId

    // Helper function to get the appropriate class based on active state
    const getLinkClass = (sectionId: string) => {
        const baseClass = `font-medium transition-colors cursor-pointer`
        const colorClass = isScrolling ? "text-gray-800 dark:text-gray-200" : "text-gray-100 dark:text-gray-200"
        const activeClass = isActive(sectionId)
            ? "text-green-600 dark:text-green-400 font-semibold"
            : `${colorClass} hover:text-green-600 dark:hover:text-green-500`

        return `${baseClass} ${activeClass}`
    }

    // Get first two characters of username
    const getUserInitials = () => {
        if (user?.username) {
            return user.username.substring(0, 2).toUpperCase()
        }
        return "US"
    }


    const handleNavigation = (e, path) => {
        e.preventDefault()
        setIsDropdownOpen(false)
        setIsLoading(true)
        setLoadingMessage(`redirecting to ${path}...`)

        // Delay navigation by 1.5 seconds
        setTimeout(() => {
            setIsLoading(false)
            navigate(`/${path}`)
        }, 1500)
    }

    return (
        <>
            <LoadingOverlay isVisible={isLoading} message={loadingMessage} />

            <motion.nav
                className={`px-4 sm:px-6 lg:px-8 py-4 transition-all duration-300 ${
                    isScrolling ? "bg-white/90 dark:bg-gray-950/90 backdrop-blur-md shadow-md" : "bg-transparent"
                }`}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="max-w-7xl mx-auto flex items-center">
                    {/* Logo - Left */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="flex items-center space-x-2">
                            <Leaf className="h-6 w-6 text-green-600 dark:text-green-500" />
                            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-500 dark:to-emerald-500 bg-clip-text text-transparent">
                CropSmart
              </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation - Middle */}
                    <div className="hidden md:flex flex-1 justify-center">
                        <div className="flex items-center space-x-8">
                            <a
                                href="#features"
                                onClick={(e) => {
                                    e.preventDefault()
                                    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
                                }}
                                className={getLinkClass("features")}
                            >
                                Features
                                {isActive("features") && (
                                    <motion.div
                                        className="h-1 bg-green-600 dark:bg-green-400 rounded-full mt-1"
                                        layoutId="activeIndicator"
                                    />
                                )}
                            </a>
                            <a
                                href="#how-it-works"
                                onClick={(e) => {
                                    e.preventDefault()
                                    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })
                                }}
                                className={getLinkClass("how-it-works")}
                            >
                                How It Works
                                {isActive("how-it-works") && (
                                    <motion.div
                                        className="h-1 bg-green-600 dark:bg-green-400 rounded-full mt-1"
                                        layoutId="activeIndicator"
                                    />
                                )}
                            </a>
                            <a
                                href="#testimonials"
                                onClick={(e) => {
                                    e.preventDefault()
                                    document.getElementById("testimonials")?.scrollIntoView({ behavior: "smooth" })
                                }}
                                className={getLinkClass("testimonials")}
                            >
                                Success Stories
                                {isActive("testimonials") && (
                                    <motion.div
                                        className="h-1 bg-green-600 dark:bg-green-400 rounded-full mt-1"
                                        layoutId="activeIndicator"
                                    />
                                )}
                            </a>
                        </div>
                    </div>

                    {/* Action Items - Right */}
                    <div className="hidden md:flex items-center space-x-4">
                        {/* Get Started Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <Button
                                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                                onClick={toggleDropdown}
                            >
                                Get Started
                                <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                            </Button>

                            {isDropdownOpen && (
                                <motion.div
                                    className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-50"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Link
                                        to="/Prediction"
                                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/20"
                                        onClick={(e) => handleNavigation(e, "Prediction")}
                                    >
                                        Prediction
                                    </Link>
                                    <Link
                                        to="/Recommendation"
                                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/20"
                                        onClick={(e) => handleNavigation(e, "Recommendation")}
                                    >
                                        Recommendation
                                    </Link>
                                </motion.div>
                            )}
                        </div>

                        {/* Profile Icon - Conditional rendering */}
                        {isLoggedIn ? (
                            <div className="relative">
                                <div
                                    ref={profileButtonRef}
                                    className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center font-medium text-sm cursor-pointer hover:bg-green-700 transition-colors"
                                    onClick={toggleProfileDropdown}
                                >
                                    {getUserInitials()}
                                </div>

                                {isProfileOpen && (
                                    <div className="profile-dropdown" onClick={(e) => e.stopPropagation()}>
                                        <motion.div
                                            className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-50"
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {user?.fullName || user?.username}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                                            </div>

                                            <a
                                                href="/profile"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/20"
                                                onClick={handleProfileClick}
                                            >
                                                <User className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                                                Profile
                                            </a>

                                            <a
                                                href="#"
                                                className="flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10"
                                                onClick={handleLogout}
                                            >
                                                <LogOut className="h-4 w-4 mr-2 text-red-500 dark:text-red-400" />
                                                Sign out
                                            </a>
                                        </motion.div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="relative">
                                <div
                                    ref={signInButtonRef}
                                    className="flex items-center space-x-2 cursor-pointer bg-white/10 hover:bg-white/20 dark:bg-gray-800/30 dark:hover:bg-gray-800/50 px-3 py-2 rounded-lg transition-colors"
                                    onClick={toggleSignInDropdown}
                                >
                                    <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 flex items-center justify-center">
                                        <LogIn className="h-4 w-4" />
                                    </div>
                                    <span
                                        className={`font-medium ${isScrolling ? "text-gray-800 dark:text-gray-200" : "text-gray-100 dark:text-gray-200"}`}
                                    >
                    Sign In
                  </span>
                                    <ChevronDown
                                        className={`h-4 w-4 transition-transform ${isSignInOpen ? "rotate-180" : ""} ${isScrolling ? "text-gray-800 dark:text-gray-200" : "text-gray-100 dark:text-gray-200"}`}
                                    />
                                </div>

                                {isSignInOpen && (
                                    <div className="sign-in-dropdown" onClick={(e) => e.stopPropagation()}>
                                        <SignInDropdown isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4 ml-auto">
                        {/* Profile Icon for Mobile - Conditional rendering */}
                        {isLoggedIn ? (
                            <div className="relative">
                                <div
                                    ref={profileButtonRef}
                                    className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-medium text-sm cursor-pointer hover:bg-green-700 transition-colors"
                                    onClick={toggleProfileDropdown}
                                >
                                    {getUserInitials()}
                                </div>

                                {isProfileOpen && (
                                    <div className="profile-dropdown" onClick={(e) => e.stopPropagation()}>
                                        <motion.div
                                            className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-50"
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {user?.fullName || user?.username}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                                            </div>

                                            <a
                                                href="/profile"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/20"
                                                onClick={handleProfileClick}
                                            >
                                                <User className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                                                Profile
                                            </a>

                                            <a
                                                href="#"
                                                className="flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10"
                                                onClick={handleLogout}
                                            >
                                                <LogOut className="h-4 w-4 mr-2 text-red-500 dark:text-red-400" />
                                                Sign out
                                            </a>
                                        </motion.div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="relative">
                                <div
                                    ref={signInButtonRef}
                                    className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 flex items-center justify-center cursor-pointer"
                                    onClick={toggleSignInDropdown}
                                >
                                    <LogIn className="h-4 w-4" />
                                </div>

                                {isSignInOpen && (
                                    <div className="sign-in-dropdown" onClick={(e) => e.stopPropagation()}>
                                        <SignInDropdown isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
                                    </div>
                                )}
                            </div>
                        )}

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleMenu}
                            className={isScrolling ? "text-gray-800 dark:text-gray-200" : "text-white dark:text-gray-200"}
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <motion.div
                        className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 shadow-lg z-50 p-4"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex flex-col space-y-4">
                            <a
                                href="#features"
                                onClick={(e) => {
                                    e.preventDefault()
                                    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
                                    setIsMenuOpen(false)
                                }}
                                className={`py-2 ${
                                    isActive("features")
                                        ? "text-green-600 dark:text-green-400 font-semibold"
                                        : "text-gray-800 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-500"
                                }`}
                            >
                                Features
                                {isActive("features") && (
                                    <div className="h-0.5 bg-green-600 dark:bg-green-400 rounded-full mt-1 w-12" />
                                )}
                            </a>
                            <a
                                href="#how-it-works"
                                onClick={(e) => {
                                    e.preventDefault()
                                    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })
                                    setIsMenuOpen(false)
                                }}
                                className={`py-2 ${
                                    isActive("how-it-works")
                                        ? "text-green-600 dark:text-green-400 font-semibold"
                                        : "text-gray-800 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-500"
                                }`}
                            >
                                How It Works
                                {isActive("how-it-works") && (
                                    <div className="h-0.5 bg-green-600 dark:bg-green-400 rounded-full mt-1 w-12" />
                                )}
                            </a>
                            <a
                                href="#testimonials"
                                onClick={(e) => {
                                    e.preventDefault()
                                    document.getElementById("testimonials")?.scrollIntoView({ behavior: "smooth" })
                                    setIsMenuOpen(false)
                                }}
                                className={`py-2 ${
                                    isActive("testimonials")
                                        ? "text-green-600 dark:text-green-400 font-semibold"
                                        : "text-gray-800 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-500"
                                }`}
                            >
                                Success Stories
                                {isActive("testimonials") && (
                                    <div className="h-0.5 bg-green-600 dark:bg-green-400 rounded-full mt-1 w-12" />
                                )}
                            </a>

                            {/* Mobile Get Started Options */}
                            <Link
                                to="/Prediction"
                                className="py-2 text-gray-800 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-500"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Prediction
                            </Link>
                            <Link
                                to="/Recommendation"
                                className="py-2 text-gray-800 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-500"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Recommendation
                            </Link>
                        </div>
                    </motion.div>
                )}
            </motion.nav>
        </>
    )
}

