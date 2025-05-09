import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import ProviderIcon from "@/components/common/ProviderIcon";
import { CloudProvider } from "@shared/schema";

// Define schema for provider connection
const connectionSchema = z.object({
  accessKey: z.string().min(1, "Access key is required"),
  secretKey: z.string().min(1, "Secret key is required"),
  bucketName: z.string().min(1, "Bucket name is required"),
  region: z.string().optional()
});

type ConnectionFormValues = z.infer<typeof connectionSchema>;

interface ProviderConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: CloudProvider;
  onConnect: (providerId: number, data: ConnectionFormValues) => void;
}

const ProviderConnectionModal: React.FC<ProviderConnectionModalProps> = ({
  isOpen,
  onClose,
  provider,
  onConnect
}) => {
  const { toast } = useToast();
  
  const form = useForm<ConnectionFormValues>({
    resolver: zodResolver(connectionSchema),
    defaultValues: {
      accessKey: "",
      secretKey: "",
      bucketName: "",
      region: ""
    }
  });
  
  const onSubmit = (data: ConnectionFormValues) => {
    try {
      onConnect(provider.id, data);
      form.reset();
      toast({
        title: "Provider connected",
        description: `Successfully connected to ${provider.name}`,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Connection failed",
        description: `Failed to connect to ${provider.name}`,
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ProviderIcon providerId={provider.id} />
            <DialogTitle>Connect to {provider.name}</DialogTitle>
          </div>
          <DialogDescription>
            Enter your credentials to connect to {provider.name}.
            This information will be securely stored.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="accessKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Key</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Enter your access key" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="secretKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secret Key</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter your secret key" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="bucketName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bucket Name</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Enter your bucket name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region (Optional)</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="e.g., us-east-1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Connect Provider</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProviderConnectionModal;