import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { storeCookie } from "./client-cookie";

const ROLE_ROUTES: Record<string, string> = {
    ADMIN: "/admin/home",
    TENTOR: "/tentor/home",
    STUDENT: "/student/home"
}

export function persistAuthCookies(data: {
    token: string
    data: {
        role: string,
        email: string,
        userName: string,
        idUser?: string | number,
        idAdmin?: string | number
    }
}) {
    const { token, data: user } = data

    storeCookie("token", token)
    storeCookie("role", user.role)
    storeCookie("email", user.email)
    storeCookie("name", user.userName)

    const id = user.idUser ?? user.idAdmin
    if (id !== undefined) {
        storeCookie("id", String(id))
    }
}

export function redirectByRole(role: string, router: AppRouterInstance) {
    const route = ROLE_ROUTES[role] ?? ROLE_ROUTES.STUDENT
    setTimeout(() => router.replace(route), 1000)
}