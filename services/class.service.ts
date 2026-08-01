import { get, post, put, drop } from "@/lib/api-bridge";
import { ClassEntity } from "@/types/admin";

export const classService = {
  getAllClasses: async (): Promise<ClassEntity[]> => {
    const res = await get("/class/all");
    return res.data?.data || res.data || [];
  },

  getClassById: async (id: number): Promise<ClassEntity> => {
    const res = await get(`/class/get/${id}`);
    return res.data?.data || res.data;
  },

  createClass: async (data: { class_name: string; class_program: "UTBK" | "SKD" | "GENERAL" }) => {
    return await post("/class/create", data);
  },

  updateClass: async (id: number, data: { class_name?: string; class_program?: "UTBK" | "SKD" | "GENERAL" }) => {
    return await put(`/class/update/${id}`, data);
  },

  deleteClass: async (id: number) => {
    return await drop(`/class/delete/${id}`);
  },
};
