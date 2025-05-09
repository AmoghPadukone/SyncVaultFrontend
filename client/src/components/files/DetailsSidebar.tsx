import React, { useState } from "react";
import { File, Folder } from "@shared/schema";
import { X, FileText, Folder as FolderIcon, Clock, User, Calendar, HardDrive, Share2, Download, Link, Copy, Loader2, Tag } from "lucide-react";
import { getFileTypeIcon, getReadableFileSize } from "@/utils/file-utils";
import { format } from "date-fns";
import ProviderIcon from "@/components/common/ProviderIcon";
import { Button } from "@/components/ui/button";
import { filesApi } from "@/api/files";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import FavoriteToggle from "./FavoriteToggle";
import FileTagInput from "./FileTagInput";
import { Separator } from "@/components/ui/separator";

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
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareExpiry, setShareExpiry] = useState<string>("none");
  const [shareLink, setShareLink] = useState<string>("");
  const { toast } = useToast();
  
  // Share file mutation - moved before conditional return
  const shareMutation = useMutation({
    mutationFn: (data: { fileId: number, expiresIn?: number }) => {
      const expiresIn = data.expiresIn ? data.expiresIn : undefined;
      return filesApi.generateShareLink(data.fileId, expiresIn);
    },
    onSuccess: (data) => {
      setShareLink(data.url);
      toast({
        title: "File shared",
        description: "Link has been generated successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Sharing failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  if (!isOpen) return null;
  
  const formattedDate = item.createdAt 
    ? format(new Date(item.createdAt), "PPP 'at' p")  // Example: "Apr 29, 2023 at 2:30 PM"
    : "Unknown date";
  
  const handleShare = () => {
    if (itemType === "file") {
      setIsShareDialogOpen(true);
    }
  };
  
  const handleDownload = async () => {
    if (itemType === "file") {
      try {
        const file = item as File;
        const blob = await filesApi.downloadFile(file.id);
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Download started",
          description: `Downloading ${file.name}`
        });
      } catch (error) {
        toast({
          title: "Download failed",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive"
        });
      }
    }
  };
  
  const handleShareSubmit = () => {
    if (itemType === "file") {
      const file = item as File;
      let expiresIn: number | undefined;
      
      switch (shareExpiry) {
        case "1day":
          expiresIn = 60 * 60 * 24; // 24 hours in seconds
          break;
        case "7days":
          expiresIn = 60 * 60 * 24 * 7; // 7 days in seconds
          break;
        case "30days":
          expiresIn = 60 * 60 * 24 * 30; // 30 days in seconds
          break;
        case "none":
        default:
          expiresIn = undefined;
          break;
      }
      
      shareMutation.mutate({ fileId: file.id, expiresIn });
    }
  };
  
  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast({
      title: "Link copied",
      description: "Share link copied to clipboard"
    });
  };
  
  const renderFileDetails = (file: File) => (
    <>
      <div className="flex items-center mb-6">
        <div className="w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
          {getFileTypeIcon(file.mimeType, "w-10 h-10")}
        </div>
        <div className="ml-4 flex-grow">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 pr-2">{file.name}</h3>
            <FavoriteToggle file={file} size="sm" />
          </div>
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
        
        <Separator className="my-4" />
        
        {/* Tags section */}
        <FileTagInput file={file} />
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
    <>
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
        
        {/* Action buttons for file operations */}
        {itemType === "file" && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleDownload} variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button onClick={handleShare} className="w-full">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share "{itemType === "file" ? (item as File).name : ""}"</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Link expiration</h4>
              <RadioGroup value={shareExpiry} onValueChange={setShareExpiry} className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="expiry-none" />
                  <Label htmlFor="expiry-none">No expiration</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1day" id="expiry-1day" />
                  <Label htmlFor="expiry-1day">1 day</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="7days" id="expiry-7days" />
                  <Label htmlFor="expiry-7days">7 days</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="30days" id="expiry-30days" />
                  <Label htmlFor="expiry-30days">30 days</Label>
                </div>
              </RadioGroup>
            </div>
            
            {shareLink && (
              <div className="mb-4">
                <Label className="mb-2">Share link</Label>
                <div className="flex items-center">
                  <Input value={shareLink} readOnly className="flex-1 mr-2" />
                  <Button variant="outline" onClick={handleCopyShareLink} size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleShareSubmit} 
              disabled={shareMutation.isPending}
            >
              {shareMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Link className="h-4 w-4 mr-2" />
              )}
              Generate Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
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