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
  {
    name: "show_performance_report",
    description:
      "Display the performance dashboard showing last week's ad metrics across platforms. Call this when the user asks about performance, analytics, metrics, how ads are doing, results, or stats.",
    input_schema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "show_recommendations",
    description:
      "Display AI-generated recommendations and suggestions based on performance. Call this when the user asks for recommendations, suggestions, what to improve, ideas, or what to do next.",
    input_schema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "show_ad_plan",
    description:
      "Display the weekly content/ad plan showing scheduled ads across all platforms. Call this when the user asks about the ad plan, content plan, what's scheduled this week, weekly plan, or upcoming ads.",
    input_schema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "show_theme_selector",
    description:
      "Display the theme selector for choosing a weekly content theme. Call this when starting to plan the week, or when the user wants to choose or change the theme for their ads.",
    input_schema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "show_topic_selector",
    description:
      "Display the topic selector for choosing educational video topics. Call this after a theme is selected, or when the user needs to pick topics for their educational content.",
    input_schema: {
      type: "object",
      properties: {
        numberOfTopics: {
          type: "number",
          description: "Number of topics the user needs to select (default: 2)",
        },
      },
      required: [],
    },
  },
];

// Widget types for the response
export type WidgetType =
  | "guidance_rules"
  | "video_preview"
  | "inventory"
  | "content_calendar"
  | "performance_dashboard"
  | "recommendations"
  | "suggestions"
  | "ad_plan"
  | "theme_selector"
  | "topic_selector";

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

    case "show_performance_report": {
      // Demo performance data
      const performanceData = {
        dateRange: "Nov 25 - Dec 1, 2024",
        totalViews: 45200,
        totalLeads: 127,
        totalSpend: 1250,
        viewsTrend: 12,
        leadsTrend: 8,
        platforms: [
          {
            platform: "Facebook",
            views: 22500,
            leads: 68,
            spend: 550,
            cpl: 8.09,
            trend: 15,
          },
          {
            platform: "TikTok",
            views: 18200,
            leads: 42,
            spend: 400,
            cpl: 9.52,
            trend: 22,
          },
          {
            platform: "Instagram",
            views: 4500,
            leads: 17,
            spend: 300,
            cpl: 17.65,
            trend: -5,
          },
        ],
        topContent: [
          {
            title: "2024 Malibu Spotlight",
            platform: "Facebook",
            views: 8500,
            leads: 24,
            featured: true,
          },
          {
            title: "Weekend Flash Sale",
            platform: "TikTok",
            views: 6200,
            leads: 18,
          },
          {
            title: "Customer Testimonial - Johnson Family",
            platform: "Facebook",
            views: 4100,
            leads: 12,
          },
        ],
      };

      return {
        widget: {
          type: "performance_dashboard",
          data: performanceData,
        },
        text: "Here's your performance report for last week:",
      };
    }

    case "show_recommendations": {
      // Demo recommendations data
      const recommendations = [
        {
          id: "1",
          type: "success" as const,
          message:
            "Your TikTok content is outperforming other platforms by 22%. Consider increasing TikTok ad spend.",
        },
        {
          id: "2",
          type: "warning" as const,
          message:
            "Instagram engagement is down 5% this week. Try posting Reels instead of static images.",
        },
        {
          id: "3",
          type: "action" as const,
          message:
            "The 2021 Nissan Altima has been on lot for 45 days. Create a special promotion video to move it faster.",
        },
        {
          id: "4",
          type: "neutral" as const,
          message:
            "Your best posting times are 10am and 2pm. Stick to this schedule for optimal reach.",
        },
      ];

      const suggestions = [
        {
          id: "1",
          icon: "music" as const,
          title: "Trending Audio",
          description: "Add viral sounds to boost reach",
        },
        {
          id: "2",
          icon: "avatar" as const,
          title: "New Avatar Style",
          description: "Try our casual presenter look",
        },
        {
          id: "3",
          icon: "template" as const,
          title: "Holiday Template",
          description: "Seasonal designs available",
        },
        {
          id: "4",
          icon: "holiday" as const,
          title: "Year-End Sale",
          description: "Promote end-of-year deals",
        },
      ];

      return {
        widget: {
          type: "recommendations",
          data: { recommendations, suggestions },
        },
        text: "Based on your performance data, here are my recommendations:",
      };
    }

    case "show_ad_plan": {
      // Demo ad plan data
      const adPlanData = {
        dateRange: "Dec 2-8",
        strategyBadges: [
          "Avatar variety",
          "Template mix",
          "Platform-optimized",
          "Theme: Winter",
        ],
        platforms: [
          {
            platform: "tiktok" as const,
            items: [
              {
                id: "tt1",
                description: "Ad #1",
                template: "Multi-car",
                vehicles: 2,
                avatar: "Hannah",
                length: "15-30s",
                adSpend: 15,
              },
              {
                id: "tt2",
                description: "Ad #2",
                template: "Multi-car",
                vehicles: 2,
                avatar: "Shad",
                length: "15-30s",
                adSpend: 15,
              },
              {
                id: "tt3",
                description: "Spotlight",
                template: "Single-car",
                vehicles: 1,
                avatar: "Hannah",
                length: "15-30s",
                adSpend: 15,
              },
              {
                id: "tt4",
                description: "Educational",
                template: "Educational",
                topic: "Winter Tires",
                avatar: "Shad",
                length: "15-30s",
                adSpend: 10,
              },
              {
                id: "tt5",
                description: "Ad #3",
                template: "Multi-car",
                vehicles: 2,
                avatar: "Gary",
                length: "15-30s",
                adSpend: 15,
              },
            ],
            subtotal: 70,
          },
          {
            platform: "facebook" as const,
            items: [
              {
                id: "fb1",
                description: "Ad #1",
                template: "Multi-car",
                vehicles: 3,
                avatar: "Gary",
                length: "30-45s",
                adSpend: 25,
              },
              {
                id: "fb2",
                description: "Spotlight",
                template: "Single-car",
                vehicles: 1,
                avatar: "Shad",
                length: "30-45s",
                adSpend: 20,
              },
              {
                id: "fb3",
                description: "Testimonial",
                template: "Testimonial",
                avatar: "Gary",
                length: "30-45s",
                adSpend: 15,
              },
            ],
            subtotal: 60,
          },
          {
            platform: "youtube" as const,
            items: [
              {
                id: "yt1",
                description: "Educational",
                template: "Educational",
                topic: "Winterizing Your Car",
                avatar: "Shad",
                length: "45-60s",
                adSpend: "free" as const,
              },
              {
                id: "yt2",
                description: "Educational",
                template: "Educational",
                topic: "How Financing Works",
                avatar: "Gary",
                length: "45-60s",
                adSpend: "free" as const,
              },
            ],
            subtotal: 0,
          },
          {
            platform: "instagram" as const,
            items: [
              {
                id: "ig1",
                description: "Ad #1",
                template: "Multi-car",
                vehicles: 2,
                avatar: "Hannah",
                length: "15-30s",
                adSpend: 15,
              },
              {
                id: "ig2",
                description: "Spotlight",
                template: "Single-car",
                vehicles: 1,
                avatar: "Hannah",
                length: "15-30s",
                adSpend: 15,
              },
            ],
            subtotal: 30,
          },
        ],
        totalContent: 12,
        totalAdSpend: 160,
      };

      return {
        widget: {
          type: "ad_plan",
          data: adPlanData,
        },
        text: "Here's your content plan for this week:",
      };
    }

    case "show_theme_selector": {
      // Theme options
      const themes = [
        {
          id: "winter",
          emoji: "❄️",
          name: "Winter Weather",
          tagline: "Ready for winter? We've got you covered!",
        },
        {
          id: "holiday",
          emoji: "🎄",
          name: "Holiday Season",
          tagline: "Give the gift of a great deal!",
        },
        {
          id: "yearend",
          emoji: "💰",
          name: "Year-End Savings",
          tagline: "End the year in a new ride!",
        },
        {
          id: "bowl",
          emoji: "🏈",
          name: "Bowl Season",
          tagline: "Score big with these deals!",
        },
      ];

      return {
        widget: {
          type: "theme_selector",
          data: { themes },
        },
        text: "Let's start by picking a theme for this week's content:",
      };
    }

    case "show_topic_selector": {
      const numberOfTopics =
        (toolInput.numberOfTopics as number) || 2;

      // Topic options
      const topics = [
        {
          id: "buying-tips",
          emoji: "🚗",
          title: "5 Things to Check Before Buying Used",
        },
        {
          id: "financing",
          emoji: "💵",
          title: "How Financing Actually Works",
        },
        {
          id: "winterizing",
          emoji: "❄️",
          title: "Winterizing Your Vehicle",
        },
        {
          id: "trade-in",
          emoji: "🔧",
          title: "When to Trade In",
        },
        {
          id: "first-car",
          emoji: "🎓",
          title: "First Car Buyer's Guide",
        },
      ];

      return {
        widget: {
          type: "topic_selector",
          data: { topics, numberOfTopics },
        },
        text: `Great! Now pick ${numberOfTopics} topic${numberOfTopics !== 1 ? "s" : ""} for your educational videos:`,
      };
    }

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}
