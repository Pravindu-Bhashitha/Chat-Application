import { LoginPayload, LoginResponse, RegisterPayload, User } from '../../types';
import api from '../axiosInstance';

export const authService = {
  register: async (data: RegisterPayload): Promise<User> => {
    const response = await api.post<User>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginPayload): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  getUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/auth/users');
    return response.data;
  },
};