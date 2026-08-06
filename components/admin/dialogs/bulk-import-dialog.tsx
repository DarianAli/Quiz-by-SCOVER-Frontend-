"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  FileSpreadsheet,
  FileQuestion,
  Users,
  BookOpen,
  GraduationCap,
  History,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { ImportHistoryItem } from "@/types/admin";
import { cn } from "@/lib/utils";

interface BulkImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const importCategories = [
  {
    key: "USERS",
    label: "Users Data",
    icon: Users,
    templateName: "users_template.csv",
    csvSpec: "username, full_name, email, password, role, class_name",
  },
  {
    key: "QUESTIONS",
    label: "Question Bank",
    icon: FileQuestion,
    templateName: "questions_template.docx",
    csvSpec: "question_text, option_a, option_b, option_c, option_d, correct_option, discussion",
  },
  {
    key: "QUIZ",
    label: "Quiz Packages",
    icon: FileSpreadsheet,
    templateName: "quiz_template.csv",
    csvSpec: "quiz_title, subject_name, duration, difficulty, retake_policy",
  },
  {
    key: "SUBJECTS",
    label: "Subjects Target",
    icon: BookOpen,
    templateName: "subjects_template.csv",
    csvSpec: "subject_name, annual_quiz_target",
  },
  {
    key: "CLASSES",
    label: "Class Cohorts",
    icon: GraduationCap,
    templateName: "classes_template.csv",
    csvSpec: "class_name, class_program",
  },
];

const mockImportHistory: ImportHistoryItem[] = [
  {
    id: "imp-101",
    filename: "students_batch_july.csv",
    type: "USERS",
    totalRows: 50,
    successRows: 48,
    failedRows: 2,
    status: "PARTIAL",
    importedAt: "2026-07-29 14:30",
  },
  {
    id: "imp-102",
    filename: "utbk_math_questions.docx",
    type: "QUESTIONS",
    totalRows: 30,
    successRows: 30,
    failedRows: 0,
    status: "SUCCESS",
    importedAt: "2026-07-28 10:15",
  },
];

export function BulkImportDialog({ isOpen, onClose }: BulkImportDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState(importCategories[0]);

  const handleDownloadTemplate = (filename: string) => {
    // Generate dummy template file for download
    let content = "";
    if (selectedCategory.key === "USERS") {
      content = "username,full_name,email,password,role,class_name\nahmad_user,Ahmad Rizky,ahmad@example.com,Password123!,STUDENT,UTBK-1\n";
    } else if (selectedCategory.key === "SUBJECTS") {
      content = "subject_name,annual_quiz_target\nMatematika Penalaran,40\n";
    } else {
      content = selectedCategory.csvSpec + "\n";
    }

    const blob = new Blob([content], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Import Center & Templates"
      description="Download standardized import templates and inspect recent import activity"
      maxWidth="3xl"
    >
      <div className="space-y-6 pt-1">
        {/* Category selector pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {importCategories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory.key === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5",
                  isSelected
                    ? "border-[#1D61D2] bg-[#1D61D2]/5 text-[#1D61D2] font-bold shadow-xs"
                    : "border-slate-200 hover:bg-slate-50 text-slate-600"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs truncate">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Category Details & Specification */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-900">{selectedCategory.label} Template Specification</h4>
              <p className="text-xs text-slate-500 mt-0.5">Format requirements for batch data processing</p>
            </div>
            <Button
              variant="gold"
              size="sm"
              onClick={() => handleDownloadTemplate(selectedCategory.templateName)}
              className="gap-1.5 font-bold"
            >
              <Download className="w-3.5 h-3.5" /> Download Template
            </Button>
          </div>

          <div className="bg-white rounded-xl p-3 border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Expected Column Headers
            </span>
            <code className="text-xs font-mono text-[#1D61D2] bg-blue-50/60 px-2 py-1 rounded block overflow-x-auto">
              {selectedCategory.csvSpec}
            </code>
          </div>
        </div>

        {/* Import History Table */}
        <div className="space-y-2">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" /> Recent Import Executions
          </h4>

          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
            {mockImportHistory.map((item) => (
              <div key={item.id} className="p-3 bg-white flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="font-bold text-slate-900">{item.filename}</p>
                    <p className="text-[10px] text-slate-400">{item.importedAt}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-semibold text-slate-700">{item.successRows} / {item.totalRows}</span>
                    <span className="text-[10px] text-slate-400 block">rows imported</span>
                  </div>

                  {item.status === "SUCCESS" ? (
                    <Badge variant="success" className="gap-1">
                      <CheckCircle className="w-3 h-3" /> Success
                    </Badge>
                  ) : (
                    <Badge variant="warning" className="gap-1">
                      <XCircle className="w-3 h-3" /> {item.failedRows} Failed
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
