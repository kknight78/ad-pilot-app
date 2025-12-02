"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, RefreshCw, X, Palette } from "lucide-react";

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
  onRequestMore?: () => void;
  onSkip?: () => void;
}

export function ThemeSelector({
  themes,
  multiSelect = false,
  onSelect,
  onRequestMore,
  onSkip,
}: ThemeSelectorProps) {
  const [selected, setSelected] = useState<string[]>([]);

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

  const isSelected = (id: string) => selected.includes(id);

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Palette className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <CardTitle className="text-lg">🎨 Choose a Theme</CardTitle>
            <p className="text-sm text-gray-500 mt-0.5">
              We recommend one theme for consistency, but you can mix it up
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-2">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleSelect(theme)}
              className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all text-left ${
                isSelected(theme.id)
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{theme.emoji}</span>
                <div>
                  <span className="font-medium text-gray-800">{theme.name}</span>
                  <p className="text-sm text-gray-500">&ldquo;{theme.tagline}&rdquo;</p>
                </div>
              </div>
              {isSelected(theme.id) && (
                <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          {onRequestMore && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-gray-600"
              onClick={onRequestMore}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Suggest More
            </Button>
          )}
          {onSkip && (
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-gray-500"
              onClick={onSkip}
            >
              <X className="w-4 h-4 mr-1" />
              Skip — no theme
            </Button>
          )}
        </div>

        {selected.length > 0 && (
          <p className="text-sm text-primary-600 mt-3 text-center">
            {selected.length === 1
              ? "Theme selected! Click to continue."
              : `${selected.length} themes selected`}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
