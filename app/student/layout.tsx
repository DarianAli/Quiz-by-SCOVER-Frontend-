"use client";

import { ReactNode, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    BookOpen,
    TrendingUp,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronRight,
    ChevronLeft,
    GraduationCap,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import { getCookie, removeCookie } from "@/lib/client-cookie";
import ScoverLogo from "@/public/images/logo1.jpg";

interface IDecodedToken {
    role: string;
    full_name?: string;
    userName?: string;
}

type NavItem = {
    id: string;
    label: string;
    icon: ReactNode;
    path: string;
};

const NAV_ITEMS: NavItem[] = [
    { id: "dashboard", label: "Dashboard",  icon: <LayoutDashboard size={20} />, path: "/student/dashboard" },
    { id: "subjects",  label: "Subjects",   icon: <BookOpen size={20} />,        path: "/student/subjects"  },
    { id: "progress",  label: "Progress",   icon: <TrendingUp size={20} />,      path: "/student/progress"  },
    { id: "settings",  label: "Settings",   icon: <Settings size={20} />,        path: "/student/settings"  },
];

// ─── Sidebar ─────────────────────────────────────────────
export default function StudentLayout({ children }: { children: ReactNode }) {
    const [collapsed, setCollapsed]     = useState(false);
    const [mobileOpen, setMobileOpen]   = useState(false);
    const [name, setName]               = useState("");
    const [initials, setInitials]       = useState("S");
    const router   = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const token = getCookie("token");
        const cookieName = getCookie("name") ?? "";
        setName(cookieName);
        // Build initials from name
        const parts = cookieName.trim().split(" ");
        setInitials(parts.length >= 2
            ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
            : cookieName.slice(0, 2).toUpperCase() || "S");
        if (token) {
            try { jwtDecode<IDecodedToken>(token); }
            catch (e) { console.error("Token decode failed:", e); }
        }
    }, []);

    const handleLogout = useCallback(() => {
        ["token", "id", "name", "email", "role"].forEach(removeCookie);
        toast.success("Logout berhasil", {
            hideProgressBar: true,
            containerId: "student-toast",
            autoClose: 1000,
        });
        setTimeout(() => router.replace("/login"), 1500);
    }, [router]);

    const activeId = NAV_ITEMS.find(item => pathname.startsWith(item.path))?.id ?? "dashboard";

    return (
        <div className="min-h-screen md:h-screen flex bg-slate-50 overflow-hidden">
            <ToastContainer containerId="student-toast" />

            {/* ── Desktop Sidebar ─────────────────────────────────── */}
            <aside
                className={[
                    "hidden md:flex flex-col sticky top-0 h-screen",
                    "bg-white border-r border-gray-100 shadow-[2px_0_16px_rgba(0,0,0,0.03)]",
                    "transition-all duration-300 ease-in-out z-40 shrink-0",
                    collapsed ? "w-[72px]" : "w-64",
                ].join(" ")}
            >
                {/* Logo */}
                <div className={`flex items-center h-20 border-b border-gray-100 px-4 ${collapsed ? "justify-center" : "justify-between"}`}>
                    {!collapsed && (
                        <div className="flex items-center gap-2.5 min-w-0">
                            <Image src={ScoverLogo} alt="Scover" width={34} height={34} className="shrink-0 rounded-lg" />
                            <span className="text-sm font-bold text-[#083E63] truncate">Scover</span>
                        </div>
                    )}
                    {collapsed && <Image src={ScoverLogo} alt="Scover" width={34} height={34} className="rounded-lg" />}

                    {!collapsed && (
                        <button
                            onClick={() => setCollapsed(true)}
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                            aria-label="Collapse sidebar"
                        >
                            <ChevronLeft size={16} />
                        </button>
                    )}
                </div>

                {/* Expand button when collapsed */}
                {collapsed && (
                    <button
                        onClick={() => setCollapsed(false)}
                        className="mx-auto mt-3 p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        aria-label="Expand sidebar"
                    >
                        <ChevronRight size={16} />
                    </button>
                )}

                {/* Role Badge */}
                {!collapsed && (
                    <div className="px-4 pt-4 pb-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#EAF3FF] rounded-lg">
                            <GraduationCap size={13} className="text-[#1D61D2] shrink-0" />
                            <span className="text-[11px] font-bold text-[#1D61D2] uppercase tracking-wide">Student Portal</span>
                        </div>
                    </div>
                )}

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-1">
                    {!collapsed && (
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Menu</p>
                    )}
                    {NAV_ITEMS.map(item => (
                        <Link key={item.id} href={item.path}>
                            <div
                                className={[
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
                                    "transition-all duration-200 group cursor-pointer",
                                    activeId === item.id
                                        ? "bg-[#EAF3FF] text-[#1D61D2] font-semibold shadow-sm"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700",
                                    collapsed ? "justify-center px-0" : "",
                                ].join(" ")}
                                title={collapsed ? item.label : undefined}
                            >
                                <span className={[
                                    "shrink-0 transition-transform duration-200 group-hover:scale-110",
                                    activeId === item.id ? "text-[#1D61D2]" : "text-gray-400",
                                ].join(" ")}>
                                    {item.icon}
                                </span>
                                {!collapsed && <span className="truncate">{item.label}</span>}
                                {!collapsed && activeId === item.id && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#1D61D2]" />
                                )}
                            </div>
                        </Link>
                    ))}
                </nav>

                {/* Profile + Logout */}
                <div className="border-t border-gray-100 p-3 space-y-1">
                    {!collapsed && (
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 mb-1">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1D61D2] to-[#112B66] flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {initials}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-gray-800 truncate">{name || "Student"}</p>
                                <p className="text-[10px] text-gray-400 truncate">Student</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className={[
                            "flex items-center gap-3 w-full rounded-xl py-2.5 text-sm font-semibold",
                            "text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 active:scale-95 group",
                            collapsed ? "justify-center px-0" : "px-3",
                        ].join(" ")}
                        aria-label="Logout"
                    >
                        <LogOut size={18} className="shrink-0 group-hover:scale-110 transition-transform duration-200" />
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* ── Mobile Sidebar ───────────────────────────────────── */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-[#083E63]/20 z-40 md:hidden backdrop-blur-sm"
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: "spring", damping: 28, stiffness: 280 }}
                            className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-100 shadow-2xl z-50 md:hidden flex flex-col" aria-modal="true"
                        >
                            {/* Mobile Logo */}
                            <div className="flex items-center justify-between h-20 border-b border-gray-100 px-4">
                                <div className="flex items-center gap-2.5">
                                    <Image src={ScoverLogo} alt="Scover" width={34} height={34} className="rounded-lg" />
                                    <span className="text-sm font-bold text-[#083E63]">Scover</span>
                                </div>
                                <button
                                    onClick={() => setMobileOpen(false)}
                                    className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"
                                    aria-label="Close menu"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Mobile Role Badge */}
                            <div className="px-4 pt-4 pb-2">
                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#EAF3FF] rounded-lg">
                                    <GraduationCap size={13} className="text-[#1D61D2]" />
                                    <span className="text-[11px] font-bold text-[#1D61D2] uppercase tracking-wide">Student Portal</span>
                                </div>
                            </div>

                            {/* Mobile Nav */}
                            <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-1">
                                {NAV_ITEMS.map(item => (
                                    <Link key={item.id} href={item.path} onClick={() => setMobileOpen(false)}>
                                        <div className={[
                                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                                            activeId === item.id
                                                ? "bg-[#EAF3FF] text-[#1D61D2] font-semibold"
                                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700",
                                        ].join(" ")}>
                                            <span className={activeId === item.id ? "text-[#1D61D2]" : "text-gray-400"}>
                                                {item.icon}
                                            </span>
                                            <span>{item.label}</span>
                                            {activeId === item.id && (
                                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#1D61D2]" />
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </nav>

                            {/* Mobile Profile + Logout */}
                            <div className="border-t border-gray-100 p-3 space-y-1">
                                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 mb-1">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1D61D2] to-[#112B66] flex items-center justify-center text-white text-xs font-bold">
                                        {initials}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-gray-800 truncate">{name || "Student"}</p>
                                        <p className="text-[10px] text-gray-400">Student</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
                                >
                                    <LogOut size={18} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* ── Main Content ──────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-h-screen md:h-screen min-w-0 overflow-hidden">

                {/* Top Header */}
                <header className="h-20 shrink-0 bg-white border-b border-gray-100 flex items-center justify-between px-5 md:px-8 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                        aria-label="Open menu"
                    >
                        <Menu size={20} />
                    </button>

                    {/* Page title breadcrumb */}
                    <div className="hidden md:flex items-center gap-2">
                        <span className="text-xs text-gray-400">Student Portal</span>
                        <ChevronRight size={12} className="text-gray-300" />
                        <span className="text-xs font-semibold text-gray-700 capitalize">
                            {activeId.charAt(0).toUpperCase() + activeId.slice(1)}
                        </span>
                    </div>

                    {/* Right side — avatar */}
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-semibold text-gray-800">{name || "Student"}</p>
                            <p className="text-[10px] text-gray-400">Student</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1D61D2] to-[#112B66] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            {initials}
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#F8FAFC]">
                    <div className="p-5 md:p-8 max-w-[1920px] mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
