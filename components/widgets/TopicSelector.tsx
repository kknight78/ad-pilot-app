"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, RefreshCw, BookOpen } from "lucide-react";

export interface Topic {
  id: string;
  emoji: string;
  title: string;
}

export interface TopicSelectorProps {
  topics: Topic[];
  numberOfTopics: number;
  onSelect?: (selectedTopics: Topic[]) => void;
  onRequestMore?: () => void;
}

export function TopicSelector({
  topics,
  numberOfTopics,
  onSelect,
  onRequestMore,
}: TopicSelectorProps) {
  const [selected, setSelected] = useState<string[]>([]);

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

  const isSelected = (id: string) => selected.includes(id);
  const isDisabled = (id: string) =>
    !isSelected(id) && selected.length >= numberOfTopics;

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg">
              📚 Choose Topics for Educational Videos
            </CardTitle>
            <p className="text-sm text-gray-500 mt-0.5">
              You have {numberOfTopics} educational video
              {numberOfTopics !== 1 ? "s" : ""} this week — pick {numberOfTopics}{" "}
              topic{numberOfTopics !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-2">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => handleSelect(topic)}
              disabled={isDisabled(topic.id)}
              className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all text-left ${
                isSelected(topic.id)
                  ? "border-primary-500 bg-primary-50"
                  : isDisabled(topic.id)
                    ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                    : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{topic.emoji}</span>
                <span className="font-medium text-gray-800">{topic.title}</span>
              </div>
              {isSelected(topic.id) && (
                <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Generate More button */}
        {onRequestMore && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-4 text-gray-600"
            onClick={onRequestMore}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Generate More Topics
          </Button>
        )}

        {/* Selection counter */}
        <div className="mt-4 text-center">
          <span
            className={`text-sm font-medium ${
              selected.length === numberOfTopics
                ? "text-green-600"
                : "text-gray-500"
            }`}
          >
            {selected.length} of {numberOfTopics} selected
          </span>
          {selected.length === numberOfTopics && (
            <p className="text-sm text-green-600 mt-1">
              All topics selected! Click to continue.
            </p>
          )}
          {selected.length > 0 && selected.length < numberOfTopics && (
            <p className="text-sm text-amber-600 mt-1">
              Select {numberOfTopics - selected.length} more topic
              {numberOfTopics - selected.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
