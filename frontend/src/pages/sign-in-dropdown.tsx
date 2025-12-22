"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/config/AuthProvider"
import api from "@/config/api"
import LoadingOverlay from "@/components/loading-overlay"

interface SignInDropdownProps {
    isOpen: boolean
    onClose: () => void
}

interface LoginResponse {
    jwt: string
    email: string
    username: string
    fullName: string
}

export default function SignInDropdown({ isOpen, onClose }: SignInDropdownProps) {
    const [values, setValues] = useState({
        email: "",
        password: "",
    })
    const [isLoading, setIsLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()
    const formRef = useRef<HTMLFormElement>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation()
        setValues({
            ...values,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsLoading(true)

        try {
            const response = await api.post<LoginResponse>("/auth/signing", values)

            if (response.data.jwt) {
                console.log("submitted data", values)
                console.log("response returned from spring", response)

                // Add a 3-second delay before completing sign-in
                setTimeout(() => {
                    toast.success("Logged in successfully")
                    const userData = {
                        email: response.data.email,
                        username: response.data.username,
                        fullName: response.data.fullName,
                        jwt: response.data.jwt,
                    }
                    login(userData)
                    setIsLoading(false)
                    onClose()
                    navigate("/")
                }, 3000)
            }
        } catch (error) {
            console.error(error)
            toast.error("Error, please try again")
            setIsLoading(false)
        }
    }

    // This prevents the dropdown from closing when clicking inside
    const handleContainerClick = (e: React.MouseEvent) => {
        e.stopPropagation()
    }

    return (
        <>
            <LoadingOverlay isVisible={isLoading} message="Signing in..." />

            <motion.div
                className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50 p-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                onClick={handleContainerClick}
            >
                <h3 className="text-lg font-semibold text-center mb-4 text-gray-900 dark:text-white">Sign In to CropSmart</h3>

                <form ref={formRef} onSubmit={handleSubmit} className="space-y-4" onClick={handleContainerClick}>
                    <div className="space-y-2" onClick={handleContainerClick}>
                        <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                            Email
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="your@email.com"
                            value={values.email}
                            onChange={handleChange}
                            onClick={handleContainerClick}
                            required
                            className="border-gray-300 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-500"
                        />
                    </div>

                    <div className="space-y-2" onClick={handleContainerClick}>
                        <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                            Password
                        </Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={values.password}
                            onChange={handleChange}
                            onClick={handleContainerClick}
                            required
                            className="border-gray-300 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-500"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        disabled={isLoading}
                        onClick={handleContainerClick}
                    >
                        {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                </form>

                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 text-sm text-center text-gray-600 dark:text-gray-400">
                    Don't have an account?{" "}
                    <a
                        href="/signup"
                        className="text-green-600 hover:text-green-700 font-medium"
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onClose()
                            navigate("/signup")
                        }}
                    >
                        Sign up
                    </a>
                </div>
            </motion.div>
        </>
    )
}

