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
  Plus,
  X,
} from "lucide-react";

export interface Topic {
  title: string;
  emoji: string;
}

interface TopicSelectorV2Props {
  numberOfTopics?: number; // How many topics to select (default 2 for prototype)
  onSelect?: (topics: string[]) => void;
  onContinue?: (topics: string[]) => void;
}

type SuggestionMode = "lucky" | "guided";

// Emoji mapping based on topic keywords
const getEmojiForTopic = (title: string | undefined | null): string => {
  if (!title) return "💡";
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
  if (lowerTitle.includes("noise") || lowerTitle.includes("sound") || lowerTitle.includes("squeak")) return "🔊";
  return "💡";
};

export function TopicSelectorV2({ numberOfTopics = 2, onSelect, onContinue }: TopicSelectorV2Props) {
  // Custom topic input
  const [customInput, setCustomInput] = useState("");

  // Selected topics list
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

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

  const canSelectMore = selectedTopics.length < numberOfTopics;
  const allSelected = selectedTopics.length === numberOfTopics;
  const remaining = numberOfTopics - selectedTopics.length;

  const fetchTopics = async () => {
    setLoading(true);
    setError(null);

    const topic = suggestionMode === "guided" ? guidedInput.trim() : "";
    setSearchedTopic(topic);

    try {
      const response = await fetch(
        "https://corsproxy.io/?https://kelly-ads.app.n8n.cloud/webhook/topic-suggest",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic_guidance: topic,
            target_length: "standard_30_45",
            avatar_name: "Shad",
          }),
        }
      );

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

  const addTopic = (title: string) => {
    if (canSelectMore && !selectedTopics.includes(title)) {
      const newSelected = [...selectedTopics, title];
      setSelectedTopics(newSelected);
      onSelect?.(newSelected);
    }
  };

  const removeTopic = (title: string) => {
    const newSelected = selectedTopics.filter(t => t !== title);
    setSelectedTopics(newSelected);
    onSelect?.(newSelected);
  };

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed && canSelectMore && !selectedTopics.includes(trimmed)) {
      addTopic(trimmed);
      setCustomInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustom();
    }
  };

  const handleContinue = () => {
    if (allSelected) {
      onContinue?.(selectedTopics);
    }
  };

  const isTopicSelected = (title: string) => selectedTopics.includes(title);

  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Capitol Smarts Topics</CardTitle>
            <p className="text-sm text-gray-500">
              You have {numberOfTopics} Capitol Smarts video{numberOfTopics > 1 ? "s" : ""} — pick {numberOfTopics} topic{numberOfTopics > 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Custom topic input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Add your own topic
          </label>
          <div className="flex flex-col md:flex-row gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., What to check before buying"
              disabled={!canSelectMore}
              className="flex-1 min-w-0 px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <Button
              onClick={handleAddCustom}
              disabled={!customInput.trim() || !canSelectMore}
              className="px-4 shrink-0"
            >
              <Plus className="w-4 h-4 mr-1 md:mr-0" />
              <span className="md:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* OR divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-400 font-medium">
            OR GET SUGGESTIONS
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
            <div className="flex-1 min-w-0">
              <span className="font-medium text-gray-700">Give me topics about...</span>
              {suggestionMode === "guided" && (
                <input
                  type="text"
                  value={guidedInput}
                  onChange={(e) => setGuidedInput(e.target.value)}
                  placeholder="e.g., winter driving, credit"
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
                const isSelected = isTopicSelected(topic.title);
                const isDisabled = !canSelectMore && !isSelected;

                if (isSelected) return null; // Hide already selected topics from suggestions

                return (
                  <button
                    key={index}
                    onClick={() => addTopic(topic.title)}
                    disabled={isDisabled}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                      isDisabled
                        ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50 bg-white"
                    }`}
                  >
                    <span className="text-2xl">{topic.emoji}</span>
                    <span className="font-medium text-gray-900 flex-1">
                      {topic.title}
                    </span>
                    <Plus className="w-5 h-5 text-blue-500" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Topics Section */}
        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Selected: {selectedTopics.length} of {numberOfTopics}
            </span>
            <Badge variant={allSelected ? "default" : "secondary"}>
              {selectedTopics.length} / {numberOfTopics}
            </Badge>
          </div>

          {selectedTopics.length > 0 ? (
            <div className="space-y-2">
              {selectedTopics.map((title, index) => (
                <div
                  key={index}
                  className="w-full p-3 rounded-lg border-2 border-green-500 bg-green-50 flex items-center gap-3"
                >
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-900 flex-1">
                    {title}
                  </span>
                  <button
                    onClick={() => removeTopic(title)}
                    className="p-1 hover:bg-green-100 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500 hover:text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">
              No topics selected yet
            </p>
          )}

          {!allSelected && selectedTopics.length > 0 && (
            <p className="text-sm text-gray-500">
              Select {remaining} more topic{remaining > 1 ? "s" : ""} to continue
            </p>
          )}
        </div>

        {/* Continue button */}
        <Button
          className="w-full"
          onClick={handleContinue}
          disabled={!allSelected}
        >
          Continue →
        </Button>

        {/* Footer note */}
        <p className="text-xs text-gray-400 text-center">
          Topics are for Capitol Smarts educational videos
        </p>
      </CardContent>
    </Card>
  );
}
