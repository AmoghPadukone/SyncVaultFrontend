import React from "react";
import { File } from "@shared/schema";
import FileIcon from "@/components/common/FileIcon";
import { formatBytes } from "@/utils/format-bytes";
import { formatDate } from "@/utils/format-date";
import { Card, CardContent } from "@/components/ui/card";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Download, Pencil, Share2, TrashIcon, MoreHorizontal, Folders } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { filesApi } from "@/api/files";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FileCardProps {
  file: File;
  view?: "grid" | "list";
  onFileClick?: (file: File) => void;
}

const FileCard: React.FC<FileCardProps> = ({ file, view = "grid", onFileClick }) => {
  const { toast } = useToast();
  
  const deleteMutation = useMutation({
    mutationFn: (fileId: number) => filesApi.deleteFile(fileId),
    onSuccess: () => {
      toast({
        title: "File deleted",
        description: "The file has been deleted successfully",
      });
      // Invalidate queries to refresh file lists
      queryClient.invalidateQueries({ queryKey: ["/api/folders/contents"] });
    },
    onError: (error) => {
      toast({
        title: "Error deleting file",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(file.id);
  };

  const handleShare = async () => {
    try {
      const shareInfo = await filesApi.generateShareLink(file.id);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareInfo.url);
      
      toast({
        title: "Link copied to clipboard",
        description: "Share link has been generated and copied to your clipboard",
      });
    } catch (error) {
      toast({
        title: "Error sharing file",
        description: "Could not generate share link",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    // In a real app, you would initiate a download here
    toast({
      title: "Download started",
      description: `Downloading ${file.name}...`,
    });
  };

  const handleRename = () => {
    // In a real app, you would show a rename dialog here
    toast({
      title: "Rename",
      description: "Rename functionality would be implemented here",
    });
  };

  const handleMove = () => {
    // In a real app, you would show a folder selection dialog here
    toast({
      title: "Move",
      description: "Move functionality would be implemented here",
    });
  };

  if (view === "list") {
    return (
      <ContextMenu>
        <ContextMenuTrigger>
          <div 
            className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-md cursor-pointer"
            onClick={() => onFileClick && onFileClick(file)}
          >
            <div className="flex-shrink-0">
              <FileIcon mimeType={file.mimeType || "application/octet-stream"} size={20} />
            </div>
            <div className="ml-3 flex-1 overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-100">{file.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatBytes(file.size || 0)} • {formatDate(file.updatedAt || new Date())}
              </p>
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            <span>Download</span>
          </ContextMenuItem>
          <ContextMenuItem onClick={handleRename}>
            <Pencil className="mr-2 h-4 w-4" />
            <span>Rename</span>
          </ContextMenuItem>
          <ContextMenuItem onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            <span>Share</span>
          </ContextMenuItem>
          <ContextMenuItem onClick={handleMove}>
            <Folders className="mr-2 h-4 w-4" />
            <span>Move</span>
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
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onFileClick && onFileClick(file)}
        >
          <div className="aspect-w-3 aspect-h-2 bg-gray-200 dark:bg-gray-800">
            <div className="flex items-center justify-center h-24 bg-blue-50 dark:bg-blue-900/20">
              <FileIcon mimeType={file.mimeType || "application/octet-stream"} size={48} />
            </div>
            {file.thumbnailUrl && (
              <img
                src={file.thumbnailUrl}
                alt={file.name}
                className="object-cover h-24 w-full"
              />
            )}
          </div>
          <CardContent className="p-3">
            <h4 className="text-sm font-medium text-gray-900 truncate dark:text-gray-100">{file.name}</h4>
            <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
              {formatBytes(file.size || 0)} • {formatDate(file.updatedAt || new Date())}
            </p>
          </CardContent>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          <span>Download</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={handleRename}>
          <Pencil className="mr-2 h-4 w-4" />
          <span>Rename</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" />
          <span>Share</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={handleMove}>
          <Folders className="mr-2 h-4 w-4" />
          <span>Move</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDelete} className="text-red-600 dark:text-red-400">
          <TrashIcon className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default FileCard;
