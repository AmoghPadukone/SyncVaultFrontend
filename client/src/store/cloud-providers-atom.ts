import { atom, selector } from 'recoil';
import { CloudProvider, UserCloudProvider } from '@shared/schema';

// Cloud providers atom
export const cloudProvidersAtom = atom<CloudProvider[]>({
  key: 'cloudProviders',
  default: []
});

// User connected providers atom
export const userCloudProvidersAtom = atom<UserCloudProvider[]>({
  key: 'userCloudProviders',
  default: []
});

// Connected providers with details selector
export const connectedProvidersSelector = selector<(UserCloudProvider & { provider: CloudProvider })[]>({
  key: 'connectedProviders',
  get: ({ get }) => {
    const userProviders = get(userCloudProvidersAtom);
    const providers = get(cloudProvidersAtom);
    
    return userProviders.map(userProvider => {
      const provider = providers.find(p => p.id === userProvider.providerId);
      if (!provider) {
        throw new Error(`Provider with ID ${userProvider.providerId} not found`);
      }
      return { ...userProvider, provider };
    });
  }
});

// Storage usage by provider selector
export const storageUsageByProviderSelector = selector<{ providerId: number, used: number, total: number }[]>({
  key: 'storageUsageByProvider',
  get: ({ get }) => {
    const connectedProviders = get(connectedProvidersSelector);
    
    // In a real app, this would come from the backend
    // For now, we'll return some mock data
    return connectedProviders.map(provider => ({
      providerId: provider.providerId,
      used: 68 * 1024 * 1024 * 1024, // 68 GB in bytes
      total: 100 * 1024 * 1024 * 1024, // 100 GB in bytes
    }));
  }
});
