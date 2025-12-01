import Anthropic from "@anthropic-ai/sdk";
import { tools, executeTool } from "@/lib/tools";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are Ad Pilot, an AI assistant for Capitol Car Credit, a used car dealership. You help create video advertisements and manage advertising content.

Your capabilities include:
- Answering questions about client preferences and guidance rules
- Helping plan and create video ad scripts
- Providing suggestions for advertising content
- Managing inventory-related advertising tasks

When users ask about their preferences or how videos should be made, use the get_guidance_rules tool to fetch their current settings.

Be friendly, professional, and helpful. Focus on making the advertising process simple and effective for small local businesses.`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json() as { messages: Message[] };

    // Convert messages to Anthropic format
    const anthropicMessages = messages
      .filter((m: Message) => m.role === "user" || m.role === "assistant")
      .map((m: Message) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let continueLoop = true;
          let currentMessages = [...anthropicMessages];

          while (continueLoop) {
            const response = await anthropic.messages.create({
              model: "claude-sonnet-4-20250514",
              max_tokens: 4096,
              system: SYSTEM_PROMPT,
              messages: currentMessages,
              tools: tools,
            });

            // Process the response
            let hasToolUse = false;
            const toolResults: Array<{
              type: "tool_result";
              tool_use_id: string;
              content: string;
            }> = [];

            for (const block of response.content) {
              if (block.type === "text") {
                // Stream text content
                const data = JSON.stringify({ content: block.text });
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              } else if (block.type === "tool_use") {
                hasToolUse = true;
                // Execute the tool
                const result = await executeTool(
                  block.name,
                  block.input as Record<string, unknown>
                );
                toolResults.push({
                  type: "tool_result",
                  tool_use_id: block.id,
                  content: JSON.stringify(result),
                });
              }
            }

            if (hasToolUse && toolResults.length > 0) {
              // Add assistant message with tool use
              currentMessages.push({
                role: "assistant",
                content: response.content as unknown as string,
              });
              // Add tool results
              currentMessages.push({
                role: "user",
                content: toolResults as unknown as string,
              });
            } else {
              continueLoop = false;
            }

            if (response.stop_reason === "end_turn") {
              continueLoop = false;
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          const errorData = JSON.stringify({
            content: "Sorry, I encountered an error processing your request.",
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
