"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  Plus,
  Calendar,
  CheckCircle2,
  Video,
  Lightbulb,
  ArrowUpRight,
} from "lucide-react";

export interface AdPlanItem {
  id: string;
  themeTopic: string; // Changed from description - shows theme or topic with emoji
  template: string;
  vehicles?: number | string; // Can be number or string like "2019 Honda CR-V"
  avatar: string;
  length: string;
  adSpend: number | "organic";
}

export interface PlatformPlan {
  platform: "tiktok" | "facebook" | "youtube" | "instagram";
  items: AdPlanItem[];
  subtotal: number;
}

export interface AdPlanData {
  dateRange: string;
  platforms: PlatformPlan[];
  totalContent: number;
  totalAdSpend: number;
  strategyBadges: string[];
}

export interface VideoUsage {
  used: number;
  limit: number;
  resetDate: string;
}

export interface AdPlanWidgetProps {
  data?: AdPlanData;
  videoUsage?: VideoUsage;
  onEdit?: (platformIndex: number, itemId: string) => void;
  onRemove?: (platformIndex: number, itemId: string) => void;
  onAddAd?: (platformIndex: number) => void;
  onUpgradePlan?: () => void;
}

// Demo data
const demoData: AdPlanData = {
  dateRange: "Dec 2 - Dec 8, 2024",
  platforms: [
    {
      platform: "tiktok",
      items: [
        { id: "1", themeTopic: "Holiday Spirit", template: "Quick Feature", vehicles: "2019 Honda CR-V", avatar: "Shad", length: "30s", adSpend: 75 },
        { id: "2", themeTopic: "Holiday Spirit", template: "Quick Feature", vehicles: "2020 Toyota Camry", avatar: "Shad", length: "30s", adSpend: 50 },
        { id: "3", themeTopic: "Winter Ready", template: "Multi-Car", vehicles: "3 vehicles", avatar: "Shad", length: "45s", adSpend: "organic" },
      ],
      subtotal: 125,
    },
    {
      platform: "facebook",
      items: [
        { id: "4", themeTopic: "Holiday Spirit", template: "Carousel", vehicles: "4 vehicles", avatar: "—", length: "—", adSpend: 125 },
        { id: "5", themeTopic: "Family First", template: "Testimonial", vehicles: "—", avatar: "Lisa", length: "60s", adSpend: 50 },
      ],
      subtotal: 175,
    },
    {
      platform: "youtube",
      items: [
        { id: "6", themeTopic: "Winter Tire Safety", template: "Capitol Smarts", vehicles: "—", avatar: "Shad", length: "60s", adSpend: "organic" },
      ],
      subtotal: 0,
    },
  ],
  totalContent: 6,
  totalAdSpend: 300,
  strategyBadges: ["Theme variety", "Avatar mix", "Educational content"],
};

const demoVideoUsage: VideoUsage = {
  used: 8,
  limit: 20,
  resetDate: "Jan 1",
};

const platformConfig = {
  tiktok: {
    name: "TikTok",
    icon: "▶",
    bgColor: "bg-black",
    textColor: "text-white",
    borderColor: "border-gray-800",
    headerBg: "bg-gray-900",
    headerText: "text-white", // Bright white for contrast
  },
  facebook: {
    name: "Facebook",
    icon: "f",
    bgColor: "bg-blue-600",
    textColor: "text-white",
    borderColor: "border-blue-500",
    headerBg: "bg-blue-600",
    headerText: "text-white",
  },
  youtube: {
    name: "YouTube",
    icon: "▷",
    bgColor: "bg-red-600",
    textColor: "text-white",
    borderColor: "border-red-500",
    headerBg: "bg-red-600",
    headerText: "text-white",
  },
  instagram: {
    name: "Instagram",
    icon: "◎",
    bgColor: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400",
    textColor: "text-white",
    borderColor: "border-pink-400",
    headerBg: "bg-gradient-to-r from-purple-600 to-pink-500",
    headerText: "text-white",
  },
};

// Theme emoji mapping
const getThemeEmoji = (theme: string): string => {
  const lowerTheme = theme.toLowerCase();
  if (lowerTheme.includes("holiday") || lowerTheme.includes("christmas")) return "🎄";
  if (lowerTheme.includes("winter") || lowerTheme.includes("cold") || lowerTheme.includes("snow")) return "❄️";
  if (lowerTheme.includes("family")) return "👨‍👩‍👧‍👦";
  if (lowerTheme.includes("budget") || lowerTheme.includes("save")) return "💰";
  if (lowerTheme.includes("safety") || lowerTheme.includes("tire")) return "🛡️";
  if (lowerTheme.includes("summer") || lowerTheme.includes("road trip")) return "☀️";
  return "📌";
};

