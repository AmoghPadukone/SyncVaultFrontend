import React, { useState, useRef } from "react";
import { CloudUploadIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { filesApi } from "@/api/files";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface FileUploadZoneProps {
  folderId?: number;
  onUploadComplete?: () => void;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({ 
  folderId,
  onUploadComplete 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: (fileData: FormData) => {
      // In a real app, this would be a proper file upload
      // For the MVP, we'll simulate the upload and just create a file record
      
      const file = fileData.get('file') as File;
      
      // Simulate upload progress
      setIsUploading(true);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 300);
      
      // Create file record in backend
      return filesApi.uploadFile({
        name: file.name,
        mimeType: file.type,
        size: file.size,
        folderId: folderId,
        userId: 0, // Server will set the actual userId from session
      });
    },
    onSuccess: () => {
      setIsUploading(false);
      setUploadProgress(0);
      
      toast({
        title: "Upload complete",
        description: "Your file has been uploaded successfully",
      });
      
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["/api/folders/contents"] });
      
      if (onUploadComplete) {
        onUploadComplete();
      }
    },
    onError: (error) => {
      setIsUploading(false);
      setUploadProgress(0);
      
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    // For MVP, we'll just handle the first file
    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    uploadMutation.mutate(formData);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="mb-6">
      <div 
        className={`w-full border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer
          ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary dark:border-gray-700 dark:hover:border-primary'}
          ${isUploading ? 'pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <div className="flex flex-col items-center justify-center">
          {isUploading ? (
            <div className="w-full max-w-xs">
              <CloudUploadIcon className="mx-auto h-12 w-12 text-primary animate-pulse" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Uploading...</h3>
              <div className="mt-4">
                <Progress value={uploadProgress} className="h-2" />
                <p className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">{uploadProgress}%</p>
              </div>
            </div>
          ) : (
            <>
              <CloudUploadIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Drag & drop files here</h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Or click to browse</p>
            </>
          )}
          <input 
            id="file-upload" 
            type="file" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileInputChange}
          />
        </div>
      </div>
    </div>
  );
};

export default FileUploadZone;
