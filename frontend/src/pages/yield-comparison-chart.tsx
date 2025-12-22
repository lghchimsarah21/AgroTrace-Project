"use client"

import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Wheat, TrendingUp } from 'lucide-react'

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

interface YieldComparisonChartProps {
    profileInfo: Prediction[]
}

export function YieldComparisonChart({ profileInfo }: YieldComparisonChartProps) {
    // Process data for the chart
    const { chartData, averageYield, highestYield } = useMemo(() => {
        if (!profileInfo.length) return { chartData: [], averageYield: 0, highestYield: null }

        // Group predictions by crop and calculate average yield
        const cropYields = new Map()

        profileInfo.forEach((prediction) => {
            const crop = prediction.crop
            if (!cropYields.has(crop)) {
                cropYields.set(crop, {
                    totalYield: 0,
                    count: 0,
                    totalArea: 0,
                })
            }

            const data = cropYields.get(crop)
            data.totalYield += prediction.result
            data.totalArea += prediction.area
            data.count += 1
        })

        // Calculate yield per hectare for each crop
        const yieldData = Array.from(cropYields.entries())
            .map(([crop, data]) => {
                const yieldPerHectare = data.totalArea > 0 ? data.totalYield / data.totalArea : 0
                return {
                    crop,
                    yieldPerHectare: Number.parseFloat(yieldPerHectare.toFixed(2)),
                    totalYield: data.totalYield,
                    averageYield: data.totalYield / data.count,
                    count: data.count,
                }
            })
            .sort((a, b) => b.yieldPerHectare - a.yieldPerHectare)

        // Calculate overall average yield per hectare
        const totalYield = yieldData.reduce((sum, item) => sum + item.totalYield, 0)
        const totalArea = profileInfo.reduce((sum, item) => sum + item.area, 0)
        const averageYield = totalArea > 0 ? totalYield / totalArea : 0

        // Find highest yield crop
        const highestYield = yieldData.length > 0 ? yieldData[0] : null

        return {
            chartData: yieldData,
            averageYield: Number.parseFloat(averageYield.toFixed(2)),
            highestYield,
        }
    }, [profileInfo])

    // Custom tooltip component
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            return (
                <div className="bg-card p-3 rounded-md border shadow-sm">
                    <p className="font-bold text-sm">{data.crop}</p>
                    <div className="text-xs space-y-1 mt-1">
                        <p>Yield per hectare: {data.yieldPerHectare}</p>
                        <p>Total yield: {data.totalYield}</p>
                        <p>Predictions: {data.count}</p>
                    </div>
                </div>
            )
        }
        return null
    }

    // Colors for the bars
    const getBarColor = (index: number) => {
        const colors = [
            "hsl(var(--chart-1))",
            "hsl(var(--chart-2))",
            "hsl(var(--chart-3))",
            "hsl(var(--chart-4))",
            "hsl(var(--chart-5))",
        ]
        return colors[index % colors.length]
    }

    return (
        <Card style={{ width: '100%' }}>
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <Wheat className="h-5 w-5 text-primary" />
                    <CardTitle>Yield Comparison</CardTitle>
                </div>
                <CardDescription>Yield per hectare by crop type</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]" style={{ width: '100%' }}>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                <XAxis
                                    dataKey="crop"
                                    tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={70}
                                />
                                <YAxis
                                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                                    axisLine={false}
                                    tickLine={false}
                                    label={{
                                        value: "Yield per hectare",
                                        angle: -90,
                                        position: "insideLeft",
                                        style: { fill: "hsl(var(--muted-foreground))" },
                                    }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar dataKey="yieldPerHectare" name="Yield per hectare" radius={[4, 4, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">No yield data available</div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm pt-4">
                <div className="flex items-center gap-2 font-medium leading-none">
                    {highestYield && (
                        <>
                            Highest yield crop: {highestYield.crop} ({highestYield.yieldPerHectare} per hectare)
                            <TrendingUp className="h-4 w-4 text-primary" />
                        </>
                    )}
                </div>
                <div className="leading-none text-muted-foreground">
                    Average yield across all crops: {averageYield} per hectare
                </div>
            </CardFooter>
        </Card>
    )
}

