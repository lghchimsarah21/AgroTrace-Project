"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Leaf, User } from "lucide-react"
import { Link } from "react-router"
import {useAuth} from "@/config/AuthProvider.tsx";

export default function PagesNavbar() {
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const profileButtonRef = useRef<HTMLDivElement>(null)
    const auth = useAuth();
    const user = auth.user;


    const toggleProfileDropdown = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsProfileOpen(!isProfileOpen)
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
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
    }, [isProfileOpen])

    // Get first two characters of username (placeholder)
    const getUserInitials = () => {
        if(user?.username) {
            return user.username.substring(0, 2).toUpperCase();
        }

        return "NF";
    }

    return (
        <motion.nav
            className="px-4 sm:px-6 lg:px-8 py-4 transition-all duration-300 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md shadow-md"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo - Left */}
                <div className="flex-shrink-0">
                    <Link to="/" className="flex items-center space-x-2">
                        <Leaf className="h-6 w-6 text-green-600 dark:text-green-500" />
                        <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-500 dark:to-emerald-500 bg-clip-text text-transparent">
              CropSmart
            </span>
                    </Link>
                </div>

                {/* Profile Icon - Right */}
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
                                className="absolute top-full left-0 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-50"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.fullName || user?.username}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                                </div>

                                <Link
                                    to="/profile"
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/20"
                                >
                                    <User className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                                    Profile
                                </Link>
                            </motion.div>
                        </div>
                    )}
                </div>
            </div>
        </motion.nav>
    )
}

