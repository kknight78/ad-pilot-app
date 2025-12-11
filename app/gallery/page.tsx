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
  ChevronLeft,
  Music,
  Gift,
} from "lucide-react";
import Link from "next/link";

// Import existing widgets
import { PerformanceDashboard } from "@/components/widgets/PerformanceDashboard";
import { RecommendationsList } from "@/components/widgets/RecommendationsList";
import { GuidanceRulesCard } from "@/components/widgets/GuidanceRulesCard";
import { PublishWidget } from "@/components/widgets/PublishWidget";
import { AdPlanWidget } from "@/components/widgets/AdPlanWidget";

// Import new/rebuilt widgets
import { ThemeSelectorV2 } from "@/components/widgets/ThemeSelectorV2";
import { TopicSelectorV2 } from "@/components/widgets/TopicSelectorV2";
import { VehicleSelectorV2 } from "@/components/widgets/VehicleSelectorV2";
import { ScriptApprovalCards } from "@/components/widgets/ScriptApprovalCards";
import { GenerationProgress } from "@/components/widgets/GenerationProgress";
import { AvatarPhotoCapture } from "@/components/widgets/AvatarPhotoCapture";
import { InvoiceWidget } from "@/components/widgets/InvoiceWidget";
import { RecommendationsWidget } from "@/components/widgets/RecommendationsWidget";
import { MusicWidget } from "@/components/widgets/MusicWidget";

// Demo data removed - widgets now have built-in demo data

const widgets = [
  { id: "performance", name: "Performance Dashboard", icon: BarChart3, status: "working" },
  { id: "get-more", name: "Get More From Ad Pilot", icon: Gift, status: "new" },
  { id: "music", name: "Pick Your Vibe (Music)", icon: Music, status: "new" },
  { id: "recommendations", name: "Recommendations (old)", icon: Lightbulb, status: "rebuilt" },
  { id: "guidance", name: "Guidance Rules", icon: Settings, status: "rebuilt" },
  { id: "publish", name: "Publish Widget", icon: Video, status: "new" },
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
        return (
          <PerformanceDashboard
            onEmailReport={() => console.log("Email report")}
            onDownloadPDF={() => console.log("Download PDF")}
          />
        );
      case "get-more":
        return <RecommendationsWidget />;
      case "music":
        return <MusicWidget />;
      case "recommendations":
        return (
          <RecommendationsList
            onDismiss={() => console.log("Dismissed")}
            onAction={(id) => console.log("Action", id)}
          />
        );
      case "guidance":
        return (
          <GuidanceRulesCard
            onAddRule={(rule) => console.log("Add rule", rule)}
            onDeleteRule={(id) => console.log("Delete rule", id)}
          />
        );
      case "publish":
        return <PublishWidget />;
      case "adplan":
        return (
          <AdPlanWidget
            onEdit={(platformIndex, itemId) => console.log("Edit", platformIndex, itemId)}
            onRemove={(platformIndex, itemId) => console.log("Remove", platformIndex, itemId)}
            onAddAd={(platformIndex) => console.log("Add ad", platformIndex)}
            onUpgradePlan={() => console.log("Upgrade plan")}
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
