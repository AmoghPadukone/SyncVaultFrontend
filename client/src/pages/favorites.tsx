import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { File } from "@shared/schema";
import { filesApi } from "@/api/files";

import { Loader2, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FileCard from "@/components/files/FileCard";
import DetailsSidebar from "@/components/files/DetailsSidebar";
import { useToast } from "@/hooks/use-toast";

export default function FavoritesPage() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const { 
    data: favorites,
    isLoading,
    error, 
    refetch 
  } = useQuery({
    queryKey: ["/api/favorites"],
    queryFn: filesApi.getFavorites
  });

  useEffect(() => {
    // Reset selected file if it's removed from favorites
    if (selectedFile && favorites && !favorites.some(f => f.id === selectedFile.id)) {
      setSelectedFile(null);
      setShowSidebar(false);
    }
  }, [favorites, selectedFile]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setShowSidebar(true);
  };

  const handleCloseSidebar = () => {
    setShowSidebar(false);
  };

  const handleRemoveFromFavorites = async (fileId: number) => {
    try {
      await filesApi.toggleFavorite(fileId);
      toast({
        title: "Success",
        description: "File removed from favorites",
      });
      refetch();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to remove file from favorites",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-full">
        <p className="text-destructive mb-4">Failed to load favorites</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Heart className="h-16 w-16 mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">No Favorites Yet</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          You haven't added any files to your favorites yet. 
          Mark files as favorites to quickly access them here.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      <div className={`flex-1 p-6 ${showSidebar ? 'mr-80' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            Favorites
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({favorites.length} {favorites.length === 1 ? 'item' : 'items'})
            </span>
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favorites.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              onSelect={() => handleFileSelect(file)}
            />
          ))}
        </div>
      </div>

      {showSidebar && selectedFile && (
        <DetailsSidebar
          file={selectedFile}
          onClose={handleCloseSidebar}
          onRemoveFromFavorites={handleRemoveFromFavorites}
        />
      )}
    </div>
  );
}