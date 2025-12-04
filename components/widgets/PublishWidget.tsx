"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Film,
  Play,
  Pause,
  Check,
  Square,
  Pencil,
  X,
  Calendar,
  Send,
} from "lucide-react";

interface PlatformPost {
  platform: "tiktok" | "facebook" | "instagram" | "youtube";
  enabled: boolean;
  caption: string;
  charLimit: number;
}

interface PublishWidgetProps {
  videoTitle?: string;
  videoTheme?: string;
  videoUrl?: string;
  platforms?: PlatformPost[];
  onPublish?: (platforms: string[]) => void;
  onSchedule?: (platforms: string[], date: Date) => void;
}

const platformConfig = {
  tiktok: {
    name: "TikTok",
    icon: "🎵",
    tips: "Keep it short, use trending hashtags, no links (say \"link in bio\")",
    charLimit: 300,
  },
  facebook: {
    name: "Facebook",
    icon: "📘",
    tips: "Conversational tone, fewer hashtags, include a link to your website",
    charLimit: 500,
  },
  instagram: {
    name: "Instagram",
    icon: "📸",
    tips: "Medium length, hashtags OK, no clickable links (say \"link in bio\")",
    charLimit: 400,
  },
  youtube: {
    name: "YouTube",
    icon: "📺",
    tips: "SEO-friendly title and description, links OK in description",
    charLimit: 500,
  },
};

const demoPlatforms: PlatformPost[] = [
  {
    platform: "tiktok",
    enabled: true,
    caption: "Ready to gobble up some savings? 🦃\n#UsedCars #TurkeyDay #RantoulIL #CCC #BuyHerePayHere #Thanksgiving #CarDealership #fyp",
    charLimit: 300,
  },
  {
    platform: "facebook",
    enabled: true,
    caption: "This Thanksgiving, we're thankful for great customers like YOU! 🦃\n\nCheck out these Turkey Day specials - reliable cars at prices that won't ruffle your feathers.\n\n👉 capitolcarcredit.com",
    charLimit: 500,
  },
  {
    platform: "instagram",
    enabled: false,
    caption: "",
    charLimit: 400,
  },
  {
    platform: "youtube",
    enabled: false,
    caption: "",
    charLimit: 500,
  },
];

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
  platform: keyof typeof platformConfig;
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
  const hasCaption = post.caption.trim().length > 0;

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
            <span>{config.icon}</span>
            <span className="font-medium text-gray-900">{config.name}</span>
          </div>
          {hasCaption ? (
            <p className="text-sm text-gray-600 line-clamp-2">
              {post.caption}
            </p>
          ) : (
            <p className="text-sm text-gray-400 italic">
              (click Edit to add caption)
            </p>
          )}
        </div>

        {/* Edit button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="shrink-0 text-gray-500"
        >
          <Pencil className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function PublishWidget({
  videoTitle = "Multi-Car",
  videoTheme = "Turkey Day Specials",
  videoUrl,
  platforms: initialPlatforms = demoPlatforms,
  onPublish,
  onSchedule,
}: PublishWidgetProps) {
  const [platforms, setPlatforms] = useState(initialPlatforms);
  const [isPlaying, setIsPlaying] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<keyof typeof platformConfig | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState(false);

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
        p.platform === platform ? { ...p, caption, enabled: caption.trim().length > 0 ? true : p.enabled } : p
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

  const editingPost = platforms.find((p) => p.platform === editingPlatform);

  return (
    <>
      <Card className="w-full max-w-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Film className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Your Video is Ready!</CardTitle>
              <p className="text-sm text-gray-500">
                {videoTitle} — {videoTheme}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Published Success State */}
          {published ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Published!
              </h3>
              <p className="text-gray-600 mb-2">
                Your video is now live on:
              </p>
              <div className="flex justify-center gap-2 mb-6">
                {selectedPlatforms.map((p) => (
                  <span key={p.platform} className="text-2xl">
                    {platformConfig[p.platform].icon}
                  </span>
                ))}
              </div>
              <Button onClick={() => setPublished(false)}>
                Publish Another
              </Button>
            </div>
          ) : (
            <>
              {/* Video Player Placeholder */}
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                {/* Placeholder gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-blue-900" />

                {/* Play/Pause button */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-white" />
                    ) : (
                      <Play className="w-8 h-8 text-white ml-1" />
                    )}
                  </div>
                </button>

                {/* Video title overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <p className="text-white text-sm font-medium">
                    {videoTitle} — {videoTheme}
                  </p>
                </div>
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
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={handlePublish}
                  disabled={selectedCount === 0 || isPublishing}
                >
                  {isPublishing ? (
                    "Publishing..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Publish Selected ({selectedCount})
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSchedule(true)}
                  disabled={selectedCount === 0}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule
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
    </>
  );
}
