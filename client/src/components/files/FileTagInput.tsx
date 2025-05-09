import React, { useState, useRef, KeyboardEvent } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Tag } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { filesApi } from "@/api/files";
import { File } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface FileTagInputProps {
  file: File;
}

export const FileTagInput: React.FC<FileTagInputProps> = ({ file }) => {
  const [newTag, setNewTag] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Add tag mutation
  const addTagMutation = useMutation({
    mutationFn: ({ fileId, tag }: { fileId: number; tag: string }) =>
      filesApi.addTag(fileId, tag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files", file.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/folders/contents"] });
      setNewTag("");
      setIsAdding(false);
      toast({
        title: "Tag added",
        description: "Tag was successfully added to the file",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add tag",
        variant: "destructive",
      });
    },
  });

  // Remove tag mutation
  const removeTagMutation = useMutation({
    mutationFn: ({ fileId, tag }: { fileId: number; tag: string }) =>
      filesApi.removeTag(fileId, tag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files", file.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/folders/contents"] });
      toast({
        title: "Tag removed",
        description: "Tag was successfully removed from the file",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove tag",
        variant: "destructive",
      });
    },
  });

  const handleAddTag = () => {
    if (newTag.trim() === "") return;

    // Check if tag already exists
    if (file.tags && file.tags.includes(newTag.trim())) {
      toast({
        title: "Tag already exists",
        description: "This tag is already added to the file",
        variant: "destructive",
      });
      return;
    }

    addTagMutation.mutate({ fileId: file.id, tag: newTag.trim() });
  };

  const handleRemoveTag = (tag: string) => {
    removeTagMutation.mutate({ fileId: file.id, tag });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddTag();
    } else if (event.key === "Escape") {
      setIsAdding(false);
      setNewTag("");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Tags</div>
        {!isAdding && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2"
            onClick={() => {
              setIsAdding(true);
              setTimeout(() => inputRef.current?.focus(), 10);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        )}
      </div>

      {/* Tag list */}
      <div className="flex flex-wrap gap-1.5 mt-1">
        {file.tags && file.tags.length > 0 ? (
          file.tags.map((tag, index) => (
            <Card
              key={index}
              className="flex items-center px-2 py-1 text-xs bg-secondary"
            >
              <Tag className="h-3 w-3 mr-1 text-muted-foreground" />
              <span>{tag}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 p-0"
                onClick={() => handleRemoveTag(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Card>
          ))
        ) : (
          <div className="text-xs text-muted-foreground italic">
            No tags added
          </div>
        )}
      </div>

      {/* Add tag input */}
      {isAdding && (
        <div className="flex items-center mt-2 space-x-2">
          <Input
            ref={inputRef}
            placeholder="Enter tag name"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 text-sm"
          />
          <Button
            size="sm"
            className="h-8"
            onClick={handleAddTag}
            disabled={addTagMutation.isPending || newTag.trim() === ""}
          >
            Add
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            onClick={() => {
              setIsAdding(false);
              setNewTag("");
            }}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileTagInput;