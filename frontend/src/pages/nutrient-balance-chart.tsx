"use client"

import { useMemo, useState } from "react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ReferenceLine,
} from "recharts"
import { Scale, TrendingUp } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

interface NutrientBalanceChartProps {
    recommendationData: Recommendation[]
}

// Ideal nutrient ranges for different crops
const idealNutrients: Record<
    string,
    { nitrogen: [number, number]; phosphorous: [number, number]; pottasium: [number, number] }
> = {
    rice: { nitrogen: [80, 120], phosphorous: [40, 60], pottasium: [60, 100] },
    wheat: { nitrogen: [100, 150], phosphorous: [50, 80], pottasium: [70, 110] },
    maize: { nitrogen: [120, 180], phosphorous: [60, 90], pottasium: [80, 120] },
    cotton: { nitrogen: [100, 140], phosphorous: [50, 70], pottasium: [90, 130] },
    sugarcane: { nitrogen: [150, 200], phosphorous: [70, 100], pottasium: [100, 150] },
    // Default values for other crops
    default: { nitrogen: [100, 150], phosphorous: [50, 80], pottasium: [70, 110] },
}

export function NutrientBalanceChart({ recommendationData }: NutrientBalanceChartProps) {
    const [selectedCrop, setSelectedCrop] = useState<string>("all")

    // Get unique crops
    const crops = useMemo(() => {
        const uniqueCrops = new Set(recommendationData.map((item) => item.result))
        return Array.from(uniqueCrops)
    }, [recommendationData])

    // Calculate average nutrients by crop
    const nutrientsByCrop = useMemo(() => {
        const cropData: Record<string, { nitrogen: number; phosphorous: number; pottasium: number; count: number }> = {}

        // Initialize data structure
        crops.forEach((crop) => {
            cropData[crop] = { nitrogen: 0, phosphorous: 0, pottasium: 0, count: 0 }
        })

        // Sum values by crop
        recommendationData.forEach((item) => {
            const crop = item.result
            cropData[crop].nitrogen += item.nitrogen
            cropData[crop].phosphorous += item.phosphorous
            cropData[crop].pottasium += item.pottasium
            cropData[crop].count += 1
        })

        // Calculate averages
        Object.keys(cropData).forEach((crop) => {
            if (cropData[crop].count > 0) {
                cropData[crop].nitrogen = +(cropData[crop].nitrogen / cropData[crop].count).toFixed(1)
                cropData[crop].phosphorous = +(cropData[crop].phosphorous / cropData[crop].count).toFixed(1)
                cropData[crop].pottasium = +(cropData[crop].pottasium / cropData[crop].count).toFixed(1)
            }
        })

        return cropData
    }, [recommendationData, crops])

    // Prepare chart data
    const chartData = useMemo(() => {
        if (selectedCrop === "all") {
            // Show all crops
            return Object.entries(nutrientsByCrop).map(([crop, values]) => ({
                crop,
                nitrogen: values.nitrogen,
                phosphorous: values.phosphorous,
                pottasium: values.pottasium,
                // Get ideal ranges for this crop (or default if not found)
                idealN: idealNutrients[crop.toLowerCase()] || idealNutrients.default,
                idealP: idealNutrients[crop.toLowerCase()] || idealNutrients.default,
                idealK: idealNutrients[crop.toLowerCase()] || idealNutrients.default,
            }))
        } else {
            // Show only selected crop
            const cropData = nutrientsByCrop[selectedCrop]
            if (!cropData) return []

            // For single crop, show comparison with ideal values
            return [
                {
                    nutrient: "Nitrogen (N)",
                    actual: cropData.nitrogen,
                    idealMin: (idealNutrients[selectedCrop.toLowerCase()] || idealNutrients.default).nitrogen[0],
                    idealMax: (idealNutrients[selectedCrop.toLowerCase()] || idealNutrients.default).nitrogen[1],
                    fill: "hsl(var(--chart-1))",
                },
                {
                    nutrient: "Phosphorous (P)",
                    actual: cropData.phosphorous,
                    idealMin: (idealNutrients[selectedCrop.toLowerCase()] || idealNutrients.default).phosphorous[0],
                    idealMax: (idealNutrients[selectedCrop.toLowerCase()] || idealNutrients.default).phosphorous[1],
                    fill: "hsl(var(--chart-2))",
                },
                {
                    nutrient: "Potassium (K)",
                    actual: cropData.pottasium,
                    idealMin: (idealNutrients[selectedCrop.toLowerCase()] || idealNutrients.default).pottasium[0],
                    idealMax: (idealNutrients[selectedCrop.toLowerCase()] || idealNutrients.default).pottasium[1],
                    fill: "hsl(var(--chart-3))",
                },
            ]
        }
    }, [selectedCrop, nutrientsByCrop])

    // Find nutrient balance insights
    const balanceInsight = useMemo(() => {
        if (selectedCrop === "all" || !chartData.length) return null

        const deficientNutrients = chartData
            .filter((item) => item.actual < item.idealMin)
            .map((item) => item.nutrient.split(" ")[0])

        const excessNutrients = chartData
            .filter((item) => item.actual > item.idealMax)
            .map((item) => item.nutrient.split(" ")[0])

        if (deficientNutrients.length && excessNutrients.length) {
            return `${selectedCrop} needs more ${deficientNutrients.join(", ")} and less ${excessNutrients.join(", ")}`
        } else if (deficientNutrients.length) {
            return `${selectedCrop} needs more ${deficientNutrients.join(", ")}`
        } else if (excessNutrients.length) {
            return `${selectedCrop} has excess ${excessNutrients.join(", ")}`
        } else {
            return `${selectedCrop} has balanced nutrient levels`
        }
    }, [selectedCrop, chartData])

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload

            if (selectedCrop === "all") {
                return (
                    <div className="bg-card p-3 rounded-md border shadow-sm">
                        <p className="font-bold text-sm">{data.crop}</p>
                        <div className="text-xs space-y-1 mt-1">
                            <p>Nitrogen: {data.nitrogen}</p>
                            <p>Phosphorous: {data.phosphorous}</p>
                            <p>Potassium: {data.pottasium}</p>
                        </div>
                    </div>
                )
            } else {
                return (
                    <div className="bg-card p-3 rounded-md border shadow-sm">
                        <p className="font-bold text-sm">{data.nutrient}</p>
                        <div className="text-xs space-y-1 mt-1">
                            <p>Actual: {data.actual}</p>
                            <p>
                                Ideal range: {data.idealMin} - {data.idealMax}
                            </p>
                            {data.actual < data.idealMin && <p className="text-red-500">Deficient</p>}
                            {data.actual > data.idealMax && <p className="text-amber-500">Excess</p>}
                            {data.actual >= data.idealMin && data.actual <= data.idealMax && (
                                <p className="text-green-500">Optimal</p>
                            )}
                        </div>
                    </div>
                )
            }
        }
        return null
    }

    return (
        <Card className="shadow-sm w-full">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Scale className="h-5 w-5 text-primary" />
                        <CardTitle>Nutrient Balance Analysis</CardTitle>
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
                <CardDescription>
                    {selectedCrop === "all"
                        ? "Average nutrient levels across different crops"
                        : `Nutrient balance for ${selectedCrop} compared to ideal ranges`}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    {recommendationData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            {selectedCrop === "all" ? (
                                // Multiple crops view
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={20} barGap={2}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                    <XAxis dataKey="crop" />
                                    <YAxis label={{ value: "Nutrient Level", angle: -90, position: "insideLeft" }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar dataKey="nitrogen" name="Nitrogen (N)" fill="hsl(var(--chart-1))" />
                                    <Bar dataKey="phosphorous" name="Phosphorous (P)" fill="hsl(var(--chart-2))" />
                                    <Bar dataKey="pottasium" name="Potassium (K)" fill="hsl(var(--chart-3))" />
                                </BarChart>
                            ) : (
                                // Single crop view with ideal ranges
                                <BarChart
                                    data={chartData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    barSize={60}
                                    layout="vertical"
                                >
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
                                    <XAxis type="number" />
                                    <YAxis type="category" dataKey="nutrient" width={100} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar dataKey="actual" name="Actual Level" fill={(entry) => entry.fill} />
                                    {chartData.map((entry, index) => (
                                        <ReferenceLine
                                            key={`min-${index}`}
                                            x={entry.idealMin}
                                            stroke="rgba(var(--chart-4-rgb), 0.7)"
                                            strokeDasharray="3 3"
                                            label={{ value: "Min", position: "insideBottomLeft", fill: "hsl(var(--muted-foreground))" }}
                                        />
                                    ))}
                                    {chartData.map((entry, index) => (
                                        <ReferenceLine
                                            key={`max-${index}`}
                                            x={entry.idealMax}
                                            stroke="rgba(var(--chart-4-rgb), 0.7)"
                                            strokeDasharray="3 3"
                                            label={{ value: "Max", position: "insideBottomRight", fill: "hsl(var(--muted-foreground))" }}
                                        />
                                    ))}
                                </BarChart>
                            )}
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
                    {balanceInsight ? (
                        <>
                            <TrendingUp className="h-4 w-4 text-primary" />
                            {balanceInsight}
                        </>
                    ) : (
                        <>
                            <TrendingUp className="h-4 w-4 text-primary" />
                            {selectedCrop === "all"
                                ? "Select a specific crop to see nutrient balance analysis"
                                : "Analyzing nutrient balance..."}
                        </>
                    )}
                </div>
                <div className="leading-none text-muted-foreground">
                    {selectedCrop === "all"
                        ? "Compare nutrient levels across different crops"
                        : "Optimal nutrient ranges vary by crop type and growth stage"}
                </div>
            </CardFooter>
        </Card>
    )
}

