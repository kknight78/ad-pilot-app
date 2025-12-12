"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  Gift,
  TrendingUp,
  Rocket,
  Sparkles,
  X,
  Clock,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Check,
  Bell,
  RefreshCw,
  Camera,
  Film,
  Tv,
  Instagram,
  Star,
  Palette,
  BarChart3,
  AlertTriangle,
  Undo2,
  Mail,
  Phone,
  ExternalLink,
  LayoutTemplate,
  Trophy,
  HelpCircle,
  FlaskConical,
  History,
  Music,
  DollarSign,
} from "lucide-react";

// Types
type RecommendationCategory = "fresh" | "performance" | "expand" | "level_up";
type CardState = "default" | "reminder_set" | "fading_out" | "action_completed";

interface Recommendation {
  id: string;
  category: RecommendationCategory;
  icon: React.ReactNode;
  title: string;
  description: string;
  impactNote?: string;
  actionLabel?: string;
  // For configuration flows
  configOptions?: {
    type: "duration" | "choice";
    label: string;
    options: { value: string; label: string; recommended?: boolean }[];
    explanation?: string;
  };
  // For platform expansion with education
  expandableInfo?: {
    title: string;
    bullets: string[];
  };
  // Action type
  actionType?: "open_widget" | "learn_more" | "contact" | "confirm";
  // Confirmation modal content
  confirmationContent?: {
    title: string;
    description: string;
    bullets?: string[];
  };
}

interface FeedbackReport {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  stats: { label: string; value: string; positive?: boolean }[];
  conclusion?: string;
  actionLabel?: string;
  isNew?: boolean;
  actionDate?: string; // When the user originally acted on the suggestion
}

interface CardStateData {
  state: CardState;
  reminderDate?: string;
  completedMessage?: string;
}

