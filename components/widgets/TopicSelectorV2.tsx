"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  hook_example?: string;
}

interface TopicSelectorV2Props {
  onSelect?: (topic: string) => void;
  onContinue?: (topic: string) => void;
}

type SuggestionMode = "lucky" | "guided";
type HookLength = "punchy" | "detailed";

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

export function TopicSelectorV2({ onSelect, onContinue }: TopicSelectorV2Props) {
  // The main topic input - this is what gets submitted
  const [topicInput, setTopicInput] = useState("");

  // Track which suggestion was clicked (for highlighting)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Suggestion mode
  const [suggestionMode, setSuggestionMode] = useState<SuggestionMode>("lucky");
  const [guidedInput, setGuidedInput] = useState("");

  // Hook length toggle
  const [hookLength, setHookLength] = useState<HookLength>("punchy");

  // Suggested topics from backend
  const [topics, setTopics] = useState<Topic[]>([]);

  // Loading state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTopics = async () => {
    setLoading(true);
    setError(null);
    setSelectedIndex(null);

    try {
      const body: Record<string, string> = {
        target_length: hookLength === "punchy" ? "brief_15_30" : "standard_30_45",
        avatar_name: "Shad",
        topic_guidance: "",
      };

      // Add topic guidance if guided mode is selected
      if (suggestionMode === "guided" && guidedInput.trim()) {
        body.topic_guidance = guidedInput.trim();
      }

      const response = await fetch(
        "https://corsproxy.io/?https://kelly-ads.app.n8n.cloud/webhook/topic-suggest",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) throw new Error("Failed to fetch topics");

      const data = await response.json();
      if (data.success && data.suggestions) {
        const formattedTopics: Topic[] = data.suggestions.map((title: string) => ({
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

  const handleSelectTopic = (topic: Topic, index: number) => {
    // Populate the input field with the topic title
    setTopicInput(topic.title);
    setSelectedIndex(index);
    onSelect?.(topic.title);
  };

  const handleContinue = () => {
    if (topicInput.trim()) {
      onContinue?.(topicInput.trim());
    }
  };

  const handleInputChange = (value: string) => {
    setTopicInput(value);
    // Clear selection highlight if user manually edits
    if (selectedIndex !== null && topics[selectedIndex]?.title !== value) {
      setSelectedIndex(null);
    }
  };

  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Choose an Educational Topic</CardTitle>
            <p className="text-sm text-gray-500">
              For your Capitol Smarts video this week
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Main topic input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Create your own
          </label>
          <input
            type="text"
            value={topicInput}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="e.g., How to Check Your Tire Tread"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

          {/* Hook length toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video length
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setHookLength("punchy")}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
                  hookLength === "punchy"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                Quick (15-30 sec)
              </button>
              <button
                onClick={() => setHookLength("detailed")}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
                  hookLength === "detailed"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                Standard (30-45 sec)
              </button>
            </div>
          </div>

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
                Suggest Topics
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

        {/* Suggested topics */}
        {topics.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Suggestions</span>
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
                const isSelected = selectedIndex === index;
                return (
                  <button
                    key={index}
                    onClick={() => handleSelectTopic(topic, index)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{topic.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {topic.title}
                          </span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        {topic.hook_example && (
                          <p className="text-sm text-gray-500 mt-1 italic">
                            &ldquo;{topic.hook_example}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Continue button - only show when there's input */}
        {topicInput.trim() && (
          <Button className="w-full" onClick={handleContinue}>
            Continue with &ldquo;{topicInput.trim()}&rdquo;
          </Button>
        )}

        {/* Footer note */}
        <p className="text-xs text-gray-400 text-center">
          Topics generated by AI based on season and audience interest
        </p>
      </CardContent>
    </Card>
  );
}
