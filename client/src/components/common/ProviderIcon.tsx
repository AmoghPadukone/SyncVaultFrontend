import React from "react";
import { CloudCog, Database, Server, HardDrive } from "lucide-react";

interface ProviderIconProps {
  providerId: number;
  size?: "small" | "medium" | "large";
  className?: string;
}

const ProviderIcon: React.FC<ProviderIconProps> = ({ 
  providerId, 
  size = "medium", 
  className = "" 
}) => {
  const getSizeClass = () => {
    switch (size) {
      case "small":
        return "w-4 h-4";
      case "large":
        return "w-8 h-8";
      case "medium":
      default:
        return "w-6 h-6";
    }
  };
  
  const sizeClass = getSizeClass();
  
  // Provider IDs:
  // 1 = Google Cloud Platform
  // 2 = Amazon S3
  // 3 = Microsoft Azure
  
  switch (providerId) {
    case 1:
      return <CloudCog className={`text-blue-500 ${sizeClass} ${className}`} />;
    case 2:
      return <Database className={`text-orange-500 ${sizeClass} ${className}`} />;
    case 3:
      return <Server className={`text-blue-600 ${sizeClass} ${className}`} />;
    default:
      return <HardDrive className={`text-gray-500 ${sizeClass} ${className}`} />;
  }
};

export default ProviderIcon;