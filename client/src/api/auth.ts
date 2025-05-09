import { apiRequest } from "@/lib/queryClient";
import { LoginCredentials, InsertUser, User } from "@shared/schema";

export interface SignupData extends InsertUser {
  providers?: number[];
}

export const authApi = {
  signup: async (data: SignupData): Promise<User> => {
    const res = await apiRequest("POST", "/api/auth/signup", data);
    return await res.json();
  },

  login: async (credentials: LoginCredentials): Promise<User> => {
    const res = await apiRequest("POST", "/api/auth/login", credentials);
    return await res.json();
  },

  logout: async (): Promise<void> => {
    await apiRequest("POST", "/api/auth/logout");
  },

  getProfile: async (): Promise<User> => {
    const res = await apiRequest("GET", "/api/auth/me");
    return await res.json();
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const res = await apiRequest("PATCH", "/api/auth/profile", data);
    return await res.json();
  }
};
