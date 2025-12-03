"use client";

import { useState } from "react";
import {
  BarChart3,
  Lightbulb,
  Settings,
  Video,
  Calendar,
  Palette,
  BookOpen,
  Car,
  FileText,
  Loader,
  Camera,
  CreditCard,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";

// Import existing widgets
import { PerformanceDashboard } from "@/components/widgets/PerformanceDashboard";
import { RecommendationsList } from "@/components/widgets/RecommendationsList";
import { GuidanceRulesCard } from "@/components/widgets/GuidanceRulesCard";
import { VideoPreviewCard } from "@/components/widgets/VideoPreviewCard";
import { AdPlanWidget } from "@/components/widgets/AdPlanWidget";

// Import new/rebuilt widgets
import { ThemeSelectorV2 } from "@/components/widgets/ThemeSelectorV2";
import { TopicSelectorV2 } from "@/components/widgets/TopicSelectorV2";
import { VehicleSelectorV2 } from "@/components/widgets/VehicleSelectorV2";
import { ScriptApprovalCards } from "@/components/widgets/ScriptApprovalCards";
import { GenerationProgress } from "@/components/widgets/GenerationProgress";
import { AvatarPhotoCapture } from "@/components/widgets/AvatarPhotoCapture";
import { InvoiceWidget } from "@/components/widgets/InvoiceWidget";

// Demo data for each widget
const performanceData = {
  dateRange: "Nov 25 - Dec 1, 2024",
  totalViews: 45200,
  totalLeads: 28,
  totalSpend: 450,
  viewsTrend: 12,
  leadsTrend: 8,
  platforms: [
    { platform: "TikTok", views: 28500, leads: 15, spend: 150, cpl: 10, trend: 18 },
    { platform: "Facebook", views: 12400, leads: 10, spend: 200, cpl: 20, trend: 5 },
    { platform: "Instagram", views: 3100, leads: 2, spend: 75, cpl: 37.5, trend: -3 },
    { platform: "YouTube", views: 1200, leads: 1, spend: 25, cpl: 25, trend: 0 },
  ],
  topContent: [
    { title: "2019 Honda CR-V - Perfect Family SUV", platform: "TikTok", views: 8400, leads: 5, featured: true },
    { title: "Why Buy Used? 5 Smart Reasons", platform: "Facebook", views: 4200, leads: 3 },
    { title: "Winter Driving Tips from Shad", platform: "TikTok", views: 3800, leads: 2 },
  ],
};

const recommendationsData = [
  { id: "1", type: "success" as const, message: "TikTok is crushing it! Consider increasing ad spend by 20% to capitalize on momentum." },
  { id: "2", type: "warning" as const, message: "Instagram CPL is high ($37.50). Consider pausing or refreshing creative." },
  { id: "3", type: "action" as const, message: "You have 3 vehicles over 45 days on lot. Feature them in this week's ads?" },
  { id: "4", type: "neutral" as const, message: "YouTube Shorts performing on par with expectations. Maintain current strategy." },
];

const guidanceRulesData = [
  { id: "1", category: "tone" as const, rule: "Friendly and approachable, like talking to a neighbor" },
  { id: "2", category: "tone" as const, rule: "Never pushy or salesy - focus on helping" },
  { id: "3", category: "content" as const, rule: "Always mention financing options for all credit levels" },
  { id: "4", category: "content" as const, rule: "Highlight local Rantoul community connection" },
  { id: "5", category: "cta" as const, rule: "Primary: Call or text (217) 555-1234" },
  { id: "6", category: "cta" as const, rule: "Secondary: Visit capitolcarcredit.com" },
  { id: "7", category: "style" as const, rule: "Use casual language, avoid jargon" },
];

const adPlanData = {
  dateRange: "Dec 2-8, 2024",
  platforms: [
    {
      platform: "tiktok" as const,
      items: [
        { id: "1", description: "Vehicle Spotlight - Honda CR-V", template: "Quick Feature", vehicles: 1, avatar: "Shad", length: "30s", adSpend: 50 },
        { id: "2", description: "Vehicle Spotlight - Toyota Camry", template: "Quick Feature", vehicles: 1, avatar: "Lisa", length: "30s", adSpend: 50 },
        { id: "3", description: "Winter Driving Tips", template: "Educational", topic: "Winter prep", avatar: "Shad", length: "45s", adSpend: 25 },
      ],
      subtotal: 125,
    },
    {
      platform: "facebook" as const,
      items: [
        { id: "4", description: "Weekly Inventory Showcase", template: "Carousel", vehicles: 5, avatar: "Shad", length: "60s", adSpend: 100 },
        { id: "5", description: "Customer Testimonial", template: "Story", avatar: "Customer", length: "45s", adSpend: 75 },
      ],
      subtotal: 175,
    },
    {
      platform: "youtube" as const,
      items: [
        { id: "6", description: "Capitol Smarts: Understanding APR", template: "Educational", topic: "Financing basics", avatar: "Shad", length: "90s", adSpend: "free" as const },
      ],
      subtotal: 0,
    },
  ],
  totalContent: 6,
  totalAdSpend: 300,
  strategyBadges: ["Winter theme", "Avatar variety", "Educational mix"],
};

const widgets = [
  { id: "performance", name: "Performance Dashboard", icon: BarChart3, status: "working" },
  { id: "recommendations", name: "Recommendations List", icon: Lightbulb, status: "working" },
  { id: "guidance", name: "Guidance Rules", icon: Settings, status: "working" },
  { id: "video", name: "Video Preview Card", icon: Video, status: "working" },
  { id: "adplan", name: "Ad Plan Table", icon: Calendar, status: "working" },
  { id: "theme", name: "Theme Selector", icon: Palette, status: "rebuilt" },
  { id: "topic", name: "Topic Selector", icon: BookOpen, status: "rebuilt" },
  { id: "vehicle", name: "Vehicle Selector", icon: Car, status: "new" },
  { id: "script", name: "Script Approval", icon: FileText, status: "new" },
  { id: "progress", name: "Generation Progress", icon: Loader, status: "new" },
  { id: "avatar", name: "Avatar Photo Capture", icon: Camera, status: "new" },
  { id: "invoice", name: "Invoice / Pay Bill", icon: CreditCard, status: "new" },
];

const statusColors = {
  working: "bg-green-100 text-green-700",
  rebuilt: "bg-blue-100 text-blue-700",
  new: "bg-purple-100 text-purple-700",
};

export default function GalleryPage() {
  const [activeWidget, setActiveWidget] = useState("performance");

  const renderWidget = () => {
    switch (activeWidget) {
      case "performance":
        return <PerformanceDashboard {...performanceData} />;
      case "recommendations":
        return <RecommendationsList recommendations={recommendationsData} />;
      case "guidance":
        return (
          <GuidanceRulesCard
            rules={guidanceRulesData}
            clientName="Capitol Car Credit"
            onAddRule={() => console.log("Add rule")}
            onEditRule={(id) => console.log("Edit rule", id)}
            onDeleteRule={(id) => console.log("Delete rule", id)}
          />
        );
      case "video":
        return (
          <VideoPreviewCard
            title="2019 Honda CR-V - Perfect Family SUV"
            hook="Looking for a reliable family SUV that won't break the bank?"
            script="This 2019 Honda CR-V has everything you need. Low miles, clean history, and that legendary Honda reliability. Plus, we've got financing options for every credit situation. Come see it today at Capitol Car Credit!"
            duration="30s"
            status="preview"
            onApprove={() => console.log("Approved")}
            onEdit={() => console.log("Edit")}
            onRegenerate={() => console.log("Regenerate")}
          />
        );
      case "adplan":
        return (
          <AdPlanWidget
            data={adPlanData}
            onEdit={(platformIndex, itemId) => console.log("Edit", platformIndex, itemId)}
            onRemove={(platformIndex, itemId) => console.log("Remove", platformIndex, itemId)}
            onAddAd={(platformIndex) => console.log("Add ad", platformIndex)}
          />
        );
      case "theme":
        return <ThemeSelectorV2 />;
      case "topic":
        return <TopicSelectorV2 />;
      case "vehicle":
        return <VehicleSelectorV2 />;
      case "script":
        return <ScriptApprovalCards />;
      case "progress":
        return <GenerationProgress />;
      case "avatar":
        return <AvatarPhotoCapture />;
      case "invoice":
        return <InvoiceWidget />;
      default:
        return <div className="text-gray-500">Select a widget</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Widget Gallery</h1>
              <p className="text-sm text-gray-500">Isolated widget testing and development</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] p-4">
          <div className="space-y-1">
            {widgets.map((widget) => {
              const Icon = widget.icon;
              const isActive = activeWidget === widget.id;
              return (
                <button
                  key={widget.id}
                  onClick={() => setActiveWidget(widget.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                    isActive
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-medium flex-1">{widget.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${statusColors[widget.status as keyof typeof statusColors]}`}>
                    {widget.status}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Main content area */}
        <main className="flex-1 p-8">
          <div className="flex justify-center">
            {renderWidget()}
          </div>
        </main>
      </div>
    </div>
  );
}
