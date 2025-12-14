"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Film,
  Check,
  Pencil,
  X,
  Calendar,
  Save,
  Music2,
  Facebook,
  Youtube,
  Camera,
  LucideIcon,
  RefreshCw,
  ChevronDown,
} from "lucide-react";

type Platform = "tiktok" | "facebook" | "instagram" | "youtube";

interface PlatformPost {
  platform: Platform;
  enabled: boolean;
  caption: string;
}

interface PublishWidgetProps {
  videoTitle?: string;
  videoTheme?: string;
  runDates?: string;
  currentVideo?: number;
  totalVideos?: number;
  platforms?: PlatformPost[];
  onPublish?: (platforms: string[]) => void;
  onSaveForLater?: () => void;
  onNext?: () => void;
}

const platformConfig: Record<Platform, { name: string; Icon: LucideIcon; bgColor: string; iconColor: string; tips: string; charLimit: number }> = {
  tiktok: {
    name: "TikTok",
    Icon: Music2,
    bgColor: "bg-black",
    iconColor: "text-white",
    tips: "Keep it short, use trending hashtags, no links (say \"link in bio\")",
    charLimit: 300,
  },
  facebook: {
    name: "Facebook",
    Icon: Facebook,
    bgColor: "bg-blue-600",
    iconColor: "text-white",
    tips: "Conversational tone, fewer hashtags, include a link to your website",
    charLimit: 500,
  },
  instagram: {
    name: "Instagram",
    Icon: Camera,
    bgColor: "bg-pink-500",
    iconColor: "text-white",
    tips: "Medium length, hashtags OK, no clickable links (say \"link in bio\")",
    charLimit: 400,
  },
  youtube: {
    name: "YouTube",
    Icon: Youtube,
    bgColor: "bg-red-600",
    iconColor: "text-white",
    tips: "SEO-friendly title and description, links OK in description",
    charLimit: 500,
  },
};

// Only show platforms that are in the ad plan (TikTok + Facebook for demo)
const demoPlatforms: PlatformPost[] = [
  {
    platform: "tiktok",
    enabled: true,
    caption: "Ready to gobble up some savings? 🦃\n#UsedCars #TurkeyDay #RantoulIL #CCC #BuyHerePayHere #Thanksgiving #CarDealership #fyp",
  },
  {
    platform: "facebook",
    enabled: true,
    caption: "This Thanksgiving, we're thankful for great customers like YOU! 🦃\n\nCheck out these Turkey Day specials - reliable cars at prices that won't ruffle your feathers.\n\n👉 capitolcarcredit.com",
  },
];

