"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Message from "./Message";
import TypingIndicator from "./TypingIndicator";
import { WidgetData } from "@/lib/tools";
import {
  VideoPreviewCard,
  GuidanceRulesCard,
  InventoryGrid,
  ContentCalendar,
  PerformanceDashboard,
  RecommendationsList,
  AdPlanWidget,
  ProgressIndicator,
  ActionButtons,
  // V2 widgets with real backend integration
  ThemeSelectorV2,
  TopicSelectorV2,
  VehicleSelectorV2,
  type GuidanceRule,
  type Vehicle,
  type ScheduledPost,
  type PlatformData,
  type TopContent,
  type Recommendation,
  type AdPlanData,
  type ProgressItem,
  type ActionButton,
} from "./widgets";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  widgets?: WidgetData[];
}

// Time-based greeting for welcome message (client-side only)
function getGreeting(): string {
  if (typeof window === "undefined") return "Hey"; // Server-side fallback
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// Static initial message to avoid hydration mismatch
const INITIAL_WELCOME = "Hey, Shad! Here's how last week went:";

// Initial performance data for welcome screen
const initialPerformanceData = {
  dateRange: "Nov 25 - Dec 1, 2024",
  totalViews: 45200,
  totalLeads: 127,
  totalSpend: 1250,
  viewsTrend: 12,
  leadsTrend: 8,
  platforms: [
    {
      platform: "Facebook",
      views: 22500,
      leads: 68,
      spend: 550,
      cpl: 8.09,
      trend: 15,
    },
    {
      platform: "TikTok",
      views: 18200,
      leads: 42,
      spend: 400,
      cpl: 9.52,
      trend: 22,
    },
    {
      platform: "Instagram",
      views: 4500,
      leads: 17,
      spend: 300,
      cpl: 17.65,
      trend: -5,
    },
    {
      platform: "YouTube",
      views: 3200,
      leads: 2,
      spend: 0,
      cpl: 0,
      trend: 45,
    },
  ],
  topContent: [
    {
      title: "2024 Malibu Spotlight",
      platform: "Facebook",
      views: 8500,
      leads: 24,
      featured: true,
    },
    {
      title: "Weekend Flash Sale",
      platform: "TikTok",
      views: 6200,
      leads: 18,
    },
    {
      title: "Customer Testimonial - Johnson Family",
      platform: "Facebook",
      views: 4100,
      leads: 12,
    },
  ],
};

// Initial welcome widget
const welcomeWidget: WidgetData = {
  type: "performance_dashboard",
  data: initialPerformanceData,
};

// Welcome action buttons (Email is inside the widget, so no pill needed)
const welcomeActionButtons: ActionButton[] = [
  { label: "💡 Show recommendations", message: "Show me recommendations based on this data", variant: "primary" },
  { label: "📋 Plan this week", message: "Let's plan this week's content", variant: "secondary" },
];


// Widget renderer component with callbacks
function WidgetRenderer({
  widget,
  onSendMessage,
}: {
  widget: WidgetData;
  onSendMessage: (message: string) => void;
}) {
  switch (widget.type) {
    case "guidance_rules": {
      const data = widget.data as { rules: GuidanceRule[]; clientName: string };
      return <GuidanceRulesCard customRules={data.rules} />;
    }
    case "video_preview": {
      const data = widget.data as {
        title: string;
        hook: string;
        script?: string;
        duration: string;
        status: "preview" | "generating" | "ready";
      };
      return (
        <VideoPreviewCard
          title={data.title}
          hook={data.hook}
          script={data.script}
          duration={data.duration}
          status={data.status}
        />
      );
    }
    case "inventory": {
      const data = widget.data as { vehicles: Vehicle[] };
      return <InventoryGrid vehicles={data.vehicles} />;
    }
    case "content_calendar": {
      const data = widget.data as { posts: ScheduledPost[] };
      return <ContentCalendar posts={data.posts} />;
    }
    case "performance_dashboard": {
      const data = widget.data as {
        dateRange: string;
        totalViews: number;
        totalLeads: number;
        totalSpend: number;
        viewsTrend: number;
        leadsTrend: number;
        platforms: PlatformData[];
        topContent: TopContent[];
      };
      // Convert old format to new WeekData format
      const weekData = [{
        startDate: data.dateRange.split(" - ")[0] || "Nov 25",
        endDate: data.dateRange.split(" - ")[1]?.replace(", 2024", "") || "Dec 1",
        totalViews: data.totalViews,
        totalLeads: data.totalLeads,
        totalSpend: data.totalSpend,
        spendDelta: 0,
        viewsTrend: data.viewsTrend,
        leadsTrend: data.leadsTrend,
        cplTrend: 0,
        platforms: data.platforms,
        topContent: data.topContent,
        adjustments: [],
      }];
      return <PerformanceDashboard weeks={weekData} />;
    }
    case "recommendations": {
      // Use the new self-contained RecommendationsList (expert-curated, 2-3 items)
      return (
        <RecommendationsList
          onDismiss={() => onSendMessage("Dismiss recommendation")}
          onAction={(id) => onSendMessage(`Take action on recommendation ${id}`)}
        />
      );
    }
    case "ad_plan": {
      const data = widget.data as AdPlanData;
      return <AdPlanWidget data={data} />;
    }
    case "theme_selector": {
      // V2 widget with 3-option flow: Choose for me / Specific / Inspire me
      return (
        <ThemeSelectorV2
          onContinue={(theme) => {
            if (theme) {
              onSendMessage(`I chose the "${theme}" theme`);
            } else {
              onSendMessage("Choose a theme for me - keep it general");
            }
          }}
        />
      );
    }
    case "topic_selector": {
      // V2 widget with multi-select and real backend integration
      return (
        <TopicSelectorV2
          onContinue={(topics) => {
            const topicNames = topics.join(" and ");
            onSendMessage(`I chose these topics: ${topicNames}`);
          }}
        />
      );
    }
    case "vehicle_selector": {
      // V2 widget with real inventory integration
      return (
        <VehicleSelectorV2
          onContinue={(selections) => {
            const totalVehicles = Object.values(selections).flat().length;
            onSendMessage(`I've confirmed ${totalVehicles} vehicles for the ads`);
          }}
        />
      );
    }
    case "progress_indicator": {
      const data = widget.data as {
        items: ProgressItem[];
        percentComplete: number;
        estimatedMinutesLeft: number;
      };
      return (
        <ProgressIndicator
          items={data.items}
          percentComplete={data.percentComplete}
          estimatedMinutesLeft={data.estimatedMinutesLeft}
        />
      );
    }
    case "action_buttons": {
      const data = widget.data as { buttons: ActionButton[] };
      return (
        <ActionButtons
          buttons={data.buttons}
          onAction={onSendMessage}
        />
      );
    }
    default:
      return null;
  }
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: INITIAL_WELCOME, widgets: [welcomeWidget] },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Update greeting client-side to avoid hydration mismatch
  useEffect(() => {
    const greeting = getGreeting();
    const dynamicWelcome = `${greeting}, Shad! Here's how last week went:`;
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].content === INITIAL_WELCOME) {
        return [{ ...prev[0], content: dynamicWelcome }];
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim() || isLoading) return;

      setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, { role: "user", content: userMessage }],
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = "";
        let currentWidgets: WidgetData[] = [];

        if (reader) {
          setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(data);

                  // Handle widget data - accumulate widgets, don't replace
                  if (parsed.widget) {
                    currentWidgets = [...currentWidgets, parsed.widget];
                    setMessages((prev) => {
                      const newMessages = [...prev];
                      newMessages[newMessages.length - 1] = {
                        role: "assistant",
                        content: assistantMessage,
                        widgets: currentWidgets,
                      };
                      return newMessages;
                    });
                  }

                  // Handle text content
                  if (parsed.content) {
                    assistantMessage += parsed.content;
                    setMessages((prev) => {
                      const newMessages = [...prev];
                      newMessages[newMessages.length - 1] = {
                        role: "assistant",
                        content: assistantMessage,
                        widgets: currentWidgets.length > 0 ? currentWidgets : undefined,
                      };
                      return newMessages;
                    });
                  }
                } catch {
                  // Skip non-JSON lines
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error:", error);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again.",
          },
        ]);
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    },
    [messages, isLoading]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    await sendMessage(userMessage);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-72px)]">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 chat-scrollbar bg-gray-50">
        <div className="max-w-3xl mx-auto">
          {messages.map((message, index) => (
            <div key={index}>
              <Message role={message.role} content={message.content} />
              {/* Render all widgets for this message */}
              {message.widgets && message.widgets.map((widget, widgetIndex) => (
                <div key={widgetIndex} className="flex justify-start mb-4 ml-0">
                  <WidgetRenderer
                    widget={widget}
                    onSendMessage={sendMessage}
                  />
                </div>
              ))}
              {/* Show welcome action buttons after performance dashboard on initial load */}
              {index === 0 &&
                message.role === "assistant" &&
                messages.length === 1 &&
                message.widgets?.some(w => w.type === "performance_dashboard") && (
                  <div className="mb-4">
                    <ActionButtons
                      buttons={welcomeActionButtons}
                      onAction={sendMessage}
                      disabled={isLoading}
                    />
                  </div>
                )}
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <TypingIndicator />
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={1}
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                style={{
                  minHeight: "48px",
                  maxHeight: "200px",
                }}
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl px-5 py-3 font-medium transition-colors flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              Send
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </form>
      </div>
    </div>
  );
}
