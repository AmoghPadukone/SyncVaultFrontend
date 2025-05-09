import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { CloudProvider, UserCloudProvider } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { providersApi } from "@/api/providers";
import { queryClient } from "@/lib/queryClient";
import ProviderIcon from "@/components/common/ProviderIcon";
import ProviderWelcomeAnimation from "./ProviderWelcomeAnimation";

interface ProviderToggleProps {
  provider: CloudProvider;
  userProvider?: UserCloudProvider;
  onConnect?: () => void;
}

const ProviderToggle: React.FC<ProviderToggleProps> = ({
  provider,
  userProvider,
  onConnect,
}) => {
  const { toast } = useToast();
  const isConnected = !!userProvider;
  const isActive = userProvider?.isActive || false;
  const [showDisconnectAnimation, setShowDisconnectAnimation] = useState(false);

  const toggleActiveMutation = useMutation({
    mutationFn: () => {
      if (!userProvider) return Promise.reject(new Error("Provider not connected"));
      return providersApi.toggleProviderActive(userProvider.providerId, !isActive);
    },
    onSuccess: () => {
      toast({
        title: `Provider ${isActive ? "deactivated" : "activated"}`,
        description: `${provider.name} has been ${isActive ? "deactivated" : "activated"} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/providers/user"] });
    },
    onError: (error) => {
      toast({
        title: `Failed to ${isActive ? "deactivate" : "activate"} provider`,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: () => {
      if (!userProvider) return Promise.reject(new Error("Provider not connected"));
      return providersApi.disconnectProvider(provider.id);
    },
    onSuccess: () => {
      // Show the disconnection animation
      setShowDisconnectAnimation(true);
      
      toast({
        title: "Provider disconnected",
        description: `${provider.name} has been disconnected successfully`,
      });
      
      // Query invalidation happens after animation completes
    },
    onError: (error) => {
      toast({
        title: "Failed to disconnect provider",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleAnimationComplete = () => {
    // Reset animation state
    setShowDisconnectAnimation(false);
    
    // Refresh the provider data
    queryClient.invalidateQueries({ queryKey: ["/api/providers/user"] });
  };

  const handleToggleActive = () => {
    if (!isConnected) {
      // If not connected, trigger the connect flow
      if (onConnect) {
        onConnect();
      }
      return;
    }
    
    toggleActiveMutation.mutate();
  };

  return (
    <>
      {showDisconnectAnimation ? (
        <ProviderWelcomeAnimation
          provider={provider}
          isConnected={false}
          onAnimationComplete={handleAnimationComplete}
        />
      ) : (
        <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center space-x-3">
            <ProviderIcon providerId={provider.id} size="medium" />
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{provider.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isConnected
                  ? isActive
                    ? "Active"
                    : "Connected (inactive)"
                  : "Not connected"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {isConnected && (
              <button
                onClick={() => disconnectMutation.mutate()}
                disabled={disconnectMutation.isPending}
                className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                title="Disconnect provider"
              >
                {disconnectMutation.isPending ? 'Disconnecting...' : 'Disconnect'}
              </button>
            )}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {isConnected ? 'Use' : 'Connect'}
              </span>
              <Switch 
                checked={isActive} 
                onCheckedChange={handleToggleActive}
                disabled={toggleActiveMutation.isPending || disconnectMutation.isPending}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProviderToggle;