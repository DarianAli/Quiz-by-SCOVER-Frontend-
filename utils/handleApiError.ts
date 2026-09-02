import axios, { AxiosError } from "axios";

export type ApiResponse<T> =
  | { status: true; data: T; message: string }
  | { status: false; message: string }

interface ServerErrorPayload {
  message: string;
}

export interface ApiErrorResult {
  status: false;
  message: string;
}

export function handleApiError(
  error: unknown,
  customContext?: string
): { status: false; message: string } {
  const ctx = customContext ?? "request";

  if (axios.isAxiosError<ServerErrorPayload>(error)) {
    if (error.response) {
      const msg = error.response.data?.message ?? `Server error (${error.response.status})`;
      console.error(`[API] ${ctx}:`, msg);
      return { status: false, message: msg };
    }

    if (error.request) {
      const msg = "Tidak ada respons dari server. Cek koneksi jaringan.";
      console.error(`[Network] ${ctx}:`, msg);
      return { status: false, message: msg };
    }
  }

  const raw = error instanceof Error ? error.message : String(error);
  const msg = `Terjadi kesalahan tidak terduga saat ${ctx}: ${raw}`;
  console.error("[Unknown]", msg);
  return { status: false, message: msg };
}