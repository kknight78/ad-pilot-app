"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pencil, RefreshCw, Clock, Check, Loader2 } from "lucide-react";

export interface VideoPreviewProps {
  title: string;
  hook: string;
  script?: string;
  duration: string;
  thumbnailUrl?: string;
  status: "preview" | "generating" | "ready";
  onApprove?: () => void;
  onEdit?: () => void;
  onRegenerate?: () => void;
}

export function VideoPreviewCard({
  title,
  hook,
  script,
  duration,
  thumbnailUrl,
  status,
  onApprove,
  onEdit,
  onRegenerate,
}: VideoPreviewProps) {
  const statusConfig = {
    preview: { label: "Preview", variant: "info" as const, icon: Play },
    generating: { label: "Generating...", variant: "warning" as const, icon: Loader2 },
    ready: { label: "Ready", variant: "success" as const, icon: Check },
  };

  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;

  return (
    <Card className="w-full max-w-md overflow-hidden">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center text-gray-400">
            <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <span className="text-sm">Video Preview</span>
          </div>
        )}
        {/* Status badge overlay */}
        <div className="absolute top-3 right-3">
          <Badge variant={currentStatus.variant} className="flex items-center gap-1">
            <StatusIcon className={`w-3 h-3 ${status === "generating" ? "animate-spin" : ""}`} />
            {currentStatus.label}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-lg leading-tight">{title}</h3>
          <Badge variant="secondary" className="flex items-center gap-1 ml-2 shrink-0">
            <Clock className="w-3 h-3" />
            {duration}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Hook */}
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Opening Hook
          </p>
          <p className="text-sm text-gray-700 italic">&ldquo;{hook}&rdquo;</p>
        </div>

        {/* Script preview */}
        {script && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Script Preview
            </p>
            <p className="text-sm text-gray-600 line-clamp-3">{script}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2 flex-wrap">
        <Button
          size="sm"
          onClick={onApprove}
          disabled={status === "generating"}
          className="flex-1"
        >
          <Check className="w-4 h-4 mr-1" />
          Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onEdit}
          disabled={status === "generating"}
        >
          <Pencil className="w-4 h-4 mr-1" />
          Edit
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onRegenerate}
          disabled={status === "generating"}
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Regenerate
        </Button>
      </CardFooter>
    </Card>
  );
}
