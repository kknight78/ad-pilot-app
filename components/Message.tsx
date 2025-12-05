"use client";

import ReactMarkdown from "react-markdown";

export interface MessageProps {
  role: "user" | "assistant";
  content: string;
}

// Add line breaks after sentences if Claude forgot to format properly
function formatAssistantContent(content: string): string {
  // If content already has double newlines (proper formatting), leave it alone
  if (content.includes("\n\n")) {
    return content;
  }

  // Add double newline after sentence-ending punctuation followed by a space and capital letter
  // This handles: "First sentence. Second sentence" -> "First sentence.\n\nSecond sentence"
  return content.replace(/([.!?])\s+(?=[A-Z])/g, "$1\n\n");
}

export default function Message({ role, content }: MessageProps) {
  const isUser = role === "user";
  const formattedContent = isUser ? content : formatAssistantContent(content);

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-primary-500 text-white rounded-br-md"
            : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
            <ReactMarkdown>{formattedContent}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
