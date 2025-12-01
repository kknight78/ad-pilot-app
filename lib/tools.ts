import type { GuidanceRule } from "@/components/widgets/GuidanceRulesCard";
import type { Vehicle } from "@/components/widgets/InventoryCard";

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
    name: "show_guidance_rules",
    description:
      "Display the client's guidance rules in a nice card format. Call this when the user asks about their preferences, rules, settings, or how videos should be created.",
    input_schema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "preview_video_script",
    description:
      "Generate and show a video preview card with script for a specific vehicle. Call this when the user wants to create a video ad for a car.",
    input_schema: {
      type: "object",
      properties: {
        vehicle: {
          type: "string",
          description: "The vehicle to feature (e.g., '2024 Chevrolet Malibu')",
        },
        style: {
          type: "string",
          description:
            "The video style/template (e.g., 'energetic', 'professional', 'casual')",
          enum: ["energetic", "professional", "casual", "luxury"],
        },
      },
      required: ["vehicle"],
    },
  },
  {
    name: "show_inventory",
    description:
      "Display available vehicles from the inventory in a grid of cards. Call this when the user asks about inventory, what cars are available, or wants to see vehicles.",
    input_schema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of vehicles to show (default: 4)",
        },
        filter: {
          type: "string",
          description:
            "Optional filter like 'SUV', 'sedan', 'under 20000', etc.",
        },
      },
      required: [],
    },
  },
  {
    name: "show_content_calendar",
    description:
      "Display the content calendar showing scheduled posts for the week. Call this when the user asks about scheduled content, upcoming posts, or the content calendar.",
    input_schema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
];

// Widget types for the response
export type WidgetType =
  | "guidance_rules"
  | "video_preview"
  | "inventory"
  | "content_calendar";

export interface WidgetData {
  type: WidgetType;
  data: unknown;
}

export interface ToolResult {
  widget?: WidgetData;
  text?: string;
  error?: string;
}

