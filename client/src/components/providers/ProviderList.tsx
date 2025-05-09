import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProviderToggle, { ProviderState } from "./ProviderToggle";
import { CloudProvider, UserCloudProvider } from "@shared/schema";

interface ProviderListProps {
  providers: (CloudProvider & { connected?: boolean; state?: ProviderState })[];
  onProviderStateChange?: (providerId: number, state: ProviderState) => void;
  className?: string;
}

const ProviderList: React.FC<ProviderListProps> = ({
  providers,
  onProviderStateChange,
  className
}) => {
  const handleStateChange = (providerId: number, state: ProviderState) => {
    if (onProviderStateChange) {
      onProviderStateChange(providerId, state);
    }
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Cloud Providers</CardTitle>
        <CardDescription>
          Manage your connected cloud storage providers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {providers.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No cloud providers available. Please connect a provider to get started.
            </p>
          ) : (
            providers.map((provider) => (
              <ProviderToggle
                key={provider.id}
                providerId={provider.id}
                initialState={provider.state || (provider.connected ? "connected" : "disabled")}
                onStateChange={(state) => handleStateChange(provider.id, state)}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProviderList;