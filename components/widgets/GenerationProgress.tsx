"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Check,
  Clock,
  Pause,
  Film,
  ArrowRight,
  Pencil,
} from "lucide-react";

type VideoStatus = "done" | "active" | "queued";
type StepStatus = "done" | "active" | "pending";

interface GenerationStep {
  id: string;
  label: string;
  status: StepStatus;
  duration?: string;
}

interface VideoJob {
  id: string;
  template: string;
  topic: string;
  status: VideoStatus;
  steps?: GenerationStep[];
  currentStep?: number;
  estimatedTime?: string;
}

interface GenerationProgressProps {
  jobs?: VideoJob[];
  onPreviewAll?: () => void;
  // Completed state - shows collapsed summary
  completed?: boolean;
  completedCount?: number;
  onEdit?: () => void;
}

// Demo data
const demoJobs: VideoJob[] = [
  {
    id: "1",
    template: "Multi-Car",
    topic: "Turkey Day Specials",
    status: "done",
  },
  {
    id: "2",
    template: "Spotlight",
    topic: "Turkey Day Specials",
    status: "done",
  },
  {
    id: "3",
    template: "Capitol Smarts",
    topic: "Winter Tires",
    status: "active",
    currentStep: 3,
    estimatedTime: "~45s",
    steps: [
      { id: "script", label: "Script Generation", status: "done", duration: "8s" },
      { id: "avatar", label: "Avatar Recording", status: "done", duration: "42s" },
      { id: "video", label: "Video Assembly", status: "active" },
    ],
  },
  {
    id: "4",
    template: "Multi-Car",
    topic: "Facebook",
    status: "queued",
  },
  {
    id: "5",
    template: "Capitol Smarts",
    topic: "Credit Scores",
    status: "queued",
  },
];

function StepIndicator({ step }: { step: GenerationStep }) {
  if (step.status === "done") {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Check className="w-4 h-4 text-green-600" />
        <span className="text-gray-700">{step.label}</span>
        {step.duration && (
          <span className="text-gray-400 ml-auto">{step.duration}</span>
        )}
      </div>
    );
  }

  if (step.status === "active") {
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className="w-4 h-4 flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
        </div>
        <span className="text-gray-900 font-medium">{step.label}</span>
        <span className="text-blue-500 ml-auto">processing...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-gray-400">
      <div className="w-4 h-4 flex items-center justify-center">
        <div className="w-2.5 h-2.5 border-2 border-gray-300 rounded-full" />
      </div>
      <span>{step.label}</span>
    </div>
  );
}

function VideoJobItem({ job }: { job: VideoJob }) {
  const title = `${job.template} — ${job.topic}`;

  if (job.status === "done") {
    return (
      <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-gray-900">{title}</span>
        </div>
        <span className="text-green-600 text-sm font-medium">Done</span>
      </div>
    );
  }

  if (job.status === "active" && job.steps) {
    const completedSteps = job.steps.filter((s) => s.status === "done").length;
    const totalSteps = job.steps.length;
    const progress = (completedSteps / totalSteps) * 100;

    return (
      <div className="py-3 px-4 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-gray-900 font-medium">{title}</span>
          </div>
          <span className="text-blue-600 text-sm font-medium">{job.estimatedTime}</span>
        </div>

        {/* Steps */}
        <div className="space-y-2 mb-3 pl-1">
          {job.steps.map((step) => (
            <StepIndicator key={step.id} step={step} />
          ))}
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-blue-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">
            Step {completedSteps + 1} of {totalSteps}
          </span>
        </div>
      </div>
    );
  }

  // Queued
  return (
    <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <Pause className="w-5 h-5 text-gray-400" />
        <span className="text-gray-600">{title}</span>
      </div>
      <span className="text-gray-400 text-sm">Queued</span>
    </div>
  );
}

