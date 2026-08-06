import { get, post, put, drop } from "@/lib/api-bridge";
import { SubjectEntity } from "@/types/admin";

export const subjectService = {
  getAllSubjects: async (): Promise<SubjectEntity[]> => {
    const res = await get("/subject/all")
    return res.data?.data || res.data || []
  },

  getSubjectById: async (uuid: string): Promise<SubjectEntity> => {
    const res = await get(`/subject/get/${uuid}`)
    return res.data?.data || res.data
  },

  createSubject: async (data: {
    subject_name: string;
    annual_quiz_target: number | null
    classId?: string[]
  }) => {
    return await post("/subject/add", data)
  },

  updateSubject: async (
    uuid: string,
    data: {
      subject_name?: string;
      annual_quiz_target?: number | null;
      classId?: string[]
    }
  ) => {
    return await put(`/subject/update-data/${uuid}`, data)
  },

  deleteSubject: async (uuid: string) => {
    return await drop(`/subject/delete-subject/${uuid}`)
  },

  assignSubject: async (userUuid: string) => {
    const res = await get(`/subject/${userUuid}/subjects`)
    return res.data?.data || res.data
  },
}
