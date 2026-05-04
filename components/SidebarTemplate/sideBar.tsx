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
import ScoverLogo from "@/public/images/scover_logo1.png";
import ProfilePicTest from "@/public/images/profile.jpeg";

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
                "fixed md:sticky top-0 h-screen bg-white border-r border-gray-100",
                "flex flex-col transition-all duration-300 z-50",
                collapsed ? "w-[72px]" : "w-64",
                mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
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
                <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-5">
                    {Object.entries(grouped).map(([category, menus]) => (
                        <div key={category}>
                            {!collapsed && (
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">
                                    {CATEGORY_LABEL[category] ?? category}
                                </p>
                            )}
                            <div className="flex flex-col gap-0.5">
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
                <div className="p-3 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className={[
                            "flex items-center gap-2.5 w-full rounded-xl py-2.5 text-sm font-medium",
                            "text-red-500 hover:bg-red-50 transition-colors",
                            collapsed ? "justify-center px-2" : "px-4",
                        ].join(" ")}
                    >
                        <LogoutIcon />
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* ── Main ── */}
            <div className="flex-1 flex flex-col md:h-screen min-w-0">

                {/* Header */}
                <header className="sticky top-0 z-40 flex justify-between items-center px-5 md:px-8 h-20 bg-white border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <button
                            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                            onClick={() => setMobileOpen(true)}
                        >
                            <HamburgerIcon />
                        </button>
                        <h1 className="text-lg md:text-xl font-semibold text-gray-800">{title}</h1>
                    </div>

                    <Link href="/admin/profile">
                        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                            <img
                                src={ProfilePicTest.src}
                                alt="Profile"
                                className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100"
                            />
                            <div className="hidden md:block leading-tight">
                                <p className="text-sm font-semibold text-gray-800">{name || "User Name"}</p>
                                <p className="text-xs text-gray-400">{admin?.role || "Role"}</p>
                            </div>
                        </div>
                    </Link>
                </header>

                {/* Content */}
                <main className="flex-1 p-5 md:p-8 md:overflow-y-auto">
                    {children}
                </main>
            </div>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/25 z-40 md:hidden backdrop-blur-[1px]"
                    onClick={() => setMobileOpen(false)}
                />
            )}
        </div>
    );
};

export default Sidebar;