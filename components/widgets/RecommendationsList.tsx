"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Camera, RefreshCw, Youtube } from "lucide-react";

export interface Recommendation {
  id: string;
  category: "included" | "levelup";
  icon: string; // emoji
  title: string;
  description: string;
  actionLabel: string;
  onAction?: () => void;
}

export interface RecommendationsListProps {
  recommendations?: Recommendation[];
  onDismiss?: () => void;
  onAction?: (id: string, actionLabel: string, title: string) => void;
}

// Demo data with curated recommendations
const demoRecommendations: Recommendation[] = [
  {
    id: "1",
    category: "included",
    icon: "📸",
    title: "Freshen Up Your Look",
    description:
      "Ad fatigue is real — viewers tune out familiar faces. Throw on an Illini tee or winter sweater and we'll create a new avatar. You have 4 photo sessions included this month (0 used).",
    actionLabel: "Create New Avatar",
  },
  {
    id: "2",
    category: "included",
    icon: "🔄",
    title: "Rest Your Multi-Car Template",
    description:
      "You've run it 47 times! Swap it out for 2-3 months and it'll feel fresh again.",
    actionLabel: "Explore Options",
  },
  {
    id: "3",
    category: "levelup",
    icon: "📺",
    title: "Expand to YouTube Shorts",
    description:
      "Your TikToks are crushing it — same content, whole new audience.",
    actionLabel: "Learn More",
  },
];

// Icon mapping for Lucide icons (used for section headers)
const iconComponents = {
  camera: Camera,
  refresh: RefreshCw,
  youtube: Youtube,
};

function RecommendationCard({
  recommendation,
  onAction,
}: {
  recommendation: Recommendation;
  onAction?: (id: string, actionLabel: string, title: string) => void;
}) {
  return (
    <div className="p-3 md:p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      {/* Title row with emoji */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{recommendation.icon}</span>
        <h4 className="font-medium text-gray-900">{recommendation.title}</h4>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 leading-relaxed mb-3">
        {recommendation.description}
      </p>

      {/* Action button - full width on mobile */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAction?.(recommendation.id, recommendation.actionLabel, recommendation.title)}
        className="text-xs w-full md:w-auto"
      >
        {recommendation.actionLabel}
      </Button>
    </div>
  );
}

export function RecommendationsList({
  recommendations = demoRecommendations,
  onDismiss,
  onAction,
}: RecommendationsListProps) {
  const includedRecs = recommendations.filter((r) => r.category === "included");
  const levelupRecs = recommendations.filter((r) => r.category === "levelup");

  const handleDismiss = () => {
    // Don't hide the widget - just notify the parent
    // The widget stays visible in the chat history
    onDismiss?.();
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Lightbulb className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Recommendations</CardTitle>
            <p className="text-sm text-gray-500">
              Ways to improve your video performance
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* INCLUDED WITH YOUR PLAN */}
        {includedRecs.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Included with your plan
            </h3>
            <div className="space-y-3">
              {includedRecs.map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onAction={onAction}
                />
              ))}
            </div>
          </div>
        )}

        {/* LEVEL UP */}
        {levelupRecs.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Level Up
            </h3>
            <div className="space-y-3">
              {levelupRecs.map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onAction={onAction}
                />
              ))}
            </div>
          </div>
        )}

        {/* Dismiss button */}
        <div className="pt-2 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600"
          >
            Not right now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
