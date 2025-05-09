import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { providersApi } from "@/api/providers";
import ProviderToggle from "./ProviderToggle";
import ProviderConnectionModal from "./ProviderConnectionModal";
import { CloudProvider } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Cloud } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ProviderList: React.FC = () => {
  const [connectingProvider, setConnectingProvider] = useState<CloudProvider | null>(null);
  
  // Get all available providers
  const { data: providers, isLoading: isLoadingProviders, error: providersError } = useQuery({
    queryKey: ["/api/providers"],
    queryFn: () => providersApi.getSupportedProviders(),
  });
  
  // Get user's connected providers
  const { data: userProviders, isLoading: isLoadingUserProviders, error: userProvidersError } = useQuery({
    queryKey: ["/api/providers/user-connected"],
    queryFn: () => providersApi.getUserProviders(),
  });
  
  const handleConnectProvider = (provider: CloudProvider) => {
    setConnectingProvider(provider);
  };
  
  const handleCloseModal = () => {
    setConnectingProvider(null);
  };
  
  if (isLoadingProviders || isLoadingUserProviders) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    );
  }
  
  if (providersError || userProvidersError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load cloud providers. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!providers || providers.length === 0) {
    return (
      <Alert>
        <AlertTitle>No providers available</AlertTitle>
        <AlertDescription>
          There are no cloud storage providers available at this time.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Connected Providers</h3>
      </div>
      
      {providers.map((provider) => {
        const userProvider = userProviders?.find(
          (up) => up.providerId === provider.id
        );
        
        return (
          <ProviderToggle
            key={provider.id}
            provider={provider}
            userProvider={userProvider}
            onConnect={() => handleConnectProvider(provider)}
          />
        );
      })}
      
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button 
          onClick={() => setConnectingProvider(providers[0])}
          className="flex items-center p-3 w-full rounded-lg border border-dashed border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Cloud className="h-5 w-5 text-primary" />
          </div>
          <div className="ml-3 text-left">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Add New Cloud Provider</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Connect to additional cloud storage services</p>
          </div>
        </button>
      </div>
      
      {connectingProvider && (
        <ProviderConnectionModal
          provider={connectingProvider}
          isOpen={!!connectingProvider}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default ProviderList;