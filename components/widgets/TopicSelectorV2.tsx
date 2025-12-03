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
  BookOpen,
  Lightbulb,
} from "lucide-react";

export interface Topic {
  id: string;
  title: string;
  emoji: string;
}

interface TopicSelectorV2Props {
  numberOfTopics?: number;
  onSelect?: (topics: Topic[]) => void;
  onContinue?: (topics: Topic[]) => void;
}

// Fallback topics if API is unavailable
const fallbackTopics: Topic[] = [
  { id: "1", title: "What to Check Before Buying a Used Car", emoji: "🔍" },
  { id: "2", title: "Understanding Your Credit Score for Auto Loans", emoji: "📊" },
  { id: "3", title: "Winter Tire Safety: What You Need to Know", emoji: "❄️" },
  { id: "4", title: "Best First Cars for New Drivers", emoji: "🚗" },
  { id: "5", title: "How to Negotiate the Best Deal on a Used Car", emoji: "🤝" },
  { id: "6", title: "Extended Warranties: Worth It or Not?", emoji: "📋" },
];

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

export function TopicSelectorV2({ numberOfTopics = 2, onSelect, onContinue }: TopicSelectorV2Props) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const fetchTopics = async (guidance?: string, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await fetch("https://kelly-ads.app.n8n.cloud/webhook/topic-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_length: "standard_30_45",
          topic_guidance: guidance || "",
          avatar_name: "Shad",
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch topics");

      const data = await response.json();
      if (data.success && data.suggestions) {
        const formattedTopics: Topic[] = data.suggestions.map((title: string, index: number) => ({
          id: `topic-${index}-${Date.now()}`,
          title,
          emoji: getEmojiForTopic(title),
        }));
        setTopics(formattedTopics);
      } else {
        setTopics(fallbackTopics.slice(0, 6));
      }
    } catch (err) {
      console.log("Using fallback topics:", err);
      setTopics(fallbackTopics.slice(0, 6));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleSelect = (topic: Topic) => {
    let newSelected: Topic[];

    if (selectedTopics.find((t) => t.id === topic.id)) {
      // Deselect
      newSelected = selectedTopics.filter((t) => t.id !== topic.id);
    } else if (selectedTopics.length < numberOfTopics) {
      // Select if under limit
      newSelected = [...selectedTopics, topic];
    } else {
      return; // At limit, don't add more
    }

    setSelectedTopics(newSelected);
    onSelect?.(newSelected);
  };

  const handleContinue = () => {
    if (selectedTopics.length === numberOfTopics) {
      onContinue?.(selectedTopics);
    }
  };

  const handleRefresh = () => {
    setSelectedTopics([]);
    fetchTopics(undefined, true);
  };

  const handleCustomSubmit = () => {
    if (customInput.trim()) {
      setSelectedTopics([]);
      fetchTopics(customInput.trim(), true);
      setCustomInput("");
      setShowCustomInput(false);
    }
  };

  const isSelected = (id: string) => selectedTopics.some((t) => t.id === id);
  const isDisabled = (id: string) => !isSelected(id) && selectedTopics.length >= numberOfTopics;
  const allSelected = selectedTopics.length === numberOfTopics;

  if (loading) {
    return (
      <Card className="w-full max-w-xl">
        <CardContent className="py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            <p className="text-sm text-gray-500">Generating topic ideas...</p>
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
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">
                Pick {numberOfTopics} Educational Topic{numberOfTopics !== 1 ? "s" : ""}
              </CardTitle>
              <p className="text-sm text-gray-500">
                For your Capitol Smarts videos this week
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
        {/* Topic cards */}
        <div className="grid gap-2">
          {topics.map((topic) => {
            const selected = isSelected(topic.id);
            const disabled = isDisabled(topic.id);
            return (
              <button
                key={topic.id}
                onClick={() => handleSelect(topic)}
                disabled={disabled}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                  selected
                    ? "border-primary-500 bg-primary-50"
                    : disabled
                    ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <span className="text-2xl">{topic.emoji}</span>
                <span className="flex-1 font-medium text-gray-800 text-sm">{topic.title}</span>
                {selected && (
                  <div className="shrink-0 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selection counter */}
        <div className="text-center">
          <Badge variant={allSelected ? "default" : "secondary"} className="text-xs">
            {selectedTopics.length} of {numberOfTopics} selected
          </Badge>
        </div>

        {/* Custom input toggle */}
        {showCustomInput ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g., first-time buyers, winter driving..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
            />
            <Button size="sm" onClick={handleCustomSubmit} disabled={!customInput.trim()}>
              Generate
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full text-gray-600"
            onClick={() => setShowCustomInput(true)}
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            Generate topics about a specific subject
          </Button>
        )}

        {/* Continue button */}
        {allSelected && (
          <Button className="w-full" onClick={handleContinue}>
            Continue with these topics
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}

        {!allSelected && selectedTopics.length > 0 && (
          <p className="text-xs text-amber-600 text-center">
            Select {numberOfTopics - selectedTopics.length} more topic{numberOfTopics - selectedTopics.length !== 1 ? "s" : ""}
          </p>
        )}

        <p className="text-xs text-gray-400 text-center">
          Topics generated by AI based on season and audience interest
        </p>
      </CardContent>
    </Card>
  );
}
