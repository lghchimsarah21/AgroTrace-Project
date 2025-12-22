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
    FlaskRoundIcon as Flask,
    Loader2,
    Check,
    ChevronsUpDown,
    Droplets,
    ChevronLeft,
    Sprout,
    Sparkles,
    ArrowLeftCircle,
    ArrowRightCircle,
    Zap,
    Waves,
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
import { seasonOptions, cityOptions } from "@/data/crop-prediction-data"
import RecommendationResults from "./recommendation-results"
import LoadingOverlay from "@/components/loading-overlay"
import PagesNavbar from "./pagesNavbar.tsx"

// Update the formSchema to allow pH values from 0 to 14
const formSchema = z.object({
    nitrogen: z.number().positive().min(0, { message: "Must be a positive number." }),
    phosphorous: z.number().positive().min(0, { message: "Must be a positive number." }),
    pottasium: z.number().positive().min(0, { message: "Must be a positive number." }),
    ph: z.number().min(0, { message: "Must be a positive number." }).max(14, { message: "Maximum pH value is 14." }),
    city: z.string().refine((value) => cityOptions.includes(value), {
        message: "Please select a valid city from the list.",
    }),
    season: z.string().refine((value) => seasonOptions.includes(value), {
        message: "Please select a valid season from the list.",
    }),
})

interface RecommendationResultType {
    result: {
        chart_data: Record<string, number>
        humidity: number
        prediction: string[]
        rainfall: number
        temperature: number
    }
    id: number
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
        id: "ph",
        title: "pH Level",
        description: "Measure your soil's acidity",
        icon: <Droplets className="h-5 w-5" />,
        fields: ["ph"],
    },
    {
        id: "nutrients",
        title: "Soil Nutrients",
        description: "Enter your soil's nutrient levels",
        icon: <Flask className="h-5 w-5" />,
        fields: ["nitrogen", "phosphorous", "pottasium"],
    },
    {
        id: "review",
        title: "Review & Submit",
        description: "Get your personalized recommendations",
        icon: <Sparkles className="h-5 w-5" />,
        fields: [],
    },
]

