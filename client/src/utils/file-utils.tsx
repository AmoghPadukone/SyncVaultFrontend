import React from "react";
import {
  File,
  FileText,
  FileImage,
  FileAudio,
  FileVideo,
  FileArchive,
  FileCode,
  FileType2,
  Table,
  Presentation,
  Archive
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Get a React file icon component based on the file's MIME type
export function getFileTypeIcon(mimeType: string | null, className?: string): React.ReactElement {
  const IconComponent = getFileIconComponent(mimeType);
  return <IconComponent className={className || "h-8 w-8 text-blue-500"} />;
}

// Get the icon component type based on the MIME type
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

// Convert file size in bytes to human-readable format
export function getReadableFileSize(bytes: number | null, decimals = 2): string {
  if (bytes === null || bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

// Extract file extension from filename
export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

// Determine if a file is an image based on MIME type
export function isImageFile(mimeType: string | null): boolean {
  if (!mimeType) return false;
  return mimeType.startsWith("image/");
}

// Determine if a file is a video based on MIME type
export function isVideoFile(mimeType: string | null): boolean {
  if (!mimeType) return false;
  return mimeType.startsWith("video/");
}

// Get a color based on file type for visual differentiation
export function getFileTypeColor(mimeType: string | null): string {
  if (!mimeType) return "gray";
  
  const type = mimeType.split("/")[0];
  
  switch (type) {
    case "image":
      return "green";
    case "video":
      return "purple";
    case "audio":
      return "pink";
    case "text":
      return "blue";
    case "application":
      const subtype = mimeType.split("/")[1];
      if (subtype === "pdf") return "red";
      if (["zip", "x-rar-compressed", "x-tar", "x-gzip"].includes(subtype)) return "amber";
      if (["vnd.ms-excel", "vnd.openxmlformats-officedocument.spreadsheetml.sheet"].includes(subtype)) 
        return "emerald";
      if (["vnd.ms-powerpoint", "vnd.openxmlformats-officedocument.presentationml.presentation"].includes(subtype)) 
        return "orange";
      return "slate";
    default:
      return "gray";
  }
}