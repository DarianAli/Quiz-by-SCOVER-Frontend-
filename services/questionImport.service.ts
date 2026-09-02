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
  ai_equation_flag?: boolean
}

export interface ParseImportResponse {
  import_session_id: string
  source_filename: string
  total_questions: number
  questions: ImportQuestion[]
  warnings_count: number
}

export const questionImportService = {
  /** Upload 1 file docx/doc untuk di-parse. Boleh dipanggil berkali-kali untuk multi-file. */
  parseFile: async (file: File): Promise<ParseImportResponse> => {
    const token = getCookie("token") as string
    const formData = new FormData()
    formData.append("file", file)

    const response = await post(`${BASE_API_URL}/import/parse`, formData, token)
    if (!response.data?.success) {
      throw new Error(response.data?.message || "Gagal memproses file.")
    }

    return response.data.data as ParseImportResponse
  },

  mediaUrl: (sessionId: string, filename: string) =>
    `${BASE_API_URL}/import/${sessionId}/media/${encodeURIComponent(filename)}`,

  commit: async (
    sessionId: string,
    quizId: string,
    questions: {
      question_text: string
      question_type?: string
      difficulty?: string
      poin?: number
      discussion?: string | null
      /** Legacy single image (backward compat) */
      image?: string | null
      /** All images from Word import — preferred over image when present */
      images?: string[]
      options: { text: string; is_correct: boolean }[]
    }[]
  ) => {
    const res = await post(`${BASE_API_URL}/import/${sessionId}/commit`, { quizId, questions })
    if (!res.data?.success) throw new Error(res.data?.message || "Gagal menyimpan soal.")
    return res.data.data as { quiz_uuid: string; imported_count: number }
  },

  discard: async (sessionId: string) => {
    await drop(`${BASE_API_URL}/import/${sessionId}`)
  },
}