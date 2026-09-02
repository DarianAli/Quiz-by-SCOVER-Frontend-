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
    <div className="relative group">
        {/* Active Indicator */}
        {active && (
            <div
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[#0B5C8C] rounded-r-full transition-all duration-300 ${
                    collapsed ? "left-[-4px]" : "left-[-8px]"
                }`}
            />
        )}

        <Link
            href={path}
            title={collapsed ? label : undefined}
            className={[
                "flex items-center font-medium rounded-xl transition-all duration-300 ease-in-out relative hover:pl-5",
                collapsed ? "justify-center p-3 hover:pl-3" : "gap-3 px-4 py-2.5",
                active
                    ? "text-[#0B5C8C] bg-[#0B5C8C]/10 shadow-[inset_0_2px_4px_rgba(11,92,140,0.05)]"
                    : "text-gray-500 hover:text-[#0B5C8C] hover:bg-[#F8FAFC]",
            ].join(" ")}
        >
            <span
                className={`text-[20px] shrink-0 transition-transform duration-300 ${
                    active
                        ? "text-[#0B5C8C] scale-110"
                        : "text-gray-400 group-hover:text-[#0B5C8C] group-hover:scale-110"
                }`}
            >
                {icon}
            </span>
            {!collapsed && <span className="text-sm truncate">{label}</span>}
        </Link>
    </div>
);

export default MenuItem;