"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Message from "./Message";
import TypingIndicator from "./TypingIndicator";
import { Button } from "@/components/ui/button";
import { WidgetData } from "@/lib/tools-v2";
import {
  ConversationState,
  initialFlowState,
  GoldenPathStep,
  isDetourStep,
  isGoldenPathStep,
} from "@/types/flowState";
import {
  // V2 widgets with real backend integration
  PerformanceDashboard,
  ThemeSelectorV2,
  TopicSelectorV2,
  VehicleSelectorV2,
  AdPlanWidget,
  ScriptApprovalCards,
  GenerationProgress,
  VideoReadyWidget,
  RecommendationsList,
  GuidanceRulesCard,
  AvatarPhotoCapture,
  VoiceCapture,
  InvoiceWidget,
  ActionButtons,
} from "./widgets";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  widgets?: WidgetData[];
}

// Time-based greeting for welcome message (client-side only)
function getGreeting(): string {
  if (typeof window === "undefined") return "Hey";
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// Static initial message to avoid hydration mismatch
const INITIAL_WELCOME = "Hey, Shad! Here's how last week went:";

// Get formatted date strings for week planning
function getWeekDates() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  // Get start of current week (Sunday)
  const currentWeekStart = new Date(today);
  currentWeekStart.setDate(today.getDate() - dayOfWeek);
  // Get start of next week
  const nextWeekStart = new Date(currentWeekStart);
  nextWeekStart.setDate(currentWeekStart.getDate() + 7);

  const formatDate = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;

  return {
    currentWeek: formatDate(currentWeekStart),
    nextWeek: formatDate(nextWeekStart),
  };
}

