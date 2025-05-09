import React, { useEffect, useRef } from "react";
import { Folder, File } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download, ExternalLink, Info, Pencil, Share2, Trash2, UploadCloud } from "lucide-react";

interface ContextMenuProps {
  x: number;
  y: number;
  item: Folder | File;
  itemType: "folder" | "file";
  onClose: () => void;
  onOpenDetails: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  item,
  itemType,
  onClose,
  onOpenDetails
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Adjust position to ensure menu stays within viewport
  const adjustedPosition = () => {
    if (!menuRef.current) return { top: y, left: x };
    
    const menuWidth = menuRef.current.offsetWidth;
    const menuHeight = menuRef.current.offsetHeight;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    const adjustedX = x + menuWidth > windowWidth ? windowWidth - menuWidth - 10 : x;
    const adjustedY = y + menuHeight > windowHeight ? windowHeight - menuHeight - 10 : y;
    
    return {
      top: adjustedY,
      left: adjustedX
    };
  };
  
  const position = adjustedPosition();
  
  const handleActionClick = (action: string) => {
    // Placeholder for actions - to be implemented
    toast({
      title: "Action triggered",
      description: `${action} action on ${itemType} "${item.name}"`,
    });
    onClose();
  };
  
  return (
    <div 
      ref={menuRef}
      className="fixed z-50 bg-white dark:bg-gray-800 shadow-md rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 min-w-[180px]"
      style={{ top: position.top, left: position.left }}
    >
      <div className="py-1">
        {itemType === "file" && (
          <>
            <button
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => handleActionClick("Open")}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open
            </button>
            <button
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => handleActionClick("Download")}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
          </>
        )}
        
        <button
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => handleActionClick("Copy")}
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy
        </button>
        
        <button
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => handleActionClick("Rename")}
        >
          <Pencil className="w-4 h-4 mr-2" />
          Rename
        </button>
        
        {itemType === "file" && (
          <button
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => handleActionClick("Share")}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </button>
        )}
        
        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
        
        <button
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => handleActionClick("Move to cloud")}
        >
          <UploadCloud className="w-4 h-4 mr-2" />
          Move to cloud
        </button>
        
        <button
          className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => handleActionClick("Delete")}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </button>
        
        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
        
        <button
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={onOpenDetails}
        >
          <Info className="w-4 h-4 mr-2" />
          Details
        </button>
      </div>
    </div>
  );
};

export default ContextMenu;