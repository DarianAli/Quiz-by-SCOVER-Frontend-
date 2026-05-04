import Link from "next/link";
import { ReactNode } from "react";

type Props = {
    icon: ReactNode;
    label: string;
    path: string;
    active?: boolean;
    collapsed?: boolean;
};

const MenuItem = ({ icon, label, path, active, collapsed }: Props) => (
    <Link
        href={path}
        title={collapsed ? label : undefined}
        className={[
            "flex items-center font-medium rounded-xl transition-all duration-200 group relative",
            collapsed ? "justify-center p-3" : "gap-3 px-4 py-2.5",
            active
                ? "text-primary bg-primary/10"
                : "text-gray-500 hover:text-primary hover:bg-primary/8",
        ].join(" ")}
    >
        <span className={`text-[18px] shrink-0 ${active ? "text-primary" : "text-gray-400 group-hover:text-primary"} transition-colors`}>
            {icon}
        </span>

        {!collapsed && (
            <span className="text-sm truncate">{label}</span>
        )}

        {/* Tooltip saat collapsed */}
        {collapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                {label}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
            </div>
        )}
    </Link>
);

export default MenuItem;