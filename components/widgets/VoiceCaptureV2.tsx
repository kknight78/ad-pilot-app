"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Check,
  AlertCircle,
  Loader2,
  Mic,
  Square,
  Play,
  Volume2,
  Settings,
} from "lucide-react";
import { WhatsThis } from "@/components/ui/whats-this";

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

// Sample scripts for preview testing
const PREVIEW_SCRIPTS = [
  "Looking for a great deal? Come see us!",
  "This 2024 Honda CR-V is perfect for families.",
  "Happy holidays from Capitol Car Credit!",
  "Got questions? Just ask for Shad!",
];

const MIN_RECORDING_SECONDS = 30;
const MAX_RECORDING_SECONDS = 60;

type PermissionState = "prompt" | "granted" | "denied" | "checking";

export function VoiceCaptureV2({
  onCapture,
  onSkip,
  presenterName = "Shad",
  businessName = "Capitol Car Credit",
  clientId = "CCC",
}: VoiceCaptureV2Props) {
  const [mode, setMode] = useState<"permission" | "ready" | "recording" | "complete" | "cloning" | "preview" | "confirmed">("permission");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [permissionState, setPermissionState] = useState<PermissionState>("checking");

  // Audio waveform state
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(20).fill(0));

  // ElevenLabs voice clone state
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [cloningProgress, setCloningProgress] = useState<string>("Uploading audio...");

  // Preview state
  const [previewText, setPreviewText] = useState("");
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [currentPlayingScript, setCurrentPlayingScript] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const previewPlayerRef = useRef<HTMLAudioElement | null>(null);
  const stopRecordingRef = useRef<() => void>(() => {});
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Generate script with business name and presenter name
  const voiceScript = DEFAULT_VOICE_SCRIPT
    .replace(/Capitol Car Credit/g, businessName)
    .replace(/Shad/g, presenterName);

  // Personalize preview scripts
  const personalizedPreviewScripts = PREVIEW_SCRIPTS.map(script =>
    script.replace(/Shad/g, presenterName).replace(/Capitol Car Credit/g, businessName)
  );

  // Check microphone permission on mount
  useEffect(() => {
    checkMicPermission();
  }, []);

  const checkMicPermission = async () => {
    setPermissionState("checking");

    try {
      if (navigator.permissions) {
        const result = await navigator.permissions.query({ name: "microphone" as PermissionName });
        setPermissionState(result.state as PermissionState);

        result.onchange = () => {
          setPermissionState(result.state as PermissionState);
        };

        if (result.state === "granted") {
          setMode("ready");
        }
      } else {
        setPermissionState("prompt");
      }
    } catch (err) {
      setPermissionState("prompt");
    }
  };

  const requestMicPermission = async () => {
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionState("granted");
      setMode("ready");
    } catch (err: any) {
      console.error("Microphone permission error:", err);

      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setPermissionState("denied");
        setError("Microphone access was denied. Please enable it in your browser settings.");
      } else if (err.name === "NotFoundError") {
        setError("No microphone found. Please connect a microphone.");
      } else {
        setError("Could not access microphone. Please try again.");
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

          const levels: number[] = [];
          const step = Math.floor(dataArray.length / 20);
          for (let i = 0; i < 20; i++) {
            const value = dataArray[i * step] || 0;
            levels.push(value / 255);
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
      streamRef.current = stream;

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
        setMode("complete");
        stream.getTracks().forEach(track => track.stop());
        stopAudioVisualization();
      };

      mediaRecorder.start();
      setMode("recording");
      setRecordingSeconds(0);

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
      setMode("ready");

      if (err.name === "NotAllowedError") {
        setPermissionState("denied");
        setError("Microphone access was denied. Please enable it in your browser settings.");
      } else {
        setError("Could not access microphone. Please try again.");
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

  stopRecordingRef.current = stopRecording;

  const handleTryAgain = () => {
    setAudioBlob(null);
    setRecordingSeconds(0);
    setMode("ready");
  };

  // Create voice clone
  const handleCreateVoiceClone = async () => {
    if (!audioBlob) return;

    if (recordingSeconds < MIN_RECORDING_SECONDS) {
      setError(`Recording too short. Please record at least ${MIN_RECORDING_SECONDS} seconds.`);
      return;
    }

    setError(null);
    setMode("cloning");
    setCloningProgress("Uploading audio...");

    try {
      const formData = new FormData();
      formData.append("name", `${presenterName} - ${clientId}`);
      formData.append("files", audioBlob, "voice-recording.webm");
      formData.append("remove_background_noise", "true");

      setCloningProgress("Creating voice clone...");

      const cloneResponse = await fetch(N8N_VOICE_CLONE_URL, {
        method: "POST",
        body: formData,
      });

      const cloneData = await cloneResponse.json();

      if (!cloneData.success || !cloneData.voice_id) {
        throw new Error(cloneData.error || "Failed to create voice clone");
      }

      setVoiceId(cloneData.voice_id);
      setMode("preview");

    } catch (err) {
      console.error("Voice clone error:", err);
      setError(err instanceof Error ? err.message : "Failed to create voice clone. Please try again.");
      setMode("complete");
    }
  };

  // Generate and play preview for a script
  const playPreviewScript = async (script: string) => {
    if (!voiceId || isGeneratingPreview) return;

    setIsGeneratingPreview(true);
    setCurrentPlayingScript(script);

    try {
      const previewResponse = await fetch(N8N_VOICE_PREVIEW_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voice_id: voiceId,
          text: script,
        }),
      });

      if (!previewResponse.ok) {
        throw new Error("Failed to generate preview");
      }

      const previewBlob = await previewResponse.blob();
      const previewUrl = URL.createObjectURL(previewBlob);

      if (previewPlayerRef.current) {
        previewPlayerRef.current.src = previewUrl;
        previewPlayerRef.current.play();
        setIsPlayingPreview(true);
      }

    } catch (err) {
      console.error("Preview error:", err);
      setError("Failed to generate preview. Please try again.");
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  // Generate custom preview
  const handleGenerateCustomPreview = () => {
    if (previewText.trim()) {
      playPreviewScript(previewText.trim());
    }
  };

  const handleFinalSubmit = async () => {
    if (!audioBlob) return;

    setIsSubmitting(true);
    onCapture?.(audioBlob, voiceId || undefined);
    setIsSubmitting(false);
    setMode("confirmed");
  };

  const handleRedoFromBeginning = () => {
    setVoiceId(null);
    setAudioBlob(null);
    setRecordingSeconds(0);
    setPreviewText("");
    setMode("ready");
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
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      stopAudioVisualization();
    };
  }, []);

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
        <CardTitle className="text-lg flex items-center gap-2">
          <Mic className="w-5 h-5 text-purple-600" />
          Record Your Voice
        </CardTitle>
        <WhatsThis>
          Record your voice once and we&apos;ll create an AI clone.
          This voice will be used for all your video avatars.
        </WhatsThis>
        <p className="text-sm text-gray-500 mt-1">
          Create a voice clone for {presenterName}
        </p>
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
                <Button onClick={checkMicPermission} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
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
              </>
            )}
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

        {/* Preview screen - test scripts */}
        {mode === "preview" && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Voice Clone Ready!
              </h3>
              <p className="text-sm text-gray-600">
                Tap a script below to hear your voice
              </p>
            </div>

            {/* Sample scripts */}
            <div className="space-y-2">
              {personalizedPreviewScripts.map((script, index) => (
                <button
                  key={index}
                  onClick={() => playPreviewScript(script)}
                  disabled={isGeneratingPreview}
                  className={`w-full text-left p-3 rounded-lg border transition-colors flex items-center gap-3 ${
                    currentPlayingScript === script && isPlayingPreview
                      ? "border-purple-300 bg-purple-50"
                      : "border-gray-200 hover:border-purple-200 hover:bg-gray-50"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    currentPlayingScript === script && isGeneratingPreview
                      ? "bg-purple-100"
                      : currentPlayingScript === script && isPlayingPreview
                      ? "bg-purple-500"
                      : "bg-gray-100"
                  }`}>
                    {currentPlayingScript === script && isGeneratingPreview ? (
                      <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                    ) : currentPlayingScript === script && isPlayingPreview ? (
                      <Volume2 className="w-4 h-4 text-white" />
                    ) : (
                      <Play className="w-4 h-4 text-gray-500 ml-0.5" />
                    )}
                  </div>
                  <span className="text-sm text-gray-700">&quot;{script}&quot;</span>
                </button>
              ))}
            </div>

            {/* Custom text input */}
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Or type your own:</p>
              <textarea
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                placeholder="Type anything to hear it in your voice..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                rows={2}
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGenerateCustomPreview}
                disabled={!previewText.trim() || isGeneratingPreview}
              >
                {isGeneratingPreview ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                Generate Preview
              </Button>
            </div>

            {/* Hidden audio player */}
            <audio
              ref={previewPlayerRef}
              onEnded={() => {
                setIsPlayingPreview(false);
                setCurrentPlayingScript(null);
              }}
            />

            {/* Action buttons */}
            <div className="pt-2 space-y-2">
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
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
                    I&apos;m Happy, Save This Voice
                  </>
                )}
              </Button>
              <button
                onClick={handleRedoFromBeginning}
                className="w-full text-sm text-gray-500 hover:text-gray-700 py-2"
              >
                <RefreshCw className="w-3 h-3 inline mr-1" />
                Redo From Beginning
              </button>
            </div>
          </div>
        )}

        {/* Ready state - show tips, timer, button, then script */}
        {mode === "ready" && (
          <>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Tips */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-medium text-gray-700 mb-2">Tips for best results:</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  Find a quiet space with minimal background noise
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  Position yourself 6-12 inches from your mic
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  Speak naturally, like you&apos;re talking to a customer
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  Read at a steady, conversational pace
                </li>
              </ul>
            </div>

            {/* Timer display */}
            <div className="text-center py-4">
              <div className="text-3xl font-mono text-gray-400 mb-1">0:00</div>
              <p className="text-xs text-gray-500">Ready to record (min {MIN_RECORDING_SECONDS}s)</p>
            </div>

            {/* Record button */}
            <Button className="w-full h-12 bg-red-500 hover:bg-red-600" onClick={startRecording}>
              <Mic className="w-5 h-5 mr-2" />
              Start Recording
            </Button>

            {/* Script to read */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-2">Read this script aloud:</p>
              <p className="text-sm text-gray-700 leading-relaxed">&quot;{voiceScript}&quot;</p>
            </div>

            {/* Skip button */}
            {onSkip && (
              <button
                onClick={onSkip}
                className="w-full text-sm text-gray-400 hover:text-gray-600 py-2"
              >
                Skip for now
              </button>
            )}
          </>
        )}

        {/* Recording state */}
        {mode === "recording" && (
          <>
            {/* Timer with pulsing indicator */}
            <div className="text-center py-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-3xl font-mono text-gray-900">{formatTime(recordingSeconds)}</span>
                <span className="text-sm text-red-500 font-medium">Recording...</span>
              </div>

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
            </div>

            {/* Script to read */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-2">Read this script aloud:</p>
              <p className="text-sm text-gray-700 leading-relaxed">&quot;{voiceScript}&quot;</p>
            </div>

            {/* Stop button */}
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">
                {recordingSeconds < MIN_RECORDING_SECONDS
                  ? `Keep going... (min ${MIN_RECORDING_SECONDS}s)`
                  : "Great! You can stop now."}
              </p>
              <Button
                className="w-full h-12 bg-gray-800 hover:bg-gray-900"
                onClick={stopRecording}
                disabled={recordingSeconds < MIN_RECORDING_SECONDS}
              >
                <Square className="w-5 h-5 mr-2" />
                {recordingSeconds < MIN_RECORDING_SECONDS
                  ? `Stop Recording (${MIN_RECORDING_SECONDS - recordingSeconds}s left)`
                  : "Stop Recording"}
              </Button>
            </div>
          </>
        )}

        {/* Recording complete - gate before API call */}
        {mode === "complete" && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              Recording Complete!
            </h3>
            <p className="text-2xl font-mono text-gray-700 mb-6">{formatTime(recordingSeconds)}</p>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 mb-4 text-left">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button
              className="w-full h-12 bg-purple-600 hover:bg-purple-700"
              onClick={handleCreateVoiceClone}
            >
              <Volume2 className="w-5 h-5 mr-2" />
              Create Voice Clone
            </Button>

            <button
              onClick={handleTryAgain}
              className="w-full text-sm text-gray-500 hover:text-gray-700 py-3 mt-2"
            >
              <RefreshCw className="w-3 h-3 inline mr-1" />
              Try Again
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
