"use client"

import { BASE_API_URL } from "@/global"
import { storeCookie } from "@/lib/client-cookie"
import { post } from "@/lib/api-bridge"
import { useRouter } from "next/navigation"
import { ToastContainer, toast } from "react-toastify"
import LoginCard from "@/components/login/LoginCard"
import LoginBackground from "@/components/login/LoginBackground"
import { useState } from "react"

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async (email: string, password: string, remember: boolean) => {
        try {
            setIsLoading(true)
            const url = `${BASE_API_URL}/auth/login`
            const payload = { email, password }

            const { data } = await post(url, payload)

            if (data?.success === true) {
                const userData = data.data

                toast(data.message || "Login berhasil", {
                    hideProgressBar: true,
                    containerId: "toastLogin",
                    type: "success",
                    autoClose: 2000,
                })

                console.log("DATA LOGIN:", userData)
                const role = userData.role

                // Backend handles HttpOnly token & role cookies.
                // We keep role and user data in js-cookie for client-side UI access.
                storeCookie("email", userData.email)
                storeCookie("role", role)

                const displayName = userData.full_name || userData.userName
                if (displayName) storeCookie("name", displayName)
                if (userData.userName) storeCookie("userName", userData.userName)

                if (userData.idUser) storeCookie("id", String(userData.idUser))
                if (userData.idAdmin) storeCookie("id", String(userData.idAdmin))

                if (role === "ADMIN") {
                    setTimeout(() => window.location.href = "/admin/dashboard", 1000)
                } else if (role === "TENTOR") {
                    setTimeout(() => window.location.href = "/tentor/dashboard", 1000)
                } else {
                    setTimeout(() => window.location.href = "/student/dashboard", 1000)
                }
            } else {
                toast(data?.message || "Login gagal", {
                    hideProgressBar: true,
                    containerId: "toastLogin",
                    type: "warning",
                    autoClose: 2000,
                })
            }
        } catch (error: any) {
            if (error.response?.status === 404) {
                toast("User tidak ditemukan, coba periksa kembali email dan password Anda.", {
                    containerId: "toastLogin",
                    type: "error",
                    hideProgressBar: true,
                })
            } else if (error.response?.status === 401) {
                toast("Email atau password salah. Silakan coba kembali.", {
                    containerId: "toastLogin",
                    type: "error",
                    hideProgressBar: true,
                })
            } else {
                toast("Terjadi kesalahan. Silakan coba lagi.", {
                    containerId: "toastLogin",
                    type: "error",
                    hideProgressBar: true,
                })
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="relative min-h-dvh w-full flex items-center justify-center px-4 py-10 sm:py-10 overflow-hidden">
            <LoginBackground />
            <ToastContainer containerId="toastLogin" />
            <div className="relative z-10 w-full flex items-center justify-center">
                <LoginCard onSubmit={handleLogin} isLoading={isLoading} />
            </div>
        </main>
    )
}