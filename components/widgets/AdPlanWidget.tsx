"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
  X,
  TreePine,
  Snowflake,
  Users,
  PiggyBank,
  ShieldCheck,
  Sun,
  Pin,
  LucideIcon,
  Music2,
} from "lucide-react";
// Note: Pencil is already imported above, used in both edit buttons and collapsed state
import { WhatsThis } from "@/components/ui/whats-this";

export interface AdPlanItem {
  id: string;
  themeTopic: string; // Changed from description - shows theme or topic with emoji
  template: string;
  vehicles?: number | string; // Can be number or string like "2019 Honda CR-V"
  avatar: string;
  avatarStyle?: string; // e.g., "Casual", "Professional"
  music?: string; // Music track name
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
  onAutoReload?: () => void;
  onConfirm?: () => void;
  // Completed state - shows collapsed summary
  completed?: boolean;
  onEditPlan?: () => void;
}

// Demo data
const demoData: AdPlanData = {
  dateRange: "Dec 2 - Dec 8, 2024",
  platforms: [
    {
      platform: "tiktok",
      items: [
        { id: "1", themeTopic: "Holiday Spirit", template: "Deep Dive", vehicles: 1, avatar: "Shad", avatarStyle: "Casual", music: "Upbeat Holiday", length: "30s", adSpend: 75 },
        { id: "2", themeTopic: "Holiday Spirit", template: "Deep Dive", vehicles: 1, avatar: "Shad", avatarStyle: "Casual", music: "Festive Pop", length: "30s", adSpend: 50 },
        { id: "3", themeTopic: "Winter Ready", template: "Multi-Car", vehicles: 3, avatar: "Shad", avatarStyle: "Professional", music: "Chill Vibes", length: "45s", adSpend: "organic" },
      ],
      subtotal: 125,
    },
    {
      platform: "facebook",
      items: [
        { id: "4", themeTopic: "Holiday Spirit", template: "Carousel", vehicles: 4, avatar: "—", music: "Soft Background", length: "—", adSpend: 125 },
        { id: "5", themeTopic: "Family First", template: "Testimonial", vehicles: "—", avatar: "Lisa", avatarStyle: "Warm", music: "Acoustic Feel", length: "60s", adSpend: 50 },
      ],
      subtotal: 175,
    },
    {
      platform: "youtube",
      items: [
        { id: "6", themeTopic: "Winter Tire Safety", template: "Capitol Smarts", vehicles: "—", avatar: "Shad", avatarStyle: "Professional", music: "Focus Beats", length: "60s", adSpend: "organic" },
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

// Theme icon mapping - returns Lucide icon component
const getThemeIcon = (theme: string | undefined | null): LucideIcon => {
  if (!theme) return Pin;
  const lowerTheme = theme.toLowerCase();
  if (lowerTheme.includes("holiday") || lowerTheme.includes("christmas")) return TreePine;
  if (lowerTheme.includes("winter") || lowerTheme.includes("cold") || lowerTheme.includes("snow")) return Snowflake;
  if (lowerTheme.includes("family")) return Users;
  if (lowerTheme.includes("budget") || lowerTheme.includes("save")) return PiggyBank;
  if (lowerTheme.includes("safety") || lowerTheme.includes("tire")) return ShieldCheck;
  if (lowerTheme.includes("summer") || lowerTheme.includes("road trip")) return Sun;
  return Pin;
};

// Dropdown options for edit modal
const templateOptions = ["Deep Dive", "Multi-Car", "Capitol Smarts", "Carousel", "Testimonial"];
const avatarOptions = [
  { value: "Shad", label: "Shad" },
  { value: "Gary", label: "Gary" },
  { value: "Lisa", label: "Lisa" },
  { value: "Kelly", label: "Kelly" },
];
const lengthOptions = ["15s", "30s", "45s", "60s"];

// Edit Ad Modal
interface EditingItem {
  platformIndex: number;
  platform: keyof typeof platformConfig;
  item: AdPlanItem;
}

function EditAdModal({
  isOpen,
  onClose,
  editingItem,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  editingItem: EditingItem | null;
  onSave: (platformIndex: number, itemId: string, updates: Partial<AdPlanItem>) => void;
}) {
  const [template, setTemplate] = useState("");
  const [themeTopic, setThemeTopic] = useState("");
  const [avatar, setAvatar] = useState("");
  const [length, setLength] = useState("");
  const [adSpend, setAdSpend] = useState<number | "organic">(0);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && editingItem) {
      setTemplate(editingItem.item.template);
      setThemeTopic(editingItem.item.themeTopic);
      setAvatar(editingItem.item.avatar);
      setLength(editingItem.item.length);
      setAdSpend(editingItem.item.adSpend);
    }
  }, [isOpen, editingItem]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !editingItem || typeof window === "undefined") return null;

  const platformName = platformConfig[editingItem.platform].name;

  const handleSave = () => {
    onSave(editingItem.platformIndex, editingItem.item.id, {
      template,
      themeTopic,
      avatar,
      length,
      adSpend,
    });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div>
            <h3 className="font-semibold text-gray-900">Edit Ad</h3>
            <p className="text-sm text-gray-500">
              {platformName} — {editingItem.item.themeTopic}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {/* Template */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template
            </label>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {templateOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Theme/Topic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Theme/Topic
            </label>
            <input
              type="text"
              value={themeTopic}
              onChange={(e) => setThemeTopic(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Holiday Spirit"
            />
          </div>

          {/* Avatar Presenter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Avatar Presenter
            </label>
            <select
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="—">— None —</option>
              {avatarOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Target Length */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Length
            </label>
            <select
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="—">— N/A —</option>
              {lengthOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Ad Spend */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ad Spend
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                value={adSpend === "organic" ? 0 : adSpend}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setAdSpend(val === 0 ? "organic" : val);
                }}
                min={0}
                className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              * This is your platform spend, not Ad Pilot fee
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

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

function VideoUsageTracker({
  usage,
  planVideoCount,
  onUpgrade,
  onAutoReload
}: {
  usage: VideoUsage;
  planVideoCount: number;
  onUpgrade?: () => void;
  onAutoReload?: () => void;
}) {
  const percentage = (usage.used / usage.limit) * 100;
  const remainingAfterPlan = usage.limit - usage.used - planVideoCount;

  // Calculate days until reset
  const getDaysUntilReset = () => {
    const today = new Date();
    const currentYear = today.getFullYear();

    // Parse reset date - handle formats like "Jan 1" or "January 1"
    let resetDate = new Date(`${usage.resetDate}, ${currentYear}`);

    // Check if parse failed (invalid date)
    if (isNaN(resetDate.getTime())) {
      // Fallback: try parsing with next year
      resetDate = new Date(`${usage.resetDate}, ${currentYear + 1}`);
    }

    // If reset date has passed this year, use next year
    if (resetDate < today) {
      resetDate = new Date(`${usage.resetDate}, ${currentYear + 1}`);
    }

    const diffTime = resetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilReset = getDaysUntilReset();

  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <div className="space-y-2">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Videos</p>
          {/* Progress bar - hidden on mobile for space */}
          <div className="hidden sm:block w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                percentage > 80 ? "bg-amber-500" : "bg-blue-500"
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
        {/* Usage info */}
        <p className="text-xs text-gray-500">
          This plan uses <strong>{planVideoCount}</strong> • You&apos;ll have <strong>{Math.max(0, remainingAfterPlan)}</strong> left
          <span className="text-gray-400 ml-1">(resets in {daysUntilReset} days)</span>
        </p>
        {/* Action links - always on their own line, right-aligned */}
        <div className="flex justify-end">
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={onUpgrade}
              className="text-blue-600 hover:underline whitespace-nowrap"
            >
              Buy more
            </button>
            <span className="text-gray-300">·</span>
            <button
              onClick={onAutoReload}
              className="text-blue-600 hover:underline whitespace-nowrap"
            >
              Auto-reload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Scroll indicator for tables
function ScrollIndicator({ showHint }: { showHint: boolean }) {
  if (!showHint) return null;

  return (
    <div className="md:hidden flex items-center justify-center gap-1 py-1.5 text-xs text-gray-400 bg-gray-50 border-b border-gray-100">
      <span>← Swipe to see more →</span>
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
  const [canScroll, setCanScroll] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const config = platformConfig[plan.platform];
  const isOrganic = plan.subtotal === 0;

  // Check if table is scrollable
  useEffect(() => {
    const checkScroll = () => {
      if (scrollRef.current) {
        const { scrollWidth, clientWidth } = scrollRef.current;
        setCanScroll(scrollWidth > clientWidth);
      }
    };

    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [isExpanded]);

  return (
    <div className={`border rounded-lg overflow-hidden ${config.borderColor}`}>
      {/* Platform Header - Now with bright white text */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-3 ${config.headerBg} hover:opacity-90 transition-opacity`}
      >
        <div className="flex items-center gap-2">
          <PlatformIcon platform={plan.platform} />
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${config.headerText}`}>{config.name}</span>
              {isOrganic && (
                <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                  Organic
                </Badge>
              )}
            </div>
            <span className={`text-xs ${config.headerText} opacity-80`}>
              {plan.items.length} {plan.items.length === 1 ? "ad" : "ads"} • {isOrganic ? "Free" : `$${plan.subtotal}*`}
            </span>
          </div>
        </div>
        <div className="flex items-center">
          {isExpanded ? (
            <ChevronUp className={`w-4 h-4 ${config.headerText}`} />
          ) : (
            <ChevronDown className={`w-4 h-4 ${config.headerText}`} />
          )}
        </div>
      </button>

      {/* Table Content */}
      {isExpanded && (
        <>
          <ScrollIndicator showHint={canScroll} />
          <div ref={scrollRef} className="overflow-x-auto">
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
                  Music
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
                    {(() => {
                      const ThemeIcon = getThemeIcon(item.themeTopic);
                      return (
                        <span className="inline-flex items-center gap-1.5">
                          <ThemeIcon className="w-4 h-4 text-blue-600 shrink-0" />
                          {item.themeTopic}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="py-2 px-3 text-gray-600">{item.template}</td>
                  <td className="py-2 px-3 text-gray-600">
                    {item.vehicles || "—"}
                  </td>
                  <td className="py-2 px-3 text-gray-600">
                    <div>
                      <span className="font-medium">{item.avatar}</span>
                      {item.avatarStyle && item.avatar !== "—" && (
                        <span className="block text-xs text-gray-400">{item.avatarStyle}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-3 text-gray-600 text-left">
                    <button className="text-sm text-blue-600 hover:underline text-left">
                      {item.music || "Select"}
                    </button>
                  </td>
                  <td className="py-2 px-3 text-gray-600">{item.length}</td>
                  <td className="py-2 px-3 text-right text-gray-600">
                    {item.adSpend === "organic" ? (
                      <span className="text-green-600">$0 (organic)</span>
                    ) : (
                      <>${item.adSpend}*</>
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
          </div>

          {/* Add Ad Button - Outside scroll area so it stays visible */}
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
        </>
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
  onAutoReload,
  onConfirm,
  completed = false,
  onEditPlan,
}: AdPlanWidgetProps) {
  const [localData, setLocalData] = useState(data);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);

  // Collapsed summary state when completed
  if (completed) {
    return (
      <Card className="w-full max-w-4xl border-green-200 bg-green-50/30">
        <CardContent className="py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">This Week&apos;s Plan</span>
                <p className="text-sm text-gray-900">
                  {localData.totalContent} videos • ${localData.totalAdSpend} spend • {localData.dateRange}
                </p>
              </div>
            </div>
            <button
              onClick={onEditPlan}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Pencil className="w-3 h-3" />
              Edit
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleOpenEdit = (platformIndex: number, itemId: string) => {
    const platform = localData.platforms[platformIndex];
    const item = platform.items.find((i) => i.id === itemId);
    if (item) {
      setEditingItem({
        platformIndex,
        platform: platform.platform,
        item,
      });
    }
    onEdit?.(platformIndex, itemId);
  };

  const handleSaveEdit = (
    platformIndex: number,
    itemId: string,
    updates: Partial<AdPlanItem>
  ) => {
    setLocalData((prev) => {
      const newPlatforms = [...prev.platforms];
      const platformItems = [...newPlatforms[platformIndex].items];
      const itemIndex = platformItems.findIndex((i) => i.id === itemId);
      if (itemIndex !== -1) {
        platformItems[itemIndex] = { ...platformItems[itemIndex], ...updates };
        newPlatforms[platformIndex] = {
          ...newPlatforms[platformIndex],
          items: platformItems,
        };

        // Recalculate subtotal
        const newSubtotal = platformItems.reduce((sum, item) => {
          return sum + (item.adSpend === "organic" ? 0 : item.adSpend);
        }, 0);
        newPlatforms[platformIndex].subtotal = newSubtotal;
      }

      // Recalculate total ad spend
      const newTotalAdSpend = newPlatforms.reduce(
        (sum, p) => sum + p.subtotal,
        0
      );

      return {
        ...prev,
        platforms: newPlatforms,
        totalAdSpend: newTotalAdSpend,
      };
    });
  };

  return (
    <>
      <Card className="w-full max-w-4xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            This Week&apos;s Plan
          </CardTitle>
          <WhatsThis className="mt-1">
            <p className="mb-2"><strong>Your weekly content plan</strong></p>
            <p>This shows all the ads scheduled to run this week across your platforms.</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Edit any ad by clicking the pencil icon</li>
              <li>Platform spend goes directly to TikTok/Meta/YouTube</li>
            </ul>
          </WhatsThis>
          <p className="text-sm text-gray-500 mt-2">{localData.dateRange}</p>
          {/* Strategy Badges */}
          <div className="flex flex-wrap gap-2 mt-2">
            {localData.strategyBadges.map((badge, index) => (
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
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Platform Sections */}
          {localData.platforms.map((platform, index) => (
            <PlatformSection
              key={platform.platform}
              plan={platform}
              platformIndex={index}
              onEdit={handleOpenEdit}
              onRemove={onRemove}
              onAddAd={onAddAd}
            />
          ))}

          {/* Video Usage Tracker - At bottom, showing consumption */}
          <VideoUsageTracker
            usage={videoUsage}
            planVideoCount={localData.totalContent}
            onUpgrade={onUpgradePlan}
            onAutoReload={onAutoReload}
          />

          {/* Summary Footer */}
          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="text-sm text-gray-700">
                <span className="font-semibold">Total:</span>{" "}
                {localData.totalContent} videos •{" "}
                <span className="text-blue-600 font-medium">${localData.totalAdSpend}*</span> platform spend
              </div>
              {onConfirm && (
                <Button onClick={onConfirm}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirm Plan
                </Button>
              )}
            </div>

            {/* Deadline text */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
              <div className="flex items-center gap-2 text-blue-700">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Scheduled to publish Monday, Dec 16 at 9:00 AM</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                You can make changes until then in this chat portal.
              </p>
            </div>

            {/* Platform Spend Disclaimer - with asterisk */}
            <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-200">
              * Platform ad spend is charged directly by TikTok/Meta/YouTube — not by Ad Pilot.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Edit Ad Modal */}
      <EditAdModal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        editingItem={editingItem}
        onSave={handleSaveEdit}
      />
    </>
  );
}
