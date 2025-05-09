import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { providersApi } from "@/api/providers";
import ProviderToggle from "./ProviderToggle";
import ProviderConnectionModal from "./ProviderConnectionModal";
import { CloudProvider } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Cloud, Database } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FaGoogle, FaAws, FaMicrosoft } from "react-icons/fa";

const ProviderList: React.FC = () => {
  const [connectingProvider, setConnectingProvider] = useState<CloudProvider | null>(null);
  const [showProviderSelector, setShowProviderSelector] = useState(false);
  
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
    setShowProviderSelector(false);
  };
  
  const handleCloseModal = () => {
    setConnectingProvider(null);
  };
  
  const openProviderSelector = () => {
    setShowProviderSelector(true);
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
      
      {/* Show only connected providers in the list */}
      {userProviders && userProviders.length > 0 ? (
        <>
          {userProviders.map((userProvider) => {
            // Find the provider details
            const provider = providers.find(p => p.id === userProvider.providerId);
            if (!provider) return null;
            
            return (
              <ProviderToggle
                key={provider.id}
                provider={provider}
                userProvider={userProvider}
                onConnect={() => handleConnectProvider(provider)}
              />
            );
          })}
        </>
      ) : (
        <div className="p-4 text-center bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            No cloud providers connected. Add a provider to get started.
          </p>
        </div>
      )}
      
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium mb-4">Available Cloud Providers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {providers.map(provider => {
            // Check if the provider is already connected by the user
            const isConnected = userProviders?.some(up => up.providerId === provider.id);
            
            // Display all providers, regardless of connection status
            let bgColorClass = 'bg-gray-50 dark:bg-gray-800';
            let iconColorClass = 'text-primary';
            
            if (provider.type === 'gcp') {
              bgColorClass = 'bg-blue-50 dark:bg-blue-900/20';
              iconColorClass = 'text-blue-600 dark:text-blue-400';
            } else if (provider.type === 'aws') {
              bgColorClass = 'bg-orange-50 dark:bg-orange-900/20';
              iconColorClass = 'text-orange-600 dark:text-orange-400';
            } else if (provider.type === 'azure') {
              bgColorClass = 'bg-purple-50 dark:bg-purple-900/20';
              iconColorClass = 'text-purple-600 dark:text-purple-400';
            }
            
            // If already connected, show a different state
            const buttonClass = isConnected 
              ? `p-4 rounded-lg border border-gray-200 dark:border-gray-700 opacity-60 ${bgColorClass} flex flex-col items-center justify-center text-center`
              : `p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${bgColorClass} flex flex-col items-center justify-center text-center`;
            
            return (
              <button 
                key={provider.id}
                onClick={() => !isConnected && handleConnectProvider(provider)}
                className={buttonClass}
                disabled={isConnected}
              >
                <div className={`flex-shrink-0 h-12 w-12 rounded-full ${bgColorClass} flex items-center justify-center mb-3 border border-gray-200 dark:border-gray-700`}>
                  {provider.type === 'gcp' ? (
                    <FaGoogle className={`h-6 w-6 ${iconColorClass}`} />
                  ) : provider.type === 'aws' ? (
                    <FaAws className={`h-6 w-6 ${iconColorClass}`} />
                  ) : provider.type === 'azure' ? (
                    <FaMicrosoft className={`h-6 w-6 ${iconColorClass}`} />
                  ) : (
                    <Cloud className={`h-6 w-6 ${iconColorClass}`} />
                  )}
                </div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{provider.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {isConnected ? "Already connected" : "Click to connect"}
                </p>
              </button>
            );
          })}
          
          {/* Check if no providers are available for connection */}
          {providers.length > 0 && 
           providers.every(p => userProviders?.some(up => up.providerId === p.id)) && 
           userProviders && userProviders.length > 0 && (
            <div className="col-span-full text-center p-4 text-gray-500 dark:text-gray-400">
              All available cloud providers are connected
            </div>
          )}
          
          {/* Show message if no available providers */}
          {providers.length === 0 && (
            <div className="col-span-full text-center p-4 text-gray-500 dark:text-gray-400">
              No cloud providers available
            </div>
          )}
        </div>
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