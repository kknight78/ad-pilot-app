export type GoldenPathStep =
  | "performance_dashboard"
  | "theme_selector"
  | "topic_selector"
  | "ad_plan"
  | "vehicle_selector"
  | "script_approval"
  | "generation_progress"
  | "publish_widget"
  | "wrap_up";

export type DetourStep =
  | "recommendations"
  | "guidance_rules"
  | "avatar_photo"
  | "billing";

export type FlowStep = GoldenPathStep | DetourStep;

export interface FlowSelections {
  theme?: string;
  topics?: string[];
  adPlan?: Array<{
    id: string;
    theme: string;
    template: string;
    vehicles: number;
    avatar: string;
    length: string;
    spend: number;
    platform: string;
  }>;
  // Store vehicle assignments as adId -> array of VINs (extracted from Vehicle objects)
  vehicleAssignments?: Record<string, string[]>;
  // Also store the count for display purposes
  vehicleCount?: number;
  approvedScripts?: string[];
  approvedVideos?: string[];
}

export interface ConversationState {
  currentStep: FlowStep;
  completedSteps: GoldenPathStep[];
  selections: FlowSelections;
  detourStack: GoldenPathStep[];
}

export const initialFlowState: ConversationState = {
  currentStep: "performance_dashboard",
  completedSteps: [],
  selections: {},
  detourStack: [],
};

// Helper to check if a step is a golden path step
export function isGoldenPathStep(step: FlowStep): step is GoldenPathStep {
  const goldenPathSteps: GoldenPathStep[] = [
    "performance_dashboard",
    "theme_selector",
    "topic_selector",
    "ad_plan",
    "vehicle_selector",
    "script_approval",
    "generation_progress",
    "publish_widget",
    "wrap_up",
  ];
  return goldenPathSteps.includes(step as GoldenPathStep);
}

// Helper to check if a step is a detour
export function isDetourStep(step: FlowStep): step is DetourStep {
  const detourSteps: DetourStep[] = [
    "recommendations",
    "guidance_rules",
    "avatar_photo",
    "billing",
  ];
  return detourSteps.includes(step as DetourStep);
}

// Get the next step in the golden path
export function getNextGoldenPathStep(
  current: GoldenPathStep,
  hasEducational: boolean = true
): GoldenPathStep {
  const order: GoldenPathStep[] = [
    "performance_dashboard",
    "theme_selector",
    ...(hasEducational ? ["topic_selector" as GoldenPathStep] : []),
    "ad_plan",
    "vehicle_selector",
    "script_approval",
    "generation_progress",
    "publish_widget",
    "wrap_up",
  ];

  const currentIndex = order.indexOf(current);
  if (currentIndex === -1 || currentIndex === order.length - 1) {
    return "wrap_up";
  }
  return order[currentIndex + 1];
}
