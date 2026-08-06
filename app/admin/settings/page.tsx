"use client";

import { motion } from "framer-motion";
import { Settings, Wrench, Clock } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-center max-w-sm w-full"
            >
                {/* Icon */}
                <div className="relative inline-flex items-center justify-center mb-6">
                    <div className="w-24 h-24 bg-[#EAF3FF] rounded-3xl flex items-center justify-center shadow-[0_8px_32px_rgba(29,97,210,0.12)]">
                        <Settings size={40} className="text-[#1D61D2]" style={{ animation: "spin 8s linear infinite" }} />
                    </div>
                    {/* Decorative dot */}
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#F4C430] rounded-full border-2 border-white flex items-center justify-center">
                        <Clock size={10} className="text-[#0d4669]" />
                    </span>
                </div>

                {/* Text */}
                <h1 className="text-2xl font-black text-[#0d4669] mb-2">Coming Soon</h1>
                <p className="text-sm text-gray-500 leading-relaxed">
                    Halaman <strong className="text-gray-700">Settings</strong> sedang dalam pengembangan.
                    <br />
                    Fitur ini akan segera hadir untuk kamu!
                </p>

                {/* Features preview */}
                <div className="mt-6 space-y-2.5 text-left">
                    {[
                        { icon: "👤", label: "Edit Profil & Foto" },
                        { icon: "🔒", label: "Ubah Password" },
                        { icon: "🔔", label: "Notifikasi & Reminder" },
                        { icon: "🌙", label: "Tampilan & Tema" },
                    ].map((item, i) => (
                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 0.5, x: 0 }}
                            transition={{ delay: 0.2 + i * 0.07 }}
                            className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-2.5 shadow-sm"
                        >
                            <span className="text-base">{item.icon}</span>
                            <span className="text-sm font-medium text-gray-500">{item.label}</span>
                            <span className="ml-auto text-[10px] font-bold text-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">Soon</span>
                        </motion.div>
                    ))}
                </div>

                {/* Wrench icon decoration */}
                <div className="flex items-center justify-center gap-2 mt-8 text-[#1D61D2]/40">
                    <Wrench size={14} />
                    <span className="text-xs font-medium">Sedang dalam pengembangan</span>
                </div>
            </motion.div>

            <style jsx global>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
