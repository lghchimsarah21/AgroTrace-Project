"use client"

import { TrendingUp, MapPin } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

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

interface CityConfig {
    label: string
    color: string
}

export function BarChartComponent({ profileInfo }: ProfileInfoProps) {
    const cityCount = new Map()

    profileInfo?.forEach(({ city, result }) => {
        cityCount.set(city, (cityCount.get(city) || 0) + result)
    })

    // Convert the Map to an array of [city, count] pairs
    const topCities = Array.from(cityCount.entries())
        .sort((a, b) => b[1] - a[1]) // Sort by frequency in descending order
        .slice(0, 5) // Get top 5 cities

    const chartConfig: { [key: string]: CityConfig } = {
        city1: {
            label: topCities[0]?.[0],
            color: "hsl(var(--chart-1))",
        },
        city2: {
            label: topCities[1]?.[0],
            color: "hsl(var(--chart-2))",
        },
        city3: {
            label: topCities[2]?.[0],
            color: "hsl(var(--chart-3))",
        },
        city4: {
            label: topCities[3]?.[0],
            color: "hsl(var(--chart-4))",
        },
        city5: {
            label: topCities[4]?.[0],
            color: "hsl(var(--chart-5))",
        },
    } satisfies ChartConfig

    const chartData = topCities.map(([city, result], index) => ({
        city,
        result,
        fill: chartConfig[`city${index + 1}`]?.color || "hsl(var(--chart-1))",
    }))

    return (
        <Card className="h-full flex flex-col shadow-sm w-full card-full-width">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <CardTitle>City Results</CardTitle>
                </div>
                <CardDescription>January - June 2024</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer config={chartConfig} className="h-[300px]">
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            top: 20,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="city"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Bar dataKey="result" fill="var(--color-city1)" radius={8}>
                            <LabelList position="top" offset={12} className="fill-foreground" fontSize={12} />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm pt-4">
                <div className="flex items-center gap-2 font-medium leading-none">
                    {topCities[0]?.[0] && (
                        <>
                            City with the highest result: {topCities[0]?.[0]}
                            <TrendingUp className="h-4 w-4 text-primary" />
                        </>
                    )}
                </div>
                <div className="leading-none text-muted-foreground">Showing the sums of results by city</div>
            </CardFooter>
        </Card>
    )
}

