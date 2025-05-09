import React from "react";
import { 
  FileText, 
  FileImage, 
  FileVideo, 
  FileAudio, 
  File as FileIcon,
  FileJson,
  FileSpreadsheet,
  FileType2,
  LucideIcon
} from "lucide-react";

export function getFileTypeIcon(mimeType: string | null, className?: string): React.ReactElement {
  if (!mimeType) return <FileIcon className={className} />;
  
  const IconComponent = getFileIconComponent(mimeType);
  return <IconComponent className={className} />;
}

export function getFileIconComponent(mimeType: string | null): LucideIcon {
  if (!mimeType) return FileIcon;
  
  // Text documents
  if (mimeType.includes("text/") || 
      mimeType.includes("document") || 
      mimeType.includes("rtf")) {
    return FileText;
  }
  
  // Images
  if (mimeType.includes("image/")) {
    return FileImage;
  }
  
  // Videos
  if (mimeType.includes("video/")) {
    return FileVideo;
  }
  
  // Audio
  if (mimeType.includes("audio/")) {
    return FileAudio;
  }
  
  // Archives
  if (mimeType.includes("zip") || 
      mimeType.includes("x-tar") || 
      mimeType.includes("x-rar") || 
      mimeType.includes("x-7z") || 
      mimeType.includes("x-gzip")) {
    return FileType2;
  }
  
  // PDF
  if (mimeType.includes("pdf")) {
    return FileText;
  }
  
  // Code
  if (mimeType.includes("application/json") || 
      mimeType.includes("text/html") || 
      mimeType.includes("text/css") || 
      mimeType.includes("text/javascript") || 
      mimeType.includes("application/xml")) {
    return FileJson;
  }
  
  // Spreadsheets
  if (mimeType.includes("spreadsheet") || 
      mimeType.includes("excel") || 
      mimeType.includes("csv")) {
    return FileSpreadsheet;
  }
  
  // Default
  return FileIcon;
}

export function getReadableFileSize(bytes: number | null, decimals = 2): string {
  if (bytes === null || bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}