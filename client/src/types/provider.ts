import { CloudProvider as SchemaCloudProvider, UserCloudProvider as SchemaUserCloudProvider } from '@shared/schema';

// Extend the CloudProvider type from the schema if needed
export interface CloudProviderWithUIState extends SchemaCloudProvider {
  isConnecting?: boolean;
  isDisconnecting?: boolean;
}

// Extend the UserCloudProvider type from the schema if needed
export interface UserCloudProviderWithDetails extends SchemaUserCloudProvider {
  provider: SchemaCloudProvider;
  storageUsed?: number;
  storageTotal?: number;
  syncStatus?: ProviderSyncStatus;
}

// Provider sync status
export enum ProviderSyncStatus {
  Syncing = 'syncing',
  Synced = 'synced',
  Failed = 'failed',
  Disconnected = 'disconnected',
}

// Provider OAuth connection state
export interface ProviderOAuthState {
  providerId: number;
  state: string;
  redirectUri: string;
}

// Provider storage quota
export interface ProviderStorageQuota {
  providerId: number;
  used: number;
  total: number;
  usedPercentage: number;
}
