import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import MobileNavbar from "@/components/layout/MobileNavbar";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { providersApi } from "@/api/providers";
import { filesApi } from "@/api/files";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent,
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  LayoutGrid, 
  LayoutList, 
  RefreshCw, 
  FileIcon, 
  FolderIcon, 
  ChevronRight, 
  CloudIcon, 
  Globe, 
  MoreVertical, 
  Download, 
  Trash2, 
  Share,
  Search,
  FileText,
  ImageIcon, 
  Film,
  Music,
  ArrowUpFromLine,
  Loader2,
  XCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import ProviderIcon from "@/components/common/ProviderIcon";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";

const EmptyState = ({ provider, onRefresh, isLoading }: { provider: any, onRefresh: () => void, isLoading: boolean }) => (
  <div className="flex flex-col items-center justify-center p-8">
    <div className="rounded-full bg-muted p-6">
      <CloudIcon className="h-12 w-12 text-muted-foreground" />
    </div>
    <h3 className="mt-4 text-lg font-medium">No files found</h3>
    <p className="mt-1 text-sm text-gray-500 text-center max-w-md">
      We couldn't find any files in your {provider.name} account. Try refreshing or navigate to another folder.
    </p>
    <Button onClick={onRefresh} disabled={isLoading} className="mt-4">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </>
      )}
    </Button>
  </div>
);

// Mock file type icons based on extension
const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension || '')) {
    return <ImageIcon className="h-5 w-5" />;
  } else if (['mp4', 'avi', 'mov', 'wmv', 'webm'].includes(extension || '')) {
    return <Film className="h-5 w-5" />;
  } else if (['mp3', 'wav', 'ogg', 'flac'].includes(extension || '')) {
    return <Music className="h-5 w-5" />;
  } else if (['doc', 'docx', 'txt', 'pdf', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension || '')) {
    return <FileText className="h-5 w-5" />;
  }
  
  return <FileIcon className="h-5 w-5" />;
};

// File size formatter
const formatFileSize = (bytes: number | null) => {
  if (bytes === null) return 'Unknown';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
};

