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
  SuggestionCards,
  AdPlanWidget,
  ThemeSelector,
  TopicSelector,
  VehicleSelector,
  ProgressIndicator,
  type GuidanceRule,
  type Vehicle,
  type ScheduledPost,
  type PlatformData,
  type TopContent,
  type Recommendation,
  type Suggestion,
  type AdPlanData,
  type Theme,
  type Topic,
  type VehicleOption,
  type AdSlot,
  type ProgressItem,
} from "./widgets";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  widget?: WidgetData;
}

// Time-based greeting for welcome message
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// Welcome message with performance snapshot
function getWelcomeMessage(): string {
  const greeting = getGreeting();
  return `${greeting}, Shad!

Last week: 45k views, 127 leads, $9.84 cost per lead
Top performer: '2024 Malibu Spotlight' on Facebook

What's on the agenda?`;
}

// Quick action buttons for welcome
interface QuickAction {
  emoji: string;
  label: string;
  message: string;
}

const quickActions: QuickAction[] = [
  { emoji: "📊", label: "See Full Report", message: "Show me the performance report" },
  { emoji: "📋", label: "Plan This Week", message: "Let's plan this week" },
  { emoji: "🎬", label: "Create a Video", message: "I want to create a video" },
  { emoji: "💬", label: "Something Else", message: "" },
];

function QuickActionButtons({
  onAction,
  onFocusInput,
  disabled,
}: {
  onAction: (message: string) => void;
  onFocusInput: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-3 ml-0">
      {quickActions.map((action) => (
        <button
          key={action.label}
          onClick={() => {
            if (action.message) {
              onAction(action.message);
            } else {
              onFocusInput();
            }
          }}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{action.emoji}</span>
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
}

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
      return <GuidanceRulesCard rules={data.rules} clientName={data.clientName} />;
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
      return (
        <PerformanceDashboard
          dateRange={data.dateRange}
          totalViews={data.totalViews}
          totalLeads={data.totalLeads}
          totalSpend={data.totalSpend}
          viewsTrend={data.viewsTrend}
          leadsTrend={data.leadsTrend}
          platforms={data.platforms}
          topContent={data.topContent}
        />
      );
    }
    case "recommendations": {
      const data = widget.data as {
        recommendations: Recommendation[];
        suggestions: Suggestion[];
      };
      return (
        <div className="space-y-4">
          <RecommendationsList recommendations={data.recommendations} />
          <SuggestionCards suggestions={data.suggestions} />
        </div>
      );
    }
    case "ad_plan": {
      const data = widget.data as AdPlanData;
      return <AdPlanWidget data={data} />;
    }
    case "theme_selector": {
      const data = widget.data as { themes: Theme[] };
      return (
        <ThemeSelector
          themes={data.themes}
          onContinue={(selectedThemes) => {
            if (selectedThemes.length > 0) {
              onSendMessage(`I chose the "${selectedThemes[0].name}" theme`);
            }
          }}
          onSkip={() => {
            onSendMessage("No theme - keep it general");
          }}
          onRequestMore={() => {
            onSendMessage("Show me more theme options");
          }}
        />
      );
    }
    case "topic_selector": {
      const data = widget.data as { topics: Topic[]; numberOfTopics: number };
      return (
        <TopicSelector
          topics={data.topics}
          numberOfTopics={data.numberOfTopics}
          onContinue={(selectedTopics) => {
            const topicNames = selectedTopics.map((t) => t.title).join(" and ");
            onSendMessage(`I chose these topics: ${topicNames}`);
          }}
          onRequestMore={() => {
            onSendMessage("Show me more topic options");
          }}
          onCustomInput={(customTopic) => {
            onSendMessage(`I want to do a topic about: ${customTopic}`);
          }}
          onSubjectArea={(subject) => {
            onSendMessage(`Generate topics about: ${subject}`);
          }}
        />
      );
    }
    case "vehicle_selector": {
      const data = widget.data as { vehicles: VehicleOption[]; adSlots: AdSlot[] };
      return (
        <VehicleSelector
          vehicles={data.vehicles}
          adSlots={data.adSlots}
          onConfirm={(assignments) => {
            const vehicleCount = assignments.reduce(
              (sum, slot) => sum + slot.vehicleIds.length,
              0
            );
            onSendMessage(
              `I've confirmed the vehicle selections (${vehicleCount} vehicles across ${assignments.length} ad slots)`
            );
          }}
          onReset={() => {
            onSendMessage("Reset vehicle selections to suggestions");
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
    default:
      return null;
  }
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: getWelcomeMessage() },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
        let currentWidget: WidgetData | undefined;

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

                  // Handle widget data
                  if (parsed.widget) {
                    currentWidget = parsed.widget;
                    setMessages((prev) => {
                      const newMessages = [...prev];
                      newMessages[newMessages.length - 1] = {
                        role: "assistant",
                        content: assistantMessage,
                        widget: currentWidget,
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
                        widget: currentWidget,
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
              {/* Show quick actions after welcome message (first message, no user messages yet) */}
              {index === 0 &&
                message.role === "assistant" &&
                messages.length === 1 && (
                  <QuickActionButtons
                    onAction={sendMessage}
                    onFocusInput={() => inputRef.current?.focus()}
                    disabled={isLoading}
                  />
                )}
              {message.widget && (
                <div className="flex justify-start mb-4 ml-0">
                  <WidgetRenderer
                    widget={message.widget}
                    onSendMessage={sendMessage}
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
