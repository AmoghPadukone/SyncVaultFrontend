import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Filter } from "lucide-react";
import AdvancedSearchForm from "./AdvancedSearchForm";
import { AdvancedSearchParams } from "@/lib/schemas/search-schema";

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: (data: AdvancedSearchParams) => void;
  isLoading?: boolean;
}

const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  isOpen,
  onOpenChange,
  onSearch,
  isLoading = false,
}) => {
  const handleSearch = (data: AdvancedSearchParams) => {
    onSearch(data);
    onOpenChange(false); // Close modal after search
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Advanced Search
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <AdvancedSearchForm onSearch={handleSearch} isLoading={isLoading} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedSearchModal;