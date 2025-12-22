"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import {
    ArrowLeft,
    Droplets,
    Thermometer,
    Cloud,
    Leaf,
    Mail,
    CheckCircle2,
    Loader2,
    Download,
    Info,
    ChevronDown,
    ChevronUp,
    Sprout,
    BarChart3,
    PieChart,
    LineChart,
    Maximize2,
    Minimize2,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import PagesNavbar from "./pagesNavbar.tsx"
import LoadingOverlay from "@/components/loading-overlay"

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Cell,
    PieChart as RechartsPieChart,
    Pie,
    Legend,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
} from "recharts"

import api from "@/config/api"
import { toast } from "sonner"
import { jsPDF } from "jspdf"

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
    goBack: () => void
}

// Animated number counter component
const AnimatedCounter = ({
                             value,
                             duration = 1.5,
                             decimals = 0,
                         }: { value: number; duration?: number; decimals?: number }) => {
    const [displayValue, setDisplayValue] = useState(0)

    useEffect(() => {
        let startTime: number
        let animationFrame: number

        const updateValue = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)

            setDisplayValue(progress * value)

            if (progress < 1) {
                animationFrame = requestAnimationFrame(updateValue)
            }
        }

        animationFrame = requestAnimationFrame(updateValue)

        return () => cancelAnimationFrame(animationFrame)
    }, [value, duration])

    return <>{displayValue.toFixed(decimals)}</>
}