// Demo Recommendations Data
const demoRecommendations: Record<RecommendationCategory, Recommendation[]> = {
  fresh: [
    {
      id: "avatar-sessions",
      category: "fresh",
      icon: <Camera className="w-5 h-5 text-emerald-600" />,
      title: "4 Additional Avatars Available",
      description: "Freshen up your look — throw on a new shirt, seasonal accessory, or try a new background.",
      impactNote: "Dealers who update their avatar quarterly see 18% higher engagement on average",
      actionLabel: "Update My Avatar",
      actionType: "open_widget",
    },
    {
      id: "templates-unused",
      category: "fresh",
      icon: <LayoutTemplate className="w-5 h-5 text-emerald-600" />,
      title: "New Templates in Your Library",
      description: "Check out our template gallery for fresh options — we're always adding new ones.",
      impactNote: "New templates take 3-5 business days to customize for your brand",
      actionLabel: "Browse Template Gallery",
      actionType: "open_widget",
    },
  ],
  performance: [
    {
      id: "rest-template",
      category: "performance",
      icon: <RefreshCw className="w-5 h-5 text-blue-600" />,
      title: "Rest Your Multi-Car Template",
      description: "You've used it 47 times! Starting next week, swap it out and it'll feel fresh when it comes back.",
      impactNote: "Advertisers who refresh templates see 20% more engagement on average",
      actionLabel: "Yes, Start Next Week",
      actionType: "confirm",
      configOptions: {
        type: "duration",
        label: "How long should we rest it?",
        options: [
          { value: "2w", label: "2 weeks" },
          { value: "1m", label: "1 month", recommended: true },
          { value: "2m", label: "2 months" },
        ],
        explanation: "We'll rotate your other 3 templates during this time and bring Multi-Car back feeling fresh.",
      },
      confirmationContent: {
        title: "Template Rest Scheduled!",
        description: "Starting next week, we'll rotate your other templates and bring Multi-Car back in 1 month.",
        bullets: [
          "Your other templates will get more airtime",
          "We'll notify you when Multi-Car is back",
          "You can cancel anytime in Settings",
        ],
      },
    },
    {
      id: "resurface-winner",
      category: "performance",
      icon: <Trophy className="w-5 h-5 text-blue-600" />,
      title: "'Winter Ready RAV4' Crushed It",
      description: "This theme got 3x your average engagement last month. Consider resurfacing similar winter-ready or SUV themes.",
      impactNote: "Your audience clearly responds to practical, seasonal content",
      actionLabel: "Use Similar Theme",
      actionType: "confirm",
      confirmationContent: {
        title: "Great Choice!",
        description: "We'll prioritize winter-ready and SUV themes for your upcoming videos.",
        bullets: [
          "Similar themes will appear more often in suggestions",
          "This takes effect starting next week",
        ],
      },
    },
    {
      id: "question-hooks",
      category: "performance",
      icon: <HelpCircle className="w-5 h-5 text-blue-600" />,
      title: "Question Hooks Are Winning",
      description: "Your videos that start with questions outperform statements by 30%. Lean into what's working!",
      impactNote: "We'll prioritize question-style hooks in your upcoming videos",
      actionLabel: "Yes, Use More Questions",
      actionType: "confirm",
      confirmationContent: {
        title: "Hook Style Updated!",
        description: "We'll use more question-style hooks in your upcoming videos.",
        bullets: [
          "This takes effect starting next week",
          "You can adjust hook preferences anytime",
        ],
      },
    },
    {
      id: "ab-test",
      category: "performance",
      icon: <FlaskConical className="w-5 h-5 text-blue-600" />,
      title: "Try A/B Testing Your Hooks",
      description: "Run a 2-week test comparing different hook styles to see what resonates most with your audience.",
      impactNote: "A/B testing takes the guesswork out of what works",
      actionLabel: "Start A/B Test",
      actionType: "confirm",
      configOptions: {
        type: "choice",
        label: "What do you want to test?",
        options: [
          { value: "hooks", label: "Hook styles (question vs statement)" },
          { value: "templates", label: "Template variations" },
          { value: "music", label: "Music/audio styles" },
        ],
        explanation: "We'll split your videos 50/50 and report back in 2 weeks with results.",
      },
      confirmationContent: {
        title: "A/B Test Started!",
        description: "We'll split your videos 50/50 and report back in 2 weeks with results.",
        bullets: [
          "Test runs for 2 weeks",
          "We'll email you the results",
          "No action needed — we handle everything",
        ],
      },
    },
  ],
  expand: [
    {
      id: "youtube-shorts",
      category: "expand",
      icon: <Tv className="w-5 h-5 text-purple-600" />,
      title: "Expand to YouTube Shorts",
      description: "Your TikToks average 8k views — YouTube Shorts could double your audience with the same content!",
      impactNote: "Same content, zero extra work, new audience",
      actionLabel: "Learn More",
      actionType: "learn_more",
      expandableInfo: {
        title: "What's different about YouTube Shorts?",
        bullets: [
          "Reaches an older demographic (35-55 year olds)",
          "Videos stay discoverable longer than TikTok",
          "Great for SEO — shows up in Google searches",
          "Same video format, we just post it there too",
          "One-time $99 setup fee, then included in your plan",
        ],
      },
      confirmationContent: {
        title: "You're all set!",
        description: "Eric will call you within 24 hours to discuss adding YouTube Shorts.",
        bullets: [
          "Quick 10-minute call",
          "We'll walk through pricing and setup",
          "No commitment required",
        ],
      },
    },
    {
      id: "instagram-reels",
      category: "expand",
      icon: <Instagram className="w-5 h-5 text-purple-600" />,
      title: "Add Instagram Reels",
      description: "You're not on Instagram yet. It's a huge audience for car buyers, especially 25-40 year olds.",
      impactNote: "Instagram users spend 30 minutes/day on average browsing Reels",
      actionLabel: "Learn More",
      actionType: "learn_more",
      expandableInfo: {
        title: "What's different about Instagram Reels?",
        bullets: [
          "Huge audience of 25-40 year olds actively shopping",
          "Strong local discovery features",
          "Connects to your Facebook page automatically",
          "Same video format, we just post it there too",
          "One-time $99 setup fee, then included in your plan",
        ],
      },
      confirmationContent: {
        title: "You're all set!",
        description: "Eric will call you within 24 hours to discuss adding Instagram Reels.",
        bullets: [
          "Quick 10-minute call",
          "We'll walk through pricing and setup",
          "No commitment required",
        ],
      },
    },
  ],
  level_up: [
    {
      id: "upgrade-pro",
      category: "level_up",
      icon: <Star className="w-5 h-5 text-amber-600" />,
      title: "Upgrade to Pro Plan",
      description: "Get 2x more videos per month, priority support, and advanced analytics to supercharge your growth.",
      impactNote: "Pro dealers see 40% more leads on average",
      actionLabel: "Learn More",
      actionType: "learn_more",
      expandableInfo: {
        title: "What's included in Pro?",
        bullets: [
          "2x more videos per month (8 → 16)",
          "Priority support with same-day response",
          "Advanced analytics dashboard",
          "Custom branded intro/outro",
        ],
      },
      confirmationContent: {
        title: "You're all set!",
        description: "Eric will call you within 24 hours to discuss upgrading to Pro.",
        bullets: [
          "Quick 10-minute call",
          "We'll walk through the upgrade options",
          "No commitment required",
        ],
      },
    },
    {
      id: "custom-template",
      category: "level_up",
      icon: <Palette className="w-5 h-5 text-amber-600" />,
      title: "Custom Branded Template",
      description: "Stand out with a template designed just for Capitol Car Credit — your colors, your style, your brand.",
      impactNote: "Custom templates boost brand recognition by 35%",
      actionLabel: "Learn More",
      actionType: "learn_more",
      expandableInfo: {
        title: "What's included?",
        bullets: [
          "Professional design consultation",
          "Your exact brand colors and fonts",
          "Custom animations and transitions",
          "Unlimited revisions until you love it",
        ],
      },
      confirmationContent: {
        title: "You're all set!",
        description: "Eric will call you within 24 hours to discuss custom template options.",
        bullets: [
          "Quick 15-minute call",
          "We'll show you examples",
          "No commitment required",
        ],
      },
    },
  ],
};

