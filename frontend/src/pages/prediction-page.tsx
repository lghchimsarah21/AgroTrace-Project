"use client"

import { useState, useRef, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"
import {
    Leaf,
    MapPin,
    Calendar,
    Ruler,
    Loader2,
    Check,
    ChevronsUpDown,
    ChevronLeft,
    Sparkles,
    ArrowLeftCircle,
    ArrowRightCircle,
    CloudRain,
    Thermometer,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import api from "@/config/api"
import { cropOptions, seasonOptions, cityOptions } from "@/data/crop-prediction-data"
import LoadingOverlay from "@/components/loading-overlay"

import PredictionResults from "./prediction-results"
import PagesNavbar from "@/pages/pagesNavbar.tsx";

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

// Form steps
const formSteps = [
    {
        id: "location",
        title: "Location & Season",
        description: "Tell us where and when you're planting",
        icon: <MapPin className="h-5 w-5" />,
        fields: ["city", "season"],
    },
    {
        id: "area",
        title: "Planting Area",
        description: "Specify your field size",
        icon: <Ruler className="h-5 w-5" />,
        fields: ["area"],
    },
    {
        id: "crop",
        title: "Crop Selection",
        description: "Choose your crop type",
        icon: <Leaf className="h-5 w-5" />,
        fields: ["crop"],
    },
    {
        id: "review",
        title: "Review & Submit",
        description: "Get your yield prediction",
        icon: <Sparkles className="h-5 w-5" />,
        fields: [],
    },
]

export default function CropPredictionPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [openCity, setOpenCity] = useState(false)
    const [openSeason, setOpenSeason] = useState(false)
    const [openCrop, setOpenCrop] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const [predictionResult, setPredictionResult] = useState<predictionResultType | null>(null)
    const [currentStep, setCurrentStep] = useState(0)
    const [formCompletion, setFormCompletion] = useState(0)
    const [showTip, setShowTip] = useState(false)
    const [tipIndex, setTipIndex] = useState(0)

    const formContainerRef = useRef<HTMLDivElement>(null)

    const tips = [
        "Different crops have different water requirements. Consider your local rainfall patterns.",
        "Temperature plays a crucial role in crop development and yield potential.",
        "Seasonal changes significantly impact crop growth cycles.",
        "The size of your planting area affects overall yield and resource management.",
        "Some crops are more suitable for certain regions due to climate and soil conditions.",
    ]

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            area: 0,
            crop: "",
            city: "",
            season: "",
        },
    })

    // Watch form values to calculate completion
    const formValues = form.watch()

    // Calculate form completion percentage
    useEffect(() => {
        let completed = 0
        const total = 4 // Total number of fields

        // Only count fields with actual values (not default values)
        if (formValues.city && formValues.city.trim() !== "") completed++
        if (formValues.season && formValues.season.trim() !== "") completed++
        if (formValues.area && formValues.area > 0) completed++
        if (formValues.crop && formValues.crop.trim() !== "") completed++

        setFormCompletion(Math.round((completed / total) * 100))
    }, [formValues])

    // Rotate tips
    useEffect(() => {
        const interval = setInterval(() => {
            if (showTip) {
                setShowTip(false)
                setTimeout(() => {
                    setTipIndex((prev) => (prev + 1) % tips.length)
                    setShowTip(true)
                }, 500)
            } else {
                setTipIndex((prev) => (prev + 1) % tips.length)
                setShowTip(true)
            }
        }, 8000)

        return () => clearInterval(interval)
    }, [showTip, tips.length])

    // Show initial tip
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowTip(true)
        }, 2000)

        return () => clearTimeout(timer)
    }, [])

    // Add custom scrollbar styles
    useEffect(() => {
        // Check if the styles already exist to avoid duplicates
        if (document.getElementById("custom-scrollbar-styles")) return

        // Create a style element
        const styleEl = document.createElement("style")
        styleEl.id = "custom-scrollbar-styles"

        // Add the CSS rules for custom scrollbars
        styleEl.textContent = `
    /* Custom scrollbar styles */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    
    ::-webkit-scrollbar-track {
      background: rgba(16, 185, 129, 0.05);
      border-radius: 10px;
    }
    
    ::-webkit-scrollbar-thumb {
      background: rgba(16, 185, 129, 0.3);
      border-radius: 10px;
      transition: all 0.3s ease;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(16, 185, 129, 0.5);
    }
    
    /* Firefox scrollbar styles */
    * {
      scrollbar-width: thin;
      scrollbar-color: rgba(16, 185, 129, 0.3) rgba(16, 185, 129, 0.05);
    }
    
    /* Hide scrollbar when not in use, but keep functionality */
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `

        // Append the style element to the document head
        document.head.appendChild(styleEl)

        // Clean up on unmount
        return () => {
            const styleElement = document.getElementById("custom-scrollbar-styles")
            if (styleElement) {
                styleElement.remove()
            }
        }
    }, [])

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true)

        try {
            const response = await api.post(
                "/api/predictions/predict",
                { formdata: values },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
                    },
                },
            )
            console.log("Prediction generated successfully", response.data)
            setPredictionResult(response.data)
            setShowResults(true)
        } catch (error) {
            console.error("Error generating prediction", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleBackToForm = () => {
        setShowResults(false)
    }

    const nextStep = () => {
        if (currentStep < formSteps.length - 1) {
            setCurrentStep((prev) => prev + 1)
            formContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" })
        }
    }

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1)
            formContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" })
        }
    }

    // Check if current step is valid
    const isCurrentStepValid = () => {
        const currentFields = formSteps[currentStep].fields

        if (currentFields.length === 0) return true

        return currentFields.every((field) => {
            const value = form.getValues(field as any)
            if (field === "area") {
                return value !== undefined && value > 0
            }
            return value !== undefined && value !== ""
        })
    }

    // Check if form is complete
    const isFormComplete = () => {
        return formCompletion === 100
    }

    if (showResults && predictionResult) {
        return <PredictionResults predictionResult={predictionResult} goBack={handleBackToForm} />
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/90 overflow-hidden">
            {/* Add the Navbar component */}
            <PagesNavbar />

            {/* Animated background elements */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(74,222,128,0.1),transparent_70%)]"></div>
                <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(74,222,128,0.08),transparent_70%)]"></div>

                {/* Animated circles */}
                <motion.div
                    className="absolute top-[10%] right-[15%] w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="absolute bottom-[20%] left-[10%] w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.4, 0.2, 0.4],
                    }}
                    transition={{
                        duration: 18,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                    }}
                />

                {/* Floating elements */}
                {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-emerald-500/10"
                        style={{
                            width: Math.random() * 10 + 5,
                            height: Math.random() * 10 + 5,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            x: [0, Math.random() * 20 - 10, 0],
                            opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{
                            duration: Math.random() * 10 + 15,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                            delay: Math.random() * 5,
                        }}
                    />
                ))}
            </div>

            <div className="container mx-auto py-8 px-4 relative">
                {/* Back button */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <Button
                        variant="ghost"
                        className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => window.history.back()}
                    >
                        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        <span>Back</span>
                    </Button>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left column - Form */}
                    <motion.div
                        className="lg:col-span-8 relative"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* Form header */}
                        <div className="mb-8">
                            <motion.div
                                className="flex items-center gap-3 mb-3"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-md"></div>
                                    <div className="relative bg-emerald-100 dark:bg-emerald-900/40 p-2 rounded-full">
                                        <Leaf className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                </div>
                                <h1 className="text-3xl font-bold">Crop Yield Prediction</h1>
                            </motion.div>

                            <motion.p
                                className="text-muted-foreground max-w-2xl"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                Our AI-powered system analyzes your inputs to predict crop yields based on location, season, and field
                                size.
                            </motion.p>
                        </div>

                        {/* Main form card */}
                        <div className="relative">
                            {/* Progress indicator */}
                            <motion.div
                                className="absolute -top-3 left-0 right-0 h-1.5 bg-muted rounded-full overflow-hidden z-10"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                <motion.div
                                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500"
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${formCompletion}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                />
                            </motion.div>

                            <Card className="overflow-hidden border bg-card/60 backdrop-blur-sm">
                                <div className="p-6 overflow-hidden">
                                    {/* Form steps navigation */}
                                    <div className="flex items-center justify-between mb-8 overflow-hidden pb-2">
                                        <div className="flex w-full justify-between overflow-x-visible">
                                            {formSteps.map((step, index) => (
                                                <motion.button
                                                    key={step.id}
                                                    type="button"
                                                    onClick={() => setCurrentStep(index)}
                                                    className={cn(
                                                        "flex flex-col items-center min-w-[80px] px-2 py-1 rounded-lg transition-all relative",
                                                        currentStep === index
                                                            ? "text-foreground"
                                                            : "text-muted-foreground hover:text-foreground/80",
                                                    )}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.4, delay: 0.1 * index }}
                                                >
                                                    <div
                                                        className={cn(
                                                            "flex items-center justify-center w-10 h-10 rounded-full mb-1 transition-all",
                                                            currentStep === index
                                                                ? "bg-primary text-primary-foreground"
                                                                : "bg-muted text-muted-foreground",
                                                        )}
                                                    >
                                                        {step.icon}
                                                    </div>
                                                    <span className="text-xs font-medium">{step.title}</span>

                                                    {/* Active indicator */}
                                                    {currentStep === index && (
                                                        <motion.div
                                                            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                                                            layoutId="activeStep"
                                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                        />
                                                    )}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Form content */}
                                    <div
                                        ref={formContainerRef}
                                        className="overflow-y-auto max-h-[calc(100vh-300px)] pr-2"
                                        style={{
                                            overflowX: "hidden",
                                            width: "100%",
                                            position: "relative",
                                        }}
                                    >
                                        <Form {...form}>
                                            <form
                                                onSubmit={(e) => {
                                                    // Always prevent default form submission behavior
                                                    e.preventDefault()

                                                    // Only manually trigger form submission when the submit button is clicked
                                                    if (e.nativeEvent.submitter?.getAttribute("type") === "submit") {
                                                        form.handleSubmit(onSubmit)(e)
                                                    }
                                                }}
                                            >
                                                <div className="w-full overflow-hidden">
                                                    <AnimatePresence initial={false}>
                                                        <motion.div
                                                            key={currentStep}
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="w-full"
                                                        >
                                                            {/* Step content */}
                                                            <div className="space-y-6 w-full">
                                                                <div className="mb-6">
                                                                    <h2 className="text-xl font-semibold mb-1">{formSteps[currentStep].title}</h2>
                                                                    <p className="text-muted-foreground text-sm">{formSteps[currentStep].description}</p>
                                                                </div>

                                                                {/* Step 1: Location & Season */}
                                                                {currentStep === 0 && (
                                                                    <div className="space-y-6">
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                            <FormField
                                                                                control={form.control}
                                                                                name="season"
                                                                                render={({ field }) => (
                                                                                    <FormItem className="space-y-3">
                                                                                        <FormLabel className="flex items-center gap-2">
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
                                                                                                            "w-full justify-between border-input/50 hover:bg-accent/50",
                                                                                                            !field.value && "text-muted-foreground",
                                                                                                            field.value && "border-primary/50 bg-primary/5",
                                                                                                        )}
                                                                                                    >
                                                                                                        {field.value
                                                                                                            ? seasonOptions.find((season) => season === field.value)
                                                                                                            : "Select season"}
                                                                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                                                    </Button>
                                                                                                </FormControl>
                                                                                            </PopoverTrigger>
                                                                                            <PopoverContent
                                                                                                className="p-0 w-full shadow-lg border border-border bg-card/95 backdrop-blur-sm"
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
                                                                                                                    className="flex items-center cursor-pointer hover:bg-accent"
                                                                                                                >
                                                                                                                    {season}
                                                                                                                    {season === field.value && (
                                                                                                                        <Check className="ml-auto h-4 w-4 text-primary" />
                                                                                                                    )}
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

                                                                            <FormField
                                                                                control={form.control}
                                                                                name="city"
                                                                                render={({ field }) => (
                                                                                    <FormItem className="space-y-3">
                                                                                        <FormLabel className="flex items-center gap-2">
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
                                                                                                            "w-full justify-between border-input/50 hover:bg-accent/50",
                                                                                                            !field.value && "text-muted-foreground",
                                                                                                            field.value && "border-primary/50 bg-primary/5",
                                                                                                        )}
                                                                                                    >
                                                                                                        {field.value
                                                                                                            ? cityOptions.find((city) => city === field.value)
                                                                                                            : "Select city"}
                                                                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                                                    </Button>
                                                                                                </FormControl>
                                                                                            </PopoverTrigger>
                                                                                            <PopoverContent
                                                                                                className="p-0 w-full shadow-lg border border-border bg-card/95 backdrop-blur-sm"
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
                                                                                                                    className="flex items-center cursor-pointer hover:bg-accent"
                                                                                                                >
                                                                                                                    {city}
                                                                                                                    {city === field.value && (
                                                                                                                        <Check className="ml-auto h-4 w-4 text-primary" />
                                                                                                                    )}
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

                                                                        <div className="pt-4">
                                                                            <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
                                                                                <div className="bg-primary/10 p-1.5 rounded-full mt-0.5">
                                                                                    <CloudRain className="h-4 w-4 text-primary" />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-sm font-medium mb-1">Why this matters</p>
                                                                                    <p className="text-sm text-muted-foreground">
                                                                                        Your location and the growing season significantly impact crop yields.
                                                                                        Different regions have unique climate patterns that affect crop development
                                                                                        and potential harvest quantities.
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Step 2: Area */}
                                                                {currentStep === 1 && (
                                                                    <div className="space-y-6">
                                                                        <FormField
                                                                            control={form.control}
                                                                            name="area"
                                                                            render={({ field }) => (
                                                                                <FormItem className="space-y-3">
                                                                                    <FormLabel className="flex items-center gap-2">
                                                                                        <Ruler className="h-4 w-4 text-primary" />
                                                                                        Area (hectares)
                                                                                    </FormLabel>
                                                                                    <FormControl>
                                                                                        <div className="space-y-4">
                                                                                            <div className="relative">
                                                                                                <Input
                                                                                                    {...field}
                                                                                                    type="number"
                                                                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                                                                    placeholder="Enter area size"
                                                                                                    className={cn(
                                                                                                        "rounded-lg border-input/50 focus:border-primary",
                                                                                                        field.value > 0 && "border-primary/50 bg-primary/5",
                                                                                                    )}
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

                                                                                            {/* Area visualization */}
                                                                                            {field.value > 0 && (
                                                                                                <motion.div
                                                                                                    className="pt-2"
                                                                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                                                    transition={{ duration: 0.3 }}
                                                                                                >
                                                                                                    <div className="relative h-20 w-full bg-muted/30 rounded-md overflow-hidden">
                                                                                                        <motion.div
                                                                                                            className="absolute bottom-0 left-0 right-0 bg-primary/20"
                                                                                                            initial={{ height: 0 }}
                                                                                                            animate={{
                                                                                                                height: `${Math.min(Math.max((field.value / 10) * 100, 10), 100)}%`,
                                                                                                            }}
                                                                                                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                                                                                        >
                                                                                                            <div className="absolute top-2 left-0 right-0 text-center text-sm font-medium">
                                                                                                                {field.value} hectares
                                                                                                            </div>
                                                                                                        </motion.div>
                                                                                                    </div>
                                                                                                </motion.div>
                                                                                            )}
                                                                                        </div>
                                                                                    </FormControl>
                                                                                    <FormMessage />
                                                                                </FormItem>
                                                                            )}
                                                                        />

                                                                        <div className="pt-4">
                                                                            <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
                                                                                <div className="bg-primary/10 p-1.5 rounded-full mt-0.5">
                                                                                    <Ruler className="h-4 w-4 text-primary" />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-sm font-medium mb-1">Understanding field size</p>
                                                                                    <p className="text-sm text-muted-foreground">
                                                                                        The size of your planting area directly affects total yield potential.
                                                                                        Larger areas may produce more overall yield but can also require more
                                                                                        resources to maintain optimal growing conditions.
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Step 3: Crop Selection */}
                                                                {currentStep === 2 && (
                                                                    <div className="space-y-6">
                                                                        <FormField
                                                                            control={form.control}
                                                                            name="crop"
                                                                            render={({ field }) => (
                                                                                <FormItem className="space-y-3">
                                                                                    <FormLabel className="flex items-center gap-2">
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
                                                                                                        "w-full justify-between border-input/50 hover:bg-accent/50",
                                                                                                        !field.value && "text-muted-foreground",
                                                                                                        field.value && "border-primary/50 bg-primary/5",
                                                                                                    )}
                                                                                                >
                                                                                                    {field.value
                                                                                                        ? cropOptions.find((crop) => crop === field.value)
                                                                                                        : "Select crop"}
                                                                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                                                </Button>
                                                                                            </FormControl>
                                                                                        </PopoverTrigger>
                                                                                        <PopoverContent
                                                                                            className="p-0 w-full shadow-lg border border-border bg-card/95 backdrop-blur-sm"
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
                                                                                                                className="flex items-center cursor-pointer hover:bg-accent"
                                                                                                            >
                                                                                                                {crop}
                                                                                                                {crop === field.value && (
                                                                                                                    <Check className="ml-auto h-4 w-4 text-primary" />
                                                                                                                )}
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

                                                                        <div className="pt-4">
                                                                            <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
                                                                                <div className="bg-primary/10 p-1.5 rounded-full mt-0.5">
                                                                                    <Thermometer className="h-4 w-4 text-primary" />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-sm font-medium mb-1">Crop selection matters</p>
                                                                                    <p className="text-sm text-muted-foreground">
                                                                                        Different crops have different requirements for optimal growth. Selecting
                                                                                        the right crop for your region, season, and field conditions is crucial for
                                                                                        maximizing yield potential.
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Step 4: Review & Submit */}
                                                                {currentStep === 3 && (
                                                                    <div className="space-y-6">
                                                                        <div className="bg-muted/30 rounded-lg p-6">
                                                                            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                                                                <Check className="h-5 w-5 text-primary" />
                                                                                Review Your Information
                                                                            </h3>

                                                                            <div className="space-y-4">
                                                                                <div className="grid grid-cols-2 gap-4">
                                                                                    <div className="space-y-1">
                                                                                        <p className="text-sm text-muted-foreground">City</p>
                                                                                        <p className="font-medium">{formValues.city || "Not specified"}</p>
                                                                                    </div>
                                                                                    <div className="space-y-1">
                                                                                        <p className="text-sm text-muted-foreground">Season</p>
                                                                                        <p className="font-medium">{formValues.season || "Not specified"}</p>
                                                                                    </div>
                                                                                    <div className="space-y-1">
                                                                                        <p className="text-sm text-muted-foreground">Area</p>
                                                                                        <p className="font-medium">{formValues.area || "Not specified"} hectares</p>
                                                                                    </div>
                                                                                    <div className="space-y-1">
                                                                                        <p className="text-sm text-muted-foreground">Crop</p>
                                                                                        <p className="font-medium">{formValues.crop || "Not specified"}</p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="pt-4">
                                                                            <div className="bg-primary/10 rounded-lg p-4 flex items-start gap-3">
                                                                                <div className="bg-primary/20 p-1.5 rounded-full mt-0.5">
                                                                                    <Sparkles className="h-4 w-4 text-primary" />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-sm font-medium mb-1">Ready for your prediction</p>
                                                                                    <p className="text-sm text-primary/80">
                                                                                        Our AI model will analyze your data and provide a personalized crop yield
                                                                                        prediction based on your specific conditions.
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    </AnimatePresence>
                                                </div>

                                                {/* Navigation buttons */}
                                                <div className="flex justify-between mt-8 pt-6 border-t">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={prevStep}
                                                        disabled={currentStep === 0}
                                                        className={cn("gap-2 transition-all", currentStep === 0 && "opacity-0 pointer-events-none")}
                                                    >
                                                        <ArrowLeftCircle className="h-4 w-4" />
                                                        Previous
                                                    </Button>

                                                    {currentStep < formSteps.length - 1 ? (
                                                        <Button type="button" onClick={nextStep} disabled={!isCurrentStepValid()} className="gap-2">
                                                            Next
                                                            <ArrowRightCircle className="h-4 w-4" />
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            onClick={() => {
                                                                if (isFormComplete()) {
                                                                    form.handleSubmit(onSubmit)()
                                                                }
                                                            }}
                                                            disabled={isSubmitting || !isFormComplete()}
                                                            className="gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md"
                                                        >
                                                            {isSubmitting ? (
                                                                <>
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                    Processing...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    Get Prediction
                                                                    <Sparkles className="h-4 w-4" />
                                                                </>
                                                            )}
                                                        </Button>
                                                    )}
                                                </div>
                                            </form>
                                        </Form>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </motion.div>

                    {/* Right column - Info panel */}
                    <motion.div
                        className="lg:col-span-4 relative"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <div className="sticky top-8">
                            {/* Completion card */}
                            <Card className="mb-6 overflow-hidden border bg-card/60 backdrop-blur-sm">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-medium">Form Completion</h3>
                                        <span className="text-lg font-bold text-primary">{formCompletion}%</span>
                                    </div>

                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500"
                                            initial={{ width: "0%" }}
                                            animate={{ width: `${formCompletion}%` }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                        />
                                    </div>

                                    <div className="mt-4 text-sm text-muted-foreground">
                                        {formCompletion < 100 ? (
                                            <p>Complete all fields to get your personalized crop yield prediction.</p>
                                        ) : (
                                            <p className="text-primary">All set! You can now submit your form.</p>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            {/* Tips card */}
                            <Card className="overflow-hidden border bg-card/60 backdrop-blur-sm">
                                <div className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-primary/10 p-2 rounded-full">
                                            <Leaf className="h-5 w-5 text-primary" />
                                        </div>
                                        <h3 className="font-medium">Crop Prediction Tips</h3>
                                    </div>

                                    <div className="min-h-[100px] flex items-center">
                                        <AnimatePresence mode="wait">
                                            {showTip && (
                                                <motion.div
                                                    key={tipIndex}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="bg-muted/50 p-4 rounded-lg"
                                                >
                                                    <p className="text-sm">{tips[tipIndex]}</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="flex justify-center mt-4">
                                        {tips.map((_, i) => (
                                            <button
                                                key={i}
                                                className={cn(
                                                    "w-2 h-2 rounded-full mx-1 transition-all",
                                                    tipIndex === i ? "bg-primary" : "bg-muted",
                                                )}
                                                onClick={() => {
                                                    setShowTip(false)
                                                    setTimeout(() => {
                                                        setTipIndex(i)
                                                        setShowTip(true)
                                                    }, 300)
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </Card>

                            {/* Visual element */}
                            <div className="mt-6 relative">
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-lg blur-xl"
                                    animate={{
                                        scale: [1, 1.05, 1],
                                        opacity: [0.5, 0.7, 0.5],
                                    }}
                                    transition={{
                                        duration: 8,
                                        repeat: Number.POSITIVE_INFINITY,
                                        ease: "easeInOut",
                                    }}
                                />
                                <Card className="overflow-hidden border bg-card/60 backdrop-blur-sm relative">
                                    <div className="p-6">
                                        <div className="flex flex-col items-center text-center">
                                            <CloudRain className="h-12 w-12 text-primary mb-4" />
                                            <h3 className="font-medium text-lg mb-2">Optimize Your Harvest</h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Our predictions help you understand expected yields based on your specific conditions, allowing
                                                for better planning and resource allocation.
                                            </p>
                                            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                                    <span>Better Planning</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
                                                    <span>Resource Optimization</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-3 h-3 rounded-full bg-emerald-700"></div>
                                                    <span>Higher Profits</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <LoadingOverlay isVisible={isSubmitting} message="Processing..." />
        </div>
    )
}

