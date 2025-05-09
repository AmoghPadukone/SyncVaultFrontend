import React from "react";
import { FolderOpen, CloudOff, Server } from "lucide-react";
import { 
  Cloud, 
  CloudApp,
  CloudAlerting,
} from "@carbon/icons-react";

interface ProviderIconProps {
  provider: string;
  className?: string;
  size?: number;
}

const ProviderIcon: React.FC<ProviderIconProps> = ({ provider, className = "", size = 20 }) => {
  const getProviderIcon = () => {
    switch (provider.toLowerCase()) {
      case "google-drive":
        return <Cloud className={`text-green-500 ${className}`} size={size} />;
      case "dropbox":
        return <CloudApp className={`text-amber-600 ${className}`} size={size} />;
      case "onedrive":
        return <CloudAlerting className={`text-blue-600 ${className}`} size={size} />;
      case "none":
        return <CloudOff className={`text-gray-400 ${className}`} size={size} />;
      default:
        return <Server className={`text-gray-500 ${className}`} size={size} />;
    }
  };

  return getProviderIcon();
};

export default ProviderIcon;
