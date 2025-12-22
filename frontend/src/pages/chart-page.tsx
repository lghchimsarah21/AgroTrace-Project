"use client"

import { TrendingUp, Sprout } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface CropConfig {
    label: string
    color: string
}

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

interface ProfileInfoProps {
    profileInfo: Prediction[]
}

export default function ChartPage({ profileInfo }: ProfileInfoProps) {
    const cropCount = new Map()

    profileInfo?.forEach(({ crop }) => {
        cropCount.set(crop, (cropCount.get(crop) || 0) + 1)
    })

    // Convert the Map to an array of [crop, count] pairs
    const topCrops = Array.from(cropCount.entries())
        .sort((a, b) => b[1] - a[1]) // Sort by frequency in descending order
        .slice(0, 5) // Get top 5 crops

    const chartConfig: { [key: string]: CropConfig } = {
        crop1: {
            label: topCrops[0]?.[0],
            color: "hsl(var(--chart-1))",
        },
        crop2: {
            label: topCrops[1]?.[0],
            color: "hsl(var(--chart-2))",
        },
        crop3: {
            label: topCrops[2]?.[0],
            color: "hsl(var(--chart-3))",
        },
        crop4: {
            label: topCrops[3]?.[0],
            color: "hsl(var(--chart-4))",
        },
        crop5: {
            label: topCrops[4]?.[0],
            color: "hsl(var(--chart-5))",
        },
    } satisfies ChartConfig

    const chartData = topCrops.map(([crop, cropCount], index) => ({
        crop,
        cropCount,
        fill: chartConfig[`crop${index + 1}`]?.color || "hsl(var(--chart-1))",
    }))

    const totalPredictions = profileInfo?.length

    return (
        <Card className="h-full flex flex-col shadow-sm w-full card-full-width">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <Sprout className="h-5 w-5 text-primary" />
                    <CardTitle>Crop Predictions</CardTitle>
                </div>
                <CardDescription>January - June 2024</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer config={chartConfig} className="h-[300px]">
                    <PieChart>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Pie data={chartData} dataKey="cropCount" nameKey="crop" innerRadius={60} strokeWidth={5}>
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                                                    {totalPredictions}
                                                </tspan>
                                                <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                                                    Predictions
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm pt-4">
                <div className="flex items-center gap-2 font-medium leading-none">
                    {topCrops[0]?.[0] && (
                        <>
                            The most predicted crop is: {topCrops[0]?.[0]}
                            <TrendingUp className="h-4 w-4 text-primary" />
                        </>
                    )}
                </div>
                <div className="leading-none text-muted-foreground">Showing the top predicted crops</div>
            </CardFooter>
        </Card>
    )
}