// Regenerate Modal
function RegenerateModal({
  isOpen,
  onClose,
  onRegenerate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onRegenerate: (options: string[]) => void;
}) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const options = [
    { id: "script", label: "Script", description: "Generate a new script with different angles" },
    { id: "avatar", label: "Avatar Recording", description: "Re-record with different delivery" },
    { id: "music", label: "Music", description: "Try different background music" },
    { id: "visuals", label: "Vehicle Clips", description: "Use different vehicle footage" },
  ];

  useEffect(() => {
    if (isOpen) {
      setSelectedOptions([]);
    }
  }, [isOpen]);

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

  if (!isOpen || typeof window === "undefined") return null;

  const toggleOption = (id: string) => {
    setSelectedOptions(prev =>
      prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]
    );
  };

  const handleRegenerate = () => {
    onRegenerate(selectedOptions);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">
            What would you like to regenerate?
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-2">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => toggleOption(option.id)}
              className={`w-full flex items-start gap-3 p-3 rounded-lg border-2 transition-colors text-left ${
                selectedOptions.includes(option.id)
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                selectedOptions.includes(option.id)
                  ? "border-blue-500 bg-blue-500"
                  : "border-gray-300"
              }`}>
                {selectedOptions.includes(option.id) && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{option.label}</p>
                <p className="text-sm text-gray-500">{option.description}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleRegenerate}
            disabled={selectedOptions.length === 0}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Regenerate {selectedOptions.length > 0 && `(${selectedOptions.length})`}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Edit Caption Modal
function EditCaptionModal({
  isOpen,
  onClose,
  platform,
  caption,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  platform: Platform;
  caption: string;
  onSave: (caption: string) => void;
}) {
  const [text, setText] = useState(caption);
  const config = platformConfig[platform];

  useEffect(() => {
    if (isOpen) {
      setText(caption);
    }
  }, [isOpen, caption]);

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

  if (!isOpen || typeof window === "undefined") return null;

  const handleSave = () => {
    onSave(text);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">
            Edit {config.name} Caption
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={6}
            placeholder={`Write your ${config.name} caption...`}
          />

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <span className="font-medium">💡 {config.name} tips:</span> {config.tips}
            </p>
          </div>

          <p className="text-xs text-gray-500 text-right">
            Characters: {text.length}/{config.charLimit}
          </p>
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Platform Row Component
function PlatformRow({
  post,
  onToggle,
  onEdit,
}: {
  post: PlatformPost;
  onToggle: () => void;
  onEdit: () => void;
}) {
  const config = platformConfig[post.platform];

  return (
    <div
      className={`border-b border-gray-100 last:border-b-0 ${
        !post.enabled ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start gap-3 p-3">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className="mt-0.5 shrink-0"
        >
          {post.enabled ? (
            <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          ) : (
            <div className="w-5 h-5 border-2 border-gray-300 rounded" />
          )}
        </button>

        {/* Platform info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-5 h-5 rounded flex items-center justify-center ${config.bgColor}`}>
              <config.Icon className={`w-3 h-3 ${config.iconColor}`} />
            </div>
            <span className="font-medium text-gray-900">{config.name}</span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {post.caption}
          </p>
        </div>

        {/* Edit button */}
        <button
          onClick={onEdit}
          className="shrink-0 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function PublishWidget({
  videoTitle = "Multi-Car",
  videoTheme = "Turkey Day Specials",
  runDates = "Dec 2 - Dec 8",
  currentVideo = 2,
  totalVideos = 6,
  platforms: initialPlatforms = demoPlatforms,
  onPublish,
  onSaveForLater,
  onNext,
}: PublishWidgetProps) {
  const [platforms, setPlatforms] = useState(initialPlatforms);
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const selectedPlatforms = platforms.filter((p) => p.enabled);
  const selectedCount = selectedPlatforms.length;

  const handleTogglePlatform = (platform: string) => {
    setPlatforms((prev) =>
      prev.map((p) =>
        p.platform === platform ? { ...p, enabled: !p.enabled } : p
      )
    );
  };

  const handleSaveCaption = (platform: string, caption: string) => {
    setPlatforms((prev) =>
      prev.map((p) =>
        p.platform === platform ? { ...p, caption } : p
      )
    );
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    onPublish?.(selectedPlatforms.map((p) => p.platform));
    setIsPublishing(false);
    setPublished(true);
  };

  const handleSaveForLater = () => {
    onSaveForLater?.();
    // Could show a toast or advance to next video
  };

  const handleRegenerate = (options: string[]) => {
    console.log("Regenerating:", options);
    // In real implementation, this would trigger regeneration workflow
  };

  const handleNextVideo = () => {
    setPublished(false);
    onNext?.();
  };

  const editingPost = platforms.find((p) => p.platform === editingPlatform);

  return (
    <>
      <Card className="w-full max-w-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <Film className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                Video Ready!
              </CardTitle>
              <p className="text-xs md:text-sm text-gray-900 font-medium truncate mt-1">
                {videoTitle} — {videoTheme}
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 shrink-0" />
                <span className="truncate">{runDates}</span>
              </p>
            </div>
            <span className="text-xs md:text-sm text-gray-500 font-medium whitespace-nowrap shrink-0">
              {currentVideo}/{totalVideos}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Approved Success State */}
          {published ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Approved!
              </h3>
              <p className="text-gray-600 mb-2">
                Your video will be published to:
              </p>
              <div className="flex justify-center gap-2 mb-6">
                {selectedPlatforms.map((p) => {
                  const config = platformConfig[p.platform];
                  return (
                    <div key={p.platform} className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.bgColor}`}>
                      <config.Icon className={`w-5 h-5 ${config.iconColor}`} />
                    </div>
                  );
                })}
              </div>
              {currentVideo < totalVideos ? (
                <Button onClick={handleNextVideo}>
                  Next Video ({currentVideo + 1} of {totalVideos})
                </Button>
              ) : (
                <Button onClick={() => setPublished(false)}>
                  All Done!
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Video Player - Vertical 9:16 aspect ratio with native controls */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative w-48 bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '9/16' }}>
                  {/* Actual video with native controls for audio */}
                  <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    src="https://res.cloudinary.com/dtpqxuwby/video/upload/v1763688792/facebook_2025-11-20_test.mp4"
                    playsInline
                    loop
                    controls
                  />

                  {/* Video title overlay - positioned above controls */}
                  <div className="absolute bottom-10 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pointer-events-none">
                    <p className="text-white text-xs font-medium">
                      {videoTitle} — {videoTheme}
                    </p>
                  </div>
                </div>

                {/* Regenerate button */}
                <button
                  onClick={() => setShowRegenerateModal(true)}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>

              {/* Publish To Section */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Publish to:
                </p>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {platforms.map((post) => (
                    <PlatformRow
                      key={post.platform}
                      post={post}
                      onToggle={() => handleTogglePlatform(post.platform)}
                      onEdit={() => setEditingPlatform(post.platform)}
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={handleSaveForLater}
                  className="w-full md:w-auto"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save for Later
                </Button>
                <Button
                  className="w-full md:flex-1"
                  onClick={handlePublish}
                  disabled={selectedCount === 0 || isPublishing}
                >
                  {isPublishing ? (
                    "Approving..."
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Approve ({selectedCount})
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Caption Modal */}
      {editingPlatform && editingPost && (
        <EditCaptionModal
          isOpen={!!editingPlatform}
          onClose={() => setEditingPlatform(null)}
          platform={editingPlatform}
          caption={editingPost.caption}
          onSave={(caption) => handleSaveCaption(editingPlatform, caption)}
        />
      )}

      {/* Regenerate Modal */}
      <RegenerateModal
        isOpen={showRegenerateModal}
        onClose={() => setShowRegenerateModal(false)}
        onRegenerate={handleRegenerate}
      />
    </>
  );
}
