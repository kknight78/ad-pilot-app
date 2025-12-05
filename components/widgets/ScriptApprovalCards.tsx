"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  RefreshCw,
  FileText,
  ChevronRight,
  ChevronDown,
  CheckCheck,
  User,
  Loader2,
  Video,
  Music2,
  Facebook,
  Youtube,
  Camera,
  LucideIcon,
} from "lucide-react";

type Platform = "tiktok" | "facebook" | "youtube" | "instagram";

interface ScriptSegment {
  label: string;
  content: string;
}

export interface Script {
  id: string;
  platform: Platform;
  template: string;
  theme: string;
  avatar: string;
  length: string;
  segments: ScriptSegment[];
  status: "pending" | "approved";
}

interface ScriptApprovalCardsProps {
  scripts?: Script[];
  onApprove?: (id: string) => void;
  onApproveAll?: () => void;
  onRegenerate?: (id: string) => void;
  onEditSegment?: (scriptId: string, segmentIndex: number, content: string) => void;
  onComplete?: () => void;
}

const platformConfig: Record<Platform, { name: string; Icon: LucideIcon; bgColor: string; iconColor: string }> = {
  tiktok: { name: "TikTok", Icon: Music2, bgColor: "bg-gray-900", iconColor: "text-white" },
  facebook: { name: "Facebook", Icon: Facebook, bgColor: "bg-blue-600", iconColor: "text-white" },
  youtube: { name: "YouTube", Icon: Youtube, bgColor: "bg-red-600", iconColor: "text-white" },
  instagram: { name: "Instagram", Icon: Camera, bgColor: "bg-gradient-to-r from-purple-500 to-pink-500", iconColor: "text-white" },
};

// Demo scripts organized by platform
const demoScripts: Script[] = [
  // TikTok scripts (3)
  {
    id: "1",
    platform: "tiktok",
    template: "Multi-Car",
    theme: "Turkey Day Specials",
    avatar: "Shad",
    length: "30s",
    segments: [
      { label: "HOOK", content: "Black Friday came early at Capitol Car Credit!" },
      { label: "SEGMENT 1: 2019 Honda CR-V", content: "Check out this 2019 Honda CR-V with only 45K miles. Heated seats, Apple CarPlay, and legendary reliability. Priced at just $18,995." },
      { label: "SEGMENT 2: 2020 Toyota Camry", content: "Or this 2020 Toyota Camry - one owner, 38K miles, amazing gas mileage. A steal at $19,500." },
      { label: "CTA", content: "Both available this week only. Stop by Capitol Car Credit or call 217-555-1234. We have financing options for every credit situation." },
    ],
    status: "pending",
  },
  {
    id: "2",
    platform: "tiktok",
    template: "Spotlight",
    theme: "Turkey Day Specials",
    avatar: "Shad",
    length: "30s",
    segments: [
      { label: "HOOK", content: "Want a reliable SUV without the sticker shock?" },
      { label: "SEGMENT 1: The Deal", content: "This 2019 Honda CR-V is the real deal. Low miles, clean history, and priced $2,000 under market value for our Turkey Day event." },
      { label: "SEGMENT 2: The Features", content: "You get heated seats, backup camera, Apple CarPlay, and that famous Honda reliability that lasts for years." },
      { label: "CTA", content: "Thanksgiving special ends Sunday. Come see Shad at Capitol Car Credit. We're here to help, not hassle!" },
    ],
    status: "pending",
  },
  {
    id: "3",
    platform: "tiktok",
    template: "Capitol Smarts",
    theme: "Winter Tires",
    avatar: "Shad",
    length: "45s",
    segments: [
      { label: "HOOK", content: "Your tires might not be ready for winter. Here's how to check." },
      { label: "SEGMENT 1: The Penny Test", content: "Grab a penny and stick it in your tire tread with Lincoln's head down. If you can see his whole head, your tread is too worn for winter driving." },
      { label: "SEGMENT 2: Why It Matters", content: "Bald tires on ice are like walking on a frozen pond in socks. Good tread can be the difference between stopping in time and not." },
      { label: "CTA", content: "Got questions about winter prep? Stop by Capitol Car Credit. We'll check your tires for free - buying or not!" },
    ],
    status: "pending",
  },
  // Facebook script (1)
  {
    id: "4",
    platform: "facebook",
    template: "Multi-Car",
    theme: "Credit Scores",
    avatar: "Lisa",
    length: "60s",
    segments: [
      { label: "HOOK", content: "Think your credit score means you can't get a car? Think again." },
      { label: "SEGMENT 1: Sarah's Story", content: "Sarah came to us with a 520 credit score. Other dealers turned her away. We got her approved for a 2018 Chevy Malibu with payments she could afford." },
      { label: "SEGMENT 2: Mike's Story", content: "Mike filed bankruptcy two years ago. Last week he drove off in a 2019 Ford Escape. Everyone deserves a second chance." },
      { label: "CTA", content: "Bad credit? No credit? Fresh start? Capitol Car Credit works with 20+ lenders. Apply online or stop by today!" },
    ],
    status: "pending",
  },
  // YouTube script (1)
  {
    id: "5",
    platform: "youtube",
    template: "Spotlight",
    theme: "Credit Scores",
    avatar: "Gary",
    length: "90s",
    segments: [
      { label: "HOOK", content: "Here's what nobody tells you about buying a car with bad credit." },
      { label: "SEGMENT 1: The Truth", content: "Most dealers won't work with you because it takes effort. At Capitol Car Credit, we specialize in it. That's all we do." },
      { label: "SEGMENT 2: How We Help", content: "We have relationships with over 20 lenders who focus on second-chance financing. Many of our customers leave with a lower rate than they expected." },
      { label: "CTA", content: "Stop stressing about your score. Call us at 217-555-1234 or apply online. No judgment, just help!" },
    ],
    status: "pending",
  },
];

