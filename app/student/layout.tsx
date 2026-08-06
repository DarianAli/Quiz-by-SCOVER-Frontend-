"use client";

import { LayoutDashboard, BookOpen, TrendingUp, Settings, GraduationCap } from "lucide-react";
import Sidebar, { MenuType } from "@/components/SidebarTemplate/sideBar";

const studentMenu: MenuType[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/student/dashboard", category: "dashboard" },
    { id: "subjects",  label: "Subjects",  icon: <BookOpen size={20} />,        path: "/student/subjects",  category: "dashboard" },
    { id: "progress",  label: "Progress",  icon: <TrendingUp size={20} />,      path: "/student/progress",  category: "dashboard" },
    { id: "settings",  label: "Settings",  icon: <Settings size={20} />,        path: "/student/settings",  category: "settings" },
];

type Props = {
    children: React.ReactNode;
};

export default function StudentLayout({ children }: Props) {
    return (
        <Sidebar
            menuList={studentMenu}
            portalLabel="Student Portal"
            portalIcon={<GraduationCap size={13} className="text-[#1D61D2] shrink-0" />}
        >
            {children}
        </Sidebar>
    );
}