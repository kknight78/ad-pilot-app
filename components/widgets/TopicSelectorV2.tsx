"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  RefreshCw,
  Loader2,
  BookOpen,
  Lightbulb,
  Sparkles,
} from "lucide-react";

export interface Topic {
  title: string;
  emoji: string;
}

interface TopicSelectorV2Props {
  numberOfTopics?: number; // How many topics to select (default 1)
  onSelect?: (topics: string[]) => void;
  onContinue?: (topics: string[]) => void;
}

type SuggestionMode = "lucky" | "guided";

// Emoji mapping based on topic keywords
const getEmojiForTopic = (title: string): string => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes("winter") || lowerTitle.includes("cold") || lowerTitle.includes("snow")) return "❄️";
  if (lowerTitle.includes("credit") || lowerTitle.includes("financing") || lowerTitle.includes("loan")) return "💳";
  if (lowerTitle.includes("first") || lowerTitle.includes("beginner") || lowerTitle.includes("new driver")) return "🎓";
  if (lowerTitle.includes("safety") || lowerTitle.includes("check")) return "✅";
  if (lowerTitle.includes("maintenance") || lowerTitle.includes("repair")) return "🔧";
  if (lowerTitle.includes("family") || lowerTitle.includes("kids")) return "👨‍👩‍👧‍👦";
  if (lowerTitle.includes("budget") || lowerTitle.includes("save") || lowerTitle.includes("money")) return "💰";
  if (lowerTitle.includes("suv") || lowerTitle.includes("truck")) return "🚙";
  if (lowerTitle.includes("negotiate") || lowerTitle.includes("deal")) return "🤝";
  if (lowerTitle.includes("warranty")) return "📋";
  if (lowerTitle.includes("history") || lowerTitle.includes("report")) return "📄";
  if (lowerTitle.includes("test drive")) return "🛣️";
  return "💡";
};

