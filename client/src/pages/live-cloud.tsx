import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import MobileNavbar from "@/components/layout/MobileNavbar";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { providersApi } from "@/api/providers";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CloudIcon, LinkIcon, PlusCircle, AlertCircle, XCircle, Loader2, Cloud } from "lucide-react";
import { SiGoogledrive, SiDropbox, SiBox } from "react-icons/si";
import ProviderIcon from "@/components/common/ProviderIcon";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const LiveCloud: React.FC = () => {
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);
  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);
  const { toast } = useToast();

  // Fetch supported providers
  const { data: supportedProviders = [], isLoading: isLoadingSupportedProviders } = useQuery({
    queryKey: ["/api/providers"],
    queryFn: providersApi.getSupportedProviders,
  });

  // Fetch user connected providers
  const { data: userProviders = [], isLoading: isLoadingUserProviders } = useQuery({
    queryKey: ["/api/providers/user-connected"],
    queryFn: providersApi.getUserConnectedProviders,
  });

  // Connect provider mutation
  const connectProviderMutation = useMutation({
    mutationFn: (providerId: number) => providersApi.connectProvider(providerId, {
      // In a real app, you'd get these from OAuth flow
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
    }),
    onSuccess: () => {
      toast({
        title: "Cloud provider connected",
        description: "Your cloud storage has been connected successfully",
      });
      setIsConnectDialogOpen(false);
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["/api/providers/user-connected"] });
    },
    onError: (error) => {
      toast({
        title: "Connection failed",
        description: error.message || "Could not connect to cloud provider",
        variant: "destructive",
      });
    },
  });

  // Disconnect provider mutation
  const disconnectProviderMutation = useMutation({
    mutationFn: (providerId: number) => providersApi.disconnectProvider(providerId),
    onSuccess: () => {
      toast({
        title: "Cloud provider disconnected",
        description: "Your cloud storage has been disconnected",
      });
      setIsDisconnectDialogOpen(false);
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["/api/providers/user-connected"] });
    },
    onError: (error) => {
      toast({
        title: "Disconnection failed",
        description: error.message || "Could not disconnect from cloud provider",
        variant: "destructive",
      });
    },
  });

  const handleConnectProvider = (providerId: number) => {
    connectProviderMutation.mutate(providerId);
  };

  const handleDisconnectProvider = () => {
    if (selectedProviderId !== null) {
      disconnectProviderMutation.mutate(selectedProviderId);
    }
  };

  const openDisconnectDialog = (providerId: number) => {
    setSelectedProviderId(providerId);
    setIsDisconnectDialogOpen(true);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col md:ml-64">
        <MobileNavbar />
        <TopBar currentPath="/cloud" />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Cloud Providers</h2>
              
              <Button 
                className="mt-3 sm:mt-0 flex items-center"
                onClick={() => setIsConnectDialogOpen(true)}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Connect Provider
              </Button>
            </div>
          </div>
          
          {/* Connected Providers */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Connected Providers</h3>
            
            {isLoadingUserProviders ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array(3).fill(0).map((_, index) => (
                  <Skeleton key={index} className="h-48 w-full rounded-lg" />
                ))}
              </div>
            ) : userProviders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userProviders.map((connection) => (
                  <Card key={connection.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <ProviderIcon provider={connection.provider.type} size={24} />
                          <CardTitle>{connection.provider.name}</CardTitle>
                        </div>
                        <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full dark:bg-green-900 dark:text-green-100">
                          Connected
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Storage Usage</p>
                          <Progress value={68} className="h-2 mt-1" />
                          <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">68GB of 100GB used</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Account</p>
                          <p className="text-sm font-medium dark:text-gray-300">user@example.com</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4 flex justify-end">
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => openDisconnectDialog(connection.provider.id)}
                      >
                        Disconnect
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full">
                    <CloudIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">No cloud providers connected</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Connect a cloud provider to start syncing your files
                  </p>
                  <Button className="mt-4" onClick={() => setIsConnectDialogOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Connect Provider
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Available Providers */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Available Providers</h3>
            
            {isLoadingSupportedProviders ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array(3).fill(0).map((_, index) => (
                  <Skeleton key={index} className="h-32 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {supportedProviders.map((provider) => {
                  // Check if already connected
                  const isConnected = userProviders.some(
                    up => up.provider.id === provider.id
                  );
                  
                  return (
                    <Card key={provider.id} className={isConnected ? "opacity-50" : ""}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center space-x-2">
                          <ProviderIcon provider={provider.type} size={24} />
                          <CardTitle>{provider.name}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>
                          Connect your {provider.name} account to sync files across platforms.
                        </CardDescription>
                      </CardContent>
                      <CardFooter className="border-t pt-4 flex justify-end">
                        <Button 
                          variant={isConnected ? "outline" : "default"} 
                          size="sm"
                          disabled={isConnected}
                          onClick={() => handleConnectProvider(provider.id)}
                        >
                          {isConnected ? "Connected" : "Connect"}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Connect Provider Dialog */}
      <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Cloud Provider</DialogTitle>
            <DialogDescription>
              Choose a cloud storage provider to connect to your account
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            {supportedProviders.map((provider) => {
              // Check if already connected
              const isConnected = userProviders.some(
                up => up.provider.id === provider.id
              );
              
              return (
                <Button
                  key={provider.id}
                  variant="outline"
                  className={`w-full justify-start ${isConnected ? 'opacity-50' : ''}`}
                  disabled={isConnected || connectProviderMutation.isPending}
                  onClick={() => handleConnectProvider(provider.id)}
                >
                  <ProviderIcon provider={provider.type} className="mr-2" size={20} />
                  <span className="flex-1 text-left">{provider.name}</span>
                  {isConnected ? (
                    <span className="text-xs text-green-600 dark:text-green-400">Connected</span>
                  ) : (
                    <LinkIcon className="h-4 w-4 ml-2 text-gray-400" />
                  )}
                </Button>
              );
            })}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsConnectDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Disconnect Provider Alert Dialog */}
      <AlertDialog open={isDisconnectDialogOpen} onOpenChange={setIsDisconnectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Cloud Provider</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disconnect this cloud provider? 
              You'll no longer have access to these files through SyncVault.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDisconnectProvider}
            >
              {disconnectProviderMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LiveCloud;
