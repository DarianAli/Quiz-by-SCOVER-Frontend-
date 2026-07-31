"use client"

import { getSubjectTheme, type SubjectThemeKey } from "@/lib/theme/subject-themes"
import { getSubjectIcon } from "@/lib/theme/subject-visuals"

export type TentorAvatar = {
    uuid: string;
    name: string;
    photo: string | null;
};

type Props = {
    subject: string;
    themeKey: SubjectThemeKey;
    totalQuiz: number;
    totalStudents: number;
    tentors: TentorAvatar[];
    isMyClass?: boolean;
    /** Target kurikulum tahunan (jumlah modul/quiz). null = belum diatur admin. */
    annualGoal?: number | null;
    /** Persentase progress terhadap annualGoal. null = tidak bisa dihitung (annualGoal belum ada). */
    curriculumProgress?: number | null;
};

function initials(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join("");
}

const TentorAvatarStack = ({ tentors, theme }: { tentors: TentorAvatar[]; theme: any }) => {
    const visible = tentors.slice(0, 3);
    const extra = tentors.length - visible.length;

    if (tentors.length === 0) {
        return <span className="text-xs text-slate-400">Belum ada tentor</span>;
    }

    return (
        <div className="flex items-center -space-x-2">
            {visible.map((t) => (
                <div
                    key={t.uuid}
                    title={t.name}
                    className="w-6 h-6 rounded-full ring-2 ring-white bg-white overflow-hidden flex items-center justify-center shrink-0"
                >
                    {t.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.photo} alt={t.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className={`text-[9px] font-bold ${theme.text}`}>{initials(t.name)}</span>
                    )}
                </div>
            ))}
            {extra > 0 && (
                <div className="w-6 h-6 rounded-full ring-2 ring-white bg-slate-200 flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-bold text-slate-600">+{extra}</span>
                </div>
            )}
        </div>
    );
};

const SubjectCard = ({
    subject,
    themeKey,
    totalQuiz,
    totalStudents,
    tentors,
    isMyClass = false,
    annualGoal = null,
    curriculumProgress = null,
}: Props) => {
    const theme = getSubjectTheme(themeKey);

    return (
        <div
            className={`group relative rounded-2xl p-5 ${theme.cardBg} ring-1 ring-black/5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden`}
        >
            <div className="flex items-start gap-3 mb-4">
                <div
                    className={`w-11 h-11 rounded-2xl ${theme.iconBg} text-white flex items-center justify-center shadow-md shrink-0 transition-transform duration-200 group-hover:-translate-y-1 group-hover:rotate-3`}
                >
                    {getSubjectIcon(themeKey, 20)}
                </div>
                <div className="min-w-0">
                    {isMyClass && (
                        <span className={`inline-flex items-center gap-1 ${theme.badge} px-2 py-0.5 rounded-full text-[10px] font-bold mb-1`}>
                            ✓ Kelas Saya
                        </span>
                    )}
                    <h4 className={`text-lg font-extrabold ${theme.text} truncate`}>{subject}</h4>
                    <p className="text-sm font-medium text-slate-600">
                        {totalQuiz} modul · {totalStudents} murid
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between z-10 relative">
                <div className="flex flex-col gap-1">
                    <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Tentor</span>
                    <TentorAvatarStack tentors={tentors} theme={theme} />
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-0.5">Quizzes</span>
                    <div className={`flex items-center gap-1 text-sm font-semibold ${theme.text}`}>
                        {totalQuiz} Total
                    </div>
                </div>
            </div>

            <div className="mt-5 relative z-10">
                <div className="flex justify-between items-end mb-1.5">
                    <span className="text-xs text-slate-500">Curriculum progress</span>
                    <span className={`text-xs font-semibold ${theme.text}`}>
                        {curriculumProgress !== null ? `${curriculumProgress}%` : "—"}
                    </span>
                </div>
                <div className="h-1.5 rounded-full bg-black/5 overflow-hidden">
                    <div
                        className={`h-full rounded-full ${theme.progressFill} transition-all duration-700 ease-out`}
                        style={{ width: `${curriculumProgress ?? 0}%` }}
                    />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                    {annualGoal ? `Annual goal · ${annualGoal} modul` : "Target tahunan belum diatur"}
                </p>
            </div>
        </div>
    );
};

export default SubjectCard;