export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  const diffMs = now.getTime() - then;
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 1) return "Active now";
  if (diffMin < 60) return `Last active ${diffMin}m ago`;

  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `Last active ${diffHr}h ago`;

  const diffDay = Math.round(diffHr / 24);
  if (diffDay === 1) return "Last active yesterday";
  if (diffDay < 7) return `Last active ${diffDay}d ago`;

  const diffWeek = Math.round(diffDay / 7);
  return `Last active ${diffWeek}w ago`;
}

export function formatQuizDate(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const diffDay = Math.round((now.getTime() - then.getTime()) / 86_400_000);
  if (diffDay === 0) return "Today";
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  return then.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** "2j lalu" / "3h lalu" / "Baru saja" — Bahasa Indonesia relative time */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  const d = Math.floor(diff / 86_400_000);
  if (d >= 1) return `${d}h lalu`;
  if (h >= 1) return `${h}j lalu`;
  return "Baru saja";
}

/** Greeting based on current hour */
export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Selamat Pagi";
  if (h < 15) return "Selamat Siang";
  if (h < 18) return "Selamat Sore";
  return "Selamat Malam";
}

/** Score colour tokens — used in result and badge */
export function getScoreColor(score: number): {
  ring: string; track: string; text: string; bg: string; label: string;
} {
  if (score >= 80)
    return { ring: "#10b981", track: "#D1FAE5", text: "text-emerald-600", bg: "bg-emerald-50", label: "Luar Biasa! 🎉" };
  if (score >= 60)
    return { ring: "#F4C430", track: "#FFF8E1", text: "text-amber-600",   bg: "bg-amber-50",   label: "Cukup Baik 👍" };
  return   { ring: "#ef4444", track: "#FEE2E2", text: "text-red-600",     bg: "bg-red-50",     label: "Perlu Ditingkatkan 💪" };
}

/** Format quiz duration: 90 → "1j 30m" / 45 → "45 menit" */
export function formatDuration(minutes: number): string {
  const m = Math.floor(minutes);
  const s = Math.round((minutes - m) * 60);
  if (s > 0) return `${m}m ${s}s`;
  if (m >= 60) return `${Math.floor(m / 60)}j ${m % 60}m`;
  return `${m} menit`;
}

