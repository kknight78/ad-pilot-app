"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Upload,
  RefreshCw,
  Check,
  X,
  AlertCircle,
  Loader2,
  AlertTriangle,
  Play,
} from "lucide-react";
import { WhatsThis } from "@/components/ui/whats-this";

// Reference photo URL for the example
const REFERENCE_PHOTO_URL = "https://res.cloudinary.com/dtpqxuwby/image/upload/v1765747325/profile-to-match_nirsvu.png";

interface ExistingStyle {
  id: string;
  name: string;
  thumbnail: string;
}

interface AvatarPhotoCaptureV2Props {
  onCapture?: (imageData: string, avatarName: string) => void;
  onUpload?: (file: File, avatarName: string) => void;
  onPreviewGenerated?: (previewUrl: string) => void;
  presenterName?: string;
  avatarGenerationsRemaining?: number;
  existingStyles?: ExistingStyle[];
}


// Demo existing styles
const demoExistingStyles: ExistingStyle[] = [
  { id: "1", name: "Default", thumbnail: "https://res.cloudinary.com/dtpqxuwby/image/upload/v1763688792/avatar-default.jpg" },
  { id: "2", name: "Winter", thumbnail: "https://res.cloudinary.com/dtpqxuwby/image/upload/v1763688792/avatar-winter.jpg" },
  { id: "3", name: "Colts", thumbnail: "https://res.cloudinary.com/dtpqxuwby/image/upload/v1763688792/avatar-colts.jpg" },
];

