"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sprout } from "lucide-react"

export default function CTASection() {
    return (
        <section className="py-20 bg-white dark:bg-gray-950">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="max-w-5xl mx-auto bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl overflow-hidden shadow-2xl"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="relative">
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
                            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
                        </div>

                        <div className="relative p-8 md:p-12 lg:p-16 text-center">
                            <Sprout className="h-16 w-16 mx-auto mb-6 text-white/90" />

                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                                Ready to Optimize Your Farm's Potential?
                            </h2>
                            <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">
                                Join thousands of farmers who are making data-driven decisions to increase yields and sustainability.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button size="lg" className="bg-white text-green-600 hover:bg-green-50 px-8 py-6 text-lg">
                                    Get Your Crop Recommendations
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="text-white border-white hover:bg-white/10 px-8 py-6 text-lg"
                                >
                                    Schedule a Demo
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats section */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <h3 className="text-4xl md:text-5xl font-bold text-green-600 dark:text-green-500 mb-2">30%</h3>
                        <p className="text-gray-600 dark:text-gray-300">Average Yield Increase</p>
                    </motion.div>

                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <h3 className="text-4xl md:text-5xl font-bold text-green-600 dark:text-green-500 mb-2">10k+</h3>
                        <p className="text-gray-600 dark:text-gray-300">Farmers Supported</p>
                    </motion.div>

                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <h3 className="text-4xl md:text-5xl font-bold text-green-600 dark:text-green-500 mb-2">50+</h3>
                        <p className="text-gray-600 dark:text-gray-300">Crop Varieties Analyzed</p>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

