import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import MobileNavbar from "@/components/layout/MobileNavbar";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Filter, Loader2, FileSearch } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { searchApi } from "@/api/search";
import { useRecoilState } from "recoil";
import { searchModeAtom, searchQueryAtom } from "@/store/search-atom";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import FileCard from "@/components/files/FileCard";
import ModeToggle from "@/components/search/ModeToggle";
import AdvancedSearchModal from "@/components/search/AdvancedSearchModal";
import { AdvancedSearchParams } from "@/lib/schemas/search-schema";

const SearchResults: React.FC = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchMode, setSearchMode] = useRecoilState(searchModeAtom);
  const [searchQuery, setSearchQuery] = useRecoilState(searchQueryAtom);
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  const [advancedSearchParams, setAdvancedSearchParams] = useState<AdvancedSearchParams>({
    fileName: "",
    mimeType: "",
    tag: "",
    isFavorite: false,
    sizeMin: 0,
    sizeMax: undefined,
    sharedOnly: false,
    createdBefore: undefined,
    createdAfter: undefined,
  });
  
  // Get search query from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryParam = params.get('query');
    const modeParam = params.get('mode') as "raw" | "advanced" | "smart" | null;
    
    if (queryParam) {
      setSearchQuery(queryParam);
    }
    
    if (modeParam && ["raw", "advanced", "smart"].includes(modeParam)) {
      setSearchMode(modeParam as "raw" | "advanced" | "smart");
    }
  }, []);

  // Fetch search results based on mode
  const { data: searchResults = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/search", searchMode, searchQuery, advancedSearchParams],
    queryFn: () => {
      if (!searchQuery && searchMode !== "advanced") return Promise.resolve([]);

      switch (searchMode) {
        case "advanced":
          // Use the full advancedSearchParams object
          return searchApi.advancedSearch({
            ...advancedSearchParams,
            // If there's a searchQuery, use it as fileName
            ...(searchQuery ? { fileName: searchQuery } : {})
          });
        case "smart":
          return searchApi.smartSearch(searchQuery).then(data => data.results);
        case "raw":
        default:
          return searchApi.rawSearch(searchQuery);
      }
    },
    enabled: searchQuery.length > 0 || (searchMode === "advanced" && Object.values(advancedSearchParams).some(val => val !== undefined && val !== "" && val !== false && val !== 0))
  });

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col md:ml-64">
        <MobileNavbar />
        <TopBar currentPath="/search" />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6">
          {/* Search Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Search Results</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isLoading ? 'Searching...' : `Found ${searchResults.length} results for "${searchQuery}"`}
                </p>
              </div>
              
              <div className="mt-3 sm:mt-0 flex items-center space-x-2">
                <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-[300px] sm:w-[400px]">
                    <SheetHeader>
                      <SheetTitle>Search Filters</SheetTitle>
                    </SheetHeader>
                    
                    <div className="py-4 space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">File Types</h3>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="type-docs" />
                            <Label htmlFor="type-docs">Documents</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="type-images" />
                            <Label htmlFor="type-images">Images</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="type-videos" />
                            <Label htmlFor="type-videos">Videos</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="type-audio" />
                            <Label htmlFor="type-audio">Audio</Label>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Date Modified</h3>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="date-today" />
                            <Label htmlFor="date-today">Today</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="date-week" />
                            <Label htmlFor="date-week">This week</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="date-month" />
                            <Label htmlFor="date-month">This month</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="date-year" />
                            <Label htmlFor="date-year">This year</Label>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">File Size</h3>
                        <div className="pt-4">
                          <Slider defaultValue={[0, 100]} max={100} step={1} />
                          <div className="flex justify-between mt-2 text-xs text-gray-500">
                            <span>0 KB</span>
                            <span>100+ MB</span>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Cloud Provider</h3>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="provider-google" />
                            <Label htmlFor="provider-google">Google Drive</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="provider-dropbox" />
                            <Label htmlFor="provider-dropbox">Dropbox</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="provider-onedrive" />
                            <Label htmlFor="provider-onedrive">OneDrive</Label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 flex justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          Reset
                        </Button>
                        <Button size="sm" onClick={() => setFiltersOpen(false)}>
                          Apply Filters
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              
                <div className="flex items-center">
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    className="rounded-l-md"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-5 w-5" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    className="rounded-r-md"
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Search Mode Toggle */}
          <div className="mb-6">
            <ModeToggle 
              activeMode={searchMode} 
              onModeChange={(mode) => setSearchMode(mode)} 
            />
          </div>
          
          {/* Search Results */}
          {isLoading ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {Array(10).fill(0).map((_, index) => (
                  <Skeleton key={index} className="h-36 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {Array(10).fill(0).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full rounded-md" />
                ))}
              </div>
            )
          ) : searchResults.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {searchResults.map((file) => (
                  <FileCard 
                    key={file.id} 
                    file={file} 
                    view="grid" 
                  />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-800 rounded-md border border-gray-200 dark:border-gray-800">
                {searchResults.map((file) => (
                  <FileCard 
                    key={file.id} 
                    file={file} 
                    view="list" 
                  />
                ))}
              </div>
            )
          ) : searchQuery ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full">
                  <FileSearch className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">No results found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Try adjusting your search or filters to find what you're looking for
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full">
                  <FileSearch className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">Start searching</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Use the search bar at the top to find your files
                </p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchResults;
