"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function HowItWorksSection() {
    const steps = [
        {
            number: "01",
            title: "Input Your Farm Data",
            description: "Provide information about your location, soil type, available resources, and farming goals.",
            image: "/TestImagee.jpeg?height=300&width=400",
        },
        {
            number: "02",
            title: "AI Analysis",
            description:
                "Our advanced algorithms analyze your data along with climate patterns, soil science, and agricultural research.",
            image: "/test2.jpeg?height=300&width=400",
        },
        {
            number: "03",
            title: "Get Personalized Recommendations",
            description:
                "Receive detailed crop recommendations, planting schedules, and care instructions tailored to your specific conditions.",
            image: "/test3.jpeg?height=300&width=400",
        },
        {
            number: "04",
            title: "Implement and Monitor",
            description:
                "Apply the recommendations and track progress through our platform, receiving updates and adjustments as needed.",
            image: "/test4.jpeg?height=300&width=400",
        },
    ]

    return (
        <section id="how-it-works" className="py-20 bg-white dark:bg-gray-950">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.h2
                        className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white"
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        How It Works
                    </motion.h2>
                    <motion.p
                        className="mt-4 text-xl text-gray-600 dark:text-gray-300"
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        Our simple process helps you make data-driven farming decisions
                    </motion.p>
                </div>

                <div className="space-y-20 md:space-y-24">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            className={`flex flex-col ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-8 md:gap-12`}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                        >
                            <div className="w-full md:w-1/2 space-y-4">
                                <div className="inline-block px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-mono text-sm">
                                    {step.number}
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{step.title}</h3>
                                <p className="text-lg text-gray-600 dark:text-gray-300">{step.description}</p>
                            </div>
                            <div className="w-full md:w-1/2">
                                <div className="relative rounded-xl overflow-hidden shadow-lg">
                                    <img src={step.image || "/placeholder.svg"} alt={step.title} className="w-full h-auto" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    className="mt-20 text-center"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <Button
                        size="lg"
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 px-8 py-6 text-lg"
                    >
                        Start Your Crop Analysis
                    </Button>
                </motion.div>
            </div>
        </section>
    )
}

