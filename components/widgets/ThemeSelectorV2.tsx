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
  onSelect?: (theme: Theme | string) => void;
  onContinue?: (theme: Theme | string) => void;
}

type SuggestionMode = "lucky" | "guided";

export function ThemeSelectorV2({ onSelect, onContinue }: ThemeSelectorV2Props) {
  // Custom theme input
  const [customTheme, setCustomTheme] = useState("");

  // Suggestion mode
  const [suggestionMode, setSuggestionMode] = useState<SuggestionMode>("lucky");
  const [guidedInput, setGuidedInput] = useState("");

  // Suggested themes from backend
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);

  // Loading state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchThemes = async () => {
    setLoading(true);
    setError(null);
    setSelectedTheme(null);

    try {
      const response = await fetch(
        "https://corsproxy.io/?https://kelly-ads.app.n8n.cloud/webhook/theme-suggest",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: "Rantoul, IL",
            client_id: "ccc",
            guidance: suggestionMode === "guided" ? guidedInput : undefined,
          }),
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

  const handleSelectTheme = (theme: Theme) => {
    setSelectedTheme(theme);
    setCustomTheme(""); // Clear custom if selecting a suggested theme
    onSelect?.(theme);
  };

  const handleContinue = () => {
    if (customTheme.trim()) {
      onContinue?.(customTheme.trim());
    } else if (selectedTheme) {
      onContinue?.(selectedTheme);
    }
  };

  const hasSelection = customTheme.trim() || selectedTheme;

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
        {/* Custom theme input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Create your own
          </label>
          <input
            type="text"
            value={customTheme}
            onChange={(e) => {
              setCustomTheme(e.target.value);
              if (e.target.value) setSelectedTheme(null); // Clear selected if typing custom
            }}
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
                  placeholder="e.g., winter weather, family safety, budget"
                  className="w-full mt-2 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
          </label>

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
                const isSelected = selectedTheme?.name === theme.name;
                return (
                  <button
                    key={index}
                    onClick={() => handleSelectTheme(theme)}
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
                            <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
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

        {/* Continue button */}
        {hasSelection && (
          <Button className="w-full" onClick={handleContinue}>
            Continue with {customTheme.trim() ? `"${customTheme.trim()}"` : selectedTheme?.name}
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
