"use client"
import { ReactNode, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { ToastContainer, toast } from "react-toastify";
import MenuItem from "./menuItem";
import { getCookie, removeCookie } from "@/lib/client-cookie";
import { BASE_API_URL } from "@/global";
import { IAdmin } from "@/app/types";
import ScoverLogo from "@/public/images/logo2.png";
import ProfilePicTest from "@/public/images/profile.jpeg";
import DashboardHeader from "../dashboard/DashboardHeader";

type MenuType = {
    id: string;
    icon: ReactNode;
    path: string;
    label: string;
    category: "dashboard" | "communication" | "settings";
};

type Props = {
    children: ReactNode;
    id: string;
    title: string;
    menuList: MenuType[];
};

const CATEGORY_LABEL: Record<string, string> = {
    dashboard:     "Dashboard",
    communication: "Komunikasi",
    settings:      "Pengaturan",
};

// ─── Icons ───────────────────────────────────────────────
const CollapseIcon = ({ collapsed }: { collapsed: boolean }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {collapsed
            ? <polyline points="6,3 11,8 6,13"/>
            : <polyline points="10,3 5,8 10,13"/>}
    </svg>
);

const HamburgerIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <line x1="3" y1="5" x2="17" y2="5"/>
        <line x1="3" y1="10" x2="17" y2="10"/>
        <line x1="3" y1="15" x2="17" y2="15"/>
    </svg>
);

const LogoutIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 3H3a1 1 0 00-1 1v10a1 1 0 001 1h4"/>
        <polyline points="12,6 16,9 12,12"/>
        <line x1="16" y1="9" x2="6" y2="9"/>
    </svg>
);

// ─── Sidebar ─────────────────────────────────────────────
const Sidebar = ({ children, id, title, menuList }: Props) => {
    const [collapsed, setCollapsed] = useState(true);
    const [mobileOpen, setMobileOpen]  = useState(false);
    const [name, setName]   = useState("");
    const [admin, setAdmin] = useState<IAdmin | null>(null);
    const router = useRouter();

    useEffect(() => {
        const token = getCookie("token");
        if (!token) return;
        setName(getCookie("name") ?? "");
        try { setAdmin(jwtDecode<IAdmin>(token)); }
        catch (e) { console.error("Token decode failed:", e); }
    }, []);

    const handleLogout = () => {
        ["token", "id", "name", "email", "role"].forEach(removeCookie);
        toast.success("Logout berhasil", {
            hideProgressBar: true,
            containerId: "sidebar-toast",
            autoClose: 1000,
        });
        setTimeout(() => router.replace("/login"), 1500);
    };

    const grouped = menuList.reduce<Record<string, MenuType[]>>((acc, menu) => {
        (acc[menu.category] ??= []).push(menu);
        return acc;
    }, {});

    return (
        <div className="min-h-screen md:h-screen flex bg-slate-50">
            <ToastContainer containerId="sidebar-toast" />

            {/* ── Sidebar ── */}
            <aside className={[
                "fixed md:sticky top-0 h-screen bg-white border-r border-[#EAEAEA] shadow-[4px_0_24px_rgba(0,0,0,0.02)]",
                "flex flex-col transition-all duration-300 ease-in-out z-50",
                collapsed ? "w-[72px]" : "w-64",
                mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0",
            ].join(" ")}>

                {/* Logo + toggle */}
                <div className={`flex items-center h-20 border-b border-gray-100 px-4 ${collapsed ? "justify-center" : "justify-between"}`}>
                    {!collapsed && (
                        <div className="flex items-center gap-2.5 min-w-0">
                            <Image src={ScoverLogo} alt="Scover" width={36} height={36} className="shrink-0"/>
                            <span className="text-sm font-semibold text-gray-800 truncate">Scover Malang</span>
                        </div>
                    )}
                    {collapsed && <Image src={ScoverLogo} alt="Scover" width={36} height={36}/>}

                    {!collapsed && (
                        <button
                            onClick={() => setCollapsed(true)}
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        >
                            <CollapseIcon collapsed={false}/>
                        </button>
                    )}
                </div>

                {/* Toggle saat collapsed */}
                {collapsed && (
                    <button
                        onClick={() => setCollapsed(false)}
                        className="mx-auto mt-3 p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    >
                        <CollapseIcon collapsed={true}/>
                    </button>
                )}

                {/* Menu */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-6 custom-scrollbar">
                    {Object.entries(grouped).map(([category, menus]) => (
                        <div key={category}>
                            {!collapsed && (
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">
                                    {CATEGORY_LABEL[category] ?? category}
                                </p>
                            )}
                            <div className="flex flex-col gap-1.5">
                                {menus.map(menu => (
                                    <MenuItem
                                        key={menu.id}
                                        icon={menu.icon}
                                        label={menu.label}
                                        path={menu.path}
                                        active={menu.id === id}
                                        collapsed={collapsed}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-4 mt-auto border-t border-[#EAEAEA]">
                    <button
                        onClick={handleLogout}
                        className={[
                            "flex items-center gap-3 w-full rounded-xl py-3 text-sm font-semibold",
                            "text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-300 active:scale-95 group",
                            collapsed ? "justify-center px-0" : "px-4",
                        ].join(" ")}
                    >
                        <span className="group-hover:-translate-x-0.5 transition-transform duration-300"><LogoutIcon /></span>
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* ── Main ── */}
            <div className="flex-1 flex flex-col md:h-screen min-w-0 bg-[#F8FAFC]">
                
                {/* Header Extracted */}
                <DashboardHeader
                    title={title}
                    name={name}
                    role={admin?.role || ""}
                    onMobileMenuToggle={() => setMobileOpen(true)}
                />

                {/* Content */}
                <main className="flex-1 p-5 md:p-8 md:overflow-y-auto w-full max-w-[1920px] mx-auto">
                    {children}
                </main>
            </div>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-[#083E63]/20 z-40 md:hidden backdrop-blur-sm transition-all duration-300"
                    onClick={() => setMobileOpen(false)}
                />
            )}
        </div>
    );
};

export default Sidebar;