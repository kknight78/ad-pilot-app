"use client";

import ReactMarkdown from "react-markdown";

export interface MessageProps {
  role: "user" | "assistant";
  content: string;
}

// Fix formatting issues when Claude doesn't follow instructions
function formatAssistantContent(content: string): string {
  let result = content;

  // Detect list-like content without markdown dashes
  // Pattern: Line ending with "?" or ":" followed by lines starting with capital letters
  // that look like list items (short phrases without ending punctuation)
  const listPatterns = [
    // "What would you like to do next?\nStart planning\nCheck rules" -> add dashes
    /(\?)\n([A-Z][^\n.!?]*)\n([A-Z][^\n.!?]*)/g,
    // "You could:\nStart planning\nCheck rules" -> add dashes
    /(:)\n([A-Z][^\n.!?]*)\n([A-Z][^\n.!?]*)/g,
  ];

  // Check if content looks like a list without dashes
  const lines = result.split("\n");
  const hasQuestionOrColon = lines.some(l => l.endsWith("?") || l.endsWith(":"));
  const hasMultipleShortLines = lines.filter(l =>
    l.length > 0 &&
    l.length < 50 &&
    !l.startsWith("-") &&
    !l.endsWith(".") &&
    !l.endsWith("?") &&
    !l.endsWith(":")
  ).length >= 2;

  if (hasQuestionOrColon && hasMultipleShortLines) {
    // Convert lines that look like list items to markdown list
    let inList = false;
    const formattedLines = lines.map((line, i) => {
      // Start of list after ? or :
      if (line.endsWith("?") || line.endsWith(":")) {
        inList = true;
        return line;
      }
      // List item: short line, starts with capital, no ending punctuation
      if (inList && line.length > 0 && line.length < 50 && /^[A-Z]/.test(line) && !line.startsWith("-")) {
        return `- ${line}`;
      }
      // Empty line or regular text ends the list
      if (line.length === 0 || line.endsWith(".") || line.endsWith("!")) {
        inList = false;
      }
      return line;
    });
    result = formattedLines.join("\n");
  }

  // Add blank line before list if not present
  result = result.replace(/(\?|\:)\n-/g, "$1\n\n-");

  // Add double newline after sentence-ending punctuation followed by a space and capital letter
  // But only if there aren't already double newlines
  if (!result.includes("\n\n")) {
    result = result.replace(/([.!?])\s+(?=[A-Z])/g, "$1\n\n");
  }

  return result;
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
