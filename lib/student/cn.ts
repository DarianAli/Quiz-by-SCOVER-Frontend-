/**
 * ⚠️ If your project already exports a `cn()` helper (e.g. from
 * "@/lib/utils" via clsx + tailwind-merge), delete this file and use that
 * one instead — this is a minimal drop-in so components compile standalone.
 */

export function cn(...values: Array<string | false | null |undefined>): string {
    return values.filter(Boolean).join(" ")
}