// Demo Feedback Reports
const demoFeedbackReports: FeedbackReport[] = [
  {
    id: "template-rest-result",
    icon: <BarChart3 className="w-5 h-5 text-green-600" />,
    title: "Your Multi-Car Template Is Back!",
    description: "Remember when you rested Multi-Car 2 months ago? Here's how it performed since bringing it back:",
    stats: [
      { label: "Engagement", value: "+35%", positive: true },
      { label: "Additional leads", value: "12", positive: true },
      { label: "vs. previous period", value: "↑ Better", positive: true },
    ],
    conclusion: "Nice call! Resting the template paid off.",
    actionLabel: "Great!",
    isNew: true,
    actionDate: "Rested on Oct 12, 2025",
  },
];

// Category config
const categoryConfig: Record<RecommendationCategory, {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  color: string;
  bgColor: string;
  urgency?: boolean;
}> = {
  fresh: {
    icon: <RefreshCw className="w-4 h-4" />,
    label: "Keep It Fresh",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50 border-emerald-200",
  },
  performance: {
    icon: <TrendingUp className="w-4 h-4" />,
    label: "Based on Your Performance",
    color: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200",
  },
  expand: {
    icon: <Rocket className="w-4 h-4" />,
    label: "Expand Your Reach",
    color: "text-purple-700",
    bgColor: "bg-purple-50 border-purple-200",
  },
  level_up: {
    icon: <Sparkles className="w-4 h-4" />,
    label: "Level Up",
    color: "text-amber-700",
    bgColor: "bg-amber-50 border-amber-200",
  },
};

