"use client";

import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

import { SUGGESTED_PROMPTS } from "../constants/suggested-prompts";

type SuggestedPromptsProps = {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
};

export function SuggestedPrompts({
  onSelect,
  disabled,
}: SuggestedPromptsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="text-muted-foreground size-4" />
        <p className="text-muted-foreground text-sm font-medium">
          Suggested prompts
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <Button
            key={prompt}
            type="button"
            variant="outline"
            size="sm"
            className="h-auto whitespace-normal px-3 py-2 text-left text-xs"
            disabled={disabled}
            onClick={() => onSelect(prompt)}
          >
            {prompt}
          </Button>
        ))}
      </div>
    </div>
  );
}
