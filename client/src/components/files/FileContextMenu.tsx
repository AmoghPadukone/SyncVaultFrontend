import React from "react";
import { File } from "@shared/schema";
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator
} from "@/components/ui/context-menu";
import { 
  Download, 
  Pencil, 
  Share2, 
  Trash, 
  Move, 
  Copy, 
  Info, 
  LockIcon, 
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileContextMenuProps {
  file: File;
  children: React.ReactNode;
  onDelete?: (file: File) => void;
  onRename?: (file: File) => void;
  onShare?: (file: File) => void;
  onMove?: (file: File) => void;
  onCopy?: (file: File) => void;
  onDetails?: (file: File) => void;
  onProtect?: (file: File) => void;
  onPreview?: (file: File) => void;
}

const FileContextMenu: React.FC<FileContextMenuProps> = ({
  file,
  children,
  onDelete,
  onRename,
  onShare,
  onMove,
  onCopy,
  onDetails,
  onProtect,
  onPreview
}) => {
  const { toast } = useToast();

  const handleAction = (actionFn?: (file: File) => void, actionName?: string) => {
    if (actionFn) {
      actionFn(file);
    } else if (actionName) {
      toast({
        title: actionName,
        description: `${actionName} functionality would be implemented here`,
      });
    }
  };

  const handleDownload = () => {
    toast({
      title: "Download started",
      description: `Downloading ${file.name}...`,
    });
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={() => handleAction(onPreview, "Preview")}>
          <Eye className="mr-2 h-4 w-4" />
          <span>Open</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          <span>Download</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handleAction(onRename, "Rename")}>
          <Pencil className="mr-2 h-4 w-4" />
          <span>Rename</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handleAction(onShare, "Share")}>
          <Share2 className="mr-2 h-4 w-4" />
          <span>Share</span>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => handleAction(onMove, "Move")}>
          <Move className="mr-2 h-4 w-4" />
          <span>Move</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handleAction(onCopy, "Copy")}>
          <Copy className="mr-2 h-4 w-4" />
          <span>Copy</span>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => handleAction(onDetails, "Details")}>
          <Info className="mr-2 h-4 w-4" />
          <span>Details</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handleAction(onProtect, "Protect")}>
          <LockIcon className="mr-2 h-4 w-4" />
          <span>Protect</span>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem 
          onClick={() => handleAction(onDelete, "Delete")}
          className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300"
        >
          <Trash className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default FileContextMenu;
