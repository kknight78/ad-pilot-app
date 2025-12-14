"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Check,
  X,
  AlertCircle,
  Loader2,
  Mic,
  Square,
  Play,
  Pause,
  FileAudio,
  Volume2,
  Settings,
} from "lucide-react";

// n8n webhook endpoints
const N8N_VOICE_CLONE_URL = "https://ad-pilot-n8n-production.up.railway.app/webhook/voice/clone";
const N8N_VOICE_PREVIEW_URL = "https://ad-pilot-n8n-production.up.railway.app/webhook/voice/preview";

interface VoiceCaptureV2Props {
  onCapture?: (audioBlob: Blob, voiceId?: string) => void;
  onSkip?: () => void;
  presenterName?: string;
  businessName?: string;
  clientId?: string;
}

// Longer voice recording script (~45-60 seconds for quality clone)
const DEFAULT_VOICE_SCRIPT = `Welcome to Capitol Car Credit, where we treat you like family. Right now we've got incredible deals on sedans, SUVs, and trucks. Whether you're looking for a reliable daily driver or something with a little more power, we've got you covered.

Stop by today and ask for Shad — mention you saw us online and we'll take care of you. That's Capitol Car Credit in Rantoul. See you soon!`;

const MIN_RECORDING_SECONDS = 20;
const MAX_RECORDING_SECONDS = 60;

type PermissionState = "prompt" | "granted" | "denied" | "checking";

export function VoiceCaptureV2({
  onCapture,
  onSkip,
  presenterName = "Shad",
  businessName = "Capitol Car Credit",
  clientId = "CCC",
}: VoiceCaptureV2Props) {
  const [mode, setMode] = useState<"permission" | "record" | "cloning" | "preview" | "confirmed">("permission");
  const [voiceMode, setVoiceMode] = useState<"idle" | "recording" | "review">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [permissionState, setPermissionState] = useState<PermissionState>("checking");

  // Audio waveform state
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(20).fill(0));

  // ElevenLabs voice clone state
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [cloningProgress, setCloningProgress] = useState<string>("Uploading audio...");

  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const previewPlayerRef = useRef<HTMLAudioElement | null>(null);
  const stopRecordingRef = useRef<() => void>(() => {});
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Generate script with business name and presenter name
  const voiceScript = DEFAULT_VOICE_SCRIPT
    .replace(/Capitol Car Credit/g, businessName)
    .replace(/Shad/g, presenterName);

  // Check microphone permission on mount
  useEffect(() => {
    checkMicPermission();
  }, []);

  const checkMicPermission = async () => {
    setPermissionState("checking");

    try {
      // Check if permissions API is available
      if (navigator.permissions) {
        const result = await navigator.permissions.query({ name: "microphone" as PermissionName });
        setPermissionState(result.state as PermissionState);

        // Listen for permission changes
        result.onchange = () => {
          setPermissionState(result.state as PermissionState);
        };

        if (result.state === "granted") {
          setMode("record");
        }
      } else {
        // Permissions API not available, try to detect via getUserMedia
        setPermissionState("prompt");
      }
    } catch (err) {
      // Permissions query failed, default to prompt
      setPermissionState("prompt");
    }
  };

  const requestMicPermission = async () => {
    setError(null);

    try {
      // Request permission by getting user media briefly
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionState("granted");
      setMode("record");
    } catch (err: any) {
      console.error("Microphone permission error:", err);

      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setPermissionState("denied");
        setError("Microphone access was denied. Please enable it in your browser settings.");
      } else if (err.name === "NotFoundError") {
        setError("No microphone found. Please connect a microphone or use the upload option.");
      } else {
        setError("Could not access microphone. Please try again or upload an audio file.");
      }
    }
  };

  // Audio visualization
  const startAudioVisualization = (stream: MediaStream) => {
    try {
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyzerRef.current = audioContextRef.current.createAnalyser();
      analyzerRef.current.fftSize = 64;
      source.connect(analyzerRef.current);

      const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);

      const updateLevels = () => {
        if (analyzerRef.current) {
          analyzerRef.current.getByteFrequencyData(dataArray);

          // Sample 20 points from the frequency data
          const levels: number[] = [];
          const step = Math.floor(dataArray.length / 20);
          for (let i = 0; i < 20; i++) {
            const value = dataArray[i * step] || 0;
            levels.push(value / 255); // Normalize to 0-1
          }
          setAudioLevels(levels);
        }

        animationFrameRef.current = requestAnimationFrame(updateLevels);
      };

      updateLevels();
    } catch (err) {
      console.log("Audio visualization not available:", err);
    }
  };

  const stopAudioVisualization = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setAudioLevels(new Array(20).fill(0));
  };

  // Voice recording functions
  const startRecording = useCallback(async () => {
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start audio visualization
      startAudioVisualization(stream);

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
        // Stop the stream tracks
        stream.getTracks().forEach(track => track.stop());
        stopAudioVisualization();
      };

      mediaRecorder.start();
      setVoiceMode("recording");
      setRecordingSeconds(0);

      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => {
          const next = prev + 1;
          if (next >= MAX_RECORDING_SECONDS) {
            stopRecordingRef.current();
          }
          return next;
        });
      }, 1000);

    } catch (err: any) {
      console.error("Microphone error:", err);
      setVoiceMode("idle");

      if (err.name === "NotAllowedError") {
        setPermissionState("denied");
        setError("Microphone access was denied. Please enable it in your browser settings, or upload an audio file instead.");
      } else {
        setError("Could not access microphone. Please try again or upload an audio file.");
      }
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }

    stopAudioVisualization();
  }, []);

  // Keep ref in sync
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
      setRecordingSeconds(0);
      setMode("record");
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

  // Upload audio to ElevenLabs and create voice clone
  const handleUseRecording = async () => {
    if (!audioBlob) return;

    // Check recording length
    if (recordingSeconds > 0 && recordingSeconds < MIN_RECORDING_SECONDS) {
      setError(`Recording too short. Please read the full script (minimum ${MIN_RECORDING_SECONDS} seconds).`);
      return;
    }

    setError(null);
    setMode("cloning");
    setCloningProgress("Uploading audio...");

    try {
      // Create FormData for the audio file
      const formData = new FormData();
      formData.append("name", `${presenterName} - ${clientId}`);
      formData.append("files", audioBlob, "voice-recording.webm");
      formData.append("remove_background_noise", "true");

      setCloningProgress("Creating voice clone...");

      // Upload to ElevenLabs via n8n webhook
      const cloneResponse = await fetch(N8N_VOICE_CLONE_URL, {
        method: "POST",
        body: formData,
      });

      const cloneData = await cloneResponse.json();

      if (!cloneData.success || !cloneData.voice_id) {
        throw new Error(cloneData.error || "Failed to create voice clone");
      }

      setVoiceId(cloneData.voice_id);
      setCloningProgress("Generating preview...");

      // Generate a preview with the new voice
      const previewText = `Hey, it's ${presenterName} from ${businessName}. Your AI voice clone is ready to go!`;

      const previewResponse = await fetch(N8N_VOICE_PREVIEW_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voice_id: cloneData.voice_id,
          text: previewText,
        }),
      });

      if (!previewResponse.ok) {
        throw new Error("Failed to generate voice preview");
      }

      // Get the audio blob from the response
      const previewBlob = await previewResponse.blob();
      const previewUrl = URL.createObjectURL(previewBlob);
      setPreviewAudioUrl(previewUrl);
      setMode("preview");

    } catch (err) {
      console.error("Voice clone error:", err);
      setError(err instanceof Error ? err.message : "Failed to create voice clone. Please try again.");
      setMode("record");
      setVoiceMode("review");
    }
  };

  const togglePreviewPlayback = () => {
    if (!previewPlayerRef.current || !previewAudioUrl) return;

    if (isPlayingPreview) {
      previewPlayerRef.current.pause();
    } else {
      previewPlayerRef.current.play();
    }
    setIsPlayingPreview(!isPlayingPreview);
  };

  const handleFinalSubmit = async () => {
    if (!audioBlob) return;

    setIsSubmitting(true);
    onCapture?.(audioBlob, voiceId || undefined);
    setIsSubmitting(false);
    setMode("confirmed");
  };

  const handleRejectPreview = () => {
    if (previewAudioUrl) {
      URL.revokeObjectURL(previewAudioUrl);
      setPreviewAudioUrl(null);
    }
    setVoiceId(null);
    setMode("record");
    setVoiceMode("review");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (previewAudioUrl) {
        URL.revokeObjectURL(previewAudioUrl);
      }
      stopAudioVisualization();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get browser-specific settings instructions
  const getSettingsInstructions = () => {
    const ua = navigator.userAgent;
    if (ua.includes("Chrome")) {
      return "Click the lock icon in your address bar, then enable Microphone.";
    } else if (ua.includes("Safari")) {
      return "Go to Safari > Settings > Websites > Microphone and allow this site.";
    } else if (ua.includes("Firefox")) {
      return "Click the shield icon in your address bar, then allow Microphone.";
    }
    return "Check your browser settings to enable microphone access for this site.";
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Record Your Voice</CardTitle>
            <p className="text-sm text-gray-500">
              Create a voice clone for {presenterName}
            </p>
          </div>
          <div className="p-2 bg-purple-100 rounded-lg shrink-0">
            <Mic className="w-5 h-5 text-purple-600" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Permission request screen */}
        {mode === "permission" && (
          <div className="text-center py-6">
            {permissionState === "checking" ? (
              <>
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Checking microphone access...</p>
              </>
            ) : permissionState === "denied" ? (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mic className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Microphone Access Blocked
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {getSettingsInstructions()}
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <Settings className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-amber-800 text-left">
                      After enabling the microphone, refresh this page or click the button below.
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button onClick={checkMicPermission} className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => audioFileInputRef.current?.click()}
                  >
                    <FileAudio className="w-4 h-4 mr-2" />
                    Upload Audio File Instead
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mic className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Microphone Access Needed
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  To record your voice, click &quot;Allow&quot; when your browser asks for microphone access.
                </p>
                <Button onClick={requestMicPermission} className="w-full">
                  <Mic className="w-4 h-4 mr-2" />
                  Enable Microphone
                </Button>
                <p className="text-xs text-gray-400 mt-3">
                  Or{" "}
                  <button
                    onClick={() => audioFileInputRef.current?.click()}
                    className="text-purple-600 hover:underline"
                  >
                    upload an audio file
                  </button>{" "}
                  instead
                </p>
              </>
            )}

            <input
              ref={audioFileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleAudioFileSelect}
              className="hidden"
            />
          </div>
        )}

        {/* Confirmed state */}
        {mode === "confirmed" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Voice Clone Saved!
            </h3>
            <p className="text-gray-600">
              Your AI voice clone is ready and will be used for all your avatar videos.
            </p>
          </div>
        )}

        {/* Cloning in progress */}
        {mode === "cloning" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Creating Your Voice Clone
            </h3>
            <p className="text-gray-600">
              {cloningProgress}
            </p>
            <p className="text-xs text-gray-400 mt-4">
              This usually takes 10-30 seconds...
            </p>
          </div>
        )}

        {/* Preview screen - listen to the AI voice */}
        {mode === "preview" && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Volume2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Great! Listen back:
            </h3>
            <p className="text-gray-600 mb-4">
              Here&apos;s a preview of your voice clone. Does it sound like you?
            </p>

            {/* Preview player */}
            <div className="bg-gray-100 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={togglePreviewPlayback}
                  className="w-12 h-12 bg-purple-500 hover:bg-purple-600 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  {isPlayingPreview ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                </button>
                <span className="text-sm text-gray-600">
                  {isPlayingPreview ? "Playing preview..." : "Tap to play"}
                </span>
              </div>
              <audio
                ref={previewPlayerRef}
                src={previewAudioUrl || undefined}
                onEnded={() => setIsPlayingPreview(false)}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRejectPreview}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Try Again
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleFinalSubmit}
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
                    Sounds Good!
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Recording mode */}
        {mode === "record" && (
          <>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Script to read */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-2">Read this script aloud:</p>
              <p className="text-sm text-gray-700 leading-relaxed">&quot;{voiceScript}&quot;</p>
            </div>

            {/* Tips - device agnostic */}
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
              {voiceMode === "idle" && (
                <div className="text-center py-4">
                  <div className="text-2xl font-mono text-gray-400 mb-2">0:00</div>
                  <p className="text-xs text-gray-500">Ready to record (min {MIN_RECORDING_SECONDS}s)</p>
                </div>
              )}

              {voiceMode === "recording" && (
                <div className="text-center py-4">
                  {/* Audio waveform visualization */}
                  <div className="flex items-center justify-center gap-0.5 h-12 mb-2">
                    {audioLevels.map((level, i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-red-500 rounded-full transition-all duration-75"
                        style={{
                          height: `${Math.max(4, level * 48)}px`,
                        }}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-2xl font-mono text-gray-900">{formatTime(recordingSeconds)}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {recordingSeconds < MIN_RECORDING_SECONDS
                      ? `Keep going... (min ${MIN_RECORDING_SECONDS}s)`
                      : `Recording... (max ${MAX_RECORDING_SECONDS}s)`}
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
                  <audio
                    ref={audioPlayerRef}
                    src={audioUrl || undefined}
                    onEnded={() => setIsPlaying(false)}
                    onLoadedMetadata={(e) => {
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
                <Button className="w-full h-12 bg-red-500 hover:bg-red-600" onClick={startRecording}>
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
                className="w-full h-12 bg-gray-800 hover:bg-gray-900"
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
                  Try Again
                </Button>
                <Button className="flex-1" onClick={handleUseRecording}>
                  <Check className="w-4 h-4 mr-2" />
                  Sounds Good!
                </Button>
              </div>
            )}

            {/* Skip button */}
            {onSkip && voiceMode !== "recording" && (
              <Button
                variant="ghost"
                className="w-full text-gray-500"
                onClick={onSkip}
              >
                <X className="w-4 h-4 mr-1" />
                Skip for now
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
