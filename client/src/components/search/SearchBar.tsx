import React, { useState, useRef, useEffect } from "react";
import { Search, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import ModeToggle from "@/components/search/ModeToggle";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useRecoilState } from "recoil";
import { searchModeAtom, searchQueryAtom } from "@/store/search-atom";
import { useToast } from "@/hooks/use-toast";
import NLPPreview from "@/components/search/NLPPreview";
import { useMutation } from "@tanstack/react-query";
import { searchApi } from "@/api/search";

const SearchBar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useRecoilState(searchQueryAtom);
  const [searchMode, setSearchMode] = useRecoilState(searchModeAtom);
  const [previewData, setPreviewData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const parseSmartQueryMutation = useMutation({
    mutationFn: (prompt: string) => searchApi.smartSearch(prompt),
    onSuccess: (data) => {
      setPreviewData(data.parsedQuery);
      setIsLoading(false);
    },
    onError: () => {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Could not parse your search query",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    // Parse the query if in smart mode and query changes
    if (searchMode === "smart" && searchQuery.length > 2) {
      setIsLoading(true);
      const debounce = setTimeout(() => {
        parseSmartQueryMutation.mutate(searchQuery);
      }, 800);
      
      return () => clearTimeout(debounce);
    } else {
      setPreviewData(null);
    }
  }, [searchQuery, searchMode]);

  useEffect(() => {
    // Handle clicks outside search area to collapse
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current && 
        !searchContainerRef.current.contains(event.target as Node) &&
        isExpanded
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleModeChange = (mode: "raw" | "advanced" | "smart") => {
    setSearchMode(mode);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    // Navigate to search results
    setLocation(`/search?query=${encodeURIComponent(searchQuery)}&mode=${searchMode}`);
    setIsExpanded(false);
  };

  return (
    <div className="max-w-3xl w-full relative mx-auto" ref={searchContainerRef}>
      <form onSubmit={handleSearch}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search files and folders..."
            className="pl-10 pr-10"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={handleFocus}
            ref={inputRef}
          />
          {searchQuery && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <XCircle 
                className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" 
                onClick={clearSearch}
              />
            </div>
          )}
        </div>
      </form>

      {isExpanded && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-md border border-gray-200 border-t-0 z-10 dark:bg-gray-900 dark:border-gray-800">
          <div className="p-3">
            <ModeToggle 
              activeMode={searchMode} 
              onModeChange={handleModeChange} 
            />
            
            {searchMode === "smart" && searchQuery.length > 2 && (
              <div className="mt-2">
                <NLPPreview 
                  data={previewData} 
                  isLoading={isLoading} 
                />
              </div>
            )}
            
            {searchMode === "advanced" && (
              <div className="mt-2 space-y-2">
                <Input
                  type="text"
                  placeholder="Filter by name"
                  className="w-full"
                />
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs"
                  >
                    Documents
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs"
                  >
                    Images
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs"
                  >
                    This week
                  </Button>
                </div>
              </div>
            )}
            
            <div className="mt-3 flex justify-end">
              <Button 
                type="submit" 
                size="sm"
                onClick={handleSearch}
                disabled={!searchQuery.trim()}
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
