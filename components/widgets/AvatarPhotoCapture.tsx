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
  User,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface AvatarPhotoCaptureProps {
  onCapture?: (imageData: string, avatarName: string) => void;
  onUpload?: (file: File, avatarName: string) => void;
  presenterName?: string;
}

export function AvatarPhotoCapture({
  onCapture,
  onUpload,
  presenterName = "Shad",
}: AvatarPhotoCaptureProps) {
  const [mode, setMode] = useState<"select" | "camera" | "preview" | "confirmed">("select");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarName, setAvatarName] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      setStream(mediaStream);
      setMode("camera");
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
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
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
    setMode("select");
  };

  const handleSubmit = async () => {
    if (!avatarName.trim()) {
      setError("Please enter an avatar name");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (uploadedFile) {
      onUpload?.(uploadedFile, avatarName);
    } else if (capturedImage) {
      onCapture?.(capturedImage, avatarName);
    }

    setIsSubmitting(false);
    setMode("confirmed");
  };

  // Assign stream to video element when both are available
  useEffect(() => {
    if (mode === "camera" && stream) {
      const timer = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [mode, stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Add Avatar Photo</CardTitle>
            <p className="text-sm text-gray-500">
              New look for {presenterName}
            </p>
          </div>
          <div className="p-2 bg-purple-100 rounded-lg shrink-0">
            <Camera className="w-5 h-5 text-purple-600" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Confirmation state */}
        {mode === "confirmed" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Photo Uploaded!
            </h3>
            <p className="text-gray-600">
              We&apos;re training your new avatar now. &quot;{avatarName}&quot; should be available in your avatar selector within 24 hours — we&apos;ll notify you when it&apos;s ready!
            </p>
          </div>
        )}

        {/* Non-confirmed states */}
        {mode !== "confirmed" && (
          <>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Selection mode */}
            {mode === "select" && (
              <div className="space-y-4">
                {/* Avatar Name Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Avatar Name
                  </label>
                  <input
                    type="text"
                    value={avatarName}
                    onChange={(e) => setAvatarName(e.target.value)}
                    placeholder="e.g., Winter Shad, Casual Gary"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                {/* Preview placeholder with guide */}
                <div className="relative aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div className="text-center">
                      <div className="w-28 h-36 md:w-32 md:h-40 mx-auto border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center mb-2">
                        <User className="w-12 h-12 md:w-16 md:h-16 text-gray-300" />
                        <p className="text-xs text-gray-400 mt-1 px-2">Position guide</p>
                      </div>
                      <p className="text-sm text-gray-500">Shoulders up, centered</p>
                      <p className="text-xs text-gray-400">Plain background preferred</p>
                    </div>
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
                <div className="relative aspect-[4/3] bg-black rounded-xl overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    onLoadedMetadata={(e) => {
                      (e.target as HTMLVideoElement).play().catch(console.error);
                    }}
                    className="w-full h-full object-cover"
                  />

                  {/* Guide overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-52 border-2 border-white/50 rounded-xl" />
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                      Align your face in the box
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-2">
                  <Button variant="outline" onClick={() => { stopCamera(); setMode("select"); }} className="w-full md:w-auto">
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                  <Button className="w-full md:flex-1" onClick={capturePhoto}>
                    <Camera className="w-4 h-4 mr-2" />
                    Capture Photo
                  </Button>
                </div>
              </div>
            )}

            {/* Preview mode */}
            {mode === "preview" && capturedImage && (
              <div className="space-y-4">
                {/* Avatar Name Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Avatar Name
                  </label>
                  <input
                    type="text"
                    value={avatarName}
                    onChange={(e) => setAvatarName(e.target.value)}
                    placeholder="e.g., Winter Shad, Casual Gary"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div className="relative aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={capturedImage}
                    alt="Captured photo"
                    className="w-full h-full object-cover"
                  />

                  {/* Success overlay */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Photo captured
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleRetake}>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Retake
                  </Button>
                  <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Avatar...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Create Avatar
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-gray-400 text-center">
                  Photos used only for AI avatar training.
                </p>
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
