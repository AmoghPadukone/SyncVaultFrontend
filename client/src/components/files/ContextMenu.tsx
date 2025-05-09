import React, { useState, useRef, useEffect } from "react";
import { Copy, Move, Paste, Edit, Trash, Eye, Download, Star, Share, Info } from "lucide-react";
import { File, Folder } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface ContextMenuProps {
  x: number;
  y: number;
  item: File | Folder;
  itemType: "file" | "folder";
  onClose: () => void;
  onOpenDetails: (item: File | Folder) => void;
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
  
  // Handle click outside to close menu
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
  
  // Position adjustments if menu would go off screen
  const adjustedX = x + 240 > window.innerWidth ? x - 240 : x;
  const adjustedY = y + 320 > window.innerHeight ? y - 320 : y;
  
  const handleOperation = (operation: string) => {
    if (operation === "details") {
      onOpenDetails(item);
      onClose();
      return;
    }
    
    // For now, just show a toast for each operation
    toast({
      title: `${operation.charAt(0).toUpperCase() + operation.slice(1)}`,
      description: `${operation.charAt(0).toUpperCase() + operation.slice(1)} ${itemType} "${item.name}" - This feature is coming soon!`,
    });
    onClose();
  };
  
  return (
    <div 
      ref={menuRef}
      className="absolute min-w-[180px] bg-white dark:bg-gray-800 rounded-md shadow-lg p-1 z-50 border border-gray-200 dark:border-gray-700"
      style={{ left: adjustedX, top: adjustedY }}
    >
      <div className="px-2 py-1.5 text-sm font-medium text-gray-800 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 mb-1">
        {item.name}
      </div>
      
      <div className="py-1">
        <button 
          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm"
          onClick={() => handleOperation("open")}
        >
          <Eye className="w-4 h-4 mr-2" />
          Open
        </button>
        
        <button 
          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm"
          onClick={() => handleOperation("copy")}
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy
        </button>
        
        <button 
          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm"
          onClick={() => handleOperation("move")}
        >
          <Move className="w-4 h-4 mr-2" />
          Move
        </button>
        
        <button 
          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm"
          onClick={() => handleOperation("rename")}
        >
          <Edit className="w-4 h-4 mr-2" />
          Rename
        </button>
        
        <button 
          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm"
          onClick={() => handleOperation("download")}
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </button>
        
        <button 
          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm"
          onClick={() => handleOperation("share")}
        >
          <Share className="w-4 h-4 mr-2" />
          Share
        </button>
        
        <div className="my-1 border-t border-gray-200 dark:border-gray-700"></div>
        
        <button 
          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm"
          onClick={() => handleOperation("details")}
        >
          <Info className="w-4 h-4 mr-2" />
          Details
        </button>
        
        <button 
          className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm"
          onClick={() => handleOperation("delete")}
        >
          <Trash className="w-4 h-4 mr-2" />
          Delete
        </button>
      </div>
    </div>
  );
};

export default ContextMenu;