export function TopicSelectorV2({ numberOfTopics = 1, onSelect, onContinue }: TopicSelectorV2Props) {
  // For single select: the main topic input
  const [topicInput, setTopicInput] = useState("");

  // For multi-select: locked/selected topics
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  // Track which suggestion was clicked (for highlighting in single-select mode)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Suggestion mode
  const [suggestionMode, setSuggestionMode] = useState<SuggestionMode>("lucky");
  const [guidedInput, setGuidedInput] = useState("");

  // What was searched (for header display)
  const [searchedTopic, setSearchedTopic] = useState("");

  // Suggested topics from backend
  const [topics, setTopics] = useState<Topic[]>([]);

  // Loading state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMultiSelect = numberOfTopics > 1;

  const fetchTopics = async () => {
    setLoading(true);
    setError(null);
    if (!isMultiSelect) {
      setSelectedIndex(null);
    }

    const topic = suggestionMode === "guided" ? guidedInput.trim() : "";
    setSearchedTopic(topic);

    try {
      const webhookUrl = "https://kelly-ads.app.n8n.cloud/webhook/suggest-topics";
      const proxyUrl = "https://corsproxy.io/?" + encodeURIComponent(webhookUrl);

      const response = await fetch(proxyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: topic,
          client_id: "ccc",
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch topics");

      const data = await response.json();

      // Handle both array response and {suggestions: [...]} response
      let suggestions: string[] = [];
      if (Array.isArray(data)) {
        suggestions = data;
      } else if (data.suggestions && Array.isArray(data.suggestions)) {
        suggestions = data.suggestions;
      } else if (data.topics && Array.isArray(data.topics)) {
        suggestions = data.topics;
      }

      if (suggestions.length > 0) {
        const formattedTopics: Topic[] = suggestions.map((title: string) => ({
          title,
          emoji: getEmojiForTopic(title),
        }));
        setTopics(formattedTopics);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Topic fetch error:", err);
      setError("Couldn't load suggestions. Try again or enter a custom topic.");
    } finally {
      setLoading(false);
    }
  };

  // Single-select: click populates input
  const handleSelectTopic = (topic: Topic, index: number) => {
    if (isMultiSelect) {
      // Multi-select: toggle lock
      if (selectedTopics.includes(topic.title)) {
        // Unlock
        const newSelected = selectedTopics.filter(t => t !== topic.title);
        setSelectedTopics(newSelected);
        onSelect?.(newSelected);
      } else if (selectedTopics.length < numberOfTopics) {
        // Lock
        const newSelected = [...selectedTopics, topic.title];
        setSelectedTopics(newSelected);
        onSelect?.(newSelected);
      }
    } else {
      // Single-select: populate input
      setTopicInput(topic.title);
      setSelectedIndex(index);
      onSelect?.([topic.title]);
    }
  };

  const handleContinue = () => {
    if (isMultiSelect) {
      if (selectedTopics.length === numberOfTopics) {
        onContinue?.(selectedTopics);
      }
    } else {
      if (topicInput.trim()) {
        onContinue?.([topicInput.trim()]);
      }
    }
  };

  const handleInputChange = (value: string) => {
    setTopicInput(value);
    // Clear selection highlight if user manually edits
    if (selectedIndex !== null && topics[selectedIndex]?.title !== value) {
      setSelectedIndex(null);
    }
  };

  const isTopicLocked = (title: string) => selectedTopics.includes(title);
  const canSelectMore = selectedTopics.length < numberOfTopics;
  const allSelected = isMultiSelect && selectedTopics.length === numberOfTopics;

  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg">🎓 Capitol Smarts Topic</CardTitle>
            <p className="text-sm text-gray-500">
              {isMultiSelect
                ? `You have ${numberOfTopics} Capitol Smarts video${numberOfTopics > 1 ? "s" : ""} — pick ${numberOfTopics} topic${numberOfTopics > 1 ? "s" : ""}`
                : "What should the video be about?"}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Multi-select indicator */}
        {isMultiSelect && (
          <div className="flex items-center justify-between bg-blue-50 px-4 py-2 rounded-lg">
            <span className="text-sm text-blue-700">
              Selected: {selectedTopics.length} of {numberOfTopics}
            </span>
            <Badge variant={allSelected ? "default" : "secondary"}>
              {selectedTopics.length} / {numberOfTopics}
            </Badge>
          </div>
        )}

        {/* Topic input - only for single select */}
        {!isMultiSelect && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topic
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Add your own or select a suggestion below
            </p>
            <input
              type="text"
              value={topicInput}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="e.g., What to check before buying a used car"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* OR divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-400 font-medium">
            {isMultiSelect ? "GET SUGGESTIONS" : "OR LET US HELP"}
          </span>
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
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-gray-700">I&apos;m feeling lucky</span>
            </div>
          </label>

          {/* Give me topics about... */}
          <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="suggestionMode"
              checked={suggestionMode === "guided"}
              onChange={() => setSuggestionMode("guided")}
              className="w-4 h-4 mt-1 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <span className="font-medium text-gray-700">Give me topics about...</span>
              {suggestionMode === "guided" && (
                <input
                  type="text"
                  value={guidedInput}
                  onChange={(e) => setGuidedInput(e.target.value)}
                  placeholder="e.g., winter driving, first-time buyers, credit"
                  className="w-full mt-2 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
          </label>

          {/* Suggest button */}
          <Button
            onClick={fetchTopics}
            disabled={loading || (suggestionMode === "guided" && !guidedInput.trim())}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4 mr-2" />
                Suggest
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

        {/* Suggested topics - only shows after clicking Suggest */}
        {topics.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {searchedTopic ? `Topics about: ${searchedTopic}` : "Suggestions"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchTopics}
                disabled={loading}
                className="text-gray-500 hover:text-blue-600"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>

            <div className="space-y-2">
              {topics.map((topic, index) => {
                const isLocked = isMultiSelect && isTopicLocked(topic.title);
                const isSelected = !isMultiSelect && selectedIndex === index;
                const isDisabled = isMultiSelect && !canSelectMore && !isLocked;

                return (
                  <button
                    key={index}
                    onClick={() => handleSelectTopic(topic, index)}
                    disabled={isDisabled}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                      isLocked
                        ? "border-blue-500 bg-blue-50"
                        : isSelected
                        ? "border-blue-500 bg-blue-50"
                        : isDisabled
                        ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <span className="text-2xl">{topic.emoji}</span>
                    <span className="font-medium text-gray-900 flex-1">
                      {topic.title}
                    </span>
                    {(isLocked || isSelected) && (
                      <Check className="w-5 h-5 text-blue-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Continue button */}
        {isMultiSelect ? (
          <Button
            className="w-full"
            onClick={handleContinue}
            disabled={!allSelected}
          >
            Continue →
          </Button>
        ) : (
          topicInput.trim() && (
            <Button className="w-full" onClick={handleContinue}>
              Continue with &ldquo;{topicInput.trim()}&rdquo;
            </Button>
          )
        )}

        {/* Footer note */}
        <p className="text-xs text-gray-400 text-center">
          Topics are for Capitol Smarts educational videos
        </p>
      </CardContent>
    </Card>
  );
}
