"use client"

import { FormEvent, useState, useEffect } from "react"
import Image from "next/image"
import FloatingInput from "@/components/login/FloatingInput"
import PasswordInput from "@/components/login/PasswordInput"
import loginImage from "@/public/images/login_image.jpg"
import loginImage2 from "@/public/images/login_image1.jpg"
import loginImage3 from "@/public/images/login_image2.jpg"

// ─── Gambar ilustrasi – ubah path di sini untuk mengganti gambar ───
const image = [
    loginImage.src,
    loginImage2.src,
    loginImage3.src,
]

interface LoginCardProps {
    onSubmit: (email: string, password: string, remember: boolean) => Promise<void>
    isLoading?: boolean
}

export default function LoginCard({ onSubmit, isLoading = false }: LoginCardProps) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [remember, setRemember] = useState(false)

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        onSubmit(email, password, remember)
    }

    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) =>
                prev === image.length - 1 ? 0 : prev + 1
            )
        }, 4000) 

        return () => clearInterval(interval)
    }, [])

    return (
        <div
            className="
                w-full max-w-[1200px] min-h-[700px]
                flex flex-col md:flex-row
                bg-white rounded-[30px] shadow-[0_24px_80px_rgba(0,0,0,0.18)]
                overflow-hidden
            "
        >
            {/* ── LEFT – Illustration ────────────────────────────────── */}
            <div className="
                order-1 md:order-none
                w-full md:w-[55%]
                bg-white
                flex items-center justify-center
                p-10 md:p-14
                min-h-[260px] md:min-h-[700px]
            ">
                <div className="relative w-full h-full min-h-[220px] flex items-center justify-center ">
                    {image.map((img, index) => (
                        <img
                            key={index}
                            src={img}
                            alt="Login illustration"
                            className={`absolute rounded-xl max-w-full max-h-[580px] w-auto h-auto object-contain duration-1000 ease-in-out ${index === currentIndex ? "opacity-100" : "opacity-0"}`}
                        />
                    ))}
                </div>
            </div>

            {/* ── RIGHT – Form ───────────────────────────────────────── */}
            <div className="
                order-2 md:order-none
                w-full md:w-[45%]
                bg-white
                flex flex-col justify-center
                px-10 md:px-14 py-14 md:py-16
            ">
                {/* Logo */}
                <div className="mb-8 flex items-center gap-2">
                    <div className="
                        w-9 h-9 rounded-xl bg-[#111111]
                        flex items-center justify-center
                        text-white font-bold text-xs tracking-wider
                    ">
                        SCV
                    </div>
                    <span className="text-[#111111] font-semibold text-sm tracking-wide">SCOVER</span>
                </div>

                {/* Heading */}
                <h1 className="text-[2.75rem] font-bold text-[#111111] leading-tight mb-1">
                    Welcome back!
                </h1>

                {/* Sub-heading */}
                <p className="text-[#8b8b8b] text-sm mb-10">
                    Please enter your details
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>

                    {/* Email */}
                    <FloatingInput
                        id="login-email"
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                    />

                    {/* Password */}
                    <PasswordInput
                        label="Password"
                        value={password}
                        onChange={setPassword}
                    />

                    {/* Remember Me + Forgot Password */}
                    <div className="flex items-center justify-between mt-1">
                        <label className="flex items-center gap-2 cursor-pointer select-none group">
                            <div className="relative">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    checked={remember}
                                    onChange={(e) => setRemember(e.target.checked)}
                                    className="peer sr-only"
                                />
                                {/* Custom checkbox */}
                                <div className="
                                    w-4 h-4 rounded border-2 border-[#d1d1d1]
                                    peer-checked:bg-[#111111] peer-checked:border-[#111111]
                                    peer-focus-visible:ring-2 peer-focus-visible:ring-offset-1 peer-focus-visible:ring-[#111111]
                                    transition-all duration-200 flex items-center justify-center
                                ">
                                    {remember && (
                                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 10" fill="none">
                                            <path d="M1 5.5L4.5 9L11 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <span className="text-sm text-[#111111]">Remember me for 30 days</span>
                        </label>

                        <button
                            type="button"
                            className="text-sm text-[#8b8b8b] hover:text-[#111111] hover:underline transition-all duration-200 cursor-pointer"
                        >
                            Forgot password?
                        </button>
                    </div>

                    {/* Login Button */}
                    <button
                        id="btn-login"
                        type="submit"
                        disabled={isLoading}
                        className="
                            w-full h-14 mt-2
                            bg-[#111111] text-white
                            font-semibold text-base tracking-wide
                            rounded-2xl
                            hover:bg-[#2d2d2d]
                            active:scale-[0.98]
                            transition-all duration-200 ease-in-out
                            cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed
                        "
                    >
                        {isLoading ? "Logging in..." : "Log In"}
                    </button>

                </form>
            </div>
        </div>
    )
}
