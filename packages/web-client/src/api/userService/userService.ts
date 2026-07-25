import { User } from "../../types";
import { userApi } from "../axiosInstance";

export const userService = {
  getUsers: async (): Promise<User[]> => {
    const response = await userApi.get<User[]>('/users');
    return response.data;
  },
};