import { User } from "../../types";
import { userApi } from "../axiosInstance";

export const userService = {
  getUsers: async (): Promise<User[]> => {
    const response = await userApi.get<User[]>('/');
    return response.data;
  },
  getUserById: async (userId: string): Promise<User> => {
    const response = await userApi.get<User>(`/me/${userId}`);
    return response.data;
  },
  updateUser: async ( userData: Partial<User>): Promise<User> => {
    const response = await userApi.patch<User>(`/update-profile/`, userData);
    return response.data;
  }
};