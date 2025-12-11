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
  Send,
  RefreshCw,
  Sparkles,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

// Recording states
type RecordingState = "idle" | "recording" | "recorded" | "processing" | "voice_ready";
type Step = "record" | "test" | "approve";

// The script Gary needs to read
const RECORDING_SCRIPT = `Hi, I'm Gary Knight from Capitol Car Credit in Rantoul. We've been helping families in central Illinois find reliable, affordable vehicles for over twenty years.

Whether you're looking for a fuel-efficient commuter to save on gas, a family SUV with room for the kids and all their stuff, or a dependable work truck that can handle anything you throw at it — we've got you covered.

What makes us different? We're not some big corporate dealership. We're your neighbors. We live here, we work here, and we're gonna be here long after you drive off the lot. That means we treat you right, because we're gonna see you at the grocery store.

Stop by today and let's find the perfect car for you. We're right here on Route 45 in Rantoul — you can't miss us!`;

// Suggested test phrases
const SUGGESTED_PHRASES = [
  "Looking for a great deal on a used car? Come see us at Capitol Car Credit!",
  "This 2019 Toyota RAV4 is perfect for your family - low miles, great condition!",
  "We finance everyone, no credit check required. Let's get you on the road today!",
  "Happy holidays from Capitol Car Credit! Our year-end sale is happening now!",
];

