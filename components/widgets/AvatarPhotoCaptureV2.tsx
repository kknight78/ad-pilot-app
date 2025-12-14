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
import * as faceapi from "face-api.js";

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

// Face detection states
type FaceStatus =
  | "loading_model"
  | "initializing"
  | "no_face"
  | "multiple_faces"
  | "too_small"
  | "too_large"
  | "off_center"
  | "perfect"
  | "manual"; // Manual mode when detection unavailable

interface FaceGuideConfig {
  borderColor: string;
  bgColor: string;
  message: string;
  icon: "warning" | "error" | "success" | "info" | "loading";
}

const faceStatusConfig: Record<FaceStatus, FaceGuideConfig> = {
  loading_model: {
    borderColor: "border-white/50",
    bgColor: "bg-purple-600/80",
    message: "Loading face detection...",
    icon: "loading",
  },
  initializing: {
    borderColor: "border-white/50",
    bgColor: "bg-gray-700/80",
    message: "Initializing camera...",
    icon: "info",
  },
  manual: {
    borderColor: "border-white/50",
    bgColor: "bg-blue-600/80",
    message: "Position your face in the guide, then capture",
    icon: "info",
  },
  no_face: {
    borderColor: "border-red-400",
    bgColor: "bg-red-500/90",
    message: "We can't see your face - get in the frame",
    icon: "error",
  },
  multiple_faces: {
    borderColor: "border-red-400",
    bgColor: "bg-red-500/90",
    message: "We see more than one person - just you!",
    icon: "error",
  },
  too_small: {
    borderColor: "border-amber-400",
    bgColor: "bg-amber-500/90",
    message: "Move a little closer",
    icon: "warning",
  },
  too_large: {
    borderColor: "border-amber-400",
    bgColor: "bg-amber-500/90",
    message: "Back up just a bit",
    icon: "warning",
  },
  off_center: {
    borderColor: "border-amber-400",
    bgColor: "bg-amber-500/90",
    message: "Center your face in the guide",
    icon: "warning",
  },
  perfect: {
    borderColor: "border-green-400",
    bgColor: "bg-green-500/90",
    message: "Perfect! Hold still...",
    icon: "success",
  },
};

// Demo existing styles
const demoExistingStyles: ExistingStyle[] = [
  { id: "1", name: "Default", thumbnail: "https://res.cloudinary.com/dtpqxuwby/image/upload/v1763688792/avatar-default.jpg" },
  { id: "2", name: "Winter", thumbnail: "https://res.cloudinary.com/dtpqxuwby/image/upload/v1763688792/avatar-winter.jpg" },
  { id: "3", name: "Colts", thumbnail: "https://res.cloudinary.com/dtpqxuwby/image/upload/v1763688792/avatar-colts.jpg" },
];

