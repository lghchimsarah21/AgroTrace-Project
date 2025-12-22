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
    TrendingUp,
    Calendar,
    BarChartIcon,
    Mail,
    CheckCircle2,
    Loader2,
    PieChartIcon,
    LineChartIcon,
    AreaChartIcon,
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
    Area,
    PieChart,
    Pie,
    Legend,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ScatterChart,
    Scatter,
    ZAxis,
    LineChart,
    Line,
    ComposedChart,
} from "recharts"
import api from "@/config/api"
import { motion, AnimatePresence } from "framer-motion"
// Import Sonner toast
import { toast } from "sonner"

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
    closeResultPage: () => void
}

export default function PredictionResults({ predictionResult, closeResultPage }: PredictionResultsProps) {
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
    const {
        yearYieldData,
        seasonYieldData,
        tempYieldData,
        humidYieldData,
        rainfallYieldData,
        factorsData,
        seasonPieData,
    } = useMemo(() => {
        // Format the year yield data for the chart
        const yearYieldData = Object.entries(predictionResult.result.year_yield)
            .map(([year, yield_value]) => ({
                year,
                yield: yield_value,
            }))
            .sort((a, b) => Number(a.year) - Number(b.year))

        // Format the season yield data for the chart
        const seasonYieldData = Object.entries(predictionResult.result.season_yield).map(([season, yield_value]) => ({
            season,
            yield: yield_value,
        }))

        // Format the temperature yield data for the chart
        const tempYieldData = Object.entries(predictionResult.result.temp_yield)
            .map(([temp, yield_value]) => ({
                temp: Number.parseFloat(temp as string).toFixed(1),
                yield: yield_value,
                tempValue: Number.parseFloat(temp as string),
            }))
            .sort((a, b) => a.tempValue - b.tempValue)

        // Format the humidity yield data for the chart
        const humidYieldData = Object.entries(predictionResult.result.humid_yield)
            .map(([humid, yield_value]) => ({
                humidity: Number(humid),
                yield: yield_value,
            }))
            .sort((a, b) => a.humidity - b.humidity)

        // Format the rainfall yield data for the chart
        const rainfallYieldData = Object.entries(predictionResult.result.rain_yield)
            .map(([rainfall, yield_value]) => ({
                rainfall: Number.parseFloat(rainfall as string).toFixed(1),
                yield: yield_value,
                rainfallValue: Number.parseFloat(rainfall as string),
            }))
            .sort((a, b) => a.rainfallValue - b.rainfallValue)

        // Create data for radar chart
        const factorsData = [
            {
                subject: "Temperature",
                value: (predictionResult.result.temperature / 40) * 100, // Normalize to 0-100 scale
                fullMark: 100,
            },
            {
                subject: "Humidity",
                value: predictionResult.result.humidity,
                fullMark: 100,
            },
            {
                subject: "Rainfall",
                value: Math.min((predictionResult.result.rainfall / 200) * 100, 100), // Normalize to 0-100 scale
                fullMark: 100,
            },
            {
                subject: "Yield",
                value: (predictionResult.result.prediction / 5000) * 100, // Normalize to 0-100 scale
                fullMark: 100,
            },
        ]

        // Create data for season pie chart
        const seasonPieData = seasonYieldData.map((item) => ({
            name: item.season,
            value: item.yield,
        }))

        return {
            yearYieldData,
            seasonYieldData,
            tempYieldData,
            humidYieldData,
            rainfallYieldData,
            factorsData,
            seasonPieData,
        }
    }, [predictionResult])

    // Chart configuration for shadcn/ui ChartContainer
    const chartConfig = {
        yield: {
            label: "Yield (kg/ha)",
            color: "hsl(var(--chart-1))",
        },
        temperature: {
            label: "Temperature Effect",
            color: "hsl(var(--chart-2))",
        },
        rainfall: {
            label: "Rainfall Effect",
            color: "hsl(var(--chart-4))",
        },
        season: {
            label: "Season Effect",
            color: "hsl(var(--chart-5))",
        },
    }

    // Get max yield value for consistent Y-axis scaling
    const maxYield = useMemo(() => {
        const allYields = [
            ...yearYieldData.map((d) => d.yield),
            ...seasonYieldData.map((d) => d.yield),
            ...tempYieldData.map((d) => d.yield),
            ...rainfallYieldData.map((d) => d.yield),
            ...humidYieldData.map((d) => d.yield),
        ]
        return Math.ceil(Math.max(...allYields) * 1.1) // Add 10% padding
    }, [yearYieldData, seasonYieldData, tempYieldData, rainfallYieldData, humidYieldData])

    // Custom tooltip component for better design
    const CustomTooltip = ({ active, payload, label, prefix = "", suffix = "" }: any) => {
        if (active && payload && payload.length) {
            return (
                <ChartTooltip>
                    <ChartTooltipContent className="bg-white/95 dark:bg-gray-800/95 shadow-lg border border-gray-100 dark:border-gray-700">
                        <div className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">
                            {prefix}
                            {label}
                            {suffix}
                        </div>
                        <div className="flex items-center text-sm">
                            <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-1))] mr-2" />
                            <span className="font-medium">Yield: {payload[0].value.toLocaleString()} kg/ha</span>
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
                    <p className="font-medium text-sm">{`${payload[0].name}: ${payload[0].value.toLocaleString()} kg/ha`}</p>
                </div>
            )
        }
        return null
    }

    // Custom tooltip for radar chart
    const RadarTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 dark:bg-gray-800/95 shadow-lg border border-gray-100 dark:border-gray-700 p-2 rounded-md">
                    <p className="font-medium text-sm">{`${payload[0].payload.subject}: ${payload[0].value.toFixed(1)}`}</p>
                </div>
            )
        }
        return null
    }

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

    // COLORS
    const COLORS = [
        "hsl(var(--chart-1))",
        "hsl(var(--chart-2))",
        "hsl(var(--chart-3))",
        "hsl(var(--chart-4))",
        "hsl(var(--chart-5))",
    ]

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
                Back to Predictions
            </Button>

            <div className="grid gap-8">
                {/* Main Prediction Result Card */}
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
                                <div className="text-center md:text-left mb-6 md:mb-0">
                                    <h3 className="text-lg font-medium text-[hsl(var(--chart-1))] dark:text-[hsl(var(--chart-1))] mb-1">
                                        Predicted Yield
                                    </h3>
                                    <div className="flex items-center justify-center md:justify-start">
                                        <TrendingUp className="h-8 w-8 text-[hsl(var(--chart-1))] mr-3" />
                                        <motion.span
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{
                                                duration: 0.8,
                                                delay: 0.3,
                                                type: "spring",
                                                stiffness: 100,
                                            }}
                                            className="text-6xl font-bold text-[hsl(var(--chart-1))] dark:text-[hsl(var(--chart-1))]"
                                        >
                                            {predictionResult.result.prediction.toLocaleString()}
                                        </motion.span>
                                        <span className="ml-2 text-xl text-[hsl(var(--chart-1))/70] dark:text-[hsl(var(--chart-1))/70]">
                      kg/ha
                    </span>
                                    </div>
                                    <p className="text-sm text-[hsl(var(--chart-1))/70] dark:text-[hsl(var(--chart-1))/70] mt-2">
                                        Based on your selected parameters
                                    </p>
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
                                        <span className="font-semibold text-lg">{predictionResult.result.temperature}°C</span>
                                    </motion.div>

                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 0.5, delay: 0.5 }}
                                        className="flex flex-col items-center p-4 bg-white/90 dark:bg-gray-800/60 rounded-lg shadow-md backdrop-blur-sm transition-all hover:shadow-lg hover:scale-105"
                                    >
                                        <Droplets className="h-6 w-6 text-[hsl(var(--chart-4))] mb-2" />
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Humidity</span>
                                        <span className="font-semibold text-lg">{predictionResult.result.humidity}%</span>
                                    </motion.div>

                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 0.5, delay: 0.6 }}
                                        className="flex flex-col items-center p-4 bg-white/90 dark:bg-gray-800/60 rounded-lg shadow-md backdrop-blur-sm transition-all hover:shadow-lg hover:scale-105"
                                    >
                                        <Cloud className="h-6 w-6 text-[hsl(var(--chart-3))] mb-2" />
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Rainfall</span>
                                        <span className="font-semibold text-lg">{predictionResult.result.rainfall.toFixed(1)} mm</span>
                                    </motion.div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Email Subscription Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card className="border-0 shadow-lg overflow-hidden bg-white dark:bg-gray-900">
                        <CardContent className="pt-6 pb-6">
                            <div className="flex flex-col md:flex-row items-center gap-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-medium mb-2 flex items-center">
                                        <Mail className="h-5 w-5 mr-2 text-[hsl(var(--chart-3))]" />
                                        Get Prediction Report
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Receive a detailed report of this prediction in your inbox
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
                                        onClick={handleSendPredictionEmail}
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
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid grid-cols-5 mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1 rounded-lg">
                            <TabsTrigger
                                value="overview"
                                className="data-[state=active]:bg-[hsl(var(--chart-1))/10] data-[state=active]:text-[hsl(var(--chart-1))] dark:data-[state=active]:bg-[hsl(var(--chart-1))/20] dark:data-[state=active]:text-[hsl(var(--chart-1))]"
                            >
                                <BarChartIcon className="h-4 w-4 mr-2" />
                                Overview
                            </TabsTrigger>
                            <TabsTrigger
                                value="year"
                                className="data-[state=active]:bg-[hsl(var(--chart-1))/10] data-[state=active]:text-[hsl(var(--chart-1))] dark:data-[state=active]:bg-[hsl(var(--chart-1))/20] dark:data-[state=active]:text-[hsl(var(--chart-1))]"
                            >
                                <LineChartIcon className="h-4 w-4 mr-2" />
                                Year
                            </TabsTrigger>
                            <TabsTrigger
                                value="season"
                                className="data-[state=active]:bg-[hsl(var(--chart-1))/10] data-[state=active]:text-[hsl(var(--chart-1))] dark:data-[state=active]:bg-[hsl(var(--chart-1))/20] dark:data-[state=active]:text-[hsl(var(--chart-1))]"
                            >
                                <PieChartIcon className="h-4 w-4 mr-2" />
                                Season
                            </TabsTrigger>
                            <TabsTrigger
                                value="temperature"
                                className="data-[state=active]:bg-[hsl(var(--chart-1))/10] data-[state=active]:text-[hsl(var(--chart-1))] dark:data-[state=active]:bg-[hsl(var(--chart-1))/20] dark:data-[state=active]:text-[hsl(var(--chart-1))]"
                            >
                                <Thermometer className="h-4 w-4 mr-2" />
                                Temperature
                            </TabsTrigger>
                            <TabsTrigger
                                value="rainfall"
                                className="data-[state=active]:bg-[hsl(var(--chart-1))/10] data-[state=active]:text-[hsl(var(--chart-1))] dark:data-[state=active]:bg-[hsl(var(--chart-1))/20] dark:data-[state=active]:text-[hsl(var(--chart-1))]"
                            >
                                <AreaChartIcon className="h-4 w-4 mr-2" />
                                Rainfall
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
                                                <CardDescription>Overview of all factors affecting yield</CardDescription>
                                            </CardHeader>
                                            <CardContent className="pt-4 pb-6 bg-white dark:bg-gray-900">
                                                <div className="h-[350px]">
                                                    <ChartContainer config={chartConfig}>
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <RadarChart outerRadius={90} data={factorsData}>
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

                                        {/* Season Pie Chart */}
                                        <Card className="border-0 shadow-lg overflow-hidden">
                                            <CardHeader className="bg-white dark:bg-gray-900 pb-2">
                                                <div className="flex items-center">
                                                    <Calendar className="h-5 w-5 text-[hsl(var(--chart-5))] mr-2" />
                                                    <CardTitle>Season Distribution</CardTitle>
                                                </div>
                                                <CardDescription>Yield distribution across seasons</CardDescription>
                                            </CardHeader>
                                            <CardContent className="pt-4 pb-6 bg-white dark:bg-gray-900">
                                                <div className="h-[350px]">
                                                    <ChartContainer config={chartConfig}>
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <PieChart>
                                                                <Pie
                                                                    data={seasonPieData}
                                                                    cx="50%"
                                                                    cy="50%"
                                                                    labelLine={false}
                                                                    outerRadius={80}
                                                                    fill="#8884d8"
                                                                    dataKey="value"
                                                                    animationDuration={1500}
                                                                    animationBegin={300}
                                                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                                >
                                                                    {seasonPieData.map((entry, index) => (
                                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                    ))}
                                                                </Pie>
                                                                <Tooltip content={PieTooltip} />
                                                                <Legend />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                    </ChartContainer>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Year Trend Chart */}
                                    <Card className="border-0 shadow-lg overflow-hidden">
                                        <CardHeader className="bg-white dark:bg-gray-900 pb-2">
                                            <div className="flex items-center">
                                                <BarChartIcon className="h-5 w-5 text-[hsl(var(--chart-1))] mr-2" />
                                                <CardTitle>Yearly Yield Trend</CardTitle>
                                            </div>
                                            <CardDescription>Predicted yield across different years</CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-4 pb-6 bg-white dark:bg-gray-900">
                                            <div className="h-full">
                                                <ChartContainer config={chartConfig}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <ComposedChart data={yearYieldData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                                                            <defs>
                                                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={1} />
                                                                    <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                                                                </linearGradient>
                                                                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
                                                                    <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                                                                </linearGradient>
                                                            </defs>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                                            <XAxis
                                                                dataKey="year"
                                                                axisLine={false}
                                                                tickLine={false}
                                                                tick={{ fill: "#6b7280", fontSize: 12 }}
                                                                dy={10}
                                                            />
                                                            <YAxis
                                                                axisLine={false}
                                                                tickLine={false}
                                                                tick={{ fill: "#6b7280", fontSize: 12 }}
                                                                domain={[0, maxYield]}
                                                                dx={-10}
                                                            />
                                                            <Tooltip
                                                                content={(props) => <CustomTooltip {...props} prefix="Year: " />}
                                                                cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                                                            />
                                                            <Area
                                                                type="monotone"
                                                                dataKey="yield"
                                                                fill="url(#areaGradient)"
                                                                stroke="none"
                                                                animationDuration={1500}
                                                                animationBegin={300}
                                                            />
                                                            <Bar
                                                                dataKey="yield"
                                                                fill="url(#barGradient)"
                                                                radius={[4, 4, 0, 0]}
                                                                maxBarSize={60}
                                                                animationDuration={1500}
                                                                animationBegin={300}
                                                            />
                                                            <Line
                                                                type="monotone"
                                                                dataKey="yield"
                                                                stroke="hsl(var(--chart-3))"
                                                                strokeWidth={2}
                                                                dot={{ fill: "hsl(var(--chart-3))", r: 4 }}
                                                                activeDot={{ r: 6, fill: "hsl(var(--chart-3))" }}
                                                                animationDuration={2000}
                                                                animationBegin={600}
                                                            />
                                                        </ComposedChart>
                                                    </ResponsiveContainer>
                                                </ChartContainer>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="year" className="mt-2">
                                    <Card className="border-0 shadow-lg overflow-hidden">
                                        <CardHeader className="bg-white dark:bg-gray-900">
                                            <div className="flex items-center">
                                                <LineChartIcon className="h-5 w-5 text-[hsl(var(--chart-1))] mr-2" />
                                                <CardTitle>Yearly Yield Analysis</CardTitle>
                                            </div>
                                            <CardDescription>Detailed view of yield predictions across years</CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-4 pb-6 bg-white dark:bg-gray-900">
                                            <div className="h-[500px]">
                                                <ChartContainer config={chartConfig}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <LineChart data={yearYieldData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                                                            <defs>
                                                                <linearGradient id="yearGradient" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
                                                                    <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                                                                </linearGradient>
                                                            </defs>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                                            <XAxis
                                                                dataKey="year"
                                                                axisLine={false}
                                                                tickLine={false}
                                                                tick={{ fill: "#6b7280", fontSize: 12 }}
                                                                dy={10}
                                                                label={{
                                                                    value: "Year",
                                                                    position: "insideBottom",
                                                                    offset: -15,
                                                                    fill: "#6b7280",
                                                                    fontSize: 12,
                                                                }}
                                                            />
                                                            <YAxis
                                                                axisLine={false}
                                                                tickLine={false}
                                                                tick={{ fill: "#6b7280", fontSize: 12 }}
                                                                domain={[0, maxYield]}
                                                                dx={-10}
                                                                label={{
                                                                    value: "Yield (kg/ha)",
                                                                    angle: -90,
                                                                    position: "insideLeft",
                                                                    fill: "#6b7280",
                                                                    fontSize: 12,
                                                                    dx: -30,
                                                                }}
                                                            />
                                                            <Tooltip
                                                                content={(props) => <CustomTooltip {...props} prefix="Year: " />}
                                                                cursor={{ stroke: "hsl(var(--chart-1))", strokeWidth: 1, strokeDasharray: "5 5" }}
                                                            />
                                                            <Area
                                                                type="monotone"
                                                                dataKey="yield"
                                                                stroke="none"
                                                                fill="url(#yearGradient)"
                                                                animationDuration={1500}
                                                            />
                                                            <Line
                                                                type="monotone"
                                                                dataKey="yield"
                                                                stroke="hsl(var(--chart-1))"
                                                                strokeWidth={3}
                                                                dot={{ fill: "white", stroke: "hsl(var(--chart-1))", strokeWidth: 2, r: 5 }}
                                                                activeDot={{ r: 8, fill: "hsl(var(--chart-1))" }}
                                                                animationDuration={1500}
                                                            />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                </ChartContainer>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="season" className="mt-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Card className="border-0 shadow-lg overflow-hidden">
                                            <CardHeader className="bg-white dark:bg-gray-900">
                                                <div className="flex items-center">
                                                    <PieChartIcon className="h-5 w-5 text-[hsl(var(--chart-5))] mr-2" />
                                                    <CardTitle>Seasonal Yield Distribution</CardTitle>
                                                </div>
                                                <CardDescription>Yield distribution across different seasons</CardDescription>
                                            </CardHeader>
                                            <CardContent className="pt-4 pb-6 bg-white dark:bg-gray-900">
                                                <div className="h-[400px]">
                                                    <ChartContainer config={chartConfig}>
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <PieChart>
                                                                <Pie
                                                                    data={seasonPieData}
                                                                    cx="50%"
                                                                    cy="50%"
                                                                    innerRadius={60}
                                                                    outerRadius={100}
                                                                    fill="#8884d8"
                                                                    paddingAngle={5}
                                                                    dataKey="value"
                                                                    animationDuration={1500}
                                                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                                    labelLine={true}
                                                                >
                                                                    {seasonPieData.map((entry, index) => (
                                                                        <Cell
                                                                            key={`cell-${index}`}
                                                                            fill={COLORS[index % COLORS.length]}
                                                                            stroke="white"
                                                                            strokeWidth={2}
                                                                        />
                                                                    ))}
                                                                </Pie>
                                                                <Tooltip content={PieTooltip} />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                    </ChartContainer>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-0 shadow-lg overflow-hidden">
                                            <CardHeader className="bg-white dark:bg-gray-900">
                                                <div className="flex items-center">
                                                    <Calendar className="h-5 w-5 text-[hsl(var(--chart-5))] mr-2" />
                                                    <CardTitle>Seasonal Yield Comparison</CardTitle>
                                                </div>
                                                <CardDescription>How different seasons affect crop yield</CardDescription>
                                            </CardHeader>
                                            <CardContent className="pt-4 pb-6 bg-white dark:bg-gray-900">
                                                <div className="h-[400px]">
                                                    <ChartContainer config={chartConfig}>
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <BarChart
                                                                data={seasonYieldData}
                                                                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                                                                barGap={8}
                                                            >
                                                                <defs>
                                                                    {seasonYieldData.map((entry, index) => (
                                                                        <linearGradient
                                                                            key={`gradient-${index}`}
                                                                            id={`seasonGradient-${index}`}
                                                                            x1="0"
                                                                            y1="0"
                                                                            x2="0"
                                                                            y2="1"
                                                                        >
                                                                            <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={1} />
                                                                            <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.8} />
                                                                        </linearGradient>
                                                                    ))}
                                                                </defs>
                                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                                                <XAxis
                                                                    dataKey="season"
                                                                    axisLine={false}
                                                                    tickLine={false}
                                                                    tick={{ fill: "#6b7280", fontSize: 12 }}
                                                                    dy={10}
                                                                />
                                                                <YAxis
                                                                    axisLine={false}
                                                                    tickLine={false}
                                                                    tick={{ fill: "#6b7280", fontSize: 12 }}
                                                                    domain={[0, maxYield]}
                                                                    dx={-10}
                                                                    label={{
                                                                        value: "Yield (kg/ha)",
                                                                        angle: -90,
                                                                        position: "insideLeft",
                                                                        fill: "#6b7280",
                                                                        fontSize: 12,
                                                                        dx: -30,
                                                                    }}
                                                                />
                                                                <Tooltip
                                                                    content={(props) => <CustomTooltip {...props} prefix="Season: " />}
                                                                    cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                                                                />
                                                                <Bar dataKey="yield" radius={[4, 4, 0, 0]} maxBarSize={100} animationDuration={1500}>
                                                                    {seasonYieldData.map((entry, index) => (
                                                                        <Cell key={`cell-${index}`} fill={`url(#seasonGradient-${index})`} />
                                                                    ))}
                                                                </Bar>
                                                            </BarChart>
                                                        </ResponsiveContainer>
                                                    </ChartContainer>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                <TabsContent value="temperature" className="mt-2">
                                    <Card className="border-0 shadow-lg overflow-hidden">
                                        <CardHeader className="bg-white dark:bg-gray-900">
                                            <div className="flex items-center">
                                                <Thermometer className="h-5 w-5 text-[hsl(var(--chart-2))] mr-2" />
                                                <CardTitle>Temperature Impact on Yield</CardTitle>
                                            </div>
                                            <CardDescription>How temperature variations affect crop production</CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-4 pb-6 bg-white dark:bg-gray-900">
                                            <div className="h-[500px]">
                                                <ChartContainer config={chartConfig}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                            <XAxis
                                                                dataKey="tempValue"
                                                                name="Temperature"
                                                                axisLine={false}
                                                                tickLine={false}
                                                                tick={{ fill: "#6b7280", fontSize: 12 }}
                                                                label={{
                                                                    value: "Temperature (°C)",
                                                                    position: "insideBottom",
                                                                    offset: -15,
                                                                    fill: "#6b7280",
                                                                    fontSize: 12,
                                                                }}
                                                                type="number"
                                                                domain={["dataMin - 1", "dataMax + 1"]}
                                                            />
                                                            <YAxis
                                                                dataKey="yield"
                                                                name="Yield"
                                                                axisLine={false}
                                                                tickLine={false}
                                                                tick={{ fill: "#6b7280", fontSize: 12 }}
                                                                domain={[0, maxYield]}
                                                                label={{
                                                                    value: "Yield (kg/ha)",
                                                                    angle: -90,
                                                                    position: "insideLeft",
                                                                    fill: "#6b7280",
                                                                    fontSize: 12,
                                                                    dx: -30,
                                                                }}
                                                            />
                                                            <ZAxis range={[60, 400]} />
                                                            <Tooltip
                                                                cursor={{ strokeDasharray: "3 3" }}
                                                                content={({ active, payload }) => {
                                                                    if (active && payload && payload.length) {
                                                                        return (
                                                                            <div className="bg-white/95 dark:bg-gray-800/95 shadow-lg border border-gray-100 dark:border-gray-700 p-3 rounded-md">
                                                                                <p className="font-medium text-sm">{`Temperature: ${payload[0].payload.temp}°C`}</p>
                                                                                <p className="font-medium text-sm">{`Yield: ${payload[0].payload.yield.toLocaleString()} kg/ha`}</p>
                                                                            </div>
                                                                        )
                                                                    }
                                                                    return null
                                                                }}
                                                            />
                                                            <Scatter
                                                                name="Temperature vs Yield"
                                                                data={tempYieldData}
                                                                fill="hsl(var(--chart-2))"
                                                                line={{ stroke: "hsl(var(--chart-2))", strokeWidth: 2 }}
                                                                lineType="fitting"
                                                                shape={(props) => {
                                                                    const { cx, cy } = props
                                                                    return (
                                                                        <circle
                                                                            cx={cx}
                                                                            cy={cy}
                                                                            r={8}
                                                                            fill="hsl(var(--chart-2))"
                                                                            stroke="white"
                                                                            strokeWidth={2}
                                                                            style={{ opacity: 0.8 }}
                                                                        />
                                                                    )
                                                                }}
                                                                animationDuration={1500}
                                                            />
                                                        </ScatterChart>
                                                    </ResponsiveContainer>
                                                </ChartContainer>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="rainfall" className="mt-2">
                                    <Card className="border-0 shadow-lg overflow-hidden">
                                        <CardHeader className="bg-white dark:bg-gray-900">
                                            <div className="flex items-center">
                                                <Cloud className="h-5 w-5 text-[hsl(var(--chart-4))] mr-2" />
                                                <CardTitle>Rainfall Effect on Yield</CardTitle>
                                            </div>
                                            <CardDescription>How precipitation levels influence crop production</CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-4 pb-6 bg-white dark:bg-gray-900">
                                            <div className="h-[500px]">
                                                <ChartContainer config={chartConfig}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <ComposedChart
                                                            data={rainfallYieldData}
                                                            margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                                                        >
                                                            <defs>
                                                                <linearGradient id="rainfallGradient" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="0%" stopColor="hsl(var(--chart-4))" stopOpacity={0.4} />
                                                                    <stop offset="100%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
                                                                </linearGradient>
                                                            </defs>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                                            <XAxis
                                                                dataKey="rainfall"
                                                                axisLine={false}
                                                                tickLine={false}
                                                                tick={{ fill: "#6b7280", fontSize: 12 }}
                                                                dy={10}
                                                                label={{
                                                                    value: "Rainfall (mm)",
                                                                    position: "insideBottom",
                                                                    offset: -15,
                                                                    fill: "#6b7280",
                                                                    fontSize: 12,
                                                                }}
                                                            />
                                                            <YAxis
                                                                axisLine={false}
                                                                tickLine={false}
                                                                tick={{ fill: "#6b7280", fontSize: 12 }}
                                                                domain={[0, maxYield]}
                                                                dx={-10}
                                                                label={{
                                                                    value: "Yield (kg/ha)",
                                                                    angle: -90,
                                                                    position: "insideLeft",
                                                                    fill: "#6b7280",
                                                                    fontSize: 12,
                                                                    dx: -30,
                                                                }}
                                                            />
                                                            <Tooltip
                                                                content={(props) => <CustomTooltip {...props} suffix=" mm" />}
                                                                cursor={{ stroke: "hsl(var(--chart-4))", strokeWidth: 1, strokeDasharray: "5 5" }}
                                                            />
                                                            <Area
                                                                type="monotone"
                                                                dataKey="yield"
                                                                stroke="hsl(var(--chart-4))"
                                                                strokeWidth={3}
                                                                fill="url(#rainfallGradient)"
                                                                activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
                                                                animationDuration={1500}
                                                            />
                                                            <Line
                                                                type="monotone"
                                                                dataKey="yield"
                                                                stroke="hsl(var(--chart-4))"
                                                                strokeWidth={3}
                                                                dot={{ fill: "white", stroke: "hsl(var(--chart-4))", strokeWidth: 2, r: 5 }}
                                                                activeDot={{ r: 8, fill: "hsl(var(--chart-4))" }}
                                                                animationDuration={2000}
                                                                animationBegin={300}
                                                            />
                                                        </ComposedChart>
                                                    </ResponsiveContainer>
                                                </ChartContainer>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </motion.div>
                        </AnimatePresence>
                    </Tabs>
                </motion.div>
            </div>
        </motion.div>
    )
}

