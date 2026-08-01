import { get, post, put, drop } from "@/lib/api-bridge";
import { SubjectEntity } from "@/types/admin";

export const subjectService = {
  getAllSubjects: async (): Promise<SubjectEntity[]> => {
    const res = await get("/subject/all");
    return res.data?.data || res.data || [];
  },

  getSubjectById: async (id: number): Promise<SubjectEntity> => {
    const res = await get(`/subject/get/${id}`);
    return res.data?.data || res.data;
  },

  createSubject: async (data: { subject_name: string; annual_quiz_target: number; classIds?: number[] }) => {
    return await post("/subject/create", data);
  },

  updateSubject: async (id: number, data: { subject_name?: string; annual_quiz_target?: number }) => {
    return await put(`/subject/update-data/${id}`, data);
  },

  deleteSubject: async (id: number) => {
    return await drop(`/subject/delete-subject/${id}`);
  },
};
