"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Clock, CheckCircle2, Circle } from "lucide-react";

export interface ProgressItem {
  id: string;
  label: string;
  status: "complete" | "in_progress" | "pending";
}

export interface ProgressIndicatorProps {
  items: ProgressItem[];
  percentComplete: number;
  estimatedMinutesLeft: number;
}

export function ProgressIndicator({
  items,
  percentComplete,
  estimatedMinutesLeft,
}: ProgressIndicatorProps) {
  const getStatusIcon = (status: ProgressItem["status"]) => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "in_progress":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case "pending":
        return <Circle className="w-4 h-4 text-gray-300" />;
    }
  };

  const getStatusText = (item: ProgressItem) => {
    if (item.status === "in_progress") {
      return (
        <span className="text-blue-600 font-medium">
          {item.label} — <span className="italic">generating...</span>
        </span>
      );
    }
    return (
      <span
        className={
          item.status === "complete" ? "text-gray-700" : "text-gray-400"
        }
      >
        {item.label}
      </span>
    );
  };

  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-100 rounded-lg">
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <CardTitle className="text-base">
              ⏳ Generating Your Scripts
            </CardTitle>
            <p className="text-xs text-gray-500">
              Go grab a coffee ☕ — this usually takes 10-15 minutes
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">
              {percentComplete}% complete
            </span>
            <span className="text-xs text-gray-500">
              ~{estimatedMinutesLeft} minute{estimatedMinutesLeft !== 1 ? "s" : ""} left
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500 relative"
              style={{ width: `${percentComplete}%` }}
            >
              {/* Animated shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            </div>
          </div>
        </div>

        {/* Status List */}
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-2 py-1.5 px-2 rounded ${
                item.status === "in_progress"
                  ? "bg-blue-50"
                  : item.status === "complete"
                    ? "bg-green-50/50"
                    : ""
              }`}
            >
              {getStatusIcon(item.status)}
              <span className="text-sm">{getStatusText(item)}</span>
            </div>
          ))}
        </div>

        {/* Bottom Text */}
        <p className="text-xs text-gray-400 mt-4 text-center border-t border-gray-100 pt-3">
          You&apos;ll get a notification when ready. Feel free to close this tab.
        </p>
      </CardContent>
    </Card>
  );
}
