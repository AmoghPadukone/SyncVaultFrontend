import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdvancedSearchSchema, AdvancedSearchParams } from "@/lib/schemas/search-schema";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface AdvancedSearchFormProps {
  onSearch: (data: AdvancedSearchParams) => void;
  isLoading?: boolean;
  initialValues?: AdvancedSearchParams;
}

const FILE_TYPE_OPTIONS = [
  { label: "All Files", value: "all" }, // Changed from empty string to "all"
  { label: "Documents", value: "application/pdf" },
  { label: "Images", value: "image/" },
  { label: "Videos", value: "video/" },
  { label: "Spreadsheets", value: "application/vnd.ms-excel" },
  { label: "Archives", value: "application/zip" },
  { label: "Audio", value: "audio/" },
];

const AdvancedSearchForm: React.FC<AdvancedSearchFormProps> = ({
  onSearch,
  isLoading = false,
  initialValues,
}) => {
  const form = useForm<AdvancedSearchParams>({
    resolver: zodResolver(AdvancedSearchSchema),
    defaultValues: initialValues || {
      fileName: "",
      mimeType: "",
      tag: "",
      isFavorite: false,
      sizeMin: 0,
      sizeMax: undefined,
      sharedOnly: false,
      createdBefore: undefined,
      createdAfter: undefined,
    },
  });

  const handleSubmit = (data: AdvancedSearchParams) => {
    onSearch(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          {/* File Name */}
          <FormField
            control={form.control}
            name="fileName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>File Name</FormLabel>
                <FormControl>
                  <Input placeholder="Search by file name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* File Type / MIME Type */}
          <FormField
            control={form.control}
            name="mimeType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>File Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select file type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FILE_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tag */}
          <FormField
            control={form.control}
            name="tag"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tag</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input placeholder="Enter tag" {...field} />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 w-10 p-0"
                      onClick={() => {}}
                    >
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>Filter by file tag</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Favorite Files Only */}
            <FormField
              control={form.control}
              name="isFavorite"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer">Favorites only</FormLabel>
                </FormItem>
              )}
            />

            {/* Shared Files Only */}
            <FormField
              control={form.control}
              name="sharedOnly"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer">Shared files only</FormLabel>
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* File Size Range */}
          <div className="space-y-2">
            <Label htmlFor="file-size">File Size (in bytes)</Label>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sizeMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Size</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0}
                        placeholder="Min size" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sizeMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Size</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0}
                        placeholder="Max size" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          {/* Created Date Range */}
          <div className="space-y-2">
            <Label>Created Date Range</Label>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="createdAfter"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>From</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date ? date.toISOString() : undefined)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="createdBefore"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>To</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date ? date.toISOString() : undefined)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AdvancedSearchForm;