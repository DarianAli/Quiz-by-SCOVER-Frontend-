"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Upload, FileText, CheckCircle, AlertTriangle, XCircle, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { BulkUserRow, ClassEntity } from "@/types/admin";
import { cn } from "@/lib/utils";

const singleUserSchema = z.object({
  userName: z.string().min(3, "Username must be at least 3 characters"),
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone_number: z.string().optional(),
  parent_full_name: z.string().optional(),
  parent_phone_number: z.string().optional(),
  role: z.enum(["STUDENT", "TENTOR", "ADMIN"]),
  classId: z.string().optional(),
});

type SingleUserFormValues = z.infer<typeof singleUserSchema>;

interface CreateUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  classesList?: ClassEntity[];
  onSubmitSuccess?: () => void;
}

export function CreateUserDialog({
  isOpen,
  onClose,
  classesList = [],
  onSubmitSuccess,
}: CreateUserDialogProps) {
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");

  // Single User Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SingleUserFormValues>({
    resolver: zodResolver(singleUserSchema),
    defaultValues: {
      userName: "",
      full_name: "",
      email: "",
      password: "",
      phone_number: "",
      parent_full_name: "",
      parent_phone_number: "",
      role: "STUDENT",
      classId: "",
    },
  });

  // Bulk Upload State
  const [parsedRows, setParsedRows] = useState<BulkUserRow[]>([]);
  const [csvFileName, setCsvFileName] = useState<string>("");
  const [isImporting, setIsImporting] = useState(false);

  const onSingleSubmit = async (data: SingleUserFormValues) => {
    try {
      const { post } = await import("@/lib/api-bridge");
      const payload: any = { ...data };
      if (data.classId) payload.classId = parseInt(data.classId, 10);
      
      await post("/user/register", payload);
      toast.success(`User "${data.full_name}" registered successfully!`);
      reset();
      onClose();
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to register user");
    }
  };

  // Process CSV File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r\n|\n/).filter((line) => line.trim().length > 0);
      if (lines.length <= 1) {
        toast.error("CSV file is empty or missing data rows");
        return;
      }

      // Header index mapping
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const rows: BulkUserRow[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        if (values.length < 3) continue;

        const rowData: any = {};
        headers.forEach((h, idx) => {
          rowData[h] = values[idx] || "";
        });

        const userName = rowData.username || rowData.userName || values[0];
        const full_name = rowData.full_name || rowData.fullname || values[1];
        const email = rowData.email || values[2];
        const password = rowData.password || "Password123!";
        const role = (rowData.role || "STUDENT").toUpperCase() as any;

        const errorsList: string[] = [];
        if (!userName || userName.length < 3) errorsList.push("Username too short");
        if (!full_name) errorsList.push("Full name required");
        if (!email || !email.includes("@")) errorsList.push("Invalid email format");

        rows.push({
          userName,
          full_name,
          email,
          password,
          role: ["STUDENT", "TENTOR", "ADMIN"].includes(role) ? role : "STUDENT",
          isValid: errorsList.length === 0,
          errors: errorsList,
        });
      }

      setParsedRows(rows);
    };

    reader.readAsText(file);
  };

  const handleBulkImportSubmit = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      toast.error("No valid rows to import");
      return;
    }

    setIsImporting(true);
    try {
      const { post } = await import("@/lib/api-bridge");
      await post("/user/bulk-upload", { users: validRows });
      toast.success(`Successfully imported ${validRows.length} users!`);
      setParsedRows([]);
      setCsvFileName("");
      onClose();
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Bulk import failed");
    } finally {
      setIsImporting(false);
    }
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.filter((r) => !r.isValid).length;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create Users"
      description="Add a single user manually or bulk import users via CSV"
      maxWidth="2xl"
    >
      {/* Tabs Header */}
      <div className="flex border-b border-slate-100 mb-5">
        <button
          onClick={() => setActiveTab("single")}
          className={cn(
            "flex-1 pb-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2",
            activeTab === "single"
              ? "border-[#1D61D2] text-[#1D61D2]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          <UserPlus className="w-4 h-4" /> Single User
        </button>
        <button
          onClick={() => setActiveTab("bulk")}
          className={cn(
            "flex-1 pb-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2",
            activeTab === "bulk"
              ? "border-[#1D61D2] text-[#1D61D2]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          <Upload className="w-4 h-4" /> Bulk Upload CSV
        </button>
      </div>

      {/* Tab 1: Single User Form */}
      {activeTab === "single" && (
        <form onSubmit={handleSubmit(onSingleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Username" placeholder="e.g. ahmad_rizky" error={errors.userName?.message} {...register("userName")} />
            <Input label="Full Name" placeholder="e.g. Ahmad Rizky Pratama" error={errors.full_name?.message} {...register("full_name")} />
            <Input label="Email Address" type="email" placeholder="e.g. ahmad@gmail.com" error={errors.email?.message} {...register("email")} />
            <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register("password")} />
            <Input label="Phone Number" placeholder="e.g. 08123456789" {...register("phone_number")} />
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">User Role</label>
              <select {...register("role")} className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-[#1D61D2] focus:outline-none">
                <option value="STUDENT">Student</option>
                <option value="TENTOR">Tentor / Instructor</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Input label="Parent Full Name" placeholder="e.g. Bambang Pratama" {...register("parent_full_name")} />
            <Input label="Parent Phone" placeholder="e.g. 08198765432" {...register("parent_phone_number")} />
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Assign to Class (Optional)</label>
            <select {...register("classId")} className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-[#1D61D2] focus:outline-none">
              <option value="">-- Select Class Cohort --</option>
              {classesList.map((c) => (
                <option key={c.id} value={c.id}>{c.class_name} ({c.class_program || "General"})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      )}

      {/* Tab 2: Bulk CSV Upload */}
      {activeTab === "bulk" && (
        <div className="space-y-5">
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center bg-slate-50 hover:bg-blue-50/50 hover:border-[#1D61D2]/50 transition-colors">
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" id="csv-upload-input" />
            <label htmlFor="csv-upload-input" className="cursor-pointer flex flex-col items-center justify-center">
              <FileText className="w-10 h-10 text-[#1D61D2] mb-2" />
              <span className="text-sm font-bold text-slate-900">
                {csvFileName ? csvFileName : "Click to upload CSV File"}
              </span>
              <span className="text-xs text-slate-400 mt-1">Expected format: username, full_name, email, password, role</span>
            </label>
          </div>

          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <Badge variant="success" className="gap-1">
                    <CheckCircle className="w-3 h-3" /> {validCount} Valid Rows
                  </Badge>
                  {invalidCount > 0 && (
                    <Badge variant="danger" className="gap-1">
                      <XCircle className="w-3 h-3" /> {invalidCount} Invalid Rows
                    </Badge>
                  )}
                </div>
                <button onClick={() => setParsedRows([])} className="text-slate-400 hover:text-rose-600 flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
                {parsedRows.map((row, idx) => (
                  <div key={idx} className={cn("p-2.5 flex items-center justify-between", row.isValid ? "bg-white" : "bg-rose-50/50")}>
                    <div>
                      <span className="font-bold text-slate-900">{row.full_name}</span>
                      <span className="text-slate-400 ml-2">({row.userName})</span>
                      <p className="text-[11px] text-slate-500">{row.email}</p>
                    </div>
                    <div>
                      {row.isValid ? (
                        <Badge variant="success">Ready</Badge>
                      ) : (
                        <span className="text-[10px] text-rose-600 font-bold">{row.errors.join(", ")}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleBulkImportSubmit}
              disabled={validCount === 0 || isImporting}
            >
              {isImporting ? "Importing..." : `Import ${validCount} Valid Users`}
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
