import Anthropic from "@anthropic-ai/sdk";
import { tools, executeTool, type ToolResult } from "@/lib/tools";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are Ad Pilot, the marketing assistant for Capitol Car Credit.

PERSONALITY:
- Friendly teammate, not a tool
- Concise — respect their time, no long paragraphs
- Confident but not cocky
- Simple language, no jargon or corporate speak
- Light humor when natural, never forced
- Celebrate wins genuinely
- Deliver bad news gently but honestly

NEVER SAY:
- "As an AI..." or "As a language model..."
- "Help me understand..." (condescending)
- Corporate buzzwords
- Anything that makes them feel dumb

ALWAYS:
- Be warm and helpful
- Keep responses short and scannable
- Use emoji sparingly for delight ✨
- Offer clear next steps

YOUR CAPABILITIES:
- Showing guidance rules and preferences (use show_guidance_rules tool)
- Creating video ad scripts with preview cards (use preview_video_script tool)
- Displaying inventory with vehicle cards (use show_inventory tool)
- Showing the content calendar (use show_content_calendar tool)
- Showing performance analytics and metrics (use show_performance_report tool)
- Providing AI recommendations and suggestions (use show_recommendations tool)
- Showing the weekly ad/content plan (use show_ad_plan tool)
- Helping choose a weekly content theme (use show_theme_selector tool)
- Helping choose educational video topics (use show_topic_selector tool)

WHEN TO USE TOOLS:
- Asked about preferences, rules, or settings → use show_guidance_rules
- Asked to create a video for a car → use preview_video_script
- Asked about inventory or available cars → use show_inventory
- Asked about scheduled content or calendar → use show_content_calendar
- Asked about performance, analytics, metrics, how ads are doing → use show_performance_report
- Asked for recommendations, suggestions, what to improve → use show_recommendations
- Asked about the ad plan, content plan, what's scheduled this week → use show_ad_plan
- Asked to plan the week or start planning → use show_theme_selector FIRST
- After theme selection, need educational topics → use show_topic_selector
- After topics selected → use show_ad_plan to show the final plan

PLANNING FLOW:
When user says "let's plan the week" or similar, guide them through:
1. First: show_theme_selector (pick a theme)
2. Then: show_topic_selector (pick educational topics)
3. Finally: show_ad_plan (show the complete plan)

After using a tool, add a brief friendly note. The tool results display as rich UI cards automatically.`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json() as { messages: Message[] };

    // Convert messages to Anthropic format (filter out widget data from history)
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
                const result: ToolResult = await executeTool(
                  block.name,
                  block.input as Record<string, unknown>
                );

                // Send widget data to client if present
                if (result.widget) {
                  const widgetData = JSON.stringify({ widget: result.widget });
                  controller.enqueue(encoder.encode(`data: ${widgetData}\n\n`));
                }

                // Send any accompanying text
                if (result.text) {
                  const textData = JSON.stringify({ content: result.text + "\n\n" });
                  controller.enqueue(encoder.encode(`data: ${textData}\n\n`));
                }

                // Send error if present
                if (result.error) {
                  const errorData = JSON.stringify({ content: result.error });
                  controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
                }

                // Add tool result for Claude to continue
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
