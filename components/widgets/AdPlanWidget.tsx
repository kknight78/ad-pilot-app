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
} from "lucide-react";

export interface AdPlanItem {
  id: string;
  description: string;
  template: string;
  vehicles?: number;
  topic?: string; // For educational content
  avatar: string;
  length: string;
  adSpend: number | "free";
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

export interface AdPlanWidgetProps {
  data: AdPlanData;
  onEdit?: (platformIndex: number, itemId: string) => void;
  onRemove?: (platformIndex: number, itemId: string) => void;
  onAddAd?: (platformIndex: number) => void;
}

const platformConfig = {
  tiktok: {
    name: "TikTok",
    icon: "▶",
    bgColor: "bg-black",
    textColor: "text-white",
    borderColor: "border-gray-800",
    headerBg: "bg-gray-900",
  },
  facebook: {
    name: "Facebook",
    icon: "f",
    bgColor: "bg-blue-600",
    textColor: "text-white",
    borderColor: "border-blue-500",
    headerBg: "bg-blue-50",
  },
  youtube: {
    name: "YouTube",
    icon: "▷",
    bgColor: "bg-red-600",
    textColor: "text-white",
    borderColor: "border-red-500",
    headerBg: "bg-red-50",
  },
  instagram: {
    name: "Instagram",
    icon: "◎",
    bgColor: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400",
    textColor: "text-white",
    borderColor: "border-pink-400",
    headerBg: "bg-gradient-to-r from-purple-50 to-pink-50",
  },
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
      {/* Platform Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-3 ${config.headerBg} hover:opacity-90 transition-opacity`}
      >
        <div className="flex items-center gap-2">
          <PlatformIcon platform={plan.platform} />
          <span className="font-semibold text-gray-800">{config.name}</span>
          {isOrganic && (
            <Badge variant="secondary" className="text-xs">
              Organic
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {plan.items.length} {plan.items.length === 1 ? "ad" : "ads"} •{" "}
            {isOrganic ? "Free" : `$${plan.subtotal}`}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
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
                  Description
                </th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">
                  Template
                </th>
                <th className="text-center py-2 px-3 font-medium text-gray-500">
                  {plan.platform === "youtube" ? "Topic" : "Vehicles"}
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
                    {item.description}
                  </td>
                  <td className="py-2 px-3 text-gray-600">{item.template}</td>
                  <td className="py-2 px-3 text-center text-gray-600">
                    {item.topic ? (
                      <span className="text-xs italic">{item.topic}</span>
                    ) : item.vehicles ? (
                      item.vehicles
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-2 px-3 text-gray-600">{item.avatar}</td>
                  <td className="py-2 px-3 text-gray-600">{item.length}</td>
                  <td className="py-2 px-3 text-right text-gray-600">
                    {item.adSpend === "free" ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `$${item.adSpend}`
                    )}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-gray-500 hover:text-primary-600"
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
              className="w-full text-gray-500 hover:text-primary-600"
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
  data,
  onEdit,
  onRemove,
  onAddAd,
}: AdPlanWidgetProps) {
  return (
    <Card className="w-full max-w-4xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Calendar className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <CardTitle className="text-lg">
                📋 Content Plan — {data.dateRange}
              </CardTitle>
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
            <div className="flex gap-6">
              <div>
                <span className="text-sm text-gray-500">Total Content</span>
                <p className="text-xl font-bold text-gray-800">
                  {data.totalContent} pieces
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Total Ad Spend</span>
                <p className="text-xl font-bold text-primary-600">
                  ${data.totalAdSpend}
                </p>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Ad spend is what you pay to platforms (TikTok, Facebook, etc.) to
            run your ads. Ad Pilot service fees are separate — see invoice for
            details.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
