import { get, post, put, drop } from "@/lib/api-bridge";
import { UserEntity } from "@/types/admin";

export const userService = {
  getAllUsers: async (): Promise<UserEntity[]> => {
    const res = await get("/user/getAll");
    return res.data?.data || res.data || [];
  },

  getUserById: async (id: number): Promise<UserEntity> => {
    const res = await get(`/user/get/${id}`);
    return res.data?.data || res.data;
  },

  createUser: async (data: any) => {
    return await post("/user/register", data);
  },

  bulkUploadUsers: async (users: any[]) => {
    return await post("/user/bulk-upload", { users });
  },

  updateUser: async (id: number, data: any) => {
    return await put(`/user/update/${id}`, data);
  },

  deleteUser: async (id: number) => {
    return await drop(`/user/delete/${id}`);
  },
};
