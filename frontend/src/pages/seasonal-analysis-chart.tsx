"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts"
import { Droplets, TrendingUp } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

interface Recommendation {
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

interface SeasonalAnalysisChartProps {
    recommendationData: Recommendation[]
}

export function SeasonalAnalysisChart({ recommendationData }: SeasonalAnalysisChartProps) {
    const [selectedMetric, setSelectedMetric] = useState<string>("temperature")

    // Get unique seasons
    const seasons = useMemo(() => {
        const uniqueSeasons = new Set(recommendationData.map((item) => item.season))
        return Array.from(uniqueSeasons)
    }, [recommendationData])

    // Calculate seasonal averages
    const seasonalData = useMemo(() => {
        const data: Record<
            string,
            { temperature: number; humidity: number; rainfall: number; count: number; crops: string[] }
        > = {}

        // Initialize data structure
        seasons.forEach((season) => {
            data[season] = { temperature: 0, humidity: 0, rainfall: 0, count: 0, crops: [] }
        })

        // Sum values by season
        recommendationData.forEach((item) => {
            const season = item.season
            data[season].temperature += item.temperature
            data[season].humidity += item.humidity
            data[season].rainfall += item.rainfall
            data[season].count += 1
            if (!data[season].crops.includes(item.result)) {
                data[season].crops.push(item.result)
            }
        })

        // Calculate averages and format for chart
        return Object.entries(data).map(([season, values]) => ({
            season,
            temperature: values.count > 0 ? +(values.temperature / values.count).toFixed(1) : 0,
            humidity: values.count > 0 ? +(values.humidity / values.count).toFixed(1) : 0,
            rainfall: values.count > 0 ? +(values.rainfall / values.count).toFixed(1) : 0,
            count: values.count,
            crops: values.crops.slice(0, 3).join(", "), // Top 3 crops
        }))
    }, [recommendationData, seasons])

    // Get colors for the chart
    const getMetricColor = (metric: string) => {
        const colors: Record<string, string> = {
            temperature: "hsl(30, 70%, 55%)",
            humidity: "hsl(200, 70%, 55%)",
            rainfall: "hsl(240, 70%, 55%)",
        }
        return colors[metric] || "hsl(var(--chart-1))"
    }

    // Get metric label
    const getMetricLabel = (metric: string) => {
        const labels: Record<string, string> = {
            temperature: "Temperature (°C)",
            humidity: "Humidity (%)",
            rainfall: "Rainfall (mm)",
        }
        return labels[metric] || metric
    }

    // Find season with highest value for selected metric
    const topSeason = useMemo(() => {
        if (!seasonalData.length) return null
        return [...seasonalData].sort(
            (a, b) => b[selectedMetric as keyof typeof b] - a[selectedMetric as keyof typeof a],
        )[0]
    }, [seasonalData, selectedMetric])

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            return (
                <div className="bg-card p-3 rounded-md border shadow-sm">
                    <p className="font-bold text-sm">{data.season}</p>
                    <p className="text-sm">
                        {getMetricLabel(selectedMetric)}: {data[selectedMetric]}
                    </p>
                    <p className="text-xs text-muted-foreground">Based on {data.count} samples</p>
                    <p className="text-xs mt-1">Top crops: {data.crops}</p>
                </div>
            )
        }
        return null
    }

    return (
        <Card className="shadow-sm w-full">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Droplets className="h-5 w-5 text-primary" />
                        <CardTitle>Seasonal Analysis</CardTitle>
                    </div>
                    <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                        <SelectTrigger className="w-[180px] h-8">
                            <SelectValue placeholder="Select metric" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="temperature">Temperature</SelectItem>
                            <SelectItem value="humidity">Humidity</SelectItem>
                            <SelectItem value="rainfall">Rainfall</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <CardDescription>Average environmental conditions by season</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    {recommendationData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={seasonalData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                <XAxis dataKey="season" />
                                <YAxis label={{ value: getMetricLabel(selectedMetric), angle: -90, position: "insideLeft" }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar dataKey={selectedMetric} name={getMetricLabel(selectedMetric)} barSize={60}>
                                    {seasonalData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={getMetricColor(selectedMetric)} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            No seasonal data available
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm pt-4">
                <div className="flex items-center gap-2 font-medium leading-none">
                    {topSeason && (
                        <>
                            Highest {getMetricLabel(selectedMetric)}: {topSeason.season} (
                            {topSeason[selectedMetric as keyof typeof topSeason]})
                            <TrendingUp className="h-4 w-4 text-primary" />
                        </>
                    )}
                </div>
                <div className="leading-none text-muted-foreground">
                    Seasonal variations significantly impact crop selection and growth conditions
                </div>
            </CardFooter>
        </Card>
    )
}