export default function GaryVoicePage() {
  // State
  const [step, setStep] = useState<Step>("record");
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  // Test voice state
  const [testText, setTestText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [isPlayingGenerated, setIsPlayingGenerated] = useState(false);

  // Final state
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const generatedAudioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (generatedAudioUrl) URL.revokeObjectURL(generatedAudioUrl);
    };
  }, [audioUrl, generatedAudioUrl]);

  // Start recording
  const startRecording = async () => {
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
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setRecordingState("recorded");
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecordingState("recording");
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access your microphone. Please check your browser permissions.");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Play/pause recording
  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setIsPlaying(true);
      audioRef.current.onended = () => setIsPlaying(false);
    }
  };

  // Re-record
  const reRecord = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingState("idle");
    setRecordingTime(0);
  };

  // Process voice (simulate)
  const processVoice = () => {
    setRecordingState("processing");
    setProcessingProgress(0);

    // Simulate processing progress
    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setRecordingState("voice_ready");
          setStep("test");
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);
  };

  // Generate TTS preview (simulate)
  const generatePreview = () => {
    if (!testText.trim()) return;

    setIsGenerating(true);

    // Simulate TTS generation
    setTimeout(() => {
      // In real implementation, this would call ElevenLabs API
      // For demo, we'll use the recorded audio as a placeholder
      setGeneratedAudioUrl(audioUrl);
      setIsGenerating(false);
    }, 2000);
  };

  // Play generated audio
  const toggleGeneratedPlayback = () => {
    if (!generatedAudioRef.current || !generatedAudioUrl) return;

    if (isPlayingGenerated) {
      generatedAudioRef.current.pause();
      setIsPlayingGenerated(false);
    } else {
      generatedAudioRef.current.src = generatedAudioUrl;
      generatedAudioRef.current.play();
      setIsPlayingGenerated(true);
      generatedAudioRef.current.onended = () => setIsPlayingGenerated(false);
    }
  };

  // Save voice
  const saveVoice = () => {
    setIsSaving(true);
    // Simulate save
    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);
      setStep("approve");
    }, 1500);
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Try again from scratch
  const tryAgain = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    if (generatedAudioUrl) URL.revokeObjectURL(generatedAudioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingState("idle");
    setRecordingTime(0);
    setTestText("");
    setGeneratedAudioUrl(null);
    setIsSaved(false);
    setStep("record");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hidden audio elements */}
      <audio ref={audioRef} />
      <audio ref={generatedAudioRef} />

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
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {["record", "test", "approve"].map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step === s
                    ? "bg-blue-600 text-white"
                    : (s === "test" && (step === "test" || step === "approve")) ||
                      (s === "approve" && step === "approve")
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {i + 1}
              </div>
              {i < 2 && (
                <div
                  className={`w-12 h-1 mx-1 rounded ${
                    (i === 0 && (step === "test" || step === "approve")) ||
                    (i === 1 && step === "approve")
                      ? "bg-blue-600"
                      : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Record Voice */}
        {step === "record" && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mic className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Record Your Voice</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Read the script below naturally, like you&apos;re talking to a customer
                </p>
              </div>

              {/* Script to read */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-medium">
                  Read this aloud:
                </p>
                <p className="text-gray-800 leading-relaxed">
                  {RECORDING_SCRIPT}
                </p>
              </div>

              {/* Recording controls */}
              <div className="space-y-4">
                {recordingState === "idle" && (
                  <Button
                    onClick={startRecording}
                    size="lg"
                    className="w-full bg-red-500 hover:bg-red-600 h-14 text-lg"
                  >
                    <Mic className="w-5 h-5 mr-2" />
                    Start Recording
                  </Button>
                )}

                {recordingState === "recording" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-2xl font-mono text-gray-900">
                        {formatTime(recordingTime)}
                      </span>
                    </div>
                    <Button
                      onClick={stopRecording}
                      size="lg"
                      variant="outline"
                      className="w-full h-14 text-lg border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <Square className="w-5 h-5 mr-2" />
                      Stop Recording
                    </Button>
                  </div>
                )}

                {recordingState === "recorded" && (
                  <div className="space-y-4">
                    {/* Playback */}
                    <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-4">
                      <button
                        onClick={togglePlayback}
                        className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors shrink-0"
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5 ml-0.5" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="h-2 bg-gray-300 rounded-full">
                          <div className="h-2 bg-blue-600 rounded-full w-0" />
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 font-mono">
                        {formatTime(recordingTime)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={reRecord}
                        variant="outline"
                        className="h-12"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Re-record
                      </Button>
                      <Button
                        onClick={processVoice}
                        className="h-12 bg-blue-600 hover:bg-blue-700"
                      >
                        Sounds Good
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {recordingState === "processing" && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                      <p className="text-gray-700 font-medium">Creating your voice clone...</p>
                      <p className="text-gray-500 text-sm mt-1">This takes about 30 seconds</p>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(processingProgress, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Tips */}
              {recordingState === "idle" && (
                <div className="mt-6 p-4 bg-amber-50 rounded-xl">
                  <p className="text-sm text-amber-800">
                    <strong>Tips for best results:</strong>
                  </p>
                  <ul className="text-sm text-amber-700 mt-2 space-y-1">
                    <li>Find a quiet spot with no background noise</li>
                    <li>Speak naturally at your normal pace</li>
                    <li>Hold your phone about 6 inches from your mouth</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Test Voice */}
        {step === "test" && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Voice Clone Ready!</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Let&apos;s test it out. Type anything to hear it in your voice.
                </p>
              </div>

              {/* Test input */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Type anything you want to hear in your voice:
                  </label>
                  <textarea
                    value={testText}
                    onChange={(e) => setTestText(e.target.value)}
                    placeholder="e.g., Come check out this beautiful 2020 Honda Accord..."
                    className="w-full h-24 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <Button
                  onClick={generatePreview}
                  disabled={!testText.trim() || isGenerating}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 mr-2" />
                      Generate Preview
                    </>
                  )}
                </Button>

                {/* Generated audio player */}
                {generatedAudioUrl && (
                  <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <button
                      onClick={toggleGeneratedPlayback}
                      className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors shrink-0"
                    >
                      {isPlayingGenerated ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5 ml-0.5" />
                      )}
                    </button>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">Your voice preview</p>
                      <p className="text-xs text-blue-600">Click to play</p>
                    </div>
                  </div>
                )}

                {/* Suggested phrases */}
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-3 font-medium">
                    Try these phrases:
                  </p>
                  <div className="space-y-2">
                    {SUGGESTED_PHRASES.map((phrase, i) => (
                      <button
                        key={i}
                        onClick={() => setTestText(phrase)}
                        className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                      >
                        &ldquo;{phrase}&rdquo;
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Approval buttons */}
              <div className="border-t border-gray-100 pt-6 mt-6">
                <p className="text-center text-gray-700 font-medium mb-4">
                  Happy with how it sounds?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={tryAgain}
                    variant="outline"
                    className="h-12"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Recording Again
                  </Button>
                  <Button
                    onClick={saveVoice}
                    disabled={isSaving}
                    className="h-12 bg-green-600 hover:bg-green-700"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Yes, Save This Voice
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Success */}
        {step === "approve" && isSaved && (
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
                    <li>Your videos will now use your new voice</li>
                    <li>Kelly will reach out if we need anything else</li>
                    <li>You can re-record anytime by visiting this page again</li>
                  </ul>
                </div>

                <Button
                  onClick={tryAgain}
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
