// app/tentor/layout.tsx
"use client";

import { LayoutDashboard, Users, ClipboardList, Settings, ShieldCheck } from "lucide-react";
import Sidebar, { MenuType } from "@/components/SidebarTemplate";

const tentorMenu: MenuType[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/tentor/dashboard", category: "dashboard" },
    { id: "students",  label: "Students",  icon: <Users size={20} />,          path: "/tentor/students",  category: "dashboard" },
    { id: "tasks",     label: "Tugas",     icon: <ClipboardList size={20} />,  path: "/tentor/tasks",     category: "dashboard" },
    { id: "settings",  label: "Settings",  icon: <Settings size={20} />,       path: "/tentor/settings",  category: "settings" },
];

type Props = {
    children: React.ReactNode;
};

export default function TentorLayout({ children }: Props) {
    return (
        <Sidebar
            menuList={tentorMenu}
            portalLabel="Tentor Portal"
            portalIcon={<ShieldCheck size={13} className="text-[#1D61D2] shrink-0" />}
        >
            {children}
        </Sidebar>
    );
}