// Format date
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const LiveCloud: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState<number | null>(null);
  const [currentPath, setCurrentPath] = useState<string>("/");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Fetch user connected providers
  const { data: userProviders = [], isLoading: isLoadingUserProviders } = useQuery({
    queryKey: ["/api/providers/user-connected"],
    queryFn: providersApi.getUserConnectedProviders,
  });

  // Set initial provider when loaded
  useEffect(() => {
    if (userProviders.length > 0 && selectedProvider === null) {
      setSelectedProvider(userProviders[0].provider.id);
    }
  }, [userProviders, selectedProvider]);

  // Get selected provider details
  const selectedProviderDetail = userProviders.find(up => up.provider.id === selectedProvider)?.provider;

  // Fetch files from provider
  const { data: folderContents, isLoading: isLoadingFiles, refetch } = useQuery({
    queryKey: ["/api/files/provider", selectedProvider, currentPath],
    queryFn: () => filesApi.getProviderContents(selectedProvider || 0, currentPath),
    enabled: selectedProvider !== null,
  });

  // Handle provider change
  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(Number(providerId));
    setCurrentPath("/");
  };

  // Handle folder navigation
  const navigateToFolder = (folderPath: string) => {
    setCurrentPath(folderPath);
  };

  // Handle file actions
  const handleDownload = (fileId: number) => {
    toast({
      title: "Download started",
      description: "Your file will be downloaded shortly",
    });
  };

  // Breadcrumbs generation
  const pathParts = currentPath.split('/').filter(Boolean);
  const breadcrumbs = [
    { name: selectedProviderDetail?.name || "Provider", path: "/" },
    ...pathParts.map((part, index) => ({
      name: part,
      path: `/${pathParts.slice(0, index + 1).join('/')}`
    }))
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col md:ml-64">
        <MobileNavbar />
        <TopBar currentPath="/live-cloud" />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Live Cloud</h2>
              
              <div className="flex mt-3 sm:mt-0 items-center space-x-2">
                <Select 
                  value={selectedProvider?.toString()} 
                  onValueChange={handleProviderChange}
                  disabled={userProviders.length === 0}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {userProviders.map((connection) => (
                      <SelectItem key={connection.provider.id} value={connection.provider.id.toString()}>
                        <div className="flex items-center">
                          <ProviderIcon providerId={connection.provider.id} size="small" className="mr-2" />
                          {connection.provider.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center rounded-md space-x-1 bg-secondary p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setViewMode('list')}
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                </div>

                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
          
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search files in current directory..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Breadcrumbs */}
          <div className="flex items-center mb-4 overflow-x-auto py-2 scrollbar-hide">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <span
                  className={`text-sm cursor-pointer hover:text-primary whitespace-nowrap ${
                    index === breadcrumbs.length - 1 ? 'font-semibold text-primary' : 'text-gray-600 dark:text-gray-400'
                  }`}
                  onClick={() => navigateToFolder(crumb.path)}
                >
                  {index === 0 ? (
                    <span className="flex items-center">
                      <Globe className="inline-block h-4 w-4 mr-1" />
                      {crumb.name}
                    </span>
                  ) : (
                    crumb.name
                  )}
                </span>
                {index < breadcrumbs.length - 1 && (
                  <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
                )}
              </React.Fragment>
            ))}
          </div>
          
          {/* Error State when no providers */}
          {!isLoadingUserProviders && userProviders.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full">
                  <CloudIcon className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">No cloud providers connected</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 text-center">
                  To browse your cloud files, first connect a cloud provider in the Settings.
                </p>
                <Button className="mt-4" onClick={() => window.location.href = "/settings"}>
                  Go to Settings
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {isLoadingUserProviders || (isLoadingFiles && selectedProvider !== null) ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Array(10).fill(0).map((_, index) => (
                  <Skeleton key={index} className="h-36 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {Array(10).fill(0).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full rounded-md" />
                ))}
              </div>
            )
          ) : null}
          
          {/* Empty State */}
          {!isLoadingUserProviders && !isLoadingFiles && selectedProvider !== null && 
            userProviders.length > 0 && folderContents && 
            folderContents.folders.length === 0 && folderContents.files.length === 0 && (
            <EmptyState 
              provider={selectedProviderDetail || {name: "provider"}} 
              onRefresh={() => refetch()} 
              isLoading={isLoadingFiles} 
            />
          )}

          {/* Files and Folders */}
          {!isLoadingUserProviders && !isLoadingFiles && selectedProvider !== null && userProviders.length > 0 && 
            folderContents && (folderContents.folders.length > 0 || folderContents.files.length > 0) && (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {/* Folders */}
                  {folderContents.folders
                    .filter(folder => !searchQuery || folder.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((folder) => (
                      <Card 
                        key={`folder-${folder.id}`} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => navigateToFolder(folder.path || "/")}
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col items-center justify-center">
                            <div className="bg-amber-50 text-amber-600 p-3 rounded-lg dark:bg-amber-900 dark:text-amber-300">
                              <FolderIcon className="h-10 w-10" />
                            </div>
                            <p className="mt-3 font-medium text-sm text-center truncate w-full">{folder.name}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  
                  {/* Files */}
                  {folderContents.files
                    .filter(file => !searchQuery || file.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((file) => (
                      <Card key={`file-${file.id}`} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex flex-col items-center justify-center">
                            <div className="bg-blue-50 text-blue-600 p-3 rounded-lg dark:bg-blue-900 dark:text-blue-300">
                              {getFileIcon(file.name)}
                            </div>
                            <p className="mt-3 font-medium text-sm text-center truncate w-full">{file.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatFileSize(file.size)}</p>
                          </div>
                        </CardContent>
                        <CardFooter className="p-2 bg-gray-50 dark:bg-gray-800 border-t flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDownload(file.id)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Share className="h-4 w-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Modified</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Folders */}
                      {folderContents.folders
                        .filter(folder => !searchQuery || folder.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((folder) => (
                          <TableRow 
                            key={`folder-${folder.id}`}
                            className="cursor-pointer hover:bg-muted"
                            onClick={() => navigateToFolder(folder.path || "/")}
                          >
                            <TableCell className="font-medium flex items-center">
                              <FolderIcon className="h-5 w-5 mr-2 text-amber-500" />
                              {folder.name}
                              {folder.isShared && (
                                <Badge variant="outline" className="ml-2 px-1">Shared</Badge>
                              )}
                            </TableCell>
                            <TableCell>--</TableCell>
                            <TableCell>{formatDate(folder.updatedAt?.toString() || null)}</TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem className="text-red-600" onClick={(e) => e.stopPropagation()}>
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      
                      {/* Files */}
                      {folderContents.files
                        .filter(file => !searchQuery || file.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((file) => (
                          <TableRow key={`file-${file.id}`}>
                            <TableCell className="font-medium flex items-center">
                              {getFileIcon(file.name)}
                              <span className="ml-2">{file.name}</span>
                              {file.isShared && (
                                <Badge variant="outline" className="ml-2 px-1">Shared</Badge>
                              )}
                            </TableCell>
                            <TableCell>{formatFileSize(file.size)}</TableCell>
                            <TableCell>{formatDate(file.updatedAt?.toString() || null)}</TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleDownload(file.id)}>
                                      <Download className="h-4 w-4 mr-2" />
                                      Download
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Share className="h-4 w-4 mr-2" />
                                      Share
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600">
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )
          )}
        </main>
      </div>
    </div>
  );
};

export default LiveCloud;
