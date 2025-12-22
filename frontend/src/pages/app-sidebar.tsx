"use client"

import { Home, FileText, Leaf, Bell, Calendar, Search, Settings, LogOut, UserCog, CreditCard } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuBadge,
    SidebarSeparator,
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/config/AuthProvider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ProfileForm from "./PredictionForm"
import RecommendationForm from "./RecommendationForm"

export interface Prediction {
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

export interface Recommendation {
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

interface ProfileInfos {
    crop: Prediction[]
    result: Recommendation[]
    isRecommendationMode: boolean
    setIsRecommendationMode?: (value: boolean) => void
}

interface AppSidebarProps {
    recentCrops: ProfileInfos
    fetchPredictions?: () => void
    fetchRecommendations?: () => void
}

export function AppSidebar({ recentCrops, fetchPredictions, fetchRecommendations }: AppSidebarProps) {
    const { logout, user } = useAuth()
    const [activeItem, setActiveItem] = useState("Home")
    const [unreadCount, setUnreadCount] = useState(3)
    const navigate = useNavigate()
    const location = useLocation()
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

    // Get initials from username
    const getInitials = (name: string) => {
        return (
            name
                ?.split(" ")
                .map((part) => part[0])
                .join("")
                .toUpperCase() || "U"
        )
    }

    // Update active item based on recommendation mode and current path
    useEffect(() => {
        if (recentCrops.isRecommendationMode) {
            setActiveItem("Recommendations")
        } else {
            const path = location.pathname
            if (path === "/profile") {
                setActiveItem("Predictions")
            } else if (path.includes("predictions")) {
                setActiveItem("Predictions")
            } else if (path === "/") {
                setActiveItem("Home")
            }
        }
    }, [recentCrops.isRecommendationMode, location.pathname])

    // Handle navigation item click
    const handleNavItemClick = (title: string, url: string) => {
        setActiveItem(title)

        if (title === "Recommendations" && recentCrops.setIsRecommendationMode) {
            recentCrops.setIsRecommendationMode(true)
        } else if (title === "Predictions" && recentCrops.setIsRecommendationMode) {
            recentCrops.setIsRecommendationMode(false)
        } else if (url !== "#") {
            navigate(url)
        }
    }

    // Get recent items based on mode
    const getRecentItems = () => {
        if (!recentCrops.isRecommendationMode) {
            if (recentCrops.crop.length > 0) {
                return recentCrops.crop
                    .slice(-3)
                    .reverse()
                    .map((item, index) => ({
                        name: item.crop,
                        value: `${item.result} yield`,
                        color: `hsl(var(--chart-${index + 1}))`,
                    }))
            }
            return []
        } else {
            if (recentCrops.result.length > 0) {
                return recentCrops.result
                    .slice(-3)
                    .reverse()
                    .map((item, index) => ({
                        name: item.result,
                        value: `${item.season} season`,
                        color: `hsl(var(--chart-${index + 1}))`,
                    }))
            }
            return []
        }
    }

    const recentItems = getRecentItems()

    const navigationItems = [
        {
            title: "Home",
            url: "/",
            icon: Home,
            description: "Dashboard overview",
        },
        {
            title: "Predictions",
            url: "/profile",
            icon: FileText,
            description: "Crop yield predictions",
        },
        {
            title: "Recommendations",
            url: "#",
            icon: Leaf,
            description: "Crop recommendations",
        },
        {
            title: "Notifications",
            url: "#",
            icon: Bell,
            description: "Messages and alerts",
            badge: unreadCount,
        },
        {
            title: "Calendar",
            url: "#",
            icon: Calendar,
            description: "Schedule and events",
        },
        {
            title: "Search",
            url: "#",
            icon: Search,
            description: "Find predictions and data",
        },
    ]

    const handleCreateNew = () => {
        setIsCreateDialogOpen(true)
    }

    const closeCreateDialog = () => {
        setIsCreateDialogOpen(false)
    }

    return (
        <>
            <Sidebar variant="floating" collapsible="icon">
                <SidebarHeader>
                    <div className="flex items-center gap-3 px-4 py-4">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground shadow-sm">
                            <Leaf className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">CropSmart</h3>
                            <p className="text-xs text-muted-foreground">Intelligent Farming</p>
                        </div>
                    </div>
                </SidebarHeader>

                <SidebarSeparator />

                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent className="px-2 py-2">
                            <SidebarMenu>
                                {navigationItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild isActive={activeItem === item.title} tooltip={item.description}>
                                            <button
                                                onClick={() => handleNavItemClick(item.title, item.url)}
                                                className="group w-full flex items-center"
                                            >
                                                <item.icon
                                                    className={cn(
                                                        "transition-colors",
                                                        activeItem === item.title
                                                            ? "text-primary"
                                                            : "text-muted-foreground group-hover:text-foreground",
                                                    )}
                                                />
                                                <span>{item.title}</span>
                                            </button>
                                        </SidebarMenuButton>
                                        {item.badge && (
                                            <SidebarMenuBadge className="bg-primary/10 text-primary">{item.badge}</SidebarMenuBadge>
                                        )}
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    <SidebarSeparator className="my-2" />

                    <SidebarGroup>
                        <SidebarGroupLabel className="text-xs uppercase tracking-wider font-medium px-4">
                            {recentCrops.isRecommendationMode ? "Recent Recommendations" : "Recent Predictions"}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <div className="px-4 py-3 space-y-3">
                                {recentItems.length > 0 ? (
                                    recentItems.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 group p-2 rounded-md transition-colors hover:bg-sidebar-accent"
                                        >
                                            <div className="w-2 h-10 rounded-full" style={{ backgroundColor: item.color }}></div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">{item.value}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                                        No recent {recentCrops.isRecommendationMode ? "recommendations" : "predictions"} found
                                    </div>
                                )}
                            </div>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter className="border-t">
                    <div className="px-4 py-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-sidebar-accent transition-colors">
                                    <Avatar className="h-10 w-10 border-2 border-primary/10">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.username}`} />
                                        <AvatarFallback className="text-sm bg-primary/10 text-primary">
                                            {getInitials(user?.username || "")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-sm font-medium truncate">{user?.username}</p>
                                        <p className="text-xs text-muted-foreground">Farmer</p>
                                    </div>
                                    <Settings className="h-4 w-4 text-muted-foreground" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem className="flex items-center gap-2">
                                    <UserCog className="h-4 w-4" />
                                    <span>Account Settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    <span>Billing</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                                    onClick={() => logout()}
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Sign Out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </SidebarFooter>
            </Sidebar>

            {/* Create New Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Create New {recentCrops.isRecommendationMode ? "Recommendation" : "Prediction"}</DialogTitle>
                    </DialogHeader>
                    {recentCrops.isRecommendationMode ? (
                        <RecommendationForm closeForm={closeCreateDialog} fetchPredictions={fetchRecommendations} />
                    ) : (
                        <ProfileForm closeForm={closeCreateDialog} fetchPredictions={fetchPredictions} />
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}

