"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  X,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Loader2,
  Pencil,
  Check,
} from "lucide-react";

// Types
type Platform = "tiktok" | "facebook" | "youtube" | "instagram";

interface VideoData {
  id: string;
  platform: Platform;
  themeTopic: string;
  template: string;
  vehicles?: number | string;
  avatar: string;
  avatarStyle?: string;
  length: string;
  music: string;
  script?: ScriptSegment[];
  assignedVehicles?: Vehicle[];
}

interface ScriptSegment {
  type: "hook" | "body" | "cta";
  content: string;
}

interface Vehicle {
  id: string;
  name: string;
  year: number;
  make: string;
  model: string;
}

interface AvatarOption {
  id: string;
  name: string;
  styles: { id: string; name: string }[];
}

interface EditVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoData | null;
  // Context determines behavior
  context: "edit" | "regenerate";
  // Callbacks
  onSave?: (video: VideoData) => void;
  onRegenerate?: (video: VideoData) => void;
  onRemove?: (videoId: string) => void;
  // Available options
  templates?: string[];
  avatars?: AvatarOption[];
  musicOptions?: string[];
  vehicleInventory?: Vehicle[];
  // Credit info
  creditsRemaining?: number;
}

// Demo data
const demoTemplates = ["Deep Dive", "Multi-Car", "Spotlight", "Capitol Smarts"];
const demoAvatars: AvatarOption[] = [
  {
    id: "shad",
    name: "Shad",
    styles: [
      { id: "default", name: "Default" },
      { id: "winter", name: "Winter" },
      { id: "colts", name: "Colts" },
    ],
  },
  {
    id: "lisa",
    name: "Lisa",
    styles: [
      { id: "default", name: "Default" },
      { id: "casual", name: "Casual" },
    ],
  },
];
const demoMusicOptions = [
  "Upbeat Holiday",
  "Festive Pop",
  "Chill Vibes",
  "Corporate Uplifting",
  "Energetic Rock",
];
const demoLengths = ["15s", "30s", "45s", "60s"];
const demoVehicleCounts = [1, 2, 3, 4, 5];
const demoVehicleInventory: Vehicle[] = [
  { id: "v1", name: "2023 Honda CR-V", year: 2023, make: "Honda", model: "CR-V" },
  { id: "v2", name: "2022 Toyota RAV4", year: 2022, make: "Toyota", model: "RAV4" },
  { id: "v3", name: "2024 Ford Explorer", year: 2024, make: "Ford", model: "Explorer" },
  { id: "v4", name: "2021 Chevrolet Equinox", year: 2021, make: "Chevrolet", model: "Equinox" },
  { id: "v5", name: "2023 Nissan Rogue", year: 2023, make: "Nissan", model: "Rogue" },
  { id: "v6", name: "2022 Jeep Grand Cherokee", year: 2022, make: "Jeep", model: "Grand Cherokee" },
];

const demoScript: ScriptSegment[] = [
  { type: "hook", content: "Ready to find your perfect ride?" },
  { type: "body", content: "Check out these amazing SUVs we've got on the lot right now. Each one's been inspected and is ready to roll." },
  { type: "cta", content: "Stop by Capitol Car Credit today and ask for Shad!" },
];

// Templates that require vehicle count
const multiVehicleTemplates = ["Multi-Car", "Deep Dive"];

// Platform config for header styling
const platformConfig: Record<Platform, { name: string; color: string }> = {
  tiktok: { name: "TikTok", color: "text-gray-900" },
  facebook: { name: "Facebook", color: "text-blue-600" },
  youtube: { name: "YouTube", color: "text-red-600" },
  instagram: { name: "Instagram", color: "text-pink-600" },
};

