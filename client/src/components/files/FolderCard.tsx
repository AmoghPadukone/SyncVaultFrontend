import React, { useState } from "react";
import { Folder } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { FolderIcon } from "lucide-react";
import DetailsSidebar from "./DetailsSidebar";
import ContextMenu from "./ContextMenu";

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
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [showDetailsSidebar, setShowDetailsSidebar] = useState(false);

  const navigateToFolder = () => {
    setLocation(`/folder/${folder.id}`);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleOpenDetails = () => {
    setShowDetailsSidebar(true);
  };

  if (view === "list") {
    return (
      <>
        <div 
          className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-md cursor-pointer"
          onClick={navigateToFolder}
          onContextMenu={handleContextMenu}
        >
          <div className="flex-shrink-0 text-yellow-500 dark:text-yellow-400">
            <FolderIcon size={20} />
          </div>
          <div className="ml-3 flex-1 overflow-hidden">
            <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-100">{folder.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{fileCount} files</p>
          </div>
        </div>
        
        {showContextMenu && (
          <ContextMenu 
            x={contextMenuPosition.x} 
            y={contextMenuPosition.y} 
            item={folder} 
            itemType="folder" 
            onClose={() => setShowContextMenu(false)}
            onOpenDetails={handleOpenDetails}
          />
        )}
        
        <DetailsSidebar 
          item={folder} 
          itemType="folder" 
          isOpen={showDetailsSidebar} 
          onClose={() => setShowDetailsSidebar(false)} 
        />
      </>
    );
  }

  return (
    <>
      <Card 
        className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        onClick={navigateToFolder}
        onContextMenu={handleContextMenu}
      >
        <div className="flex items-center p-4">
          <FolderIcon className="h-10 w-10 text-yellow-500 dark:text-yellow-400" />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-100">{folder.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{fileCount} files</p>
          </div>
        </div>
      </Card>
      
      {showContextMenu && (
        <ContextMenu 
          x={contextMenuPosition.x} 
          y={contextMenuPosition.y} 
          item={folder} 
          itemType="folder" 
          onClose={() => setShowContextMenu(false)}
          onOpenDetails={handleOpenDetails}
        />
      )}
      
      <DetailsSidebar 
        item={folder} 
        itemType="folder" 
        isOpen={showDetailsSidebar} 
        onClose={() => setShowDetailsSidebar(false)} 
      />
    </>
  );
};

export default FolderCard;
