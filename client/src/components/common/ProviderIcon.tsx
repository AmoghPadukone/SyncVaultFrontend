import React from "react";
import { FolderOpen, CloudOff, Server } from "lucide-react";
import { 
  Cloud as CloudIcon, 
  CloudApp as CloudAppIcon,
  CloudServiceManagement as CloudServiceIcon,
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
        return <Cloud className={`text-green-500 ${className}`} width={size} height={size} />;
      case "dropbox":
        return <CloudApp className={`text-amber-600 ${className}`} width={size} height={size} />;
      case "onedrive":
        return <CloudServiceManagement className={`text-blue-600 ${className}`} width={size} height={size} />;
      case "none":
        return <CloudOff className={`text-gray-400 ${className}`} size={size} />;
      default:
        return <Server className={`text-gray-500 ${className}`} size={size} />;
    }
  };

  return getProviderIcon();
};

export default ProviderIcon;
