import React from "react";
import { Folder } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { FolderIcon, Pencil, TrashIcon, Share2, FolderPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  const navigateToFolder = () => {
    setLocation(`/folder/${folder.id}`);
  };

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "Rename",
      description: "Rename functionality would be implemented here",
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "Delete",
      description: "Delete functionality would be implemented here",
    });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "Share",
      description: "Share functionality would be implemented here",
    });
  };

  const handleCreateSubfolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "Create subfolder",
      description: "Subfolder creation would be implemented here",
    });
  };

  if (view === "list") {
    return (
      <ContextMenu>
        <ContextMenuTrigger>
          <div 
            className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-md cursor-pointer"
            onClick={navigateToFolder}
          >
            <div className="flex-shrink-0 text-yellow-500 dark:text-yellow-400">
              <FolderIcon size={20} />
            </div>
            <div className="ml-3 flex-1 overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-100">{folder.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{fileCount} files</p>
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={handleRename}>
            <Pencil className="mr-2 h-4 w-4" />
            <span>Rename</span>
          </ContextMenuItem>
          <ContextMenuItem onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            <span>Share</span>
          </ContextMenuItem>
          <ContextMenuItem onClick={handleCreateSubfolder}>
            <FolderPlus className="mr-2 h-4 w-4" />
            <span>Create subfolder</span>
          </ContextMenuItem>
          <ContextMenuItem onClick={handleDelete} className="text-red-600 dark:text-red-400">
            <TrashIcon className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Card 
          className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          onClick={navigateToFolder}
        >
          <div className="flex items-center p-4">
            <FolderIcon className="h-10 w-10 text-yellow-500 dark:text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-100">{folder.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{fileCount} files</p>
            </div>
          </div>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={handleRename}>
          <Pencil className="mr-2 h-4 w-4" />
          <span>Rename</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" />
          <span>Share</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={handleCreateSubfolder}>
          <FolderPlus className="mr-2 h-4 w-4" />
          <span>Create subfolder</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDelete} className="text-red-600 dark:text-red-400">
          <TrashIcon className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default FolderCard;
