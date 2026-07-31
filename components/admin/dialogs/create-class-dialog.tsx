"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import { toast } from "react-toastify";

const createClassSchema = z.object({
  class_name: z.string().min(2, "Class name must be at least 2 characters"),
  class_program: z.enum(["UTBK", "SKD"], {
    required_error: "Please select a program (UTBK or SKD)",
  }),
});

type CreateClassFormValues = z.infer<typeof createClassSchema>;

interface CreateClassDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: () => void;
}

export function CreateClassDialog({
  isOpen,
  onClose,
  onSubmitSuccess,
}: CreateClassDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateClassFormValues>({
    resolver: zodResolver(createClassSchema),
    defaultValues: {
      class_name: "",
      class_program: "UTBK",
    },
  });

  const onSubmit = async (data: CreateClassFormValues) => {
    try {
      // Import API bridge service dynamically or call endpoint
      const { post } = await import("@/lib/api-bridge");
      await post("/class/add", data);
      toast.success(`Class "${data.class_name}" created successfully!`);
      reset();
      onClose();
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create class");
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Class"
      description="Add a new learning cohort or tryout class to the platform"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
        <Input
          label="Class Name"
          placeholder="e.g. UTBK Intensive Batch 1"
          error={errors.class_name?.message}
          {...register("class_name")}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
            Program Category
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="relative flex cursor-pointer rounded-xl border border-slate-200 p-3.5 hover:bg-slate-50 transition-colors has-[:checked]:border-[#1D61D2] has-[:checked]:bg-[#1D61D2]/5">
              <input
                type="radio"
                value="UTBK"
                className="sr-only"
                {...register("class_program")}
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900">UTBK</span>
                <span className="text-xs text-slate-500">College Entrance Exam</span>
              </div>
            </label>

            <label className="relative flex cursor-pointer rounded-xl border border-slate-200 p-3.5 hover:bg-slate-50 transition-colors has-[:checked]:border-[#1D61D2] has-[:checked]:bg-[#1D61D2]/5">
              <input
                type="radio"
                value="SKD"
                className="sr-only"
                {...register("class_program")}
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900">SKD</span>
                <span className="text-xs text-slate-500">Civil Service Selection</span>
              </div>
            </label>
          </div>
          {errors.class_program && (
            <p className="text-xs text-rose-600 font-medium">{errors.class_program.message}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            <GraduationCap className="w-4 h-4" />
            {isSubmitting ? "Creating..." : "Save Class"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
