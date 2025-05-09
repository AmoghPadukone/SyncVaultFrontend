import React, { useState } from "react";
import { File } from "@shared/schema";
import { getFileTypeIcon, getReadableFileSize } from "@/utils/file-utils";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import ContextMenu from "./ContextMenu";
import DetailsSidebar from "./DetailsSidebar";
import ProviderIcon from "@/components/common/ProviderIcon";

interface FileCardProps {
  file: File;
  view?: "grid" | "list";
  onSelect?: (file: File) => void;
}

const FileCard: React.FC<FileCardProps> = ({ 
  file, 
  view = "grid",
  onSelect
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };
  
  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };
  
  const handleOpenDetails = () => {
    setDetailsOpen(true);
    handleCloseContextMenu();
  };
  
  const handleSelect = () => {
    if (onSelect) {
      onSelect(file);
    }
  };
  
  const formattedDate = file.createdAt 
    ? format(new Date(file.createdAt), "MMM d, yyyy")
    : "Unknown date";
  
  const formattedSize = getReadableFileSize(file.size);
  
  if (view === "list") {
    return (
      <>
        <div
          className={cn(
            "group flex items-center py-2 px-4 rounded-md cursor-pointer transition-colors",
            "hover:bg-gray-100 dark:hover:bg-gray-800",
            isHovered && "bg-gray-100 dark:bg-gray-800"
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onContextMenu={handleRightClick}
          onClick={handleSelect}
        >
          <div className="flex items-center flex-grow min-w-0">
            <div className="flex-shrink-0 w-10 flex justify-center">
              {getFileTypeIcon(file.mimeType, "h-6 w-6")}
            </div>
            <div className="ml-4 flex-grow min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{file.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{formattedSize}</p>
            </div>
          </div>
          <div className="hidden sm:block flex-shrink-0 w-32 text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">{formattedDate}</p>
          </div>
          {file.providerId && (
            <div className="hidden md:flex flex-shrink-0 w-10 items-center justify-center">
              <ProviderIcon providerId={file.providerId} size="small" />
            </div>
          )}
        </div>
        
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            item={file}
            itemType="file"
            onClose={handleCloseContextMenu}
            onOpenDetails={handleOpenDetails}
          />
        )}
        
        <DetailsSidebar
          item={file}
          itemType="file"
          isOpen={detailsOpen}
          onClose={() => setDetailsOpen(false)}
        />
      </>
    );
  }
  
  // Grid view
  return (
    <>
      <div
        className={cn(
          "group relative flex flex-col items-center p-4 rounded-md cursor-pointer transition-colors",
          "hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700",
          isHovered && "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onContextMenu={handleRightClick}
        onClick={handleSelect}
      >
        <div className="w-full flex justify-center items-center h-20 mb-4">
          {getFileTypeIcon(file.mimeType, "h-12 w-12")}
        </div>
        <div className="w-full">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 text-center truncate">{file.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{formattedSize}</p>
        </div>
        
        {file.providerId && (
          <div className="absolute top-2 right-2">
            <ProviderIcon providerId={file.providerId} size="small" />
          </div>
        )}
      </div>
      
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          item={file}
          itemType="file"
          onClose={handleCloseContextMenu}
          onOpenDetails={handleOpenDetails}
        />
      )}
      
      <DetailsSidebar
        item={file}
        itemType="file"
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />
    </>
  );
};

export default FileCard;