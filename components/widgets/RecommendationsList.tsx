"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, TrendingDown, TrendingUp, ArrowRight, Zap } from "lucide-react";

export interface Recommendation {
  id: string;
  type: "warning" | "success" | "neutral" | "action";
  message: string;
}

export interface RecommendationsListProps {
  recommendations: Recommendation[];
}

const typeConfig = {
  warning: {
    icon: TrendingDown,
    bgColor: "bg-red-50",
    iconColor: "text-red-500",
    borderColor: "border-red-100",
  },
  success: {
    icon: TrendingUp,
    bgColor: "bg-green-50",
    iconColor: "text-green-500",
    borderColor: "border-green-100",
  },
  neutral: {
    icon: ArrowRight,
    bgColor: "bg-gray-50",
    iconColor: "text-gray-500",
    borderColor: "border-gray-100",
  },
  action: {
    icon: Zap,
    bgColor: "bg-amber-50",
    iconColor: "text-amber-500",
    borderColor: "border-amber-100",
  },
};

export function RecommendationsList({ recommendations }: RecommendationsListProps) {
  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Lightbulb className="w-5 h-5 text-amber-600" />
          </div>
          <CardTitle className="text-lg">Recommendations</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {recommendations.map((rec) => {
            const config = typeConfig[rec.type];
            const Icon = config.icon;

            return (
              <div
                key={rec.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${config.bgColor} ${config.borderColor}`}
              >
                <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${config.iconColor}`} />
                <p className="text-sm text-gray-700">{rec.message}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