export function GenerationProgress({
  jobs = demoJobs,
  onPreviewAll,
  completed = false,
  completedCount,
  onEdit,
}: GenerationProgressProps) {
  const [localJobs, setLocalJobs] = useState<VideoJob[]>(jobs);
  const [timeRemaining, setTimeRemaining] = useState("~2 min left");
  const [hasPreviewedAll, setHasPreviewedAll] = useState(false);

  // Collapsed summary state when completed
  if (completed && completedCount !== undefined) {
    return (
      <Card className="w-full max-w-lg border-green-200 bg-green-50/30">
        <CardContent className="py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Videos Generated</span>
                <p className="text-sm text-gray-900">{completedCount} videos ready for review</p>
              </div>
            </div>
            <button
              onClick={onEdit}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Pencil className="w-3 h-3" />
              Edit
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const doneCount = localJobs.filter((j) => j.status === "done").length;
  const totalCount = localJobs.length;
  const allComplete = doneCount === totalCount;

  // Demo animation - progress through jobs
  useEffect(() => {
    const activeJob = localJobs.find((j) => j.status === "active");
    if (!activeJob || !activeJob.steps) return;

    const activeStepIndex = activeJob.steps.findIndex((s) => s.status === "active");
    if (activeStepIndex === -1) return;

    // Progress to next step after 2 seconds
    const timer = setTimeout(() => {
      setLocalJobs((prev) =>
        prev.map((job) => {
          if (job.id !== activeJob.id || !job.steps) return job;

          const newSteps = job.steps.map((step, idx) => {
            if (idx === activeStepIndex) {
              return { ...step, status: "done" as const, duration: "12s" };
            }
            if (idx === activeStepIndex + 1) {
              return { ...step, status: "active" as const };
            }
            return step;
          });

          // Check if all steps are done
          const allStepsDone = newSteps.every((s) => s.status === "done");

          if (allStepsDone) {
            // Move to next queued job
            return { ...job, status: "done" as const, steps: newSteps };
          }

          return { ...job, steps: newSteps, currentStep: activeStepIndex + 2 };
        })
      );

      // Update time remaining
      setTimeRemaining((prev) => {
        if (prev.includes("2")) return "~1 min left";
        if (prev.includes("1 min")) return "~30s left";
        return "Almost there...";
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [localJobs]);

  // Activate next queued job when current one completes
  useEffect(() => {
    const hasActive = localJobs.some((j) => j.status === "active");
    if (hasActive) return;

    const firstQueued = localJobs.find((j) => j.status === "queued");
    if (!firstQueued) return;

    const timer = setTimeout(() => {
      setLocalJobs((prev) =>
        prev.map((job) => {
          if (job.id !== firstQueued.id) return job;
          return {
            ...job,
            status: "active" as const,
            estimatedTime: "~45s",
            steps: [
              { id: "script", label: "Script Generation", status: "active" as const },
              { id: "avatar", label: "Avatar Recording", status: "pending" as const },
              { id: "video", label: "Video Assembly", status: "pending" as const },
            ],
          };
        })
      );
    }, 500);

    return () => clearTimeout(timer);
  }, [localJobs]);

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Film className="w-5 h-5 text-blue-600" />
          Generating Videos
        </CardTitle>
        <p className="text-sm text-gray-500">
          {doneCount} of {totalCount} complete
        </p>
      </CardHeader>

      <CardContent className="space-y-2">
        {localJobs.map((job) => (
          <VideoJobItem key={job.id} job={job} />
        ))}

        {/* Footer */}
        <div className="pt-4 border-t mt-4">
          {allComplete ? (
            hasPreviewedAll ? (
              // Success state after clicking Preview All
              <div className="flex items-center justify-center gap-2 py-2">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-sm text-green-700 font-medium">Videos sent to review</span>
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={() => {
                  setHasPreviewedAll(true);
                  onPreviewAll?.();
                }}
              >
                Preview All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )
          ) : (
            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
              <span>☕</span>
              <span>Grab a coffee — {timeRemaining}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
