import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import MobileNavbar from "@/components/layout/MobileNavbar";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { filesApi } from "@/api/files";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Folder, File } from "@shared/schema";
import FolderCard from "@/components/files/FolderCard";
import FileCard from "@/components/files/FileCard";
import FileUploadZone from "@/components/files/FileUploadZone";
import { FolderPlus, Upload, LayoutGrid, List, ChevronLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoute, useLocation } from "wouter";

// Schema for creating a new folder
const newFolderSchema = z.object({
  name: z.string().min(1, { message: "Folder name is required" }).max(100),
});

type NewFolderFormValues = z.infer<typeof newFolderSchema>;

const MyDrive: React.FC = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/drive/folder/:folderId");
  const { toast } = useToast();
  
  // Handle route params for folder navigation
  useEffect(() => {
    if (params && params.folderId) {
      const folderId = parseInt(params.folderId);
      if (!isNaN(folderId)) {
        setCurrentFolderId(folderId);
      }
    } else {
      setCurrentFolderId(null);
    }
  }, [params]);

  // Get current folder info
  const { data: currentFolder } = useQuery({
    queryKey: ["/api/folders/get", currentFolderId],
    queryFn: () => currentFolderId ? filesApi.getFolder(currentFolderId) : null,
    enabled: currentFolderId !== null,
  });

  const handleBackToParent = () => {
    if (currentFolder?.parentId) {
      setLocation(`/drive/folder/${currentFolder.parentId}`);
    } else {
      setLocation('/my-drive');
    }
  };

  // Fetch folder contents
  const { data: folderContents, isLoading } = useQuery({
    queryKey: ["/api/folders/contents", currentFolderId],
    queryFn: () => filesApi.getFolderContents(currentFolderId || undefined),
  });

  // Create folder mutation
  const createFolderMutation = useMutation({
    mutationFn: (data: NewFolderFormValues) => filesApi.createFolder({
      name: data.name,
      parentId: currentFolderId || undefined,
      userId: 0, // Server will set the actual userId from session
    }),
    onSuccess: () => {
      toast({
        title: "Folder created",
        description: "Your folder has been created successfully",
      });
      setIsCreateFolderDialogOpen(false);
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["/api/folders/contents", currentFolderId] });
    },
    onError: (error) => {
      toast({
        title: "Failed to create folder",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<NewFolderFormValues>({
    resolver: zodResolver(newFolderSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = (data: NewFolderFormValues) => {
    createFolderMutation.mutate(data);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col md:ml-64">
        <MobileNavbar />
        <TopBar currentPath="/my-drive" />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6">
          {/* Action Buttons */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center">
                {currentFolderId && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="mr-2"
                    onClick={handleBackToParent}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                )}
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {currentFolder ? currentFolder.name : "My Drive"}
                </h2>
              </div>
              
              <div className="mt-3 sm:mt-0 flex items-center space-x-2">
                <div className="flex items-center">
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    className="rounded-l-md"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-5 w-5" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    className="rounded-r-md"
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid className="h-5 w-5" />
                  </Button>
                </div>
                
                <Button
                  variant="outline"
                  className="flex items-center"
                  onClick={() => setIsCreateFolderDialogOpen(true)}
                >
                  <FolderPlus className="h-4 w-4 mr-2" />
                  New Folder
                </Button>
                
                <Button 
                  className="flex items-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </div>
          </div>
          
          {/* Upload Zone */}
          <FileUploadZone folderId={currentFolderId || undefined} />
          
          {/* Folders Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Folders</h3>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array(4).fill(0).map((_, index) => (
                  <Skeleton key={index} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            ) : folderContents?.folders && folderContents.folders.length > 0 ? (
              viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {folderContents.folders.map((folder) => (
                    <FolderCard 
                      key={folder.id} 
                      folder={folder} 
                      view="grid"
                      fileCount={0} // In a real app, you might fetch this
                    />
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-800 rounded-md border border-gray-200 dark:border-gray-800">
                  {folderContents.folders.map((folder) => (
                    <FolderCard 
                      key={folder.id} 
                      folder={folder} 
                      view="list"
                      fileCount={0} // In a real app, you might fetch this
                    />
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                No folders found. Create one to get started!
              </div>
            )}
          </div>
          
          {/* Files Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Files</h3>
            {isLoading ? (
              viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {Array(8).fill(0).map((_, index) => (
                    <Skeleton key={index} className="h-36 w-full rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {Array(8).fill(0).map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full rounded-md" />
                  ))}
                </div>
              )
            ) : folderContents?.files && folderContents.files.length > 0 ? (
              viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {folderContents.files.map((file) => (
                    <FileCard 
                      key={file.id} 
                      file={file} 
                      view="grid" 
                    />
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-800 rounded-md border border-gray-200 dark:border-gray-800">
                  {folderContents.files.map((file) => (
                    <FileCard 
                      key={file.id} 
                      file={file} 
                      view="list" 
                    />
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                No files found. Upload one to get started!
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Create Folder Dialog */}
      <Dialog open={isCreateFolderDialogOpen} onOpenChange={setIsCreateFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Folder name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Folder" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateFolderDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createFolderMutation.isPending}
                >
                  {createFolderMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Create
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyDrive;
