/**
 * Ad Pilot Chat Tools — Clean Slate
 *
 * Simple tool definitions for widget display.
 * Widgets are self-contained and fetch their own data.
 * Claude just decides WHEN to show them.
 */

export interface Tool {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

// Widget type identifiers
export type WidgetType =
  | "performance_dashboard"
  | "theme_selector"
  | "topic_selector"
  | "ad_plan"
  | "vehicle_selector"
  | "script_approval"
  | "generation_progress"
  | "publish_widget"
  | "recommendations"
  | "guidance_rules"
  | "avatar_photo"
  | "billing";

export interface WidgetData {
  type: WidgetType;
}

export interface ToolResult {
  widget: WidgetData;
}

// Tool definitions — one per widget, no data passing
export const tools: Tool[] = [
  {
    name: "show_performance_dashboard",
    description: "Show last week's performance metrics. Use this first when user opens chat, or when they ask about how ads are doing, performance, analytics, or metrics.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "show_theme_selector",
    description: "Show the theme picker for this week's ads. Use when starting to plan, or when user wants to set/change the weekly theme. Has 3 options: Choose for me, I have something specific, Inspire me.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "show_topic_selector",
    description: "Show the topic picker for Capitol Smarts educational videos. Use after theme is selected, only if plan includes educational content. User picks 2 topics.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "show_ad_plan",
    description: "Show the weekly content plan table. Use after theme/topics are selected, or when user wants to see/edit their ad plan. Shows all ads by platform with edit capability.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "show_vehicle_selector",
    description: "Show the vehicle assignment interface. Use after ad plan is confirmed, when user needs to pick which vehicles to feature in their ads.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "show_script_approval",
    description: "Show generated scripts for review. Use after vehicles are assigned, or when user asks to see/approve scripts. Allows approve, edit, or regenerate per script.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "show_generation_progress",
    description: "Show video generation progress. Use when videos are being generated, or when user asks about generation status.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "show_publish_widget",
    description: "Show video preview and publish approval. Use when videos are ready, or when user wants to preview/publish a video.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "show_recommendations",
    description: "Show AI recommendations based on performance. Use when user asks for suggestions, ideas, what to improve, or recommendations.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "show_guidance_rules",
    description: "Show content guidance rules. Use when user asks about their rules, preferences, guidelines, or wants to edit them.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "show_avatar_photo",
    description: "Show avatar photo capture interface. Use when user wants to add a new avatar look or update their avatar.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "show_billing",
    description: "Show invoice and billing information. Use when user asks about their bill, invoice, payment, or billing.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
];

// Map tool name to widget type
const toolToWidget: Record<string, WidgetType> = {
  show_performance_dashboard: "performance_dashboard",
  show_theme_selector: "theme_selector",
  show_topic_selector: "topic_selector",
  show_ad_plan: "ad_plan",
  show_vehicle_selector: "vehicle_selector",
  show_script_approval: "script_approval",
  show_generation_progress: "generation_progress",
  show_publish_widget: "publish_widget",
  show_recommendations: "recommendations",
  show_guidance_rules: "guidance_rules",
  show_avatar_photo: "avatar_photo",
  show_billing: "billing",
};

// Execute tool — just returns widget type, no data fetching
export function executeTool(toolName: string): ToolResult {
  const widgetType = toolToWidget[toolName];
  if (!widgetType) {
    throw new Error(`Unknown tool: ${toolName}`);
  }
  return { widget: { type: widgetType } };
}
