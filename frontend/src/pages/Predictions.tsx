"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Cross1Icon, Pencil1Icon, PlusIcon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    FileSpreadsheet,
    MoreHorizontal,
    Eye,
    ArrowUpDown,
    Filter,
    X,
    BarChart3,
    Calendar,
    MapPin,
    Thermometer,
    Droplets,
    Ruler,
    Crop,
    Plus,
    CalendarIcon,
    ChevronDown,
} from "lucide-react"
import api from "@/config/api"
import ProfileForm from "./PredictionForm"
import "../Styles/animatioForm.css"
import PredictionResult from "@/pages/PredictionResult"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

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

interface SelectedPrediction {
    area: number
    city: string
    crop: string
    season: string
    id: number
}

interface YieldData {
    [key: string | number]: number
}

interface PredictionResultType {
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

interface ProfileInfoProps {
    setProfileInfo: (profileInfo: Prediction[]) => void
    isCreating?: boolean
    setIsCreating?: (value: boolean) => void
    currentPage?: number
    itemsPerPage?: number
    searchQuery?: string
}

const Predictions: React.FC<ProfileInfoProps> = ({
                                                     setProfileInfo,
                                                     isCreating = false,
                                                     setIsCreating,
                                                     currentPage = 1,
                                                     itemsPerPage = 10,
                                                     searchQuery: externalSearchQuery = "",
                                                 }) => {
    const [predictions, setPredictions] = useState<Prediction[]>([])
    const [selectedPrediction, setSelectedPrediction] = useState<SelectedPrediction | null>(null)
    const [viewingPrediction, setViewingPrediction] = useState<Prediction | null>(null)
    const [isClosing, setIsClosing] = useState<boolean>(false)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [showResultPage, setShowResultPage] = useState<boolean>(false)
    const [predictionResult, setPredictionResult] = useState<PredictionResultType>()
    const [isClosingResult, setIsClosingResult] = useState<boolean>(false)
    const [searchQuery, setSearchQuery] = useState<string>(externalSearchQuery)
    const [filteredResult, setFilteredResult] = useState<Prediction[]>([])
    const [isCreatingLocal, setIsCreatingLocal] = useState<boolean>(false)
    const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false)
    const [sortColumn, setSortColumn] = useState<string>("date")
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
    const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
    const [openActionPopover, setOpenActionPopover] = useState<number | null>(null)
    const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false)
    const [isCropDropdownOpen, setIsCropDropdownOpen] = useState<boolean>(false)
    const [isCityDropdownOpen, setIsCityDropdownOpen] = useState<boolean>(false)

    // Filter states
    const [cropFilter, setCropFilter] = useState<string>("")
    const [cityFilter, setCityFilter] = useState<string>("")
    const [dateFilter, setDateFilter] = useState<string>("")
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

    // Sync with parent component's isCreating state
    useEffect(() => {
        if (isCreating && setIsCreating) {
            setIsCreatingLocal(true)
        }
    }, [isCreating, setIsCreating])

    const showUpdateForm = (prediction: SelectedPrediction) => {
        setSelectedPrediction(prediction)
        setIsClosing(false)
    }

    const showCreateForm = () => {
        setIsCreatingLocal(true)
        setIsClosing(false)
    }

    const closeForm = () => {
        setIsClosing(true)
        setTimeout(() => {
            setSelectedPrediction(null)
            setIsCreatingLocal(false)
            if (setIsCreating) setIsCreating(false)
            setIsClosing(false)
        }, 500)
    }

    const closeResultPage = () => {
        setIsClosingResult(true)
        setTimeout(() => {
            setShowResultPage(false)
            setIsClosingResult(false)
        }, 500)
    }

    const fetchPredictions = async () => {
        try {
            const response = await api.get("/api/predictions/my-predictions", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("jwt")}`,
                },
            })
            setPredictions(response.data)
        } catch (error) {
            console.error("error fetching predictions", error)
        }
    }

    const deletePrediction = async (id: number) => {
        try {
            setDeletingId(id)
            setTimeout(async () => {
                await api.delete<void>(`api/predictions/delete/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
                    },
                })
                await fetchPredictions()
                setDeletingId(null)
                console.log("Deleted successfully:")
            }, 500)
        } catch (error) {
            console.error("Error deleting prediction:", error)
        }
    }

    useEffect(() => {
        fetchPredictions()
    }, [])

    useEffect(() => {
        let filtered = [...predictions]

        // Apply search query
        if (searchQuery) {
            filtered = filtered.filter(
                (prediction) =>
                    prediction.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    prediction.crop.toLowerCase().includes(searchQuery.toLowerCase()),
            )
        }

        // Apply crop filter
        if (cropFilter && cropFilter !== "all") {
            filtered = filtered.filter((prediction) => prediction.crop.toLowerCase().includes(cropFilter.toLowerCase()))
        }

        // Apply city filter
        if (cityFilter && cityFilter !== "all") {
            filtered = filtered.filter((prediction) => prediction.city.toLowerCase().includes(cityFilter.toLowerCase()))
        }

        // Apply date filter
        if (dateFilter) {
            const filterDate = new Date(dateFilter).getTime()
            filtered = filtered.filter((prediction) => {
                const predictionDate = new Date(prediction.date)
                return predictionDate.toDateString() === new Date(filterDate).toDateString()
            })
        }

        setFilteredResult(filtered)
        setProfileInfo(filtered)
    }, [searchQuery, predictions, cropFilter, cityFilter, dateFilter, setProfileInfo])

    // Format date from timestamp
    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp)
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    }

    // Get yield status badge
    const getYieldStatus = (yield_: number) => {
        if (yield_ > 80)
            return { label: "Excellent", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" }
        if (yield_ > 60) return { label: "Good", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" }
        if (yield_ > 40)
            return { label: "Average", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" }
        return { label: "Low", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" }
    }

    const viewPredictionDetails = (prediction: Prediction) => {
        setViewingPrediction(prediction)
        setIsViewDialogOpen(true)
    }

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortColumn(column)
            setSortDirection("asc")
        }
    }

    // Get unique crops for filter
    const uniqueCrops = [...new Set(predictions.map((p) => p.crop))].sort()

    // Get unique cities for filter
    const uniqueCities = [...new Set(predictions.map((p) => p.city))].sort()

    // Reset filters
    const resetFilters = () => {
        setCropFilter("")
        setCityFilter("")
        setDateFilter("")
        setSelectedDate(undefined)
        setIsFilterOpen(false) // Close the filter popover
    }

    // Handle crop filter change
    const handleCropFilterChange = (value: string) => {
        setCropFilter(value)
    }

    // Handle city filter change
    const handleCityFilterChange = (value: string) => {
        setCityFilter(value)
    }

    // Handle date selection
    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date)
        if (date) {
            setDateFilter(date.toISOString().split("T")[0])
        } else {
            setDateFilter("")
        }
        setIsDatePickerOpen(false)
    }

    // Sort the filtered results
    const sortedResults = [...filteredResult].sort((a, b) => {
        const aValue = a[sortColumn as keyof Prediction]
        const bValue = b[sortColumn as keyof Prediction]

        if (sortDirection === "asc") {
            return aValue > bValue ? 1 : -1
        } else {
            return aValue < bValue ? 1 : -1
        }
    })

    // Update local search when external search changes
    useEffect(() => {
        if (externalSearchQuery !== undefined) {
            setSearchQuery(externalSearchQuery)
        }
    }, [externalSearchQuery])

    return (
        <Card className="shadow-sm border-0 bg-background rounded-xl overflow-hidden">
            <CardHeader className="pb-3 flex flex-row items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
                <div>
                    <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-primary" />
                        <CardTitle>My Predictions</CardTitle>
                    </div>
                    <CardDescription>Manage and analyze your crop yield predictions</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-end mb-4">
                    <div className="flex gap-2">
                        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="icon" className="rounded-full h-9 w-9">
                                    <Filter className="h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-80">
                                <div className="space-y-4">
                                    <h4 className="font-medium">Filter Predictions</h4>

                                    <div className="space-y-2">
                                        <Label htmlFor="crop-filter">Crop</Label>
                                        <Popover open={isCropDropdownOpen} onOpenChange={setIsCropDropdownOpen}>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-between">
                                                    {cropFilter ? (cropFilter === "all" ? "All Crops" : cropFilter) : "Select crop"}
                                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent align="start" className="w-full p-0">
                                                <div className="space-y-1 p-2">
                                                    <button
                                                        onClick={() => {
                                                            setCropFilter("all")
                                                            setIsCropDropdownOpen(false)
                                                        }}
                                                        className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-muted"
                                                    >
                                                        All Crops
                                                    </button>
                                                    {uniqueCrops.map((crop) => (
                                                        <button
                                                            key={crop}
                                                            onClick={() => {
                                                                setCropFilter(crop)
                                                                setIsCropDropdownOpen(false)
                                                            }}
                                                            className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-muted"
                                                        >
                                                            {crop}
                                                        </button>
                                                    ))}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="city-filter">City</Label>
                                        <Popover open={isCityDropdownOpen} onOpenChange={setIsCityDropdownOpen}>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-between">
                                                    {cityFilter ? (cityFilter === "all" ? "All Cities" : cityFilter) : "Select city"}
                                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent align="start" className="w-full p-0">
                                                <div className="space-y-1 p-2">
                                                    <button
                                                        onClick={() => {
                                                            setCityFilter("all")
                                                            setIsCityDropdownOpen(false)
                                                        }}
                                                        className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-muted"
                                                    >
                                                        All Cities
                                                    </button>
                                                    {uniqueCities.map((city) => (
                                                        <button
                                                            key={city}
                                                            onClick={() => {
                                                                setCityFilter(city)
                                                                setIsCityDropdownOpen(false)
                                                            }}
                                                            className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-muted"
                                                        >
                                                            {city}
                                                        </button>
                                                    ))}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="date-filter">Date</Label>
                                        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start text-left font-normal"
                                                    id="date-filter"
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <CalendarComponent
                                                    mode="single"
                                                    selected={selectedDate}
                                                    onSelect={handleDateSelect}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="flex justify-between pt-2">
                                        <Button variant="outline" size="sm" onClick={resetFilters}>
                                            Reset
                                        </Button>
                                        <Button size="sm" onClick={() => setIsFilterOpen(false)}>
                                            Apply Filters
                                        </Button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>

                        <Button
                            onClick={showCreateForm}
                            size="icon"
                            className="rounded-full h-9 w-9 bg-primary hover:bg-primary/90"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="rounded-lg border overflow-hidden bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/40">
                                <TableHead className="w-[120px] font-medium">
                                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort("date")}>
                                        Date
                                        <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                    </div>
                                </TableHead>
                                <TableHead className="font-medium">
                                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort("crop")}>
                                        Crop
                                        <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                    </div>
                                </TableHead>
                                <TableHead className="font-medium">City</TableHead>
                                <TableHead className="font-medium">Temperature</TableHead>
                                <TableHead className="font-medium">Humidity</TableHead>
                                <TableHead className="font-medium">Rainfall</TableHead>
                                <TableHead className="font-medium">Area</TableHead>
                                <TableHead className="font-medium">
                                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort("result")}>
                                        Yield
                                        <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                    </div>
                                </TableHead>
                                <TableHead className="w-[80px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedResults.length > 0 ? (
                                sortedResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((prediction) => {
                                    const yieldStatus = getYieldStatus(prediction.result)
                                    return (
                                        <TableRow
                                            key={prediction.id}
                                            className={`${prediction.id === deletingId ? "deleteFade" : ""} hover:bg-muted/5`}
                                        >
                                            <TableCell className="font-medium">{formatDate(prediction.date)}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className="bg-primary/5 hover:bg-primary/10 text-primary border-primary/20"
                                                >
                                                    {prediction.crop}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{prediction.city}</TableCell>
                                            <TableCell>{prediction.temperature}°C</TableCell>
                                            <TableCell>{prediction.humidity}%</TableCell>
                                            <TableCell>{prediction.rainfall} mm</TableCell>
                                            <TableCell>{prediction.area} ha</TableCell>
                                            <TableCell>
                                                <Badge className={yieldStatus.color}>
                                                    {prediction.result} ({yieldStatus.label})
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Popover
                                                    open={openActionPopover === prediction.id}
                                                    onOpenChange={(open) => setOpenActionPopover(open ? prediction.id : null)}
                                                >
                                                    <PopoverTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent align="end" className="w-48">
                                                        <div className="space-y-2">
                                                            <button
                                                                onClick={() => {
                                                                    viewPredictionDetails(prediction)
                                                                    setOpenActionPopover(null)
                                                                }}
                                                                className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-muted"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                                View Details
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    showUpdateForm({
                                                                        area: prediction.area,
                                                                        crop: prediction.crop,
                                                                        city: prediction.city,
                                                                        season: "Kharif",
                                                                        id: prediction.id,
                                                                    })
                                                                    setOpenActionPopover(null)
                                                                }}
                                                                className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-muted"
                                                            >
                                                                <Pencil1Icon className="h-4 w-4" />
                                                                Edit
                                                            </button>
                                                            <div className="h-px bg-border my-1"></div>
                                                            <button
                                                                onClick={() => {
                                                                    deletePrediction(prediction.id)
                                                                    setOpenActionPopover(null)
                                                                }}
                                                                className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-muted text-destructive"
                                                            >
                                                                <Cross1Icon className="h-4 w-4" />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-24 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                            <FileSpreadsheet className="h-8 w-8 opacity-40" />
                                            <p>No predictions found</p>
                                            <Button variant="outline" size="sm" onClick={showCreateForm} className="mt-2">
                                                <PlusIcon className="h-4 w-4 mr-1" />
                                                Add your first prediction
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            {/* Modern Form Modal */}
            {(selectedPrediction || isCreatingLocal || isCreating) && (
                <div className="modal-overlay">
                    <div className={`modal-content ${isClosing ? "slide-out" : ""}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">
                                {isCreatingLocal || isCreating ? "New Prediction" : "Edit Prediction"}
                            </h2>
                            <Button variant="ghost" size="icon" className="rounded-full" onClick={closeForm}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <ProfileForm
                            initialData={selectedPrediction || undefined}
                            fetchPredictions={fetchPredictions}
                            closeForm={closeForm}
                            setShowResultPage={setShowResultPage}
                            setPredictionResult={setPredictionResult}
                        />
                    </div>
                </div>
            )}

            {/* Modern Result Modal */}
            {showResultPage && (
                <div className="modal-overlayResult">
                    <div className={`modal-contentResult ${isClosingResult ? "slide-out" : ""}`}>
                        <PredictionResult predictionResult={predictionResult} closeResultPage={closeResultPage} />
                    </div>
                </div>
            )}

            {/* Modern View Details Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
                    <DialogHeader className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Crop className="h-5 w-5 text-primary" />
                            <DialogTitle>Prediction Details</DialogTitle>
                        </div>
                        <DialogDescription>Detailed information about your crop yield prediction</DialogDescription>
                    </DialogHeader>

                    {viewingPrediction && (
                        <div className="p-6">
                            <Tabs defaultValue="overview" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-6">
                                    <TabsTrigger value="overview">Overview</TabsTrigger>
                                    <TabsTrigger value="details">Details</TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5 p-4 rounded-lg bg-muted/30">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Crop className="h-4 w-4" />
                                                <span>Crop Type</span>
                                            </div>
                                            <div className="font-semibold text-lg">{viewingPrediction.crop}</div>
                                        </div>

                                        <div className="flex flex-col gap-1.5 p-4 rounded-lg bg-muted/30">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <BarChart3 className="h-4 w-4" />
                                                <span>Yield Result</span>
                                            </div>
                                            <div className="font-semibold text-lg">
                                                {viewingPrediction.result}
                                                <span className="ml-2 text-sm font-normal">
                          ({getYieldStatus(viewingPrediction.result).label})
                        </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5 p-4 rounded-lg bg-muted/30">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                <span>Date</span>
                                            </div>
                                            <div className="font-medium">{formatDate(viewingPrediction.date)}</div>
                                        </div>

                                        <div className="flex flex-col gap-1.5 p-4 rounded-lg bg-muted/30">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <MapPin className="h-4 w-4" />
                                                <span>Location</span>
                                            </div>
                                            <div className="font-medium">{viewingPrediction.city}</div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 p-4 rounded-lg border">
                                        <h3 className="font-medium">Yield Status</h3>
                                        <div className="w-full bg-muted/50 rounded-full h-2.5">
                                            <div
                                                className="bg-primary h-2.5 rounded-full"
                                                style={{ width: `${Math.min(viewingPrediction.result, 100)}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Low</span>
                                            <span>Average</span>
                                            <span>Good</span>
                                            <span>Excellent</span>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="details" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 p-3 rounded-lg border">
                                            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <Thermometer className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm text-muted-foreground">Temperature</div>
                                                <div className="font-medium">{viewingPrediction.temperature}°C</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 rounded-lg border">
                                            <div className="h-9 w-9 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600">
                                                <Droplets className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm text-muted-foreground">Humidity</div>
                                                <div className="font-medium">{viewingPrediction.humidity}%</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 rounded-lg border">
                                            <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                <Droplets className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm text-muted-foreground">Rainfall</div>
                                                <div className="font-medium">{viewingPrediction.rainfall} mm</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 rounded-lg border">
                                            <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                                <Ruler className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm text-muted-foreground">Area</div>
                                                <div className="font-medium">{viewingPrediction.area} ha</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 p-4 rounded-lg bg-muted/30">
                                        <h3 className="font-medium mb-2">Prediction Summary</h3>
                                        <p className="text-sm text-muted-foreground">
                                            This prediction for {viewingPrediction.crop} in {viewingPrediction.city} was made on{" "}
                                            {formatDate(viewingPrediction.date)}. With a temperature of {viewingPrediction.temperature}°C,
                                            humidity of {viewingPrediction.humidity}%, and rainfall of {viewingPrediction.rainfall} mm, the
                                            predicted yield is {viewingPrediction.result}, which is considered{" "}
                                            {getYieldStatus(viewingPrediction.result).label.toLowerCase()}.
                                        </p>
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <div className="flex justify-end gap-2 mt-6">
                                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                                    Close
                                </Button>
                                <Button
                                    onClick={() => {
                                        setIsViewDialogOpen(false)
                                        showUpdateForm({
                                            area: viewingPrediction.area,
                                            crop: viewingPrediction.crop,
                                            city: viewingPrediction.city,
                                            season: "Kharif",
                                            id: viewingPrediction.id,
                                        })
                                    }}
                                >
                                    Edit
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    )
}

export default Predictions
