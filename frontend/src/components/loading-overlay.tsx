"use client"

import { motion } from "framer-motion"
import { Leaf, Sprout } from 'lucide-react'

interface LoadingOverlayProps {
    isVisible: boolean
    message?: string
}

export default function LoadingOverlay({ isVisible, message = "Loading..." }: LoadingOverlayProps) {
    if (!isVisible) return null

    return (
        <motion.div
            className="fixed inset-0 bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm z-[100] flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex flex-col items-center">
                <div className="relative w-24 h-24 mb-6">
                    {/* Pulsing circle */}
                    <motion.div
                        className="absolute inset-0 rounded-full bg-emerald-100 dark:bg-emerald-900"
                        animate={{
                            scale: [1, 1.05, 1],
                            opacity: [0.7, 0.9, 0.7]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />

                    {/* Rotating ring */}
                    <motion.div
                        className="absolute inset-0 rounded-full border-4 border-emerald-400/30 dark:border-emerald-500/30"
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />

                    {/* Progress circle */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                        <motion.circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeLinecap="round"
                            className="text-emerald-500 dark:text-emerald-400"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "loop",
                                ease: "easeInOut"
                            }}
                            style={{
                                strokeDasharray: "264",
                                strokeDashoffset: "264",
                                transformOrigin: "center",
                                rotate: "-90deg"
                            }}
                        />
                    </svg>

                    {/* Sprout icon */}
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        animate={{
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut"
                        }}
                    >
                        <Sprout className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                    </motion.div>

                    {/* Orbiting leaves */}
                    {[0, 120, 240].map((angle, i) => (
                        <motion.div
                            key={i}
                            className="absolute"
                            style={{
                                width: 20,
                                height: 20,
                                left: "calc(50% - 10px)",
                                top: "calc(50% - 10px)",
                                transformOrigin: "center"
                            }}
                            animate={{
                                rotate: [angle, angle + 360]
                            }}
                            transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: "linear",
                                delay: i * 0.5
                            }}
                        >
                            <motion.div
                                className="absolute"
                                style={{ left: 40 }}
                                animate={{ rotate: 360 }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                            >
                                <Leaf className="w-5 h-5 text-emerald-500/70 dark:text-emerald-400/70" />
                            </motion.div>
                        </motion.div>
                    ))}
                </div>

                <motion.p
                    className="text-lg font-medium text-emerald-900 dark:text-emerald-100"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {message}
                </motion.p>
            </div>
        </motion.div>
    )
}