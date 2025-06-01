import { searchApi } from "@/api/search";
import ModeToggle from "@/components/search/ModeToggle";
import NLPPreview from "@/components/search/NLPPreview";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { AdvancedSearchParams } from "@/lib/schemas/search-schema";
import { cn } from "@/lib/utils";
import { searchModeAtom, searchQueryAtom } from "@/store/search-atom";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, Search, Tag, XCircle } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import { useLocation } from "wouter";

const FILE_TYPE_OPTIONS = [
  { label: "All Files", value: "all" },
  { label: "Documents", value: "application/pdf" },
  { label: "Images", value: "image/" },
  { label: "Videos", value: "video/" },
  { label: "Spreadsheets", value: "application/vnd.ms-excel" },
  { label: "Archives", value: "application/zip" },
  { label: "Audio", value: "audio/" },
];

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
  
  // Advanced search state
  const [advancedParams, setAdvancedParams] = useState<AdvancedSearchParams>({
    fileName: "",
    mimeType: "all",
    tag: "",
    isFavorite: false,
    sizeMin: 0,
    sizeMax: undefined,
    sharedOnly: false,
    createdBefore: undefined,
    createdAfter: undefined,
  });

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

  const queryLLM = async (query: string) => {
    try {
      const res = await fetch("http://localhost:8008/api/search/smart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });
  
      if (!res.ok) throw new Error("Failed to fetch");
  
      const data = await res.json();
      console.log("LLM Response:", data);
      return data;
    } catch (error) {
      console.error("Error querying LLM:", error);
      return null;
    }
  };

  // useEffect(() => {
  //   // Parse the query if in smart mode and query changes
  //   if (searchMode === "smart" && searchQuery.length > 2) {
  //     setIsLoading(true);
  //     const debounce = setTimeout(() => {

  //       parseSmartQueryMutation.mutate(searchQuery);
  //     }, 800);
      
  //     return () => clearTimeout(debounce);
  //   } else {
  //     setPreviewData(null);
  //   }
  // }, [searchQuery, searchMode]);

  useEffect(() => {
    if (searchMode === "smart" && searchQuery.length > 2) {
      setIsLoading(true);
      const debounce = setTimeout(() => {
        queryLLM(searchQuery).then((data) => {
          setPreviewData(data); // Or handle response as needed
          setIsLoading(false);
        });
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
  
  // Get counts of active filters for display
  const getActiveFiltersCount = () => {
    let count = 0;
    if (advancedParams.fileName) count++;
    if (advancedParams.mimeType !== "all") count++;
    if (advancedParams.tag) count++;
    if (advancedParams.isFavorite) count++;
    if (advancedParams.sharedOnly) count++;
    if (advancedParams.sizeMin > 0) count++;
    if (advancedParams.sizeMax) count++;
    if (advancedParams.createdAfter) count++;
    if (advancedParams.createdBefore) count++;
    return count;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For raw and smart search, we need a query
    if (searchMode !== "advanced" && !searchQuery.trim()) return;
    
    // For advanced search, at least one parameter must be set
    if (searchMode === "advanced") {
      const hasFilter = advancedParams.fileName || 
                        advancedParams.tag || 
                        advancedParams.mimeType !== "all" || 
                        advancedParams.isFavorite || 
                        advancedParams.sharedOnly ||
                        advancedParams.sizeMin > 0 ||
                        advancedParams.sizeMax ||
                        advancedParams.createdAfter ||
                        advancedParams.createdBefore;
                        
      if (!hasFilter) return;
      
      // Construct URL with all advanced params
      const params = new URLSearchParams();
      params.append('mode', searchMode);
      
      if (advancedParams.fileName) params.append('fileName', advancedParams.fileName);
      if (advancedParams.tag) params.append('tag', advancedParams.tag);
      if (advancedParams.mimeType !== "all") params.append('mimeType', advancedParams.mimeType);
      if (advancedParams.isFavorite) params.append('isFavorite', String(advancedParams.isFavorite));
      if (advancedParams.sharedOnly) params.append('sharedOnly', String(advancedParams.sharedOnly));
      if (advancedParams.sizeMin > 0) params.append('sizeMin', String(advancedParams.sizeMin));
      if (advancedParams.sizeMax) params.append('sizeMax', String(advancedParams.sizeMax));
      if (advancedParams.createdAfter) params.append('createdAfter', advancedParams.createdAfter);
      if (advancedParams.createdBefore) params.append('createdBefore', advancedParams.createdBefore);
      
      setLocation(`/search?${params.toString()}`);
    } else {
      // Navigate to search results for raw/smart search
      setLocation(`/search?query=${encodeURIComponent(searchQuery)}&mode=${searchMode}`);
    }
    
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
              activeFiltersCount={getActiveFiltersCount()}
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
              <div className="mt-4 space-y-4 max-h-[450px] overflow-y-auto pr-2">
                {/* File Name */}
                <div className="space-y-2">
                  <Label htmlFor="fileName">File Name</Label>
                  <Input
                    id="fileName"
                    type="text"
                    placeholder="Search by file name"
                    className="w-full"
                    value={advancedParams.fileName}
                    onChange={(e) => setAdvancedParams({...advancedParams, fileName: e.target.value})}
                  />
                </div>
                
                {/* File Type / MIME Type */}
                <div className="space-y-2">
                  <Label htmlFor="mimeType">File Type</Label>
                  <Select
                    value={advancedParams.mimeType}
                    onValueChange={(value) => setAdvancedParams({...advancedParams, mimeType: value})}
                  >
                    <SelectTrigger id="mimeType">
                      <SelectValue placeholder="Select file type" />
                    </SelectTrigger>
                    <SelectContent>
                      {FILE_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Tag */}
                <div className="space-y-2">
                  <Label htmlFor="tag">Tag</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tag"
                      placeholder="Enter tag"
                      value={advancedParams.tag}
                      onChange={(e) => setAdvancedParams({...advancedParams, tag: e.target.value})}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 w-10 p-0"
                    >
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Checkboxes */}
                <div className="flex flex-col gap-4 sm:flex-row">
                  {/* Favorite Files Only */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isFavorite"
                      checked={advancedParams.isFavorite}
                      onCheckedChange={(checked) => 
                        setAdvancedParams({...advancedParams, isFavorite: checked === true})
                      }
                    />
                    <Label htmlFor="isFavorite" className="cursor-pointer">Favorites only</Label>
                  </div>
                  
                  {/* Shared Files Only */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sharedOnly"
                      checked={advancedParams.sharedOnly}
                      onCheckedChange={(checked) => 
                        setAdvancedParams({...advancedParams, sharedOnly: checked === true})
                      }
                    />
                    <Label htmlFor="sharedOnly" className="cursor-pointer">Shared files only</Label>
                  </div>
                </div>
                
                <Separator />
                
                {/* File Size Range */}
                <div className="space-y-2">
                  <Label htmlFor="fileSize">File Size (in bytes)</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sizeMin">Min Size</Label>
                      <Input
                        id="sizeMin"
                        type="number"
                        min={0}
                        placeholder="Min size"
                        value={advancedParams.sizeMin || ''}
                        onChange={(e) => setAdvancedParams({
                          ...advancedParams, 
                          sizeMin: e.target.value ? parseInt(e.target.value) : 0
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sizeMax">Max Size</Label>
                      <Input
                        id="sizeMax"
                        type="number"
                        min={0}
                        placeholder="Max size"
                        value={advancedParams.sizeMax || ''}
                        onChange={(e) => setAdvancedParams({
                          ...advancedParams, 
                          sizeMax: e.target.value ? parseInt(e.target.value) : undefined
                        })}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Created Date Range */}
                <div className="space-y-2">
                  <Label>Created Date Range</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="createdAfter">From</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="createdAfter"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !advancedParams.createdAfter && "text-muted-foreground"
                            )}
                          >
                            {advancedParams.createdAfter ? (
                              format(new Date(advancedParams.createdAfter), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={advancedParams.createdAfter ? new Date(advancedParams.createdAfter) : undefined}
                            onSelect={(date) => setAdvancedParams({
                              ...advancedParams,
                              createdAfter: date ? date.toISOString() : undefined
                            })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label htmlFor="createdBefore">To</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="createdBefore"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !advancedParams.createdBefore && "text-muted-foreground"
                            )}
                          >
                            {advancedParams.createdBefore ? (
                              format(new Date(advancedParams.createdBefore), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={advancedParams.createdBefore ? new Date(advancedParams.createdBefore) : undefined}
                            onSelect={(date) => setAdvancedParams({
                              ...advancedParams,
                              createdBefore: date ? date.toISOString() : undefined
                            })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-3 flex justify-between">
              <Button 
                type="button" 
                size="sm"
                variant="outline"
                onClick={() => {
                  setAdvancedParams({
                    fileName: "",
                    mimeType: "all",
                    tag: "",
                    isFavorite: false,
                    sizeMin: 0,
                    sizeMax: undefined,
                    sharedOnly: false,
                    createdBefore: undefined,
                    createdAfter: undefined,
                  });
                }}
                className="text-xs"
              >
                Reset Filters
              </Button>
              
              <Button 
                type="submit" 
                size="sm"
                onClick={handleSearch}
                disabled={searchMode === "advanced" 
                  ? !(advancedParams.fileName || 
                      advancedParams.tag || 
                      advancedParams.mimeType !== "all" || 
                      advancedParams.isFavorite || 
                      advancedParams.sharedOnly ||
                      advancedParams.sizeMin > 0 ||
                      advancedParams.sizeMax ||
                      advancedParams.createdAfter ||
                      advancedParams.createdBefore)
                  : !searchQuery.trim()
                }
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
