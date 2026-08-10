import { get, post, drop } from "@/lib/api-bridge"
import { getCookie } from "@/lib/client-cookie"
import { BASE_API_URL } from "@/global"

export interface ImportOption {
    letter: string
    text: string
}

export interface ImportQuestion {
    number: number
    question_text: string
    options: ImportOption[]
    correct_letter: string | null
    images: string[]
    warnings: string[]
    ai_suggested_difficulty?: "EASY" | "MEDIUM" | "HARD"
    ai_suggested_topic?: string
    ai_suggested_flag?: boolean
}

export interface ParseImportResponse {
    import_sessions_id: string
    source_filename: string
    total_questions: number
    questions: ImportQuestion[]
    warnings_count: number
}

export const questionImportService = {
    /** Upload 1 file docx/doc untuk di-parse. Boleh dipanggil berkali-kali untuk multi-file */
    parseFile: async (file: File): Promise<ParseImportResponse> => {
        const token = getCookie("token") as string
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch(`${BASE_API_URL}/question-import/parse`, {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            body: formData
        })
        const json = await response.json()
        if (!response.ok || !json?.success) {
            throw new Error(json?.message || "Gagal memproses file.")
        }
        return json.data as ParseImportResponse
    },

    mediaUrl: (sessionId: string, filename: string) => 
        `${BASE_API_URL}/questions-import/${sessionId}/media/${encodeURIComponent(filename)}`,

    commit: async (
        sessionId: string,
        quizId: string,
        questions: {
            question_text: string
            question_type?: string
            difficulty?: string
            poin?: number
            disscussion?: string | null
            image?: string | null
            options: { text: string; is_correct: boolean }[]
        }[]
    ) => {
        const response = await post(`${BASE_API_URL}/question-import/${sessionId}/commit`, { quizId, questions })
        if (!response.data?.success) throw new Error(response.data?.message || "Gagal menyimpan soal.")
            return response.data.data as { quiz_uuid: string; imported_count: number }
    },

    discard: async (sessionId: string) => {
        await drop(`${BASE_API_URL}/question-import/${sessionId}`)
    },
}