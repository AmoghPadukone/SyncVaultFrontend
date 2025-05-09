import React from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { filesApi } from "@/api/files";
import { File } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FavoriteToggleProps {
  file: File;
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "outline" | "default";
}

export const FavoriteToggle: React.FC<FavoriteToggleProps> = ({
  file,
  size = "md",
  variant = "ghost",
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const toggleFavoriteMutation = useMutation({
    mutationFn: (fileId: number) => filesApi.toggleFavorite(fileId),
    onSuccess: (updatedFile) => {
      queryClient.invalidateQueries({ queryKey: ["/api/files", file.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/folders/contents"] });
      
      toast({
        title: updatedFile.isFavorite ? "Added to favorites" : "Removed from favorites",
        description: updatedFile.isFavorite 
          ? `${file.name} was added to your favorites` 
          : `${file.name} was removed from your favorites`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      });
    },
  });

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteMutation.mutate(file.id);
  };

  // Size mappings
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-9 w-9",
    lg: "h-10 w-10"
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };

  return (
    <Button
      variant={variant}
      size="icon"
      className={cn(
        sizeClasses[size],
        file.isFavorite && "text-yellow-500 hover:text-yellow-600",
        !file.isFavorite && "text-muted-foreground"
      )}
      onClick={handleToggleFavorite}
      disabled={toggleFavoriteMutation.isPending}
      title={file.isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Star
        className={cn(
          iconSizes[size],
          file.isFavorite && "fill-yellow-500"
        )}
      />
    </Button>
  );
};

export default FavoriteToggle;