export default function RecommendationResults({ recommendationResult, goBack }: RecommendationResultsProps) {
    // Your existing state and hooks
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("compatibility")
    const [email, setEmail] = useState("")
    const [supportMessage, setSupportMessage] = useState("");
    const [isSending, setIsSending] = useState(false)
    const [isSent, setIsSent] = useState(false)
    const [expandedCrop, setExpandedCrop] = useState<string | null>(null)
    const [isScrolled, setIsScrolled] = useState(false)
    const [showFullscreenChart, setShowFullscreenChart] = useState(false)
    const [fullscreenChartType, setFullscreenChartType] = useState<string | null>(null)
    const headerRef = useRef<HTMLDivElement>(null)

    // Handle scroll for sticky header effect
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 80) {
                setIsScrolled(true)
            } else {
                setIsScrolled(false)
            }
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
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
            .slice(0, 5) // Only take top 5 for pie chart

        return {
            cropCompatibilityData,
            environmentalFactorsData,
            cropPieData,
        }
    }, [recommendationResult])

    // Custom tooltip for charts
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 dark:bg-gray-800/95 shadow-md border border-gray-100 dark:border-gray-700 p-2 rounded-md">
                    <p className="font-medium text-sm mb-1">{capitalizeWords(label || payload[0].name)}</p>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].fill || payload[0].color }} />
                        <p className="font-medium text-sm">{`${payload[0].value.toFixed(1)}%`}</p>
                    </div>
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
                <div className="bg-white/95 dark:bg-gray-800/95 shadow-md border border-gray-100 dark:border-gray-700 p-2 rounded-md">
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

    // Generate and download PDF report
    const downloadPdfReport = () => {
        const doc = new jsPDF()

        // Add title
        doc.setFontSize(20)
        doc.setTextColor(16, 185, 129) // Emerald color
        doc.text("Crop Recommendation Report", 105, 20, { align: "center" })

        // Add date
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: "center" })

        // Add environmental conditions
        doc.setFontSize(14)
        doc.setTextColor(0, 0, 0)
        doc.text("Environmental Conditions", 20, 45)

        doc.setFontSize(12)
        doc.text(`Temperature: ${recommendationResult.result.temperature.toFixed(1)}°C`, 25, 55)
        doc.text(`Humidity: ${recommendationResult.result.humidity}%`, 25, 65)
        doc.text(`Rainfall: ${recommendationResult.result.rainfall.toFixed(1)} mm`, 25, 75)

        // Add recommended crops
        doc.setFontSize(14)
        doc.text("Recommended Crops", 20, 95)

        doc.setFontSize(12)
        recommendationResult.result.prediction.forEach((crop, index) => {
            const score = getCompatibilityScore(crop)
            doc.text(`${index + 1}. ${capitalizeWords(crop)} - ${score}% compatibility`, 25, 105 + index * 10)
        })

        // Save the PDF
        doc.save("crop-recommendation-report.pdf")

        // Show success toast
        toast.success("Report downloaded successfully!", {
            description: "Your crop recommendation report has been downloaded as a PDF.",
            duration: 4000,
        })
    }

    // COLORS
    const COLORS = [
        "#10b981", // emerald-500
        "#06b6d4", // cyan-500
        "#8b5cf6", // violet-500
        "#f59e0b", // amber-500
        "#ec4899", // pink-500
    ]

    // Get the top recommended crop
    const topRecommendedCrop = useMemo(() => {
        const sortedCrops = Object.entries(recommendationResult.result.chart_data).sort(
            ([, scoreA], [, scoreB]) => (scoreB as number) - (scoreA as number),
        )

        return sortedCrops.length > 0 ? sortedCrops[0][0] : "No recommendation"
    }, [recommendationResult.result.chart_data])

    // Capitalize the first letter of each word in a string
    const capitalizeWords = (str: string) => {
        return str
            ?.split(" ")
            ?.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            ?.join(" ")
    }

    // Calculate compatibility score for a crop
    const getCompatibilityScore = (crop: string) => {
        return Math.round((recommendationResult.result.chart_data[crop] || 0) * 100)
    }

    // Get compatibility class based on score
    const getCompatibilityClass = (score: number) => {
        if (score >= 80) return "text-emerald-500 dark:text-emerald-400"
        if (score >= 60) return "text-amber-500 dark:text-amber-400"
        return "text-rose-500 dark:text-rose-400"
    }

    // Get compatibility label based on score
    const getCompatibilityLabel = (score: number) => {
        if (score >= 80) return "Excellent"
        if (score >= 60) return "Good"
        return "Moderate"
    }

    // Toggle expanded crop details
    const toggleCropExpansion = (crop: string) => {
        if (expandedCrop === crop) {
            setExpandedCrop(null)
        } else {
            setExpandedCrop(crop)
        }
    }

    // Show fullscreen chart
    const showChart = (chartType: string) => {
        setFullscreenChartType(chartType)
        setShowFullscreenChart(true)
    }

    // Get crop description (mock data for demonstration)
    const getCropDescription = (crop: string) => {
        const descriptions: Record<string, string> = {
            rice: "Rice thrives in warm, humid conditions with abundant water. It's a staple food crop that provides essential carbohydrates for billions of people worldwide.",
            wheat:
                "Wheat is adaptable to various climates and soils. It's a versatile grain used for bread, pasta, and numerous food products.",
            maize:
                "Maize (corn) grows best in warm weather and requires moderate water. It's used for human consumption, animal feed, and industrial products.",
            potato:
                "Potatoes prefer cool climates and well-drained soil. They're a nutritious root vegetable rich in carbohydrates and vitamin C.",
            cotton:
                "Cotton thrives in warm climates with long growing seasons. It's primarily grown for its fiber used in textile production.",
            sugarcane:
                "Sugarcane grows in tropical and subtropical regions. It's primarily cultivated for sugar production and biofuel.",
        }

        return (
            descriptions[crop.toLowerCase()] ||
            `${capitalizeWords(crop)} is well-suited for your soil conditions based on the nutrient profile and environmental factors you provided.`
        )
    }

    // Get crop growing tips (mock data for demonstration)
    const getCropGrowingTips = (crop: string) => {
        const tips: Record<string, string[]> = {
            rice: [
                "Maintain consistent water levels throughout the growing season",
                "Ensure proper drainage during harvest time",
                "Apply nitrogen fertilizer in split doses",
                "Control weeds early in the growing season",
            ],
            wheat: [
                "Plant at the optimal time for your region",
                "Ensure adequate nitrogen for good yields",
                "Control weeds and pests promptly",
                "Monitor for fungal diseases in humid conditions",
            ],
            maize: [
                "Plant when soil temperature reaches 50°F (10°C)",
                "Space plants properly for good air circulation",
                "Apply balanced fertilizer before planting",
                "Ensure consistent moisture during tasseling",
            ],
            potato: [
                "Plant seed potatoes in well-drained soil",
                "Hill soil around plants as they grow",
                "Maintain consistent moisture levels",
                "Harvest after vines have died back",
            ],
            cotton: [
                "Plant when soil temperature is at least 65°F (18°C)",
                "Control early-season insects",
                "Apply nitrogen in split applications",
                "Defoliate before harvest",
            ],
            sugarcane: [
                "Plant in well-drained, fertile soil",
                "Maintain adequate moisture throughout growth",
                "Control weeds during establishment",
                "Harvest at peak sugar content",
            ],
        }

        return (
            tips[crop.toLowerCase()] || [
                "Prepare soil with appropriate nutrients based on soil test",
                "Monitor water needs throughout the growing season",
                "Watch for pests and diseases common to this crop",
                "Harvest at optimal maturity for best quality",
            ]
        )
    }

    // Render fullscreen chart
    const renderFullscreenChart = () => {
        if (!fullscreenChartType) return null

        return (
            <div
                className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                onClick={() => setShowFullscreenChart(false)}
            >
                <div
                    className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl h-[80vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                        <h3 className="text-xl font-bold">
                            {fullscreenChartType === "compatibility" && "Crop Compatibility Analysis"}
                            {fullscreenChartType === "environment" && "Environmental Factors Analysis"}
                            {fullscreenChartType === "distribution" && "Crop Distribution Analysis"}
                        </h3>
                        <Button variant="ghost" size="icon" onClick={() => setShowFullscreenChart(false)}>
                            <Minimize2 className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="p-6 h-[calc(80vh-70px)]">
                        {fullscreenChartType === "compatibility" && (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={cropCompatibilityData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                                    layout="vertical"
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                                    <YAxis dataKey="crop" type="category" width={120} tickFormatter={capitalizeWords} />
                                    <RechartsTooltip content={<CustomTooltip />} />
                                    <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                                        {cropCompatibilityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}

                        {fullscreenChartType === "environment" && (
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart outerRadius={200} data={environmentalFactorsData}>
                                    <PolarGrid stroke="#e5e7eb" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#6b7280", fontSize: 14, fontWeight: "bold" }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 12 }} />
                                    <RechartsTooltip content={RadarTooltip} />
                                    <Radar
                                        name="Environmental Factors"
                                        dataKey="value"
                                        stroke="#10b981"
                                        fill="#10b981"
                                        fillOpacity={0.6}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        )}

                        {fullscreenChartType === "distribution" && (
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                    <Pie
                                        data={cropPieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={100}
                                        outerRadius={180}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${capitalizeWords(name)}: ${(percent * 100).toFixed(0)}%`}
                                        labelLine={true}
                                    >
                                        {cropPieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={2} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip content={<CustomTooltip />} />
                                    <Legend formatter={(value) => capitalizeWords(value)} />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    const sendMessageToSupport = async () => {

        if(supportMessage == '') return;
        setIsSending(true)

        // Show loading toast
        const loadingToast = toast.loading("Sending report to support...")

        try {

            const response = await api.post("/api/emails/send-support", {message: supportMessage},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
                    },
                },)

            setIsSent(true)

            // Dismiss loading toast and show success toast
            toast.dismiss(loadingToast)
            toast.success("Report sent successfully!", {
                description: "Message sent to Support",
                duration: 4000,
            })

            setTimeout(() => setIsSent(false), 3000)
        } catch (error) {
            console.error("Error sending email:", error)

            // Dismiss loading toast and show error toast
            toast.dismiss(loadingToast)
            toast.error("Failed to send report", {
                description: "There was an error sending the report. Please try again.",
                duration: 5000,
            })
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            {/* Add the Navbar component */}
            <PagesNavbar />

            {/* Loading overlay */}
            <LoadingOverlay isVisible={isLoading} message="Processing..." />
            {/* Fullscreen chart modal */}
            {showFullscreenChart && renderFullscreenChart()}

            {/* Sticky header */}
            <div
                ref={headerRef}
                className={cn(
                    "sticky top-0 z-40 w-full transition-all duration-300",
                    isScrolled ? "bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm shadow-sm py-2" : "bg-transparent py-4",
                )}
            >
                <div className="container max-w-6xl mx-auto px-4">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={goBack}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back</span>
                        </Button>

                        {isScrolled && (
                            <div className="flex items-center gap-3">
                                <Badge
                                    variant="outline"
                                    className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                >
                                    {capitalizeWords(topRecommendedCrop)}
                                </Badge>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Rest of your component JSX */}
            <div className="container max-w-6xl mx-auto px-4 pt-4 pb-16">
                {/* Your existing content */}
                {/* Hero section */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="flex flex-col gap-6">
                        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row gap-8 items-center">
                                    {/* Top recommendation - Now 50% width */}
                                    <div className="w-full md:w-1/2 flex flex-col items-center">
                                        <div className="w-48 h-48 bg-emerald-50 dark:bg-emerald-900/30 rounded-full p-4 flex items-center justify-center shadow-sm">
                                            <img
                                                src={`/src/assets/crops/${topRecommendedCrop.toLowerCase()}.png`}
                                                alt={capitalizeWords(topRecommendedCrop)}
                                                className="object-contain w-[85%] h-[85%]"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = "none"
                                                    if (e.currentTarget.nextElementSibling instanceof HTMLElement) {
                                                        e.currentTarget.nextElementSibling.style.display = "block"
                                                    }
                                                }}
                                            />
                                            <Sprout className="h-24 w-24 text-emerald-500 z-10" style={{ display: "none" }} />
                                        </div>

                                        <div className="text-center mt-4">
                                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 px-3 py-1 mb-2">
                                                Top Recommendation
                                            </Badge>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">
                                                {capitalizeWords(topRecommendedCrop)}
                                            </h2>
                                            <div className="flex items-center justify-center gap-2">
                                                <Badge className="bg-emerald-500 text-white">
                                                    {getCompatibilityScore(topRecommendedCrop)}% Match
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info and stats */}
                                    <div className="w-full md:w-1/2">
                                        <h1 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900 dark:text-gray-50">
                                            Your Ideal Crops
                                        </h1>

                                        <p className="text-muted-foreground mb-6">
                                            Based on your soil composition and environmental conditions, we've identified the perfect crops
                                            for your land. These recommendations are tailored to maximize yield and sustainability.
                                        </p>

                                        <div className="grid grid-cols-3 gap-4 mb-6">
                                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-800">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Thermometer className="h-5 w-5 text-rose-500" />
                                                    <span className="text-sm font-medium text-muted-foreground">Temperature</span>
                                                </div>
                                                <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold">
                            <AnimatedCounter value={recommendationResult.result.temperature} decimals={1} />
                          </span>
                                                    <span className="text-muted-foreground">°C</span>
                                                </div>
                                            </div>

                                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-800">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Droplets className="h-5 w-5 text-blue-500" />
                                                    <span className="text-sm font-medium text-muted-foreground">Humidity</span>
                                                </div>
                                                <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold">
                            <AnimatedCounter value={recommendationResult.result.humidity} />
                          </span>
                                                    <span className="text-muted-foreground">%</span>
                                                </div>
                                            </div>

                                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-800">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Cloud className="h-5 w-5 text-indigo-500" />
                                                    <span className="text-sm font-medium text-muted-foreground">Rainfall</span>
                                                </div>
                                                <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold">
                            <AnimatedCounter value={recommendationResult.result.rainfall} decimals={1} />
                          </span>
                                                    <span className="text-muted-foreground">mm</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={downloadPdfReport}>
                                                <Download className="mr-2 h-4 w-4" />
                                                Download Report
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Email subscription card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mb-8"
                >
                    <Card className="border border-gray-100 dark:border-gray-800 shadow-md overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                            <div className="p-6 flex-1">
                                <div className="flex items-start gap-4">
                                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full">
                                        <Mail className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Get Your Detailed Report</h3>
                                        <p className="text-muted-foreground mb-4">
                                            Receive a comprehensive analysis of your soil conditions and crop recommendations directly in your
                                            inbox.
                                        </p>
                                        <div className="flex flex-col sm:flex-row gap-3">
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
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                            >
                        <span className="flex items-center justify-center gap-2">
                          {isSending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                          ) : isSent ? (
                              <CheckCircle2 className="h-4 w-4" />
                          ) : (
                              <Mail className="h-4 w-4" />
                          )}
                            <span>{isSending ? "Sending..." : isSent ? "Sent!" : "Send Report"}</span>
                        </span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Main content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left column - Crop recommendations */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="lg:col-span-2"
                    >
                        <Card className="border border-gray-100 dark:border-gray-800 shadow-md overflow-hidden mb-8">
                            <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <Leaf className="h-5 w-5 text-emerald-500" />
                                        <span>Recommended Crops</span>
                                    </CardTitle>
                                    <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-900/30">
                                        {recommendationResult.result.prediction.length} Results
                                    </Badge>
                                </div>
                                <CardDescription>Crops sorted by compatibility with your soil conditions</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ScrollArea className="h-[600px]">
                                    <div className="p-4 space-y-1">
                                        {Object.entries(recommendationResult.result.chart_data)
                                            .sort(([, scoreA], [, scoreB]) => (scoreB as number) - (scoreA as number))
                                            .map(([crop, score], index) => {
                                                const compatibilityScore = Math.round((score as number) * 100)
                                                const isExpanded = expandedCrop === crop

                                                return (
                                                    <motion.div
                                                        key={crop}
                                                        className="relative"
                                                        initial={{ opacity: 0, y: 5 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.3, delay: 0.1 * index }}
                                                    >
                                                        <div
                                                            className={cn(
                                                                "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-lg p-4 mb-2 hover:shadow-sm transition-all duration-300",
                                                                isExpanded && "shadow-md",
                                                            )}
                                                        >
                                                            <div
                                                                className="flex items-center justify-between cursor-pointer"
                                                                onClick={() => toggleCropExpansion(crop)}
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-full p-2 flex items-center justify-center">
                                                                        <img
                                                                            src={`/src/assets/crops/${crop.toLowerCase().replace(/\s+/g, "-")}.png`}
                                                                            alt={capitalizeWords(crop)}
                                                                            className="object-contain w-[85%] h-[85%]"
                                                                            onError={(e) => {
                                                                                e.currentTarget.style.display = "none"
                                                                                if (e.currentTarget.nextElementSibling instanceof HTMLElement) {
                                                                                    e.currentTarget.nextElementSibling.style.display = "block"
                                                                                }
                                                                            }}
                                                                        />
                                                                        <Sprout className="h-8 w-8 text-emerald-500" style={{ display: "none" }} />
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="font-medium text-lg">{capitalizeWords(crop)}</h3>
                                                                        <div className="flex items-center gap-2">
                                      <span
                                          className={cn("text-sm font-medium", getCompatibilityClass(compatibilityScore))}
                                      >
                                        {getCompatibilityLabel(compatibilityScore)}
                                      </span>
                                                                            <span className="text-xs text-muted-foreground">
                                        ({compatibilityScore}% match)
                                      </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="h-2 w-24 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                        <div
                                                                            className={cn(
                                                                                "h-full rounded-full",
                                                                                compatibilityScore >= 80
                                                                                    ? "bg-emerald-500"
                                                                                    : compatibilityScore >= 60
                                                                                        ? "bg-amber-500"
                                                                                        : "bg-rose-500",
                                                                            )}
                                                                            style={{ width: `${compatibilityScore}%` }}
                                                                        />
                                                                    </div>
                                                                    {isExpanded ? (
                                                                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                                                    ) : (
                                                                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {isExpanded && (
                                                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                                                    <p className="text-muted-foreground mb-4">{getCropDescription(crop)}</p>

                                                                    <div className="mb-4">
                                                                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                                                            <Info className="h-4 w-4 text-amber-500" />
                                                                            Growing Tips
                                                                        </h4>
                                                                        <ul className="space-y-1">
                                                                            {getCropGrowingTips(crop).map((tip, i) => (
                                                                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                                                                    <div className="w-1 h-1 rounded-full bg-emerald-500 mt-2"></div>
                                                                                    {tip}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>

                                                                    <div className="flex items-center justify-end">
                                                                        <Button size="sm" variant="outline" className="h-8">
                                                                            <span>Learn More</span>
                                                                            <ArrowLeft className="ml-1 h-3.5 w-3.5 rotate-180" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {index < Object.keys(recommendationResult.result.chart_data).length - 1 && !isExpanded && (
                                                            <Separator className="my-1" />
                                                        )}
                                                    </motion.div>
                                                )
                                            })}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>

                        {/* Data visualization tabs */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <Card className="border border-gray-100 dark:border-gray-800 shadow-md overflow-hidden">
                                <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5 text-emerald-500" />
                                        Data Analysis
                                    </CardTitle>
                                    <CardDescription>
                                        Visual representation of crop compatibility and environmental factors
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <Tabs defaultValue="compatibility" className="w-full" onValueChange={setActiveTab}>
                                        <TabsList className="grid grid-cols-3 mb-6">
                                            <TabsTrigger value="compatibility">
                                                <BarChart3 className="h-4 w-4 mr-2" />
                                                Compatibility
                                            </TabsTrigger>
                                            <TabsTrigger value="environment">
                                                <LineChart className="h-4 w-4 mr-2" />
                                                Environment
                                            </TabsTrigger>
                                            <TabsTrigger value="distribution">
                                                <PieChart className="h-4 w-4 mr-2" />
                                                Distribution
                                            </TabsTrigger>
                                        </TabsList>

                                        <div className="relative">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="absolute top-0 right-0 z-10"
                                                onClick={() => showChart(activeTab)}
                                            >
                                                <Maximize2 className="h-4 w-4 mr-1" />
                                                Fullscreen
                                            </Button>

                                            <div>
                                                <TabsContent value="compatibility" className="mt-0">
                                                    <div className="h-[400px]">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <BarChart
                                                                data={cropCompatibilityData}
                                                                margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                                                                layout="vertical"
                                                            >
                                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                                                <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                                                                <YAxis dataKey="crop" type="category" width={120} tickFormatter={capitalizeWords} />
                                                                <RechartsTooltip content={<CustomTooltip />} />
                                                                <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                                                                    {cropCompatibilityData.map((entry, index) => (
                                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                    ))}
                                                                </Bar>
                                                            </BarChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </TabsContent>

                                                <TabsContent value="environment" className="mt-0">
                                                    <div className="h-[400px]">
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
                                                                />
                                                                <RechartsTooltip content={RadarTooltip} />
                                                                <Radar
                                                                    name="Environmental Factors"
                                                                    dataKey="value"
                                                                    stroke="#10b981"
                                                                    fill="#10b981"
                                                                    fillOpacity={0.6}
                                                                />
                                                            </RadarChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </TabsContent>

                                                <TabsContent value="distribution" className="mt-0">
                                                    <div className="h-[400px]">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <RechartsPieChart>
                                                                <Pie
                                                                    data={cropPieData}
                                                                    cx="50%"
                                                                    cy="50%"
                                                                    innerRadius={60}
                                                                    outerRadius={120}
                                                                    paddingAngle={5}
                                                                    dataKey="value"
                                                                    label={({ name, percent }) =>
                                                                        `${capitalizeWords(name)}: ${(percent * 100).toFixed(0)}%`
                                                                    }
                                                                    labelLine={true}
                                                                >
                                                                    {cropPieData.map((entry, index) => (
                                                                        <Cell
                                                                            key={`cell-${index}`}
                                                                            fill={COLORS[index % COLORS.length]}
                                                                            stroke="#fff"
                                                                            strokeWidth={2}
                                                                        />
                                                                    ))}
                                                                </Pie>
                                                                <RechartsTooltip content={<CustomTooltip />} />
                                                                <Legend formatter={(value) => capitalizeWords(value)} />
                                                            </RechartsPieChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </TabsContent>
                                            </div>
                                        </div>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>

                    {/* Right column - Environmental factors and tips */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="space-y-8"
                    >
                        {/* Environmental factors card */}
                        <Card className="border border-gray-100 dark:border-gray-800 shadow-md overflow-hidden">
                            <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Cloud className="h-5 w-5 text-blue-500" />
                                    Environmental Factors
                                </CardTitle>
                                <CardDescription>Current conditions affecting crop growth</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Thermometer className="h-4 w-4 text-rose-500" />
                                                <span className="text-sm font-medium">Temperature</span>
                                            </div>
                                            <span className="text-sm font-bold">{recommendationResult.result.temperature.toFixed(1)}°C</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-rose-500 rounded-full"
                                                style={{ width: `${(recommendationResult.result.temperature / 40) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Droplets className="h-4 w-4 text-blue-500" />
                                                <span className="text-sm font-medium">Humidity</span>
                                            </div>
                                            <span className="text-sm font-bold">{recommendationResult.result.humidity}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 rounded-full"
                                                style={{ width: `${recommendationResult.result.humidity}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Cloud className="h-4 w-4 text-indigo-500" />
                                                <span className="text-sm font-medium">Rainfall</span>
                                            </div>
                                            <span className="text-sm font-bold">{recommendationResult.result.rainfall.toFixed(1)} mm</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500 rounded-full"
                                                style={{ width: `${Math.min((recommendationResult.result.rainfall / 2000) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
                                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                            <Info className="h-4 w-4 text-emerald-500" />
                                            Climate Assessment
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            Your current environmental conditions are well-suited for a variety of crops. The temperature,
                                            humidity, and rainfall levels fall within optimal ranges for the recommended crops.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Support */}
                        <Card className="border border-gray-100 dark:border-gray-800 shadow-md overflow-hidden">
                            <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                                <CardTitle className="text-lg">Contact Support</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                  <textarea
                      className="w-full h-32 p-3 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none bg-white dark:bg-gray-800"
                      placeholder="Write your message to support here..."

                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  />
                                    <Button className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white" onClick={sendMessageToSupport}>
                                        Send to Support
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

