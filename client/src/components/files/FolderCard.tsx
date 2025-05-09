import React, { useState } from "react";
import { Folder } from "@shared/schema";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Folder as FolderIcon } from "lucide-react";
import { Link } from "wouter";
import ContextMenu from "./ContextMenu";
import DetailsSidebar from "./DetailsSidebar";

interface FolderCardProps {
  folder: Folder;
  view?: "grid" | "list";
  fileCount?: number;
}

const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  view = "grid",
  fileCount = 0
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
  
  const formattedDate = folder.createdAt 
    ? format(new Date(folder.createdAt), "MMM d, yyyy")
    : "Unknown date";
  
  if (view === "list") {
    return (
      <>
        <Link href={`/drive/folder/${folder.id}`}>
          <div
            className={cn(
              "group flex items-center py-2 px-4 rounded-md cursor-pointer transition-colors",
              "hover:bg-gray-100 dark:hover:bg-gray-800",
              isHovered && "bg-gray-100 dark:bg-gray-800"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onContextMenu={handleRightClick}
          >
            <div className="flex items-center flex-grow min-w-0">
              <div className="flex-shrink-0 w-10 flex justify-center">
                <FolderIcon className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-4 flex-grow min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{folder.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{fileCount} items</p>
              </div>
            </div>
            <div className="hidden sm:block flex-shrink-0 w-32 text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">{formattedDate}</p>
            </div>
          </div>
        </Link>
        
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            item={folder}
            itemType="folder"
            onClose={handleCloseContextMenu}
            onOpenDetails={handleOpenDetails}
          />
        )}
        
        <DetailsSidebar
          item={folder}
          itemType="folder"
          isOpen={detailsOpen}
          onClose={() => setDetailsOpen(false)}
        />
      </>
    );
  }
  
  // Grid view
  return (
    <>
      <Link href={`/drive/folder/${folder.id}`}>
        <div
          className={cn(
            "group relative flex flex-col items-center p-4 rounded-md cursor-pointer transition-colors",
            "hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700",
            isHovered && "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onContextMenu={handleRightClick}
        >
          <div className="w-full flex justify-center items-center h-20 mb-4">
            <FolderIcon className="h-12 w-12 text-blue-500" />
          </div>
          <div className="w-full">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 text-center truncate">{folder.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{fileCount} items</p>
          </div>
        </div>
      </Link>
      
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          item={folder}
          itemType="folder"
          onClose={handleCloseContextMenu}
          onOpenDetails={handleOpenDetails}
        />
      )}
      
      <DetailsSidebar
        item={folder}
        itemType="folder"
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />
    </>
  );
};

export default FolderCard;