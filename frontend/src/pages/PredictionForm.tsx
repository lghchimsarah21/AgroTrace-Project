"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState, useEffect } from "react"
import { Leaf, MapPin, Calendar, Ruler, Loader2, ArrowRight, Check, ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import api from "@/config/api"
import { cropOptions, seasonOptions, cityOptions } from "@/data/crop-prediction-data"
import { Cross1Icon } from "@radix-ui/react-icons"

const formSchema = z.object({
    area: z.number().positive().min(0, { message: "Must be a positive number." }),
    crop: z.string().refine((value) => cropOptions.includes(value), {
        message: "Please select a valid crop from the list.",
    }),
    city: z.string().refine((value) => cityOptions.includes(value), {
        message: "Please select a valid city from the list.",
    }),
    season: z.string().refine((value) => seasonOptions.includes(value), {
        message: "Please select a valid season from the list.",
    }),
})

interface YieldData {
    [key: string | number]: number
}

interface predictionResultType {
    id: number
    result: {
        humid_yield: YieldData
        humidity: number
        prediction: number
        rain_yield: YieldData
        rainfall: number
        season_yield: YieldData
        temp_yield: YieldData
        temperature: number
        year_yield: YieldData
    }
}

interface ProfileFormProps {
    initialData?: {
        area: number
        crop: string
        city: string
        season: string
        id: number
    }
    fetchPredictions: () => void
    closeForm: () => void
    setShowResultPage: (showResultPage: boolean) => void
    setPredictionResult: (predictionResult: predictionResultType) => void
}

function ProfileForm({
                         initialData,
                         fetchPredictions,
                         closeForm,
                         setShowResultPage,
                         setPredictionResult,
                     }: ProfileFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [openCity, setOpenCity] = useState(false)
    const [openSeason, setOpenSeason] = useState(false)
    const [openCrop, setOpenCrop] = useState(false)
    const [loadingProgress, setLoadingProgress] = useState(0)
    const [loadingStage, setLoadingStage] = useState("Initializing prediction model...")
    const [progressIntervalRef, setProgressIntervalRef] = useState<NodeJS.Timeout | null>(null)
    const [stageTimeoutRef, setStageTimeoutRef] = useState<NodeJS.Timeout | null>(null)

    // Add custom styles to handle z-index issues and loading animation
    useEffect(() => {
        // Check if the styles already exist to avoid duplicates
        if (document.getElementById("enhanced-dropdown-styles")) return

        // Create a style element
        const styleEl = document.createElement("style")
        styleEl.id = "enhanced-dropdown-styles"

        // Add the CSS rules
        styleEl.textContent = `
/* Fix z-index for Radix popover content */
[data-radix-popper-content-wrapper] {
  z-index: 1100 !important;
}

/* Loading overlay animation */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: transparent;
  padding: 24px;
  width: 280px;
}

.circle-container {
  position: relative;
  width: 100px;
  height: 100px;
  margin-bottom: 20px;
}

.circle {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid rgba(16, 185, 129, 0.2);
  border-top-color: #059669;
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.circle:nth-child(2) {
  border-width: 4px;
  width: 80%;
  height: 80%;
  top: 10%;
  left: 10%;
  border-top-color: #10b981;
  border-right-color: #10b981;
  animation-duration: 2s;
  animation-direction: reverse;
}

.circle:nth-child(3) {
  border-width: 2px;
  width: 60%;
  height: 60%;
  top: 20%;
  left: 20%;
  border-top-color: #34d399;
  border-left-color: #34d399;
  animation-duration: 1s;
}

.leaf-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #34d399;
  filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.5));
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.1); }
  100% { transform: translate(-50%, -50%) scale(1); }
}

.progress-container {
  width: 100%;
  height: 6px;
  background-color: rgba(16, 185, 129, 0.2);
  border-radius: 3px;
  margin-bottom: 12px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #10b981;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 14px;
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 4px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.loading-stage {
  font-size: 14px;
  color: #ffffff;
  text-align: center;
  margin-top: 8px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
`

        // Append the style element to the document head
        document.head.appendChild(styleEl)

        // Clean up on unmount
        return () => {
            const styleElement = document.getElementById("enhanced-dropdown-styles")
            if (styleElement) {
                styleElement.remove()
            }
        }
    }, [])

    // Handle loading progress and stages
    useEffect(() => {
        if (isSubmitting) {
            // Set up progress animation
            setLoadingProgress(0)
            setLoadingStage("Initializing prediction model...")

            // Simulate progress updates
            setProgressIntervalRef(
                setInterval(() => {
                    setLoadingProgress((prev) => {
                        const newProgress = prev + Math.random() * 4
                        return newProgress > 100 ? 100 : newProgress
                    })
                }, 150),
            )

            // Update loading stages
            const stages = [
                "Initializing prediction model...",
                "Analyzing soil nutrients...",
                "Processing climate conditions...",
                "Calculating plant development...",
                "Evaluating environmental factors...",
                "Generating yield predictions...",
                "Finalizing results...",
            ]

            stages.forEach((stage, index) => {
                setStageTimeoutRef(
                    setTimeout(
                        () => {
                            setLoadingStage(stage)
                        },
                        800 + index * 1000,
                    ),
                )
            })
        } else {
            // Clear intervals and timeouts when not submitting
            if (progressIntervalRef) {
                clearInterval(progressIntervalRef)
                setProgressIntervalRef(null)
            }

            if (stageTimeoutRef) {
                clearTimeout(stageTimeoutRef)
                setStageTimeoutRef(null)
            }
        }

        // Cleanup
        return () => {
            if (progressIntervalRef) {
                clearInterval(progressIntervalRef)
            }
            if (stageTimeoutRef) {
                clearTimeout(stageTimeoutRef)
            }
        }
    }, [isSubmitting])

    const updatePrediction = async (
        updatedData: z.infer<typeof formSchema>,
        fetchPredictions: () => void,
        closeForm: () => void,
    ) => {

        setIsSubmitting(true)
        try {
            const response = await api.post(
                "/api/predictions/predict",
                { formdata: updatedData },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
                    },
                },
            )
            console.log("Prediction updated successfully", response.data)
            fetchPredictions()
            closeForm()
            setPredictionResult(response.data)
            setShowResultPage(true)
        } catch (error) {
            console.error("Error updating prediction", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {

        await updatePrediction(values, fetchPredictions, closeForm)
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            area: 0,
            crop: "",
            city: "",
            season: "",
        },
    })

    return (
        <>
            <Cross1Icon className="absolute top-1 left-1 close-btn" onClick={closeForm} />
            <h2 className="title-form text-xl mb-4 text-right">New Prediction</h2>
            <Card className="w-full max-w-md mx-auto shadow-lg border-0 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-bold">Crop Prediction</CardTitle>
                    <CardDescription>Enter details to predict crop yield</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="form-input animationDelay3">
                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col space-y-2">
                                            <FormLabel className="text-left flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-primary" />
                                                City
                                            </FormLabel>
                                            <Popover open={openCity} onOpenChange={setOpenCity} modal={true}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            aria-expanded={openCity}
                                                            className={cn(
                                                                "w-full justify-between rounded-lg border-input/50 focus:border-primary",
                                                                !field.value && "text-muted-foreground",
                                                            )}
                                                        >
                                                            {field.value ? cityOptions.find((city) => city === field.value) : "Select city"}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className="p-0 w-full shadow-lg border border-border bg-background"
                                                    align="start"
                                                    sideOffset={5}
                                                >
                                                    <Command className="w-full border-none">
                                                        <CommandInput placeholder="Search city..." className="h-9" />
                                                        <CommandList className="max-h-[300px] overflow-y-auto">
                                                            <CommandEmpty>No city found.</CommandEmpty>
                                                            <CommandGroup>
                                                                {cityOptions.map((city) => (
                                                                    <CommandItem
                                                                        key={city}
                                                                        value={city}
                                                                        onSelect={() => {
                                                                            form.setValue("city", city, { shouldValidate: true })
                                                                            setOpenCity(false)
                                                                        }}
                                                                        className="flex items-center cursor-pointer hover:bg-muted"
                                                                    >
                                                                        {city}
                                                                        {city === field.value && <Check className="ml-auto h-4 w-4 text-primary" />}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="form-input animationDelay4">
                                <FormField
                                    control={form.control}
                                    name="season"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col space-y-2">
                                            <FormLabel className="text-left flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-primary" />
                                                Season
                                            </FormLabel>
                                            <Popover open={openSeason} onOpenChange={setOpenSeason} modal={true}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            aria-expanded={openSeason}
                                                            className={cn(
                                                                "w-full justify-between rounded-lg border-input/50 focus:border-primary",
                                                                !field.value && "text-muted-foreground",
                                                            )}
                                                        >
                                                            {field.value ? seasonOptions.find((season) => season === field.value) : "Select season"}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className="p-0 w-full shadow-lg border border-border bg-background"
                                                    align="start"
                                                    sideOffset={5}
                                                >
                                                    <Command className="w-full border-none">
                                                        <CommandInput placeholder="Search season..." className="h-9" />
                                                        <CommandList>
                                                            <CommandEmpty>No season found.</CommandEmpty>
                                                            <CommandGroup>
                                                                {seasonOptions.map((season) => (
                                                                    <CommandItem
                                                                        key={season}
                                                                        value={season}
                                                                        onSelect={() => {
                                                                            form.setValue("season", season, { shouldValidate: true })
                                                                            setOpenSeason(false)
                                                                        }}
                                                                        className="flex items-center cursor-pointer hover:bg-muted"
                                                                    >
                                                                        {season}
                                                                        {season === field.value && <Check className="ml-auto h-4 w-4 text-primary" />}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="form-input animationDelay5">
                                <FormField
                                    control={form.control}
                                    name="area"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col space-y-2">
                                            <FormLabel className="text-left flex items-center gap-2">
                                                <Ruler className="h-4 w-4 text-primary" />
                                                Area (hectares)
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                        placeholder="Enter area size"
                                                        className="rounded-lg border-input/50 focus:border-primary"
                                                        min="0"
                                                        step="0.1"
                                                    />
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                                <div className="text-xs text-muted-foreground">ha</div>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Hectares</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="form-input animationDelay7">
                                <FormField
                                    control={form.control}
                                    name="crop"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col space-y-2">
                                            <FormLabel className="text-left flex items-center gap-2">
                                                <Leaf className="h-4 w-4 text-primary" />
                                                Crop
                                            </FormLabel>
                                            <Popover open={openCrop} onOpenChange={setOpenCrop} modal={true}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            aria-expanded={openCrop}
                                                            className={cn(
                                                                "w-full justify-between rounded-lg border-input/50 focus:border-primary",
                                                                !field.value && "text-muted-foreground",
                                                            )}
                                                        >
                                                            {field.value ? cropOptions.find((crop) => crop === field.value) : "Select crop"}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className="p-0 w-full shadow-lg border border-border bg-background"
                                                    align="start"
                                                    sideOffset={5}
                                                >
                                                    <Command className="w-full border-none">
                                                        <CommandInput placeholder="Search crop..." className="h-9" />
                                                        <CommandList className="max-h-[300px] overflow-y-auto">
                                                            <CommandEmpty>No crop found.</CommandEmpty>
                                                            <CommandGroup>
                                                                {cropOptions.map((crop) => (
                                                                    <CommandItem
                                                                        key={crop}
                                                                        value={crop}
                                                                        onSelect={() => {
                                                                            form.setValue("crop", crop, { shouldValidate: true })
                                                                            setOpenCrop(false)
                                                                        }}
                                                                        className="flex items-center cursor-pointer hover:bg-muted"
                                                                    >
                                                                        {crop}
                                                                        {crop === field.value && <Check className="ml-auto h-4 w-4 text-primary" />}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button
                                className="button-form w-full mt-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:gap-3"
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Processing
                                    </>
                                ) : (
                                    <>
                                        Get Prediction
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Modern Loading Overlay with Clean Layout - No Background */}
            {isSubmitting && (
                <div className="loading-overlay">
                    <div className="loading-container">
                        <div className="circle-container">
                            <div className="circle"></div>
                            <div className="circle"></div>
                            <div className="circle"></div>
                            <Leaf className="leaf-icon h-10 w-10" />
                        </div>

                        <div className="progress-text">
                            <span className="text-emerald-400">{Math.round(loadingProgress)}%</span> Complete
                        </div>

                        <div className="progress-container">
                            <div className="progress-bar" style={{ width: `${Math.round(loadingProgress)}%` }} />
                        </div>

                        <div className="loading-stage">{loadingStage}</div>
                    </div>
                </div>
            )}
        </>
    )
}

export default ProfileForm

