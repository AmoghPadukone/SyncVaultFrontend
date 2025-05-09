import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CloudProvider } from "@shared/schema";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { providersApi } from "@/api/providers";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import ProviderIcon from "@/components/common/ProviderIcon";

interface ProviderConnectionModalProps {
  provider: CloudProvider;
  isOpen: boolean;
  onClose: () => void;
}

const getProviderSchema = (providerType: string) => {
  // Base schema for all providers
  const baseSchema = {
    accessToken: z.string().optional(),
    refreshToken: z.string().optional(),
    metadata: z.object({}).passthrough(),
  };

  // Add provider-specific fields
  switch (providerType) {
    case "aws":
      return z.object({
        ...baseSchema,
        metadata: z.object({
          accessKey: z.string().min(1, "AWS Access Key is required"),
          secretKey: z.string().min(1, "AWS Secret Key is required"),
          region: z.string().min(1, "AWS Region is required"),
          bucketName: z.string().min(1, "Bucket name is required"),
        }),
      });
      
    case "gcp":
      return z.object({
        ...baseSchema,
        accessToken: z.string().min(1, "Access token is required"),
        metadata: z.object({
          projectId: z.string().min(1, "GCP Project ID is required"),
          bucketName: z.string().min(1, "Bucket name is required"),
        }),
      });
      
    case "azure":
      return z.object({
        ...baseSchema,
        metadata: z.object({
          accountName: z.string().min(1, "Storage account name is required"),
          accountKey: z.string().min(1, "Storage account key is required"),
          containerName: z.string().min(1, "Container name is required"),
        }),
      });
      
    case "dropbox":
      return z.object({
        ...baseSchema,
        accessToken: z.string().min(1, "Access token is required"),
        refreshToken: z.string().optional(),
      });
      
    default:
      return z.object({
        ...baseSchema,
        accessToken: z.string().min(1, "Access token is required"),
      });
  }
};

const ProviderConnectionModal: React.FC<ProviderConnectionModalProps> = ({
  provider,
  isOpen,
  onClose,
}) => {
  const { toast } = useToast();
  const schema = getProviderSchema(provider.type);
  type FormValues = z.infer<typeof schema>;
  
  // Get initial values based on provider type
  const getInitialValues = (): FormValues => {
    const base = {
      accessToken: "",
      refreshToken: "",
      metadata: {},
    };
    
    switch (provider.type) {
      case "aws":
        return {
          ...base,
          metadata: {
            accessKey: "",
            secretKey: "",
            region: "us-east-1", // Default region
            bucketName: "",
          },
        };
      case "gcp":
        return {
          ...base,
          accessToken: "",
          metadata: {
            projectId: "",
            bucketName: "",
          },
        };
      case "azure":
        return {
          ...base,
          metadata: {
            accountName: "",
            accountKey: "",
            containerName: "",
          },
        };
      default:
        return base;
    }
  };
  
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: getInitialValues(),
  });
  
  const connectMutation = useMutation({
    mutationFn: (data: FormValues) => {
      return providersApi.connectProvider(provider.id, data);
    },
    onSuccess: () => {
      toast({
        title: "Provider connected",
        description: `${provider.name} has been connected successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/providers/user"] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: FormValues) => {
    connectMutation.mutate(data);
  };
  
  // Render form fields based on provider type
  const renderProviderFields = () => {
    switch (provider.type) {
      case "aws":
        return (
          <>
            <FormField
              control={form.control}
              name="metadata.accessKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AWS Access Key</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter AWS Access Key" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="metadata.secretKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AWS Secret Key</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter AWS Secret Key" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="metadata.region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AWS Region</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., us-east-1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="metadata.bucketName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bucket Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter bucket name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
        
      case "gcp":
        return (
          <>
            <FormField
              control={form.control}
              name="accessToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GCP Access Token</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter GCP access token" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="metadata.projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GCP Project ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter GCP project ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="metadata.bucketName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bucket Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter bucket name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
        
      case "azure":
        return (
          <>
            <FormField
              control={form.control}
              name="metadata.accountName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Storage Account Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter storage account name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="metadata.accountKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Storage Account Key</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter storage account key" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="metadata.containerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Container Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter container name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
        
      case "dropbox":
        return (
          <>
            <FormField
              control={form.control}
              name="accessToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dropbox Access Token</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Dropbox access token" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="refreshToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Refresh Token (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter refresh token if available" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
        
      default:
        return (
          <FormField
            control={form.control}
            name="accessToken"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Access Token</FormLabel>
                <FormControl>
                  <Input placeholder="Enter access token" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span className="flex items-center">
              <ProviderIcon providerId={provider.id} size="small" />
              <span className="ml-2">Connect to {provider.name}</span>
            </span>
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {renderProviderFields()}
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={connectMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={connectMutation.isPending}
              >
                {connectMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProviderConnectionModal;