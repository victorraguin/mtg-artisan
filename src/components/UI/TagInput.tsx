import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

interface TagInputProps {
  label?: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

export function TagInput({
  label,
  tags,
  onTagsChange,
  placeholder = "Ajouter un tag...",
  maxTags = 10,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.includes(trimmedValue) && tags.length < maxTags) {
      onTagsChange([...tags, trimmedValue]);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-4">
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag) => (
          <span
            key={tag}
            className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-sm flex items-center gap-2"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-primary/70 hover:text-primary transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      {tags.length < maxTags && (
        <div className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-card/50 border border-border/50 text-foreground rounded-2xl px-4 py-3 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 placeholder:text-muted-foreground/60"
            placeholder={placeholder}
          />
          <Button type="button" variant="outline" onClick={addTag} size="md">
            Ajouter
          </Button>
        </div>
      )}

      {tags.length >= maxTags && (
        <p className="text-sm text-muted-foreground">
          Nombre maximum de tags atteint ({maxTags})
        </p>
      )}
    </div>
  );
}
