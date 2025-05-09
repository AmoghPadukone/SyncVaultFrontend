import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import MobileNavbar from "@/components/layout/MobileNavbar";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { filesApi } from "@/api/files";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import FileCard from "@/components/files/FileCard";
import { LayoutGrid, List, Link as LinkIcon, Copy, XCircle } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/utils/format-date";
import { File, SharedFile } from "@shared/schema";

const Shared: React.FC = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [shareLink, setShareLink] = useState<string>("");
  const { toast } = useToast();

  // Fetch shared files
  const { data: sharedFiles = [], isLoading } = useQuery({
    queryKey: ["/api/share"],
    queryFn: filesApi.getSharedFiles,
  });

  // Revoke sharing mutation
  const revokeSharingMutation = useMutation({
    mutationFn: (fileId: number) => filesApi.revokeSharing(fileId),
    onSuccess: () => {
      toast({
        title: "Sharing revoked",
        description: "The file is no longer shared",
      });
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["/api/share"] });
      setShareDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to revoke sharing",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleShareFile = async (file: File) => {
    try {
      const shareInfo = await filesApi.generateShareLink(file.id);
      setSelectedFile(file);
      setShareLink(shareInfo.url);
      setShareDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error generating share link",
        description: "Could not generate share link",
        variant: "destructive",
      });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast({
      title: "Link copied",
      description: "Share link copied to clipboard",
    });
  };

  const handleRevokeSharing = () => {
    if (selectedFile) {
      revokeSharingMutation.mutate(selectedFile.id);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col md:ml-64">
        <MobileNavbar />
        <TopBar currentPath="/shared" />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6">
          {/* Action Buttons */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Shared Files</h2>
              
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
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="by-me">
            <TabsList className="mb-4">
              <TabsTrigger value="by-me">Shared by me</TabsTrigger>
              <TabsTrigger value="with-me">Shared with me</TabsTrigger>
            </TabsList>
            
            <TabsContent value="by-me">
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
              ) : sharedFiles.length > 0 ? (
                viewMode === "grid" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {sharedFiles.map((sharedFile: any) => (
                      <FileCard 
                        key={sharedFile.id} 
                        file={sharedFile.file} 
                        view="grid"
                        onFileClick={() => handleShareFile(sharedFile.file)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-800 rounded-md border border-gray-200 dark:border-gray-800">
                    {sharedFiles.map((sharedFile: any) => (
                      <FileCard 
                        key={sharedFile.id} 
                        file={sharedFile.file} 
                        view="list"
                        onFileClick={() => handleShareFile(sharedFile.file)}
                      />
                    ))}
                  </div>
                )
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full">
                      <LinkIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">No files shared</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Share a file to see it here</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="with-me">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full">
                    <LinkIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">No files shared with you</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    When someone shares a file with you, it will appear here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      
      {/* Share Link Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share File</DialogTitle>
            <DialogDescription>
              {selectedFile?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Share link
              </label>
              <div className="flex space-x-2">
                <Input
                  value={shareLink}
                  readOnly
                  className="flex-1"
                />
                <Button size="icon" onClick={handleCopyLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Anyone with this link can access this file
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            <Button
              variant="destructive"
              onClick={handleRevokeSharing}
              className="flex items-center"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Revoke Access
            </Button>
            <Button onClick={() => setShareDialogOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Shared;
