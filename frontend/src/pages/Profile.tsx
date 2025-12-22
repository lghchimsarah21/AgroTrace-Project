"use client"

import type React from "react"

import { useState } from "react"
import { Leaf, BarChart3, LineChart, PieChart, Braces, Wheat } from "lucide-react"
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { AppSidebar } from "@/pages/app-sidebar"
import Predictions from "@/pages/Predictions"
import ChartPage from "@/pages/chart-page"
import { BarChartComponent } from "@/pages/bar-chart"
import { WeatherTrendsChart } from "@/pages/weather-trends-chart"
import { YieldBubbleChart } from "@/pages/yield-bubble-chart"
import { YieldComparisonChart } from "@/pages/yield-comparison-chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import "../Styles/chart-styles.css"

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


// This component wraps the main content and adjusts based on sidebar state
function MainContent({ children }: { children: React.ReactNode }) {
    const { state } = useSidebar()

    return (
        <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out" style={{ width: "100%" }}>
            {children}
        </div>
    )
}

export default function Profile() {
    const [profileInfo, setProfileInfo] = useState<Prediction[]>([])

    return (
        <SidebarProvider>
            <div className="flex min-h-screen bg-background w-full">
                <AppSidebar recentCrops = {profileInfo} />

                <MainContent>
                    <header className="border-b p-4 flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
                        <div className="flex items-center gap-2">
                            <Leaf className="h-6 w-6 text-primary" />
                            <h1 className="text-2xl font-bold">Crop Prediction Dashboard</h1>
                        </div>
                        <SidebarTrigger />
                    </header>

                    <main className="flex-1 p-6 w-full">
                        <div className="w-full">
                            <Predictions setProfileInfo={setProfileInfo} />

                            {profileInfo.length > 0 ? (
                                <div className="mt-10 space-y-6 w-full">
                                    <h2 className="text-xl font-semibold flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5 text-primary" />
                                        Prediction Analytics
                                    </h2>

                                    <div className="w-full">
                                        <Tabs defaultValue="charts" className="w-full">
                                            <TabsList className="grid w-full max-w-md grid-cols-4">
                                                <TabsTrigger value="charts" className="flex items-center gap-2">
                                                    <PieChart className="h-4 w-4" />
                                                    Crop Data
                                                </TabsTrigger>
                                                <TabsTrigger value="weather" className="flex items-center gap-2">
                                                    <LineChart className="h-4 w-4" />
                                                    Weather
                                                </TabsTrigger>
                                                <TabsTrigger value="factors" className="flex items-center gap-2">
                                                    <Braces className="h-4 w-4" />
                                                    Factors
                                                </TabsTrigger>
                                                <TabsTrigger value="yield" className="flex items-center gap-2">
                                                    <Wheat className="h-4 w-4" />
                                                    Yield
                                                </TabsTrigger>
                                            </TabsList>

                                            <div className="w-full">
                                                <TabsContent value="charts" className="mt-4 w-full">
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                                                        <ChartPage profileInfo={profileInfo} />
                                                        <BarChartComponent profileInfo={profileInfo} />
                                                    </div>
                                                </TabsContent>

                                                <TabsContent value="weather" className="mt-4 w-full">
                                                    <WeatherTrendsChart profileInfo={profileInfo} />
                                                </TabsContent>

                                                <TabsContent value="factors" className="mt-4 w-full">
                                                    <YieldBubbleChart profileInfo={profileInfo} />
                                                </TabsContent>

                                                <TabsContent value="yield" className="mt-4 w-full">
                                                    <YieldComparisonChart profileInfo={profileInfo} />
                                                </TabsContent>
                                            </div>
                                        </Tabs>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-10 p-8 text-center border rounded-lg bg-muted/20">
                                    <p className="text-muted-foreground">
                                        No prediction data available. Add predictions to see analytics.
                                    </p>
                                </div>
                            )}
                        </div>
                    </main>
                </MainContent>
            </div>
        </SidebarProvider>
    )
}