export async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>
): Promise<ToolResult> {
  switch (toolName) {
    case "show_guidance_rules": {
      try {
        // Try to fetch from n8n webhook
        const response = await fetch(
          "https://kelly-ads.app.n8n.cloud/webhook/guidance-rules",
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        let rules: GuidanceRule[];

        if (response.ok) {
          const data = await response.json();
          // Transform API response to our format if needed
          rules = Array.isArray(data)
            ? data
            : [
                {
                  id: "1",
                  category: "tone",
                  rule: data.tone || "Professional but friendly",
                },
                {
                  id: "2",
                  category: "content",
                  rule: data.content || "Always mention financing options",
                },
                {
                  id: "3",
                  category: "cta",
                  rule:
                    data.cta || "Include call to action with phone number",
                },
              ];
        } else {
          // Fallback to demo data
          rules = [
            {
              id: "1",
              category: "tone",
              rule: "Professional but friendly - approachable for families",
            },
            {
              id: "2",
              category: "tone",
              rule: "Emphasize value and reliability over luxury",
            },
            {
              id: "3",
              category: "content",
              rule: "Always mention financing options available",
            },
            {
              id: "4",
              category: "content",
              rule: "Highlight warranty coverage when applicable",
            },
            {
              id: "5",
              category: "cta",
              rule: "End with phone number: (555) 123-4567",
            },
            {
              id: "6",
              category: "cta",
              rule: 'Use phrase "Come see us today!"',
            },
            {
              id: "7",
              category: "style",
              rule: "Videos should be 30-45 seconds",
            },
            {
              id: "8",
              category: "style",
              rule: "Use upbeat background music",
            },
          ];
        }

        return {
          widget: {
            type: "guidance_rules",
            data: { rules, clientName: "Capitol Car Credit" },
          },
          text: "Here are your current guidance rules for video creation:",
        };
      } catch (error) {
        console.error("Error fetching guidance rules:", error);
        return {
          error: "Failed to fetch guidance rules. Please try again.",
        };
      }
    }

    case "preview_video_script": {
      const vehicle = toolInput.vehicle as string;
      const style = (toolInput.style as string) || "professional";

      // Generate a script based on the vehicle and style
      const scripts: Record<string, { hook: string; script: string }> = {
        energetic: {
          hook: `Stop scrolling! This ${vehicle} is about to change your life!`,
          script: `Looking for a ride that turns heads AND saves money? This ${vehicle} has it all! Low miles, great condition, and a price that'll make you smile. Plus, we've got financing options that work for YOUR budget. Don't let this one slip away - come see us at Capitol Car Credit today!`,
        },
        professional: {
          hook: `Introducing your next vehicle: the ${vehicle}`,
          script: `At Capitol Car Credit, we're proud to present this exceptional ${vehicle}. With its combination of reliability, comfort, and value, it's the perfect choice for drivers who demand quality. We offer flexible financing options to help make your purchase seamless. Visit our lot today and experience the Capitol Car Credit difference.`,
        },
        casual: {
          hook: `Hey, check out this sweet ${vehicle} we just got in!`,
          script: `So we've got this awesome ${vehicle} sitting on our lot, and honestly, it's not gonna last long. Great condition, priced right, and we can work with you on financing. Seriously, just come by Capitol Car Credit and take a look - I think you're gonna love it!`,
        },
        luxury: {
          hook: `Experience excellence with this stunning ${vehicle}`,
          script: `Discover refined elegance in this meticulously maintained ${vehicle}. Every detail speaks to quality and sophistication. At Capitol Car Credit, we believe exceptional vehicles deserve exceptional service. Our team is ready to provide a premium buying experience with personalized financing solutions. Schedule your private viewing today.`,
        },
      };

      const selectedScript = scripts[style] || scripts.professional;

      return {
        widget: {
          type: "video_preview",
          data: {
            title: vehicle,
            hook: selectedScript.hook,
            script: selectedScript.script,
            duration: "~35 seconds",
            status: "preview",
          },
        },
        text: `I've created a ${style} video script for the ${vehicle}:`,
      };
    }

    case "show_inventory": {
      const limit = (toolInput.limit as number) || 4;

      // Demo inventory data - in production, this would fetch from n8n/database
      const allVehicles: Vehicle[] = [
        {
          id: "1",
          year: 2024,
          make: "Chevrolet",
          model: "Malibu",
          trim: "LT",
          price: 24995,
          mileage: 12500,
          features: ["Apple CarPlay", "Backup Camera", "Bluetooth"],
          daysOnLot: 5,
        },
        {
          id: "2",
          year: 2023,
          make: "Honda",
          model: "CR-V",
          trim: "EX",
          price: 29995,
          mileage: 18200,
          features: ["AWD", "Sunroof", "Lane Assist"],
          daysOnLot: 12,
        },
        {
          id: "3",
          year: 2022,
          make: "Toyota",
          model: "Camry",
          trim: "SE",
          price: 22500,
          mileage: 28000,
          features: ["Sport Mode", "LED Headlights", "Safety Sense"],
          daysOnLot: 21,
        },
        {
          id: "4",
          year: 2023,
          make: "Ford",
          model: "Explorer",
          trim: "XLT",
          price: 38995,
          mileage: 15800,
          features: ["3rd Row", "4WD", "SYNC 4"],
          daysOnLot: 8,
        },
        {
          id: "5",
          year: 2021,
          make: "Nissan",
          model: "Altima",
          trim: "SV",
          price: 19500,
          mileage: 35000,
          features: ["ProPILOT", "Remote Start", "Heated Seats"],
          daysOnLot: 45,
        },
        {
          id: "6",
          year: 2024,
          make: "Hyundai",
          model: "Tucson",
          trim: "SEL",
          price: 31500,
          mileage: 8500,
          features: ["AWD", "Digital Key", "Wireless Charging"],
          daysOnLot: 3,
        },
      ];

      const vehicles = allVehicles.slice(0, limit);

      return {
        widget: {
          type: "inventory",
          data: { vehicles },
        },
        text: `Here are ${vehicles.length} vehicles currently in inventory:`,
      };
    }

    case "show_content_calendar": {
      // Demo calendar data
      const today = new Date();
      const posts = [
        {
          id: "1",
          date: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() - 1
          ).toISOString(),
          title: "2023 Honda CR-V Feature",
          platform: "facebook" as const,
          status: "published" as const,
          time: "10:00 AM",
        },
        {
          id: "2",
          date: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          ).toISOString(),
          title: "Weekend Sale Promo",
          platform: "tiktok" as const,
          status: "scheduled" as const,
          time: "2:00 PM",
        },
        {
          id: "3",
          date: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + 1
          ).toISOString(),
          title: "2024 Malibu Spotlight",
          platform: "facebook" as const,
          status: "scheduled" as const,
          time: "11:00 AM",
        },
        {
          id: "4",
          date: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + 2
          ).toISOString(),
          title: "Customer Testimonial",
          platform: "instagram" as const,
          status: "draft" as const,
        },
        {
          id: "5",
          date: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + 4
          ).toISOString(),
          title: "SUV Comparison",
          platform: "youtube" as const,
          status: "scheduled" as const,
          time: "3:00 PM",
        },
      ];

      return {
        widget: {
          type: "content_calendar",
          data: { posts },
        },
        text: "Here's your content calendar for this week:",
      };
    }

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}
