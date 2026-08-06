"use client";

import React, { useEffect, useState } from "react";
import { X, Target, BookOpen, Users2, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { subjectService } from "@/services/subject.service";

// ─── Types ─────────────────────────────────────────────────────────────────
type ClassOption = {
    uuid: string;
    id?: number;
    class_name: string;
    class_program?: string | null;
};

export type EditableSubject = {
    uuid: string;
    subject_name: string;
    annual_quiz_target?: number | null;
    classes?: { uuid: string }[];
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    classesList: ClassOption[];
    /** Pass a subject to open in edit mode. Leave undefined/null to create. */
    editSubject?: EditableSubject | null;
    onSubmitSuccess: () => void;
};

// ─── Component ────────────────────────────────────────────────────────────
export function CreateSubjectDialog({
    isOpen,
    onClose,
    classesList,
    editSubject = null,
    onSubmitSuccess,
}: Props) {
    const isEditMode = Boolean(editSubject);

    const [subjectName, setSubjectName] = useState("");
    const [annualGoal, setAnnualGoal] = useState<string>("");
    const [selectedClassUuids, setSelectedClassUuids] = useState<string[]>([]);
    const [errors, setErrors] = useState<{ subject_name?: string; annual_goal?: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset / prefill form whenever the dialog opens or the target subject changes
    useEffect(() => {
        if (!isOpen) return;
        if (editSubject) {
            setSubjectName(editSubject.subject_name);
            setAnnualGoal(
                editSubject.annual_quiz_target != null ? String(editSubject.annual_quiz_target) : ""
            );
            setSelectedClassUuids((editSubject.classes ?? []).map((c) => c.uuid));
        } else {
            setSubjectName("");
            setAnnualGoal("");
            setSelectedClassUuids([]);
        }
        setErrors({});
    }, [isOpen, editSubject]);

    if (!isOpen) return null;

    const toggleClass = (uuid: string) => {
        setSelectedClassUuids((prev) =>
            prev.includes(uuid) ? prev.filter((u) => u !== uuid) : [...prev, uuid]
        );
    };

    const validate = () => {
        const next: typeof errors = {};
        if (!subjectName.trim()) next.subject_name = "Nama mata pelajaran wajib diisi.";
        if (annualGoal !== "" && (isNaN(Number(annualGoal)) || Number(annualGoal) < 1)) {
            next.annual_goal = "Target harus berupa angka minimal 1.";
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            const payload = {
                subject_name: subjectName.trim(),
                annual_quiz_target: annualGoal === "" ? null : Number(annualGoal),
                classId: selectedClassUuids,
            };

            if (isEditMode && editSubject) {
                await subjectService.updateSubject(editSubject.uuid, payload);
                toast.success(`"${subjectName}" berhasil diperbarui.`);
            } else {
                await subjectService.createSubject(payload);
                toast.success(`"${subjectName}" berhasil dibuat.`);
            }

            onSubmitSuccess();
            onClose();
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? "Gagal menyimpan mata pelajaran.";
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-black/5 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 p-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1D61D2]/10 text-[#1D61D2] flex items-center justify-center shrink-0">
                            <BookOpen size={18} />
                        </div>
                        <div>
                            <h3 className="text-base font-extrabold text-slate-900">
                                {isEditMode ? "Edit mata pelajaran" : "Buat mata pelajaran"}
                            </h3>
                            <p className="text-xs text-slate-500">
                                {isEditMode
                                    ? "Perbarui nama, target tahunan, dan kelas."
                                    : "Atur nama, target kuis tahunan, dan kelas."}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                        aria-label="Tutup"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
                    {/* Subject name */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">
                            Nama mata pelajaran
                        </label>
                        <input
                            type="text"
                            value={subjectName}
                            onChange={(e) => setSubjectName(e.target.value)}
                            placeholder="mis. Matematika Dasar"
                            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-shadow ${
                                errors.subject_name
                                    ? "border-red-300 focus:ring-red-200"
                                    : "border-slate-200 focus:ring-[#1D61D2]/20 focus:border-[#1D61D2]"
                            }`}
                        />
                        {errors.subject_name && (
                            <p className="text-xs text-red-500 mt-1">{errors.subject_name}</p>
                        )}
                    </div>

                    {/* Annual goal */}
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">
                            <Target size={12} /> Target kuis tahunan
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                min={1}
                                value={annualGoal}
                                onChange={(e) => setAnnualGoal(e.target.value)}
                                placeholder="mis. 40"
                                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-shadow ${
                                    errors.annual_goal
                                        ? "border-red-300 focus:ring-red-200"
                                        : "border-slate-200 focus:ring-[#1D61D2]/20 focus:border-[#1D61D2]"
                                }`}
                            />
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                                modul
                            </span>
                        </div>
                        {errors.annual_goal ? (
                            <p className="text-xs text-red-500 mt-1">{errors.annual_goal}</p>
                        ) : (
                            <p className="text-[11px] text-slate-400 mt-1">
                                Kosongkan jika belum ingin menetapkan target. Progress dihitung dari
                                jumlah quiz berstatus PUBLISHED dibagi target ini.
                            </p>
                        )}
                    </div>

                    {/* Class assignment */}
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">
                            <Users2 size={12} /> Kelas
                        </label>
                        {classesList.length === 0 ? (
                            <p className="text-xs text-slate-400 rounded-xl border border-dashed border-slate-200 px-3.5 py-3">
                                Belum ada kelas. Buat kelas terlebih dahulu.
                            </p>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                                {classesList.map((c) => {
                                    const checked = selectedClassUuids.includes(c.uuid);
                                    return (
                                        <button
                                            type="button"
                                            key={c.uuid}
                                            onClick={() => toggleClass(c.uuid)}
                                            className={`text-left rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                                                checked
                                                    ? "border-[#1D61D2] bg-[#1D61D2]/5 text-[#1D61D2]"
                                                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                                            }`}
                                        >
                                            {c.class_name}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 p-5 border-t border-slate-100 bg-slate-50/60">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#1D61D2] hover:bg-[#1a56ba] transition-colors disabled:opacity-60 flex items-center gap-2"
                    >
                        {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                        {isEditMode ? "Simpan perubahan" : "Buat mata pelajaran"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CreateSubjectDialog;