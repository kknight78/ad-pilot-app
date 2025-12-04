"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  RefreshCw,
  FileText,
  ChevronRight,
  CheckCheck,
} from "lucide-react";

interface ScriptSegment {
  label: string;
  content: string;
}

export interface Script {
  id: string;
  template: string;
  theme: string;
  segments: ScriptSegment[];
  status: "pending" | "approved";
}

interface ScriptApprovalCardsProps {
  scripts?: Script[];
  onApprove?: (id: string) => void;
  onApproveAll?: () => void;
  onRegenerate?: (id: string) => void;
  onComplete?: () => void;
}

// Demo scripts with segment structure
const demoScripts: Script[] = [
  {
    id: "1",
    template: "Multi-Car",
    theme: "Turkey Day Specials",
    segments: [
      {
        label: "HOOK",
        content: "Black Friday came early at Capitol Car Credit!",
      },
      {
        label: "SEGMENT 1: 2019 Honda CR-V",
        content: "Check out this 2019 Honda CR-V with only 45K miles. Heated seats, Apple CarPlay, and legendary reliability. Priced at just $18,995.",
      },
      {
        label: "SEGMENT 2: 2020 Toyota Camry",
        content: "Or this 2020 Toyota Camry - one owner, 38K miles, amazing gas mileage. A steal at $19,500.",
      },
      {
        label: "CTA",
        content: "Both available this week only. Stop by Capitol Car Credit or call 217-555-1234. We finance everyone!",
      },
    ],
    status: "pending",
  },
  {
    id: "2",
    template: "Spotlight",
    theme: "Turkey Day Specials",
    segments: [
      {
        label: "HOOK",
        content: "Want a reliable SUV without the sticker shock?",
      },
      {
        label: "SEGMENT 1: The Deal",
        content: "This 2019 Honda CR-V is the real deal. Low miles, clean history, and priced $2,000 under market value for our Turkey Day event.",
      },
      {
        label: "SEGMENT 2: The Features",
        content: "You get heated seats, backup camera, Apple CarPlay, and that famous Honda reliability that lasts for years.",
      },
      {
        label: "CTA",
        content: "Thanksgiving special ends Sunday. Come see Shad at Capitol Car Credit - we're here to help, not hassle!",
      },
    ],
    status: "pending",
  },
  {
    id: "3",
    template: "Capitol Smarts",
    theme: "Winter Tires",
    segments: [
      {
        label: "HOOK",
        content: "Your tires might not be ready for winter. Here's how to check.",
      },
      {
        label: "SEGMENT 1: The Penny Test",
        content: "Grab a penny and stick it in your tire tread with Lincoln's head down. If you can see his whole head, your tread is too worn for winter driving.",
      },
      {
        label: "SEGMENT 2: Why It Matters",
        content: "Bald tires on ice are like walking on a frozen pond in socks. Good tread can be the difference between stopping in time and not.",
      },
      {
        label: "CTA",
        content: "Got questions about winter prep? Stop by Capitol Car Credit. We'll check your tires for free - buying or not!",
      },
    ],
    status: "pending",
  },
  {
    id: "4",
    template: "Multi-Car",
    theme: "Credit Scores",
    segments: [
      {
        label: "HOOK",
        content: "Think your credit score means you can't get a car? Think again.",
      },
      {
        label: "SEGMENT 1: Sarah's Story",
        content: "Sarah came to us with a 520 credit score. Other dealers turned her away. We got her approved for a 2018 Chevy Malibu with payments she could afford.",
      },
      {
        label: "SEGMENT 2: Mike's Story",
        content: "Mike filed bankruptcy two years ago. Last week he drove off in a 2019 Ford Escape. Everyone deserves a second chance.",
      },
      {
        label: "CTA",
        content: "Bad credit? No credit? Fresh start? Capitol Car Credit works with 20+ lenders. Apply online or stop by today!",
      },
    ],
    status: "pending",
  },
  {
    id: "5",
    template: "Spotlight",
    theme: "Credit Scores",
    segments: [
      {
        label: "HOOK",
        content: "Here's what nobody tells you about buying a car with bad credit.",
      },
      {
        label: "SEGMENT 1: The Truth",
        content: "Most dealers won't work with you because it takes effort. At Capitol Car Credit, we specialize in it. That's all we do.",
      },
      {
        label: "SEGMENT 2: How We Help",
        content: "We have relationships with over 20 lenders who focus on second-chance financing. Many of our customers leave with a lower rate than they expected.",
      },
      {
        label: "CTA",
        content: "Stop stressing about your score. Call us at 217-555-1234 or apply online. No judgment, just help!",
      },
    ],
    status: "pending",
  },
];

