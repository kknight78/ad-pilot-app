"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Lightbulb,
  Sparkles,
  Palette,
  Loader2,
  Check,
} from "lucide-react";

export interface Theme {
  name: string;
  emoji: string;
  hook_example: string;
  why?: string;
}

interface ThemeSelectorV2Props {
  onSelect?: (theme: string) => void;
  onContinue?: (theme: string) => void;
}

type SuggestionMode = "lucky" | "guided";
type HookLength = "punchy" | "detailed";

export function ThemeSelectorV2({ onSelect, onContinue }: ThemeSelectorV2Props) {
  // The main theme input - this is what gets submitted
  const [themeInput, setThemeInput] = useState("");

  // Track which suggestion was clicked (for highlighting)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Suggestion mode
  const [suggestionMode, setSuggestionMode] = useState<SuggestionMode>("lucky");
  const [guidedInput, setGuidedInput] = useState("");

  // Hook length toggle
  const [hookLength, setHookLength] = useState<HookLength>("punchy");

  // Suggested themes from backend
  const [themes, setThemes] = useState<Theme[]>([]);

  // Loading state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchThemes = async () => {
    setLoading(true);
    setError(null);
    setSelectedIndex(null);

    try {
      const body: Record<string, string> = {
        location: "Rantoul, IL",
        client_id: "ccc",
        hook_length: hookLength,
      };

      // Add topic if guided mode is selected
      if (suggestionMode === "guided" && guidedInput.trim()) {
        body.topic = guidedInput.trim();
      }

      const response = await fetch(
        "https://corsproxy.io/?https://kelly-ads.app.n8n.cloud/webhook/theme-suggest",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) throw new Error("Failed to fetch themes");

      const data = await response.json();
      if (data.themes && Array.isArray(data.themes)) {
        setThemes(data.themes);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Theme fetch error:", err);
      setError("Couldn't load suggestions. Try again or enter a custom theme.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTheme = (theme: Theme, index: number) => {
    // Populate the input field with the theme name
    setThemeInput(theme.name);
    setSelectedIndex(index);
    onSelect?.(theme.name);
  };

  const handleContinue = () => {
    if (themeInput.trim()) {
      onContinue?.(themeInput.trim());
    }
  };

  const handleInputChange = (value: string) => {
    setThemeInput(value);
    // Clear selection highlight if user manually edits
    if (selectedIndex !== null && themes[selectedIndex]?.name !== value) {
      setSelectedIndex(null);
    }
  };

  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Palette className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Choose a Weekly Theme</CardTitle>
            <p className="text-sm text-gray-500">
              Sets the tone for all your content this week
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Main theme input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Create your own
          </label>
          <input
            type="text"
            value={themeInput}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="e.g., Holiday Road Trip Ready"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* OR divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-400 font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Suggestion options */}
        <div className="space-y-3">
          {/* I'm feeling lucky */}
          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="suggestionMode"
              checked={suggestionMode === "lucky"}
              onChange={() => setSuggestionMode("lucky")}
              className="w-4 h-4 text-purple-600 focus:ring-purple-500"
            />
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="font-medium text-gray-700">I&apos;m feeling lucky</span>
            </div>
          </label>

          {/* Give me themes about... */}
          <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="suggestionMode"
              checked={suggestionMode === "guided"}
              onChange={() => setSuggestionMode("guided")}
              className="w-4 h-4 mt-1 text-purple-600 focus:ring-purple-500"
            />
            <div className="flex-1">
              <span className="font-medium text-gray-700">Give me themes about...</span>
              {suggestionMode === "guided" && (
                <input
                  type="text"
                  value={guidedInput}
                  onChange={(e) => setGuidedInput(e.target.value)}
                  placeholder="e.g., 4wd, winter weather, family safety"
                  className="w-full mt-2 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
          </label>

          {/* Hook length toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hook style
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setHookLength("punchy")}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
                  hookLength === "punchy"
                    ? "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                Punchy (15-20 words)
              </button>
              <button
                onClick={() => setHookLength("detailed")}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
                  hookLength === "detailed"
                    ? "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                Detailed (25-35 words)
              </button>
            </div>
          </div>

          {/* Suggest button */}
          <Button
            onClick={fetchThemes}
            disabled={loading || (suggestionMode === "guided" && !guidedInput.trim())}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4 mr-2" />
                Suggest Themes
              </>
            )}
          </Button>
        </div>

        {/* Error message */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        {/* Suggested themes */}
        {themes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Suggestions</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchThemes}
                disabled={loading}
                className="text-gray-500 hover:text-purple-600"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>

            <div className="space-y-2">
              {themes.map((theme, index) => {
                const isSelected = selectedIndex === index;
                return (
                  <button
                    key={index}
                    onClick={() => handleSelectTheme(theme, index)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{theme.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {theme.name}
                          </span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-purple-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1 italic">
                          &ldquo;{theme.hook_example}&rdquo;
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Continue button - only show when there's input */}
        {themeInput.trim() && (
          <Button className="w-full" onClick={handleContinue}>
            Continue with &ldquo;{themeInput.trim()}&rdquo;
          </Button>
        )}

        {/* Footer note */}
        <p className="text-xs text-gray-400 text-center">
          Applies to all ads. Override in Content Plan if needed.
        </p>
      </CardContent>
    </Card>
  );
}
