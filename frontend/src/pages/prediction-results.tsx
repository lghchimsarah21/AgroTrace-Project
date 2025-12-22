"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
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
    Maximize2,
    Minimize2,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import PagesNavbar from "@/pages/pagesNavbar.tsx"
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
    Line,
    LineChart,
} from "recharts"

import api from "@/config/api"
import { toast } from "sonner"
import { jsPDF } from "jspdf"
import { motion } from "framer-motion"

interface YieldData {
    [key: string | number]: number
}

interface PredictionResultType {
    id: number
    result: {
        humid_yield: YieldData
        humidity: number
        prediction: number
        rain_yield: YieldData
        rainfall: number
        season_yield: YieldData
        temp_yield: YieldData
        temperature: number
        year_yield: YieldData
    }
}

interface PredictionResultsProps {
    predictionResult: PredictionResultType
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

            // Use easeOutExpo for smoother animation
            const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
            setDisplayValue(easeOutExpo * value)

            if (progress < 1) {
                animationFrame = requestAnimationFrame(updateValue)
            }
        }

        animationFrame = requestAnimationFrame(updateValue)

        return () => cancelAnimationFrame(animationFrame)
    }, [value, duration])

    return <span className="transition-colors duration-300 hover:text-emerald-500">{displayValue.toFixed(decimals)}</span>
}

// Chart error boundary component
const ChartErrorBoundary = ({
                                children,
                                fallback = null,
                            }: { children: React.ReactNode; fallback?: React.ReactNode }) => {
    const [hasError, setHasError] = useState(false)

    useEffect(() => {
        const errorHandler = (error: ErrorEvent) => {
            if (error.message.includes("Recharts context")) {
                setHasError(true)
                error.preventDefault()
            }
        }

        window.addEventListener("error", errorHandler)
        return () => window.removeEventListener("error", errorHandler)
    }, [])

    if (hasError) {
        return (
            fallback || (
                <div className="flex h-full w-full items-center justify-center">
                    <p className="text-muted-foreground">Chart could not be displayed</p>
                </div>
            )
        )
    }

    return <>{children}</>
}

// Update the CustomTooltip component to make it more visually appealing
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 dark:bg-gray-800/95 shadow-lg border border-gray-100 dark:border-gray-700 p-3 rounded-md transition-all duration-200 animate-in fade-in zoom-in-95">
                <p className="font-medium text-sm mb-1 text-gray-700 dark:text-gray-300">{label || payload[0].name}</p>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].fill || payload[0].color }} />
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{`${payload[0].value.toFixed(2)} kg/ha`}</p>
                </div>
            </div>
        )
    }
    return null
}

// Update the RadarTooltip component to make it more visually appealing
const RadarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload
        const displayValue = data.actual
        let unit = ""
        let color = ""

        if (data.subject === "Temperature") {
            unit = "°C"
            color = "#ef4444" // red-500
        } else if (data.subject === "Humidity") {
            unit = "%"
            color = "#3b82f6" // blue-500
        } else if (data.subject === "Rainfall") {
            unit = "mm"
            color = "#8b5cf6" // violet-500
        }

        return (
            <div className="bg-white/95 dark:bg-gray-800/95 shadow-lg border border-gray-100 dark:border-gray-700 p-3 rounded-md transition-all duration-200 animate-in fade-in zoom-in-95">
                <p className="font-medium text-sm mb-1 text-gray-700 dark:text-gray-300">{data.subject}</p>
                <p className="font-medium text-sm" style={{ color }}>
                    {`${displayValue}${unit}`}
                </p>
            </div>
        )
    }
    return null
}

// Update the COLORS array to use more nature-inspired colors
const COLORS = [
    "#4ade80", // green-400
    "#34d399", // emerald-400
    "#2dd4bf", // teal-400
    "#a3e635", // lime-400
    "#84cc16", // lime-500
    "#65a30d", // lime-600
    "#bef264", // lime-300
    "#86efac", // green-300
]

// Update chart configuration with more nature-themed colors
const chartConfig = {
    yield: {
        label: "Yield (kg/ha)",
        color: "#4ade80", // green-400
    },
    temperature: {
        label: "Temperature Effect",
        color: "#f59e0b", // amber-500 (warm color for temperature)
    },
    humidity: {
        label: "Humidity Effect",
        color: "#0ea5e9", // sky-500 (water-related)
    },
    rainfall: {
        label: "Rainfall Effect",
        color: "#3b82f6", // blue-500 (water-related)
    },
    season: {
        label: "Season Effect",
        color: "#84cc16", // lime-500
    },
    growth: {
        label: "Growth Trend",
        color: "#10b981", // emerald-500
    },
}

