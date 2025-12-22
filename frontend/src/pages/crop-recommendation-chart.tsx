"use client"

import { useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Label } from "recharts"
import { Wheat, TrendingUp } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

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

interface CropRecommendationChartProps {
    recommendationData: Recommendation[]
}

export function CropRecommendationChart({ recommendationData }: CropRecommendationChartProps) {
    // Count recommended crops
    const cropCounts = useMemo(() => {
        const counts = new Map<string, number>()

        recommendationData.forEach((item) => {
            const crop = item.result
            counts.set(crop, (counts.get(crop) || 0) + 1)
        })

        // Convert to array and sort by count
        return Array.from(counts.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5) // Take top 5 for better visualization
    }, [recommendationData])

    // Get colors for the chart
    const getColor = (index: number) => {
        const colors = [
            "hsl(var(--chart-1))",
            "hsl(var(--chart-2))",
            "hsl(var(--chart-3))",
            "hsl(var(--chart-4))",
            "hsl(var(--chart-5))",
        ]
        return colors[index % colors.length]
    }

    // Find the most recommended crop
    const topCrop = useMemo(() => {
        return cropCounts.length > 0 ? cropCounts[0] : null
    }, [cropCounts])

    // Calculate total recommendations
    const totalRecommendations = useMemo(() => {
        return recommendationData.length
    }, [recommendationData])

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-card p-3 rounded-md border shadow-sm">
                    <p className="font-bold text-sm">{payload[0].name}</p>
                    <p className="text-sm">Count: {payload[0].value}</p>
                    <p className="text-xs text-muted-foreground">
                        {((payload[0].value / totalRecommendations) * 100).toFixed(1)}% of recommendations
                    </p>
                </div>
            )
        }
        return null
    }

    return (
        <Card className="shadow-sm h-full flex flex-col">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <Wheat className="h-5 w-5 text-primary" />
                    <CardTitle>Recommended Crops</CardTitle>
                </div>
                <CardDescription>Top recommended crops based on soil analysis</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="h-[250px] w-full">
                    {recommendationData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={cropCounts}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {cropCounts.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={getColor(index)} />
                                    ))}
                                    <Label
                                        content={({ viewBox }) => {
                                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                return (
                                                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-xl font-bold">
                                                            {totalRecommendations}
                                                        </tspan>
                                                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-xs">
                                                            Total
                                                        </tspan>
                                                    </text>
                                                )
                                            }
                                        }}
                                    />
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend formatter={(value) => <span className="text-sm">{value}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            No crop recommendation data available
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm pt-4">
                <div className="flex items-center gap-2 font-medium leading-none">
                    {topCrop && (
                        <>
                            Most recommended: {topCrop.name} ({((topCrop.value / totalRecommendations) * 100).toFixed(0)}%)
                            <TrendingUp className="h-4 w-4 text-primary" />
                        </>
                    )}
                </div>
                <div className="leading-none text-muted-foreground">
                    Recommendations based on soil nutrients, pH, and environmental conditions
                </div>
            </CardFooter>
        </Card>
    )
}

