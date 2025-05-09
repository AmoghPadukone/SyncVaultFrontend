import React from "react";
import { 
  FileText, 
  FileImage, 
  FileCode, 
  FileArchive, 
  FileVideo, 
  FileAudio, 
  FilePen, 
  FileSpreadsheet, 
  FileSliders, 
  File as FileIcon
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  // Documents
  "application/pdf": FilePen,
  "application/msword": FileText,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": FileText,
  "application/vnd.oasis.opendocument.text": FileText,
  "text/plain": FileText,
  "text/html": FileCode,
  "text/css": FileCode,
  "text/javascript": FileCode,
  "application/json": FileCode,
  "application/xml": FileCode,
  
  // Spreadsheets
  "application/vnd.ms-excel": FileSpreadsheet,
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": FileSpreadsheet,
  "application/vnd.oasis.opendocument.spreadsheet": FileSpreadsheet,
  
  // Presentations
  "application/vnd.ms-powerpoint": FileSliders,
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": FileSliders,
  "application/vnd.oasis.opendocument.presentation": FileSliders,
  
  // Archives
  "application/zip": FileArchive,
  "application/x-rar-compressed": FileArchive,
  "application/x-tar": FileArchive,
  "application/gzip": FileArchive,
  
  // Images
  "image/jpeg": FileImage,
  "image/png": FileImage,
  "image/gif": FileImage,
  "image/svg+xml": FileImage,
  "image/webp": FileImage,
  
  // Video
  "video/mp4": FileVideo,
  "video/webm": FileVideo,
  "video/quicktime": FileVideo,
  
  // Audio
  "audio/mpeg": FileAudio,
  "audio/wav": FileAudio,
  "audio/ogg": FileAudio
};

interface FileIconProps {
  mimeType: string;
  className?: string;
  size?: number;
}

const FileIconComponent: React.FC<FileIconProps> = ({ mimeType, className = "", size = 24 }) => {
  const Icon = iconMap[mimeType] || FileIcon;
  
  // Extract general type for coloring
  const getIconColor = () => {
    if (mimeType.startsWith("image/")) return "text-emerald-500";
    if (mimeType.startsWith("video/")) return "text-purple-500";
    if (mimeType.startsWith("audio/")) return "text-yellow-500";
    if (mimeType === "application/pdf") return "text-red-500";
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "text-green-500";
    if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "text-orange-500";
    if (mimeType.includes("word") || mimeType.includes("document") || mimeType === "text/plain") return "text-blue-500";
    if (mimeType.includes("code") || mimeType === "text/html" || mimeType === "application/json") return "text-fuchsia-500";
    if (mimeType.includes("zip") || mimeType.includes("archive") || mimeType.includes("compressed")) return "text-amber-500";
    return "text-gray-400";
  };
  
  const colorClass = getIconColor();
  const combinedClassName = `${colorClass} ${className}`;
  
  return <Icon className={combinedClassName} size={size} />;
};

export default FileIconComponent;
