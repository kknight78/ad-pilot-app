"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Film,
  Check,
  X,
  Calendar,
  Music2,
  Facebook,
  Youtube,
  Camera,
  LucideIcon,
  RefreshCw,
  ChevronDown,
  Play,
  Trash2,
  Clock,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { WhatsThis } from "@/components/ui/whats-this";

type Platform = "tiktok" | "facebook" | "instagram" | "youtube";

interface Video {
  id: string;
  platform: Platform;
  template: string;
  theme: string;
  avatar: string;
  music: string;
  vehicle?: string;
  thumbnail: string;
  videoUrl: string;
  caption: string;
  removed?: boolean;
}

interface VideoReadyWidgetProps {
  videos?: Video[];
  publishDate?: string;
  onPublish?: (videos: Video[]) => void;
  onRemove?: (videoId: string) => void;
  onRegenerate?: (videoId: string, options: string[]) => void;
}

const platformConfig: Record<Platform, { name: string; Icon: LucideIcon; bgColor: string; iconColor: string; headerBg: string }> = {
  tiktok: {
    name: "TikTok",
    Icon: Music2,
    bgColor: "bg-black",
    iconColor: "text-white",
    headerBg: "bg-gray-900",
  },
  facebook: {
    name: "Facebook",
    Icon: Facebook,
    bgColor: "bg-blue-600",
    iconColor: "text-white",
    headerBg: "bg-blue-600",
  },
  instagram: {
    name: "Instagram",
    Icon: Camera,
    bgColor: "bg-gradient-to-r from-purple-500 to-pink-500",
    iconColor: "text-white",
    headerBg: "bg-gradient-to-r from-purple-500 to-pink-500",
  },
  youtube: {
    name: "YouTube",
    Icon: Youtube,
    bgColor: "bg-red-600",
    iconColor: "text-white",
    headerBg: "bg-red-600",
  },
};

// Demo videos grouped by platform
const demoVideos: Video[] = [
  // TikTok videos (3)
  {
    id: "tt1",
    platform: "tiktok",
    template: "Multi-Car",
    theme: "Turkey Day Specials",
    avatar: "Shad",
    music: "Upbeat Holiday",
    vehicle: "2019 Honda CR-V",
    thumbnail: "https://res.cloudinary.com/dtpqxuwby/video/upload/so_0/v1763688792/facebook_2025-11-20_test.jpg",
    videoUrl: "https://res.cloudinary.com/dtpqxuwby/video/upload/v1763688792/facebook_2025-11-20_test.mp4",
    caption: "Ready to gobble up some savings? 🦃\n#UsedCars #TurkeyDay",
  },
  {
    id: "tt2",
    platform: "tiktok",
    template: "Spotlight",
    theme: "Turkey Day Specials",
    avatar: "Shad",
    music: "Acoustic Warm",
    vehicle: "2020 Toyota Camry",
    thumbnail: "https://res.cloudinary.com/dtpqxuwby/video/upload/so_0/v1763688792/facebook_2025-11-20_test.jpg",
    videoUrl: "https://res.cloudinary.com/dtpqxuwby/video/upload/v1763688792/facebook_2025-11-20_test.mp4",
    caption: "This CR-V won't last long! 🚗💨",
  },
  {
    id: "tt3",
    platform: "tiktok",
    template: "Capitol Smarts",
    theme: "Winter Tires",
    avatar: "Shad",
    music: "Chill Lo-Fi",
    thumbnail: "https://res.cloudinary.com/dtpqxuwby/video/upload/so_0/v1763688792/facebook_2025-11-20_test.jpg",
    videoUrl: "https://res.cloudinary.com/dtpqxuwby/video/upload/v1763688792/facebook_2025-11-20_test.mp4",
    caption: "Don't slip up this winter! ❄️🚗",
  },
  // Facebook video (1)
  {
    id: "fb1",
    platform: "facebook",
    template: "Multi-Car",
    theme: "Credit Scores",
    avatar: "Lisa",
    music: "Inspiring Piano",
    thumbnail: "https://res.cloudinary.com/dtpqxuwby/video/upload/so_0/v1763688792/facebook_2025-11-20_test.jpg",
    videoUrl: "https://res.cloudinary.com/dtpqxuwby/video/upload/v1763688792/facebook_2025-11-20_test.mp4",
    caption: "Your credit score doesn't define you. 💪",
  },
  // YouTube video (1)
  {
    id: "yt1",
    platform: "youtube",
    template: "Spotlight",
    theme: "Credit Scores",
    avatar: "Gary",
    music: "Corporate Uplifting",
    thumbnail: "https://res.cloudinary.com/dtpqxuwby/video/upload/so_0/v1763688792/facebook_2025-11-20_test.jpg",
    videoUrl: "https://res.cloudinary.com/dtpqxuwby/video/upload/v1763688792/facebook_2025-11-20_test.mp4",
    caption: "Bad Credit Car Buying Tips | Capitol Car Credit",
  },
];

