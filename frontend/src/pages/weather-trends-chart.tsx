"use client"

import { useMemo } from "react"
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Droplets, Thermometer, Cloud } from 'lucide-react'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

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

interface WeatherTrendsChartProps {
    profileInfo: Prediction[]
}

export function WeatherTrendsChart({ profileInfo }: WeatherTrendsChartProps) {
    // Process data for the chart
    const chartData = useMemo(() => {
        // Sort by date
        const sortedData = [...profileInfo].sort((a, b) => a.date - b.date)

        // Format data for the chart
        return sortedData.map((item) => ({
            date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            temperature: item.temperature,
            humidity: item.humidity,
            rainfall: item.rainfall,
        }))
    }, [profileInfo])

    // Calculate averages
    const averages = useMemo(() => {
        if (!profileInfo.length) return { temperature: 0, humidity: 0, rainfall: 0 }

        const sum = profileInfo.reduce(
            (acc, item) => ({
                temperature: acc.temperature + item.temperature,
                humidity: acc.humidity + item.humidity,
                rainfall: acc.rainfall + item.rainfall,
            }),
            { temperature: 0, humidity: 0, rainfall: 0 },
        )

        return {
            temperature: (sum.temperature / profileInfo.length).toFixed(1),
            humidity: (sum.humidity / profileInfo.length).toFixed(1),
            rainfall: (sum.rainfall / profileInfo.length).toFixed(1),
        }
    }, [profileInfo])

    return (
        <Card style={{ width: '100%' }}>
            <CardHeader className="pb-2">
                <CardTitle>Weather Trends</CardTitle>
                <CardDescription>Temperature, humidity, and rainfall data</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]" style={{ width: '100%' }}>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTemperature" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(30, 70%, 55%)" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="hsl(30, 70%, 55%)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(200, 70%, 55%)" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="hsl(200, 70%, 55%)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorRainfall" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(240, 70%, 55%)" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="hsl(240, 70%, 55%)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--card))",
                                        borderColor: "hsl(var(--border))",
                                        borderRadius: "0.5rem",
                                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                                    }}
                                    labelStyle={{ fontWeight: "bold", marginBottom: "0.5rem" }}
                                />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="temperature"
                                    stroke="hsl(30, 70%, 55%)"
                                    fillOpacity={1}
                                    fill="url(#colorTemperature)"
                                    name="Temperature (°C)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="humidity"
                                    stroke="hsl(200, 70%, 55%)"
                                    fillOpacity={1}
                                    fill="url(#colorHumidity)"
                                    name="Humidity (%)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="rainfall"
                                    stroke="hsl(240, 70%, 55%)"
                                    fillOpacity={1}
                                    fill="url(#colorRainfall)"
                                    name="Rainfall (mm)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            No weather data available
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="grid grid-cols-3 gap-4 pt-2">
                <div className="flex flex-col items-center justify-center p-2 rounded-md bg-muted/50">
                    <div className="flex items-center gap-2 text-amber-600">
                        <Thermometer className="h-4 w-4" />
                        <span className="font-medium">Temperature</span>
                    </div>
                    <span className="text-lg font-bold">{averages.temperature}°C</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded-md bg-muted/50">
                    <div className="flex items-center gap-2 text-blue-500">
                        <Droplets className="h-4 w-4" />
                        <span className="font-medium">Humidity</span>
                    </div>
                    <span className="text-lg font-bold">{averages.humidity}%</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded-md bg-muted/50">
                    <div className="flex items-center gap-2 text-indigo-600">
                        <Cloud className="h-4 w-4" />
                        <span className="font-medium">Rainfall</span>
                    </div>
                    <span className="text-lg font-bold">{averages.rainfall} mm</span>
                </div>
            </CardFooter>
        </Card>
    )
}