export default function PredictionResults({ predictionResult, goBack }: PredictionResultsProps) {
    // Your existing state and hooks
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("yearly")
    const [email, setEmail] = useState("")
    const [supportMessage, setSupportMessage] = useState("")
    const [isSending, setIsSending] = useState(false)
    const [isSent, setIsSent] = useState(false)
    const [expandedFactor, setExpandedFactor] = useState<string | null>(null)
    const [isScrolled, setIsScrolled] = useState(false)
    const [showFullscreenChart, setShowFullscreenChart] = useState(false)
    const [fullscreenChartType, setFullscreenChartType] = useState<string | null>(null)
    const [headerRef, setHeaderRef] = useState<HTMLDivElement | null>(null)

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
    const {
    yearlyYieldData,
    seasonalYieldData,
    temperatureYieldData,
    humidityYieldData,
    rainfallYieldData,
    environmentalFactorsData,
    seasonPieData,
    growthTrendData,
} = useMemo(() => {
    const result = predictionResult?.result || {}; // Sécuriser l'accès

    // Format the yearly yield data for the chart
    const yearlyYieldData = Object.entries(result.year_yield || {})
        .map(([year, yield_value]) => ({
            year,
            yield: yield_value,
        }))
        .sort((a, b) => Number(a.year) - Number(b.year));

    // Format the seasonal yield data for the chart
    const seasonalYieldData = Object.entries(result.season_yield || {}).map(
        ([season, yield_value]) => ({
            season,
            yield: yield_value,
        })
    );

    // Format the temperature yield data for the chart
    const temperatureYieldData = Object.entries(result.temp_yield || {})
        .map(([temp, yield_value]) => ({
            temperature: Number(temp),
            yield: yield_value,
        }))
        .sort((a, b) => a.temperature - b.temperature);

    // Format the humidity yield data for the chart
    const humidityYieldData = Object.entries(result.humid_yield || {})
        .map(([humidity, yield_value]) => ({
            humidity: Number(humidity),
            yield: yield_value,
        }))
        .sort((a, b) => a.humidity - b.humidity);

    // Format the rainfall yield data for the chart
    const rainfallYieldData = Object.entries(result.rain_yield || {})
        .map(([rainfall, yield_value]) => ({
            rainfall: Number(rainfall),
            yield: yield_value,
        }))
        .sort((a, b) => a.rainfall - b.rainfall);

    // Create data for radar chart
    const environmentalFactorsData = [
        {
            subject: "Temperature",
            value: result.temperature ? (result.temperature / 40) * 100 : 0,
            fullMark: 100,
            actual: result.temperature || 0,
        },
        {
            subject: "Humidity",
            value: result.humidity || 0,
            fullMark: 100,
            actual: result.humidity || 0,
        },
        {
            subject: "Rainfall",
            value: result.rainfall ? Math.min((result.rainfall / 2000) * 100, 100) : 0,
            fullMark: 100,
            actual: result.rainfall || 0,
        },
    ];

    // Create data for season pie chart
    const seasonPieData = Object.entries(result.season_yield || {})
        .map(([season, yield_value]) => ({
            name: season,
            value: yield_value,
        }))
        .sort((a, b) => b.value - a.value);

    // Create growth trend data (simulated data based on prediction)
    const growthTrendData = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const growthFactor = Math.sin((month / 12) * Math.PI) * 0.5 + 0.5;
        return {
            month: new Date(2023, i, 1).toLocaleString("default", { month: "short" }),
            growth: (result.prediction || 0) * growthFactor * (0.85 + Math.random() * 0.3),
        };
    });

    return {
        yearlyYieldData,
        seasonalYieldData,
        temperatureYieldData,
        humidityYieldData,
        rainfallYieldData,
        environmentalFactorsData,
        seasonPieData,
        growthTrendData,
    };
}, [predictionResult]);

    // Add more vibrant colors for charts

    // Update chart configuration with more vibrant colors

    // Custom tooltip for charts

    // Get max yield value for consistent Y-axis scaling
    const maxYield = useMemo(() => {
        const allYields = [
            ...yearlyYieldData.map((d) => d.yield),
            ...seasonalYieldData.map((d) => d.yield),
            ...temperatureYieldData.map((d) => d.yield),
            ...rainfallYieldData.map((d) => d.yield),
            ...humidityYieldData.map((d) => d.yield),
        ]
        return Math.ceil(Math.max(...allYields, 1) * 1.1) // Add 10% padding, ensure at least 1
    }, [yearlyYieldData, seasonalYieldData, temperatureYieldData, rainfallYieldData, humidityYieldData])

    // Custom tooltip component for better design

    // Handle sending prediction email
    const handleSendPredictionEmail = async () => {
        if (!email || !email.includes("@")) return

        setIsSending(true)

        // Show loading toast
        const loadingToast = toast.loading("Sending prediction report...")

        try {
            await api.post(
                `/api/emails/send-prediction/${predictionResult.id}`,
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
                description: `The prediction report has been sent to ${email}`,
                duration: 4000,
            })

            setTimeout(() => setIsSent(false), 3000)
            setEmail("")
        } catch (error) {
            console.error("Error sending email:", error)

            // Dismiss loading toast and show error toast
            toast.dismiss(loadingToast)
            toast.error("Failed to send report", {
                description: "There was an error sending the prediction report. Please try again.",
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
        doc.text("Crop Yield Prediction Report", 105, 20, { align: "center" })

        // Add date
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: "center" })

        // Add environmental conditions
        doc.setFontSize(14)
        doc.setTextColor(0, 0, 0)
        doc.text("Environmental Conditions", 20, 45)

        doc.setFontSize(12)
        doc.text(`Temperature: ${predictionResult.result.temperature.toFixed(1)}°C`, 25, 55)
        doc.text(`Humidity: ${predictionResult.result.humidity}%`, 25, 65)
        doc.text(`Rainfall: ${predictionResult.result.rainfall.toFixed(1)} mm`, 25, 75)

        // Add predicted yield
        doc.setFontSize(14)
        doc.text("Predicted Yield", 20, 95)
        doc.setFontSize(12)
        doc.text(`${predictionResult.result.prediction.toFixed(2)} kg/ha`, 25, 105)

        // Add seasonal yields
        doc.setFontSize(14)
        doc.text("Seasonal Yields", 20, 125)
        doc.setFontSize(12)
        Object.entries(predictionResult.result.season_yield).forEach(([season, yield_value], index) => {
            doc.text(`${season}: ${yield_value.toFixed(2)} kg/ha`, 25, 135 + index * 10)
        })

        // Save the PDF
        doc.save("crop-yield-prediction-report.pdf")

        // Show success toast
        toast.success("Report downloaded successfully!", {
            description: "Your crop yield prediction report has been downloaded as a PDF.",
            duration: 4000,
        })
    }

    // Get the best season for yield
    const bestSeason = useMemo(() => {
        const sortedSeasons = Object.entries(predictionResult.result.season_yield || {}).sort(
            ([, yieldA], [, yieldB]) => (yieldB as number) - (yieldA as number),
        )

        return sortedSeasons.length > 0 ? sortedSeasons[0][0] : "N/A"
    }, [predictionResult])

    const toggleFactorExpansion = (factor: string) => {
        setExpandedFactor((prevFactor) => (prevFactor === factor ? null : factor))
    }

    const toggleFullscreenChart = (chartType: string) => {
        setFullscreenChartType(chartType)
        setShowFullscreenChart(true)
    }

    const closeFullscreenChart = () => {
        setShowFullscreenChart(false)
        setFullscreenChartType(null)
    }

    const sendMessageToSupport = async () => {
        if (supportMessage === "") return
        setIsSending(true)

        // Show loading toast
        const loadingToast = toast.loading("Sending report to support...")

        try {
            const response = await api.post(
                "/api/emails/send-support",
                { message: supportMessage },
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
                description: "Message sent to Support",
                duration: 4000,
            })

            setTimeout(() => setIsSent(false), 3000)
            setSupportMessage("")
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

    // Render fullscreen chart with error handling
    const renderFullscreenChart = () => {
        if (!fullscreenChartType) return null

        return (
            <motion.div
                className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                onClick={() => setShowFullscreenChart(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                <motion.div
                    className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl h-[80vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                        <h3 className="text-xl font-bold">
                            {fullscreenChartType === "yearly" && "Yearly Yield Comparison"}
                            {fullscreenChartType === "seasonal" && "Seasonal Yield Variation"}
                            {fullscreenChartType === "temperature" && "Temperature Impact"}
                            {fullscreenChartType === "humidity" && "Humidity & Rainfall Comparison"}
                            {fullscreenChartType === "rainfall" && "Rainfall vs Yield"}
                            {fullscreenChartType === "radar" && "Environmental Factors"}
                            {fullscreenChartType === "pie" && "Seasonal Yield Distribution"}
                            {fullscreenChartType === "growth" && "Monthly Growth Trend"}
                        </h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={closeFullscreenChart}
                            className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <Minimize2 className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="p-6 h-[calc(80vh-70px)] bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                        <ChartErrorBoundary>
                            {fullscreenChartType === "yearly" && yearlyYieldData.length > 0 && (
                                <ResponsiveContainer width="100%" height="90%">
                                    <BarChart
                                        data={yearlyYieldData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        barSize={60}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="year" />
                                        <YAxis domain={[0, maxYield]} />
                                        <RechartsTooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey="yield" name={chartConfig.yield.label}>
                                            {yearlyYieldData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}

                            {fullscreenChartType === "seasonal" && seasonalYieldData.length > 0 && (
                                <ResponsiveContainer width="100%" height="90%">
                                    <BarChart data={seasonalYieldData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="season" />
                                        <YAxis domain={[0, maxYield]} />
                                        <RechartsTooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar
                                            dataKey="yield"
                                            fill={chartConfig.season.color}
                                            name={chartConfig.season.label}
                                            animationBegin={0}
                                            animationDuration={1500}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}

                            {fullscreenChartType === "temperature" && temperatureYieldData.length > 0 && (
                                <ResponsiveContainer width="100%" height="90%">
                                    <BarChart data={temperatureYieldData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="temperature" />
                                        <YAxis domain={[0, maxYield]} />
                                        <RechartsTooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar
                                            dataKey="yield"
                                            fill={chartConfig.temperature.color}
                                            name={chartConfig.temperature.label}
                                            animationBegin={0}
                                            animationDuration={1500}
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}

                            {fullscreenChartType === "humidity" && humidityYieldData.length > 0 && (
                                <ResponsiveContainer width="100%" height="90%">
                                    <BarChart data={humidityYieldData.slice(0, 5)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="humidity" />
                                        <YAxis domain={[0, maxYield]} />
                                        <RechartsTooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar
                                            dataKey="yield"
                                            stackId="a"
                                            fill={chartConfig.humidity.color}
                                            name="Humidity Effect"
                                            animationBegin={0}
                                            animationDuration={1500}
                                        />
                                        {rainfallYieldData && rainfallYieldData.length > 0 && (
                                            <Bar
                                                dataKey="yield"
                                                stackId="a"
                                                data={rainfallYieldData.slice(0, 5).map((item) => ({
                                                    humidity: item.rainfall / 10, // Normalize to match humidity scale
                                                    yield: item.yield / 2, // Scale down for visualization
                                                }))}
                                                fill={chartConfig.rainfall.color}
                                                name="Rainfall Effect"
                                                animationBegin={200}
                                                animationDuration={1500}
                                            />
                                        )}
                                    </BarChart>
                                </ResponsiveContainer>
                            )}

                            {fullscreenChartType === "rainfall" && rainfallYieldData.length > 0 && (
                                <ResponsiveContainer width="100%" height="90%">
                                    <LineChart data={rainfallYieldData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="rainfall" />
                                        <YAxis domain={[0, maxYield]} />
                                        <RechartsTooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="yield"
                                            stroke={chartConfig.rainfall.color}
                                            strokeWidth={2}
                                            dot={{ r: 4 }}
                                            activeDot={{ r: 6, stroke: "white", strokeWidth: 2 }}
                                            name={chartConfig.rainfall.label}
                                            animationBegin={0}
                                            animationDuration={1500}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}

                            {fullscreenChartType === "radar" && (
                                <ResponsiveContainer width="100%" height="90%">
                                    <RadarChart outerRadius={150} data={environmentalFactorsData}>
                                        <PolarGrid stroke="#e5e7eb" />
                                        <PolarAngleAxis dataKey="subject" />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                        <Radar
                                            name="Value"
                                            dataKey="value"
                                            stroke="#4ade80"
                                            fill="#4ade80"
                                            fillOpacity={0.6}
                                            animationBegin={0}
                                            animationDuration={1500}
                                        />
                                        <RechartsTooltip content={<RadarTooltip />} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            )}

                            {fullscreenChartType === "pie" && seasonPieData.length > 0 && (
                                <ResponsiveContainer width="100%" height="90%">
                                    <RechartsPieChart>
                                        <Pie
                                            dataKey="value"
                                            isAnimationActive={true}
                                            animationBegin={0}
                                            animationDuration={1500}
                                            data={seasonPieData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={150}
                                            fill="#8884d8"
                                            label={({ name, value }) => `${name}: ${value.toFixed(2)}`}
                                        >
                                            {seasonPieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Legend />
                                        <RechartsTooltip />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                            )}

                            {fullscreenChartType === "growth" && growthTrendData && growthTrendData.length > 0 && (
                                <ResponsiveContainer width="100%" height="90%">
                                    <BarChart
                                        data={growthTrendData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        barCategoryGap={2}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="month" />
                                        <YAxis domain={[0, Math.ceil(predictionResult.result.prediction * 1.2)]} />
                                        <RechartsTooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar
                                            dataKey="growth"
                                            fill={chartConfig.growth.color}
                                            name={chartConfig.growth.label}
                                            radius={[4, 4, 0, 0]}
                                            animationBegin={0}
                                            animationDuration={1500}
                                        >
                                            {growthTrendData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={`rgba(52, 211, 153, ${0.4 + (index / growthTrendData.length) * 0.6})`}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </ChartErrorBoundary>
                    </div>
                </motion.div>
            </motion.div>
        )
    }

    // Replace the return statement with an enhanced version that includes animations
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
            {/* Add the Navbar component */}

            <PagesNavbar/>

            {/* Loading overlay */}
            <LoadingOverlay isVisible={isLoading} message="Processing..." />

            {/* Fullscreen chart modal */}
            {showFullscreenChart && renderFullscreenChart()}

            {/* Sticky header */}
            <motion.div
                ref={headerRef}
                className={cn(
                    "sticky top-0 z-40 w-full transition-all duration-300",
                    isScrolled ? "bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm shadow-sm py-2" : "bg-transparent py-4",
                )}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
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
                    </div>
                </div>
            </motion.div>

            <div className="container max-w-6xl mx-auto px-4 pt-4 pb-16">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <Card className="w-full overflow-hidden border-none shadow-lg bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/30 dark:to-gray-900">
                        <CardHeader className="bg-emerald-50/50 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/30">
                            <CardTitle className="text-2xl text-emerald-800 dark:text-emerald-300">Crop Yield Prediction</CardTitle>
                            <CardDescription>Based on the provided environmental factors, the predicted yield is:</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid gap-4">
                                <div className="font-bold text-4xl text-emerald-600 dark:text-emerald-400 flex items-baseline">
                                    <AnimatedCounter value={predictionResult.result.prediction} decimals={2} />
                                    <span className="ml-2 text-2xl text-emerald-500/70 dark:text-emerald-500/50">kg/ha</span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    This prediction is based on historical data and the following environmental conditions.
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-gray-900 h-full">
                            <CardHeader className="bg-blue-50/50 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-900/30">
                                <CardTitle className="text-blue-800 dark:text-blue-300">Environmental Factors</CardTitle>
                                <CardDescription>Key factors influencing the prediction.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 flex-grow">
                                <div className="grid gap-4">
                                    <div className="flex items-center justify-between p-2 rounded-md hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-red-100 dark:bg-red-900/30 p-1.5 rounded-full">
                                                <Thermometer className="h-4 w-4 text-red-500" />
                                            </div>
                                            <span className="font-medium">Temperature</span>
                                        </div>
                                        <span className="font-semibold">{predictionResult.result.temperature}°C</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2 rounded-md hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-full">
                                                <Droplets className="h-4 w-4 text-blue-500" />
                                            </div>
                                            <span className="font-medium">Humidity</span>
                                        </div>
                                        <span className="font-semibold">{predictionResult.result.humidity}%</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2 rounded-md hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-1.5 rounded-full">
                                                <Cloud className="h-4 w-4 text-indigo-500" />
                                            </div>
                                            <span className="font-medium">Rainfall</span>
                                        </div>
                                        <span className="font-semibold">{predictionResult.result.rainfall}mm</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2 rounded-md hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-green-100 dark:bg-green-900/30 p-1.5 rounded-full">
                                                <Leaf className="h-4 w-4 text-green-500" />
                                            </div>
                                            <span className="font-medium">Best Season</span>
                                        </div>
                                        <span className="font-semibold">{bestSeason}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-violet-50 to-white dark:from-violet-950/30 dark:to-gray-900 h-full">
                            <CardHeader className="bg-violet-50/50 dark:bg-violet-950/20 border-b border-violet-100 dark:border-violet-900/30">
                                <CardTitle className="text-violet-800 dark:text-violet-300">Prediction Analysis</CardTitle>
                                <CardDescription>In-depth analysis of the prediction based on various factors.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 flex-grow">
                                <Tabs defaultValue="summary" className="w-full h-full">
                                    <TabsList className="grid w-full grid-cols-2 bg-violet-100/50 dark:bg-violet-900/20">
                                        <TabsTrigger
                                            value="summary"
                                            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
                                        >
                                            Summary
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="details"
                                            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
                                        >
                                            Details
                                        </TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="summary" className="mt-4">
                                        <div className="grid gap-4">
                                            <div className="flex items-center justify-between p-2 rounded-md hover:bg-violet-50/50 dark:hover:bg-violet-900/20 transition-colors">
                                                <div className="font-medium">Predicted Yield</div>
                                                <div className="font-bold text-emerald-600 dark:text-emerald-400">
                                                    <AnimatedCounter value={predictionResult.result.prediction} decimals={2} /> kg/ha
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between p-2 rounded-md hover:bg-violet-50/50 dark:hover:bg-violet-900/20 transition-colors">
                                                <div className="font-medium">Temperature Impact</div>
                                                <div className="font-bold text-red-500">
                                                    {predictionResult.result.temperature > 25 ? "High" : "Moderate"}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between p-2 rounded-md hover:bg-violet-50/50 dark:hover:bg-violet-900/20 transition-colors">
                                                <div className="font-medium">Humidity Impact</div>
                                                <div className="font-bold text-blue-500">
                                                    {predictionResult.result.humidity > 70 ? "High" : "Moderate"}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between p-2 rounded-md hover:bg-violet-50/50 dark:hover:bg-violet-900/20 transition-colors">
                                                <div className="font-medium">Rainfall Impact</div>
                                                <div className="font-bold text-indigo-500">
                                                    {predictionResult.result.rainfall > 100 ? "High" : "Moderate"}
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="details" className="mt-4">
                                        <div className="grid gap-4">
                                            <div className="p-2 rounded-md hover:bg-violet-50/50 dark:hover:bg-violet-900/20 transition-colors">
                                                <div className="text-sm font-medium text-red-600 dark:text-red-400">Temperature</div>
                                                <div className="text-sm text-muted-foreground">
                                                    The temperature during the growing season was {predictionResult.result.temperature}°C.
                                                </div>
                                            </div>
                                            <div className="p-2 rounded-md hover:bg-violet-50/50 dark:hover:bg-violet-900/20 transition-colors">
                                                <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Humidity</div>
                                                <div className="text-sm text-muted-foreground">
                                                    The humidity during the growing season was {predictionResult.result.humidity}%.
                                                </div>
                                            </div>
                                            <div className="p-2 rounded-md hover:bg-violet-50/50 dark:hover:bg-violet-900/20 transition-colors">
                                                <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Rainfall</div>
                                                <div className="text-sm text-muted-foreground">
                                                    The rainfall during the growing season was {predictionResult.result.rainfall}mm.
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-800/50 dark:to-amber-900/70 h-full overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-300/20 dark:bg-amber-500/10 rounded-full -mr-8 -mt-8 z-0"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-200/30 dark:bg-amber-600/10 rounded-full -ml-10 -mb-10 z-0"></div>
                            <CardHeader className="bg-gradient-to-r from-amber-100/80 to-amber-50/80 dark:from-amber-800/40 dark:to-amber-900/40 border-b-2 border-amber-200 dark:border-amber-700/50 relative z-10">
                                <CardTitle className="text-amber-800 dark:text-amber-300 text-xl md:text-2xl flex items-center">
                  <span className="bg-amber-200 dark:bg-amber-700 p-1.5 rounded-full mr-2">
                    <Mail className="h-5 w-5 text-amber-700 dark:text-amber-200" />
                  </span>
                                    Share Prediction
                                </CardTitle>
                                <CardDescription className="text-amber-700/80 dark:text-amber-400/80 font-medium">
                                    Share this prediction with others via email or download as PDF.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 flex-grow flex flex-col justify-between relative z-10">
                                <div className="grid gap-6">
                                    <div className="flex flex-col md:flex-row items-center gap-2">
                                        <Input
                                            type="email"
                                            placeholder="Enter recipient email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={isSending || isSent}
                                            className="border-2 border-amber-300 dark:border-amber-600 focus:ring-amber-500 focus:border-amber-400 bg-white/80 dark:bg-gray-800/50 shadow-inner"
                                        />
                                        <Button
                                            variant="outline"
                                            className="w-full md:w-auto border-2 border-amber-300 dark:border-amber-600 bg-white/80 dark:bg-gray-800/50 hover:bg-amber-100 dark:hover:bg-amber-800/50 text-amber-700 dark:text-amber-300 transition-all duration-300 hover:scale-105"
                                            onClick={handleSendPredictionEmail}
                                            disabled={isSending || isSent}
                                        >
                                            {isSending ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Sending...
                                                </>
                                            ) : isSent ? (
                                                <>
                                                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                                    Sent!
                                                </>
                                            ) : (
                                                <>
                                                    <Mail className="mr-2 h-4 w-4" />
                                                    Send Email
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    <Button
                                        onClick={downloadPdfReport}
                                        className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] font-medium text-lg py-6"
                                    >
                                        <Download className="mr-2 h-5 w-5" />
                                        Download PDF Report
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* First row of charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                            <CardHeader className="flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/30">
                                <CardTitle className="text-emerald-800 dark:text-emerald-300">Yearly Yield Variation</CardTitle>
                                <div className="flex items-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleFullscreenChart("yearly")}
                                        className="hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                                    >
                                        <Maximize2 className="mr-2 h-4 w-4" />
                                        Fullscreen
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 bg-white dark:bg-gray-900">
                                <ChartErrorBoundary>
                                    {yearlyYieldData && yearlyYieldData.length > 0 ? (
                                        <div className="p-4">
                                            <ResponsiveContainer width="100%" height={300}>
                                                <BarChart
                                                    data={yearlyYieldData}
                                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                                    barSize={40}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                    <XAxis dataKey="year" />
                                                    <YAxis domain={[0, maxYield]} />
                                                    <RechartsTooltip content={<CustomTooltip />} />
                                                    <Legend />
                                                    <Bar dataKey="yield" name={chartConfig.yield.label}>
                                                        {yearlyYieldData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <div className="flex h-[300px] items-center justify-center">
                                            <p className="text-muted-foreground">No yearly data available</p>
                                        </div>
                                    )}
                                </ChartErrorBoundary>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                            <CardHeader className="flex items-center justify-between bg-pink-50/50 dark:bg-pink-950/20 border-b border-pink-100 dark:border-pink-900/30">
                                <CardTitle className="text-pink-800 dark:text-pink-300">Seasonal Yield Distribution</CardTitle>
                                <div className="flex items-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleFullscreenChart("pie")}
                                        className="hover:bg-pink-100 dark:hover:bg-pink-900/50 transition-colors"
                                    >
                                        <Maximize2 className="mr-2 h-4 w-4" />
                                        Fullscreen
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 bg-white dark:bg-gray-900">
                                <ChartErrorBoundary>
                                    {seasonPieData && seasonPieData.length > 0 ? (
                                        <div className="p-4">
                                            <ResponsiveContainer width="100%" height={300}>
                                                <RechartsPieChart>
                                                    <Pie
                                                        dataKey="value"
                                                        isAnimationActive={true}
                                                        animationBegin={0}
                                                        animationDuration={1500}
                                                        data={seasonPieData}
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={100}
                                                        fill="#8884d8"
                                                        label={({ name, value }) => `${name}: ${value.toFixed(2)}`}
                                                    >
                                                        {seasonPieData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Legend />
                                                    <RechartsTooltip />
                                                </RechartsPieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <div className="flex h-[300px] items-center justify-center">
                                            <p className="text-muted-foreground">No seasonal data available</p>
                                        </div>
                                    )}
                                </ChartErrorBoundary>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Second row of charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                    >
                        <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                            <CardHeader className="flex items-center justify-between bg-red-50/50 dark:bg-red-950/20 border-b border-red-100 dark:border-red-900/30">
                                <CardTitle className="text-red-800 dark:text-red-300">Temperature vs Yield</CardTitle>
                                <div className="flex items-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleFullscreenChart("temperature")}
                                        className="hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                                    >
                                        <Maximize2 className="mr-2 h-4 w-4" />
                                        Fullscreen
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 bg-white dark:bg-gray-900">
                                <ChartErrorBoundary>
                                    {temperatureYieldData && temperatureYieldData.length > 0 ? (
                                        <div className="p-4">
                                            <ResponsiveContainer width="100%" height={300}>
                                                <BarChart data={temperatureYieldData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                    <XAxis dataKey="temperature" />
                                                    <YAxis domain={[0, maxYield]} />
                                                    <RechartsTooltip content={<CustomTooltip />} />
                                                    <Legend />
                                                    <Bar
                                                        dataKey="yield"
                                                        fill={chartConfig.temperature.color}
                                                        name={chartConfig.temperature.label}
                                                        radius={[4, 4, 0, 0]}
                                                    >
                                                        {temperatureYieldData.map((entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={`rgba(248, 113, 113, ${0.5 + (index / temperatureYieldData.length) * 0.5})`}
                                                            />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <div className="flex h-[300px] items-center justify-center">
                                            <p className="text-muted-foreground">No temperature data available</p>
                                        </div>
                                    )}
                                </ChartErrorBoundary>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                    >
                        <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                            <CardHeader className="flex items-center justify-between bg-purple-50/50 dark:bg-purple-950/20 border-b border-purple-100 dark:border-purple-900/30">
                                <CardTitle className="text-purple-800 dark:text-purple-300">Environmental Factors</CardTitle>
                                <div className="flex items-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleFullscreenChart("radar")}
                                        className="hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                                    >
                                        <Maximize2 className="mr-2 h-4 w-4" />
                                        Fullscreen
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 bg-white dark:bg-gray-900">
                                <ChartErrorBoundary>
                                    <div className="p-4">
                                        <ResponsiveContainer width="100%" height={300}>
                                            <RadarChart outerRadius={100} data={environmentalFactorsData}>
                                                <PolarGrid stroke="#e5e7eb" />
                                                <PolarAngleAxis dataKey="subject" />
                                                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                                <Radar
                                                    name="Value"
                                                    dataKey="value"
                                                    stroke="#4ade80"
                                                    fill="#4ade80"
                                                    fillOpacity={0.6}
                                                    animationBegin={0}
                                                    animationDuration={1500}
                                                />
                                                <RechartsTooltip content={<RadarTooltip />} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </ChartErrorBoundary>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Third row of charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                    >
                        <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                            <CardHeader className="flex items-center justify-between bg-violet-50/50 dark:bg-violet-950/20 border-b border-violet-100 dark:border-violet-900/30">
                                <CardTitle className="text-violet-800 dark:text-violet-300">Rainfall vs Yield</CardTitle>
                                <div className="flex items-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleFullscreenChart("rainfall")}
                                        className="hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors"
                                    >
                                        <Maximize2 className="mr-2 h-4 w-4" />
                                        Fullscreen
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 bg-white dark:bg-gray-900">
                                <ChartErrorBoundary>
                                    {rainfallYieldData && rainfallYieldData.length > 0 ? (
                                        // Fix the Rainfall vs Yield chart by replacing the Area chart with a Line chart
                                        <div className="p-4">
                                            <ResponsiveContainer width="100%" height={300}>
                                                <LineChart data={rainfallYieldData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                    <XAxis dataKey="rainfall" />
                                                    <YAxis domain={[0, maxYield]} />
                                                    <RechartsTooltip content={<CustomTooltip />} />
                                                    <Legend />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="yield"
                                                        stroke={chartConfig.rainfall.color}
                                                        strokeWidth={2}
                                                        dot={{ r: 4 }}
                                                        activeDot={{ r: 6, stroke: "white", strokeWidth: 2 }}
                                                        name={chartConfig.rainfall.label}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <div className="flex h-[300px] items-center justify-center">
                                            <p className="text-muted-foreground">No rainfall data available</p>
                                        </div>
                                    )}
                                </ChartErrorBoundary>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.9 }}
                    >
                        <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                            <CardHeader className="flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/30">
                                <CardTitle className="text-emerald-800 dark:text-emerald-300">Monthly Growth Trend</CardTitle>
                                <div className="flex items-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleFullscreenChart("growth")}
                                        className="hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                                    >
                                        <Maximize2 className="mr-2 h-4 w-4" />
                                        Fullscreen
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 bg-white dark:bg-gray-900">
                                <ChartErrorBoundary>
                                    <div className="p-4">
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart
                                                data={growthTrendData}
                                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                                barCategoryGap={2}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                <XAxis dataKey="month" />
                                                <YAxis domain={[0, Math.ceil(predictionResult.result.prediction * 1.2)]} />
                                                <RechartsTooltip content={<CustomTooltip />} />
                                                <Legend />
                                                <Bar
                                                    dataKey="growth"
                                                    fill={chartConfig.growth.color}
                                                    name={chartConfig.growth.label}
                                                    radius={[4, 4, 0, 0]}
                                                >
                                                    {growthTrendData.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={`rgba(52, 211, 153, ${0.4 + (index / growthTrendData.length) * 0.6})`}
                                                        />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </ChartErrorBoundary>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.1 }}
                    className="mt-4"
                >
                    <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/30 dark:to-gray-900 overflow-hidden">
                        <CardHeader className="bg-emerald-50/50 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/30">
                            <CardTitle className="text-emerald-800 dark:text-emerald-300">Support & Feedback</CardTitle>
                            <CardDescription>If you have any questions or feedback, please let us know.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid gap-4">
                                <div className="flex flex-col space-y-2">
                                    <label htmlFor="support" className="text-emerald-700 dark:text-emerald-300 font-medium">
                                        Message
                                    </label>
                                    <textarea
                                        className="w-full h-32 p-3 border border-emerald-200 dark:border-emerald-800 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none bg-white dark:bg-gray-800 transition-all duration-200"
                                        placeholder="Write your message to support here..."
                                        value={supportMessage}
                                        onChange={(e) => setSupportMessage(e.target.value)}
                                    />
                                </div>
                                <Button
                                    className="w-full justify-center bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                                    onClick={sendMessageToSupport}
                                >
                                    Send to Support
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
)
}

