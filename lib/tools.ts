export interface Tool {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export const tools: Tool[] = [
  {
    name: "get_guidance_rules",
    description: "Get the guidance rules and preferences for this client's video creation. Call this when the user asks about their preferences, rules, or how videos should be created.",
    input_schema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
];

export async function executeTool(
  toolName: string,
  // eslint-disable-next-line no-unused-vars
  _toolInput: Record<string, unknown>
): Promise<unknown> {
  switch (toolName) {
    case "get_guidance_rules": {
      try {
        const response = await fetch(
          "https://corsproxy.io/?" +
            encodeURIComponent(
              "https://kelly-ads.app.n8n.cloud/webhook/guidance-rules"
            ),
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching guidance rules:", error);
        return {
          error: "Failed to fetch guidance rules",
          message: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}
