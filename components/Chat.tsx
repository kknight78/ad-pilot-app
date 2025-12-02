"use client";

import { useState, useRef, useEffect } from "react";
import Message from "./Message";
import TypingIndicator from "./TypingIndicator";
import { WidgetData } from "@/lib/tools";
import {
  VideoPreviewCard,
  GuidanceRulesCard,
  InventoryGrid,
  ContentCalendar,
  type GuidanceRule,
  type Vehicle,
  type ScheduledPost,
} from "./widgets";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  widget?: WidgetData;
}

// Time-based greeting for welcome message
function getWelcomeMessage(): string {
  const hour = new Date().getHours();
  let greeting: string;
  if (hour < 12) greeting = "Good morning";
  else if (hour < 17) greeting = "Good afternoon";
  else greeting = "Good evening";
  return `${greeting}! Ready when you are — what are we working on today?`;
}

// Widget renderer component
function WidgetRenderer({ widget }: { widget: WidgetData }) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
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
              {message.widget && (
                <div className="flex justify-start mb-4 ml-0">
                  <WidgetRenderer widget={message.widget} />
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