// Widget renderer — maps widget types to V2 components
function WidgetRenderer({
  widget,
  onSendMessage,
  flowState,
  onStateUpdate,
  onAddAssistantMessage,
}: {
  widget: WidgetData;
  onSendMessage: (message: string) => void;
  flowState: ConversationState;
  onStateUpdate: (update: Partial<ConversationState>) => void;
  onAddAssistantMessage: (content: string, widgets: WidgetData[]) => void;
}) {
  switch (widget.type) {
    case "performance_dashboard":
      // Self-contained widget — fetches its own data
      return <PerformanceDashboard />;

    case "theme_selector": {
      const isCompleted = flowState.completedSteps.includes("theme_selector");
      return (
        <ThemeSelectorV2
          completed={isCompleted}
          selectedValue={flowState.selections?.theme || undefined}
          onEdit={() => {
            // Re-expand the widget by removing from completedSteps
            onStateUpdate({
              currentStep: "theme_selector",
              completedSteps: flowState.completedSteps.filter(s => s !== "theme_selector") as GoldenPathStep[],
            });
          }}
          onContinue={(theme) => {
            // Update state - move to topic_selector (silent, no user bubble)
            onStateUpdate({
              currentStep: "topic_selector",
              completedSteps: [...flowState.completedSteps, "theme_selector"] as GoldenPathStep[],
              selections: { ...flowState.selections, theme: theme || "general" },
            });
            // Add assistant message with next widget
            onAddAssistantMessage("Great choice! Now let's pick your topics:", [{ type: "topic_selector" }]);
          }}
        />
      );
    }

    case "topic_selector": {
      const isCompleted = flowState.completedSteps.includes("topic_selector");
      return (
        <TopicSelectorV2
          completed={isCompleted}
          selectedValues={flowState.selections?.topics || undefined}
          onEdit={() => {
            // Re-expand the widget by removing from completedSteps
            onStateUpdate({
              currentStep: "topic_selector",
              completedSteps: flowState.completedSteps.filter(s => s !== "topic_selector") as GoldenPathStep[],
            });
          }}
          onContinue={(topics) => {
            // Update state (silent, no user bubble)
            onStateUpdate({
              currentStep: "ad_plan",
              completedSteps: [...flowState.completedSteps, "topic_selector"] as GoldenPathStep[],
              selections: { ...flowState.selections, topics },
            });
            // Add assistant message with next widget
            onAddAssistantMessage("Here's your ad plan for the week:", [{ type: "ad_plan" }]);
          }}
        />
      );
    }

    case "ad_plan": {
      const isCompleted = flowState.completedSteps.includes("ad_plan");
      return (
        <AdPlanWidget
          completed={isCompleted}
          onEditPlan={() => {
            // Re-expand the widget by removing from completedSteps
            onStateUpdate({
              currentStep: "ad_plan",
              completedSteps: flowState.completedSteps.filter(s => s !== "ad_plan") as GoldenPathStep[],
            });
          }}
          onConfirm={() => {
            // Update state (silent, no user bubble)
            onStateUpdate({
              currentStep: "vehicle_selector",
              completedSteps: [...flowState.completedSteps, "ad_plan"] as GoldenPathStep[],
            });
            // Add assistant message with next widget
            onAddAssistantMessage("Now let's assign vehicles to each ad:", [{ type: "vehicle_selector" }]);
          }}
        />
      );
    }

    case "vehicle_selector": {
      const isCompleted = flowState.completedSteps.includes("vehicle_selector");
      return (
        <VehicleSelectorV2
          completed={isCompleted}
          selectedCount={flowState.selections?.vehicleCount || undefined}
          onEdit={() => {
            // Re-expand the widget by removing from completedSteps
            onStateUpdate({
              currentStep: "vehicle_selector",
              completedSteps: flowState.completedSteps.filter(s => s !== "vehicle_selector") as GoldenPathStep[],
            });
          }}
          onContinue={(selections) => {
            // Extract VINs from Vehicle objects for state storage
            const vehicleAssignments: Record<string, string[]> = {};
            for (const [adId, vehicles] of Object.entries(selections)) {
              vehicleAssignments[adId] = vehicles
                .map((v) => v.vin)
                .filter((vin): vin is string => vin !== undefined);
            }
            const totalVehicles = Object.values(selections).flat().length;

            // Update state (silent, no user bubble)
            onStateUpdate({
              currentStep: "script_approval",
              completedSteps: [...flowState.completedSteps, "vehicle_selector"] as GoldenPathStep[],
              selections: {
                ...flowState.selections,
                vehicleAssignments,
                vehicleCount: totalVehicles,
              },
            });
            // Add assistant message with next widget
            onAddAssistantMessage("Here are the scripts for your approval:", [{ type: "script_approval" }]);
          }}
        />
      );
    }

    case "script_approval": {
      const isCompleted = flowState.completedSteps.includes("script_approval");
      const approvedCount = flowState.selections?.approvedScripts?.length || 0;
      return (
        <ScriptApprovalCards
          completed={isCompleted}
          approvedCount={approvedCount > 0 ? approvedCount : undefined}
          onEdit={() => {
            // Re-expand the widget by removing from completedSteps
            onStateUpdate({
              currentStep: "script_approval",
              completedSteps: flowState.completedSteps.filter(s => s !== "script_approval") as GoldenPathStep[],
            });
          }}
          onApprove={(id) => {
            // Track approved scripts
            const current = flowState.selections?.approvedScripts || [];
            if (!current.includes(id)) {
              onStateUpdate({
                selections: {
                  ...flowState.selections,
                  approvedScripts: [...current, id],
                },
              });
            }
          }}
          onComplete={() => {
            // Get count of approved scripts for collapsed display
            const scriptsApproved = flowState.selections?.approvedScripts?.length || 3; // Default to demo count
            // Update state (silent, no user bubble)
            onStateUpdate({
              currentStep: "generation_progress",
              completedSteps: [...flowState.completedSteps, "script_approval"] as GoldenPathStep[],
              selections: {
                ...flowState.selections,
                approvedScripts: flowState.selections?.approvedScripts || ["script1", "script2", "script3"], // Default if not tracked
              },
            });
            // Add assistant message with next widget
            onAddAssistantMessage("Generating your videos now...", [{ type: "generation_progress" }]);
          }}
        />
      );
    }

    case "generation_progress":
      return (
        <GenerationProgress
          onPreviewAll={() => {
            // Update state (silent, no user bubble)
            onStateUpdate({
              currentStep: "publish_widget",
              completedSteps: [...flowState.completedSteps, "generation_progress"] as GoldenPathStep[],
            });
            // Add assistant message with next widget
            onAddAssistantMessage("Your videos are ready! Review and approve for publishing:", [{ type: "publish_widget" }]);
          }}
        />
      );

    case "publish_widget":
      return (
        <VideoReadyWidget
          onPublish={(videos) => {
            console.log("Published videos:", videos);
            // Update state (silent, no user bubble)
            onStateUpdate({
              currentStep: "wrap_up",
              completedSteps: [...flowState.completedSteps, "publish_widget"] as GoldenPathStep[],
            });
            // Add assistant message for wrap up
            onAddAssistantMessage("All done! Your content is scheduled. Anything else you'd like to work on?", []);
          }}
          onRemove={(videoId) => {
            console.log("Removed video:", videoId);
          }}
          onRegenerate={(videoId, options) => {
            console.log("Regenerating video:", videoId, "with options:", options);
          }}
        />
      );

    case "recommendations":
      return (
        <RecommendationsList
          onDismiss={() => {
            // Return from detour if we were on one - SILENT action (no user bubble)
            if (flowState.detourStack.length > 0) {
              const returnTo = flowState.detourStack[flowState.detourStack.length - 1];
              onStateUpdate({
                currentStep: returnTo,
                detourStack: flowState.detourStack.slice(0, -1),
              });
              // Add message - only include widget if returnTo has a corresponding widget (not wrap_up)
              if (returnTo !== "wrap_up") {
                onAddAssistantMessage("Back to where we were! What would you like to do next?", [{ type: returnTo as WidgetData["type"] }]);
              } else {
                onAddAssistantMessage("All done! Anything else you'd like to work on?", []);
              }
            }
          }}
          onAction={(_id, actionLabel) => {
            // Handle specific recommendation actions - SILENT (no user bubble)
            if (actionLabel === "Create New Avatar") {
              // Push current step to detour stack before going to avatar
              const currentAsGolden = isGoldenPathStep(flowState.currentStep)
                ? flowState.currentStep
                : flowState.detourStack[flowState.detourStack.length - 1] || "performance_dashboard";
              onStateUpdate({
                currentStep: "avatar_photo",
                detourStack: [...flowState.detourStack, currentAsGolden],
              });
              // Add assistant message with avatar widget
              onAddAssistantMessage("Let's create a new avatar for you:", [{ type: "avatar_photo" }]);
            }
            // Other actions could navigate to different widgets or show info
          }}
        />
      );

    case "guidance_rules":
      return <GuidanceRulesCard />;

    case "avatar_photo":
      return (
        <AvatarPhotoCapture
          onCapture={(_imageData, _avatarName) => {
            // Return from detour - SILENT action (no user bubble)
            // The success message is already shown in the widget
            const returnTo = flowState.detourStack[flowState.detourStack.length - 1] || "performance_dashboard";
            onStateUpdate({
              currentStep: returnTo,
              detourStack: flowState.detourStack.slice(0, -1),
            });
            // Add message when returning from avatar capture - only include widget if not wrap_up
            if (returnTo !== "wrap_up") {
              onAddAssistantMessage("Avatar submitted! Returning to where we were:", [{ type: returnTo as WidgetData["type"] }]);
            } else {
              onAddAssistantMessage("Avatar submitted! All done. Anything else you'd like to work on?", []);
            }
          }}
        />
      );

    case "voice_capture":
      return (
        <VoiceCapture
          onCapture={(_audioBlob) => {
            // Return from detour - SILENT action (no user bubble)
            const returnTo = flowState.detourStack[flowState.detourStack.length - 1] || "performance_dashboard";
            onStateUpdate({
              currentStep: returnTo,
              detourStack: flowState.detourStack.slice(0, -1),
            });
            if (returnTo !== "wrap_up") {
              onAddAssistantMessage("Voice clone created! Returning to where we were:", [{ type: returnTo as WidgetData["type"] }]);
            } else {
              onAddAssistantMessage("Voice clone created! All done. Anything else you'd like to work on?", []);
            }
          }}
          onSkip={() => {
            const returnTo = flowState.detourStack[flowState.detourStack.length - 1] || "performance_dashboard";
            onStateUpdate({
              currentStep: returnTo,
              detourStack: flowState.detourStack.slice(0, -1),
            });
            if (returnTo !== "wrap_up") {
              onAddAssistantMessage("No problem! You can record your voice anytime. Returning to where we were:", [{ type: returnTo as WidgetData["type"] }]);
            } else {
              onAddAssistantMessage("No problem! You can record your voice anytime. Anything else you'd like to work on?", []);
            }
          }}
        />
      );

    case "billing":
      return <InvoiceWidget />;

    case "action_buttons":
      // Dynamic action buttons from Claude
      if (widget.buttons && widget.buttons.length > 0) {
        return (
          <ActionButtons
            buttons={widget.buttons.map(b => ({
              label: b.label,
              message: b.message,
              variant: b.variant as "primary" | "secondary" | undefined,
            }))}
            onAction={onSendMessage}
          />
        );
      }
      return null;

    default:
      return null;
  }
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: INITIAL_WELCOME,
      widgets: [{ type: "performance_dashboard" }]
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const latestUserMessageRef = useRef<HTMLDivElement>(null);

  // Flow state for tracking conversation progress
  const [flowState, setFlowState] = useState<ConversationState>(initialFlowState);

  // Demo state - whether user has a plan for current week (would come from API in production)
  const [hasPlanForCurrentWeek, setHasPlanForCurrentWeek] = useState(false);

  // Helper for state updates - merges updates properly
  const updateFlowState = useCallback((update: Partial<ConversationState>) => {
    setFlowState((prev) => ({
      ...prev,
      ...update,
      selections: update.selections
        ? { ...prev.selections, ...update.selections }
        : prev.selections,
      completedSteps: update.completedSteps || prev.completedSteps,
      detourStack: update.detourStack !== undefined ? update.detourStack : prev.detourStack,
    }));
  }, []);

  // Helper to add assistant messages with widgets (for silent navigation)
  const addAssistantMessage = useCallback((content: string, widgets: WidgetData[]) => {
    setMessages(prev => [...prev, {
      role: "assistant" as const,
      content,
      widgets: widgets.length > 0 ? widgets : undefined,
    }]);
  }, []);

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

  // Track previous step to detect actual navigation (not initial load)
  const prevStepRef = useRef<string | null>(null);

  // Scroll to bottom when flow state changes (e.g., when navigating to avatar widget)
  // Skip on initial load - only scroll when step actually changes
  useEffect(() => {
    if (prevStepRef.current !== null && prevStepRef.current !== flowState.currentStep) {
      // Small delay to let the new widget render
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return () => clearTimeout(timer);
    }
    prevStepRef.current = flowState.currentStep;
  }, [flowState.currentStep]);

  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim() || isLoading) return;

      // Quick triggers for widgets (for testing/demo)
      const lowerMessage = userMessage.toLowerCase().trim();
      if (lowerMessage === "voice" || lowerMessage === "record voice" || lowerMessage === "voice clone") {
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
        // Push current step to detour stack
        setFlowState((prev) => ({
          ...prev,
          detourStack: [...prev.detourStack, prev.currentStep],
          currentStep: "voice_capture",
        }));
        addAssistantMessage("Let's record your voice for your AI clone:", [{ type: "voice_capture" }]);
        return;
      }

      setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

      // Scroll user's message to top of viewport after it renders
      setTimeout(() => {
        latestUserMessageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, { role: "user", content: userMessage }],
            flowState, // Include flow state for Claude's context
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

                  // Handle widget data
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
    [messages, isLoading, flowState]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    await sendMessage(userMessage);
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-56px)] md:h-[calc(100dvh-72px)]">
      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3 md:p-6 chat-scrollbar bg-gray-50"
      >
        <div className="max-w-3xl mx-auto">
          {messages.map((message, index) => {
            // Track the latest user message for scroll targeting
            const isLatestUserMessage = message.role === "user" && index === messages.length - 2;
            return (
            <div
              key={index}
              ref={isLatestUserMessage ? latestUserMessageRef : undefined}
            >
              <Message role={message.role} content={message.content} />
              {/* Render all widgets for this message */}
              {message.widgets && message.widgets.map((widget, widgetIndex) => (
                <div key={widgetIndex} className="flex justify-start mb-4 ml-0">
                  <WidgetRenderer
                    widget={widget}
                    onSendMessage={sendMessage}
                    flowState={flowState}
                    onStateUpdate={updateFlowState}
                    onAddAssistantMessage={addAssistantMessage}
                  />
                </div>
              ))}
              {/* Show welcome action buttons after performance dashboard when at that step */}
              {message.role === "assistant" &&
                index === messages.length - 1 &&
                flowState.currentStep === "performance_dashboard" &&
                message.widgets?.some(w => w.type === "performance_dashboard") && (
                  <div className="flex flex-wrap gap-2 my-2 mb-4">
                    {hasPlanForCurrentWeek ? (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            // Navigate to update existing plan
                            updateFlowState({
                              currentStep: "ad_plan",
                            });
                            setMessages(prev => [...prev, {
                              role: "assistant",
                              content: "Here's your current plan. Make any changes you'd like:",
                              widgets: [{ type: "ad_plan" }],
                            }]);
                          }}
                          disabled={isLoading}
                        >
                          Update this week&apos;s plan
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Start planning for next week
                            updateFlowState({
                              currentStep: "theme_selector",
                            });
                            const { nextWeek } = getWeekDates();
                            setMessages(prev => [...prev, {
                              role: "assistant",
                              content: `Let's plan the week of ${nextWeek}! First, pick a theme:`,
                              widgets: [{ type: "theme_selector" }],
                            }]);
                          }}
                          disabled={isLoading}
                          className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          Plan week of {getWeekDates().nextWeek}
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          // Silent navigation to theme selector (start planning flow)
                          updateFlowState({
                            currentStep: "theme_selector",
                          });
                          // Add assistant message with theme selector
                          setMessages(prev => [...prev, {
                            role: "assistant",
                            content: "Let's plan this week's content! First, pick a theme:",
                            widgets: [{ type: "theme_selector" }],
                          }]);
                        }}
                        disabled={isLoading}
                      >
                        Plan this week
                      </Button>
                    )}
                  </div>
                )}
            </div>
          );
          })}
          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <TypingIndicator />
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white p-2 md:p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Type your message..."
              className="w-full rounded-full border border-gray-300 px-4 py-2.5 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full p-2 transition-colors"
            >
              <svg
                className="w-4 h-4"
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
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
