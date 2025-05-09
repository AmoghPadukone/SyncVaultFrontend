import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import MobileNavbar from "@/components/layout/MobileNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { filesApi } from "@/api/files";
import { providersApi } from "@/api/providers";
import { useRecoilValue } from "recoil";
import { recentFilesAtom } from "@/store/drive-items-atom";
import FileCard from "@/components/files/FileCard";
import { Loader2, FolderPlus, Upload, BarChart3, CloudIcon, Share2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const recentFiles = useRecoilValue(recentFilesAtom);

  // Fetch folder contents for the root folder
  const { data: folderContents, isLoading: isLoadingFolderContents } = useQuery({
    queryKey: ["/api/folders/contents"],
    queryFn: () => filesApi.getFolderContents(),
  });

  // Fetch user cloud providers
  const { data: userProviders = [], isLoading: isLoadingProviders } = useQuery({
    queryKey: ["/api/providers/user-connected"],
    queryFn: providersApi.getUserConnectedProviders,
  });

  // Fetch user shared files
  const { data: sharedFiles = [], isLoading: isLoadingSharedFiles } = useQuery({
    queryKey: ["/api/share"],
    queryFn: filesApi.getSharedFiles,
  });

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col md:ml-64">
        <MobileNavbar />
        <TopBar />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6">
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Welcome, {user?.fullName || user?.username}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage and access your cloud storage in one place
                </p>
              </div>
              
              <div className="mt-3 md:mt-0 flex space-x-2">
                <Button size="sm" className="flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
                <Button variant="outline" size="sm" className="flex items-center">
                  <FolderPlus className="h-4 w-4 mr-2" />
                  New Folder
                </Button>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">68 GB</div>
                    <BarChart3 className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Account Limit:</span>
                      <span className="font-medium">100 GB</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Account ID:</span>
                      <span className="font-medium">SV-91782</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Cloud Providers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{isLoadingProviders ? <Loader2 className="h-5 w-5 animate-spin" /> : userProviders.length}</div>
                    <CloudIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {userProviders.length > 0 
                      ? `${userProviders.map(p => p.provider.name).join(", ")}` 
                      : "No cloud providers connected"}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Shared Files</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{isLoadingSharedFiles ? <Loader2 className="h-5 w-5 animate-spin" /> : sharedFiles.length}</div>
                    <Share2 className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {sharedFiles.length} files shared with others
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Recent Files */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Files</h2>
                <Link href="/my-drive">
                  <a className="text-sm text-primary hover:underline">View all</a>
                </Link>
              </div>
              
              {isLoadingFolderContents ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : folderContents?.files && folderContents.files.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {folderContents.files.slice(0, 4).map((file) => (
                    <FileCard key={file.id} file={file} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full">
                      <Upload className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">No files yet</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Upload files to get started</p>
                    <Button className="mt-4" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
