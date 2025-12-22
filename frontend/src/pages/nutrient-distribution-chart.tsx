"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, Cell } from "recharts"
import { FlaskRoundIcon as Flask, TrendingUp } from "lucide-react"

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

interface NutrientDistributionChartProps {
    recommendationData: Recommendation[]
}

export function NutrientDistributionChart({ recommendationData }: NutrientDistributionChartProps) {
    // Calculate average nutrient values
    const averageNutrients = useMemo(() => {
        if (!recommendationData.length) return { nitrogen: 0, phosphorous: 0, pottasium: 0 }

        const sum = recommendationData.reduce(
            (acc, item) => ({
                nitrogen: acc.nitrogen + item.nitrogen,
                phosphorous: acc.phosphorous + item.phosphorous,
                pottasium: acc.pottasium + item.pottasium,
            }),
            { nitrogen: 0, phosphorous: 0, pottasium: 0 },
        )

        return {
            nitrogen: (sum.nitrogen / recommendationData.length).toFixed(1),
            phosphorous: (sum.phosphorous / recommendationData.length).toFixed(1),
            pottasium: (sum.pottasium / recommendationData.length).toFixed(1),
        }
    }, [recommendationData])

    // Prepare data for bar chart
    const nutrientData = useMemo(() => {
        return [
            { name: "Nitrogen (N)", value: Number.parseFloat(averageNutrients.nitrogen), color: "hsl(var(--chart-1))" },
            { name: "Phosphorous (P)", value: Number.parseFloat(averageNutrients.phosphorous), color: "hsl(var(--chart-2))" },
            { name: "Potassium (K)", value: Number.parseFloat(averageNutrients.pottasium), color: "hsl(var(--chart-3))" },
        ]
    }, [averageNutrients])

    // Find the most abundant nutrient
    const dominantNutrient = useMemo(() => {
        if (!nutrientData.length) return null
        return nutrientData.reduce((max, item) => (item.value > max.value ? item : max), nutrientData[0])
    }, [nutrientData])

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-card p-3 rounded-md border shadow-sm">
                    <p className="font-bold text-sm">{payload[0].payload.name}</p>
                    <p className="text-sm">Value: {payload[0].value}</p>
                    <p className="text-xs text-muted-foreground">
                        {payload[0].payload.name.split(" ")[0]} is{" "}
                        {payload[0].payload.name === "Nitrogen (N)"
                            ? "essential for leaf growth"
                            : payload[0].payload.name === "Phosphorous (P)"
                                ? "important for root development"
                                : "vital for overall plant health"}
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
                    <Flask className="h-5 w-5 text-primary" />
                    <CardTitle>Soil Nutrient Levels</CardTitle>
                </div>
                <CardDescription>Average N-P-K nutrient levels in soil samples</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="h-[250px] w-full">
                    {recommendationData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={nutrientData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={60}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis label={{ value: "Nutrient Level", angle: -90, position: "insideLeft" }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar dataKey="value" name="Level">
                                    {nutrientData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            No nutrient data available
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm pt-4">
                <div className="flex items-center gap-2 font-medium leading-none">
                    {dominantNutrient && (
                        <>
                            Highest nutrient: {dominantNutrient.name} ({dominantNutrient.value})
                            <TrendingUp className="h-4 w-4 text-primary" />
                        </>
                    )}
                </div>
                <div className="leading-none text-muted-foreground">
                    N-P-K ratio: {averageNutrients.nitrogen}:{averageNutrients.phosphorous}:{averageNutrients.pottasium}
                </div>
            </CardFooter>
        </Card>
    )
}

