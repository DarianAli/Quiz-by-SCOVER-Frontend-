import { type ReactNode } from "react";

type Props = {
    title: string;
    subtitle?: string;
    action?: ReactNode;
};

const SectionTitle = ({ title, subtitle, action }: Props) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-3">
            <div>
                <h3 className="text-xl font-bold text-[#083E63]">{title}</h3>
                {subtitle && (
                    <p className="text-sm font-medium text-gray-500 mt-1">{subtitle}</p>
                )}
            </div>
            {action && (
                <div className="shrink-0 mt-2 sm:mt-0">
                    {action}
                </div>
            )}
        </div>
    );
};

export default SectionTitle;