// Editable Segment Component
function EditableSegment({
  segment,
  onEdit,
}: {
  segment: ScriptSegment;
  onEdit: (content: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(segment.content);

  const isHook = segment.label === "HOOK";
  const isCTA = segment.label === "CTA";

  const handleBlur = () => {
    setIsEditing(false);
    if (text !== segment.content) {
      onEdit(text);
    }
  };

  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {segment.label}
      </p>
      <div
        className={`relative rounded-lg transition-all ${
          isHook
            ? "bg-amber-50 border border-amber-200"
            : isCTA
            ? "bg-green-50 border border-green-200"
            : "bg-gray-50 border border-gray-200"
        } ${isEditing ? "ring-2 ring-blue-500" : "hover:border-gray-300 cursor-text"}`}
        onClick={() => !isEditing && setIsEditing(true)}
      >
        {isEditing ? (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            autoFocus
            className={`w-full p-3 text-sm bg-transparent resize-none focus:outline-none ${
              isHook ? "text-amber-900 italic" : isCTA ? "text-green-900 font-medium" : "text-gray-700"
            }`}
            rows={3}
          />
        ) : (
          <div className="p-3 pr-12">
            <p className={`text-sm whitespace-pre-wrap ${
              isHook ? "text-amber-900 italic" : isCTA ? "text-green-900 font-medium" : "text-gray-700"
            }`}>
              {isHook ? `"${segment.content}"` : segment.content}
            </p>
            <span className="absolute right-3 top-3 text-xs text-gray-400">
              edit
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Platform Section Component
function PlatformSection({
  platform,
  scripts,
  isActive,
  isComplete,
  currentIndex,
  onToggle,
  onApprove,
  onRegenerate,
  onEditSegment,
  onNext,
}: {
  platform: Platform;
  scripts: Script[];
  isActive: boolean;
  isComplete: boolean;
  currentIndex: number;
  onToggle: () => void;
  onApprove: (id: string, platform: Platform) => void;
  onRegenerate: (id: string) => void;
  onEditSegment: (scriptId: string, segmentIndex: number, content: string) => void;
  onNext: () => void;
}) {
  const config = platformConfig[platform];
  const approvedCount = scripts.filter((s) => s.status === "approved").length;
  const currentScript = scripts[currentIndex];
  const isCurrentApproved = currentScript?.status === "approved";
  const isLastInPlatform = currentIndex === scripts.length - 1;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Platform Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-2 p-2 md:p-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          {isActive ? (
            <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
          )}
          <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${config.bgColor}`}>
            <config.Icon className={`w-3.5 h-3.5 ${config.iconColor}`} />
          </div>
          <span className="font-medium text-gray-900 truncate">{config.name}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isComplete ? (
            <Badge className="bg-green-100 text-green-700 whitespace-nowrap">
              <Check className="w-3 h-3 mr-1" />
              Done
            </Badge>
          ) : (
            <span className="text-xs md:text-sm text-gray-500 whitespace-nowrap">
              {approvedCount}/{scripts.length}
            </span>
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isActive && currentScript && (
        <div className="p-3 md:p-4 space-y-3 md:space-y-4 bg-white">
          {/* Script Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm md:text-base">
                {currentScript.template} — {currentScript.theme}
              </p>
              <div className="flex items-center gap-1.5 md:gap-2 mt-1">
                <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 shrink-0" />
                <span className="text-xs md:text-sm text-gray-600">{currentScript.avatar}</span>
                <span className="text-gray-300">•</span>
                <span className="text-xs md:text-sm text-gray-600">{currentScript.length}</span>
              </div>
            </div>
            <div className="text-xs md:text-sm text-gray-500 whitespace-nowrap shrink-0">
              {currentIndex + 1}/{scripts.length}
            </div>
          </div>

          {/* Approved Badge */}
          {isCurrentApproved && (
            <Badge className="bg-green-100 text-green-700">
              <Check className="w-3 h-3 mr-1" />
              Approved
            </Badge>
          )}

          {/* Segments */}
          <div className="space-y-3">
            {currentScript.segments.map((segment, idx) => (
              <EditableSegment
                key={idx}
                segment={segment}
                onEdit={(content) => onEditSegment(currentScript.id, idx, content)}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRegenerate(currentScript.id)}
              className="w-full md:w-auto"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Regenerate
            </Button>

            {!isCurrentApproved ? (
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 w-full md:w-auto md:ml-auto"
                onClick={() => onApprove(currentScript.id, platform)}
              >
                <Check className="w-4 h-4 mr-1" />
                {isLastInPlatform ? "Approve" : "Approve & Next"}
              </Button>
            ) : !isLastInPlatform ? (
              <Button size="sm" onClick={onNext} className="w-full md:w-auto md:ml-auto">
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : null}
          </div>

          {/* Navigation Dots */}
          {scripts.length > 1 && (
            <div className="flex justify-center gap-1.5 pt-2">
              {scripts.map((script, idx) => (
                <div
                  key={script.id}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? "w-6 bg-gray-800"
                      : script.status === "approved"
                      ? "bg-green-400"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ScriptApprovalCards({
  scripts: initialScripts = demoScripts,
  onApprove,
  onApproveAll,
  onRegenerate,
  onEditSegment,
  onComplete,
}: ScriptApprovalCardsProps) {
  const [scripts, setScripts] = useState(initialScripts);
  const [platformIndices, setPlatformIndices] = useState<Record<Platform, number>>({
    tiktok: 0,
    facebook: 0,
    youtube: 0,
    instagram: 0,
  });
  const [activePlatform, setActivePlatform] = useState<Platform | null>("tiktok");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);

  // Group scripts by platform
  const platformOrder: Platform[] = ["tiktok", "facebook", "youtube", "instagram"];
  const scriptsByPlatform = platformOrder.reduce((acc, platform) => {
    acc[platform] = scripts.filter((s) => s.platform === platform);
    return acc;
  }, {} as Record<Platform, Script[]>);

  // Filter to only platforms with scripts
  const platformsWithScripts = platformOrder.filter(
    (p) => scriptsByPlatform[p].length > 0
  );

  const pendingCount = scripts.filter((s) => s.status === "pending").length;
  const approvedCount = scripts.filter((s) => s.status === "approved").length;
  const totalCount = scripts.length;
  const allApproved = approvedCount === totalCount;

  const handleApprove = (id: string, platform: Platform) => {
    // Update the script status
    const updatedScripts = scripts.map((s) =>
      s.id === id ? { ...s, status: "approved" as const } : s
    );
    setScripts(updatedScripts);
    onApprove?.(id);

    // Check if this was the last script in the platform
    const platformScripts = updatedScripts.filter((s) => s.platform === platform);
    const allPlatformApproved = platformScripts.every((s) => s.status === "approved");
    const currentIdx = platformIndices[platform];
    const isLastInPlatform = currentIdx === platformScripts.length - 1;

    if (isLastInPlatform && allPlatformApproved) {
      // Auto-advance to next platform
      const platformIdx = platformsWithScripts.indexOf(platform);
      if (platformIdx < platformsWithScripts.length - 1) {
        const nextPlatform = platformsWithScripts[platformIdx + 1];
        // Reset next platform to first script and expand it
        setPlatformIndices((prev) => ({ ...prev, [nextPlatform]: 0 }));
        setActivePlatform(nextPlatform);
      } else {
        // This was the last platform - collapse it
        setActivePlatform(null);
      }
    } else if (!isLastInPlatform) {
      // Move to next script within platform
      setPlatformIndices((prev) => ({ ...prev, [platform]: currentIdx + 1 }));
    }
  };

  const handleApproveAll = () => {
    setScripts((prev) => prev.map((s) => ({ ...s, status: "approved" as const })));
    onApproveAll?.();
  };

  const handleEditSegment = (scriptId: string, segmentIndex: number, content: string) => {
    setScripts((prev) =>
      prev.map((s) => {
        if (s.id !== scriptId) return s;
        const newSegments = [...s.segments];
        newSegments[segmentIndex] = { ...newSegments[segmentIndex], content };
        return { ...s, segments: newSegments };
      })
    );
    onEditSegment?.(scriptId, segmentIndex, content);
  };

  const handleNext = (platform: Platform) => {
    const platformScripts = scriptsByPlatform[platform];
    const currentIdx = platformIndices[platform];

    if (currentIdx < platformScripts.length - 1) {
      setPlatformIndices((prev) => ({ ...prev, [platform]: currentIdx + 1 }));
    } else {
      // Move to next platform
      const platformIdx = platformsWithScripts.indexOf(platform);
      if (platformIdx < platformsWithScripts.length - 1) {
        const nextPlatform = platformsWithScripts[platformIdx + 1];
        setActivePlatform(nextPlatform);
      }
    }
  };

  const isPlatformComplete = (platform: Platform) => {
    return scriptsByPlatform[platform].every((s) => s.status === "approved");
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 md:p-2 bg-amber-100 rounded-lg shrink-0">
              <FileText className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base md:text-lg">Script Approval</CardTitle>
              <p className="text-xs md:text-sm text-gray-500">
                {totalCount} scripts
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {pendingCount} pending
            </span>
            {!allApproved && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleApproveAll}
                className="text-xs whitespace-nowrap"
              >
                <CheckCheck className="w-3 h-3 mr-1" />
                Approve All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Generation Complete State */}
        {generationComplete ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Videos Generating!
            </h3>
            <p className="text-gray-600 mb-2">
              {totalCount} videos are being created now.
            </p>
            <p className="text-sm text-gray-500">
              This usually takes 5-10 minutes. We&apos;ll show your videos for review when they&apos;re ready!
            </p>
          </div>
        ) : isGenerating ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Starting Video Generation...
            </h3>
            <p className="text-gray-600">
              Grab a coffee while we work our magic!
            </p>
          </div>
        ) : allApproved ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              All Scripts Approved!
            </h3>
            <p className="text-gray-600 mb-6">
              {totalCount} scripts ready for video generation
            </p>
            <Button onClick={() => {
              setIsGenerating(true);
              onComplete?.();
              // Simulate generation starting then complete
              setTimeout(() => {
                setIsGenerating(false);
                setGenerationComplete(true);
              }, 2000);
            }}>
              Generate Videos
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        ) : (
          <>
            {/* Platform Sections */}
            {platformsWithScripts.map((platform) => (
              <PlatformSection
                key={platform}
                platform={platform}
                scripts={scriptsByPlatform[platform]}
                isActive={activePlatform === platform}
                isComplete={isPlatformComplete(platform)}
                currentIndex={platformIndices[platform]}
                onToggle={() =>
                  setActivePlatform(activePlatform === platform ? null : platform)
                }
                onApprove={handleApprove}
                onRegenerate={(id) => onRegenerate?.(id)}
                onEditSegment={handleEditSegment}
                onNext={() => handleNext(platform)}
              />
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}