export default function RecommendationPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [openCity, setOpenCity] = useState(false)
    const [openSeason, setOpenSeason] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const [recommendationResult, setRecommendationResult] = useState<RecommendationResultType | null>(null)
    const [currentStep, setCurrentStep] = useState(0)
    const [formCompletion, setFormCompletion] = useState(0)
    const [showTip, setShowTip] = useState(false)
    const [tipIndex, setTipIndex] = useState(0)

    const formContainerRef = useRef<HTMLDivElement>(null)

    const tips = [
        "Nitrogen is essential for leaf growth and green vegetation.",
        "Phosphorous helps with root development and flowering.",
        "Potassium improves overall plant health and disease resistance.",
        "Most crops prefer a pH between 6.0 and 7.0 for optimal nutrient absorption.",
        "Seasonal changes significantly impact crop growth and yield potential.",
    ]

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nitrogen: 0,
            phosphorous: 0,
            pottasium: 0,
            ph: 0,
            city: "",
            season: "",
        },
    })

    // Watch form values to calculate completion
    const formValues = form.watch()

    // Calculate form completion percentage
    useEffect(() => {
        let completed = 0
        const total = 6 // Total number of fields

        // Only count fields with actual values (not default values)
        if (formValues.city && formValues.city.trim() !== "") completed++
        if (formValues.season && formValues.season.trim() !== "") completed++
        if (formValues.ph && formValues.ph > 0) completed++
        if (formValues.nitrogen && formValues.nitrogen > 0) completed++
        if (formValues.phosphorous && formValues.phosphorous > 0) completed++
        if (formValues.pottasium && formValues.pottasium > 0) completed++

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
                "/api/recommendations/generate",
                { formdata: values },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
                    },
                },
            )
            console.log("Recommendation generated successfully", response.data)
            setRecommendationResult(response.data)
            setShowResults(true)
        } catch (error) {
            console.error("Error generating recommendation", error)
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
            return value !== undefined && value !== "" && value !== 0
        })
    }

    // Check if form is complete
    const isFormComplete = () => {
        return formCompletion === 100
    }

    if (showResults && recommendationResult) {
        return <RecommendationResults recommendationResult={recommendationResult} goBack={handleBackToForm} />
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
                                <h1 className="text-3xl font-bold">Crop Recommendation</h1>
                            </motion.div>

                            <motion.p
                                className="text-muted-foreground max-w-2xl"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                Our AI-powered system analyzes your soil parameters to recommend the most suitable crops for optimal
                                yield and sustainability.
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
                                                                                    <Sparkles className="h-4 w-4 text-primary" />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-sm font-medium mb-1">Why this matters</p>
                                                                                    <p className="text-sm text-muted-foreground">
                                                                                        Your location and the growing season significantly impact which crops will
                                                                                        thrive in your soil. Different regions have unique climate patterns that
                                                                                        affect crop development.
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Step 2: pH Level */}
                                                                {currentStep === 1 && (
                                                                    <div className="space-y-6">
                                                                        <FormField
                                                                            control={form.control}
                                                                            name="ph"
                                                                            render={({ field }) => (
                                                                                <FormItem className="space-y-3">
                                                                                    <FormLabel className="flex items-center gap-2">
                                                                                        <Droplets className="h-4 w-4 text-primary" />
                                                                                        pH Level
                                                                                    </FormLabel>
                                                                                    <FormControl>
                                                                                        <div className="space-y-4">
                                                                                            <div className="relative">
                                                                                                <Input
                                                                                                    {...field}
                                                                                                    type="number"
                                                                                                    onChange={(e) => {
                                                                                                        const value = Number(e.target.value)
                                                                                                        // Ensure value is between 0 and 14
                                                                                                        const validValue = Math.min(Math.max(value, 0), 14)
                                                                                                        field.onChange(validValue)
                                                                                                    }}
                                                                                                    placeholder="Enter pH level"
                                                                                                    className={cn(
                                                                                                        "rounded-lg border-input/50 focus:border-primary",
                                                                                                        field.value > 0 && "border-primary/50 bg-primary/5",
                                                                                                    )}
                                                                                                    min="0"
                                                                                                    max="14"
                                                                                                    step="0.1"
                                                                                                />
                                                                                                <TooltipProvider>
                                                                                                    <Tooltip>
                                                                                                        <TooltipTrigger className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                                                                            <div className="text-xs text-muted-foreground">pH</div>
                                                                                                        </TooltipTrigger>
                                                                                                        <TooltipContent>
                                                                                                            <p>pH level (5-14)</p>
                                                                                                        </TooltipContent>
                                                                                                    </Tooltip>
                                                                                                </TooltipProvider>
                                                                                            </div>

                                                                                            {/* pH Slider visualization */}
                                                                                            <div className="pt-2">
                                                                                                <div className="relative h-8 w-full">
                                                                                                    <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 to-blue-400 rounded-md opacity-20"></div>
                                                                                                    <div className="absolute inset-0 flex items-center justify-between px-2 text-xs font-medium">
                                                                                                        <span>Acidic (0)</span>
                                                                                                        <span>Neutral (7)</span>
                                                                                                        <span>Alkaline (14)</span>
                                                                                                    </div>

                                                                                                    {field.value > 0 && (
                                                                                                        <motion.div
                                                                                                            className="absolute top-0 w-1 h-8 bg-primary rounded-full"
                                                                                                            initial={{
                                                                                                                left:
                                                                                                                    field.value && field.value > 0
                                                                                                                        ? `${Math.min(Math.max(((field.value - 0) / 14) * 100, 0), 100)}%`
                                                                                                                        : "0%",
                                                                                                            }}
                                                                                                            animate={{
                                                                                                                left:
                                                                                                                    field.value && field.value > 0
                                                                                                                        ? `${Math.min(Math.max(((field.value - 0) / 14) * 100, 0), 100)}%`
                                                                                                                        : "0%",
                                                                                                            }}
                                                                                                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                                                                                        >
                                                                                                            <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-md">
                                                                                                                {field.value || 0}
                                                                                                            </div>
                                                                                                        </motion.div>
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </FormControl>
                                                                                    <FormMessage />
                                                                                </FormItem>
                                                                            )}
                                                                        />

                                                                        <div className="pt-4">
                                                                            <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
                                                                                <div className="bg-primary/10 p-1.5 rounded-full mt-0.5">
                                                                                    <Waves className="h-4 w-4 text-primary" />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-sm font-medium mb-1">Understanding pH levels</p>
                                                                                    <p className="text-sm text-muted-foreground">
                                                                                        Soil pH affects nutrient availability to plants. Most crops prefer slightly
                                                                                        acidic to neutral pH (6.0-7.0). Extremely acidic or alkaline soils may
                                                                                        require amendments for optimal crop growth.
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Step 3: Nutrients */}
                                                                {currentStep === 2 && (
                                                                    <div className="space-y-6">
                                                                        <div className="grid grid-cols-1 gap-6">
                                                                            <FormField
                                                                                control={form.control}
                                                                                name="nitrogen"
                                                                                render={({ field }) => (
                                                                                    <FormItem className="space-y-3">
                                                                                        <FormLabel className="flex items-center gap-2">
                                                                                            <Flask className="h-4 w-4 text-primary" />
                                                                                            Nitrogen (N)
                                                                                        </FormLabel>
                                                                                        <FormControl>
                                                                                            <div className="relative">
                                                                                                <Input
                                                                                                    {...field}
                                                                                                    type="number"
                                                                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                                                                    placeholder="Enter nitrogen level"
                                                                                                    className={cn(
                                                                                                        "rounded-lg border-input/50 focus:border-primary",
                                                                                                        field.value > 0 && "border-primary/50 bg-primary/5",
                                                                                                    )}
                                                                                                    min="0"
                                                                                                    step="1"
                                                                                                />
                                                                                                <TooltipProvider>
                                                                                                    <Tooltip>
                                                                                                        <TooltipTrigger className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                                                                            <div className="text-xs text-muted-foreground">N</div>
                                                                                                        </TooltipTrigger>
                                                                                                        <TooltipContent>
                                                                                                            <p>Nitrogen level (mg/kg)</p>
                                                                                                        </TooltipContent>
                                                                                                    </Tooltip>
                                                                                                </TooltipProvider>
                                                                                            </div>
                                                                                        </FormControl>
                                                                                        <FormMessage />
                                                                                        <p className="text-xs text-muted-foreground">
                                                                                            Essential for leaf growth and green vegetation
                                                                                        </p>
                                                                                    </FormItem>
                                                                                )}
                                                                            />

                                                                            <FormField
                                                                                control={form.control}
                                                                                name="phosphorous"
                                                                                render={({ field }) => (
                                                                                    <FormItem className="space-y-3">
                                                                                        <FormLabel className="flex items-center gap-2">
                                                                                            <Flask className="h-4 w-4 text-primary" />
                                                                                            Phosphorous (P)
                                                                                        </FormLabel>
                                                                                        <FormControl>
                                                                                            <div className="relative">
                                                                                                <Input
                                                                                                    {...field}
                                                                                                    type="number"
                                                                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                                                                    placeholder="Enter phosphorous level"
                                                                                                    className={cn(
                                                                                                        "rounded-lg border-input/50 focus:border-primary",
                                                                                                        field.value > 0 && "border-primary/50 bg-primary/5",
                                                                                                    )}
                                                                                                    min="0"
                                                                                                    step="1"
                                                                                                />
                                                                                                <TooltipProvider>
                                                                                                    <Tooltip>
                                                                                                        <TooltipTrigger className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                                                                            <div className="text-xs text-muted-foreground">P</div>
                                                                                                        </TooltipTrigger>
                                                                                                        <TooltipContent>
                                                                                                            <p>Phosphorous level (mg/kg)</p>
                                                                                                        </TooltipContent>
                                                                                                    </Tooltip>
                                                                                                </TooltipProvider>
                                                                                            </div>
                                                                                        </FormControl>
                                                                                        <FormMessage />
                                                                                        <p className="text-xs text-muted-foreground">
                                                                                            Important for root development and flowering
                                                                                        </p>
                                                                                    </FormItem>
                                                                                )}
                                                                            />

                                                                            <FormField
                                                                                control={form.control}
                                                                                name="pottasium"
                                                                                render={({ field }) => (
                                                                                    <FormItem className="space-y-3">
                                                                                        <FormLabel className="flex items-center gap-2">
                                                                                            <Flask className="h-4 w-4 text-primary" />
                                                                                            Potassium (K)
                                                                                        </FormLabel>
                                                                                        <FormControl>
                                                                                            <div className="relative">
                                                                                                <Input
                                                                                                    {...field}
                                                                                                    type="number"
                                                                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                                                                    placeholder="Enter potassium level"
                                                                                                    className={cn(
                                                                                                        "rounded-lg border-input/50 focus:border-primary",
                                                                                                        field.value > 0 && "border-primary/50 bg-primary/5",
                                                                                                    )}
                                                                                                    min="0"
                                                                                                    step="1"
                                                                                                />
                                                                                                <TooltipProvider>
                                                                                                    <Tooltip>
                                                                                                        <TooltipTrigger className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                                                                            <div className="text-xs text-muted-foreground">K</div>
                                                                                                        </TooltipTrigger>
                                                                                                        <TooltipContent>
                                                                                                            <p>Potassium level (mg/kg)</p>
                                                                                                        </TooltipContent>
                                                                                                    </Tooltip>
                                                                                                </TooltipProvider>
                                                                                            </div>
                                                                                        </FormControl>
                                                                                        <FormMessage />
                                                                                        <p className="text-xs text-muted-foreground">
                                                                                            Helps with overall plant health and disease resistance
                                                                                        </p>
                                                                                    </FormItem>
                                                                                )}
                                                                            />
                                                                        </div>

                                                                        <div className="pt-4">
                                                                            <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
                                                                                <div className="bg-primary/10 p-1.5 rounded-full mt-0.5">
                                                                                    <Zap className="h-4 w-4 text-primary" />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-sm font-medium mb-1">Nutrient balance is key</p>
                                                                                    <p className="text-sm text-muted-foreground">
                                                                                        The balance between nitrogen, phosphorous, and potassium (NPK) is crucial
                                                                                        for healthy plant growth. Different crops require different nutrient ratios
                                                                                        for optimal development.
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
                                                                                        <p className="text-sm text-muted-foreground">pH Level</p>
                                                                                        <p className="font-medium">{formValues.ph || "Not specified"}</p>
                                                                                    </div>
                                                                                    <div className="space-y-1">
                                                                                        <p className="text-sm text-muted-foreground">Nitrogen (N)</p>
                                                                                        <p className="font-medium">
                                                                                            {formValues.nitrogen || "Not specified"} mg/kg
                                                                                        </p>
                                                                                    </div>
                                                                                    <div className="space-y-1">
                                                                                        <p className="text-sm text-muted-foreground">Phosphorous (P)</p>
                                                                                        <p className="font-medium">
                                                                                            {formValues.phosphorous || "Not specified"} mg/kg
                                                                                        </p>
                                                                                    </div>
                                                                                    <div className="space-y-1">
                                                                                        <p className="text-sm text-muted-foreground">Potassium (K)</p>
                                                                                        <p className="font-medium">
                                                                                            {formValues.pottasium || "Not specified"} mg/kg
                                                                                        </p>
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
                                                                                    <p className="text-sm font-medium mb-1">Ready for your recommendations</p>
                                                                                    <p className="text-sm text-primary/80">
                                                                                        Our AI model will analyze your soil data and provide personalized crop
                                                                                        recommendations based on your specific conditions.
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
                                                                    Get Recommendations
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
                                            <p>Complete all fields to get your personalized crop recommendations.</p>
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
                                        <h3 className="font-medium">Crop Recommendation Tips</h3>
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
                                            <Sprout className="h-12 w-12 text-primary mb-4" />
                                            <h3 className="font-medium text-lg mb-2">Sustainable Farming</h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Our recommendations help you choose crops that are best suited for your soil, promoting
                                                sustainable farming practices and optimal yields.
                                            </p>
                                            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                                    <span>Higher Yields</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
                                                    <span>Less Resources</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-3 h-3 rounded-full bg-emerald-700"></div>
                                                    <span>Healthier Soil</span>
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

            <LoadingOverlay isVisible={isSubmitting} message="Analysing your recommendation..." />
        </div>
    )
}

