"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Cross1Icon, Pencil1Icon, PlusIcon } from "@radix-ui/react-icons"
import {
    MoreHorizontal,
    Eye,
    FlaskRoundIcon as Flask,
    ArrowUpDown,
    Filter,
    X,
    Calendar,
    MapPin,
    Thermometer,
    Droplets,
    Leaf,
    Gauge,
    Plus,
    CalendarIcon,
    ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import api from "@/config/api"
import "../Styles/animatioForm.css"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import RecommendationResult from "@/pages/RecommendationResult.tsx"
import RecommendationForm from "@/pages/RecommendationForm.tsx"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

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

interface SelectedRecommendation {
    nitrogen: number
    city: string
    phosphorous: number
    pottasium: number
    ph: number
    season: string
    id: number
}

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

interface ProfileInfoProps {
    setProfileInfo: (profileInfo: Recommendation[]) => void
    isCreating?: boolean
    setIsCreating?: (value: boolean) => void
    currentPage?: number
    itemsPerPage?: number
    searchQuery?: string
}

const Recommendations: React.FC<ProfileInfoProps> = ({
                                                         setProfileInfo,
                                                         isCreating = false,
                                                         setIsCreating,
                                                         currentPage = 1,
                                                         itemsPerPage = 10,
                                                         searchQuery: externalSearchQuery = "",
                                                     }) => {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([])
    const [selectedRecommendation, setSelectedRecommendation] = useState<SelectedRecommendation | null>(null)
    const [viewingRecommendation, setViewingRecommendation] = useState<Recommendation | null>(null)
    const [isClosing, setIsClosing] = useState<boolean>(false)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [showResultPage, setShowResultPage] = useState<boolean>(false)
    const [recommendationResult, setRecommendationResult] = useState<RecommendationResultType>()
    const [isClosingResult, setIsClosingResult] = useState<boolean>(false)
    const [searchQuery, setSearchQuery] = useState<string>(externalSearchQuery)
    const [filteredResult, setFilteredResult] = useState<Recommendation[]>([])
    const [isCreatingLocal, setIsCreatingLocal] = useState<boolean>(false)
    const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false)
    const [sortColumn, setSortColumn] = useState<string>("date")
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
    const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
    const [openActionPopover, setOpenActionPopover] = useState<number | null>(null)
    const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false)
    const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState<boolean>(false)
    const [isCityDropdownOpen, setIsCityDropdownOpen] = useState<boolean>(false)
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

    // Filter states
    const [seasonFilter, setSeasonFilter] = useState<string>("")
    const [cityFilter, setCityFilter] = useState<string>("")
    const [dateFilter, setDateFilter] = useState<string>("")

    // Sync with parent component's isCreating state
    useEffect(() => {
        if (isCreating && setIsCreating) {
            setIsCreatingLocal(true)
        }
    }, [isCreating, setIsCreating])

    const showUpdateForm = (recommendation: SelectedRecommendation) => {
        setSelectedRecommendation(recommendation)
        setIsClosing(false)
    }

    const showCreateForm = () => {
        setIsCreatingLocal(true)
        setIsClosing(false)
    }

    const closeForm = () => {
        setIsClosing(true)
        setTimeout(() => {
            setSelectedRecommendation(null)
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

    const fetchRecommendations = async () => {
        try {
            const response = await api.get("/api/recommendations/my-recommendations", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("jwt")}`,
                },
            })
            setRecommendations(response.data)
        } catch (error) {
            console.error("error fetching recommendations", error)
        }
    }

    const deleteRecommendation = async (id: number) => {
        try {
            setDeletingId(id)
            setTimeout(async () => {
                await api.delete<void>(`api/recommendations/delete/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
                    },
                })
                await fetchRecommendations()
                setDeletingId(null)
                console.log("Deleted successfully:")
            }, 500)
        } catch (error) {
            console.error("Error deleting recommendation:", error)
        }
    }

    useEffect(() => {
        fetchRecommendations()
    }, [])

    useEffect(() => {
        let filtered = [...recommendations]

        // Apply search query
        if (searchQuery) {
            filtered = filtered.filter(
                (recommendation) =>
                    recommendation.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    recommendation.result.toLowerCase().includes(searchQuery.toLowerCase()),
            )
        }

        // Apply season filter
        if (seasonFilter && seasonFilter !== "all") {
            filtered = filtered.filter((recommendation) => recommendation.season === seasonFilter)
        }

        // Apply city filter
        if (cityFilter && cityFilter !== "all") {
            filtered = filtered.filter((recommendation) =>
                recommendation.city.toLowerCase().includes(cityFilter.toLowerCase()),
            )
        }

        // Apply date filter
        if (dateFilter) {
            const filterDate = new Date(dateFilter).getTime()
            filtered = filtered.filter((recommendation) => {
                const recommendationDate = new Date(recommendation.date)
                return recommendationDate.toDateString() === new Date(filterDate).toDateString()
            })
        }

        setFilteredResult(filtered)
        setProfileInfo(filtered)
    }, [searchQuery, recommendations, seasonFilter, cityFilter, dateFilter, setProfileInfo])

    // Format date from timestamp
    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp)
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    }

    // Get season color
    const getSeasonColor = (season: string) => {
        const seasonColors: Record<string, string> = {
            Kharif: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
            Rabi: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
            Zaid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
            Summer: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
            Winter: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
            Monsoon: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
        }
        return seasonColors[season] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }

    const viewRecommendationDetails = (recommendation: Recommendation) => {
        setViewingRecommendation(recommendation)
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

    // Get unique seasons for filter
    const uniqueSeasons = [...new Set(recommendations.map((r) => r.season))].sort()

    // Get unique cities for filter
    const uniqueCities = [...new Set(recommendations.map((r) => r.city))].sort()

    // Reset filters
    const resetFilters = () => {
        setSeasonFilter("")
        setCityFilter("")
        setDateFilter("")
        setSelectedDate(undefined)
        setIsFilterOpen(false)
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
        const aValue = a[sortColumn as keyof Recommendation]
        const bValue = b[sortColumn as keyof Recommendation]

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
                        <Flask className="h-5 w-5 text-primary" />
                        <CardTitle>My Recommendations</CardTitle>
                    </div>
                    <CardDescription>Manage and analyze your crop recommendations</CardDescription>
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
                                    <h4 className="font-medium">Filter Recommendations</h4>

                                    <div className="space-y-2">
                                        <Label htmlFor="season-filter">Season</Label>
                                        <Popover open={isSeasonDropdownOpen} onOpenChange={setIsSeasonDropdownOpen}>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-between">
                                                    {seasonFilter ? (seasonFilter === "all" ? "All Seasons" : seasonFilter) : "Select season"}
                                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent align="start" className="w-full p-0">
                                                <div className="space-y-1 p-2">
                                                    <button
                                                        onClick={() => {
                                                            setSeasonFilter("all")
                                                            setIsSeasonDropdownOpen(false)
                                                        }}
                                                        className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-muted"
                                                    >
                                                        All Seasons
                                                    </button>
                                                    {uniqueSeasons.map((season) => (
                                                        <button
                                                            key={season}
                                                            onClick={() => {
                                                                setSeasonFilter(season)
                                                                setIsSeasonDropdownOpen(false)
                                                            }}
                                                            className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-muted"
                                                        >
                                                            {season}
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
                                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort("season")}>
                                        Season
                                        <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                    </div>
                                </TableHead>
                                <TableHead className="font-medium">City</TableHead>
                                <TableHead className="font-medium">Temperature</TableHead>
                                <TableHead className="font-medium">Humidity</TableHead>
                                <TableHead className="font-medium">Rainfall</TableHead>
                                <TableHead className="font-medium">Nitrogen</TableHead>
                                <TableHead className="font-medium">
                                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort("result")}>
                                        Result
                                        <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                                    </div>
                                </TableHead>
                                <TableHead className="w-[80px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedResults.length > 0 ? (
                                sortedResults
                                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                    .map((recommendation) => (
                                        <TableRow
                                            key={recommendation.id}
                                            className={`${recommendation.id === deletingId ? "deleteFade" : ""} hover:bg-muted/5`}
                                        >
                                            <TableCell className="font-medium">{formatDate(recommendation.date)}</TableCell>
                                            <TableCell>
                                                <Badge className={getSeasonColor(recommendation.season)}>{recommendation.season}</Badge>
                                            </TableCell>
                                            <TableCell>{recommendation.city}</TableCell>
                                            <TableCell>{recommendation.temperature}°C</TableCell>
                                            <TableCell>{recommendation.humidity}%</TableCell>
                                            <TableCell>{recommendation.rainfall} mm</TableCell>
                                            <TableCell>{recommendation.nitrogen}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className="bg-primary/5 hover:bg-primary/10 text-primary border-primary/20"
                                                >
                                                    {recommendation.result}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Popover
                                                    open={openActionPopover === recommendation.id}
                                                    onOpenChange={(open) => setOpenActionPopover(open ? recommendation.id : null)}
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
                                                                    viewRecommendationDetails(recommendation)
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
                                                                        nitrogen: recommendation.nitrogen,
                                                                        phosphorous: recommendation.phosphorous,
                                                                        pottasium: recommendation.pottasium,
                                                                        ph: recommendation.ph,
                                                                        city: recommendation.city,
                                                                        season: recommendation.season,
                                                                        id: recommendation.id,
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
                                                                    deleteRecommendation(recommendation.id)
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
                                    ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-24 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                            <Flask className="h-8 w-8 opacity-40" />
                                            <p>No recommendations found</p>
                                            <Button variant="outline" size="sm" onClick={showCreateForm} className="mt-2">
                                                <PlusIcon className="h-4 w-4 mr-1" />
                                                Add your first recommendation
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
            {(selectedRecommendation || isCreatingLocal || isCreating) && (
                <div className="modal-overlay">
                    <div className={`modal-content ${isClosing ? "slide-out" : ""}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">
                                {isCreatingLocal || isCreating ? "New Recommendation" : "Edit Recommendation"}
                            </h2>
                            <Button variant="ghost" size="icon" className="rounded-full" onClick={closeForm}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <RecommendationForm
                            initialData={selectedRecommendation || undefined}
                            fetchPredictions={fetchRecommendations}
                            closeForm={closeForm}
                            setShowResultPage={setShowResultPage}
                            setPredictionResult={setRecommendationResult}
                        />
                    </div>
                </div>
            )}

            {/* Modern Result Modal */}
            {showResultPage && (
                <div className="modal-overlayResult">
                    <div className={`modal-contentResult ${isClosingResult ? "slide-out" : ""}`}>
                        <RecommendationResult recommendationResult={recommendationResult} closeResultPage={closeResultPage} />
                    </div>
                </div>
            )}

            {/* Modern View Details Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
                    <DialogHeader className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Leaf className="h-5 w-5 text-primary" />
                            <DialogTitle>Recommendation Details</DialogTitle>
                        </div>
                        <DialogDescription>Detailed information about your crop recommendation</DialogDescription>
                    </DialogHeader>

                    {viewingRecommendation && (
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
                                                <Leaf className="h-4 w-4" />
                                                <span>Recommended Crop</span>
                                            </div>
                                            <div className="font-semibold text-lg">{viewingRecommendation.result}</div>
                                        </div>

                                        <div className="flex flex-col gap-1.5 p-4 rounded-lg bg-muted/30">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                <span>Season</span>
                                            </div>
                                            <div className="font-semibold">
                                                <Badge className={getSeasonColor(viewingRecommendation.season)}>
                                                    {viewingRecommendation.season}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5 p-4 rounded-lg bg-muted/30">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                <span>Date</span>
                                            </div>
                                            <div className="font-medium">{formatDate(viewingRecommendation.date)}</div>
                                        </div>

                                        <div className="flex flex-col gap-1.5 p-4 rounded-lg bg-muted/30">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <MapPin className="h-4 w-4" />
                                                <span>Location</span>
                                            </div>
                                            <div className="font-medium">{viewingRecommendation.city}</div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 p-4 rounded-lg border">
                                        <h3 className="font-medium">Soil Nutrient Levels</h3>
                                        <div className="grid grid-cols-3 gap-4 mt-2">
                                            <div className="flex flex-col items-center">
                                                <div className="text-xs text-muted-foreground mb-1">Nitrogen</div>
                                                <div className="font-semibold">{viewingRecommendation.nitrogen}</div>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <div className="text-xs text-muted-foreground mb-1">Phosphorous</div>
                                                <div className="font-semibold">{viewingRecommendation.phosphorous}</div>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <div className="text-xs text-muted-foreground mb-1">Potassium</div>
                                                <div className="font-semibold">{viewingRecommendation.pottasium}</div>
                                            </div>
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
                                                <div className="font-medium">{viewingRecommendation.temperature}°C</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 rounded-lg border">
                                            <div className="h-9 w-9 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600">
                                                <Droplets className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm text-muted-foreground">Humidity</div>
                                                <div className="font-medium">{viewingRecommendation.humidity}%</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 rounded-lg border">
                                            <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                <Droplets className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm text-muted-foreground">Rainfall</div>
                                                <div className="font-medium">{viewingRecommendation.rainfall} mm</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 rounded-lg border">
                                            <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                                <Gauge className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm text-muted-foreground">pH Level</div>
                                                <div className="font-medium">{viewingRecommendation.ph}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 p-4 rounded-lg bg-muted/30">
                                        <h3 className="font-medium mb-2">Recommendation Summary</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Based on soil analysis in {viewingRecommendation.city} during the {viewingRecommendation.season}{" "}
                                            season, with N-P-K values of {viewingRecommendation.nitrogen}-{viewingRecommendation.phosphorous}-
                                            {viewingRecommendation.pottasium} and pH level of {viewingRecommendation.ph}, the recommended crop
                                            is {viewingRecommendation.result}. Environmental conditions include temperature of{" "}
                                            {viewingRecommendation.temperature}°C, humidity of {viewingRecommendation.humidity}%, and rainfall
                                            of {viewingRecommendation.rainfall} mm.
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
                                            nitrogen: viewingRecommendation.nitrogen,
                                            phosphorous: viewingRecommendation.phosphorous,
                                            pottasium: viewingRecommendation.pottasium,
                                            ph: viewingRecommendation.ph,
                                            city: viewingRecommendation.city,
                                            season: viewingRecommendation.season,
                                            id: viewingRecommendation.id,
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

export default Recommendations
