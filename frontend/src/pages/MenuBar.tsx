"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Home, Settings, Bell, User } from "lucide-react"

interface MenuBarProps {
    isScrolling?: boolean
}

interface MenuItem {
    icon: React.ReactNode
    label: string
    href: string
    gradient: string
    iconColor: string
}

const menuItems: MenuItem[] = [
    {
        icon: <Home className="h-5 w-5" />,
        label: "Home",
        href: "/",
        gradient: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)",
        iconColor: "text-blue-500",
    },
    {
        icon: <Bell className="h-5 w-5" />,
        label: "Notifications",
        href: "#",
        gradient: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.06) 50%, rgba(194,65,12,0) 100%)",
        iconColor: "text-orange-500",
    },
    {
        icon: <Settings className="h-5 w-5" />,
        label: "Settings",
        href: "#",
        gradient: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)",
        iconColor: "text-green-500",
    },
    {
        icon: <User className="h-5 w-5" />,
        label: "Profile",
        href: "/profile",
        gradient: "radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.06) 50%, rgba(185,28,28,0) 100%)",
        iconColor: "text-red-500",
    },
]

const itemVariants = {
    initial: { rotateX: 0, opacity: 1 },
    hover: { rotateX: -90, opacity: 0 },
}

const backVariants = {
    initial: { rotateX: 90, opacity: 0 },
    hover: { rotateX: 0, opacity: 1 },
}

const glowVariants = {
    initial: { opacity: 0, scale: 0.8 },
    hover: {
        opacity: 1,
        scale: 2,
        transition: {
            opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
            scale: { duration: 0.5, type: "spring", stiffness: 300, damping: 25 },
        },
    },
}

const navGlowVariants = {
    initial: { opacity: 0 },
    hover: {
        opacity: 1,
        transition: {
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1],
        },
    },
}

const sharedTransition = {
    type: "spring",
    stiffness: 100,
    damping: 20,
    duration: 0.5,
}

const logoVariants = {
    initial: { scale: 1 },
    hover: {
        scale: 1.05,
        transition: {
            duration: 0.3,
            ease: "easeInOut",
        },
    },
}

export function MenuBar({ isScrolling = false }: MenuBarProps) {
    // Define background styles based on scroll state
    const navBackgroundClass = isScrolling
        ? "bg-gradient-to-r from-green-600 via-emerald-500 to-lime-400 text-white"
        : "bg-gradient-to-b from-white/90 to-white/70 backdrop-blur-lg"

    // Define text color based on scroll state
    const textColorClass = isScrolling ? "text-white" : "text-gray-900"

    return (
        <motion.nav
            className={`sticky top-0 z-40 p-2 ${navBackgroundClass} border-b border-gray-200/40 shadow-lg transition-colors duration-300`}
            initial="initial"
            whileHover="hover"
            animate={{ opacity: 1 }}
        >
            <div className="container mx-auto">
                <motion.div
                    className="absolute -inset-2 bg-gradient-radial from-transparent via-blue-400/20 via-30% via-purple-400/20 via-60% via-red-400/20 via-90% to-transparent rounded-3xl z-0 pointer-events-none"
                    variants={navGlowVariants}
                />

                {/* Navbar content with logo and menu items */}
                <div className="flex items-center justify-between relative z-10">
                    {/* Logo on the left */}
                    <motion.a href="#" className={`font-bold text-xl ${textColorClass}`} whileHover="hover" initial="initial">
                        <motion.div variants={logoVariants} className="flex items-center">
              <span
                  className={
                      isScrolling
                          ? "text-white"
                          : "bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"
                  }
              >
                othmane
              </span>
                            <span className={textColorClass}>Project</span>
                        </motion.div>
                    </motion.a>

                    {/* Menu items on the right */}
                    <ul className="flex items-center gap-2">
                        {menuItems.map((item) => (
                            <motion.li key={item.label} className="relative">
                                <motion.div
                                    className="block rounded-xl overflow-visible group relative"
                                    style={{ perspective: "600px" }}
                                    whileHover="hover"
                                    initial="initial"
                                >
                                    <motion.div
                                        className="absolute inset-0 z-0 pointer-events-none"
                                        variants={glowVariants}
                                        style={{
                                            background: item.gradient,
                                            opacity: 0,
                                            borderRadius: "16px",
                                        }}
                                    />
                                    <motion.a
                                        href={item.href}
                                        className={`flex items-center gap-2 px-4 py-2 relative z-10 bg-transparent ${isScrolling ? "text-white/80 group-hover:text-white" : "text-gray-600 group-hover:text-gray-900"} transition-colors rounded-xl`}
                                        variants={itemVariants}
                                        transition={sharedTransition}
                                        style={{ transformStyle: "preserve-3d", transformOrigin: "center bottom" }}
                                    >
                    <span
                        className={`transition-colors duration-300 ${isScrolling ? "text-white" : `group-hover:${item.iconColor} text-gray-900`}`}
                    >
                      {item.icon}
                    </span>
                                        <span className="hidden sm:inline">{item.label}</span>
                                    </motion.a>
                                    <motion.a
                                        href={item.href}
                                        className={`flex items-center gap-2 px-4 py-2 absolute inset-0 z-10 bg-transparent ${isScrolling ? "text-white/80 group-hover:text-white" : "text-gray-600 group-hover:text-gray-900"} transition-colors rounded-xl`}
                                        variants={backVariants}
                                        transition={sharedTransition}
                                        style={{ transformStyle: "preserve-3d", transformOrigin: "center top", rotateX: 90 }}
                                    >
                    <span
                        className={`transition-colors duration-300 ${isScrolling ? "text-white" : `group-hover:${item.iconColor} text-gray-900`}`}
                    >
                      {item.icon}
                    </span>
                                        <span className="hidden sm:inline">{item.label}</span>
                                    </motion.a>
                                </motion.div>
                            </motion.li>
                        ))}
                    </ul>
                </div>
            </div>
        </motion.nav>
    )
}

