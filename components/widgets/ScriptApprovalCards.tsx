"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  X,
  RefreshCw,
  Pencil,
  FileText,
  Car,
  User,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export interface Script {
  id: string;
  vehicleInfo?: string;
  topic?: string;
  template: string;
  platform: "tiktok" | "facebook" | "youtube" | "instagram";
  avatar: string;
  duration: string;
  hook: string;
  body: string;
  cta: string;
  status: "pending" | "approved" | "rejected";
}

interface ScriptApprovalCardsProps {
  scripts?: Script[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onRegenerate?: (id: string) => void;
  onEdit?: (id: string) => void;
}

// Demo scripts
const demoScripts: Script[] = [
  {
    id: "1",
    vehicleInfo: "2019 Honda CR-V",
    template: "Quick Feature",
    platform: "tiktok",
    avatar: "Shad",
    duration: "30s",
    hook: "Looking for a reliable family SUV that won't break the bank?",
    body: "This 2019 Honda CR-V has everything you need. Low miles at just 45,000, clean history, and that legendary Honda reliability. It's got heated seats, Apple CarPlay, and enough room for the whole crew.",
    cta: "Come see it today at Capitol Car Credit. We've got financing for every credit situation. Call or text us at 217-555-1234!",
    status: "pending",
  },
  {
    id: "2",
    topic: "Winter Tire Safety",
    template: "Educational",
    platform: "youtube",
    avatar: "Shad",
    duration: "60s",
    hook: "Winter's coming - is your car ready?",
    body: "Hey, it's Shad from Capitol Car Credit. Let me share something that could save your life this winter. Your tires are the only thing between your car and the road, and when it's icy out there, you need every advantage you can get. Here's the penny test - stick a penny in your tread. If you can see Lincoln's whole head, it's time for new tires.",
    cta: "Got questions about getting your car winter-ready? Stop by Capitol Car Credit - we're always happy to help, whether you're buying or not!",
    status: "pending",
  },
  {
    id: "3",
    vehicleInfo: "2020 Toyota Camry",
    template: "Story Format",
    platform: "facebook",
    avatar: "Lisa",
    duration: "45s",
    hook: "Some cars just get it right. The Camry is one of them.",
    body: "Hi, I'm Lisa from Capitol Car Credit. This 2020 Toyota Camry is the kind of car that makes my job easy. 38,000 miles, one owner, and it runs like new. Great gas mileage, super comfortable, and Toyota reliability means you're set for years to come.",
    cta: "Ready to see it in person? We're here 6 days a week. Call us at 217-555-1234 or just stop by - we love visitors!",
    status: "pending",
  },
];

const platformConfig = {
  tiktok: { name: "TikTok", color: "bg-black text-white" },
  facebook: { name: "Facebook", color: "bg-blue-600 text-white" },
  youtube: { name: "YouTube", color: "bg-red-600 text-white" },
  instagram: { name: "Instagram", color: "bg-gradient-to-r from-purple-500 to-pink-500 text-white" },
};

export function ScriptApprovalCards({
  scripts = demoScripts,
  onApprove,
  onReject,
  onRegenerate,
  onEdit,
}: ScriptApprovalCardsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(scripts[0]?.id || null);
  const [localScripts, setLocalScripts] = useState(scripts);

  const handleApprove = (id: string) => {
    setLocalScripts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "approved" as const } : s))
    );
    onApprove?.(id);
  };

  const handleReject = (id: string) => {
    setLocalScripts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "rejected" as const } : s))
    );
    onReject?.(id);
  };

  const pendingCount = localScripts.filter((s) => s.status === "pending").length;
  const approvedCount = localScripts.filter((s) => s.status === "approved").length;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <FileText className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Script Approval</CardTitle>
              <p className="text-sm text-gray-500">
                Review and approve generated scripts
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">{pendingCount} pending</Badge>
            <Badge variant="default" className="bg-green-500">{approvedCount} approved</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {localScripts.map((script) => {
          const isExpanded = expandedId === script.id;
          const platform = platformConfig[script.platform];

          return (
            <div
              key={script.id}
              className={`border rounded-lg overflow-hidden transition-all ${
                script.status === "approved"
                  ? "border-green-200 bg-green-50"
                  : script.status === "rejected"
                  ? "border-red-200 bg-red-50 opacity-60"
                  : "border-gray-200 bg-white"
              }`}
            >
              {/* Header row - always visible */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : script.id)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors"
              >
                <Badge className={`${platform.color} text-xs`}>{platform.name}</Badge>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {script.vehicleInfo ? (
                      <>
                        <Car className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{script.vehicleInfo}</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{script.topic}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {script.avatar}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {script.duration}
                    </span>
                    <span>{script.template}</span>
                  </div>
                </div>

                {script.status === "approved" && (
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    <Check className="w-3 h-3 mr-1" />
                    Approved
                  </Badge>
                )}
                {script.status === "rejected" && (
                  <Badge variant="outline" className="text-red-600 border-red-300">
                    <X className="w-3 h-3 mr-1" />
                    Rejected
                  </Badge>
                )}

                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-3 pb-3 space-y-3 border-t border-gray-100 pt-3">
                  {/* Hook */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Opening Hook
                    </p>
                    <p className="text-sm text-gray-800 italic bg-amber-50 p-2 rounded">
                      &ldquo;{script.hook}&rdquo;
                    </p>
                  </div>

                  {/* Body */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Script Body
                    </p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      {script.body}
                    </p>
                  </div>

                  {/* CTA */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Call to Action
                    </p>
                    <p className="text-sm text-gray-800 font-medium bg-green-50 p-2 rounded">
                      {script.cta}
                    </p>
                  </div>

                  {/* Actions */}
                  {script.status === "pending" && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(script.id)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit?.(script.id)}
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRegenerate?.(script.id)}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Regenerate
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleReject(script.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {approvedCount === localScripts.length && (
          <Button className="w-full">
            All scripts approved! Start generating videos
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