export function EditVideoModal({
  isOpen,
  onClose,
  video,
  context,
  onSave,
  onRegenerate,
  onRemove,
  templates = demoTemplates,
  avatars = demoAvatars,
  musicOptions = demoMusicOptions,
  vehicleInventory = demoVehicleInventory,
  creditsRemaining = 6,
}: EditVideoModalProps) {
  // Form state
  const [template, setTemplate] = useState("");
  const [vehicleCount, setVehicleCount] = useState<number>(1);
  const [themeTopic, setThemeTopic] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [length, setLength] = useState("");
  const [music, setMusic] = useState("");

  // Step state (for regenerate context)
  const [step, setStep] = useState<1 | 2>(1);

  // Track original values to detect changes
  const [originalValues, setOriginalValues] = useState<{
    template: string;
    vehicleCount: number;
    themeTopic: string;
    avatar: string;
    style: string;
    length: string;
    music: string;
  } | null>(null);

  // Step 2 state
  const [assignedVehicles, setAssignedVehicles] = useState<(string | null)[]>([]);
  const [script, setScript] = useState<ScriptSegment[]>([]);
  const [editingScriptIndex, setEditingScriptIndex] = useState<number | null>(null);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  // Dropdown states
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const [expandedAvatars, setExpandedAvatars] = useState<string[]>([]);

  // Initialize form when video changes
  useEffect(() => {
    if (video && isOpen) {
      setTemplate(video.template);
      setVehicleCount(typeof video.vehicles === "number" ? video.vehicles : 1);
      setThemeTopic(video.themeTopic);

      // Parse avatar and style from "Name - Style" format
      const avatarParts = video.avatar.split(" - ");
      setSelectedAvatar(avatarParts[0]?.toLowerCase() || "");
      setSelectedStyle(avatarParts[1]?.toLowerCase() || "default");

      setLength(video.length);
      setMusic(video.music);
      setStep(1);

      // Store original values
      setOriginalValues({
        template: video.template,
        vehicleCount: typeof video.vehicles === "number" ? video.vehicles : 1,
        themeTopic: video.themeTopic,
        avatar: avatarParts[0]?.toLowerCase() || "",
        style: avatarParts[1]?.toLowerCase() || "default",
        length: video.length,
        music: video.music,
      });

      // Initialize step 2 state
      setAssignedVehicles(
        video.assignedVehicles?.map((v) => v.id) ||
        Array(typeof video.vehicles === "number" ? video.vehicles : 1).fill(null)
      );
      setScript(video.script || demoScript);
    }
  }, [video, isOpen]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setAvatarDropdownOpen(false);
      setExpandedAvatars([]);
      setEditingScriptIndex(null);
    }
  }, [isOpen]);

  if (!isOpen || !video) return null;

  const platformInfo = platformConfig[video.platform];
  const showVehicleCount = multiVehicleTemplates.includes(template);

  // Check what changed for regenerate logic
  const hasTemplateChanged = originalValues && template !== originalValues.template;
  const hasVehicleCountChanged = originalValues && vehicleCount !== originalValues.vehicleCount;
  const hasThemeChanged = originalValues && themeTopic !== originalValues.themeTopic;
  const hasLengthChanged = originalValues && length !== originalValues.length;
  const hasAvatarPersonChanged = originalValues && selectedAvatar !== originalValues.avatar;

  // Script needs regeneration if template, theme, length, or avatar person changed
  const needsScriptRegen = hasTemplateChanged || hasThemeChanged || hasLengthChanged || hasAvatarPersonChanged;
  // Vehicles need re-selection if template or vehicle count changed
  const needsVehicleReselect = hasTemplateChanged || hasVehicleCountChanged;

  const handleAvatarSelect = (avatarId: string, styleId: string) => {
    setSelectedAvatar(avatarId);
    setSelectedStyle(styleId);
    setAvatarDropdownOpen(false);
  };

  const toggleAvatarExpand = (avatarId: string) => {
    setExpandedAvatars((prev) =>
      prev.includes(avatarId)
        ? prev.filter((id) => id !== avatarId)
        : [...prev, avatarId]
    );
  };

  const getAvatarDisplayName = () => {
    const avatar = avatars.find((a) => a.id === selectedAvatar);
    const style = avatar?.styles.find((s) => s.id === selectedStyle);
    if (avatar && style) {
      return `${avatar.name} - ${style.name}`;
    }
    return "Select avatar";
  };

  const handleSaveChanges = () => {
    const updatedVideo: VideoData = {
      ...video,
      template,
      vehicles: showVehicleCount ? vehicleCount : undefined,
      themeTopic,
      avatar: getAvatarDisplayName(),
      length,
      music,
    };
    onSave?.(updatedVideo);
    onClose();
  };

  const handleNextStep = () => {
    // Update vehicle slots if count changed
    if (vehicleCount !== assignedVehicles.length) {
      const newVehicles = Array(vehicleCount).fill(null);
      // Preserve existing selections where possible
      assignedVehicles.forEach((v, i) => {
        if (i < vehicleCount) newVehicles[i] = v;
      });
      setAssignedVehicles(newVehicles);
    }

    // Generate new script if needed
    if (needsScriptRegen) {
      setIsGeneratingScript(true);
      // Simulate script generation
      setTimeout(() => {
        setScript([
          { type: "hook", content: `Looking for the perfect ${themeTopic.toLowerCase()} deal?` },
          { type: "body", content: `We've got amazing options waiting for you at Capitol Car Credit. Come check out our selection and find exactly what you're looking for.` },
          { type: "cta", content: `Stop by today and ask for ${avatars.find(a => a.id === selectedAvatar)?.name || "us"}!` },
        ]);
        setIsGeneratingScript(false);
      }, 1500);
    }

    setStep(2);
  };

  const handleRegenScript = () => {
    setIsGeneratingScript(true);
    setTimeout(() => {
      setScript([
        { type: "hook", content: "Ready for an amazing deal?" },
        { type: "body", content: "Capitol Car Credit has the best selection in town. Whether you need a family SUV or a sporty sedan, we've got you covered with financing options for everyone." },
        { type: "cta", content: "Come see us today!" },
      ]);
      setIsGeneratingScript(false);
    }, 1500);
  };

  const handleVehicleSelect = (index: number, vehicleId: string) => {
    setAssignedVehicles((prev) => {
      const newVehicles = [...prev];
      newVehicles[index] = vehicleId;
      return newVehicles;
    });
  };

  const handleRegenerate = () => {
    const updatedVideo: VideoData = {
      ...video,
      template,
      vehicles: showVehicleCount ? vehicleCount : undefined,
      themeTopic,
      avatar: getAvatarDisplayName(),
      length,
      music,
      script,
      assignedVehicles: assignedVehicles
        .filter((id): id is string => id !== null)
        .map((id) => vehicleInventory.find((v) => v.id === id)!)
        .filter(Boolean),
    };
    onRegenerate?.(updatedVideo);
    onClose();
  };

  const handleRemove = () => {
    onRemove?.(video.id);
    onClose();
  };

  const handleScriptEdit = (index: number, content: string) => {
    setScript((prev) => {
      const newScript = [...prev];
      newScript[index] = { ...newScript[index], content };
      return newScript;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {context === "edit" ? "Edit Video" : "Regenerate Video"}
            </h2>
            <p className="text-sm text-gray-500">
              <span className={platformInfo.color}>{platformInfo.name}</span>
              {" — "}
              {video.themeTopic}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* STEP 1: Settings */}
          {step === 1 && (
            <>
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
                  {templates.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* # of Vehicles (conditional) */}
              {showVehicleCount && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    # of Vehicles
                  </label>
                  <select
                    value={vehicleCount}
                    onChange={(e) => setVehicleCount(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {demoVehicleCounts.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              )}

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
                  placeholder="Holiday Spirit, Winter Tires, etc."
                />
              </div>

              {/* Avatar (grouped dropdown) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avatar
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <span>{getAvatarDisplayName()}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${avatarDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {avatarDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {avatars.map((avatar) => (
                        <div key={avatar.id}>
                          {/* Avatar name (expandable) */}
                          <button
                            type="button"
                            onClick={() => toggleAvatarExpand(avatar.id)}
                            className="w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            {expandedAvatars.includes(avatar.id) ? (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                            {avatar.name}
                          </button>

                          {/* Styles (when expanded) */}
                          {expandedAvatars.includes(avatar.id) && (
                            <div className="pl-6">
                              {avatar.styles.map((style) => {
                                const isSelected = selectedAvatar === avatar.id && selectedStyle === style.id;
                                return (
                                  <button
                                    key={style.id}
                                    type="button"
                                    onClick={() => handleAvatarSelect(avatar.id, style.id)}
                                    className={`w-full px-3 py-2 text-sm text-left flex items-center justify-between hover:bg-gray-50 ${
                                      isSelected ? "bg-blue-50 text-blue-700" : "text-gray-600"
                                    }`}
                                  >
                                    <span>{style.name}</span>
                                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Length */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Length
                </label>
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {demoLengths.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Music */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Music
                </label>
                <select
                  value={music}
                  onChange={(e) => setMusic(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {musicOptions.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* STEP 2: Vehicles & Script (regenerate only) */}
          {step === 2 && context === "regenerate" && (
            <>
              {/* Vehicles */}
              {showVehicleCount && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicles for this ad
                  </label>
                  <div className="space-y-2">
                    {Array.from({ length: vehicleCount }).map((_, index) => (
                      <div key={index}>
                        <label className="block text-xs text-gray-500 mb-1">
                          Vehicle {index + 1}
                        </label>
                        <select
                          value={assignedVehicles[index] || ""}
                          onChange={(e) => handleVehicleSelect(index, e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select a vehicle</option>
                          {vehicleInventory.map((v) => (
                            <option key={v.id} value={v.id}>{v.name}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Script */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Script
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingScriptIndex(editingScriptIndex === null ? 0 : null)}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Pencil className="w-3 h-3" />
                      {editingScriptIndex !== null ? "Done" : "Edit Script"}
                    </button>
                    <button
                      onClick={handleRegenScript}
                      disabled={isGeneratingScript}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isGeneratingScript ? "animate-spin" : ""}`} />
                      Regen
                    </button>
                  </div>
                </div>

                {isGeneratingScript ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-sm text-gray-600">Generating script...</span>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg divide-y divide-gray-200">
                    {script.map((segment, index) => (
                      <div key={segment.type} className="p-3">
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                          {segment.type}
                        </p>
                        {editingScriptIndex !== null ? (
                          <textarea
                            value={segment.content}
                            onChange={(e) => handleScriptEdit(index, e.target.value)}
                            className="w-full text-sm text-gray-700 bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                          />
                        ) : (
                          <p className="text-sm text-gray-700">&quot;{segment.content}&quot;</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Credit warning */}
              <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  Regenerating uses 1 video credit
                  <br />
                  <span className="text-amber-600">(You have {creditsRemaining} remaining this month)</span>
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          {context === "edit" ? (
            // Simple edit context
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSaveChanges} className="flex-1">
                Save Changes
              </Button>
            </div>
          ) : step === 1 ? (
            // Regenerate context - Step 1
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleNextStep} className="flex-1">
                Save and Next
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          ) : (
            // Regenerate context - Step 2
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRemove}
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              </div>
              <Button onClick={handleRegenerate} className="w-full">
                Regenerate
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
