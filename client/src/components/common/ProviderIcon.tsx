import React from "react";
import { Cloud, HardDrive, Server, Database } from "lucide-react";
import { SiGooglecloud, SiDropbox } from "react-icons/si";

type ProviderIconSize = "small" | "medium" | "large";

interface ProviderIconProps {
  providerId: number;
  size?: ProviderIconSize;
  className?: string;
}

const ProviderIcon: React.FC<ProviderIconProps> = ({ 
  providerId, 
  size = "medium",
  className = "" 
}) => {
  // Size mapping
  const sizeClass = {
    small: "w-4 h-4",
    medium: "w-6 h-6",
    large: "w-8 h-8"
  }[size];
  
  // Base classes
  const baseClasses = `${sizeClass} ${className}`;
  
  // Provider-specific coloring and icon
  switch (providerId) {
    case 1: // Google Cloud Platform
      return <SiGooglecloud className={`text-blue-500 ${baseClasses}`} />;
    
    case 2: // Amazon Web Services
      return <Database className={`text-orange-500 ${baseClasses}`} />;
    
    case 3: // Microsoft Azure
      return <Server className={`text-blue-700 ${baseClasses}`} />;
    
    case 4: // Dropbox
      return <SiDropbox className={`text-blue-600 ${baseClasses}`} />;
    
    case 5: // OneDrive
      return <HardDrive className={`text-blue-500 ${baseClasses}`} />;
    
    default:
      // Generic cloud icon for any other provider
      return <Cloud className={`text-gray-500 ${baseClasses}`} />;
  }
};

export default ProviderIcon;