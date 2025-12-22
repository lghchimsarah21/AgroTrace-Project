"use client"

import { useMemo, useState } from "react"
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts"
import { Droplets, Thermometer, Sprout } from 'lucide-react'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Prediction {
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

interface YieldBubbleChartProps {
    profileInfo: Prediction[]
}

export function YieldBubbleChart({ profileInfo }: YieldBubbleChartProps) {
    const [selectedCrop, setSelectedCrop] = useState<string>("all")
    const [comparisonMode, setComparisonMode] = useState<string>("temperature-humidity")

    // Get unique crops for filter
    const crops = useMemo(() => {
        const uniqueCrops = new Set(profileInfo.map((p) => p.crop))
        return Array.from(uniqueCrops)
    }, [profileInfo])

    // Process data for the chart
    const chartData = useMemo(() => {
        if (!profileInfo.length) return []

        // Filter by selected crop if not "all"
        const filteredData = selectedCrop === "all" ? profileInfo : profileInfo.filter((p) => p.crop === selectedCrop)

        return filteredData.map((prediction) => ({
            id: prediction.id,
            crop: prediction.crop,
            city: prediction.city,
            temperature: prediction.temperature,
            humidity: prediction.humidity,
            rainfall: prediction.rainfall,
            area: prediction.area,
            yield: prediction.result,
        }))
    }, [profileInfo, selectedCrop])

    // Get axis configurations based on comparison mode
    const getAxisConfig = () => {
        switch (comparisonMode) {
            case "temperature-humidity":
                return {
                    xAxis: { dataKey: "temperature", name: "Temperature (°C)" },
                    yAxis: { dataKey: "humidity", name: "Humidity (%)" },
                }
            case "temperature-rainfall":
                return {
                    xAxis: { dataKey: "temperature", name: "Temperature (°C)" },
                    yAxis: { dataKey: "rainfall", name: "Rainfall (mm)" },
                }
            case "humidity-rainfall":
                return {
                    xAxis: { dataKey: "humidity", name: "Humidity (%)" },
                    yAxis: { dataKey: "rainfall", name: "Rainfall (mm)" },
                }
            case "area-yield":
                return {
                    xAxis: { dataKey: "area", name: "Area (ha)" },
                    yAxis: { dataKey: "yield", name: "Yield" },
                }
            default:
                return {
                    xAxis: { dataKey: "temperature", name: "Temperature (°C)" },
                    yAxis: { dataKey: "humidity", name: "Humidity (%)" },
                }
        }
    }

    const axisConfig = getAxisConfig()

    // Group data by crop for multiple scatters
    const cropGroups = useMemo(() => {
        if (!chartData.length) return []

        const groups = new Map()

        chartData.forEach((item) => {
            if (!groups.has(item.crop)) {
                groups.set(item.crop, [])
            }
            groups.get(item.crop).push(item)
        })

        return Array.from(groups.entries()).map(([crop, data]) => ({
            crop,
            data,
        }))
    }, [chartData])

    // Get crop color
    const getCropColor = (crop: string, index: number) => {
        const colors = [
            "hsl(var(--chart-1))",
            "hsl(var(--chart-2))",
            "hsl(var(--chart-3))",
            "hsl(var(--chart-4))",
            "hsl(var(--chart-5))",
        ]

        // If it's a specific crop we know, use a consistent color
        const knownCrops: Record<string, string> = {
            rice: colors[0],
            wheat: colors[1],
            maize: colors[2],
            cotton: colors[3],
            sugarcane: colors[4],
        }

        return knownCrops[crop.toLowerCase()] || colors[index % colors.length]
    }

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            return (
                <div className="bg-card p-3 rounded-md border shadow-sm">
                    <p className="font-bold text-sm">{data.crop}</p>
                    <p className="text-xs text-muted-foreground">{data.city}</p>
                    <div className="text-xs space-y-1 mt-1">
                        <p>Temperature: {data.temperature}°C</p>
                        <p>Humidity: {data.humidity}%</p>
                        <p>Rainfall: {data.rainfall} mm</p>
                        <p>Area: {data.area} ha</p>
                        <p className="font-semibold">Yield: {data.yield}</p>
                    </div>
                </div>
            )
        }
        return null
    }

    // Find insights
    const insights = useMemo(() => {
        if (!chartData.length) return null

        // Find highest yield
        const highestYield = [...chartData].sort((a, b) => b.yield - a.yield)[0]

        // Find optimal conditions based on top 3 yields
        const top3 = [...chartData].sort((a, b) => b.yield - a.yield).slice(0, 3)
        const avgTemp = top3.reduce((sum, item) => sum + item.temperature, 0) / top3.length
        const avgHumidity = top3.reduce((sum, item) => sum + item.humidity, 0) / top3.length
        const avgRainfall = top3.reduce((sum, item) => sum + item.rainfall, 0) / top3.length

        return {
            highestYield,
            optimalConditions: {
                temperature: avgTemp.toFixed(1),
                humidity: avgHumidity.toFixed(1),
                rainfall: avgRainfall.toFixed(1),
            },
        }
    }, [chartData])

    return (
        <Card style={{ width: '100%' }}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sprout className="h-5 w-5 text-primary" />
                        <CardTitle>Yield Factors Visualization</CardTitle>
                    </div>
                    <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                        <SelectTrigger className="w-[180px] h-8">
                            <SelectValue placeholder="Select crop" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Crops</SelectItem>
                            {crops.map((crop) => (
                                <SelectItem key={crop} value={crop}>
                                    {crop}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <CardDescription>Interactive visualization of environmental factors and crop yield</CardDescription>

                <Tabs value={comparisonMode} onValueChange={setComparisonMode} className="mt-2">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="temperature-humidity" className="text-xs">
                            Temp vs Humidity
                        </TabsTrigger>
                        <TabsTrigger value="temperature-rainfall" className="text-xs">
                            Temp vs Rainfall
                        </TabsTrigger>
                        <TabsTrigger value="humidity-rainfall" className="text-xs">
                            Humidity vs Rainfall
                        </TabsTrigger>
                        <TabsTrigger value="area-yield" className="text-xs">
                            Area vs Yield
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]" style={{ width: '100%' }}>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                <XAxis
                                    type="number"
                                    dataKey={axisConfig.xAxis.dataKey}
                                    name={axisConfig.xAxis.name}
                                    label={{
                                        value: axisConfig.xAxis.name,
                                        position: "insideBottom",
                                        offset: -10,
                                        style: { fill: "hsl(var(--muted-foreground))" },
                                    }}
                                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                                />
                                <YAxis
                                    type="number"
                                    dataKey={axisConfig.yAxis.dataKey}
                                    name={axisConfig.yAxis.name}
                                    label={{
                                        value: axisConfig.yAxis.name,
                                        angle: -90,
                                        position: "insideLeft",
                                        style: { fill: "hsl(var(--muted-foreground))" },
                                    }}
                                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                                />
                                <ZAxis type="number" dataKey="yield" range={[60, 400]} name="Yield" />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />

                                {selectedCrop === "all" ? (
                                    // Multiple scatters for different crops
                                    cropGroups.map((group, index) => (
                                        <Scatter
                                            key={group.crop}
                                            name={group.crop}
                                            data={group.data}
                                            fill={getCropColor(group.crop, index)}
                                        />
                                    ))
                                ) : (
                                    // Single scatter for selected crop
                                    <Scatter name={selectedCrop} data={chartData} fill={getCropColor(selectedCrop, 0)} />
                                )}
                            </ScatterChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">No yield data available</div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                {insights && (
                    <>
                        <div className="flex flex-col items-center justify-center p-3 rounded-md bg-muted/50">
                            <div className="flex items-center gap-2 text-primary">
                                <Thermometer className="h-4 w-4" />
                                <span className="font-medium">Optimal Temperature</span>
                            </div>
                            <span className="text-lg font-bold">{insights.optimalConditions.temperature}°C</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-3 rounded-md bg-muted/50">
                            <div className="flex items-center gap-2 text-primary">
                                <Droplets className="h-4 w-4" />
                                <span className="font-medium">Optimal Humidity</span>
                            </div>
                            <span className="text-lg font-bold">{insights.optimalConditions.humidity}%</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-3 rounded-md bg-muted/50">
                            <div className="flex items-center gap-2 text-primary">
                                <Sprout className="h-4 w-4" />
                                <span className="font-medium">Best Yield</span>
                            </div>
                            <span className="text-lg font-bold">
                {insights.highestYield.yield} ({insights.highestYield.crop})
              </span>
                        </div>
                    </>
                )}
            </CardFooter>
        </Card>
    )
}

