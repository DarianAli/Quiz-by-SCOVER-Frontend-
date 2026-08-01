"use client";

import {
    LayoutDashboard,
    Users,
    BookOpen,
    GraduationCap,
    Settings,
    Shield,
    ClipboardList,
} from "lucide-react";

import Sidebar, { MenuType } from "@/components/SidebarTemplate/sideBar";

const adminMenu: MenuType[] = [
    // ── Main ────────────────────────────────────────────────
    {
        id: "dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard size={20} />,
        path: "/admin/dashboard",
        category: "dashboard",
    },
    {
        id: "users",
        label: "Users",
        icon: <Users size={20} />,
        path: "/admin/users",
        category: "dashboard",
    },
    {
        id: "classes",
        label: "Classes",
        icon: <GraduationCap size={20} />,
        path: "/admin/classes",
        category: "dashboard",
    },
    {
        id: "subjects",
        label: "Subjects",
        icon: <BookOpen size={20} />,
        path: "/admin/subjects",
        category: "dashboard",
    },
    {
        id: "quizzes",
        label: "Quizzes",
        icon: <ClipboardList size={20} />,
        path: "/admin/quizzes",
        category: "dashboard",
    },
    // ── Settings ─────────────────────────────────────────────
    {
        id: "settings",
        label: "Settings",
        icon: <Settings size={20} />,
        path: "/admin/settings",
        category: "settings",
    },
];

type Props = {
    children: React.ReactNode;
};

export default function AdminLayout({ children }: Props) {
    return (
        <Sidebar
            menuList={adminMenu}
            portalLabel="Admin Portal"
            portalIcon={<Shield size={13} className="text-[#1D61D2] shrink-0" />}
        >
            {children}
        </Sidebar>
    );
}
