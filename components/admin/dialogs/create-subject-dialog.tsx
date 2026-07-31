"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookOpen, Check } from "lucide-react";
import { toast } from "react-toastify";
import { ClassEntity } from "@/types/admin";
import { cn } from "@/lib/utils";

const createSubjectSchema = z.object({
  subject_name: z.string().min(2, "Subject name must be at least 2 characters"),
  annual_quiz_target: z.coerce.number().min(1, "Annual target must be at least 1"),
});

type CreateSubjectFormValues = z.infer<typeof createSubjectSchema>;

interface CreateSubjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  classesList?: ClassEntity[];
  onSubmitSuccess?: () => void;
}

export function CreateSubjectDialog({
  isOpen,
  onClose,
  classesList = [],
  onSubmitSuccess,
}: CreateSubjectDialogProps) {
  const [selectedClassIds, setSelectedClassIds] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateSubjectFormValues>({
    resolver: zodResolver(createSubjectSchema),
    defaultValues: {
      subject_name: "",
      annual_quiz_target: 40,
    },
  });

  const toggleClassSelection = (classId: number) => {
    setSelectedClassIds((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    );
  };

  const onSubmit = async (data: CreateSubjectFormValues) => {
    try {
      const { post } = await import("@/lib/api-bridge");
      await post("/subject", {
        ...data,
        classIds: selectedClassIds,
      });
      toast.success(`Subject "${data.subject_name}" created successfully!`);
      reset();
      setSelectedClassIds([]);
      onClose();
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create subject");
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Subject"
      description="Add an academic subject and set annual quiz targets"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
        <Input
          label="Subject Name"
          placeholder="e.g. Matematika Penalaran"
          error={errors.subject_name?.message}
          {...register("subject_name")}
        />

        <Input
          label="Annual Quiz Target"
          type="number"
          placeholder="40"
          error={errors.annual_quiz_target?.message}
          {...register("annual_quiz_target")}
        />

        {/* Multi-Select Assigned Classes */}
        <div className="space-y-1.5 pt-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
            Assign to Classes (Multi-Select)
          </label>
          <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 p-2 space-y-1.5">
            {classesList.length === 0 ? (
              <p className="text-xs text-slate-400 p-2 text-center">No classes available yet</p>
            ) : (
              classesList.map((c) => {
                const isSelected = selectedClassIds.includes(c.id);
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => toggleClassSelection(c.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-medium transition-colors text-left",
                      isSelected
                        ? "bg-[#1D61D2]/10 text-[#1D61D2] font-semibold border border-[#1D61D2]/20"
                        : "hover:bg-slate-50 text-slate-700 border border-transparent"
                    )}
                  >
                    <span>{c.class_name} ({c.class_program || "General"})</span>
                    {isSelected && <Check className="w-4 h-4 text-[#1D61D2]" />}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            <BookOpen className="w-4 h-4" />
            {isSubmitting ? "Creating..." : "Save Subject"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
