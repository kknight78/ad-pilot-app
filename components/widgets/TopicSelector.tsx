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
  ThumbsUp,
  ThumbsDown,
  BookOpen,
} from "lucide-react";

export interface Topic {
  id: string;
  emoji: string;
  title: string;
}

export interface TopicSelectorProps {
  topics: Topic[];
  numberOfTopics: number;
  onSelect?: (selectedTopics: Topic[]) => void;
  onContinue?: (selectedTopics: Topic[]) => void;
  onRequestMore?: () => void;
  onCustomInput?: (customTopic: string) => void;
  onSubjectArea?: (subject: string) => void;
  onFeedback?: (topicId: string, isPositive: boolean) => void;
}

export function TopicSelector({
  topics,
  numberOfTopics,
  onSelect,
  onContinue,
  onRequestMore,
  onCustomInput,
  onSubjectArea,
  onFeedback,
}: TopicSelectorProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Record<string, "up" | "down">>({});
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showSubjectInput, setShowSubjectInput] = useState(false);
  const [customTopic, setCustomTopic] = useState("");
  const [subjectArea, setSubjectArea] = useState("");

  const handleSelect = (topic: Topic) => {
    let newSelected: string[];

    if (selected.includes(topic.id)) {
      // Deselect
      newSelected = selected.filter((id) => id !== topic.id);
    } else {
      // Select only if under limit
      if (selected.length >= numberOfTopics) {
        return; // Don't allow more selections
      }
      newSelected = [...selected, topic.id];
    }

    setSelected(newSelected);

    if (onSelect) {
      const selectedTopics = topics.filter((t) => newSelected.includes(t.id));
      onSelect(selectedTopics);
    }
  };

  const handleContinue = () => {
    if (onContinue && selected.length === numberOfTopics) {
      const selectedTopics = topics.filter((t) => selected.includes(t.id));
      onContinue(selectedTopics);
    }
  };

  const handleFeedback = (
    e: React.MouseEvent,
    topicId: string,
    isPositive: boolean
  ) => {
    e.stopPropagation();
    const newFeedback = feedback[topicId] === (isPositive ? "up" : "down")
      ? undefined
      : (isPositive ? "up" : "down");

    setFeedback((prev) => ({
      ...prev,
      [topicId]: newFeedback as "up" | "down",
    }));

    if (onFeedback && newFeedback) {
      onFeedback(topicId, isPositive);
    }
  };

  const handleCustomSubmit = () => {
    if (customTopic.trim() && onCustomInput) {
      onCustomInput(customTopic.trim());
      setCustomTopic("");
      setShowCustomInput(false);
    }
  };

  const handleSubjectSubmit = () => {
    if (subjectArea.trim() && onSubjectArea) {
      onSubjectArea(subjectArea.trim());
      setSubjectArea("");
      setShowSubjectInput(false);
    }
  };

  const isSelected = (id: string) => selected.includes(id);
  const isDisabled = (id: string) =>
    !isSelected(id) && selected.length >= numberOfTopics;
  const allSelected = selected.length === numberOfTopics;

  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 rounded-lg">
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-base">
              📚 Pick {numberOfTopics} Topic{numberOfTopics !== 1 ? "s" : ""}
            </CardTitle>
            <p className="text-xs text-gray-500">
              For your educational videos this week
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Compact topic cards - 2 per row */}
        <div className="grid grid-cols-2 gap-2">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => handleSelect(topic)}
              disabled={isDisabled(topic.id)}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all text-left group ${
                isSelected(topic.id)
                  ? "border-primary-500 bg-primary-50"
                  : isDisabled(topic.id)
                    ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                    : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <span className="text-lg">{topic.emoji}</span>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm text-gray-800 block truncate">
                  {topic.title}
                </span>
              </div>
              {isSelected(topic.id) && (
                <Check className="w-4 h-4 text-primary-500 shrink-0" />
              )}

              {/* Thumbs feedback - subtle, in corner */}
              {!isDisabled(topic.id) && (
                <div className="absolute -top-1 -right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleFeedback(e, topic.id, true)}
                    className={`p-0.5 rounded ${
                      feedback[topic.id] === "up"
                        ? "text-green-500"
                        : "text-gray-300 hover:text-gray-400"
                    }`}
                    title="I like this suggestion"
                  >
                    <ThumbsUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => handleFeedback(e, topic.id, false)}
                    className={`p-0.5 rounded ${
                      feedback[topic.id] === "down"
                        ? "text-red-400"
                        : "text-gray-300 hover:text-gray-400"
                    }`}
                    title="Not for me"
                  >
                    <ThumbsDown className="w-3 h-3" />
                  </button>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Selection counter */}
        <div className="mt-2 text-center">
          <span
            className={`text-xs font-medium ${
              allSelected ? "text-green-600" : "text-gray-500"
            }`}
          >
            {selected.length} of {numberOfTopics} selected
          </span>
        </div>

        {/* Custom topic input */}
        {showCustomInput && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="Enter your topic idea..."
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
            />
            <Button size="sm" onClick={handleCustomSubmit} disabled={!customTopic.trim()}>
              Add
            </Button>
          </div>
        )}

        {/* Subject area input */}
        {showSubjectInput && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={subjectArea}
              onChange={(e) => setSubjectArea(e.target.value)}
              placeholder="e.g., winter driving, family, budget..."
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              onKeyDown={(e) => e.key === "Enter" && handleSubjectSubmit()}
            />
            <Button size="sm" onClick={handleSubjectSubmit} disabled={!subjectArea.trim()}>
              Generate
            </Button>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            className="text-xs text-gray-600"
            onClick={onRequestMore}
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            More
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs text-gray-600"
            onClick={() => {
              setShowCustomInput(!showCustomInput);
              setShowSubjectInput(false);
            }}
          >
            <Pencil className="w-3 h-3 mr-1" />
            Custom
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs text-gray-600"
            onClick={() => {
              setShowSubjectInput(!showSubjectInput);
              setShowCustomInput(false);
            }}
          >
            <Lightbulb className="w-3 h-3 mr-1" />
            Subject
          </Button>
        </div>

        {/* Continue button */}
        {allSelected && (
          <Button
            className="w-full mt-3"
            size="sm"
            onClick={handleContinue}
          >
            Continue with these topics
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}

        {!allSelected && selected.length > 0 && (
          <p className="text-xs text-amber-600 mt-2 text-center">
            Select {numberOfTopics - selected.length} more
          </p>
        )}

        <p className="text-[10px] text-gray-400 mt-2 text-center">
          Hover cards to rate suggestions (optional)
        </p>
      </CardContent>
    </Card>
  );
}