function PlatformIcon({ platform }: { platform: keyof typeof platformConfig }) {
  const config = platformConfig[platform];
  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 rounded ${config.bgColor} ${config.textColor} text-xs font-bold`}
    >
      {config.icon}
    </span>
  );
}

function VideoUsageTracker({ usage, onUpgrade }: { usage: VideoUsage; onUpgrade?: () => void }) {
  const percentage = (usage.used / usage.limit) * 100;
  const remaining = usage.limit - usage.used;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Video Usage</span>
        </div>
        {onUpgrade && (
          <button
            onClick={onUpgrade}
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Upgrade Plan
            <ArrowUpRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all ${
            percentage > 80 ? "bg-amber-500" : "bg-blue-500"
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          <span className="font-medium text-gray-700">{usage.used}</span> of {usage.limit} this month
        </span>
        <span>{remaining} remaining • Resets {usage.resetDate}</span>
      </div>
    </div>
  );
}

function PlatformSection({
  plan,
  platformIndex,
  onEdit,
  onRemove,
  onAddAd,
}: {
  plan: PlatformPlan;
  platformIndex: number;
  onEdit?: (platformIndex: number, itemId: string) => void;
  onRemove?: (platformIndex: number, itemId: string) => void;
  onAddAd?: (platformIndex: number) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const config = platformConfig[plan.platform];
  const isOrganic = plan.subtotal === 0;

  return (
    <div className={`border rounded-lg overflow-hidden ${config.borderColor}`}>
      {/* Platform Header - Now with bright white text */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-3 ${config.headerBg} hover:opacity-90 transition-opacity`}
      >
        <div className="flex items-center gap-2">
          <PlatformIcon platform={plan.platform} />
          <span className={`font-semibold ${config.headerText}`}>{config.name}</span>
          {isOrganic && (
            <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
              Organic
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm ${config.headerText} opacity-90`}>
            {plan.items.length} {plan.items.length === 1 ? "ad" : "ads"} •{" "}
            {isOrganic ? "Free" : `$${plan.subtotal}`}
          </span>
          {isExpanded ? (
            <ChevronUp className={`w-4 h-4 ${config.headerText}`} />
          ) : (
            <ChevronDown className={`w-4 h-4 ${config.headerText}`} />
          )}
        </div>
      </button>

      {/* Table Content */}
      {isExpanded && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left py-2 px-3 font-medium text-gray-500">
                  Theme/Topic
                </th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">
                  Template
                </th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">
                  Vehicles
                </th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">
                  Avatar
                </th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">
                  Length
                </th>
                <th className="text-right py-2 px-3 font-medium text-gray-500">
                  Ad Spend
                </th>
                <th className="text-right py-2 px-3 font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {plan.items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="py-2 px-3 font-medium text-gray-800">
                    <span className="mr-1">{getThemeEmoji(item.themeTopic)}</span>
                    {item.themeTopic}
                  </td>
                  <td className="py-2 px-3 text-gray-600">{item.template}</td>
                  <td className="py-2 px-3 text-gray-600">
                    {item.vehicles || "—"}
                  </td>
                  <td className="py-2 px-3 text-gray-600">{item.avatar}</td>
                  <td className="py-2 px-3 text-gray-600">{item.length}</td>
                  <td className="py-2 px-3 text-right text-gray-600">
                    {item.adSpend === "organic" ? (
                      <span className="text-green-600">$0 (organic)</span>
                    ) : (
                      `$${item.adSpend}`
                    )}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-gray-500 hover:text-blue-600"
                        onClick={() => onEdit?.(platformIndex, item.id)}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-gray-500 hover:text-red-600"
                        onClick={() => onRemove?.(platformIndex, item.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Add Ad Button */}
          <div className="p-2 border-t bg-gray-50">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-gray-500 hover:text-blue-600"
              onClick={() => onAddAd?.(platformIndex)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Ad
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdPlanWidget({
  data = demoData,
  videoUsage = demoVideoUsage,
  onEdit,
  onRemove,
  onAddAd,
  onUpgradePlan,
}: AdPlanWidgetProps) {
  return (
    <Card className="w-full max-w-4xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">
                This Week&apos;s Content Plan
              </CardTitle>
              <p className="text-sm text-gray-500">{data.dateRange}</p>
            </div>
          </div>

          {/* Strategy Badges */}
          <div className="flex flex-wrap gap-2">
            {data.strategyBadges.map((badge, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-green-50 text-green-700 border-green-200"
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {badge}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Video Usage Tracker */}
        <VideoUsageTracker usage={videoUsage} onUpgrade={onUpgradePlan} />

        {/* Platform Sections */}
        {data.platforms.map((platform, index) => (
          <PlatformSection
            key={platform.platform}
            plan={platform}
            platformIndex={index}
            onEdit={onEdit}
            onRemove={onRemove}
            onAddAd={onAddAd}
          />
        ))}

        {/* Summary Footer */}
        <div className="bg-gray-50 rounded-lg p-4 mt-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-sm text-gray-700">
              <span className="font-semibold">Total:</span>{" "}
              {data.totalContent} pieces of content •{" "}
              <span className="text-blue-600 font-medium">${data.totalAdSpend}</span> platform spend
            </div>
          </div>

          {/* Platform Spend Disclaimer */}
          <div className="flex items-start gap-2 mt-3 pt-3 border-t border-gray-200">
            <Lightbulb className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-400">
              Platform ad spend (${data.totalAdSpend} total) is charged directly by TikTok/Meta/YouTube — not by Ad Pilot.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
