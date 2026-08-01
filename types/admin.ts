export type Role = "ADMIN" | "STUDENT" | "TENTOR";
export type ClassProgram = "UTBK" | "SKD" | "GENERAL";
export type QuizStatus = "DRAFT" | "PUBLISHED";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type RetakePolicy = "ONCE" | "LIMITED" | "UNLIMITED";

export interface UserEntity {
  id: number;
  uuid: string;
  userName: string;
  full_name: string;
  email: string;
  role: Role;
  phone_number?: string;
  parent_full_name?: string;
  parent_phone_number?: string;
  photoProfile?: string;
  classId?: number | null;
  class?: {
    id: number;
    class_name: string;
    class_program?: ClassProgram | null;
  } | null;
  created_at: string;
  updated_at?: string;
}

export interface ClassEntity {
  id: number;
  uuid: string;
  class_name: string;
  class_program: ClassProgram | null;
  created_at: string;
  updated_at: string;
  users?: UserEntity[];
  _count?: {
    users: number;
    subjectClass: number;
  };
  subjectClass?: Array<{
    subjectId: number;
    classId: number;
    subject?: SubjectEntity;
  }>;
}

export interface SubjectEntity {
  id: number;
  uuid: string;
  subject_name: string;
  annual_quiz_target: number | null;
  created_at: string;
  updated_at: string;
  quizzes?: Array<{ id: number; status: QuizStatus }>;
  subjectClass?: Array<{
    subjectId: number;
    classId: number;
    class?: ClassEntity;
  }>;
  _count?: {
    quizzes: number;
    subjectClass: number;
  };
}

export interface SubjectProgressData {
  id: number;
  subject_name: string;
  completed_quizzes: number;
  annual_quiz_target: number;
  percentage: number;
  assigned_classes_count: number;
  students_count: number;
}

export interface AdminDashboardOverviewStats {
  totalStudents: number;
  totalTentors: number;
  totalClasses: number;
  totalSubjects: number;
  totalQuizzes: number;
  activeTryouts: number;
}

export interface BulkUserRow {
  userName: string;
  full_name: string;
  email: string;
  password: string;
  phone_number?: string;
  parent_full_name?: string;
  parent_phone_number?: string;
  role: Role;
  class_name?: string;
  isValid: boolean;
  errors: string[];
}

export interface ImportHistoryItem {
  id: string;
  filename: string;
  type: "USERS" | "QUESTIONS" | "QUIZ" | "SUBJECTS" | "CLASSES";
  totalRows: number;
  successRows: number;
  failedRows: number;
  status: "SUCCESS" | "FAILED" | "PARTIAL";
  importedAt: string;
}
