"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Loader2,
  FileText,
  Mic,
  Film,
  Upload,
  Clock,
  AlertCircle,
  Play,
} from "lucide-react";

type StepStatus = "pending" | "in_progress" | "complete" | "error";

interface GenerationStep {
  id: string;
  label: string;
  description: string;
  status: StepStatus;
  duration?: string;
}

interface GenerationProgressProps {
  jobId?: string;
  videoTitle?: string;
  onComplete?: (videoUrl: string) => void;
  onCancel?: () => void;
  demo?: boolean;
}

const stepIcons = {
  script: FileText,
  avatar: Mic,
  video: Film,
  upload: Upload,
};

export function GenerationProgress({
  jobId = "demo-123",
  videoTitle = "2019 Honda CR-V - Quick Feature",
  onComplete,
  onCancel,
  demo = true,
}: GenerationProgressProps) {
  const [steps, setSteps] = useState<GenerationStep[]>([
    { id: "script", label: "Script Generation", description: "Creating your video script", status: "complete", duration: "8s" },
    { id: "avatar", label: "Avatar Recording", description: "Recording with AI avatar", status: "in_progress" },
    { id: "video", label: "Video Assembly", description: "Combining footage and overlays", status: "pending" },
    { id: "upload", label: "Publishing", description: "Uploading to platforms", status: "pending" },
  ]);

  const [overallProgress, setOverallProgress] = useState(35);
  const [estimatedTime, setEstimatedTime] = useState("2-3 minutes");
  const [isComplete, setIsComplete] = useState(false);

  // Demo animation
  useEffect(() => {
    if (!demo) return;

    const timers: NodeJS.Timeout[] = [];

    // Progress from avatar to video after 3s
    timers.push(setTimeout(() => {
      setSteps((prev) =>
        prev.map((s) =>
          s.id === "avatar"
            ? { ...s, status: "complete" as const, duration: "45s" }
            : s.id === "video"
            ? { ...s, status: "in_progress" as const }
            : s
        )
      );
      setOverallProgress(60);
      setEstimatedTime("1-2 minutes");
    }, 3000));

    // Progress from video to upload after 6s
    timers.push(setTimeout(() => {
      setSteps((prev) =>
        prev.map((s) =>
          s.id === "video"
            ? { ...s, status: "complete" as const, duration: "32s" }
            : s.id === "upload"
            ? { ...s, status: "in_progress" as const }
            : s
        )
      );
      setOverallProgress(85);
      setEstimatedTime("30 seconds");
    }, 6000));

    // Complete after 8s
    timers.push(setTimeout(() => {
      setSteps((prev) =>
        prev.map((s) =>
          s.id === "upload" ? { ...s, status: "complete" as const, duration: "12s" } : s
        )
      );
      setOverallProgress(100);
      setIsComplete(true);
    }, 8000));

    return () => timers.forEach(clearTimeout);
  }, [demo]);

  const completedSteps = steps.filter((s) => s.status === "complete").length;
  const currentStep = steps.find((s) => s.status === "in_progress");
  const hasError = steps.some((s) => s.status === "error");

  const getStepIcon = (step: GenerationStep) => {
    const Icon = stepIcons[step.id as keyof typeof stepIcons] || FileText;

    if (step.status === "complete") {
      return (
        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      );
    }
    if (step.status === "in_progress") {
      return (
        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
          <Loader2 className="w-4 h-4 text-white animate-spin" />
        </div>
      );
    }
    if (step.status === "error") {
      return (
        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
          <AlertCircle className="w-4 h-4 text-white" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
        <Icon className="w-4 h-4 text-gray-400" />
      </div>
    );
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary-100 rounded-lg">
              {isComplete ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">
                {isComplete ? "Video Ready!" : "Generating Video"}
              </CardTitle>
              <p className="text-sm text-gray-500">{videoTitle}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            Job #{jobId.slice(0, 8)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {isComplete ? "Complete!" : `Step ${completedSteps + 1} of ${steps.length}`}
            </span>
            {!isComplete && (
              <span className="text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                ~{estimatedTime}
              </span>
            )}
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isComplete ? "bg-green-500" : "bg-primary-500"
              }`}
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Steps list */}
        <div className="space-y-1">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                step.status === "in_progress"
                  ? "bg-primary-50"
                  : step.status === "complete"
                  ? "bg-green-50"
                  : step.status === "error"
                  ? "bg-red-50"
                  : "bg-gray-50"
              }`}
            >
              {/* Step icon */}
              {getStepIcon(step)}

              {/* Step info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-medium text-sm ${
                      step.status === "pending" ? "text-gray-400" : "text-gray-900"
                    }`}
                  >
                    {step.label}
                  </span>
                  {step.duration && (
                    <span className="text-xs text-gray-400">{step.duration}</span>
                  )}
                </div>
                <p
                  className={`text-xs ${
                    step.status === "pending" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {step.status === "in_progress"
                    ? "Processing..."
                    : step.status === "complete"
                    ? "Done"
                    : step.description}
                </p>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-7 top-12 w-0.5 h-4 bg-gray-200" />
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        {isComplete ? (
          <div className="space-y-2">
            <Button className="w-full bg-green-600 hover:bg-green-700">
              <Play className="w-4 h-4 mr-2" />
              Preview Video
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                Download
              </Button>
              <Button variant="outline" className="flex-1">
                Share
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center pt-2">
            <p className="text-xs text-gray-400">
              {currentStep
                ? `Currently: ${currentStep.description}`
                : "Starting up..."}
            </p>
            <Button variant="ghost" size="sm" onClick={onCancel} className="text-gray-500">
              Cancel
            </Button>
          </div>
        )}

        {hasError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">
              Something went wrong. Please try again or contact support.
            </p>
            <Button variant="outline" size="sm" className="mt-2 text-red-600 border-red-300">
              Retry
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
