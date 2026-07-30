import { BookOpen, UserCheck, Flame } from "lucide-react";

export type PastelColor = "blue" | "mint" | "yellow" | "purple" | "pink";

const PASTEL_VARIANTS: Record<PastelColor, { bg: string; text: string; ring: string }> = {
    blue: { bg: "bg-[#EBF4FA]", text: "text-[#0B5C8C]", ring: "ring-[#0B5C8C]" },
    mint: { bg: "bg-[#E8F7F0]", text: "text-[#107049]", ring: "ring-[#107049]" },
    yellow: { bg: "bg-[#FFF8E5]", text: "text-[#B38700]", ring: "ring-[#F9C73D]" },
    purple: { bg: "bg-[#F2EEFA]", text: "text-[#6245A0]", ring: "ring-[#6245A0]" },
    pink: { bg: "bg-[#FAEAF0]", text: "text-[#A82B58]", ring: "ring-[#A82B58]" },
};

export type TentorAvatar = {
    uuid: string;
    name: string;
    photo: string;
}

type Props = {
    subject: string;
    totalQuiz: number;
    totalStudents: number;
    tentors: TentorAvatar[];
    isMyClass?: boolean;
    annualGoal?: number | null;
    curriculumProgress?: number | null;
    color?: PastelColor;
};

function initials(name: string): string {
    return name
        .split("")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join("")
}

const ProgressBar = ({ progress, colorConfig }: { progress: number, colorConfig: any }) => (
    <div className="w-full bg-white/60 rounded-full h-2 overflow-hidden mt-4 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] ring-1 ring-black/5">
        <div 
            className={`h-full rounded-full transition-all duration-1000 ease-in-out bg-current ${colorConfig.text}`}
            style={{ width: `${progress}%` }}
        />
    </div>
);

const TentorAvatarStack = ({ tentors, theme }: { tentors: TentorAvatar[]; theme: any }) => {
    const visible = tentors.slice(0, 3);
    const extra = tentors.length - visible.length;

    if (tentors.length === 0) {
        return <span className="text-xs text-gray-400">Belum ada tentor</span>
    }

    return (
        <div className="flex items-center -space-x-2">
            {visible.map((t) => (
                <div
                    key={t.uuid}
                    title={t.name}
                    className="w-6 h-6 rounded-full ring-2 ring-white overflow-hidden flex items-center justify-center shrink-0"
                >
                    {t.photo ? (
                        <img src={t.photo} alt={t.name} className="w-full h-full object-cover"/>
                    ) : (
                        <span className={`text-[9px] font-bold ${theme.text}`}>{initials(t.name)}</span>
                    )}
                </div>
            ))}
            {extra > 0 && (
                <div className="w-6 h-6 rounded-full ring-2 ring-white bg-gray-200 flex items-center shrink-0">
                    <span className="text-[9px] font-bold text-gray-600">+{extra}</span>
                </div>
            )}
        </div>
    )
}

const SubjectCard = ({ subject, tentors, totalStudents, annualGoal = null, curriculumProgress = null, isMyClass = false, totalQuiz, color = "blue" }: Props) => {
    const theme = PASTEL_VARIANTS[color];

    return (
        <div className={`${theme.bg} rounded-2xl p-5 min-w-[280px] w-full snap-start border border-white/40 shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer relative overflow-hidden`}>
            {/* Top Right Icon Badge */}
            <div className="absolute top-4 right-4 bg-white/40 p-2 rounded-xl backdrop-blur-sm group-hover:bg-white/60 transition-colors">
                <BookOpen className={`w-5 h-5 ${theme.text}`} strokeWidth={1.5} />
            </div>
 
            <div className="space-y-1 pr-10">
                {isMyClass && (
                    <span className={`inline-flex items-center gap-1 bg-white/70 px-2 py-0.5 rounded-full text-[10px] font-bold ${theme.text} mb-1`}>
                        ✓ Kelas Saya
                    </span>
                )}
                <h4 className={`text-lg font-extrabold ${theme.text}`}>{subject}</h4>
                <p className="text-sm font-medium text-gray-600 opacity-80">
                    {totalQuiz} modul · {totalStudents} murid
                </p>
            </div>
 
            <div className="mt-6 flex items-center justify-between z-10 relative">
                <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wider font-bold text-gray-400">Tentor</span>
                    <TentorAvatarStack tentors={tentors} theme={theme} />
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
                    <span className="text-xs uppercase font-bold text-gray-500">Curriculum Goal</span>
                    <span className={`text-sm font-bold ${theme.text}`}>
                        {curriculumProgress !== null ? `${curriculumProgress}%` : "—"}
                    </span>
                </div>
                <ProgressBar progress={curriculumProgress ?? 0} colorConfig={theme} />
                <p className="text-[11px] text-gray-400 mt-1">
                    {annualGoal ? `Annual goal · ${annualGoal} modul` : "Target tahunan belum diatur"}
                </p>
            </div>
        </div>
    );
};

export default SubjectCard;
