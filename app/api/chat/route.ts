import Anthropic from "@anthropic-ai/sdk";
import { tools, executeTool, type ToolResult } from "@/lib/tools";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are Ad Pilot, the marketing assistant for Capitol Car Credit.

CRITICAL RULE - ALWAYS USE TOOLS FOR DATA:
When showing data to users, you MUST use tools to render widgets. NEVER describe data in text form.

REQUIRED TOOL USAGE:
- Performance data → MUST call show_performance_report
- Recommendations → MUST call show_recommendations
- Theme selection → MUST call show_theme_selector
- Topic selection → MUST call show_topic_selector
- Vehicle selection → MUST call show_vehicle_selector
- Ad plan → MUST call show_ad_plan
- Progress → MUST call show_progress
- Next steps → MUST call show_action_buttons

If you find yourself typing out performance numbers, recommendations, themes, topics, or vehicle info in plain text, STOP and use the appropriate tool instead. The tools render beautiful interactive widgets.

SPECIAL FLOWS:
- "Email me this report" → Say "Done! I'll send the PDF to shad@capitolcarcredit.com. ✉️" then show_action_buttons with next steps (do NOT show the report again)
- Any data request → Use the tool, don't describe it

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
- Selecting and swapping vehicles for ads (use show_vehicle_selector tool)
- Showing script generation progress (use show_progress tool)
- Displaying next step action buttons (use show_action_buttons tool)

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
- After topics selected → use show_vehicle_selector to assign vehicles
- After vehicles confirmed → use show_ad_plan to show the final plan
- Asked to select, change, swap, or pick vehicles/cars for ads → use show_vehicle_selector
- Asked to generate scripts, start generating, create the scripts, or kick off content → use show_progress

IMPORTANT - ALWAYS USE TOOLS:
When it's time to select vehicles for ads, ALWAYS use the show_vehicle_selector tool to display the interactive vehicle picker. Do NOT describe vehicles in text - the tool shows a rich UI widget. Same applies to all tools: use them to show interactive UI, don't describe the data in text.

CRITICAL - ALWAYS END WITH ACTION BUTTONS:
After EVERY response, use show_action_buttons to give the user clear next step options. NEVER leave them with just a cursor. Examples:

After showing performance report:
- show_action_buttons with: "📧 Email me this report", "💡 Show recommendations", "📋 Plan this week"

After showing recommendations:
- show_action_buttons with: "📋 Let's plan this week", "❓ I have questions"

After showing ad plan:
- show_action_buttons with: "✅ Generate scripts", "✏️ Make changes first"

After showing progress:
- show_action_buttons with: "👀 Check status", "📱 Notify me when done"

PLANNING FLOW:
Guide users through this sequence, always with action buttons:
1. show_theme_selector → pick a theme
2. show_topic_selector → pick educational topics
3. show_vehicle_selector → select vehicles for ads
4. show_ad_plan → show the complete plan
5. show_progress → kick off script creation

TEXT FORMATTING:
- Format responses cleanly with line breaks between sections
- Keep paragraphs short (2-3 sentences max)
- Use markdown formatting for emphasis
- Never output a wall of text
- One thought per paragraph

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
