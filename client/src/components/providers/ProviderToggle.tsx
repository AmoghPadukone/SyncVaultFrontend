import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { CloudOff, CloudCog, CloudSun, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProviderIcon from "@/components/common/ProviderIcon";

export type ProviderState = "connected" | "active" | "disabled";

interface ProviderToggleProps {
  providerId: number;
  initialState?: ProviderState;
  onStateChange?: (state: ProviderState) => void;
  className?: string;
}

const ProviderToggle: React.FC<ProviderToggleProps> = ({
  providerId,
  initialState = "connected",
  onStateChange,
  className
}) => {
  const [state, setState] = useState<ProviderState>(initialState);
  const { toast } = useToast();
  
  const handleStateChange = (newState: ProviderState) => {
    setState(newState);
    
    if (onStateChange) {
      onStateChange(newState);
    }
    
    // Show a toast notification when state changes
    const messages = {
      connected: "Provider connected but inactive",
      active: "Provider connected and actively syncing",
      disabled: "Provider disabled"
    };
    
    toast({
      title: `Provider ${providerId} state changed`,
      description: messages[newState],
    });
  };
  
  // Simple toggle version
  const handleSwitchChange = (checked: boolean) => {
    const newState = checked ? "connected" : "disabled";
    handleStateChange(newState);
  };
  
  // Advanced toggle version with three states
  const handleToggleGroupChange = (value: string) => {
    if (value) {
      handleStateChange(value as ProviderState);
    }
  };
  
  return (
    <div className={cn("flex items-center space-x-4", className)}>
      <div className="flex-shrink-0">
        <ProviderIcon providerId={providerId} />
      </div>
      
      <div className="flex-grow">
        <h4 className="text-sm font-medium">Provider {providerId}</h4>
        <p className="text-xs text-gray-500">
          {state === "connected" && "Connected"}
          {state === "active" && "Active sync"}
          {state === "disabled" && "Disabled"}
        </p>
      </div>
      
      {/* Simple toggle for basic use cases */}
      <Switch
        checked={state !== "disabled"}
        onCheckedChange={handleSwitchChange}
        className="hidden"
      />
      
      {/* Advanced toggle group for more granular control */}
      <ToggleGroup
        type="single"
        value={state}
        onValueChange={handleToggleGroupChange}
        className="border rounded-md"
      >
        <ToggleGroupItem 
          value="disabled" 
          aria-label="Disable provider"
          className={cn(
            "p-1 h-8 w-8",
            state === "disabled" && "bg-gray-200 dark:bg-gray-700"
          )}
        >
          <CloudOff className="h-4 w-4" />
        </ToggleGroupItem>
        
        <ToggleGroupItem 
          value="connected" 
          aria-label="Connect provider"
          className={cn(
            "p-1 h-8 w-8",
            state === "connected" && "bg-blue-100 dark:bg-blue-900"
          )}
        >
          <CloudCog className="h-4 w-4" />
        </ToggleGroupItem>
        
        <ToggleGroupItem 
          value="active" 
          aria-label="Activate provider sync"
          className={cn(
            "p-1 h-8 w-8",
            state === "active" && "bg-green-100 dark:bg-green-900"
          )}
        >
          <RefreshCw className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default ProviderToggle;