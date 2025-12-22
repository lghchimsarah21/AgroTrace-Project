"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
    Leaf,
    BarChart3,
    LineChart,
    PieChart,
    Braces,
    Wheat,
    FlaskRoundIcon,
    Gauge,
    Droplets,
    ChevronRight,
    Calendar,
    Sparkles,
    TrendingUp,
    LayoutDashboard,
    Plus,
    Zap,
    X,
    ChevronDown,
    ChevronLeft,
} from "lucide-react"
import { SidebarProvider } from "@/components/ui/sidebar"
import Predictions from "@/pages/Predictions"
import Recommendations from "@/pages/Recommendations"
import ChartPage from "@/pages/chart-page"
import { BarChartComponent } from "@/pages/bar-chart"
import { WeatherTrendsChart } from "@/pages/weather-trends-chart"
import { YieldBubbleChart } from "@/pages/yield-bubble-chart"
import { YieldComparisonChart } from "@/pages/yield-comparison-chart"
import { NutrientDistributionChart } from "@/pages/nutrient-distribution-chart"
import { SoilPHChart } from "@/pages/soil-ph-chart"
import { CropRecommendationChart } from "@/pages/crop-recommendation-chart"
import { SeasonalAnalysisChart } from "@/pages/seasonal-analysis-chart"
import { NutrientBalanceChart } from "@/pages/nutrient-balance-chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { motion } from "framer-motion"
import "../Styles/chart-styles.css"
import api from "@/config/api"
import PagesNavbar from "@/pages/pagesNavbar.tsx"

export interface Prediction {
    date: number
    humidity: number
    temperature: number
    rainfall: number
    area: number
    crop: string
    city: string
    result: number
    id: number
}

export interface Recommendation {
    date: number
    ph: number
    pottasium: number
    phosphorous: number
    nitrogen: number
    result: string
    humidity: number
    temperature: number
    rainfall: number
    season: string
    city: string
    id: number
}

// Simple Select component
interface SimpleSelectProps {
    options: { value: string; label: string }[]
    defaultLabel: string
    onChange: (value: string) => void
    className?: string
}

const SimpleSelect: React.FC<SimpleSelectProps> = ({ options, defaultLabel, onChange, className = "" }) => {
    return (
        <div className={`simple-select-wrapper ${className}`}>
            <select
                className="simple-select"
                onChange={(e) => {
                    onChange(e.target.value)
                    e.target.value = ""
                }}
                defaultValue=""
            >
                <option value="" disabled>
                    {defaultLabel}
                </option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <div className="select-arrow">
                <ChevronDown className="h-4 w-4" />
            </div>
        </div>
    )
}

// Pagination component
interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        if (totalPages <= 5) return i + 1
        if (currentPage <= 3) return i + 1
        if (currentPage >= totalPages - 2) return totalPages - 4 + i
        return currentPage - 2 + i
    })

    return (
        <div className="flex items-center justify-between px-2 py-4">
            <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-md"
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Previous Page</span>
                </Button>

                {pageNumbers.map((page) => (
                    <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="icon"
                        className={`h-8 w-8 rounded-md ${currentPage === page ? "bg-primary text-primary-foreground" : ""}`}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </Button>
                ))}

                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-md"
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Next Page</span>
                </Button>
            </div>
        </div>
    )
}

export default function ProfileRecommendations() {
    const [predictionData, setPredictionData] = useState<Prediction[]>([])
    const [recommendationData, setRecommendationData] = useState<Recommendation[]>([])
    const [isRecommendationMode, setIsRecommendationMode] = useState<boolean>(false)
    const [chartData, setChartData] = useState<Prediction[]>([])
    const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false)
    const [currentDate, setCurrentDate] = useState<string>("")
    const [activeTab, setActiveTab] = useState<string>(isRecommendationMode ? "nutrients" : "charts")
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [itemsPerPage, setItemsPerPage] = useState<number>(15)
    const [showInsights, setShowInsights] = useState<boolean>(true)
    const [navbarTransparent, setNavbarTransparent] = useState<boolean>(false)

    // Handle scroll event to make navbar transparent
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY
            if (scrollPosition > 50) {
                setNavbarTransparent(true)
            } else {
                setNavbarTransparent(false)
            }
        }

        window.addEventListener("scroll", handleScroll)
        return () => {
            window.removeEventListener("scroll", handleScroll)
        }
    }, [])

    // Update chart data whenever the data source or mode changes
    useEffect(() => {
        if (isRecommendationMode) {
            setChartData(recommendationData as unknown as Prediction[])
            setActiveTab("nutrients")
        } else {
            setChartData(predictionData)
            setActiveTab("charts")
        }
    }, [isRecommendationMode, predictionData, recommendationData])

    // Format current date
    useEffect(() => {
        const now = new Date()
        const options: Intl.DateTimeFormatOptions = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        }
        setCurrentDate(now.toLocaleDateString("en-US", options))
    }, [])

    const fetchPredictions = async () => {
        try {
            const response = await api.get("/api/predictions/my-predictions", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("jwt")}`,
                },
            })
            setPredictionData(response.data)
        } catch (error) {
            console.error("error fetching predictions", error)
        }
    }

    const fetchRecommendations = async () => {
        try {
            const response = await api.get("/api/recommendations/my-recommendations", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("jwt")}`,
                },
            })
            setRecommendationData(response.data)
        } catch (error) {
            console.error("error fetching recommendations", error)
        }
    }

    useEffect(() => {
        fetchPredictions()
        fetchRecommendations()
    }, [])

    // Get summary stats
    const getSummaryStats = () => {
        if (isRecommendationMode) {
            const uniqueCrops = new Set(recommendationData.map((r) => r.result)).size
            const uniqueCities = new Set(recommendationData.map((r) => r.city)).size
            const uniqueSeasons = new Set(recommendationData.map((r) => r.season)).size

            return [
                {
                    label: "Recommendations",
                    value: recommendationData.length,
                    icon: FlaskRoundIcon,
                    color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
                    trend: "+12% from last month",
                },
                {
                    label: "Unique Crops",
                    value: uniqueCrops,
                    icon: Wheat,
                    color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
                    trend: "2 new varieties",
                },
                {
                    label: "Locations",
                    value: uniqueCities,
                    icon: Droplets,
                    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
                    trend: "3 regions covered",
                },
                {
                    label: "Seasons",
                    value: uniqueSeasons,
                    icon: Calendar,
                    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
                    trend: "All seasons analyzed",
                },
            ]
        } else {
            const uniqueCrops = new Set(predictionData.map((p) => p.crop)).size
            const uniqueCities = new Set(predictionData.map((p) => p.city)).size
            const totalArea = predictionData.reduce((sum, p) => sum + p.area, 0)
            const avgYield =
                predictionData.length > 0 ? predictionData.reduce((sum, p) => sum + p.result, 0) / predictionData.length : 0

            return [
                {
                    label: "Predictions",
                    value: predictionData.length,
                    icon: BarChart3,
                    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
                    trend: "+8% from last month",
                },
                {
                    label: "Unique Crops",
                    value: uniqueCrops,
                    icon: Wheat,
                    color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
                    trend: "Diverse portfolio",
                },
                {
                    label: "Locations",
                    value: uniqueCities,
                    icon: Droplets,
                    color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
                    trend: "Regional coverage",
                },
                {
                    label: "Avg. Yield",
                    value: avgYield.toFixed(1),
                    icon: TrendingUp,
                    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
                    trend: "↑ 5.2% increase",
                },
            ]
        }
    }

    const summaryStats = getSummaryStats()

    // Calculate total pages for pagination
    const totalPages = Math.ceil(
        (isRecommendationMode ? recommendationData.length : predictionData.length) / itemsPerPage,
    )

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    // Get AI insights based on the data
    const getAIInsights = () => {
        if (isRecommendationMode && recommendationData.length > 0) {
            return [
                "Nitrogen levels are optimal for rice cultivation in most soil samples",
                "Consider crop rotation to improve soil health in regions with low pH",
                "Seasonal analysis shows better crop diversity potential in Kharif season",
            ]
        } else if (!isRecommendationMode && predictionData.length > 0) {
            return [
                "Temperature has the strongest correlation with yield across all crops",
                "Wheat shows 15% higher yield potential in northern regions",
                "Increasing humidity by 5% could improve yields for selected crops",
            ]
        }
        return []
    }

    const aiInsights = getAIInsights()

    // Animation variants for Framer Motion
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
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 },
        },
    }

    // Handle export action
    const handleExport = (format: string) => {
        console.log(`Exporting as ${format}`)
        // Implement export functionality here
    }

    // Handle share action
    const handleShare = (method: string) => {
        console.log(`Sharing via ${method}`)
        // Implement share functionality here
    }

    // Handle view action
    const handleView = (view: string) => {
        console.log(`Viewing ${view}`)
        // Implement view functionality here
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen bg-background w-full">
                <div className="flex-1 flex flex-col w-full">
                    <div
                        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
                            navbarTransparent
                                ? "bg-transparent border-transparent"
                                : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b"
                        }`}
                    >
                        <PagesNavbar />
                    </div>

                    {/* Hero Section */}
                    <div className="relative bg-gradient-to-br from-primary/15 via-primary/5 to-transparent">
                        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                            >
                                <div>
                                    <Badge variant="outline" className="mb-2 bg-primary/10 text-primary border-primary/20">
                                        {isRecommendationMode ? "Recommendations" : "Predictions"}
                                    </Badge>
                                    <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
                                        {isRecommendationMode ? (
                                            <>
                                                <Leaf className="h-8 w-8 text-primary" />
                                                Crop Recommendations
                                            </>
                                        ) : (
                                            <>
                                                <BarChart3 className="h-8 w-8 text-primary" />
                                                Crop Predictions
                                            </>
                                        )}
                                    </h1>
                                    <p className="text-muted-foreground mt-2 max-w-xl">
                                        {isRecommendationMode
                                            ? "Analyze soil conditions and get personalized crop recommendations for optimal farming results."
                                            : "Track and analyze crop yield predictions based on environmental factors and historical data."}
                                    </p>
                                </div>

                                {/* Mode Switcher */}
                                <div className="flex items-center">
                                    <div className="bg-background/80 backdrop-blur-sm rounded-lg border shadow-sm">
                                        <div className="flex items-center">
                                            <Button
                                                variant={!isRecommendationMode ? "default" : "ghost"}
                                                className={`rounded-r-none px-4 py-2 h-10 ${!isRecommendationMode ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"}`}
                                                onClick={() => setIsRecommendationMode(false)}
                                            >
                                                <BarChart3 className="h-4 w-4 mr-2" />
                                                Predictions
                                            </Button>
                                            <div className="h-6 w-px bg-border"></div>
                                            <Button
                                                variant={isRecommendationMode ? "default" : "ghost"}
                                                className={`rounded-l-none px-4 py-2 h-10 ${isRecommendationMode ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"}`}
                                                onClick={() => setIsRecommendationMode(true)}
                                            >
                                                <Leaf className="h-4 w-4 mr-2" />
                                                Recommendations
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Stats Cards */}
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
                            >
                                {summaryStats.map((stat, index) => (
                                    <motion.div key={index} variants={itemVariants}>
                                        <Card className="border shadow-sm overflow-hidden">
                                            <CardContent className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${stat.color}`}>
                                                        <stat.icon className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                                                        <p className="text-3xl font-bold">{stat.value}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </div>

                    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                        {/* AI Insights Section */}
                        {aiInsights.length > 0 && showInsights && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="mb-8"
                            >
                                <Card className="border-primary/20 bg-primary/5">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                                                    <Zap className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold">AI Insights</h3>
                                                    <p className="text-sm text-muted-foreground">Smart analysis based on your data</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full"
                                                onClick={() => setShowInsights(false)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {aiInsights.map((insight, index) => (
                                                <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-background/80 border">
                                                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                                                        <Sparkles className="h-3 w-3 text-primary" />
                                                    </div>
                                                    <p className="text-sm">{insight}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* Items Per Page Dropdown */}
                        <div className="mb-6 flex justify-end">
                            <SimpleSelect
                                options={[
                                    { value: "5", label: "5 per page" },
                                    { value: "10", label: "10 per page" },
                                    { value: "20", label: "20 per page" },
                                    { value: "50", label: "50 per page" },
                                ]}
                                defaultLabel="Items per page"
                                onChange={(value) => setItemsPerPage(Number(value))}
                            />
                        </div>

                        {/* Data Table Section */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="mb-8"
                        >
                            <Card className="border shadow-sm overflow-hidden">
                                {isRecommendationMode ? (
                                    <Recommendations
                                        setProfileInfo={setRecommendationData}
                                        isCreating={isCreatingNew}
                                        setIsCreating={setIsCreatingNew}
                                        currentPage={currentPage}
                                        itemsPerPage={itemsPerPage}
                                    />
                                ) : (
                                    <Predictions
                                        setProfileInfo={setPredictionData}
                                        isCreating={isCreatingNew}
                                        setIsCreating={setIsCreatingNew}
                                        currentPage={currentPage}
                                        itemsPerPage={itemsPerPage}
                                    />
                                )}

                                {/* Pagination */}
                                <div className="border-t">
                                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                                </div>
                            </Card>
                        </motion.div>

                        {/* Analytics Section */}
                        {chartData.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="mt-10 space-y-6"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Badge variant="outline" className="mb-2 bg-primary/5 text-primary border-primary/20">
                                            Analytics
                                        </Badge>
                                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                                            <LayoutDashboard className="h-5 w-5 text-primary" />
                                            {isRecommendationMode ? "Recommendation Insights" : "Prediction Insights"}
                                        </h2>
                                        <p className="text-muted-foreground mt-1">
                                            {isRecommendationMode
                                                ? "Analyze soil nutrients, crop recommendations, and seasonal patterns."
                                                : "Visualize crop data, weather impacts, and yield factors."}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <SimpleSelect
                                            options={[
                                                { value: "email", label: "Via Email" },
                                                { value: "link", label: "Copy Link" },
                                            ]}
                                            defaultLabel="Share"
                                            onChange={handleShare}
                                        />

                                        <SimpleSelect
                                            options={[
                                                { value: "csv", label: "As CSV" },
                                                { value: "pdf", label: "As PDF" },
                                            ]}
                                            defaultLabel="Export"
                                            onChange={handleExport}
                                        />

                                        <SimpleSelect
                                            options={[{ value: "all", label: "View All" }]}
                                            defaultLabel="View"
                                            onChange={handleView}
                                        />
                                    </div>
                                </div>

                                <Separator className="my-6" />

                                <Card className="border shadow-sm overflow-hidden">
                                    {!isRecommendationMode ? (
                                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                            <div className="bg-muted/30 p-4 border-b">
                                                <TabsList className="grid w-full max-w-2xl grid-cols-4">
                                                    <TabsTrigger value="charts" className="flex items-center gap-2">
                                                        <PieChart className="h-4 w-4" />
                                                        <span className="hidden sm:inline">Crop Data</span>
                                                        <span className="sm:hidden">Crops</span>
                                                    </TabsTrigger>
                                                    <TabsTrigger value="weather" className="flex items-center gap-2">
                                                        <LineChart className="h-4 w-4" />
                                                        <span className="hidden sm:inline">Weather</span>
                                                        <span className="sm:hidden">Weather</span>
                                                    </TabsTrigger>
                                                    <TabsTrigger value="factors" className="flex items-center gap-2">
                                                        <Braces className="h-4 w-4" />
                                                        <span className="hidden sm:inline">Factors</span>
                                                        <span className="sm:hidden">Factors</span>
                                                    </TabsTrigger>
                                                    <TabsTrigger value="yield" className="flex items-center gap-2">
                                                        <Wheat className="h-4 w-4" />
                                                        <span className="hidden sm:inline">Yield</span>
                                                        <span className="sm:hidden">Yield</span>
                                                    </TabsTrigger>
                                                </TabsList>
                                            </div>

                                            <div className="p-6">
                                                <TabsContent value="charts" className="mt-0">
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                        <ChartPage profileInfo={chartData} />
                                                        <BarChartComponent profileInfo={chartData} />
                                                    </div>
                                                </TabsContent>

                                                <TabsContent value="weather" className="mt-0">
                                                    <WeatherTrendsChart profileInfo={chartData} />
                                                </TabsContent>

                                                <TabsContent value="factors" className="mt-0">
                                                    <YieldBubbleChart profileInfo={chartData} />
                                                </TabsContent>

                                                <TabsContent value="yield" className="mt-0">
                                                    <YieldComparisonChart profileInfo={chartData} />
                                                </TabsContent>
                                            </div>
                                        </Tabs>
                                    ) : (
                                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                            <div className="bg-muted/30 p-4 border-b">
                                                <TabsList className="grid w-full max-w-2xl grid-cols-4">
                                                    <TabsTrigger value="nutrients" className="flex items-center gap-2">
                                                        <FlaskRoundIcon className="h-4 w-4" />
                                                        <span className="hidden sm:inline">Nutrients</span>
                                                        <span className="sm:hidden">NPK</span>
                                                    </TabsTrigger>
                                                    <TabsTrigger value="crops" className="flex items-center gap-2">
                                                        <Wheat className="h-4 w-4" />
                                                        <span className="hidden sm:inline">Crops</span>
                                                        <span className="sm:hidden">Crops</span>
                                                    </TabsTrigger>
                                                    <TabsTrigger value="soil" className="flex items-center gap-2">
                                                        <Gauge className="h-4 w-4" />
                                                        <span className="hidden sm:inline">Soil pH</span>
                                                        <span className="sm:hidden">pH</span>
                                                    </TabsTrigger>
                                                    <TabsTrigger value="seasonal" className="flex items-center gap-2">
                                                        <Droplets className="h-4 w-4" />
                                                        <span className="hidden sm:inline">Seasonal</span>
                                                        <span className="sm:hidden">Season</span>
                                                    </TabsTrigger>
                                                </TabsList>
                                            </div>

                                            <div className="p-6">
                                                <TabsContent value="nutrients" className="mt-0">
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                        <NutrientDistributionChart recommendationData={recommendationData} />
                                                        <NutrientBalanceChart recommendationData={recommendationData} />
                                                    </div>
                                                </TabsContent>

                                                <TabsContent value="crops" className="mt-0">
                                                    <CropRecommendationChart recommendationData={recommendationData} />
                                                </TabsContent>

                                                <TabsContent value="soil" className="mt-0">
                                                    <SoilPHChart recommendationData={recommendationData} />
                                                </TabsContent>

                                                <TabsContent value="seasonal" className="mt-0">
                                                    <SeasonalAnalysisChart recommendationData={recommendationData} />
                                                </TabsContent>
                                            </div>
                                        </Tabs>
                                    )}
                                </Card>
                            </motion.div>
                        )}

                        {/* No data message */}
                        {chartData.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="mt-10"
                            >
                                <Card className="border shadow-sm overflow-hidden">
                                    <div className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                {isRecommendationMode ? (
                                                    <FlaskRoundIcon className="h-10 w-10" />
                                                ) : (
                                                    <BarChart3 className="h-10 w-10" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-medium">No data available</h3>
                                                <p className="text-muted-foreground max-w-md mt-2 mx-auto">
                                                    No {isRecommendationMode ? "recommendation" : "prediction"} data available. Add{" "}
                                                    {isRecommendationMode ? "recommendations" : "predictions"} to see analytics.
                                                </p>
                                            </div>
                                            <Button
                                                onClick={() => setIsCreatingNew(true)}
                                                className="mt-4 px-6 py-2 h-12 text-base"
                                                size="lg"
                                            >
                                                <Plus className="h-5 w-5 mr-2" />
                                                Create your first {isRecommendationMode ? "recommendation" : "prediction"}
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}
