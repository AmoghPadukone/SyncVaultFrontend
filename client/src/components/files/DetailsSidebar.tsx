import React from "react";
import { X, Calendar, HardDrive, File as FileIcon, Folder as FolderIcon, Link, Share2 } from "lucide-react";
import { File, Folder } from "@shared/schema";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getFileTypeIcon } from "@/utils/file-utils";
import ProviderIcon from "@/components/common/ProviderIcon";

interface DetailsSidebarProps {
  item: File | Folder;
  itemType: "file" | "folder";
  isOpen: boolean;
  onClose: () => void;
}

const formatBytes = (bytes: number | null, decimals = 2) => {
  if (!bytes) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i];
};

const formatDate = (date: Date | null) => {
  if (!date) return "Unknown";
  return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
};

const DetailsSidebar: React.FC<DetailsSidebarProps> = ({ item, itemType, isOpen, onClose }) => {
  const isFile = itemType === "file";
  const file = isFile ? (item as File) : null;
  const folder = !isFile ? (item as Folder) : null;

  const renderFileTypeSection = () => {
    if (!isFile || !file) return null;
    
    const Icon = getFileTypeIcon(file.mimeType || "");
    
    return (
      <div className="flex flex-col p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
        <div className="flex items-center">
          <div className="h-8 w-8 mr-3 flex items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900">
            <Icon className="h-5 w-5 text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-300">
              {file.mimeType ? file.mimeType.split("/")[1].toUpperCase() : "Unknown"} File
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatBytes(file.size)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      className={cn(
        "fixed top-0 right-0 z-30 h-full w-80 bg-white dark:bg-gray-900 shadow-xl border-l border-gray-200 dark:border-gray-800 transition-transform duration-300 transform",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Details</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="p-4">
        <div className="flex items-center mb-6">
          <div className="h-12 w-12 mr-4 flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
            {isFile ? (
              getFileTypeIcon((file?.mimeType || ""), "h-7 w-7 text-blue-600 dark:text-blue-400")
            ) : (
              <FolderIcon className="h-7 w-7 text-amber-500 dark:text-amber-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{item.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isFile ? "File" : "Folder"}
            </p>
          </div>
        </div>
        
        {/* File Type Section (only for files) */}
        {renderFileTypeSection()}
        
        {/* Details Section */}
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Details</h4>
            <div className="space-y-3">
              {/* Location/Path */}
              <div className="flex items-start">
                <FolderIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{item.path || "/"}</p>
                </div>
              </div>
              
              {/* Size (only for files) */}
              {isFile && (
                <div className="flex items-start">
                  <HardDrive className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Size</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{formatBytes(file?.size || 0)}</p>
                  </div>
                </div>
              )}
              
              {/* Provider */}
              {item.providerId && (
                <div className="flex items-start">
                  <div className="h-4 w-4 mt-0.5 mr-3">
                    <ProviderIcon providerId={item.providerId} size="small" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Cloud Provider</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {item.providerId === 1 ? "Google Cloud Storage" : 
                       item.providerId === 2 ? "Amazon S3" : 
                       item.providerId === 3 ? "Microsoft Azure" : "Unknown Provider"}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Created Date */}
              <div className="flex items-start">
                <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{formatDate(item.createdAt)}</p>
                </div>
              </div>
              
              {/* Modified Date */}
              <div className="flex items-start">
                <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Modified</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{formatDate(item.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions Section */}
        <div className="mt-6 space-y-2">
          <Button className="w-full" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button className="w-full" variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DetailsSidebar;