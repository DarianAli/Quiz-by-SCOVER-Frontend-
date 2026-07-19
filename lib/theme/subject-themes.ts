// Theme engine untuk Subject.
// PENTING: setiap value di sini adalah STRING KELAS TAILWIND LENGKAP
// (bukan hasil concat "text-" + color), supaya Tailwind JIT bisa
// mendeteksinya lewat static analysis. Jangan ubah pola ini saat
// menambah subject baru — selalu tulis kelas lengkap per key.



export type SubjectThemeKey = 
    | "math"
    | "geometry"
    | "physics"
    | "biology"
    | "genetics"
    | "chemistry"
    | "history"
    | "english";

export interface SubjectTheme {
    label: string
    /** teks aksen (judul, angka penting) */
    text: string
    /** background gradient lembut untuk card */
    cardBg: string
    /** background gradient solid untuk icon bulat / header */
    iconBg: string
    /** badge/tag kecil (mis. subject pill di preview) */
    badge: string
    /** tombol utama (Manage, Continue, dst.) */
    button: string
    /** border saat card terpilih (quiz create -> subject track) */
    selectedBorder: string
    /** ring saat focus/hover terpilih */
    focusRing: string
    /** progress bar fill */
    progressFill: string
    /** preview panel gradient (quiz create live preview) */
    previewBg: string
}

export const SUBJECT_THEME: Record<SubjectThemeKey, SubjectTheme> = {
    math: {
        label: "Mathematics",
        text: "text-blue-700",
        cardBg: "bg-gradient-to-br from-blue-50 to-blue-100/60",
        iconBg: "bg-gradient-to-br from-[#1D61D2] to-[#174EA6]",
        badge: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100",
        button:
        "bg-gradient-to-r from-[#1D61D2] to-[#174EA6] hover:from-[#174EA6] hover:to-[#112B66] text-white",
        selectedBorder: "border-blue-400",
        focusRing: "focus-visible:ring-2 focus-visible:ring-blue-400/60",
        progressFill: "bg-gradient-to-r from-[#1D61D2] to-[#3B7DDE]",
        previewBg: "bg-gradient-to-br from-[#1D61D2] to-[#174EA6]",
    },
    geometry: {
        label: "Geometry",
        text: "text-pink-700",
        cardBg: "bg-gradient-to-br from-pink-50 to-rose-100/60",
        iconBg: "bg-gradient-to-br from-pink-500 to-rose-500",
        badge: "bg-pink-50 text-pink-700 ring-1 ring-inset ring-pink-100",
        button: "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white",
        selectedBorder: "border-pink-400",
        focusRing: "focus-visible:ring-2 focus-visible:ring-pink-400/60",
        progressFill: "bg-gradient-to-r from-pink-500 to-rose-400",
        previewBg: "bg-gradient-to-br from-pink-500 to-rose-500",
    },
    physics: {
        label: "Physics",
        text: "text-purple-700",
        cardBg: "bg-gradient-to-br from-purple-50 to-violet-100/60",
        iconBg: "bg-gradient-to-br from-purple-500 to-violet-600",
        badge: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-100",
        button: "bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white",
        selectedBorder: "border-purple-400",
        focusRing: "focus-visible:ring-2 focus-visible:ring-purple-400/60",
        progressFill: "bg-gradient-to-r from-purple-500 to-violet-500",
        previewBg: "bg-gradient-to-br from-purple-500 to-violet-600",
    },
    biology: {
        label: "Biology",
        text: "text-green-700",
        cardBg: "bg-gradient-to-br from-green-50 to-emerald-100/60",
        iconBg: "bg-gradient-to-br from-green-500 to-emerald-600",
        badge: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-100",
        button: "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white",
        selectedBorder: "border-green-400",
        focusRing: "focus-visible:ring-2 focus-visible:ring-green-400/60",
        progressFill: "bg-gradient-to-r from-green-500 to-emerald-500",
        previewBg: "bg-gradient-to-br from-green-500 to-emerald-600",
    },
    genetics: {
        label: "Genetics",
        text: "text-emerald-700",
        cardBg: "bg-gradient-to-br from-emerald-50 to-teal-100/60",
        iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
        badge: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100",
        button: "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white",
        selectedBorder: "border-emerald-400",
        focusRing: "focus-visible:ring-2 focus-visible:ring-emerald-400/60",
        progressFill: "bg-gradient-to-r from-emerald-500 to-teal-500",
        previewBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    },
    chemistry: {
        label: "Chemistry",
        text: "text-orange-700",
        cardBg: "bg-gradient-to-br from-orange-50 to-amber-100/60",
        iconBg: "bg-gradient-to-br from-orange-500 to-amber-600",
        badge: "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-100",
        button: "bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white",
        selectedBorder: "border-orange-400",
        focusRing: "focus-visible:ring-2 focus-visible:ring-orange-400/60",
        progressFill: "bg-gradient-to-r from-orange-500 to-amber-500",
        previewBg: "bg-gradient-to-br from-orange-500 to-amber-600",
    },
    history: {
        label: "History",
        text: "text-amber-800",
        cardBg: "bg-gradient-to-br from-amber-50 to-stone-100/60",
        iconBg: "bg-gradient-to-br from-amber-700 to-stone-600",
        badge: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-100",
        button: "bg-gradient-to-r from-amber-700 to-stone-600 hover:from-amber-800 hover:to-stone-700 text-white",
        selectedBorder: "border-amber-500",
        focusRing: "focus-visible:ring-2 focus-visible:ring-amber-500/60",
        progressFill: "bg-gradient-to-r from-amber-700 to-stone-500",
        previewBg: "bg-gradient-to-br from-amber-700 to-stone-600",
    },
    english: {
        label: "English",
        text: "text-indigo-700",
        cardBg: "bg-gradient-to-br from-indigo-50 to-blue-100/60",
        iconBg: "bg-gradient-to-br from-indigo-500 to-blue-600",
        badge: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-100",
        button: "bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white",
        selectedBorder: "border-indigo-400",
        focusRing: "focus-visible:ring-2 focus-visible:ring-indigo-400/60",
        progressFill: "bg-gradient-to-r from-indigo-500 to-blue-500",
        previewBg: "bg-gradient-to-br from-indigo-500 to-blue-600",
    },
}

export function getSubjectTheme(key: SubjectThemeKey): SubjectTheme {
    return SUBJECT_THEME[key] ?? SUBJECT_THEME.math
}
