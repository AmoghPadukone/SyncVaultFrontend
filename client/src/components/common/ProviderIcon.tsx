import React from "react";
import { FolderOpen, CloudOff, Cloud } from "lucide-react";
import { 
  SiGoogledrive, 
  SiDropbox, 
  SiBox, 
  SiAmazon
} from "react-icons/si";

interface ProviderIconProps {
  provider: string;
  className?: string;
  size?: number;
}

const ProviderIcon: React.FC<ProviderIconProps> = ({ provider, className = "", size = 20 }) => {
  const getProviderIcon = () => {
    switch (provider.toLowerCase()) {
      case "google-drive":
        return <SiGoogledrive className={`text-yellow-500 ${className}`} size={size} />;
      case "dropbox":
        return <SiDropbox className={`text-blue-500 ${className}`} size={size} />;
      case "onedrive":
        return <Cloud className={`text-blue-600 ${className}`} size={size} />;
      case "box":
        return <SiBox className={`text-blue-400 ${className}`} size={size} />;
      case "amazon-s3":
        return <SiAmazon className={`text-amber-600 ${className}`} size={size} />;
      case "none":
        return <CloudOff className={`text-gray-400 ${className}`} size={size} />;
      default:
        return <FolderOpen className={`text-gray-500 ${className}`} size={size} />;
    }
  };

  return getProviderIcon();
};

export default ProviderIcon;
