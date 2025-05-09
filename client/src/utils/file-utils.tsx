import React from "react";
import {
  File,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileCode,
  FileType2, // Instead of FilePdf
  Archive, // Instead of FileArchive
  Table, // Instead of FileSpreadsheet
  Presentation // Instead of FilePresentation
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Function to get the appropriate icon for a file type
export function getFileTypeIcon(mimeType: string | null, className?: string): React.ReactElement {
  const IconComponent = getFileIconComponent(mimeType);
  return <IconComponent className={className || "h-6 w-6"} />;
}

// Function to determine the icon component based on mime type
export function getFileIconComponent(mimeType: string | null): LucideIcon {
  if (!mimeType) return File;
  
  const type = mimeType.split("/")[0];
  const subtype = mimeType.split("/")[1];
  
  switch (type) {
    case "image":
      return FileImage;
    case "video":
      return FileVideo;
    case "audio":
      return FileAudio;
    case "text":
      if (subtype === "csv") return Table;
      if (["html", "css", "javascript", "typescript", "json", "xml"].includes(subtype)) return FileCode;
      return FileText;
    case "application":
      if (subtype === "pdf") return FileType2;
      if (["zip", "x-rar-compressed", "x-tar", "x-gzip"].includes(subtype)) return Archive;
      if (["vnd.ms-excel", "vnd.openxmlformats-officedocument.spreadsheetml.sheet"].includes(subtype)) 
        return Table;
      if (["vnd.ms-powerpoint", "vnd.openxmlformats-officedocument.presentationml.presentation"].includes(subtype)) 
        return Presentation;
      if (["javascript", "json", "xml"].includes(subtype)) return FileCode;
      return FileText;
    default:
      return File;
  }
}

// Function to format file size in human-readable format
export function getReadableFileSize(bytes: number | null, decimals = 2): string {
  if (bytes === null || bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i];
}

// Function to get the file extension from a filename
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();
}