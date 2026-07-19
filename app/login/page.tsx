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
            const url = `${BASE_API_URL}/user/login`
            const payload = { email, password }

            const { data } = await post(url, payload)

            if (data.status === true) {
                toast(data.message, {
                    hideProgressBar: true,
                    containerId: "toastLogin",
                    type: "success",
                    autoClose: 2000,
                })

                console.log("DATA LOGIN:", data)
                storeCookie("token", data.token)
                storeCookie("email", data.email)
                storeCookie("userName", data.userName)
                storeCookie("role", data.role)
                const role = data.data.role

                if (data.data.idUser) storeCookie("id", data.data.idUser)
                if (data.data.idAdmin) storeCookie("id", data.data.idAdmin)

                if (role === "ADMIN") {
                    setTimeout(() => router.replace("/admin/home"), 1000)
                } else if (role === "TENTOR") {
                    setTimeout(() => router.replace("/tentor/home"), 1000)
                } else {
                    setTimeout(() => router.replace("/student/home"), 1000)
                }
            } else {
                toast(data.message, {
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