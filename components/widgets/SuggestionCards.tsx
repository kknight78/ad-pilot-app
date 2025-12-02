"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, UserCircle, Film, Gift, X, Sparkles } from "lucide-react";

export interface Suggestion {
  id: string;
  icon: "music" | "avatar" | "template" | "holiday" | "custom";
  title: string;
  description?: string;
  price?: string;
}

export interface SuggestionCardsProps {
  suggestions: Suggestion[];
  onSelect?: (suggestion: Suggestion) => void;
  onDismiss?: () => void;
}

const iconMap = {
  music: Music,
  avatar: UserCircle,
  template: Film,
  holiday: Gift,
  custom: Sparkles,
};

export function SuggestionCards({
  suggestions,
  onSelect,
  onDismiss,
}: SuggestionCardsProps) {
  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-primary-600" />
            </div>
            <CardTitle className="text-lg">Ideas to Try</CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {suggestions.map((suggestion) => {
            const Icon = iconMap[suggestion.icon] || Sparkles;

            return (
              <button
                key={suggestion.id}
                onClick={() => onSelect?.(suggestion)}
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50 transition-all text-center group"
              >
                <div className="p-3 bg-gray-100 rounded-full mb-2 group-hover:bg-primary-100 transition-colors">
                  <Icon className="w-5 h-5 text-gray-600 group-hover:text-primary-600" />
                </div>
                <span className="font-medium text-sm text-gray-800">{suggestion.title}</span>
                {suggestion.price && (
                  <span className="text-xs text-gray-500 mt-1">{suggestion.price}</span>
                )}
                {suggestion.description && (
                  <span className="text-xs text-gray-500 mt-1">{suggestion.description}</span>
                )}
              </button>
            );
          })}
        </div>

        {onDismiss && (
          <Button
            variant="ghost"
            className="w-full mt-3 text-gray-500"
            onClick={onDismiss}
          >
            <X className="w-4 h-4 mr-1" />
            Not right now
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
