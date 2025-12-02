"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Check,
  RefreshCw,
  ArrowRight,
  Pencil,
  ThumbsUp,
  ThumbsDown,
  Palette,
} from "lucide-react";

export interface Theme {
  id: string;
  emoji: string;
  name: string;
  tagline: string;
}

export interface ThemeSelectorProps {
  themes: Theme[];
  multiSelect?: boolean;
  onSelect?: (selectedThemes: Theme[]) => void;
  onContinue?: (selectedThemes: Theme[]) => void;
  onRequestMore?: () => void;
  onCustomInput?: () => void;
  onSkip?: () => void;
  onFeedback?: (themeId: string, isPositive: boolean) => void;
}

export function ThemeSelector({
  themes,
  multiSelect = false,
  onSelect,
  onContinue,
  onRequestMore,
  onCustomInput,
  onSkip,
  onFeedback,
}: ThemeSelectorProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Record<string, "up" | "down">>({});
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customTheme, setCustomTheme] = useState("");

  const handleSelect = (theme: Theme) => {
    let newSelected: string[];

    if (multiSelect) {
      if (selected.includes(theme.id)) {
        newSelected = selected.filter((id) => id !== theme.id);
      } else {
        newSelected = [...selected, theme.id];
      }
    } else {
      newSelected = selected.includes(theme.id) ? [] : [theme.id];
    }

    setSelected(newSelected);

    if (onSelect) {
      const selectedThemes = themes.filter((t) => newSelected.includes(t.id));
      onSelect(selectedThemes);
    }
  };

  const handleContinue = () => {
    if (onContinue) {
      const selectedThemes = themes.filter((t) => selected.includes(t.id));
      onContinue(selectedThemes);
    }
  };

  const handleFeedback = (
    e: React.MouseEvent,
    themeId: string,
    isPositive: boolean
  ) => {
    e.stopPropagation();
    const newFeedback = feedback[themeId] === (isPositive ? "up" : "down")
      ? undefined
      : (isPositive ? "up" : "down");

    setFeedback((prev) => ({
      ...prev,
      [themeId]: newFeedback as "up" | "down",
    }));

    if (onFeedback && newFeedback) {
      onFeedback(themeId, isPositive);
    }
  };

  const handleCustomSubmit = () => {
    if (customTheme.trim() && onCustomInput) {
      onCustomInput();
    }
  };

  const isSelected = (id: string) => selected.includes(id);

  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-100 rounded-lg">
            <Palette className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <CardTitle className="text-base">🎨 Choose a Theme</CardTitle>
            <p className="text-xs text-gray-500">
              One theme keeps your content consistent
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Compact theme cards - 2 per row */}
        <div className="grid grid-cols-2 gap-2">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleSelect(theme)}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all text-left group ${
                isSelected(theme.id)
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <span className="text-lg">{theme.emoji}</span>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm text-gray-800 block truncate">
                  {theme.name}
                </span>
              </div>
              {isSelected(theme.id) && (
                <Check className="w-4 h-4 text-primary-500 shrink-0" />
              )}

              {/* Thumbs feedback - subtle, in corner */}
              <div className="absolute -top-1 -right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleFeedback(e, theme.id, true)}
                  className={`p-0.5 rounded ${
                    feedback[theme.id] === "up"
                      ? "text-green-500"
                      : "text-gray-300 hover:text-gray-400"
                  }`}
                  title="I like this suggestion"
                >
                  <ThumbsUp className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => handleFeedback(e, theme.id, false)}
                  className={`p-0.5 rounded ${
                    feedback[theme.id] === "down"
                      ? "text-red-400"
                      : "text-gray-300 hover:text-gray-400"
                  }`}
                  title="Not for me"
                >
                  <ThumbsDown className="w-3 h-3" />
                </button>
              </div>
            </button>
          ))}
        </div>

        {/* Tagline preview for selected theme */}
        {selected.length === 1 && (
          <p className="text-xs text-gray-500 mt-2 text-center italic">
            &ldquo;{themes.find((t) => t.id === selected[0])?.tagline}&rdquo;
          </p>
        )}

        {/* Custom input */}
        {showCustomInput && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={customTheme}
              onChange={(e) => setCustomTheme(e.target.value)}
              placeholder="Enter your theme idea..."
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
            />
            <Button size="sm" onClick={handleCustomSubmit} disabled={!customTheme.trim()}>
              Use This
            </Button>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            className="text-xs text-gray-600"
            onClick={onRequestMore}
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            More
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs text-gray-600"
            onClick={() => setShowCustomInput(!showCustomInput)}
          >
            <Pencil className="w-3 h-3 mr-1" />
            Custom
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-500"
            onClick={onSkip}
          >
            <ArrowRight className="w-3 h-3 mr-1" />
            No Theme
          </Button>
        </div>

        {/* Continue button */}
        {selected.length > 0 && (
          <Button
            className="w-full mt-3"
            size="sm"
            onClick={handleContinue}
          >
            Continue with {themes.find((t) => t.id === selected[0])?.name}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}

        <p className="text-[10px] text-gray-400 mt-2 text-center">
          Hover cards to rate suggestions (optional)
        </p>
      </CardContent>
    </Card>
  );
}