function SegmentBlock({ segment }: { segment: ScriptSegment }) {
  const isHook = segment.label === "HOOK";
  const isCTA = segment.label === "CTA";

  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {segment.label}
      </p>
      <div
        className={`p-3 rounded-lg text-sm ${
          isHook
            ? "bg-amber-50 text-amber-900 italic"
            : isCTA
            ? "bg-green-50 text-green-900 font-medium"
            : "bg-gray-50 text-gray-700"
        }`}
      >
        {isHook ? `"${segment.content}"` : segment.content}
      </div>
    </div>
  );
}

export function ScriptApprovalCards({
  scripts = demoScripts,
  onApprove,
  onApproveAll,
  onRegenerate,
  onComplete,
}: ScriptApprovalCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [localScripts, setLocalScripts] = useState(scripts);

  const pendingCount = localScripts.filter((s) => s.status === "pending").length;
  const approvedCount = localScripts.filter((s) => s.status === "approved").length;
  const totalCount = localScripts.length;
  const allApproved = approvedCount === totalCount;

  const currentScript = localScripts[currentIndex];

  const handleApprove = () => {
    setLocalScripts((prev) =>
      prev.map((s, idx) =>
        idx === currentIndex ? { ...s, status: "approved" as const } : s
      )
    );
    onApprove?.(currentScript.id);
  };

  const handleNext = () => {
    if (currentIndex < totalCount - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleApproveAll = () => {
    setLocalScripts((prev) =>
      prev.map((s) => ({ ...s, status: "approved" as const }))
    );
    onApproveAll?.();
  };

  const handleRegenerate = () => {
    onRegenerate?.(currentScript.id);
  };

  // Check if we're at the last script and it's approved
  const isLastScript = currentIndex === totalCount - 1;
  const currentApproved = currentScript?.status === "approved";

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <FileText className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Script Approval</CardTitle>
              <p className="text-sm text-gray-500">
                {totalCount} scripts to review
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {pendingCount} pending, {approvedCount} approved
            </span>
            {!allApproved && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleApproveAll}
                className="text-xs"
              >
                <CheckCheck className="w-3 h-3 mr-1" />
                Approve All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* All Complete State */}
        {allApproved ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              All Scripts Approved!
            </h3>
            <p className="text-gray-600 mb-6">
              {totalCount} scripts ready for video generation
            </p>
            <Button onClick={onComplete}>
              Generate Videos
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        ) : (
          <>
            {/* Current Script Card */}
            <div className="border rounded-lg overflow-hidden">
              {/* Card Header */}
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    {currentScript.template} — {currentScript.theme}
                  </p>
                  <p className="text-xs text-gray-500">
                    Script {currentIndex + 1} of {totalCount}
                  </p>
                </div>
                {currentApproved && (
                  <Badge className="bg-green-100 text-green-700">
                    <Check className="w-3 h-3 mr-1" />
                    Approved
                  </Badge>
                )}
              </div>

              {/* Segments */}
              <div className="p-4 space-y-4">
                {currentScript.segments.map((segment, idx) => (
                  <SegmentBlock key={idx} segment={segment} />
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerate}
                className="flex-none"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Regenerate
              </Button>

              <div className="flex-1" />

              {!currentApproved && (
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleApprove}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Approve
                </Button>
              )}

              {!isLastScript && (
                <Button size="sm" onClick={handleNext}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}

              {isLastScript && currentApproved && (
                <Button size="sm" onClick={onComplete}>
                  Done
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>

            {/* Navigation dots */}
            <div className="flex justify-center gap-1.5 pt-2">
              {localScripts.map((script, idx) => (
                <button
                  key={script.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? "w-6 bg-amber-500"
                      : script.status === "approved"
                      ? "bg-green-400"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to script ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
