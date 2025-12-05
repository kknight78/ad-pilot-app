"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Palette,
  Loader2,
  Sparkles,
  PenLine,
  Lightbulb,
} from "lucide-react";

export interface Theme {
  name: string;
  emoji: string;
}

interface ThemeSelectorV2Props {
  onSelect?: (theme: string | null) => void;
  onContinue?: (theme: string | null) => void;
}

type ThemeOption = "choose_for_me" | "specific" | "inspire";

export function ThemeSelectorV2({ onSelect, onContinue }: ThemeSelectorV2Props) {
  const [selectedOption, setSelectedOption] = useState<ThemeOption>("choose_for_me");
  const [specificInput, setSpecificInput] = useState("");
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetchedInspire, setHasFetchedInspire] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-fetch when "Inspire me" is selected
  useEffect(() => {
    if (selectedOption === "inspire" && !hasFetchedInspire && themes.length === 0) {
      fetchThemes();
      setHasFetchedInspire(true);
    }
  }, [selectedOption, hasFetchedInspire, themes.length]);

  // Focus input when "specific" is selected
  useEffect(() => {
    if (selectedOption === "specific" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedOption]);

  const fetchThemes = async () => {
    setLoading(true);
    setError(null);

    console.log("[ThemeSelector] Fetching inspiration themes...");

    try {
      const response = await fetch(
        "https://corsproxy.io/?https://kelly-ads.app.n8n.cloud/webhook/theme-suggest",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ client_id: "ccc" }),
        }
      );

      console.log("[ThemeSelector] Response status:", response.status);

      if (!response.ok) throw new Error("Failed to fetch themes");

      const data = await response.json();
      console.log("[ThemeSelector] Response data:", data);

      if (data.themes && Array.isArray(data.themes)) {
        setThemes(data.themes);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("[ThemeSelector] Error:", err);
      setError("Couldn't load ideas. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (theme: Theme) => {
    // Switch to "specific" mode and populate input
    setSelectedOption("specific");
    setSpecificInput(theme.name);
    onSelect?.(theme.name);
  };

  const handleContinue = () => {
    if (selectedOption === "choose_for_me") {
      onContinue?.(null);
    } else if (selectedOption === "specific" && specificInput.trim()) {
      onContinue?.(specificInput.trim());
    }
  };

  const canContinue =
    selectedOption === "choose_for_me" ||
    (selectedOption === "specific" && specificInput.trim().length > 0);

  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Palette className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Weekly Theme</CardTitle>
            <p className="text-sm text-gray-500">
              Sets the tone for your ads
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Option 1: Choose for me */}
        <label
          className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
            selectedOption === "choose_for_me"
              ? "border-purple-500 bg-purple-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-start gap-3">
            <input
              type="radio"
              name="themeOption"
              checked={selectedOption === "choose_for_me"}
              onChange={() => setSelectedOption("choose_for_me")}
              className="w-4 h-4 mt-0.5 text-purple-600 focus:ring-purple-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="font-medium text-gray-900">Choose for me</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                We&apos;ll create solid, can&apos;t-miss ads
              </p>
              <p className="text-xs text-gray-400 mt-1 italic">
                e.g., &quot;You won&apos;t want to miss these deals...&quot;
              </p>
            </div>
          </div>
        </label>

        {/* Option 2: I have something specific */}
        <label
          className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
            selectedOption === "specific"
              ? "border-purple-500 bg-purple-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-start gap-3">
            <input
              type="radio"
              name="themeOption"
              checked={selectedOption === "specific"}
              onChange={() => setSelectedOption("specific")}
              className="w-4 h-4 mt-0.5 text-purple-600 focus:ring-purple-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <PenLine className="w-4 h-4 text-purple-500" />
                <span className="font-medium text-gray-900">I have something specific:</span>
              </div>
              <input
                ref={inputRef}
                type="text"
                value={specificInput}
                onChange={(e) => {
                  setSpecificInput(e.target.value);
                  if (selectedOption !== "specific") {
                    setSelectedOption("specific");
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOption("specific");
                }}
                placeholder="e.g., Thanksgiving, Black Friday, Winter"
                className="w-full mt-2 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              />
            </div>
          </div>
        </label>

        {/* Option 3: Inspire me */}
        <div
          className={`p-4 border-2 rounded-lg transition-all ${
            selectedOption === "inspire"
              ? "border-purple-500 bg-purple-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="themeOption"
              checked={selectedOption === "inspire"}
              onChange={() => setSelectedOption("inspire")}
              className="w-4 h-4 mt-0.5 text-purple-600 focus:ring-purple-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-purple-500" />
                <span className="font-medium text-gray-900">Inspire me</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Show me some timely ideas
              </p>
            </div>
          </label>

          {/* Inspiration suggestions */}
          {selectedOption === "inspire" && (
            <div className="mt-4 space-y-2">
              {loading ? (
                <div className="flex items-center justify-center py-6 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span>Loading ideas...</span>
                </div>
              ) : error ? (
                <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                  {error}
                  <Button
                    variant="link"
                    size="sm"
                    onClick={fetchThemes}
                    className="ml-2 text-red-600 underline p-0 h-auto"
                  >
                    Try again
                  </Button>
                </div>
              ) : themes.length > 0 ? (
                <>
                  <div className="space-y-2">
                    {themes.map((theme, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectSuggestion(theme)}
                        className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-white bg-white/50 transition-all flex items-center gap-3"
                      >
                        <span className="text-xl">{theme.emoji}</span>
                        <span className="font-medium text-gray-900">
                          {theme.name}
                        </span>
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setHasFetchedInspire(false);
                      fetchThemes();
                    }}
                    disabled={loading}
                    className="w-full text-gray-500 hover:text-purple-600 mt-2"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    More ideas
                  </Button>
                </>
              ) : null}
            </div>
          )}
        </div>

        {/* Continue button */}
        <Button
          className="w-full"
          onClick={handleContinue}
          disabled={!canContinue}
        >
          Continue →
        </Button>

        {/* Footer note */}
        <p className="text-xs text-gray-400 text-center">
          Applies to all ads. Override in Content Plan if needed.
        </p>
      </CardContent>
    </Card>
  );
}
