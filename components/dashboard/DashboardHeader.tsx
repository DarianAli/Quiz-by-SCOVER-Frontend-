"use client"
import Link from "next/link";
import { Search, Menu, Bell } from "lucide-react";
import ProfilePicTest from "@/public/images/profile.jpeg";
import { IAdmin } from "@/app/types";

type Props = {
    title: string;
    name: string;
    role: string;
    onMobileMenuToggle: () => void;
};

const DashboardHeader = ({ title, name, role, onMobileMenuToggle }: Props) => {
    // Generate simple greeting based on hour (optional, but requested by user)
    const hour = new Date().getHours();
    let greeting = "Good Evening";
    if (hour < 12) greeting = "Good Morning";
    else if (hour < 17) greeting = "Good Afternoon";

    const displayDate = new Date().toLocaleDateString("en-US", {
        weekday: 'long', 
        month: 'long', 
        day: 'numeric'
    });

    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#EAEAEA] px-5 md:px-8 py-4 flex items-center justify-between gap-4 md:gap-8 h-[88px] transition-all duration-300">
            {/* Left: Hamburger (mobile only) + Greeting */}
            <div className="flex items-center gap-4">
                <button
                    className="md:hidden p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors focus:ring-2 focus:ring-[#0B5C8C]/20 outline-none"
                    onClick={onMobileMenuToggle}
                    aria-label="Open sidebar"
                >
                    <Menu className="w-6 h-6" strokeWidth={1.5} />
                </button>
                
                <div className="hidden sm:block">
                    <h1 className="text-xl md:text-2xl font-bold text-[#083E63]">
                        {title || `${greeting}, ${name.split(" ")[0]}!`}
                    </h1>
                    <p className="text-sm text-gray-400 font-medium">
                        {displayDate}
                    </p>
                </div>
            </div>

            {/* Center: Search */}
            <div className="flex-1 max-w-xl hidden md:flex items-center">
                <div className="relative w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#0B5C8C] transition-colors" strokeWidth={1.5} />
                    <input 
                        type="text" 
                        placeholder="What do you want to study today?" 
                        className="w-full bg-[#F8FAFC] border border-[#EAEAEA] rounded-full py-2.5 pl-12 pr-4 text-sm text-gray-700 outline-none focus:bg-white focus:border-[#0B5C8C] focus:ring-4 focus:ring-[#0B5C8C]/10 transition-all duration-300"
                    />
                </div>
            </div>

            {/* Right: Notifications & Profile */}
            <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                <button className="hidden sm:flex relative p-2.5 text-gray-400 hover:text-[#0B5C8C] bg-[#F8FAFC] rounded-full hover:bg-blue-50 transition-colors focus:ring-2 focus:ring-[#0B5C8C]/20 outline-none">
                    <Bell className="w-5 h-5" strokeWidth={1.5} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#F9C73D] rounded-full ring-2 ring-white"></span>
                </button>

                <div className="w-[1px] h-8 bg-[#EAEAEA] hidden sm:block"></div>

                <Link href="#" className="flex items-center gap-3 group focus:outline-none">
                    <div className="flex flex-col items-end hidden md:block transition-all duration-300 group-hover:-translate-y-0.5">
                        <p className="text-sm font-bold text-[#083E63]">{name || "User Name"}</p>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{role || "Role"}</p>
                    </div>
                    <img
                        src={ProfilePicTest.src}
                        alt="Profile"
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-[#EAEAEA] group-hover:ring-[#0B5C8C]/30 group-focus:ring-[#0B5C8C] shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md"
                    />
                </Link>
            </div>
        </header>
    );
};

export default DashboardHeader;
