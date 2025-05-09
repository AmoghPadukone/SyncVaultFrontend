import React from "react";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";

interface ModeToggleProps {
  activeMode: "raw" | "advanced" | "smart";
  onModeChange: (mode: "raw" | "advanced" | "smart") => void;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ activeMode, onModeChange }) => {
  return (
    <div className="flex space-x-2">
      <Button
        variant={activeMode === "raw" ? "default" : "outline"}
        size="sm"
        onClick={() => onModeChange("raw")}
        className="flex items-center gap-1"
      >
        <Search className="h-4 w-4" />
        <span>Raw</span>
      </Button>
      
      <Button
        variant={activeMode === "advanced" ? "default" : "outline"}
        size="sm"
        onClick={() => onModeChange("advanced")}
        className="flex items-center gap-1"
      >
        <SlidersHorizontal className="h-4 w-4" />
        <span>Advanced</span>
      </Button>
      
      <Button
        variant={activeMode === "smart" ? "default" : "outline"}
        size="sm"
        onClick={() => onModeChange("smart")}
        className="flex items-center gap-1"
      >
        <Sparkles className="h-4 w-4" />
        <span>Smart</span>
      </Button>
    </div>
  );
};

export default ModeToggle;
