import { BookOpen, UserCheck, Flame } from "lucide-react";

export type PastelColor = "blue" | "mint" | "yellow" | "purple" | "pink";

const PASTEL_VARIANTS: Record<PastelColor, { bg: string; text: string; ring: string }> = {
    blue: { bg: "bg-[#EBF4FA]", text: "text-[#0B5C8C]", ring: "ring-[#0B5C8C]" },
    mint: { bg: "bg-[#E8F7F0]", text: "text-[#107049]", ring: "ring-[#107049]" },
    yellow: { bg: "bg-[#FFF8E5]", text: "text-[#B38700]", ring: "ring-[#F9C73D]" },
    purple: { bg: "bg-[#F2EEFA]", text: "text-[#6245A0]", ring: "ring-[#6245A0]" },
    pink: { bg: "bg-[#FAEAF0]", text: "text-[#A82B58]", ring: "ring-[#A82B58]" },
};

type Props = {
    subject: string;
    description: string;
    teacher: string;
    progress: number;
    totalQuiz: number;
    color?: PastelColor;
};

export const MathRound = ({ value }: { value: number }) => Math.round(value);

const ProgressBar = ({ progress, colorConfig }: { progress: number, colorConfig: any }) => (
    <div className="w-full bg-white/60 rounded-full h-2 overflow-hidden mt-4 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] ring-1 ring-black/5">
        <div 
            className={`h-full rounded-full transition-all duration-1000 ease-in-out bg-current ${colorConfig.text}`}
            style={{ width: `${progress}%` }}
        />
    </div>
);

const SubjectCard = ({ subject, description, teacher, progress, totalQuiz, color = "blue" }: Props) => {
    const theme = PASTEL_VARIANTS[color];

    return (
        <div className={`${theme.bg} rounded-2xl p-5 min-w-[280px] w-full snap-start border border-white/40 shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer relative overflow-hidden`}>
            {/* Top Right Icon/Badge */}
            <div className="absolute top-4 right-4 bg-white/40 p-2 rounded-xl backdrop-blur-sm group-hover:bg-white/60 transition-colors">
                <BookOpen className={`w-5 h-5 ${theme.text}`} strokeWidth={1.5} />
            </div>

            <div className="space-y-1 pr-10">
                <h4 className={`text-lg font-extrabold ${theme.text}`}>{subject}</h4>
                <p className="text-sm font-medium text-gray-600 line-clamp-1 opacity-80">{description}</p>
            </div>

            <div className="mt-6 flex items-center justify-between z-10 relative">
                <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-0.5">Teacher</span>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                        <UserCheck className="w-4 h-4 text-gray-400" />
                        <span className="truncate max-w-[100px]">{teacher}</span>
                    </div>
                </div>

                <div className="flex flex-col items-end">
                     <span className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-0.5">Quizzes</span>
                     <div className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                        <Flame className={`w-4 h-4 ${theme.text}`} />
                        {totalQuiz} Total
                     </div>
                </div>
            </div>

            <div className="mt-5 relative z-10">
                <div className="flex justify-between items-end mb-1">
                    <span className="text-xs uppercase font-bold text-gray-500">Progress</span>
                    <span className={`text-sm font-bold ${theme.text}`}>{progress}%</span>
                </div>
                <ProgressBar progress={progress} colorConfig={theme} />
            </div>
        </div>
    );
};

export default SubjectCard;