// Video Preview Modal
function VideoPreviewModal({
  video,
  onClose,
}: {
  video: Video | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!video) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [video, onClose]);

  if (!video || typeof window === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative bg-black rounded-xl overflow-hidden max-h-[90vh]" style={{ aspectRatio: "9/16", maxWidth: "360px" }}>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <video
          className="w-full h-full object-cover"
          src={video.videoUrl}
          autoPlay
          loop
          controls
          playsInline
        />
      </div>
    </div>,
    document.body
  );
}

// Regenerate Modal with editable fields
function RegenerateModal({
  video,
  isOpen,
  onClose,
  onRegenerate,
}: {
  video: Video;
  isOpen: boolean;
  onClose: () => void;
  onRegenerate: (updates: Record<string, string>) => void;
}) {
  const [script, setScript] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(video.vehicle || "");
  const [selectedAvatar, setSelectedAvatar] = useState(video.avatar);
  const [selectedMusic, setSelectedMusic] = useState(video.music);
  const [selectedTemplate, setSelectedTemplate] = useState(video.template);

  const avatarOptions = ["Shad", "Lisa", "Gary"];
  const templateOptions = ["Multi-Car", "Spotlight", "Capitol Smarts", "Carousel", "Testimonial"];
  const vehicleOptions = ["2019 Honda CR-V", "2020 Toyota Camry", "2018 Ford F-150", "2021 Chevy Equinox"];
  const musicOptions = ["Upbeat Holiday", "Acoustic Warm", "Chill Lo-Fi", "Inspiring Piano", "Focus Beats"];

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

  const handleSubmit = () => {
    onRegenerate({
      script,
      vehicle: selectedVehicle,
      avatar: selectedAvatar,
      music: selectedMusic,
      template: selectedTemplate,
    });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Edit & Regenerate</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Script */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Script</label>
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="Enter a new script direction, or leave blank to regenerate automatically..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>

          {/* Template */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {templateOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Vehicle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No vehicle (educational)</option>
              {vehicleOptions.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Avatar</label>
            <select
              value={selectedAvatar}
              onChange={(e) => setSelectedAvatar(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {avatarOptions.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Music */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Music</label>
            <select
              value={selectedMusic}
              onChange={(e) => setSelectedMusic(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {musicOptions.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Warning about video usage */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              Regenerations use your monthly video allocation
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Regenerate
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Simple dropdown with 2 buttons
function VideoActionsDropdown({
  video,
  onOpenRegenerate,
  onRemove,
}: {
  video: Video;
  onOpenRegenerate: () => void;
  onRemove: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-white border border-gray-200 rounded-lg shadow-lg p-1">
            <button
              onClick={() => {
                onOpenRegenerate();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded text-left text-sm hover:bg-gray-50 text-gray-700"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </button>
            <button
              onClick={() => {
                onRemove();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded text-left text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Remove from publish
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Video Thumbnail Card
function VideoThumbnail({
  video,
  onPlay,
  onRegenerate,
  onRemove,
}: {
  video: Video;
  onPlay: () => void;
  onRegenerate: (updates: Record<string, string>) => void;
  onRemove: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [showRegenModal, setShowRegenModal] = useState(false);

  if (video.removed) {
    return (
      <div className="relative aspect-[9/16] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center p-3">
          <Trash2 className="w-6 h-6 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-500">Removed</p>
          <button
            onClick={onRemove}
            className="text-xs text-blue-600 hover:underline mt-1"
          >
            Undo
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-1">
        {/* Thumbnail */}
        <div
          className="relative aspect-[9/16] bg-gray-900 rounded-lg overflow-hidden cursor-pointer group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={onPlay}
        >
          {/* Thumbnail image - using video poster or first frame */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${video.thumbnail})`,
            }}
          />

          {/* Hover overlay with play button */}
          <div
            className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
              <Play className="w-5 h-5 text-gray-900 ml-0.5" fill="currentColor" />
            </div>
          </div>

          {/* Template badge */}
          <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
            {video.template}
          </div>
        </div>

        {/* Video info */}
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-900 truncate">{video.theme}</p>
            <p className="text-[10px] text-gray-500 truncate">{video.avatar} • {video.music}</p>
          </div>
          <VideoActionsDropdown
            video={video}
            onOpenRegenerate={() => setShowRegenModal(true)}
            onRemove={onRemove}
          />
        </div>
      </div>

      <RegenerateModal
        video={video}
        isOpen={showRegenModal}
        onClose={() => setShowRegenModal(false)}
        onRegenerate={onRegenerate}
      />
    </>
  );
}

// Platform Section with Video Grid
function PlatformSection({
  platform,
  videos,
  onPlayVideo,
  onRegenerate,
  onRemove,
}: {
  platform: Platform;
  videos: Video[];
  onPlayVideo: (video: Video) => void;
  onRegenerate: (videoId: string, updates: Record<string, string>) => void;
  onRemove: (videoId: string) => void;
}) {
  const config = platformConfig[platform];
  const activeVideos = videos.filter((v) => !v.removed);

  return (
    <div className="space-y-2">
      {/* Platform header */}
      <div className="flex items-center gap-2">
        <div className={`w-5 h-5 rounded flex items-center justify-center ${config.bgColor}`}>
          <config.Icon className={`w-3 h-3 ${config.iconColor}`} />
        </div>
        <span className="text-sm font-medium text-gray-900">{config.name}</span>
        <span className="text-xs text-gray-500">({activeVideos.length} video{activeVideos.length !== 1 ? "s" : ""})</span>
      </div>

      {/* Video grid */}
      <div className="grid grid-cols-3 gap-2">
        {videos.map((video) => (
          <VideoThumbnail
            key={video.id}
            video={video}
            onPlay={() => onPlayVideo(video)}
            onRegenerate={(updates) => onRegenerate(video.id, updates)}
            onRemove={() => onRemove(video.id)}
          />
        ))}
      </div>
    </div>
  );
}

export function VideoReadyWidget({
  videos: initialVideos = demoVideos,
  publishDate = "Dec 2, 2024",
  onPublish,
  onRemove,
  onRegenerate,
}: VideoReadyWidgetProps) {
  const [videos, setVideos] = useState(initialVideos);
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  // Group videos by platform
  const platformOrder: Platform[] = ["tiktok", "facebook", "instagram", "youtube"];
  const videosByPlatform = platformOrder.reduce((acc, platform) => {
    const platformVideos = videos.filter((v) => v.platform === platform);
    if (platformVideos.length > 0) {
      acc[platform] = platformVideos;
    }
    return acc;
  }, {} as Record<Platform, Video[]>);

  const platformsWithVideos = Object.keys(videosByPlatform) as Platform[];
  const activeVideos = videos.filter((v) => !v.removed);
  const totalActive = activeVideos.length;

  const handleRemove = (videoId: string) => {
    setVideos((prev) =>
      prev.map((v) =>
        v.id === videoId ? { ...v, removed: !v.removed } : v
      )
    );
    onRemove?.(videoId);
  };

  const handleRegenerate = (videoId: string, updates: Record<string, string>) => {
    console.log("Regenerating video:", videoId, "with updates:", updates);
    // Note: parent component should handle the actual regeneration
    // For now just log the updates - onRegenerate signature would need updating in props
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    onPublish?.(activeVideos);
    setIsPublishing(false);
    setPublished(true);
  };

  return (
    <>
      <Card className="w-full max-w-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            Videos Ready!
          </CardTitle>
          <WhatsThis className="mt-1">
            <p className="mb-2"><strong>Review your videos:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Click any thumbnail to preview</li>
              <li>Use the dropdown to regenerate parts</li>
              <li>Remove videos you don&apos;t want to publish</li>
            </ul>
          </WhatsThis>
          <p className="text-xs text-gray-500 mt-2">
            {totalActive} video{totalActive !== 1 ? "s" : ""} ready to publish
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {published ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Videos Scheduled!
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {totalActive} videos will be published Monday, Dec 16 at 9:00 AM
              </p>
              <div className="flex justify-center gap-2">
                {platformsWithVideos.map((platform) => {
                  const config = platformConfig[platform];
                  const count = videosByPlatform[platform].filter((v) => !v.removed).length;
                  if (count === 0) return null;
                  return (
                    <div key={platform} className="flex items-center gap-1">
                      <div className={`w-6 h-6 rounded flex items-center justify-center ${config.bgColor}`}>
                        <config.Icon className={`w-3.5 h-3.5 ${config.iconColor}`} />
                      </div>
                      <span className="text-xs text-gray-600">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              {/* Platform sections with video grids */}
              <div className="space-y-4">
                {platformsWithVideos.map((platform) => (
                  <PlatformSection
                    key={platform}
                    platform={platform}
                    videos={videosByPlatform[platform]}
                    onPlayVideo={setPreviewVideo}
                    onRegenerate={handleRegenerate}
                    onRemove={handleRemove}
                  />
                ))}
              </div>

              {/* Schedule info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-700">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Scheduled to publish Monday, Dec 16 at 9:00 AM</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  You can make changes until then in this chat portal.
                </p>
              </div>

              {/* Video usage tracker */}
              <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                <span>12 of 40 videos used this month</span>
                <button className="text-blue-600 hover:underline">Upgrade plan</button>
              </div>

              {/* Ready to Publish button */}
              <Button
                className="w-full"
                onClick={handlePublish}
                disabled={totalActive === 0 || isPublishing}
              >
                {isPublishing ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Ready to Publish ({totalActive})
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Video Preview Modal */}
      <VideoPreviewModal
        video={previewVideo}
        onClose={() => setPreviewVideo(null)}
      />
    </>
  );
}
