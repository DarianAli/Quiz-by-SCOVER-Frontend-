"use client";

import React, { useState } from "react";
import { SubjectProgressData } from "@/types/admin";
import { ProgressRing } from "./progress-ring";
import { Edit2, GraduationCap, Users, Target, BookOpen, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { ConfirmDeleteDialog } from "@/components/admin/dialogs/confirm-delete-dialog";
import { subjectService } from "@/services/subject.service";
import { toast } from "react-toastify";

interface SubjectCardProps {
  subject: SubjectProgressData;
  onEdit?: (subjectId: number) => void;
  onDeleteSuccess?: () => void;
}

export function SubjectCard({ subject, onEdit, onDeleteSuccess }: SubjectCardProps) {
  const percentage = Math.round(subject.percentage);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Dynamic progress ring color based on completion percentage
  let progressColor = "#1D61D2"; // Royal blue
  if (percentage >= 80) progressColor = "#10B981";       // Emerald green
  else if (percentage >= 50) progressColor = "#F4C430";  // Gold
  else if (percentage < 30) progressColor = "#F43F5E";   // Rose red

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await subjectService.deleteSubject(subject.id);
      toast.success(`Subject "${subject.subject_name}" deleted.`);
      setShowDeleteDialog(false);
      onDeleteSuccess?.();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to delete subject.";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="rounded-2xl bg-white p-5 shadow-xs border border-slate-100/80 hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between group"
    >
      <div>
        {/* Card Header: Subject Name & Action Buttons */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#1D61D2] flex items-center justify-center font-bold shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-base text-slate-900 leading-snug line-clamp-1">
                {subject.subject_name}
              </h4>
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                <Target className="w-3 h-3 text-slate-400 inline" /> Annual Quota Track
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(subject.id)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                title="Edit Subject"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="p-2 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
              title="Delete Subject"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Middle Section: Circular Progress Ring & Quizzes Metric */}
        <div className="bg-slate-50/70 rounded-xl p-3.5 flex items-center justify-between mb-4 border border-slate-100">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Quiz Progress
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-slate-900">
                {subject.completed_quizzes}
              </span>
              <span className="text-sm font-bold text-slate-400">
                / {subject.annual_quiz_target}
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500">
              quizzes completed
            </p>
          </div>

          <ProgressRing progress={percentage} progressColor={progressColor} />
        </div>
      </div>

      {/* Footer Info: Assigned Classes & Students */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-slate-400" />
          <span>{subject.assigned_classes_count} Classes</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4 text-slate-400" />
          <span>{subject.students_count} Students</span>
        </div>
      </div>

      {/* Confirm delete — uses fixed positioning so nesting here is safe */}
      <ConfirmDeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title={`Delete "${subject.subject_name}"?`}
        description="This will permanently remove the subject and all associated data. This action cannot be undone."
        confirmLabel="Delete Subject"
      />
    </motion.div>
  );
}