export function AvatarPhotoCaptureV2({
  onCapture,
  onUpload,
  onPreviewGenerated,
  presenterName = "Shad",
  avatarGenerationsRemaining = 5,
  existingStyles = demoExistingStyles,
}: AvatarPhotoCaptureV2Props) {
  // Modes: gallery -> select -> camera -> preview -> generating -> video_preview -> confirmed
  const [mode, setMode] = useState<"gallery" | "select" | "camera" | "preview" | "generating" | "video_preview" | "confirmed">(
    existingStyles.length > 0 ? "gallery" : "select"
  );
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Pre-fill with presenter name + " - " (user adds style name after)
  const [styleSuffix, setStyleSuffix] = useState("");
  const avatarName = styleSuffix ? `${presenterName} - ${styleSuffix}` : "";

  // Video preview state
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  // Ghost overlay fade state
  const [showGhostPhoto, setShowGhostPhoto] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ghostFadeTimerRef = useRef<number | null>(null);

  // Start camera
  const startCamera = useCallback(async () => {
    setError(null);
    setShowGhostPhoto(true);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      setStream(mediaStream);
      setMode("camera");

      // Fade out ghost photo after 2 seconds, leaving just the outline
      ghostFadeTimerRef.current = window.setTimeout(() => {
        setShowGhostPhoto(false);
      }, 2000);

    } catch (err) {
      console.error("Camera error:", err);
      setError("Could not access camera. Please check permissions or try uploading instead.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (ghostFadeTimerRef.current) {
      window.clearTimeout(ghostFadeTimerRef.current);
      ghostFadeTimerRef.current = null;
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        // Mirror the image to match what user sees
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg", 0.9);
        setCapturedImage(imageData);
        stopCamera();
        setMode("preview");
      }
    }
  }, [stopCamera]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("Image must be less than 10MB");
        return;
      }

      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
        setMode("preview");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setUploadedFile(null);
    setPreviewVideoUrl(null);
    setMode("select");
    setShowGhostPhoto(true);
  };

  // Generate preview video via HeyGen API
  const handlePreviewAvatar = async () => {
    if (!styleSuffix.trim()) {
      setError("Please enter a style name");
      return;
    }
    setError(null);
    setMode("generating");

    try {
      // Simulate HeyGen API call
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // For demo, use a placeholder video URL
      // In production, this would call the HeyGen API
      const demoVideoUrl = "https://res.cloudinary.com/dtpqxuwby/video/upload/v1763688792/facebook_2025-11-20_test.mp4";
      setPreviewVideoUrl(demoVideoUrl);
      setMode("video_preview");
      onPreviewGenerated?.(demoVideoUrl);

    } catch (err) {
      console.error("Preview generation error:", err);
      setError("Failed to generate preview. Please try again.");
      setMode("preview");
    }
  };

  // Try again - discard preview and return to capture
  const handleTryAgain = () => {
    setPreviewVideoUrl(null);
    setCapturedImage(null);
    setMode("select");
    setShowGhostPhoto(true);
  };

  // Save the avatar style
  const handleSaveStyle = async () => {
    setIsSubmitting(true);

    try {
      // Simulate saving to HeyGen
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (uploadedFile) {
        onUpload?.(uploadedFile, avatarName);
      } else if (capturedImage) {
        onCapture?.(capturedImage, avatarName);
      }

      setMode("confirmed");
    } catch (err) {
      setError("Failed to save style. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Assign stream to video element
  useEffect(() => {
    if (mode === "camera" && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [mode, stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (ghostFadeTimerRef.current) {
        window.clearTimeout(ghostFadeTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Camera className="w-5 h-5 text-purple-600" />
          Add Video Avatar
        </CardTitle>
        <WhatsThis>
          Add a new look for your video avatar. Upload a photo and we&apos;ll
          create a preview video so you can see how it looks.
        </WhatsThis>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Confirmed state */}
        {mode === "confirmed" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Style Saved!
            </h3>
            <p className="text-gray-600">
              &quot;{avatarName}&quot; has been added to {presenterName}&apos;s avatar styles. You can now select it when creating videos.
            </p>
          </div>
        )}

        {/* Video Preview mode - after HeyGen generates preview */}
        {mode === "video_preview" && previewVideoUrl && (
          <div className="space-y-4">
            <div className="relative aspect-[9/16] max-h-[50vh] bg-black rounded-xl overflow-hidden mx-auto" style={{ maxWidth: "280px" }}>
              <video
                src={previewVideoUrl}
                autoPlay
                loop
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleTryAgain}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Try Again
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleSaveStyle}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Save This Avatar
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Generating state */}
        {mode === "generating" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Generating Preview
            </h3>
            <p className="text-gray-500 text-sm">
              Creating a quick video preview of your new style...
            </p>
            <p className="text-xs text-gray-400 mt-4">
              This usually takes 15-30 seconds
            </p>
          </div>
        )}

        {/* Non-confirmed states */}
        {mode !== "confirmed" && mode !== "generating" && mode !== "video_preview" && (
          <>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Gallery mode - show existing styles */}
            {mode === "gallery" && existingStyles.length > 0 && (
              <div className="space-y-4">
                {/* Existing styles */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Your Styles ({existingStyles.length})
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {existingStyles.map((style) => (
                      <div key={style.id} className="text-center">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={style.thumbnail}
                            alt={style.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback for missing images
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gray-200"><span class="text-2xl">👤</span></div>`;
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 truncate">{style.name}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add new style button */}
                <Button
                  className="w-full"
                  onClick={() => setMode("select")}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Add New Style
                </Button>
              </div>
            )}

            {/* Selection mode */}
            {mode === "select" && (
              <div className="space-y-4">
                {/* Style Name Input - pre-filled with presenter name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Style Name
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm text-gray-600 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
                      {presenterName} -
                    </span>
                    <input
                      type="text"
                      value={styleSuffix}
                      onChange={(e) => {
                        // Limit to 20 characters
                        if (e.target.value.length <= 20) {
                          setStyleSuffix(e.target.value);
                        }
                      }}
                      maxLength={20}
                      placeholder="Winter, Casual, etc."
                      className="flex-1 border border-gray-300 rounded-r-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">20 characters max</p>
                </div>

                {/* Example photo showing correct framing - full height visible */}
                <div className="relative bg-gray-100 rounded-xl overflow-hidden">
                  {/* Overlay text at TOP */}
                  <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 via-black/30 to-transparent pt-4 pb-8 text-center">
                    <p className="text-white text-sm font-medium">Your photo should look like this</p>
                    <p className="text-white/80 text-xs mt-1">Head to belt, arms at sides</p>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={REFERENCE_PHOTO_URL}
                    alt="Example framing"
                    className="w-full h-auto opacity-80"
                  />
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-14 flex gap-2"
                    onClick={startCamera}
                  >
                    <Camera className="w-5 h-5" />
                    <span className="text-sm">Use Camera</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-14 flex gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-5 h-5" />
                    <span className="text-sm">Upload Photo</span>
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <p className="text-xs text-gray-400 text-center">
                  Photos used only for AI avatar training.
                </p>
              </div>
            )}

            {/* Camera mode */}
            {mode === "camera" && (
              <div className="space-y-4">
                {/* Portrait aspect ratio - always 9:16 like final videos */}
                <div className="relative aspect-[3/4] bg-black rounded-xl overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />

                  {/* Ghost photo overlay - fades after 2 seconds, leaving outline */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Ghost image of Shad - fades out after 2 seconds */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={REFERENCE_PHOTO_URL}
                      alt=""
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                        showGhostPhoto ? "opacity-30" : "opacity-0"
                      }`}
                      style={{ mixBlendMode: "screen" }}
                    />

                    {/* Thick outline tracing Shad's profile - always visible */}
                    <svg
                      className="absolute inset-0 w-full h-full"
                      viewBox="0 0 300 400"
                      preserveAspectRatio="xMidYMid slice"
                    >
                      {/* Body outline traced from reference photo - head, shoulders, arms, torso */}
                      <path
                        d="M 150,45
                           C 115,45 100,70 100,100
                           C 100,130 118,155 130,165
                           L 130,175
                           C 130,182 122,188 110,195
                           L 50,215
                           C 38,220 32,235 32,255
                           L 32,360
                           L 65,365
                           L 72,280
                           L 85,275
                           L 85,365
                           L 215,365
                           L 215,275
                           L 228,280
                           L 235,365
                           L 268,360
                           L 268,255
                           C 268,235 262,220 250,215
                           L 190,195
                           C 178,188 170,182 170,175
                           L 170,165
                           C 182,155 200,130 200,100
                           C 200,70 185,45 150,45 Z"
                        fill="none"
                        stroke="rgba(255,255,255,0.85)"
                        strokeWidth="3.5"
                        strokeLinejoin="round"
                      />
                      {/* Corner indicators */}
                      <g stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="none">
                        <path d="M 15,15 L 15,45 M 15,15 L 45,15" />
                        <path d="M 285,15 L 285,45 M 285,15 L 255,15" />
                        <path d="M 15,385 L 15,355 M 15,385 L 45,385" />
                        <path d="M 285,385 L 285,355 M 285,385 L 255,385" />
                      </g>
                    </svg>

                    {/* Instruction message at bottom */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-600/90 text-white text-sm px-4 py-2 rounded-full flex items-center gap-2 whitespace-nowrap">
                      Fit yourself inside the outline
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => { stopCamera(); setMode("select"); }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={capturePhoto}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Capture Photo
                  </Button>
                </div>
              </div>
            )}

            {/* Preview mode - after photo capture */}
            {mode === "preview" && capturedImage && (
              <div className="space-y-4">
                {/* Style Name Input - pre-filled with presenter name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Style Name
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm text-gray-600 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
                      {presenterName} -
                    </span>
                    <input
                      type="text"
                      value={styleSuffix}
                      onChange={(e) => {
                        // Limit to 20 characters
                        if (e.target.value.length <= 20) {
                          setStyleSuffix(e.target.value);
                        }
                      }}
                      maxLength={20}
                      placeholder="Winter, Casual, etc."
                      className="flex-1 border border-gray-300 rounded-r-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">20 characters max</p>
                </div>

                <div className="relative aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={capturedImage}
                    alt="Captured photo"
                    className="w-full h-full object-cover"
                  />

                  {/* Success badge */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                    <Check className="w-3.5 h-3.5" />
                    Photo captured
                  </div>
                </div>

                {/* Ready to preview section */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium text-gray-900">Ready to preview?</p>
                  <p className="text-sm text-gray-600">
                    We&apos;ll generate a quick video so you can see how it looks.
                  </p>
                </div>

                {/* Avatar generation warning */}
                <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>Uses 1 avatar generation ({avatarGenerationsRemaining} remaining)</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleRetake}>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Retake
                  </Button>
                  <Button className="flex-1" onClick={handlePreviewAvatar}>
                    <Play className="w-4 h-4 mr-2" />
                    Preview Avatar
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
}
