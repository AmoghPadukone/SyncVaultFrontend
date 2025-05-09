import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Filter } from "lucide-react";
import AdvancedSearchForm from "./AdvancedSearchForm";
import { AdvancedSearchParams } from "@/lib/schemas/search-schema";
import { Button } from "@/components/ui/button";

interface AdvancedSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: (data: AdvancedSearchParams) => void;
  initialValues?: AdvancedSearchParams;
  isLoading?: boolean;
  trigger?: React.ReactNode;
}

const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  open,
  onOpenChange,
  onSearch,
  initialValues,
  isLoading = false,
  trigger,
}) => {
  const handleSearch = (data: AdvancedSearchParams) => {
    onSearch(data);
    onOpenChange(false); // Close modal after search
  };
  
  // Function to count active filters
  const getActiveFiltersCount = (params?: AdvancedSearchParams) => {
    if (!params) return 0;
    
    let count = 0;
    if (params.fileName) count++;
    if (params.mimeType !== "all") count++;
    if (params.tag) count++;
    if (params.isFavorite) count++;
    if (params.sharedOnly) count++;
    if (params.sizeMin > 0) count++;
    if (params.sizeMax) count++;
    if (params.createdAfter) count++;
    if (params.createdBefore) count++;
    return count;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Advanced Search
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <AdvancedSearchForm 
            onSearch={handleSearch} 
            isLoading={isLoading} 
            initialValues={initialValues}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedSearchModal;