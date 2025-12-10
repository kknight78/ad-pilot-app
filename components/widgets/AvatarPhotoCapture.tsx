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
  Mic,
  Square,
  Play,
  Pause,
  FileAudio,
} from "lucide-react";

interface AvatarPhotoCaptureProps {
  onCapture?: (imageData: string, avatarName: string, audioBlob?: Blob) => void;
  onUpload?: (file: File, avatarName: string, audioBlob?: Blob) => void;
  presenterName?: string;
  businessName?: string;
  hasExistingVoice?: boolean;
}

// Default voice recording script (~60-70 seconds at natural pace)
const DEFAULT_VOICE_SCRIPT = `Welcome to Capitol Car Credit, where we treat you like family. Right now we've got incredible deals on sedans, SUVs, and trucks. Whether you're looking for a reliable daily driver or something with a little more power, we've got you covered.

What makes us different? We work with everyone — good credit, bad credit, no credit, we'll find a way to get you driving. Our team takes the time to understand your situation and find the right vehicle at the right price.

Stop by today and ask for Shad — mention you saw us online and we'll take care of you. That's Capitol Car Credit in Rantoul. See you soon!`;

const MIN_RECORDING_SECONDS = 30;
const MAX_RECORDING_SECONDS = 120;

export function AvatarPhotoCapture({
  onCapture,
  onUpload,
  presenterName = "Shad",
  businessName = "Capitol Car Credit",
  hasExistingVoice = false,
}: AvatarPhotoCaptureProps) {
  const [mode, setMode] = useState<"select" | "camera" | "upload" | "preview" | "voice" | "voice_choice" | "voice_success" | "confirmed">("select");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarName, setAvatarName] = useState("");

  // Voice recording state
  const [voiceMode, setVoiceMode] = useState<"idle" | "permission" | "recording" | "review">("idle");
  const [micPermission, setMicPermission] = useState<"unknown" | "granted" | "denied" | "prompt">("unknown");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const stopRecordingRef = useRef<() => void>(() => {});

  // Generate script with business name
  const voiceScript = DEFAULT_VOICE_SCRIPT.replace(/Capitol Car Credit/g, businessName);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      setStream(mediaStream);
      setMode("camera");
      // Note: stream will be assigned to video element via useEffect below
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

  // Proceed from photo to voice step
  const handlePhotoConfirm = () => {
    if (!avatarName.trim()) {
      setError("Please enter an avatar name");
      return;
    }
    setError(null);

    // If user has existing voice, show choice screen
    if (hasExistingVoice) {
      setMode("voice_choice");
    } else {
      // No existing voice, go directly to voice recording
      setMode("voice");
    }
  };

  // Check microphone permission status
  const checkMicPermission = useCallback(async () => {
    try {
      // Check if permissions API is available
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setMicPermission(result.state as "granted" | "denied" | "prompt");
        return result.state;
      }
      // Fallback: assume prompt is needed
      return "prompt";
    } catch {
      // Some browsers don't support querying microphone permission
      return "prompt";
    }
  }, []);

  // Request microphone permission
  const requestMicPermission = useCallback(async () => {
    setError(null);
    setVoiceMode("permission");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Permission granted - stop the test stream
      stream.getTracks().forEach(track => track.stop());
      setMicPermission("granted");
      setVoiceMode("idle");
      return true;
    } catch (err) {
      console.error("Microphone permission error:", err);
      setMicPermission("denied");
      setError("Microphone access was denied. Please enable microphone access in your browser settings, or use the 'Upload Audio File' option instead.");
      setVoiceMode("idle");
      return false;
    }
  }, []);

  // Voice recording functions
  const startRecording = useCallback(async () => {
    setError(null);

    // Check permission first
    if (micPermission !== "granted") {
      const granted = await requestMicPermission();
      if (!granted) return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setVoiceMode("review");
      };

      mediaRecorder.start();
      setVoiceMode("recording");
      setRecordingSeconds(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          const next = prev + 1;
          // Auto-stop at max
          if (next >= MAX_RECORDING_SECONDS) {
            stopRecordingRef.current();
          }
          return next;
        });
      }, 1000);

    } catch (err) {
      console.error("Microphone error:", err);
      setMicPermission("denied");
      setError("Microphone access is required to record your voice. Please allow microphone access in your browser settings, or use the 'Upload Audio File' option instead.");
    }
  }, [micPermission, requestMicPermission]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }

    // Use functional update to get current stream state and clean it up
    setAudioStream((currentStream) => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
      return null;
    });
  }, []);

  // Keep ref in sync with latest stopRecording function
  stopRecordingRef.current = stopRecording;

  const handleReRecord = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingSeconds(0);
    setVoiceMode("idle");
    setIsPlaying(false);
  };

  const handleAudioFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/mp3', 'audio/x-m4a', 'audio/mp4'];
      if (!validTypes.some(t => file.type.includes(t.split('/')[1]))) {
        setError("Please select an audio file (MP3, WAV, M4A, or WebM)");
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        setError("Audio file must be less than 25MB");
        return;
      }

      setAudioBlob(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setVoiceMode("review");
      setRecordingSeconds(0); // Will show file duration when played
    }
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current || !audioUrl) return;

    if (isPlaying) {
      audioPlayerRef.current.pause();
    } else {
      audioPlayerRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Final submit with voice
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (uploadedFile) {
      onUpload?.(uploadedFile, avatarName, audioBlob || undefined);
    } else if (capturedImage) {
      onCapture?.(capturedImage, avatarName, audioBlob || undefined);
    }
    setIsSubmitting(false);
    setMode("confirmed");
  };

  // Skip voice and use existing
  const handleUseExistingVoice = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (uploadedFile) {
      onUpload?.(uploadedFile, avatarName);
    } else if (capturedImage) {
      onCapture?.(capturedImage, avatarName);
    }
    setIsSubmitting(false);
    setMode("confirmed");
  };

  // Format seconds as M:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setCapturedImage(null);
    setUploadedFile(null);
    setAvatarName("");
    setError(null);
    setMode("select");
    // Reset voice state
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setVoiceMode("idle");
    setRecordingSeconds(0);
    setIsPlaying(false);
  };

  // Check mic permission when entering voice mode
  useEffect(() => {
    if (mode === "voice" && micPermission === "unknown") {
      checkMicPermission();
    }
  }, [mode, micPermission, checkMicPermission]);

  // Assign stream to video element when both are available
  useEffect(() => {
    if (mode === "camera" && stream) {
      // Small delay to ensure DOM is ready
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
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [stream, audioStream, audioUrl]);

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
              {audioBlob ? "Photo & Voice Uploaded!" : "Photo Uploaded!"}
            </h3>
            <p className="text-gray-600">
              {audioBlob
                ? `We're training your new avatar and voice clone now. "${avatarName}" should be available within 24 hours — we'll notify you when it's ready!`
                : `We're training your new avatar now. "${avatarName}" should be available in your avatar selector within 24 hours — we'll notify you when it's ready!`}
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
                      // Ensure video plays when metadata is loaded
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
                {/* Avatar Name Input - always show in preview if not filled from select mode */}
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
                  <Button className="flex-1" onClick={handlePhotoConfirm}>
                    <Mic className="w-4 h-4 mr-2" />
                    Next: Record Voice
                  </Button>
                </div>

                <p className="text-xs text-gray-400 text-center">
                  Photos used only for AI avatar training.
                </p>
              </div>
            )}

            {/* Voice choice mode - for users with existing voice */}
            {mode === "voice_choice" && (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mic className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Voice for {avatarName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    You already have a voice clone. Would you like to use it or record a new one?
                  </p>
                </div>

                <div className="space-y-2">
                  <Button
                    className="w-full h-12"
                    onClick={handleUseExistingVoice}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Avatar...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Use Existing Voice
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-12"
                    onClick={() => setMode("voice")}
                    disabled={isSubmitting}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Record New Voice
                  </Button>
                </div>
              </div>
            )}

            {/* Voice recording mode */}
            {mode === "voice" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-purple-100 rounded-lg">
                    <Mic className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Record Your Voice</h3>
                    <p className="text-xs text-gray-500">New voice for {avatarName}</p>
                  </div>
                </div>

                {/* Script to read */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-2">Read this script aloud:</p>
                  <p className="text-sm text-gray-700 leading-relaxed">&quot;{voiceScript}&quot;</p>
                </div>

                {/* Tips */}
                <div className="text-xs text-gray-500 space-y-1">
                  <p className="font-medium">Tips for best results:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-gray-400">
                    <li>Find a quiet space with minimal background noise</li>
                    <li>Position yourself 6-12 inches from your microphone</li>
                    <li>Speak naturally, like you&apos;re talking to a customer</li>
                    <li>Read at a steady, conversational pace</li>
                  </ul>
                </div>

                {/* Recording interface */}
                <div className="bg-gray-100 rounded-xl p-4">
                  {voiceMode === "permission" && (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Mic className="w-6 h-6 text-purple-600 animate-pulse" />
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Microphone Access Needed</p>
                      <p className="text-xs text-gray-500">Please allow microphone access when prompted by your browser</p>
                    </div>
                  )}

                  {voiceMode === "idle" && (
                    <div className="text-center py-4">
                      <div className="text-2xl font-mono text-gray-400 mb-2">0:00</div>
                      <p className="text-xs text-gray-500">Ready to record</p>
                    </div>
                  )}

                  {voiceMode === "recording" && (
                    <div className="text-center py-4">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-2xl font-mono text-gray-900">{formatTime(recordingSeconds)}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {recordingSeconds < MIN_RECORDING_SECONDS
                          ? `Keep going... (min ${MIN_RECORDING_SECONDS}s)`
                          : "Recording..."}
                      </p>
                    </div>
                  )}

                  {voiceMode === "review" && (
                    <div className="text-center py-4">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <button
                          onClick={togglePlayback}
                          className="w-10 h-10 bg-purple-500 hover:bg-purple-600 text-white rounded-full flex items-center justify-center transition-colors"
                        >
                          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                        </button>
                        <span className="text-2xl font-mono text-gray-900">{formatTime(recordingSeconds)}</span>
                      </div>
                      <p className="text-xs text-green-600 font-medium">Recording complete!</p>
                      {/* Hidden audio element for playback */}
                      <audio
                        ref={audioPlayerRef}
                        src={audioUrl || undefined}
                        onEnded={() => setIsPlaying(false)}
                        onTimeUpdate={(e) => {
                          const audio = e.target as HTMLAudioElement;
                          if (audio.duration && !isNaN(audio.duration)) {
                            setRecordingSeconds(Math.floor(audio.duration));
                          }
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Action buttons based on voice mode */}
                {voiceMode === "idle" && (
                  <div className="space-y-2">
                    <Button className="w-full h-12" onClick={startRecording}>
                      <Mic className="w-5 h-5 mr-2" />
                      Start Recording
                    </Button>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-white px-2 text-gray-400">OR</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full h-12"
                      onClick={() => audioFileInputRef.current?.click()}
                    >
                      <FileAudio className="w-5 h-5 mr-2" />
                      Upload Audio File
                    </Button>
                    <input
                      ref={audioFileInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioFileSelect}
                      className="hidden"
                    />
                  </div>
                )}

                {voiceMode === "recording" && (
                  <Button
                    className="w-full h-12 bg-red-500 hover:bg-red-600"
                    onClick={stopRecording}
                    disabled={recordingSeconds < MIN_RECORDING_SECONDS}
                  >
                    <Square className="w-5 h-5 mr-2" />
                    {recordingSeconds < MIN_RECORDING_SECONDS
                      ? `Recording... (${MIN_RECORDING_SECONDS - recordingSeconds}s left)`
                      : "Stop Recording"}
                  </Button>
                )}

                {voiceMode === "review" && (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleReRecord}>
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Re-record
                    </Button>
                    <Button className="flex-1" onClick={() => setMode("voice_success")}>
                      <Check className="w-4 h-4 mr-2" />
                      Use This Recording
                    </Button>
                  </div>
                )}

                {/* Back button */}
                <Button
                  variant="ghost"
                  className="w-full text-gray-500"
                  onClick={() => setMode("preview")}
                  disabled={voiceMode === "recording"}
                >
                  <X className="w-4 h-4 mr-1" />
                  Back to Photo
                </Button>
              </div>
            )}

            {/* Voice success screen */}
            {mode === "voice_success" && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Voice Captured!
                </h3>
                <p className="text-gray-600 mb-6">
                  Your AI voice clone will be ready in about 5 minutes.
                </p>
                <Button
                  className="w-full h-12"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Avatar...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Done
                    </>
                  )}
                </Button>
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
