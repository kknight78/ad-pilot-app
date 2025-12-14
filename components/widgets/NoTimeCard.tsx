"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Clock,
  Check,
  ArrowRight,
} from "lucide-react";

interface NoTimeCardProps {
  onAutomate?: () => void;
  onCustomize?: () => void;
}

export function NoTimeCard({ onAutomate, onCustomize }: NoTimeCardProps) {
  const [isAutomating, setIsAutomating] = useState(false);
  const [automated, setAutomated] = useState(false);

  const handleAutomate = async () => {
    setIsAutomating(true);
    // Simulate automation
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsAutomating(false);
    setAutomated(true);
    onAutomate?.();
  };

  if (automated) {
    return (
      <Card className="w-full max-w-md border-green-200 bg-green-50">
        <CardContent className="py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              All Set!
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Your ads are being generated with our best-performing defaults.
              We&apos;ll notify you when they&apos;re ready for review.
            </p>
            <p className="text-xs text-gray-500">
              Expected: 5 videos ready in ~15 minutes
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600" />
          No Time This Week?
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Let us handle everything! We&apos;ll use your top-performing themes
          and vehicles to create this week&apos;s ads automatically.
        </p>

        {/* What we'll do */}
        <div className="bg-white/70 rounded-lg p-3 space-y-2">
          <p className="text-xs font-medium text-gray-700">We&apos;ll automatically:</p>
          <ul className="text-xs text-gray-600 space-y-1.5">
            <li className="flex items-start gap-2">
              <Check className="w-3 h-3 text-green-600 mt-0.5 shrink-0" />
              <span>Pick themes based on last week&apos;s performance</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-3 h-3 text-green-600 mt-0.5 shrink-0" />
              <span>Select vehicles that need the most attention (45+ days on lot)</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-3 h-3 text-green-600 mt-0.5 shrink-0" />
              <span>Create 5 videos for TikTok &amp; Facebook</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-3 h-3 text-green-600 mt-0.5 shrink-0" />
              <span>Send you a notification when ready to review</span>
            </li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleAutomate}
            disabled={isAutomating}
            className="w-full bg-amber-600 hover:bg-amber-700"
          >
            {isAutomating ? (
              <>
                <Zap className="w-4 h-4 mr-2 animate-pulse" />
                Setting up...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Automate This Week
              </>
            )}
          </Button>

          <button
            onClick={onCustomize}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1"
          >
            I have a few minutes, let me customize
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Reassurance */}
        <p className="text-xs text-gray-400 text-center">
          You can always edit or re-generate before publishing
        </p>
      </CardContent>
    </Card>
  );
}
