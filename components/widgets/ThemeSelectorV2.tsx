"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  RefreshCw,
  ArrowRight,
  Loader2,
  Palette,
  Sparkles,
} from "lucide-react";

export interface Theme {
  id: string;
  name: string;
  description: string;
  emoji: string;
  seasonal?: boolean;
  trending?: boolean;
}

interface ThemeSelectorV2Props {
  onSelect?: (theme: Theme) => void;
  onContinue?: (theme: Theme) => void;
}

// Fallback themes if API is unavailable
const fallbackThemes: Theme[] = [
  { id: "winter-prep", name: "Winter Ready", description: "Cold weather prep & safety tips", emoji: "❄️", seasonal: true },
  { id: "family-first", name: "Family First", description: "Safety features & spacious vehicles", emoji: "👨‍👩‍👧‍👦" },
  { id: "budget-smart", name: "Budget Smart", description: "Great value & financing options", emoji: "💰" },
  { id: "reliability", name: "Built to Last", description: "Dependable vehicles with great history", emoji: "🔧" },
];

export function ThemeSelectorV2({ onSelect, onContinue }: ThemeSelectorV2Props) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchThemes = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      // Try to fetch from backend - adjust endpoint as needed
      const response = await fetch("https://kelly-ads.app.n8n.cloud/webhook/themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: "ccc",
          season: getCurrentSeason(),
          context: "weekly_content_planning"
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch themes");

      const data = await response.json();
      if (data.themes && Array.isArray(data.themes)) {
        setThemes(data.themes);
      } else {
        // Use fallback if response format is unexpected
        setThemes(fallbackThemes);
      }
    } catch (err) {
      console.log("Using fallback themes:", err);
      setThemes(fallbackThemes);
      // Don't show error for fallback - just silently use defaults
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "spring";
    if (month >= 5 && month <= 7) return "summer";
    if (month >= 8 && month <= 10) return "fall";
    return "winter";
  };

  const handleSelect = (theme: Theme) => {
    setSelectedTheme(theme);
    onSelect?.(theme);
  };

  const handleContinue = () => {
    if (selectedTheme) {
      onContinue?.(selectedTheme);
    }
  };

  const handleRefresh = () => {
    setSelectedTheme(null);
    fetchThemes(true);
  };

  if (loading) {
    return (
      <Card className="w-full max-w-xl">
        <CardContent className="py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            <p className="text-sm text-gray-500">Loading theme suggestions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Palette className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Choose a Weekly Theme</CardTitle>
              <p className="text-sm text-gray-500">
                One theme keeps your content consistent
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-gray-500"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        {/* Theme cards */}
        <div className="grid gap-3">
          {themes.map((theme) => {
            const isSelected = selectedTheme?.id === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => handleSelect(theme)}
                className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? "border-primary-500 bg-primary-50 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm"
                }`}
              >
                <span className="text-3xl">{theme.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{theme.name}</span>
                    {theme.seasonal && (
                      <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Seasonal
                      </Badge>
                    )}
                    {theme.trending && (
                      <Badge variant="secondary" className="text-xs bg-green-50 text-green-700">
                        Trending
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{theme.description}</p>
                </div>
                {isSelected && (
                  <div className="shrink-0">
                    <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Continue button */}
        {selectedTheme && (
          <Button className="w-full" onClick={handleContinue}>
            Continue with &ldquo;{selectedTheme.name}&rdquo;
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}

        <p className="text-xs text-gray-400 text-center">
          Themes are suggested based on season, inventory, and past performance
        </p>
      </CardContent>
    </Card>
  );
}
