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
  Star,
  ArrowRight,
} from "lucide-react";
import { WhatsThis } from "@/components/ui/whats-this";

export interface Theme {
  name: string;
  emoji: string;
}

// Performance-based recommendation (from last week's data)
interface PerformanceRecommendation {
  emoji: string;
  title: string;
  reason: string;
}

interface ThemeSelectorV2Props {
  onSelect?: (theme: string | null) => void;
  onContinue?: (theme: string | null) => void;
  // Performance data from last week (optional)
  performanceRecommendation?: PerformanceRecommendation | null;
}

type ThemeOption = "choose_for_me" | "specific" | "inspire";

// Demo performance recommendation
const demoPerformanceRecommendation: PerformanceRecommendation = {
  emoji: "🎁",
  title: "Holiday Hauling Help",
  reason: "Your holiday content got 2x more engagement last year — great time to lean into that again.",
};

export function ThemeSelectorV2({
  onSelect,
  onContinue,
  performanceRecommendation = demoPerformanceRecommendation,
}: ThemeSelectorV2Props) {
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
        "https://corsproxy.io/?https://ad-pilot-n8n-production.up.railway.app/webhook/theme-suggest",
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

  const handleUsePerformanceRecommendation = () => {
    if (!performanceRecommendation) return;
    setSelectedOption("specific");
    setSpecificInput(performanceRecommendation.title);
    onSelect?.(performanceRecommendation.title);
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

  // Check if performance recommendation matches any fetched theme
  const isRecommendedTheme = (theme: Theme) => {
    if (!performanceRecommendation) return false;
    return theme.name.toLowerCase().includes(performanceRecommendation.title.toLowerCase()) ||
           performanceRecommendation.title.toLowerCase().includes(theme.name.toLowerCase());
  };

  return (
    <Card className="w-full max-w-xl border-blue-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          Weekly Theme
        </CardTitle>
        <p className="text-xs text-gray-500 mt-1">Sets the tone for your ads</p>
        <WhatsThis className="mt-2">
          <p className="mb-2"><strong>How themes appear in your videos:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Script hooks reference the theme naturally</li>
            <li>Visual overlays match the seasonal mood</li>
            <li>Call-to-actions tie into the theme messaging</li>
          </ul>
          <p className="mt-2 text-xs text-gray-500">
            Consistent themes help your audience recognize campaigns and build momentum.
          </p>
        </WhatsThis>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Performance-Based Suggestion - Show prominently at top */}
        {performanceRecommendation && (
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-purple-700 text-xs font-medium mb-2">
              <Lightbulb className="w-4 h-4" />
              Based on Last Week&apos;s Performance
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{performanceRecommendation.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{performanceRecommendation.title}</p>
                <p className="text-sm text-gray-600 mt-1">{performanceRecommendation.reason}</p>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <Button
                size="sm"
                onClick={handleUsePerformanceRecommendation}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Use This Theme
              </Button>
            </div>
          </div>
        )}

        {/* Divider */}
        {performanceRecommendation && (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">Or pick your own</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
        )}

        {/* Option 1: Choose for me */}
        <button
          onClick={() => setSelectedOption("choose_for_me")}
          className={`w-full flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${
            selectedOption === "choose_for_me"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300 bg-white"
          }`}
        >
          <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
            selectedOption === "choose_for_me" ? "border-blue-500" : "border-gray-300"
          }`}>
            {selectedOption === "choose_for_me" && <div className="w-2 h-2 rounded-full bg-blue-500" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-gray-900">Choose for me</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">We&apos;ll create solid, can&apos;t-miss ads</p>
          </div>
        </button>

        {/* Option 2: I have something specific */}
        <button
          onClick={() => setSelectedOption("specific")}
          className={`w-full flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${
            selectedOption === "specific"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300 bg-white"
          }`}
        >
          <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
            selectedOption === "specific" ? "border-blue-500" : "border-gray-300"
          }`}>
            {selectedOption === "specific" && <div className="w-2 h-2 rounded-full bg-blue-500" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <PenLine className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-gray-900">I have something specific</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">e.g., Thanksgiving, Black Friday, Winter</p>
          </div>
        </button>

        {/* Custom input expanded */}
        {selectedOption === "specific" && (
          <div className="space-y-2 pl-7">
            <input
              ref={inputRef}
              type="text"
              value={specificInput}
              onChange={(e) => setSpecificInput(e.target.value)}
              placeholder="Enter your theme idea..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {specificInput.trim() && (
              <Button size="sm" onClick={handleContinue} className="w-full">
                Use &quot;{specificInput.trim()}&quot;
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        )}

        {/* Option 3: Inspire me */}
        <button
          onClick={() => setSelectedOption("inspire")}
          className={`w-full flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${
            selectedOption === "inspire"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300 bg-white"
          }`}
        >
          <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
            selectedOption === "inspire" ? "border-blue-500" : "border-gray-300"
          }`}>
            {selectedOption === "inspire" && <div className="w-2 h-2 rounded-full bg-blue-500" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-purple-500" />
              <span className="font-medium text-gray-900">Inspire me</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Show me some timely ideas</p>
          </div>
        </button>

        {/* Inspiration suggestions expanded */}
        {selectedOption === "inspire" && (
          <div className="space-y-2 pl-7">
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
                <div className="space-y-1">
                  {/* Show performance-matched theme first with star */}
                  {themes
                    .sort((a, b) => {
                      const aRec = isRecommendedTheme(a);
                      const bRec = isRecommendedTheme(b);
                      if (aRec && !bRec) return -1;
                      if (!aRec && bRec) return 1;
                      return 0;
                    })
                    .map((theme, index) => {
                      const isRecommended = isRecommendedTheme(theme);
                      return (
                        <button
                          key={index}
                          onClick={() => handleSelectSuggestion(theme)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                            isRecommended
                              ? "bg-purple-50 hover:bg-purple-100 border border-purple-200"
                              : "bg-gray-50 hover:bg-gray-100 border border-transparent"
                          }`}
                        >
                          <span className="text-base">{isRecommended ? "⭐" : theme.emoji}</span>
                          <span className={`text-sm flex-1 ${isRecommended ? "font-medium text-purple-900" : "text-gray-700"}`}>
                            {theme.name}
                            {isRecommended && (
                              <span className="text-xs text-purple-600 ml-1">(recommended)</span>
                            )}
                          </span>
                          {isRecommended && (
                            <Star className="w-3 h-3 text-purple-500" fill="currentColor" />
                          )}
                        </button>
                      );
                    })}
                </div>
                <button
                  onClick={() => {
                    setHasFetchedInspire(false);
                    fetchThemes();
                  }}
                  disabled={loading}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-3"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                  More ideas
                </button>
              </>
            ) : null}
          </div>
        )}

        {/* Continue button - only show for "choose for me" mode */}
        {selectedOption === "choose_for_me" && (
          <Button className="w-full" onClick={handleContinue}>
            Continue
            <ArrowRight className="w-4 h-4 ml-1" />
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
