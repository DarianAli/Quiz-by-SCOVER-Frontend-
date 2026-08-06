"use client"

import { Sigma, Compass, Dna, FlaskConical, Landmark, Languages, Atom, BookOpen } from "lucide-react"
import { SUBJECT_THEME, type SubjectThemeKey } from "./subject-themes"

const ICON_MAP: Record<SubjectThemeKey, React.ComponentType<{ size?: number; className?: string }>> = {
  math: Sigma,
  geometry: Compass,
  physics: Atom,
  biology: Dna,
  genetics: Dna,
  chemistry: FlaskConical,
  history: Landmark,
  english: Languages,
}

export function getSubjectIcon(key: SubjectThemeKey, size: number = 18, className?: string) {
  const Icon = ICON_MAP[key] ?? BookOpen
  return <Icon size={size} className={className} />
}

const THEME_KEYS = Object.keys(SUBJECT_THEME) as SubjectThemeKey[]

/**
 * Pilih SubjectThemeKey secara deterministik dari sebuah seed (idealnya subject.uuid).
 * Dengan basis uuid (bukan index posisi array), warna & ikon subject tetap sama
 * di mana pun ditampilkan (dashboard, task page) dan tidak berubah walau urutan
 * list berubah (mis. saat subject "kelas saya" dipindah ke urutan pertama).
 */
export function pickSubjectTheme(seed: string): SubjectThemeKey {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return THEME_KEYS[hash % THEME_KEYS.length]
}