// Confirmation Modal
function ConfirmationModal({
  content,
  onClose,
}: {
  content: { title: string; description: string; bullets?: string[] };
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 text-lg">{content.title}</h3>
        </div>

        <p className="text-gray-600 mb-4">{content.description}</p>

        {content.bullets && content.bullets.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">What to expect:</p>
            <ul className="space-y-2">
              {content.bullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button onClick={onClose} className="w-full">
          Got It
        </Button>
      </div>
    </div>
  );
}

// Suggestion Card Component
function SuggestionCard({
  recommendation,
  cardState,
  onAction,
  onRemind,
  onDismiss,
  onUndo,
}: {
  recommendation: Recommendation;
  cardState: CardStateData;
  onAction: (rec: Recommendation, config?: string) => void;
  onRemind: (rec: Recommendation) => void;
  onDismiss: (rec: Recommendation) => void;
  onUndo: (rec: Recommendation) => void;
}) {
  const [showConfig, setShowConfig] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<string | null>(null);
  const [showExpandedInfo, setShowExpandedInfo] = useState(false);
  const [showContactOptions, setShowContactOptions] = useState(false);

  // Card is fading out
  if (cardState.state === "fading_out") {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm opacity-50 transition-opacity duration-500">
        <div className="flex items-center gap-2 text-gray-500">
          <Check className="w-4 h-4" />
          <span className="text-sm">Dismissed</span>
        </div>
      </div>
    );
  }

  // Card action completed - show success state
  if (cardState.state === "action_completed") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-green-800">{recommendation.title}</h4>
            <p className="text-sm text-green-700 mt-1">
              {cardState.completedMessage || "Action completed successfully!"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Card has a reminder set
  if (cardState.state === "reminder_set") {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          {recommendation.icon}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900">{recommendation.title}</h4>
            <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
              <Check className="w-4 h-4" />
              <span>Reminder set for {cardState.reminderDate}</span>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onUndo(recommendation)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Undo2 className="w-4 h-4 mr-1" />
            Undo
          </Button>
        </div>
      </div>
    );
  }

  const handleAccept = () => {
    if (recommendation.configOptions) {
      setShowConfig(true);
    } else if (recommendation.actionType === "learn_more" && recommendation.expandableInfo) {
      setShowExpandedInfo(true);
    } else if (recommendation.actionType === "open_widget") {
      onAction(recommendation);
    } else {
      onAction(recommendation);
    }
  };

  const handleConfirmConfig = () => {
    onAction(recommendation, selectedConfig || undefined);
    setShowConfig(false);
  };

  const handleContactAction = (action: string) => {
    onAction(recommendation, action);
    setShowContactOptions(false);
    setShowExpandedInfo(false);
  };

  // Config modal view
  if (showConfig && recommendation.configOptions) {
    const config = recommendation.configOptions;
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          {recommendation.icon}
          <div>
            <h4 className="font-semibold text-gray-900">{recommendation.title}</h4>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <p className="text-sm font-medium text-gray-700">{config.label}</p>
          <div className="space-y-2">
            {config.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedConfig(opt.value)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                  selectedConfig === opt.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedConfig === opt.value ? "border-blue-500" : "border-gray-300"
                }`}>
                  {selectedConfig === opt.value && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                </div>
                <span className="flex-1 text-sm text-gray-700">{opt.label}</span>
                {opt.recommended && (
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">recommended</span>
                )}
              </button>
            ))}
          </div>
          {config.explanation && (
            <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              <strong>What happens:</strong> {config.explanation}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleConfirmConfig}
            disabled={!selectedConfig}
            className="flex-1"
          >
            Confirm
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowConfig(false)}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Expanded info view (for platform expansion)
  if (showExpandedInfo && recommendation.expandableInfo) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          {recommendation.icon}
          <div>
            <h4 className="font-semibold text-gray-900">{recommendation.title}</h4>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">{recommendation.expandableInfo.title}</p>
          <ul className="space-y-2">
            {recommendation.expandableInfo.bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {showContactOptions ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-2">How would you like to proceed?</p>
            <button
              onClick={() => handleContactAction("call_eric")}
              className="w-full flex items-center p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
            >
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Great! Have Eric call me to discuss</span>
              </div>
            </button>
            <button
              onClick={() => handleContactAction("send_email")}
              className="w-full flex items-center p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
            >
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">I&apos;m ready — send setup invoice and onboarding link</span>
              </div>
            </button>
            <button
              onClick={() => {
                setShowContactOptions(false);
                setShowExpandedInfo(false);
              }}
              className="w-full p-3 text-sm text-gray-500 hover:text-gray-700"
            >
              Not right now
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button onClick={() => setShowContactOptions(true)} className="flex-1">
              I&apos;m Interested
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowExpandedInfo(false)}
            >
              Back
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Default card view
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{recommendation.icon}</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900">{recommendation.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{recommendation.description}</p>

          {recommendation.impactNote && (
            <div className="flex items-start gap-2 mt-3 text-xs text-purple-700 bg-purple-50 p-2 rounded-lg">
              <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{recommendation.impactNote}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
        <Button
          size="sm"
          onClick={handleAccept}
          className="flex-1"
        >
          {recommendation.actionLabel || "Yes, Start Next Week"}
          {recommendation.expandableInfo && <ChevronDown className="w-3.5 h-3.5 ml-1" />}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onRemind(recommendation)}
          className="text-gray-600"
        >
          <Bell className="w-3.5 h-3.5 mr-1" />
          Later
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDismiss(recommendation)}
          className="text-gray-400 hover:text-gray-600 px-2"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// Feedback Report Card
function FeedbackReportCard({
  report,
  onAcknowledge,
  isNew,
}: {
  report: FeedbackReport;
  onAcknowledge?: () => void;
  isNew?: boolean;
}) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-4 transition-all ${
      isNew ? "ring-1 ring-green-200" : "opacity-75"
    }`}>
      {isNew && (
        <div className="flex items-center gap-1 text-xs text-green-700 font-medium mb-2">
          <Sparkles className="w-3 h-3" />
          New Result!
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h4 className={`font-semibold ${isNew ? "text-gray-900" : "text-gray-700"}`}>{report.title}</h4>
          <p className={`text-sm mt-1 ${isNew ? "text-gray-600" : "text-gray-500"}`}>{report.description}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            {report.stats.map((stat, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-2 text-center">
                <div className={`text-lg font-bold ${stat.positive ? "text-green-600" : "text-gray-700"}`}>
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>

          {report.conclusion && (
            <p className={`text-sm font-medium mt-3 ${isNew ? "text-green-700" : "text-gray-600"}`}>{report.conclusion}</p>
          )}

          {/* Action date - subtle gray text */}
          {report.actionDate && (
            <p className="text-xs text-gray-400 mt-2">{report.actionDate}</p>
          )}
        </div>
      </div>

      {/* Only show the button for new/unacknowledged results */}
      {isNew && onAcknowledge && (
        <div className="flex justify-end mt-3">
          <Button size="sm" onClick={onAcknowledge} className="bg-green-600 hover:bg-green-700">
            {report.actionLabel || "Great!"}
          </Button>
        </div>
      )}
    </div>
  );
}

// Remind Me Modal
function RemindMeModal({
  recommendation,
  onSelect,
  onClose,
}: {
  recommendation: Recommendation;
  onSelect: (duration: string, dateLabel: string) => void;
  onClose: () => void;
}) {
  const getDateLabel = (duration: string) => {
    const now = new Date();
    let futureDate: Date;
    switch (duration) {
      case "2w":
        futureDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        break;
      case "1m":
        futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        break;
      case "3m":
        futureDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        futureDate = now;
    }
    return futureDate.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  };

  const durations = [
    { value: "2w", label: "2 weeks" },
    { value: "1m", label: "1 month" },
    { value: "3m", label: "3 months" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-sm w-full p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Remind me in:</h3>
        <div className="flex gap-2 mb-4">
          {durations.map((d) => (
            <button
              key={d.value}
              onClick={() => onSelect(d.value, getDateLabel(d.value))}
              className="flex-1 py-3 px-4 bg-gray-100 hover:bg-blue-100 hover:text-blue-700 rounded-lg text-sm font-medium transition-colors"
            >
              {d.label}
            </button>
          ))}
        </div>
        <Button variant="ghost" onClick={onClose} className="w-full">
          Cancel
        </Button>
      </div>
    </div>
  );
}

// Dismiss Modal
function DismissModal({
  onSelect,
  onClose,
}: {
  onSelect: (type: "hide_3m" | "never") => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-sm w-full p-6">
        <h3 className="font-semibold text-gray-900 mb-2">Got it!</h3>
        <p className="text-sm text-gray-600 mb-4">Should we:</p>
        <div className="space-y-2 mb-4">
          <button
            onClick={() => onSelect("hide_3m")}
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-left transition-colors"
          >
            Hide for 3 months
          </button>
          <button
            onClick={() => onSelect("never")}
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-left transition-colors"
          >
            Don&apos;t show this again
          </button>
        </div>
        <Button variant="ghost" onClick={onClose} className="w-full">
          Cancel
        </Button>
      </div>
    </div>
  );
}


// Category Section
function CategorySection({
  category,
  recommendations,
  cardStates,
  onAction,
  onRemind,
  onDismiss,
  onUndo,
}: {
  category: RecommendationCategory;
  recommendations: Recommendation[];
  cardStates: Record<string, CardStateData>;
  onAction: (rec: Recommendation, config?: string) => void;
  onRemind: (rec: Recommendation) => void;
  onDismiss: (rec: Recommendation) => void;
  onUndo: (rec: Recommendation) => void;
}) {
  const config = categoryConfig[category];

  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className={`flex items-center gap-2 ${config.color}`}>
        {config.icon}
        <span className="text-sm font-semibold">{config.label}</span>
      </div>
      <div className="space-y-3">
        {recommendations.map((rec) => (
          <SuggestionCard
            key={rec.id}
            recommendation={rec}
            cardState={cardStates[rec.id] || { state: "default" }}
            onAction={onAction}
            onRemind={onRemind}
            onDismiss={onDismiss}
            onUndo={onUndo}
          />
        ))}
      </div>
    </div>
  );
}

// Main Widget
interface RecommendationsWidgetProps {
  maxPerCategory?: number;
  onOpenAvatarWidget?: () => void;
  onOpenTemplatesWidget?: () => void;
}

export function RecommendationsWidget({
  maxPerCategory = 2,
  onOpenAvatarWidget,
  onOpenTemplatesWidget,
}: RecommendationsWidgetProps) {
  // State for card states (reminder_set, fading_out, etc.)
  const [cardStates, setCardStates] = useState<Record<string, CardStateData>>({});
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [remindModal, setRemindModal] = useState<Recommendation | null>(null);
  const [dismissModal, setDismissModal] = useState<Recommendation | null>(null);
  const [confirmationModal, setConfirmationModal] = useState<{ title: string; description: string; bullets?: string[]; recId?: string; completedMessage?: string } | null>(null);
  const [feedbackReports, setFeedbackReports] = useState(demoFeedbackReports);
  const [showPastResults, setShowPastResults] = useState(() => {
    // Start open if there are new results, otherwise closed
    return demoFeedbackReports.some(r => r.isNew);
  });
  const [dismissedFeedbackIds, setDismissedFeedbackIds] = useState<Set<string>>(new Set());

  // Filter visible recommendations
  const getVisibleRecommendations = (category: RecommendationCategory) => {
    return demoRecommendations[category]
      .filter((r) => !hiddenIds.has(r.id))
      .slice(0, maxPerCategory);
  };

  const handleAction = (rec: Recommendation, config?: string) => {
    // Handle widget opening actions
    if (rec.actionType === "open_widget") {
      if (rec.id === "avatar-sessions" && onOpenAvatarWidget) {
        onOpenAvatarWidget();
      } else if (rec.id === "templates-unused" && onOpenTemplatesWidget) {
        onOpenTemplatesWidget();
      }
      // Don't hide the card for widget opens
      return;
    }

    // Show confirmation modal
    if (rec.confirmationContent) {
      // Customize based on contact action
      if (config === "call_eric") {
        setConfirmationModal({
          ...rec.confirmationContent,
          recId: rec.id,
          completedMessage: "Eric will call you within 24 hours.",
        });
      } else if (config === "send_email") {
        setConfirmationModal({
          title: "You're all set!",
          description: "We've sent the setup invoice and onboarding link to your email.",
          bullets: [
            "Check your inbox for the invoice",
            "Follow the onboarding link when ready",
            "We'll reach out if we don't hear from you in a few days",
          ],
          recId: rec.id,
          completedMessage: "Setup email sent! Check your inbox.",
        });
      } else {
        setConfirmationModal({
          ...rec.confirmationContent,
          recId: rec.id,
          completedMessage: rec.confirmationContent.description,
        });
      }
    }
  };

  const handleRemind = (rec: Recommendation) => {
    setRemindModal(rec);
  };

  const handleRemindSelect = (duration: string, dateLabel: string) => {
    if (remindModal) {
      setCardStates((prev) => ({
        ...prev,
        [remindModal.id]: { state: "reminder_set", reminderDate: dateLabel },
      }));
    }
    setRemindModal(null);
  };

  const handleDismiss = (rec: Recommendation) => {
    setDismissModal(rec);
  };

  const handleDismissSelect = (type: "hide_3m" | "never") => {
    if (dismissModal) {
      // Show fading state first
      setCardStates((prev) => ({
        ...prev,
        [dismissModal.id]: { state: "fading_out" },
      }));
      // Then hide after animation
      setTimeout(() => {
        setHiddenIds((prev) => new Set([...prev, dismissModal.id]));
      }, 500);
    }
    setDismissModal(null);
  };

  const handleUndo = (rec: Recommendation) => {
    setCardStates((prev) => ({
      ...prev,
      [rec.id]: { state: "default" },
    }));
  };

  const handleDismissFeedback = (id: string) => {
    setDismissedFeedbackIds((prev) => new Set([...prev, id]));
    // Collapse the accordion after acknowledging a result
    setShowPastResults(false);
  };

  // Get new (unacknowledged) feedback reports vs acknowledged ones
  const newFeedbackReports = feedbackReports.filter(
    (r) => r.isNew && !dismissedFeedbackIds.has(r.id)
  );
  const acknowledgedFeedbackReports = feedbackReports.filter(
    (r) => dismissedFeedbackIds.has(r.id) || !r.isNew
  );

  // Count total visible recommendations
  const totalVisible = (["fresh", "performance", "expand", "level_up"] as RecommendationCategory[])
    .reduce((sum, cat) => sum + getVisibleRecommendations(cat).length, 0);

  return (
    <>
      <Card className="w-full max-w-xl border-purple-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Gift className="w-4 h-4 text-purple-500" />
            Get More From Ad Pilot
          </CardTitle>
          <p className="text-xs text-gray-500">
            Smart suggestions to improve your results
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* PAST RESULTS - NOW AT TOP for trust building */}
          {feedbackReports.length > 0 && (
            <div key="your-results-section" className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-lg border border-gray-200 p-3">
              <button
                onClick={() => setShowPastResults(!showPastResults)}
                className="flex items-center gap-2 text-sm font-medium text-green-800 hover:text-green-900 w-full"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Your Results</span>
                {newFeedbackReports.length > 0 && (
                  <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full ml-1">
                    {newFeedbackReports.length} New!
                  </span>
                )}
                <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${showPastResults ? "rotate-180" : ""}`} />
              </button>
              {showPastResults && (
                <div className="mt-3 space-y-3">
                  {/* New results first - with Great! button */}
                  {newFeedbackReports.map((report) => (
                    <FeedbackReportCard
                      key={report.id}
                      report={report}
                      onAcknowledge={() => handleDismissFeedback(report.id)}
                      isNew
                    />
                  ))}
                  {/* Acknowledged results - no button, muted styling */}
                  {acknowledgedFeedbackReports.map((report) => (
                    <FeedbackReportCard
                      key={report.id}
                      report={report}
                      isNew={false}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recommendation Categories */}
          {totalVisible === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Check className="w-12 h-12 mx-auto mb-3 text-green-500" />
              <p className="font-medium">You&apos;re all caught up!</p>
              <p className="text-sm">No new recommendations right now.</p>
            </div>
          ) : (
            <div key="recommendation-categories" className="space-y-6">
              <CategorySection
                key="category-fresh"
                category="fresh"
                recommendations={getVisibleRecommendations("fresh")}
                cardStates={cardStates}
                onAction={handleAction}
                onRemind={handleRemind}
                onDismiss={handleDismiss}
                onUndo={handleUndo}
              />
              <CategorySection
                key="category-performance"
                category="performance"
                recommendations={getVisibleRecommendations("performance")}
                cardStates={cardStates}
                onAction={handleAction}
                onRemind={handleRemind}
                onDismiss={handleDismiss}
                onUndo={handleUndo}
              />
              <CategorySection
                key="category-expand"
                category="expand"
                recommendations={getVisibleRecommendations("expand")}
                cardStates={cardStates}
                onAction={handleAction}
                onRemind={handleRemind}
                onDismiss={handleDismiss}
                onUndo={handleUndo}
              />
              <CategorySection
                key="category-level_up"
                category="level_up"
                recommendations={getVisibleRecommendations("level_up")}
                cardStates={cardStates}
                onAction={handleAction}
                onRemind={handleRemind}
                onDismiss={handleDismiss}
                onUndo={handleUndo}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {remindModal && (
        <RemindMeModal
          recommendation={remindModal}
          onSelect={handleRemindSelect}
          onClose={() => setRemindModal(null)}
        />
      )}
      {dismissModal && (
        <DismissModal
          onSelect={handleDismissSelect}
          onClose={() => setDismissModal(null)}
        />
      )}
      {confirmationModal && (
        <ConfirmationModal
          content={confirmationModal}
          onClose={() => {
            // Update the card to show completed state
            if (confirmationModal.recId) {
              setCardStates((prev) => ({
                ...prev,
                [confirmationModal.recId!]: {
                  state: "action_completed",
                  completedMessage: confirmationModal.completedMessage,
                },
              }));
            }
            setConfirmationModal(null);
          }}
        />
      )}
    </>
  );
}

// ========================================
// CONTEXTUAL NUDGE COMPONENTS (unchanged)
// ========================================

interface ContextualNudgeProps {
  icon?: React.ReactNode;
  message: string;
  actionLabel: string;
  onAction: () => void;
  onDismiss?: () => void;
  variant?: "default" | "subtle";
}

export function ContextualNudge({
  icon,
  message,
  actionLabel,
  onAction,
  onDismiss,
  variant = "default",
}: ContextualNudgeProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (variant === "subtle") {
    return (
      <div className="flex items-start gap-2 text-xs text-purple-700 bg-purple-50/50 border border-purple-100 px-3 py-2 rounded-lg">
        {icon || <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
        <span className="flex-1">{message}</span>
        <button
          onClick={onAction}
          className="font-medium text-purple-700 hover:text-purple-800 underline underline-offset-2"
        >
          {actionLabel}
        </button>
        {onDismiss && (
          <button onClick={handleDismiss} className="text-purple-400 hover:text-purple-600">
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
      {icon || <Lightbulb className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-purple-900">{message}</p>
        <div className="flex items-center gap-2 mt-2">
          <Button size="sm" onClick={onAction} className="bg-purple-600 hover:bg-purple-700 text-xs h-7">
            {actionLabel}
          </Button>
          {onDismiss && (
            <button
              onClick={handleDismiss}
              className="text-xs text-purple-600 hover:text-purple-800"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function TemplateNudge({
  templateName,
  usageCount,
  onRest,
  onDismiss,
}: {
  templateName: string;
  usageCount: number;
  onRest: () => void;
  onDismiss?: () => void;
}) {
  return (
    <ContextualNudge
      icon={<RefreshCw className="w-3.5 h-3.5 mt-0.5 shrink-0 text-purple-500" />}
      message={`You've used ${templateName} ${usageCount} times — consider trying something fresh starting next week?`}
      actionLabel="Yes, Remind Me After Planning"
      onAction={onRest}
      onDismiss={onDismiss}
    />
  );
}

export function PlatformExpansionNudge({
  platform,
  onSetup,
  onCall,
  onDismiss,
}: {
  platform: string;
  onSetup: () => void;
  onCall: () => void;
  onDismiss?: () => void;
}) {
  const [showOptions, setShowOptions] = useState(false);

  if (showOptions) {
    return (
      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <p className="text-sm text-purple-900 mb-3">
          <Tv className="w-4 h-4 inline mr-1" />
          Your TikToks are crushing it! Want to expand to {platform}?
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={onSetup} className="bg-purple-600 hover:bg-purple-700 text-xs h-7">
            Tell Kelly to Set It Up
          </Button>
          <Button size="sm" variant="outline" onClick={onCall} className="text-xs h-7 border-purple-300 text-purple-700">
            Have Eric Call Me
          </Button>
          <button
            onClick={onDismiss}
            className="text-xs text-purple-600 hover:text-purple-800 px-2"
          >
            Maybe Later
          </button>
        </div>
      </div>
    );
  }

  return (
    <ContextualNudge
      icon={<Tv className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />}
      message={`Your TikToks are crushing it! Want to expand to ${platform}?`}
      actionLabel="Tell Me More"
      onAction={() => setShowOptions(true)}
      onDismiss={onDismiss}
    />
  );
}

export function InventoryNudge({
  count,
  daysOnLot,
  onShow,
  onDismiss,
}: {
  count: number;
  daysOnLot: number;
  onShow: () => void;
  onDismiss?: () => void;
}) {
  return (
    <ContextualNudge
      icon={<Clock className="w-3.5 h-3.5 mt-0.5 shrink-0 text-purple-500" />}
      message={`${count} vehicles have been on lot ${daysOnLot}+ days — featuring older inventory can drive motivated buyers`}
      actionLabel="Show These"
      onAction={onShow}
      onDismiss={onDismiss}
      variant="subtle"
    />
  );
}

export function ThemePerformanceNudge({
  themeName,
  performanceBoost,
  onUse,
  onDismiss,
}: {
  themeName: string;
  performanceBoost: string;
  onUse: () => void;
  onDismiss?: () => void;
}) {
  return (
    <ContextualNudge
      icon={<TrendingUp className="w-3.5 h-3.5 mt-0.5 shrink-0 text-purple-500" />}
      message={`Your "${themeName}" themes get ${performanceBoost} more engagement`}
      actionLabel="Use This Theme"
      onAction={onUse}
      onDismiss={onDismiss}
      variant="subtle"
    />
  );
}
