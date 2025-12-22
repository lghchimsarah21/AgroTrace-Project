"use client"

import { motion } from "framer-motion"
import { CloudSun, Droplets, LineChart, Sprout, Leaf, Map } from "lucide-react"

const features = [
    {
        icon: <CloudSun className="h-10 w-10 text-green-500" />,
        title: "Weather Analysis",
        description:
            "Incorporates real-time and historical weather data to provide accurate crop recommendations based on climate conditions.",
    },
    {
        icon: <Droplets className="h-10 w-10 text-green-500" />,
        title: "Soil Compatibility",
        description:
            "Analyzes soil composition and moisture levels to determine the most suitable crops for your specific land.",
    },
    {
        icon: <LineChart className="h-10 w-10 text-green-500" />,
        title: "Yield Predictions",
        description:
            "Uses advanced algorithms to predict potential crop yields based on environmental factors and farming practices.",
    },
    {
        icon: <Sprout className="h-10 w-10 text-green-500" />,
        title: "Growth Monitoring",
        description: "Tracks crop growth stages and provides timely recommendations for optimal care and intervention.",
    },
    {
        icon: <Leaf className="h-10 w-10 text-green-500" />,
        title: "Sustainable Practices",
        description:
            "Suggests environmentally friendly farming techniques that maintain soil health and reduce resource usage.",
    },
    {
        icon: <Map className="h-10 w-10 text-green-500" />,
        title: "Regional Optimization",
        description:
            "Tailors recommendations based on your specific geographic location and local agricultural conditions.",
    },
]

export default function FeatureSection() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 },
        },
    }

    return (
        <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.h2
                        className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white"
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        Smart Farming Features
                    </motion.h2>
                    <motion.p
                        className="mt-4 text-xl text-gray-600 dark:text-gray-300"
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        Our AI-powered platform provides comprehensive tools to optimize your agricultural decisions
                    </motion.p>
                </div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700"
                            variants={itemVariants}
                        >
                            <div className="mb-5">{feature.icon}</div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