// Track if models are loaded globally to avoid reloading
let modelsLoaded = false;

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

  // Face detection state
  const [faceStatus, setFaceStatus] = useState<FaceStatus>("initializing");
  const [perfectHoldTime, setPerfectHoldTime] = useState(0);
  const [faceDetectionReady, setFaceDetectionReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const detectionIntervalRef = useRef<number | null>(null);
  const perfectTimerRef = useRef<number | null>(null);
  const captureTriggeredRef = useRef(false);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      if (modelsLoaded) {
        setFaceDetectionReady(true);
        return;
      }

      try {
        // Load the tiny face detector model (smallest and fastest)
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        modelsLoaded = true;
        setFaceDetectionReady(true);
        console.log("Face detection models loaded successfully");
      } catch (err) {
        console.error("Failed to load face detection models:", err);
        // Fall back to manual mode if models fail to load
        setFaceDetectionReady(false);
      }
    };

    loadModels();
  }, []);

  // Run face detection on video frame using face-api.js
  const detectFaces = useCallback(async () => {
    if (!videoRef.current || !faceDetectionReady) {
      return;
    }

    const video = videoRef.current;
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      return;
    }

    try {
      // Detect faces using tiny face detector (fast)
      const detections = await faceapi.detectAllFaces(
        video,
        new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
      );

      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      // Guide zone - roughly center area where face should be
      const guideLeft = videoWidth * 0.25;
      const guideRight = videoWidth * 0.75;
      const guideTop = videoHeight * 0.05;
      const guideBottom = videoHeight * 0.6;
      const guideWidth = guideRight - guideLeft;
      const guideHeight = guideBottom - guideTop;
      const guideArea = guideWidth * guideHeight;

      if (detections.length === 0) {
        setFaceStatus("no_face");
        return;
      }

      if (detections.length > 1) {
        setFaceStatus("multiple_faces");
        return;
      }

      const face = detections[0];
      const box = face.box;
      const faceCenterX = box.x + box.width / 2;
      const faceCenterY = box.y + box.height / 2;
      const faceArea = box.width * box.height;

      const sizeRatio = faceArea / guideArea;

      // Check if face is too small (needs to move closer)
      if (sizeRatio < 0.15) {
        setFaceStatus("too_small");
        return;
      }

      // Check if face is too large (needs to back up)
      if (sizeRatio > 0.8) {
        setFaceStatus("too_large");
        return;
      }

      // Check if face is centered
      const guideCenterX = (guideLeft + guideRight) / 2;
      const guideCenterY = (guideTop + guideBottom) / 2;
      const xOffset = Math.abs(faceCenterX - guideCenterX) / guideWidth;
      const yOffset = Math.abs(faceCenterY - guideCenterY) / guideHeight;

      if (xOffset > 0.35 || yOffset > 0.4) {
        setFaceStatus("off_center");
        return;
      }

      // All checks passed!
      setFaceStatus("perfect");

    } catch (err) {
      console.error("Face detection error:", err);
      // Don't change status on error, keep last known state
    }
  }, [faceDetectionReady]);

  // Start camera
  const startCamera = useCallback(async () => {
    setError(null);
    setFaceStatus(faceDetectionReady ? "loading_model" : "manual");
    setPerfectHoldTime(0);
    captureTriggeredRef.current = false;

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      setStream(mediaStream);
      setMode("camera");

      // Wait a bit for video to initialize
      setTimeout(() => {
        if (faceDetectionReady) {
          setFaceStatus("initializing");
          // Start detection loop - run every 200ms for smooth feedback
          detectionIntervalRef.current = window.setInterval(() => {
            detectFaces();
          }, 200);
        } else {
          // Manual mode - no auto-capture
          setFaceStatus("manual");
        }
      }, 500);

    } catch (err) {
      console.error("Camera error:", err);
      setError("Could not access camera. Please check permissions or try uploading instead.");
    }
  }, [faceDetectionReady, detectFaces]);

  // Track time in "perfect" state for auto-capture
  useEffect(() => {
    if (faceStatus === "perfect" && mode === "camera" && faceDetectionReady && !captureTriggeredRef.current) {
      perfectTimerRef.current = window.setInterval(() => {
        setPerfectHoldTime((prev) => {
          const next = prev + 100;
          // Auto-capture at 2 seconds
          if (next >= 2000 && !captureTriggeredRef.current) {
            captureTriggeredRef.current = true;
            // Use setTimeout to avoid state update during render
            setTimeout(() => capturePhoto(), 0);
          }
          return next;
        });
      }, 100);

      return () => {
        if (perfectTimerRef.current) {
          window.clearInterval(perfectTimerRef.current);
          perfectTimerRef.current = null;
        }
      };
    } else {
      // Reset timer when not perfect
      if (perfectTimerRef.current) {
        window.clearInterval(perfectTimerRef.current);
        perfectTimerRef.current = null;
      }
      if (faceStatus !== "perfect") {
        setPerfectHoldTime(0);
      }
    }
  }, [faceStatus, mode, faceDetectionReady]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (detectionIntervalRef.current) {
      window.clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    if (perfectTimerRef.current) {
      window.clearInterval(perfectTimerRef.current);
      perfectTimerRef.current = null;
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
    setPerfectHoldTime(0);
    captureTriggeredRef.current = false;
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
    captureTriggeredRef.current = false;
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
      if (detectionIntervalRef.current) {
        window.clearInterval(detectionIntervalRef.current);
      }
      if (perfectTimerRef.current) {
        window.clearInterval(perfectTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusConfig = faceStatusConfig[faceStatus];
  // In manual mode, always allow capture. In detection mode, only when perfect
  const canCapture = faceStatus === "manual" || faceStatus === "perfect";

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
        <p className="text-sm text-gray-500 mt-1">
          New look for {presenterName}
        </p>
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={REFERENCE_PHOTO_URL}
                    alt="Example framing"
                    className="w-full h-auto opacity-80"
                  />
                  {/* Overlay text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                    <p className="text-white text-sm font-medium">Your photo should look like this</p>
                    <p className="text-white/80 text-xs mt-1">Head to belt, arms at sides</p>
                  </div>
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

                  {/* Silhouette overlay - traced from reference photo */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Simple dashed outline matching reference photo framing */}
                    <svg
                      className="absolute inset-0 w-full h-full"
                      viewBox="0 0 300 400"
                      preserveAspectRatio="xMidYMid slice"
                    >
                      {/* Outer edge silhouette traced from reference photo */}
                      {/* Head at ~15% from top, shoulders wide, arms at sides, bottom at belt */}
                      <path
                        d="M 150,55
                           C 120,55 110,75 110,100
                           C 110,125 125,145 135,155
                           L 135,165
                           C 135,170 130,175 120,180
                           L 55,195
                           C 45,198 40,210 40,225
                           L 40,340
                           L 70,345
                           L 75,265
                           L 85,260
                           L 85,345
                           L 215,345
                           L 215,260
                           L 225,265
                           L 230,345
                           L 260,340
                           L 260,225
                           C 260,210 255,198 245,195
                           L 180,180
                           C 170,175 165,170 165,165
                           L 165,155
                           C 175,145 190,125 190,100
                           C 190,75 180,55 150,55 Z"
                        fill="none"
                        stroke="rgba(255,255,255,0.8)"
                        strokeWidth="2"
                        strokeDasharray="8,4"
                      />
                      {/* Corner indicators showing frame boundaries */}
                      <g stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none">
                        {/* Top left */}
                        <path d="M 25,25 L 25,50 M 25,25 L 50,25" />
                        {/* Top right */}
                        <path d="M 275,25 L 275,50 M 275,25 L 250,25" />
                        {/* Bottom left */}
                        <path d="M 25,375 L 25,350 M 25,375 L 50,375" />
                        {/* Bottom right */}
                        <path d="M 275,375 L 275,350 M 275,375 L 250,375" />
                      </g>
                    </svg>

                    {/* Status message at bottom */}
                    <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 ${statusConfig.bgColor} text-white text-sm px-4 py-2 rounded-full flex items-center gap-2 whitespace-nowrap`}>
                      {statusConfig.icon === "loading" && <Loader2 className="w-4 h-4 shrink-0 animate-spin" />}
                      {statusConfig.icon === "error" && <AlertCircle className="w-4 h-4 shrink-0" />}
                      {statusConfig.icon === "warning" && <AlertTriangle className="w-4 h-4 shrink-0" />}
                      {statusConfig.icon === "success" && <Check className="w-4 h-4 shrink-0" />}
                      {statusConfig.message}
                    </div>

                    {/* Progress ring for auto-capture (only when face detection works) */}
                    {faceStatus === "perfect" && perfectHoldTime > 0 && faceDetectionReady && (
                      <div className="absolute top-4 right-4">
                        <div className="relative w-12 h-12">
                          <svg className="w-12 h-12 transform -rotate-90">
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              fill="none"
                              stroke="rgba(255,255,255,0.3)"
                              strokeWidth="4"
                            />
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              fill="none"
                              stroke="#22c55e"
                              strokeWidth="4"
                              strokeDasharray={`${(perfectHoldTime / 2000) * 125.6} 125.6`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold">
                            {Math.ceil((2000 - perfectHoldTime) / 1000)}
                          </span>
                        </div>
                      </div>
                    )}
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
                    disabled={!canCapture && faceDetectionReady === true}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {canCapture || !faceDetectionReady ? "Capture Photo" : "Position Your Face"}
                  </Button>
                </div>

                {faceDetectionReady && faceStatus !== "manual" && (
                  <p className="text-xs text-gray-400 text-center">
                    Photo will auto-capture when perfectly positioned
                  </p>
                )}
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
