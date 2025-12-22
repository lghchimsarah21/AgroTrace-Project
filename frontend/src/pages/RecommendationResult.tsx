"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    ArrowLeft,
    Droplets,
    Thermometer,
    Cloud,
    Leaf,
    BarChartIcon,
    Mail,
    CheckCircle2,
    Loader2,
    PieChartIcon,
    LineChartIcon,
    TreesIcon as Plant,
    Sprout,
} from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
    CartesianGrid,
    Tooltip,
    Cell,
    PieChart,
    Pie,
    Legend,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ComposedChart,
} from "recharts"
import api from "@/config/api"
import { motion, AnimatePresence } from "framer-motion"
// Import Sonner toast
import { toast } from "sonner"

interface RecommendationResultType {
    result: {
        chart_data: Record<string, number>
        humidity: number
        prediction: string[]
        rainfall: number
        temperature: number
    }
    id: number
}

interface RecommendationResultsProps {
    recommendationResult: RecommendationResultType
    closeResultPage: () => void
}

export default function RecommendationResults({ recommendationResult, closeResultPage }: RecommendationResultsProps) {
    const [activeTab, setActiveTab] = useState("overview")
    const [email, setEmail] = useState("")
    const [isSending, setIsSending] = useState(false)
    const [isSent, setIsSent] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const chartRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

    // Animation effect when component mounts
    useEffect(() => {
        setIsVisible(true)
    }, [])

    // Format the data for charts with useMemo to optimize performance
    const { cropCompatibilityData, environmentalFactorsData, cropPieData } = useMemo(() => {
        // Format the crop compatibility data for the chart
        const cropCompatibilityData = Object.entries(recommendationResult.result.chart_data)
            .map(([crop, score]) => ({
                crop,
                score: score * 100, // Convert to percentage
            }))
            .sort((a, b) => b.score - a.score) // Sort by score descending

        // Create data for radar chart
        const environmentalFactorsData = [
            {
                subject: "Temperature",
                value: (recommendationResult.result.temperature / 40) * 100, // Normalize to 0-100 scale
                fullMark: 100,
                actual: recommendationResult.result.temperature,
            },
            {
                subject: "Humidity",
                value: recommendationResult.result.humidity,
                fullMark: 100,
                actual: recommendationResult.result.humidity,
            },
            {
                subject: "Rainfall",
                value: Math.min((recommendationResult.result.rainfall / 2000) * 100, 100), // Normalize to 0-100 scale
                fullMark: 100,
                actual: recommendationResult.result.rainfall,
            },
        ]

        // Create data for pie chart
        const cropPieData = Object.entries(recommendationResult.result.chart_data)
            .map(([crop, score]) => ({
                name: crop,
                value: score * 100, // Convert to percentage
            }))
            .sort((a, b) => b.value - a.value) // Sort by value descending

        return {
            cropCompatibilityData,
            environmentalFactorsData,
            cropPieData,
        }
    }, [recommendationResult])

    // Chart configuration for shadcn/ui ChartContainer
    const chartConfig = {
        score: {
            label: "Compatibility Score (%)",
            color: "hsl(var(--chart-1))",
        },
        temperature: {
            label: "Temperature",
            color: "hsl(var(--chart-2))",
        },
        rainfall: {
            label: "Rainfall",
            color: "hsl(var(--chart-4))",
        },
        humidity: {
            label: "Humidity",
            color: "hsl(var(--chart-3))",
        },
    }

    // Custom tooltip component for better design
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <ChartTooltip>
                    <ChartTooltipContent className="bg-white/95 dark:bg-gray-800/95 shadow-lg border border-gray-100 dark:border-gray-700">
                        <div className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">{label}</div>
                        <div className="flex items-center text-sm">
                            <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-1))] mr-2" />
                            <span className="font-medium">Score: {payload[0].value.toFixed(1)}%</span>
                        </div>
                    </ChartTooltipContent>
                </ChartTooltip>
            )
        }
        return null
    }

    // Custom tooltip for pie chart
    const PieTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 dark:bg-gray-800/95 shadow-lg border border-gray-100 dark:border-gray-700 p-2 rounded-md">
                    <p className="font-medium text-sm">{`${payload[0].name}: ${payload[0].value.toFixed(1)}%`}</p>
                </div>
            )
        }
        return null
    }

    // Custom tooltip for radar chart
    const RadarTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            const displayValue = data.actual
            let unit = ""

            if (data.subject === "Temperature") {
                unit = "°C"
            } else if (data.subject === "Humidity") {
                unit = "%"
            } else if (data.subject === "Rainfall") {
                unit = "mm"
            }

            return (
                <div className="bg-white/95 dark:bg-gray-800/95 shadow-lg border border-gray-100 dark:border-gray-700 p-2 rounded-md">
                    <p className="font-medium text-sm">{`${data.subject}: ${displayValue}${unit}`}</p>
                </div>
            )
        }
        return null
    }

    // Handle sending recommendation email
    const handleSendRecommendationEmail = async () => {
        if (!email || !email.includes("@")) return

        setIsSending(true)

        // Show loading toast
        const loadingToast = toast.loading("Sending recommendation report...")

        try {
            await api.post(
                `/api/emails/send-recommendation/${recommendationResult.id}`,
                { email },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
                    },
                },
            )
            setIsSent(true)

            // Dismiss loading toast and show success toast
            toast.dismiss(loadingToast)
            toast.success("Report sent successfully!", {
                description: `The recommendation report has been sent to ${email}`,
                duration: 4000,
            })

            setTimeout(() => setIsSent(false), 3000)
        } catch (error) {
            console.error("Error sending email:", error)

            // Dismiss loading toast and show error toast
            toast.dismiss(loadingToast)
            toast.error("Failed to send report", {
                description: "There was an error sending the recommendation report. Please try again.",
                duration: 5000,
            })
        } finally {
            setIsSending(false)
        }
    }

    // COLORS
    const COLORS = [
        "hsl(var(--chart-1))",
        "hsl(var(--chart-2))",
        "hsl(var(--chart-3))",
        "hsl(var(--chart-4))",
        "hsl(var(--chart-5))",
    ]

    // Get the top recommended crop
    const topRecommendedCrop = recommendationResult.result.prediction[0] || "No recommendation"

    // Capitalize the first letter of each word in a string
    const capitalizeWords = (str: string) => {
        return str
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto p-4 max-w-5xl"
        >
            <Button
                variant="ghost"
                onClick={closeResultPage}
                className="mb-6 hover:bg-transparent hover:text-primary group transition-all absolute top-2 left-2"
            >
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:mr-3 transition-all" />
                Back to Recommendations
            </Button>

            <div className="grid gap-8">
                {/* Main Recommendation Result Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-bl-full"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-400/10 rounded-tr-full"></div>

                        <CardContent className="pt-8 pb-8">
                            <div className="flex flex-col md:flex-row items-center justify-between relative z-10">
                                <div className="text-center md:text-left mb-6 md:mb-0 flex flex-col md:flex-row items-center md:items-start gap-6">
                                    <div className="relative w-40 h-40 overflow-hidden rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-md mb-3 md:mb-0 group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-emerald-300/20 z-0 group-hover:opacity-70 transition-opacity duration-300"></div>
                                        <img
                                            src={`/src/assets/crops/${topRecommendedCrop}.png`}
                                            alt={capitalizeWords(topRecommendedCrop)}
                                            className="object-contain w-[90%] h-[90%] z-10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                                            onError={(e) => {
                                                // Fallback to icon if image fails to load
                                                e.currentTarget.style.display = "none"
                                                if (e.currentTarget.nextElementSibling instanceof HTMLElement) {
                                                    e.currentTarget.nextElementSibling.style.display = "block"
                                                }
                                            }}
                                        />
                                        <Plant className="h-20 w-20 text-[hsl(var(--chart-1))] z-10" style={{ display: "none" }} />
                                        <div className="absolute inset-0 border-2 border-emerald-200 dark:border-emerald-800/50 rounded-lg z-20 group-hover:border-emerald-300 dark:group-hover:border-emerald-700 transition-colors duration-300"></div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-[hsl(var(--chart-1))] dark:text-[hsl(var(--chart-1))] mb-1">
                                            Top Recommended Crop
                                        </h3>
                                        <motion.span
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{
                                                duration: 0.8,
                                                delay: 0.3,
                                                type: "spring",
                                                stiffness: 100,
                                            }}
                                            className="text-4xl font-bold text-[hsl(var(--chart-1))] dark:text-[hsl(var(--chart-1))]"
                                        >
                                            {capitalizeWords(topRecommendedCrop)}
                                        </motion.span>
                                        <p className="text-sm text-[hsl(var(--chart-1))/70] dark:text-[hsl(var(--chart-1))/70] mt-2">
                                            Based on your soil and environmental parameters
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 0.5, delay: 0.4 }}
                                        className="flex flex-col items-center p-4 bg-white/90 dark:bg-gray-800/60 rounded-lg shadow-md backdrop-blur-sm transition-all hover:shadow-lg hover:scale-105"
                                    >
                                        <Thermometer className="h-6 w-6 text-[hsl(var(--chart-2))] mb-2" />
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Temperature</span>
                                        <span className="font-semibold text-lg">
                      {recommendationResult.result.temperature.toFixed(1)}°C
                    </span>
                                    </motion.div>

                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 0.5, delay: 0.5 }}
                                        className="flex flex-col items-center p-4 bg-white/90 dark:bg-gray-800/60 rounded-lg shadow-md backdrop-blur-sm transition-all hover:shadow-lg hover:scale-105"
                                    >
                                        <Droplets className="h-6 w-6 text-[hsl(var(--chart-3))] mb-2" />
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Humidity</span>
                                        <span className="font-semibold text-lg">{recommendationResult.result.humidity}%</span>
                                    </motion.div>

                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 0.5, delay: 0.6 }}
                                        className="flex flex-col items-center p-4 bg-white/90 dark:bg-gray-800/60 rounded-lg shadow-md backdrop-blur-sm transition-all hover:shadow-lg hover:scale-105"
                                    >
                                        <Cloud className="h-6 w-6 text-[hsl(var(--chart-4))] mb-2" />
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Rainfall</span>
                                        <span className="font-semibold text-lg">{recommendationResult.result.rainfall.toFixed(1)} mm</span>
                                    </motion.div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>









                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card className="border-0 shadow-lg overflow-hidden">
                        <CardHeader className="bg-white dark:bg-gray-900 pb-2">
                            <div className="flex items-center">
                                <Sprout className="h-5 w-5 text-[hsl(var(--chart-5))] mr-2" />
                                <CardTitle>Recommended Crops</CardTitle>
                            </div>
                            <CardDescription>Crops that are suitable for your soil conditions</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4 pb-6 bg-white dark:bg-gray-900">
                            <div className="space-y-4">
                                {recommendationResult.result.prediction.map((crop, index) => (
                                    <motion.div
                                        key={crop}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.1 * index }}
                                        className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-5 rounded-lg shadow-md flex items-center justify-between hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px]"
                                    >
                                        <div className="w-1/2 pr-6">
                                            <h3 className="font-medium text-xl mb-2">{capitalizeWords(crop)}</h3>
                                            <div className="flex flex-col space-y-2">
                                                <div className="flex items-center">
                                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-full">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                                                            style={{ width: `${(recommendationResult.result.chart_data[crop] * 100).toFixed(0)}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="ml-3 text-base font-medium text-emerald-600 dark:text-emerald-400 min-w-[60px] text-right">
                    {(recommendationResult.result.chart_data[crop] * 100).toFixed(0)}%
                  </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {(recommendationResult.result.chart_data[crop] * 100) > 80
                                                        ? "Excellent compatibility with your soil conditions"
                                                        : (recommendationResult.result.chart_data[crop] * 100) > 60
                                                            ? "Good compatibility with your soil conditions"
                                                            : "Moderate compatibility with your soil conditions"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="w-1/2 relative h-48 overflow-hidden rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center group">
                                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-emerald-300/20 z-0 group-hover:opacity-70 transition-opacity duration-300"></div>
                                            <img
                                                src={`/src/assets/crops/${crop}.png`}
                                                alt={capitalizeWords(crop)}
                                                className="object-contain w-[85%] h-[85%] z-10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                                                onError={(e) => {
                                                    // Fallback to icon if image fails to load
                                                    e.currentTarget.style.display = "none"
                                                    if (e.currentTarget.nextElementSibling instanceof HTMLElement) {
                                                        e.currentTarget.nextElementSibling.style.display = "block"
                                                    }
                                                }}
                                            />
                                            <Leaf className="h-24 w-24 text-[hsl(var(--chart-1))] z-10" style={{ display: "none" }} />
                                            <div className="absolute inset-0 border-2 border-emerald-200 dark:border-emerald-800/50 rounded-xl z-20 group-hover:border-emerald-300 dark:group-hover:border-emerald-700 transition-colors duration-300"></div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>







                {/* Email Subscription Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Card className="border-0 shadow-lg overflow-hidden bg-white dark:bg-gray-900">
                        <CardContent className="pt-6 pb-6">
                            <div className="flex flex-col md:flex-row items-center gap-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-medium mb-2 flex items-center">
                                        <Mail className="h-5 w-5 mr-2 text-[hsl(var(--chart-3))]" />
                                        Get Recommendation Report
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Receive a detailed report of this recommendation in your inbox
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                    <Input
                                        type="email"
                                        placeholder="Your email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="min-w-[250px]"
                                    />
                                    <Button
                                        onClick={handleSendRecommendationEmail}
                                        disabled={isSending || isSent || !email.includes("@")}
                                        className="relative group transition-all duration-300 hover:bg-primary/90 flex items-center justify-center h-10"
                                        variant="default"
                                        size="default"
                                    >
                    <span className="flex items-center justify-center gap-2">
                      {isSending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isSent ? (
                          <CheckCircle2 className="h-4 w-4 text-white" />
                      ) : (
                          <Mail className="h-4 w-4 text-white transition-transform group-hover:scale-110" />
                      )}
                        <span>{isSending ? "Sending..." : isSent ? "Sent!" : "Send Report"}</span>
                    </span>
                                        <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-white/30 group-hover:w-full transition-all duration-300"></span>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Tabs for Different Charts */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid grid-cols-3 mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1 rounded-lg">
                            <TabsTrigger
                                value="overview"
                                className="data-[state=active]:bg-[hsl(var(--chart-1))/10] data-[state=active]:text-[hsl(var(--chart-1))] dark:data-[state=active]:bg-[hsl(var(--chart-1))/20] dark:data-[state=active]:text-[hsl(var(--chart-1))]"
                            >
                                <BarChartIcon className="h-4 w-4 mr-2" />
                                Overview
                            </TabsTrigger>
                            <TabsTrigger
                                value="compatibility"
                                className="data-[state=active]:bg-[hsl(var(--chart-1))/10] data-[state=active]:text-[hsl(var(--chart-1))] dark:data-[state=active]:bg-[hsl(var(--chart-1))/20] dark:data-[state=active]:text-[hsl(var(--chart-1))]"
                            >
                                <PieChartIcon className="h-4 w-4 mr-2" />
                                Compatibility
                            </TabsTrigger>
                            <TabsTrigger
                                value="environment"
                                className="data-[state=active]:bg-[hsl(var(--chart-1))/10] data-[state=active]:text-[hsl(var(--chart-1))] dark:data-[state=active]:bg-[hsl(var(--chart-1))/20] dark:data-[state=active]:text-[hsl(var(--chart-1))]"
                            >
                                <LineChartIcon className="h-4 w-4 mr-2" />
                                Environment
                            </TabsTrigger>
                        </TabsList>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <TabsContent value="overview" className="space-y-6 mt-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Radar Chart */}
                                        <Card className="border-0 shadow-lg overflow-hidden">
                                            <CardHeader className="bg-white dark:bg-gray-900 pb-2">
                                                <div className="flex items-center">
                                                    <BarChartIcon className="h-5 w-5 text-[hsl(var(--chart-1))] mr-2" />
                                                    <CardTitle>Environmental Factors</CardTitle>
                                                </div>
                                                <CardDescription>Overview of environmental conditions</CardDescription>
                                            </CardHeader>
                                            <CardContent className="pt-4 pb-6 bg-white dark:bg-gray-900">
                                                <div className="h-[350px]">
                                                    <ChartContainer config={chartConfig}>
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <RadarChart outerRadius={90} data={environmentalFactorsData}>
                                                                <PolarGrid stroke="#e5e7eb" />
                                                                <PolarAngleAxis dataKey="subject" tick={{ fill: "#6b7280", fontSize: 12 }} />
                                                                <PolarRadiusAxis
                                                                    angle={30}
                                                                    domain={[0, 100]}
                                                                    tick={{ fill: "#6b7280", fontSize: 10 }}
                                                                />
                                                                <Tooltip content={RadarTooltip} />
                                                                <Radar
                                                                    name="Factors"
                                                                    dataKey="value"
                                                                    stroke="hsl(var(--chart-1))"
                                                                    fill="hsl(var(--chart-1))"
                                                                    fillOpacity={0.5}
                                                                    animationDuration={1500}
                                                                    animationBegin={300}
                                                                />
                                                            </RadarChart>
                                                        </ResponsiveContainer>
                                                    </ChartContainer>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Crop Compatibility Pie Chart */}
                                        <Card className="border-0 shadow-lg overflow-hidden">
                                            <CardHeader className="bg-white dark:bg-gray-900 pb-2">
                                                <div className="flex items-center">
                                                    <PieChartIcon className="h-5 w-5 text-[hsl(var(--chart-5))] mr-2" />
                                                    <CardTitle>Crop Compatibility</CardTitle>
                                                </div>
                                                <CardDescription>Compatibility scores for different crops</CardDescription>
                                            </CardHeader>
                                            <CardContent className="pt-4 pb-6 bg-white dark:bg-gray-900">
                                                <div className="h-[350px]">
                                                    <ChartContainer config={chartConfig}>
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <PieChart>
                                                                <Pie
                                                                    data={cropPieData}
                                                                    cx="50%"
                                                                    cy="50%"
                                                                    labelLine={false}
                                                                    outerRadius={80}
                                                                    fill="#8884d8"
                                                                    dataKey="value"
                                                                    animationDuration={1500}
                                                                    animationBegin={300}
                                                                    label={({ name, percent }) =>
                                                                        `${capitalizeWords(name)}: ${(percent * 100).toFixed(0)}%`
                                                                    }
                                                                >
                                                                    {cropPieData.map((entry, index) => (
                                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                    ))}
                                                                </Pie>
                                                                <Tooltip content={PieTooltip} />
                                                                <Legend formatter={(value) => capitalizeWords(value)} />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                    </ChartContainer>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Crop Compatibility Bar Chart */}
                                    <Card className="border-0 shadow-lg overflow-hidden">
                                        <CardHeader className="bg-white dark:bg-gray-900 pb-2">
                                            <div className="flex items-center">
                                                <BarChartIcon className="h-5 w-5 text-[hsl(var(--chart-1))] mr-2" />
                                                <CardTitle>Crop Compatibility Scores</CardTitle>
                                            </div>
                                            <CardDescription>Detailed compatibility scores for each crop</CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-4 pb-6 bg-white dark:bg-gray-900">
                                            <div className="h-full">
                                                <ChartContainer config={chartConfig}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart
                                                            data={cropCompatibilityData}
                                                            margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                                                            layout="vertical"
                                                        >
                                                            <defs>
                                                                {cropCompatibilityData.map((entry, index) => (
                                                                    <linearGradient
                                                                        key={`gradient-${index}`}
                                                                        id={`cropGradient-${index}`}
                                                                        x1="0"
                                                                        y1="0"
                                                                        x2="1"
                                                                        y2="0"
                                                                    >
                                                                        <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.8} />
                                                                        <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={1} />
                                                                    </linearGradient>
                                                                ))}
                                                            </defs>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                                                            <XAxis
                                                                type="number"
                                                                domain={[0, 100]}
                                                                axisLine={false}
                                                                tickLine={false}
                                                                tick={{ fill: "#6b7280", fontSize: 12 }}
                                                            />
                                                            <YAxis
                                                                dataKey="crop"
                                                                type="category"
                                                                axisLine={false}
                                                                tickLine={false}
                                                                tick={{ fill: "#6b7280", fontSize: 12 }}
                                                                width={100}
                                                                tickFormatter={capitalizeWords}
                                                            />
                                                            <Tooltip
                                                                content={({ active, payload }) => {
                                                                    if (active && payload && payload.length) {
                                                                        return (
                                                                            <div className="bg-white/95 dark:bg-gray-800/95 shadow-lg border border-gray-100 dark:border-gray-700 p-3 rounded-md">
                                                                                <p className="font-medium text-sm">{`${capitalizeWords(payload[0].payload.crop)}`}</p>
                                                                                <p className="font-medium text-sm">{`Compatibility: ${payload[0].value.toFixed(1)}%`}</p>
                                                                            </div>
                                                                        )
                                                                    }
                                                                    return null
                                                                }}
                                                                cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                                                            />
                                                            <Bar dataKey="score" radius={[0, 4, 4, 0]} animationDuration={1500}>
                                                                {cropCompatibilityData.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={`url(#cropGradient-${index})`} />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </ChartContainer>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="compatibility" className="mt-2">
                                    <div className="grid grid-cols-1 gap-6">
                                        {/* Crop Compatibility Detailed Bar Chart */}
                                        <Card className="border-0 shadow-lg overflow-hidden">
                                            <CardHeader className="bg-white dark:bg-gray-900">
                                                <div className="flex items-center">
                                                    <BarChartIcon className="h-5 w-5 text-[hsl(var(--chart-1))] mr-2" />
                                                    <CardTitle>Detailed Crop Compatibility Analysis</CardTitle>
                                                </div>
                                                <CardDescription>Comprehensive view of crop compatibility with your soil</CardDescription>
                                            </CardHeader>
                                            <CardContent className="pt-4 pb-6 bg-white dark:bg-gray-900">
                                                <div className="h-[500px]">
                                                    <ChartContainer config={chartConfig}>
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <ComposedChart
                                                                data={cropCompatibilityData}
                                                                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                                                                layout="vertical"
                                                            >
                                                                <defs>
                                                                    {cropCompatibilityData.map((entry, index) => (
                                                                        <linearGradient
                                                                            key={`gradient-${index}`}
                                                                            id={`barGradient-${index}`}
                                                                            x1="0"
                                                                            y1="0"
                                                                            x2="1"
                                                                            y2="0"
                                                                        >
                                                                            <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.7} />
                                                                            <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={1} />
                                                                        </linearGradient>
                                                                    ))}
                                                                </defs>
                                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                                                                <XAxis
                                                                    type="number"
                                                                    domain={[0, 100]}
                                                                    axisLine={false}
                                                                    tickLine={false}
                                                                    tick={{ fill: "#6b7280", fontSize: 12 }}
                                                                    label={{
                                                                        value: "Compatibility Score (%)",
                                                                        position: "insideBottom",
                                                                        offset: -15,
                                                                        fill: "#6b7280",
                                                                        fontSize: 12,
                                                                    }}
                                                                />
                                                                <YAxis
                                                                    dataKey="crop"
                                                                    type="category"
                                                                    axisLine={false}
                                                                    tickLine={false}
                                                                    tick={{ fill: "#6b7280", fontSize: 12 }}
                                                                    width={120}
                                                                    tickFormatter={capitalizeWords}
                                                                />
                                                                <Tooltip
                                                                    content={({ active, payload }) => {
                                                                        if (active && payload && payload.length) {
                                                                            return (
                                                                                <div className="bg-white/95 dark:bg-gray-800/95 shadow-lg border border-gray-100 dark:border-gray-700 p-3 rounded-md">
                                                                                    <p className="font-medium text-sm">{`${capitalizeWords(payload[0].payload.crop)}`}</p>
                                                                                    <p className="font-medium text-sm">{`Compatibility: ${payload[0].value.toFixed(1)}%`}</p>
                                                                                </div>
                                                                            )
                                                                        }
                                                                        return null
                                                                    }}
                                                                    cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                                                                />
                                                                <Bar dataKey="score" radius={[0, 4, 4, 0]} animationDuration={1500}>
                                                                    {cropCompatibilityData.map((entry, index) => (
                                                                        <Cell key={`cell-${index}`} fill={`url(#barGradient-${index})`} />
                                                                    ))}
                                                                </Bar>
                                                            </ComposedChart>
                                                        </ResponsiveContainer>
                                                    </ChartContainer>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Crop Compatibility Pie Chart */}
                                        <Card className="border-0 shadow-lg overflow-hidden">
                                            <CardHeader className="bg-white dark:bg-gray-900">
                                                <div className="flex items-center">
                                                    <PieChartIcon className="h-5 w-5 text-[hsl(var(--chart-5))] mr-2" />
                                                    <CardTitle>Crop Compatibility Distribution</CardTitle>
                                                </div>
                                                <CardDescription>Proportional view of crop compatibility scores</CardDescription>
                                            </CardHeader>
                                            <CardContent className="pt-4 pb-6 bg-white dark:bg-gray-900">
                                                <div className="h-[400px]">
                                                    <ChartContainer config={chartConfig}>
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <PieChart>
                                                                <Pie
                                                                    data={cropPieData}
                                                                    cx="50%"
                                                                    cy="50%"
                                                                    innerRadius={60}
                                                                    outerRadius={100}
                                                                    fill="#8884d8"
                                                                    paddingAngle={5}
                                                                    dataKey="value"
                                                                    animationDuration={1500}
                                                                    label={({ name, percent }) =>
                                                                        `${capitalizeWords(name)}: ${(percent * 100).toFixed(0)}%`
                                                                    }
                                                                    labelLine={true}
                                                                >
                                                                    {cropPieData.map((entry, index) => (
                                                                        <Cell
                                                                            key={`cell-${index}`}
                                                                            fill={COLORS[index % COLORS.length]}
                                                                            stroke="white"
                                                                            strokeWidth={2}
                                                                        />
                                                                    ))}
                                                                </Pie>
                                                                <Tooltip content={PieTooltip} />
                                                                <Legend formatter={(value) => capitalizeWords(value)} />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                    </ChartContainer>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                <TabsContent value="environment" className="mt-2">
                                    <Card className="border-0 shadow-lg overflow-hidden">
                                        <CardHeader className="bg-white dark:bg-gray-900">
                                            <div className="flex items-center">
                                                <LineChartIcon className="h-5 w-5 text-[hsl(var(--chart-2))] mr-2" />
                                                <CardTitle>Environmental Conditions Analysis</CardTitle>
                                            </div>
                                            <CardDescription>Detailed view of environmental factors affecting crop growth</CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-4 pb-6 bg-white dark:bg-gray-900">
                                            <div className="h-[500px]">
                                                <ChartContainer config={chartConfig}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <RadarChart outerRadius={150} data={environmentalFactorsData}>
                                                            <PolarGrid stroke="#e5e7eb" />
                                                            <PolarAngleAxis
                                                                dataKey="subject"
                                                                tick={{ fill: "#6b7280", fontSize: 14, fontWeight: "bold" }}
                                                            />
                                                            <PolarRadiusAxis
                                                                angle={30}
                                                                domain={[0, 100]}
                                                                tick={{ fill: "#6b7280", fontSize: 12 }}
                                                                label={{ fill: "#6b7280", fontSize: 12 }}
                                                            />
                                                            <Tooltip content={RadarTooltip} />
                                                            <Radar
                                                                name="Environmental Factors"
                                                                dataKey="value"
                                                                stroke="hsl(var(--chart-1))"
                                                                fill="hsl(var(--chart-1))"
                                                                fillOpacity={0.6}
                                                                animationDuration={1500}
                                                                animationBegin={300}
                                                            />
                                                        </RadarChart>
                                                    </ResponsiveContainer>
                                                </ChartContainer>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                                        {/* Temperature Card */}
                                        <Card className="border-0 shadow-lg overflow-hidden">
                                            <CardHeader className="bg-white dark:bg-gray-900 pb-2">
                                                <div className="flex items-center">
                                                    <Thermometer className="h-5 w-5 text-[hsl(var(--chart-2))] mr-2" />
                                                    <CardTitle>Temperature</CardTitle>
                                                </div>
                                                <CardDescription>Current temperature conditions</CardDescription>
                                            </CardHeader>
                                            <CardContent className="pt-4 pb-6 bg-white dark:bg-gray-900">
                                                <div className="flex flex-col items-center justify-center h-[200px]">
                                                    <div className="text-6xl font-bold text-[hsl(var(--chart-2))]">
                                                        {recommendationResult.result.temperature.toFixed(1)}°C
                                                    </div>
                                                    <div className="mt-4 text-sm text-muted-foreground text-center">
                                                        {recommendationResult.result.temperature < 20
                                                            ? "Cool conditions - suitable for temperate crops"
                                                            : recommendationResult.result.temperature < 30
                                                                ? "Moderate temperature - ideal for most crops"
                                                                : "Warm conditions - suitable for tropical crops"}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Humidity Card */}
                                        <Card className="border-0 shadow-lg overflow-hidden">
                                            <CardHeader className="bg-white dark:bg-gray-900 pb-2">
                                                <div className="flex items-center">
                                                    <Droplets className="h-5 w-5 text-[hsl(var(--chart-3))] mr-2" />
                                                    <CardTitle>Humidity</CardTitle>
                                                </div>
                                                <CardDescription>Current humidity conditions</CardDescription>
                                            </CardHeader>
                                            <CardContent className="pt-4 pb-6 bg-white dark:bg-gray-900">
                                                <div className="flex flex-col items-center justify-center h-[200px]">
                                                    <div className="text-6xl font-bold text-[hsl(var(--chart-3))]">
                                                        {recommendationResult.result.humidity}%
                                                    </div>
                                                    <div className="mt-4 text-sm text-muted-foreground text-center">
                                                        {recommendationResult.result.humidity < 30
                                                            ? "Low humidity - consider drought-resistant crops"
                                                            : recommendationResult.result.humidity < 60
                                                                ? "Moderate humidity - suitable for most crops"
                                                                : "High humidity - good for tropical crops"}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Rainfall Card */}
                                        <Card className="border-0 shadow-lg overflow-hidden">
                                            <CardHeader className="bg-white dark:bg-gray-900 pb-2">
                                                <div className="flex items-center">
                                                    <Cloud className="h-5 w-5 text-[hsl(var(--chart-4))] mr-2" />
                                                    <CardTitle>Rainfall</CardTitle>
                                                </div>
                                                <CardDescription>Current rainfall conditions</CardDescription>
                                            </CardHeader>
                                            <CardContent className="pt-4 pb-6 bg-white dark:bg-gray-900">
                                                <div className="flex flex-col items-center justify-center h-[200px]">
                                                    <div className="text-6xl font-bold text-[hsl(var(--chart-4))]">
                                                        {recommendationResult.result.rainfall.toFixed(0)}
                                                        <span className="text-2xl ml-1">mm</span>
                                                    </div>
                                                    <div className="mt-4 text-sm text-muted-foreground text-center">
                                                        {recommendationResult.result.rainfall < 500
                                                            ? "Low rainfall - consider drought-resistant crops"
                                                            : recommendationResult.result.rainfall < 1000
                                                                ? "Moderate rainfall - suitable for most crops"
                                                                : "High rainfall - good for water-loving crops"}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>
                            </motion.div>
                        </AnimatePresence>
                    </Tabs>
                </motion.div>
            </div>
        </motion.div>
    )
}

