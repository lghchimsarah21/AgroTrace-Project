"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts"
import { Gauge, TrendingUp } from "lucide-react"

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

interface SoilPHChartProps {
    recommendationData: Recommendation[]
}

export function SoilPHChart({ recommendationData }: SoilPHChartProps) {
    // Group pH values into ranges
    const phRanges = useMemo(() => {
        const ranges = [
            { range: "Very Acidic (<5.5)", min: 0, max: 5.5, count: 0, color: "hsl(0, 70%, 60%)" },
            { range: "Acidic (5.5-6.5)", min: 5.5, max: 6.5, count: 0, color: "hsl(30, 70%, 60%)" },
            { range: "Neutral (6.5-7.5)", min: 6.5, max: 7.5, count: 0, color: "hsl(120, 40%, 50%)" },
            { range: "Alkaline (7.5-8.5)", min: 7.5, max: 8.5, count: 0, color: "hsl(200, 70%, 60%)" },
            { range: "Very Alkaline (>8.5)", min: 8.5, max: 14, count: 0, color: "hsl(270, 70%, 60%)" },
        ]

        // Count samples in each range
        recommendationData.forEach((item) => {
            const ph = item.ph
            for (const range of ranges) {
                if (ph >= range.min && ph < range.max) {
                    range.count++
                    break
                }
            }
        })

        return ranges
    }, [recommendationData])

    // Calculate average pH
    const averagePH = useMemo(() => {
        if (!recommendationData.length) return 0
        const sum = recommendationData.reduce((acc, item) => acc + item.ph, 0)
        return (sum / recommendationData.length).toFixed(1)
    }, [recommendationData])

    // Determine soil type based on average pH
    const soilType = useMemo(() => {
        const ph = Number.parseFloat(averagePH)
        if (ph < 5.5) return "Very Acidic"
        if (ph < 6.5) return "Acidic"
        if (ph < 7.5) return "Neutral"
        if (ph < 8.5) return "Alkaline"
        return "Very Alkaline"
    }, [averagePH])

    // Get crop recommendations based on pH
    const phRecommendations = useMemo(() => {
        const ph = Number.parseFloat(averagePH)
        if (ph < 5.5) return "Potatoes, Blueberries, Azaleas"
        if (ph < 6.5) return "Carrots, Tomatoes, Strawberries"
        if (ph < 7.5) return "Lettuce, Cabbage, Corn, Soybeans"
        if (ph < 8.5) return "Asparagus, Beets, Grapes"
        return "Date Palms, Spinach, Figs"
    }, [averagePH])

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-card p-3 rounded-md border shadow-sm">
                    <p className="font-bold text-sm">{payload[0].payload.range}</p>
                    <p className="text-sm">Samples: {payload[0].value}</p>
                    <p className="text-xs text-muted-foreground">
                        pH: {payload[0].payload.min} - {payload[0].payload.max}
                    </p>
                </div>
            )
        }
        return null
    }

    return (
        <Card className="shadow-sm w-full">
            <CardHeader className="pb-2">
                <div clas0sName="flex items-center gap-2">
                    <Gauge className="h-5 w-5 text-primary" />
                    <CardTitle>Soil pH Analysis</CardTitle>
                </div>
                <CardDescription>Distribution of soil pH levels across samples</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    {recommendationData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={phRanges} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                <XAxis dataKey="range" />
                                <YAxis label={{ value: "Number of Samples", angle: -90, position: "insideLeft" }} />
                                <Tooltip content={<CustomTooltip />} />
                                <ReferenceLine x={0} stroke="#666" />
                                <ReferenceLine y={0} stroke="#666" />
                                <Bar dataKey="count" name="Samples" barSize={60}>
                                    {phRanges.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                                <ReferenceLine
                                    y={Math.max(...phRanges.map((r) => r.count)) / 2}
                                    label={{ value: `Avg pH: ${averagePH}`, position: "insideBottomRight" }}
                                    stroke="hsl(var(--primary))"
                                    strokeDasharray="3 3"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">No pH data available</div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm pt-4">
                <div className="flex items-center gap-2 font-medium leading-none">
                    Average soil pH: {averagePH} ({soilType})
                    <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div className="leading-none text-muted-foreground">Suitable crops for this pH: {phRecommendations}</div>
            </CardFooter>
        </Card>
    )
}

