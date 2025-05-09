import React from "react";
import { File, Folder } from "@shared/schema";
import { X, FileText, Folder as FolderIcon, Clock, User, Calendar, HardDrive, Share2 } from "lucide-react";
import { getFileTypeIcon, getReadableFileSize } from "@/utils/file-utils";
import { format } from "date-fns";
import ProviderIcon from "@/components/common/ProviderIcon";

interface DetailsSidebarProps {
  item: File | Folder;
  itemType: "file" | "folder";
  isOpen: boolean;
  onClose: () => void;
}

const DetailsSidebar: React.FC<DetailsSidebarProps> = ({
  item,
  itemType,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;
  
  const formattedDate = item.createdAt 
    ? format(new Date(item.createdAt), "PPP 'at' p")  // Example: "Apr 29, 2023 at 2:30 PM"
    : "Unknown date";
  
  const renderFileDetails = (file: File) => (
    <>
      <div className="flex items-center mb-6">
        <div className="w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
          {getFileTypeIcon(file.mimeType, "w-10 h-10")}
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{file.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {file.mimeType || "Unknown type"}
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <DetailItem 
          icon={<HardDrive className="w-5 h-5" />} 
          label="Size" 
          value={getReadableFileSize(file.size)} 
        />
        
        <DetailItem 
          icon={<Calendar className="w-5 h-5" />} 
          label="Created" 
          value={formattedDate} 
        />
        
        {file.providerId && (
          <DetailItem 
            icon={<ProviderIcon providerId={file.providerId} size="small" />} 
            label="Storage provider" 
            value={`Provider ${file.providerId}`} 
          />
        )}
        
        {file.path && (
          <DetailItem 
            icon={<FileText className="w-5 h-5" />} 
            label="Path" 
            value={file.path} 
          />
        )}
        
        <DetailItem 
          icon={<Share2 className="w-5 h-5" />} 
          label="Sharing" 
          value="Not shared" 
        />
      </div>
    </>
  );
  
  const renderFolderDetails = (folder: Folder) => (
    <>
      <div className="flex items-center mb-6">
        <div className="w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
          <FolderIcon className="w-10 h-10 text-blue-500" />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{folder.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Folder
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <DetailItem 
          icon={<Calendar className="w-5 h-5" />} 
          label="Created" 
          value={formattedDate} 
        />
        
        {folder.parentId && (
          <DetailItem 
            icon={<FolderIcon className="w-5 h-5" />} 
            label="Parent folder" 
            value={`Folder ${folder.parentId}`} 
          />
        )}
        
        {folder.path && (
          <DetailItem 
            icon={<FileText className="w-5 h-5" />} 
            label="Path" 
            value={folder.path} 
          />
        )}
        
        <DetailItem 
          icon={<User className="w-5 h-5" />} 
          label="Owner" 
          value={`User ${folder.userId}`} 
        />
      </div>
    </>
  );
  
  return (
    <div className="fixed inset-y-0 right-0 z-40 w-80 bg-white dark:bg-gray-900 shadow-lg transform transition-transform ease-in-out duration-300 border-l border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Details</h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-4">
        {itemType === "file" && renderFileDetails(item as File)}
        {itemType === "folder" && renderFolderDetails(item as Folder)}
      </div>
    </div>
  );
};

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon, label, value }) => (
  <div className="flex items-start">
    <div className="flex-shrink-0 text-gray-500 dark:text-gray-400">
      {icon}
    </div>
    <div className="ml-3">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm text-gray-900 dark:text-gray-100 break-words">{value}</p>
    </div>
  </div>
);

export default DetailsSidebar;