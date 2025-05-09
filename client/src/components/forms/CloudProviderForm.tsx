import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { CloudProvider } from "@shared/schema";

const providerSchema = z.object({
  accessKey: z.string().min(1, "Access key is required"),
  bucketName: z.string().min(1, "Bucket name is required"),
});

type ProviderFormValues = z.infer<typeof providerSchema>;

type CloudProviderFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: CloudProvider;
  onSubmit: (providerId: number, data: ProviderFormValues) => void;
  isSubmitting: boolean;
};

export default function CloudProviderForm({
  open,
  onOpenChange,
  provider,
  onSubmit,
  isSubmitting,
}: CloudProviderFormProps) {
  const form = useForm<ProviderFormValues>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      accessKey: "",
      bucketName: "",
    },
  });

  const handleSubmit = (data: ProviderFormValues) => {
    onSubmit(provider.id, data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect to {provider.name}</DialogTitle>
          <DialogDescription>
            Enter your {provider.name} access credentials to connect your account.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="accessKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Key</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your access key" {...field} />
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
                    <Input placeholder="Enter your bucket name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Connecting..." : "Connect"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}