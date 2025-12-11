"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Check,
  Loader2,
  Volume2,
  RefreshCw,
  Sparkles,
  AlertCircle,
} from "lucide-react";

// n8n webhook endpoints
const N8N_VOICE_CLONE_URL = "https://kelly-ads.app.n8n.cloud/webhook/voice/clone";
const N8N_VOICE_PREVIEW_URL = "https://kelly-ads.app.n8n.cloud/webhook/voice/preview";

// The script Gary needs to read
const RECORDING_SCRIPT = `Hi, I'm Gary Knight from Capitol Car Credit in Rantoul. We've been helping families in central Illinois find reliable, affordable vehicles for over twenty years.

Whether you're looking for a fuel-efficient commuter to save on gas, a family SUV with room for the kids and all their stuff, or a dependable work truck that can handle anything you throw at it — we've got you covered.

What makes us different? We're not some big corporate dealership. We're your neighbors. We live here, we work here, and we're gonna be here long after you drive off the lot. That means we treat you right, because we're gonna see you at the grocery store.

Stop by today and let's find the perfect car for you. We're right here on Route 45 in Rantoul — you can't miss us!`;

// Test scripts for Gary to try
const TEST_SCRIPTS = [
  "Looking for a great deal on a used car? Come see us at Capitol Car Credit!",
  "This 2019 Toyota RAV4 is perfect for your family - low miles, great condition, and priced to sell!",
  "We finance everyone, no credit check required. Let's get you on the road today!",
  "Happy holidays from Capitol Car Credit! Our year-end sale is happening now - don't miss out!",
];

