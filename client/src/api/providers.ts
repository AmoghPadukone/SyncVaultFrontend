import { apiRequest } from "@/lib/queryClient";
import { CloudProvider, UserCloudProvider } from "@shared/schema";

export interface ProviderConnection extends UserCloudProvider {
  provider: CloudProvider;
}

export interface ConnectionInfo {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
}

export const providersApi = {
  getSupportedProviders: async (): Promise<CloudProvider[]> => {
    const res = await apiRequest("GET", "/api/providers");
    return await res.json();
  },

  getUserConnectedProviders: async (): Promise<ProviderConnection[]> => {
    const res = await apiRequest("GET", "/api/providers/user-connected");
    return await res.json();
  },

  connectProvider: async (providerId: number, connectionInfo?: ConnectionInfo): Promise<UserCloudProvider> => {
    const res = await apiRequest("POST", "/api/providers/connect", { providerId, connectionInfo });
    return await res.json();
  },

  disconnectProvider: async (providerId: number): Promise<void> => {
    await apiRequest("DELETE", `/api/providers/${providerId}`);
  }
};
