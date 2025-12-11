"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Check,
  RefreshCw,
  ArrowRight,
  Pencil,
  Lightbulb,
  Sparkles,
  Star,
  Palette,
} from "lucide-react";

export interface Theme {
  id: string;
  emoji: string;
  name: string;
  tagline: string;
}

// Performance-based recommendation (from last week's data)
interface PerformanceRecommendation {
  emoji: string;
  title: string;
  reason: string; // Why this is recommended (performance data)
  themeName: string;
}

// Timely theme idea for "Inspire me"
interface TimelyIdea {
  emoji: string;
  title: string;
  isRecommended?: boolean; // If also backed by performance data
}

export interface ThemeSelectorProps {
  themes: Theme[];
  multiSelect?: boolean;
  onSelect?: (selectedThemes: Theme[]) => void;
  onContinue?: (selectedThemes: Theme[]) => void;
  onRequestMore?: () => void;
  onCustomInput?: (customTheme: string) => void;
  onSkip?: () => void;
  // Performance data from last week (optional)
  performanceRecommendation?: PerformanceRecommendation | null;
}

// Generate timely theme ideas based on current date
function generateTimelyIdeas(performanceRecommendation?: PerformanceRecommendation | null): TimelyIdea[] {
  const ideas: TimelyIdea[] = [];
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const day = now.getDate();

  // Check for specific holidays/events
  const isBlackFridayWeek = month === 10 && day >= 20 && day <= 30;
  const isChristmasSeason = month === 11 || (month === 10 && day >= 25);
  const isTaxSeason = month === 0 || month === 1 || month === 2;
  const isBackToSchool = month === 7 || (month === 8 && day <= 15);
  const isSummer = month >= 5 && month <= 7;
  const isWinter = month === 11 || month === 0 || month === 1;

  // If we have a performance recommendation, add it first with star
  if (performanceRecommendation) {
    ideas.push({
      emoji: "⭐",
      title: `${performanceRecommendation.title} (recommended based on your data)`,
      isRecommended: true,
    });
  }

  // Add seasonal/timely ideas
  if (isWinter) {
    ideas.push({ emoji: "❄️", title: "Winter Ready Rides" });
  }
  if (isChristmasSeason || isBlackFridayWeek) {
    ideas.push({ emoji: "🎁", title: "Holiday Hauling Help" });
  }
  if (isTaxSeason) {
    ideas.push({ emoji: "💰", title: "Tax Refund Deals" });
  }
  if (isBackToSchool) {
    ideas.push({ emoji: "📚", title: "Back to School Wheels" });
  }
  if (isSummer) {
    ideas.push({ emoji: "☀️", title: "Summer Road Trip Ready" });
  }

  // Always-relevant ideas
  ideas.push({ emoji: "🚗", title: "Road Trip Reliability" });
  ideas.push({ emoji: "👨‍👩‍👧‍👦", title: "Affordable Family First" });
  ideas.push({ emoji: "⛽", title: "Fuel-Smart Finances" });
  ideas.push({ emoji: "💪", title: "Tough Truck Tuesday" });

  // Remove duplicates and limit to 5-6 ideas
  const seen = new Set<string>();
  const uniqueIdeas = ideas.filter((idea) => {
    const key = idea.title.replace(" (recommended based on your data)", "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return uniqueIdeas.slice(0, 6);
}

// Demo performance recommendation
const demoPerformanceRecommendation: PerformanceRecommendation = {
  emoji: "🎁",
  title: "Holiday Hauling Help",
  reason: "Your holiday content got 2x more engagement last year — great time to lean into that again.",
  themeName: "Holiday Spirit",
};

export function ThemeSelector({
  themes,
  multiSelect = false,
  onSelect,
  onContinue,
  onRequestMore,
  onCustomInput,
  onSkip,
  performanceRecommendation = demoPerformanceRecommendation,
}: ThemeSelectorProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [mode, setMode] = useState<"choose" | "custom" | "inspire">("choose");
  const [customTheme, setCustomTheme] = useState("");
  const [showMoreIdeas, setShowMoreIdeas] = useState(false);

  // Generate timely ideas
  const timelyIdeas = generateTimelyIdeas(performanceRecommendation);

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

  const handleCustomSubmit = () => {
    if (customTheme.trim() && onCustomInput) {
      onCustomInput(customTheme.trim());
    }
  };

  // Use performance recommendation
  const handleUsePerformanceRecommendation = () => {
    if (!performanceRecommendation) return;
    const matchingTheme = themes.find(
      (t) => t.name.toLowerCase().includes(performanceRecommendation.themeName.toLowerCase())
    );
    if (matchingTheme) {
      setSelected([matchingTheme.id]);
      if (onSelect) {
        onSelect([matchingTheme]);
      }
    }
  };

  // Select an idea from "Inspire me"
  const handleSelectIdea = (idea: TimelyIdea) => {
    // Try to find a matching theme
    const titleClean = idea.title.replace(" (recommended based on your data)", "");
    const matchingTheme = themes.find(
      (t) =>
        t.name.toLowerCase().includes(titleClean.toLowerCase()) ||
        titleClean.toLowerCase().includes(t.name.toLowerCase())
    );
    if (matchingTheme) {
      setSelected([matchingTheme.id]);
      if (onSelect) {
        onSelect([matchingTheme]);
      }
    } else {
      // If no matching theme, treat as custom
      setCustomTheme(titleClean);
      setMode("custom");
    }
  };

  const isSelected = (id: string) => selected.includes(id);

  return (
    <Card className="w-full max-w-xl border-blue-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Palette className="w-4 h-4 text-blue-500" />
          Weekly Theme
        </CardTitle>
        <p className="text-xs text-gray-500">
          Sets the tone for your ads
        </p>
      </CardHeader>

      <CardContent className="pt-2 space-y-4">
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

        {/* Three main options as radio-style buttons */}
        <div className="space-y-2">
          {/* Option 1: Choose for me */}
          <button
            onClick={() => {
              setMode("choose");
              // Auto-select a random or first theme
              if (themes.length > 0 && selected.length === 0) {
                const randomTheme = themes[Math.floor(Math.random() * themes.length)];
                setSelected([randomTheme.id]);
                if (onSelect) onSelect([randomTheme]);
              }
            }}
            className={`w-full flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${
              mode === "choose"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
              mode === "choose" ? "border-blue-500" : "border-gray-300"
            }`}>
              {mode === "choose" && <div className="w-2 h-2 rounded-full bg-blue-500" />}
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
            onClick={() => setMode("custom")}
            className={`w-full flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${
              mode === "custom"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
              mode === "custom" ? "border-blue-500" : "border-gray-300"
            }`}>
              {mode === "custom" && <div className="w-2 h-2 rounded-full bg-blue-500" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-gray-900">I have something specific</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">e.g., Thanksgiving, Black Friday, Winter</p>
            </div>
          </button>

          {/* Option 3: Inspire me */}
          <button
            onClick={() => setMode("inspire")}
            className={`w-full flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${
              mode === "inspire"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
              mode === "inspire" ? "border-blue-500" : "border-gray-300"
            }`}>
              {mode === "inspire" && <div className="w-2 h-2 rounded-full bg-blue-500" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-purple-500" />
                <span className="font-medium text-gray-900">Inspire me</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Show me some timely ideas</p>
            </div>
          </button>
        </div>

        {/* Custom input expanded */}
        {mode === "custom" && (
          <div className="space-y-2 pl-7">
            <input
              type="text"
              value={customTheme}
              onChange={(e) => setCustomTheme(e.target.value)}
              placeholder="Enter your theme idea..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
              autoFocus
            />
            {customTheme.trim() && (
              <Button size="sm" onClick={handleCustomSubmit} className="w-full">
                Use &quot;{customTheme.trim()}&quot;
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        )}

        {/* Inspire me expanded - timely ideas */}
        {mode === "inspire" && (
          <div className="space-y-2 pl-7">
            <div className="space-y-1">
              {timelyIdeas.slice(0, showMoreIdeas ? undefined : 5).map((idea, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectIdea(idea)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                    idea.isRecommended
                      ? "bg-purple-50 hover:bg-purple-100 border border-purple-200"
                      : "bg-gray-50 hover:bg-gray-100 border border-transparent"
                  }`}
                >
                  <span className="text-base">{idea.emoji}</span>
                  <span className={`text-sm ${idea.isRecommended ? "font-medium text-purple-900" : "text-gray-700"}`}>
                    {idea.title}
                  </span>
                  {idea.isRecommended && (
                    <Star className="w-3 h-3 text-purple-500 ml-auto" fill="currentColor" />
                  )}
                </button>
              ))}
            </div>
            {timelyIdeas.length > 5 && (
              <button
                onClick={() => setShowMoreIdeas(!showMoreIdeas)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-3"
              >
                <RefreshCw className="w-3 h-3" />
                {showMoreIdeas ? "Show fewer" : "More ideas"}
              </button>
            )}
          </div>
        )}

        {/* Theme grid for "Choose for me" mode */}
        {mode === "choose" && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 pl-7">Or select a specific theme:</p>
            <div className="grid grid-cols-2 gap-2">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleSelect(theme)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all text-left ${
                    isSelected(theme.id)
                      ? "border-blue-500 bg-blue-50"
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
                    <Check className="w-4 h-4 text-blue-500 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tagline preview for selected theme */}
        {selected.length === 1 && mode === "choose" && (
          <p className="text-xs text-gray-500 text-center italic">
            &ldquo;{themes.find((t) => t.id === selected[0])?.tagline}&rdquo;
          </p>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <button
            onClick={onSkip}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <ArrowRight className="w-3 h-3" />
            Skip theme
          </button>

          {/* Continue button */}
          {selected.length > 0 && (
            <Button size="sm" onClick={handleContinue}>
              Continue with {themes.find((t) => t.id === selected[0])?.name}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}

          {mode === "choose" && selected.length === 0 && (
            <Button size="sm" variant="outline" onClick={onRequestMore}>
              <RefreshCw className="w-3 h-3 mr-1" />
              Different themes
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