export default function GaryVoicePage() {
  // Main flow state
  const [phase, setPhase] = useState<"record" | "cloning" | "test" | "saved">("record");

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Voice clone state
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [cloningProgress, setCloningProgress] = useState("");

  // Test voice state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [isPlayingGenerated, setIsPlayingGenerated] = useState(false);
  const [customText, setCustomText] = useState("");
  const [activeScriptIndex, setActiveScriptIndex] = useState<number | null>(null);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const generatedAudioRef = useRef<HTMLAudioElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (generatedAudioUrl) URL.revokeObjectURL(generatedAudioUrl);
    };
  }, [generatedAudioUrl]);

  // Scroll to top when phase changes to test
  useEffect(() => {
    if (phase === "test") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [phase]);

  // Start recording
  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Could not access your microphone. Please check your browser permissions.");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Process voice - upload to ElevenLabs and create clone
  const processVoice = async () => {
    if (!audioBlob) return;

    setError(null);
    setPhase("cloning");
    setCloningProgress("Uploading your recording...");

    try {
      const formData = new FormData();
      formData.append("name", "Gary Knight - CCC");
      formData.append("files", audioBlob, "voice-recording.webm");
      formData.append("remove_background_noise", "true");

      setCloningProgress("Creating your voice clone...");

      const cloneResponse = await fetch(N8N_VOICE_CLONE_URL, {
        method: "POST",
        body: formData,
      });

      const cloneData = await cloneResponse.json();

      if (!cloneData.success || !cloneData.voice_id) {
        throw new Error(cloneData.error || "Failed to create voice clone");
      }

      setVoiceId(cloneData.voice_id);
      setPhase("test");

    } catch (err) {
      console.error("Voice clone error:", err);
      setError(err instanceof Error ? err.message : "Failed to create voice clone. Please try again.");
      setPhase("record");
    }
  };

  // Generate TTS preview with given text
  const generatePreview = async (text: string, scriptIndex?: number) => {
    if (!text.trim() || !voiceId) return;

    setError(null);
    setIsGenerating(true);
    if (scriptIndex !== undefined) {
      setActiveScriptIndex(scriptIndex);
    } else {
      setActiveScriptIndex(null);
    }

    // Clean up previous audio
    if (generatedAudioUrl) {
      URL.revokeObjectURL(generatedAudioUrl);
      setGeneratedAudioUrl(null);
    }

    try {
      const previewResponse = await fetch(N8N_VOICE_PREVIEW_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voice_id: voiceId,
          text: text,
        }),
      });

      if (!previewResponse.ok) {
        throw new Error("Failed to generate voice preview");
      }

      const previewBlob = await previewResponse.blob();
      const previewUrl = URL.createObjectURL(previewBlob);
      setGeneratedAudioUrl(previewUrl);

      // Auto-play the preview
      setTimeout(() => {
        if (generatedAudioRef.current) {
          generatedAudioRef.current.src = previewUrl;
          generatedAudioRef.current.play();
          setIsPlayingGenerated(true);
        }
      }, 100);

    } catch (err) {
      console.error("Preview generation error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate preview. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Play/pause generated audio
  const toggleGeneratedPlayback = () => {
    if (!generatedAudioRef.current || !generatedAudioUrl) return;

    if (isPlayingGenerated) {
      generatedAudioRef.current.pause();
      setIsPlayingGenerated(false);
    } else {
      generatedAudioRef.current.play();
      setIsPlayingGenerated(true);
    }
  };

  // Save voice (it's already saved on ElevenLabs, just confirm)
  const saveVoice = () => {
    setPhase("saved");
  };

  // Redo - clear everything and start over
  const redo = () => {
    if (generatedAudioUrl) URL.revokeObjectURL(generatedAudioUrl);
    setAudioBlob(null);
    setIsRecording(false);
    setRecordingTime(0);
    setVoiceId(null);
    setGeneratedAudioUrl(null);
    setCustomText("");
    setError(null);
    setActiveScriptIndex(null);
    setPhase("record");
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle audio ended
  const handleAudioEnded = () => {
    setIsPlayingGenerated(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hidden audio element */}
      <audio
        ref={generatedAudioRef}
        onEnded={handleAudioEnded}
      />

      {/* Top ref for scrolling */}
      <div ref={topRef} />

      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-6">
        <div className="max-w-lg mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-3">
            <Sparkles className="w-4 h-4" />
            Ad Pilot Voice Setup
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hey Gary! Let&apos;s get your voice dialed in.
          </h1>
          <p className="text-gray-500 mt-2">
            Capitol Car Credit
          </p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">

        {/* PHASE 1: RECORD */}
        {phase === "record" && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mic className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Record Your Voice</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Read the script below like you&apos;re filming a commercial
                </p>
              </div>

              {/* Error display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 mb-4">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Start Recording button - at TOP */}
              {!isRecording && !audioBlob && (
                <Button
                  onClick={startRecording}
                  size="lg"
                  className="w-full bg-red-500 hover:bg-red-600 h-14 text-lg mb-4"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Start Recording
                </Button>
              )}

              {/* Recording indicator - at TOP while recording */}
              {isRecording && (
                <div className="flex items-center justify-center gap-3 mb-4 py-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-2xl font-mono text-gray-900">
                    {formatTime(recordingTime)}
                  </span>
                  <span className="text-sm text-red-600 font-medium">Recording...</span>
                </div>
              )}

              {/* Script to read */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-medium">
                  Read this aloud:
                </p>
                <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                  {RECORDING_SCRIPT}
                </p>
              </div>

              {/* Stop Recording - at BOTTOM */}
              {isRecording && (
                <Button
                  onClick={stopRecording}
                  size="lg"
                  variant="outline"
                  className="w-full h-14 text-lg border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Square className="w-5 h-5 mr-2" />
                  Stop Recording
                </Button>
              )}

              {/* After recording - just two buttons stacked */}
              {audioBlob && !isRecording && (
                <div className="space-y-3">
                  <Button
                    onClick={processVoice}
                    size="lg"
                    className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
                  >
                    <Volume2 className="w-5 h-5 mr-2" />
                    Create My Voice Clone
                  </Button>
                  <Button
                    onClick={redo}
                    size="lg"
                    variant="outline"
                    className="w-full h-12"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Re-record
                  </Button>
                </div>
              )}

              {/* Tips - only show before recording */}
              {!isRecording && !audioBlob && (
                <div className="mt-6 p-4 bg-amber-50 rounded-xl">
                  <p className="text-sm text-amber-800">
                    <strong>Tips for best results:</strong>
                  </p>
                  <ul className="text-sm text-amber-700 mt-2 space-y-1">
                    <li>• Find a quiet spot with no background noise</li>
                    <li>• Speak naturally at your normal pace</li>
                    <li>• Hold your phone about 6 inches from your mouth</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* PHASE 2: CLONING */}
        {phase === "cloning" && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center py-8">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-6" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Creating Your Voice Clone
                </h2>
                <p className="text-gray-500">{cloningProgress}</p>
                <p className="text-xs text-gray-400 mt-4">
                  This usually takes 10-30 seconds...
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* PHASE 3: TEST YOUR VOICE */}
        {phase === "test" && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Voice Clone Ready!</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Tap a script below to hear it in your voice
                </p>
              </div>

              {/* Error display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 mb-4">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Test script buttons - stacked, with play button inline when active */}
              <div className="space-y-2 mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                  Tap a script to hear it:
                </p>
                {TEST_SCRIPTS.map((script, i) => {
                  const isActive = activeScriptIndex === i && generatedAudioUrl;
                  const isLoading = activeScriptIndex === i && isGenerating;

                  return (
                    <button
                      key={i}
                      onClick={() => {
                        if (isActive) {
                          toggleGeneratedPlayback();
                        } else {
                          generatePreview(script, i);
                        }
                      }}
                      disabled={isGenerating && activeScriptIndex !== i}
                      className={`w-full text-left p-4 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed border flex items-center gap-3 ${
                        isActive
                          ? "bg-blue-50 border-blue-300 text-blue-900"
                          : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700"
                      }`}
                    >
                      {/* Play/Pause button for active script */}
                      {isActive && (
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shrink-0">
                          {isPlayingGenerated ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4 ml-0.5" />
                          )}
                        </div>
                      )}
                      {isLoading && (
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                        </div>
                      )}
                      <span className="flex-1">&ldquo;{script}&rdquo;</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom text area */}
              <div className="mb-6">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
                  Or type/paste your own text:
                </p>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Type or paste any text here to hear it in your voice..."
                  className="w-full h-28 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                />
                <Button
                  onClick={() => generatePreview(customText)}
                  disabled={!customText.trim() || isGenerating}
                  className="w-full mt-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Generate Preview
                </Button>
              </div>

              {/* Final action buttons */}
              <div className="border-t border-gray-100 pt-6 space-y-3">
                <Button
                  onClick={saveVoice}
                  size="lg"
                  className="w-full h-auto min-h-[56px] py-3 text-base bg-green-600 hover:bg-green-700 whitespace-normal"
                >
                  <Check className="w-5 h-5 mr-2 shrink-0" />
                  <span>I&apos;m Happy, Save This Voice</span>
                </Button>
                <Button
                  onClick={redo}
                  size="lg"
                  variant="outline"
                  className="w-full h-12"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Redo From Beginning
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* PHASE 4: SAVED */}
        {phase === "saved" && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  You&apos;re All Set, Gary!
                </h2>
                <p className="text-gray-500 mb-6">
                  Your voice clone has been saved and is ready to use in your videos.
                </p>

                <div className="bg-blue-50 rounded-xl p-4 text-left mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>What happens next:</strong>
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>• Your videos will now use your new voice</li>
                    <li>• Kelly will reach out if we need anything else</li>
                    <li>• You can re-record anytime by visiting this page again</li>
                  </ul>
                </div>

                <Button
                  onClick={redo}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Record a New Voice
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-8">
          Powered by Ad Pilot
        </p>
      </main>
    </div>
  );
}
