import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { InfoIcon } from "lucide-react";

interface NLPPreviewProps {
  data: any | null;
  isLoading: boolean;
}

const NLPPreview: React.FC<NLPPreviewProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="bg-gray-50 dark:bg-gray-800/50">
        <CardContent className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <InfoIcon className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p>Type your search query to see smart preview</p>
        </CardContent>
      </Card>
    );
  }

  // Format the filters in a readable way
  const formatFilters = () => {
    const parts = [];
    
    if (data.filters.name) {
      parts.push(`with name containing "${data.filters.name}"`);
    }
    
    if (data.filters.type) {
      parts.push(`of type "${data.filters.type}"`);
    }
    
    if (data.filters.size) {
      if (data.filters.size.min && data.filters.size.max) {
        parts.push(`with size between ${formatBytes(data.filters.size.min)} and ${formatBytes(data.filters.size.max)}`);
      } else if (data.filters.size.min) {
        parts.push(`larger than ${formatBytes(data.filters.size.min)}`);
      } else if (data.filters.size.max) {
        parts.push(`smaller than ${formatBytes(data.filters.size.max)}`);
      }
    }
    
    if (data.filters.dateCreated) {
      if (data.filters.dateCreated.from && data.filters.dateCreated.to) {
        parts.push(`created between ${formatDate(data.filters.dateCreated.from)} and ${formatDate(data.filters.dateCreated.to)}`);
      } else if (data.filters.dateCreated.from) {
        parts.push(`created after ${formatDate(data.filters.dateCreated.from)}`);
      } else if (data.filters.dateCreated.to) {
        parts.push(`created before ${formatDate(data.filters.dateCreated.to)}`);
      }
    }
    
    if (parts.length === 0) {
      return "Searching all files";
    }
    
    return `Looking for files ${parts.join(", ")}`;
  };

  // Helper functions for formatting
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Our interpretation of your search:</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{formatFilters()}</p>
          <div className="pt-2 text-xs text-gray-500 dark:text-gray-500 flex items-center">
            <InfoIcon className="h-3 w-3 mr-1" />
            <span>Press Enter to search with these filters</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NLPPreview;
