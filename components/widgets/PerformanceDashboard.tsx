"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Eye,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Mail,
  FileText,
  Info,
  Music2,
  Facebook,
  Youtube,
  Camera,
  LucideIcon,
  Clock,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  X,
  Play,
  Send,
  Download,
  LineChart,
  Table,
  Star,
} from "lucide-react";

// Platform icon configuration
const platformIcons: Record<string, { Icon: LucideIcon; bgColor: string; iconColor: string }> = {
  TikTok: { Icon: Music2, bgColor: "bg-black", iconColor: "text-white" },
  Facebook: { Icon: Facebook, bgColor: "bg-blue-600", iconColor: "text-white" },
  YouTube: { Icon: Youtube, bgColor: "bg-red-600", iconColor: "text-white" },
  Instagram: { Icon: Camera, bgColor: "bg-pink-500", iconColor: "text-white" },
};

function PlatformIcon({ platform }: { platform: string }) {
  const config = platformIcons[platform];
  if (!config) return <span className="text-gray-600">{platform}</span>;

  const { Icon, bgColor, iconColor } = config;
  return (
    <div className="flex items-center gap-2">
      <div className={`w-5 h-5 rounded flex items-center justify-center ${bgColor}`}>
        <Icon className={`w-3 h-3 ${iconColor}`} />
      </div>
      <span className="text-gray-900">{platform}</span>
    </div>
  );
}

export interface PlatformData {
  platform: string;
  views: number;
  leads: number;
  spend: number;
  cpl: number;
  trend: number;
}

export interface TopContent {
  title: string;
  platform: string;
  views: number;
  leads: number;
  thumbnailUrl?: string;
  videoUrl?: string;
  hook?: string;
  duration?: string;
}

// New: Platform plan cards with cause & effect
export interface PlatformPlan {
  platform: string;
  status: "positive" | "caution" | "neutral";
  lastWeek: string;
  thisWeek: string;
}

// New: Timing/schedule adjustments with expandable why
export interface TimingPlan {
  schedule: string;
  why: string;
}

export interface WeekData {
  startDate: string;
  endDate: string;
  totalViews: number;
  totalLeads: number;
  totalSpend: number;
  spendDelta: number;
  viewsTrend: number;
  leadsTrend: number;
  cplTrend: number;
  platforms: PlatformData[];
  topContent: TopContent[];
  // New structured plans
  summaryLine: string; // Top punchy summary
  platformPlans: PlatformPlan[];
  timingPlan?: TimingPlan;
}

export interface PerformanceDashboardProps {
  weeks?: WeekData[];
  onEmailReport?: () => void;
  onDownloadPDF?: () => void;
}

// Chart data point
interface ChartDataPoint {
  label: string;
  value: number;
}

// Multi-line chart data point with platform breakdown
interface MultiLineDataPoint {
  label: string;
  total: number;
  tiktok: number;
  facebook: number;
  instagram: number;
  youtube: number;
}

// Metric type for the combined chart
type MetricType = "views" | "leads" | "cpl";

// Time range options
type TimeRange = "1W" | "1M" | "3M" | "1Y";

// Platform colors matching the icon configuration
const platformColors = {
  total: "#1f2937", // gray-800
  tiktok: "#000000", // black
  facebook: "#2563eb", // blue-600
  instagram: "#ec4899", // pink-500
  youtube: "#dc2626", // red-600
};

// Demo chart data for different time ranges
const chartData: Record<TimeRange, { views: ChartDataPoint[]; leads: ChartDataPoint[]; cpl: ChartDataPoint[] }> = {
  "1W": {
    views: [
      { label: "Mon", value: 5200 },
      { label: "Tue", value: 6100 },
      { label: "Wed", value: 7800 },
      { label: "Thu", value: 6500 },
      { label: "Fri", value: 8200 },
      { label: "Sat", value: 5800 },
      { label: "Sun", value: 5600 },
    ],
    leads: [
      { label: "Mon", value: 3 },
      { label: "Tue", value: 4 },
      { label: "Wed", value: 6 },
      { label: "Thu", value: 4 },
      { label: "Fri", value: 5 },
      { label: "Sat", value: 3 },
      { label: "Sun", value: 3 },
    ],
    cpl: [
      { label: "Mon", value: 18 },
      { label: "Tue", value: 16 },
      { label: "Wed", value: 14 },
      { label: "Thu", value: 15 },
      { label: "Fri", value: 16 },
      { label: "Sat", value: 17 },
      { label: "Sun", value: 16 },
    ],
  },
  "1M": {
    views: [
      { label: "W1", value: 38000 },
      { label: "W2", value: 41000 },
      { label: "W3", value: 40400 },
      { label: "W4", value: 45200 },
    ],
    leads: [
      { label: "W1", value: 22 },
      { label: "W2", value: 24 },
      { label: "W3", value: 26 },
      { label: "W4", value: 28 },
    ],
    cpl: [
      { label: "W1", value: 18 },
      { label: "W2", value: 17 },
      { label: "W3", value: 15.4 },
      { label: "W4", value: 16.1 },
    ],
  },
  "3M": {
    views: [
      { label: "Oct", value: 142000 },
      { label: "Nov", value: 158000 },
      { label: "Dec", value: 164600 },
    ],
    leads: [
      { label: "Oct", value: 78 },
      { label: "Nov", value: 92 },
      { label: "Dec", value: 100 },
    ],
    cpl: [
      { label: "Oct", value: 19.2 },
      { label: "Nov", value: 17.4 },
      { label: "Dec", value: 16.5 },
    ],
  },
  "1Y": {
    views: [
      { label: "Jan", value: 98000 },
      { label: "Feb", value: 105000 },
      { label: "Mar", value: 112000 },
      { label: "Apr", value: 118000 },
      { label: "May", value: 125000 },
      { label: "Jun", value: 132000 },
      { label: "Jul", value: 128000 },
      { label: "Aug", value: 135000 },
      { label: "Sep", value: 142000 },
      { label: "Oct", value: 152000 },
      { label: "Nov", value: 158000 },
      { label: "Dec", value: 164600 },
    ],
    leads: [
      { label: "Jan", value: 52 },
      { label: "Feb", value: 58 },
      { label: "Mar", value: 62 },
      { label: "Apr", value: 68 },
      { label: "May", value: 72 },
      { label: "Jun", value: 78 },
      { label: "Jul", value: 75 },
      { label: "Aug", value: 82 },
      { label: "Sep", value: 88 },
      { label: "Oct", value: 92 },
      { label: "Nov", value: 96 },
      { label: "Dec", value: 100 },
    ],
    cpl: [
      { label: "Jan", value: 22.5 },
      { label: "Feb", value: 21.8 },
      { label: "Mar", value: 21.2 },
      { label: "Apr", value: 20.5 },
      { label: "May", value: 19.8 },
      { label: "Jun", value: 19.2 },
      { label: "Jul", value: 18.8 },
      { label: "Aug", value: 18.2 },
      { label: "Sep", value: 17.6 },
      { label: "Oct", value: 17.2 },
      { label: "Nov", value: 16.8 },
      { label: "Dec", value: 16.5 },
    ],
  },
};

// Multi-line chart data with platform breakdown
const multiLineChartData: Record<TimeRange, Record<MetricType, MultiLineDataPoint[]>> = {
  "1W": {
    views: [
      { label: "Mon", total: 5200, tiktok: 2500, facebook: 1400, instagram: 800, youtube: 500 },
      { label: "Tue", total: 6100, tiktok: 3000, facebook: 1600, instagram: 900, youtube: 600 },
      { label: "Wed", total: 7800, tiktok: 3800, facebook: 2100, instagram: 1200, youtube: 700 },
      { label: "Thu", total: 6500, tiktok: 3200, facebook: 1700, instagram: 1000, youtube: 600 },
      { label: "Fri", total: 8200, tiktok: 4000, facebook: 2200, instagram: 1300, youtube: 700 },
      { label: "Sat", total: 5800, tiktok: 2800, facebook: 1600, instagram: 900, youtube: 500 },
      { label: "Sun", total: 5600, tiktok: 2700, facebook: 1500, instagram: 900, youtube: 500 },
    ],
    leads: [
      { label: "Mon", total: 3, tiktok: 1, facebook: 1, instagram: 1, youtube: 0 },
      { label: "Tue", total: 4, tiktok: 2, facebook: 1, instagram: 1, youtube: 0 },
      { label: "Wed", total: 6, tiktok: 3, facebook: 2, instagram: 1, youtube: 0 },
      { label: "Thu", total: 4, tiktok: 2, facebook: 1, instagram: 1, youtube: 0 },
      { label: "Fri", total: 5, tiktok: 2, facebook: 2, instagram: 1, youtube: 0 },
      { label: "Sat", total: 3, tiktok: 1, facebook: 1, instagram: 1, youtube: 0 },
      { label: "Sun", total: 3, tiktok: 1, facebook: 1, instagram: 0, youtube: 1 },
    ],
    cpl: [
      { label: "Mon", total: 18, tiktok: 16, facebook: 18, instagram: 22, youtube: 14 },
      { label: "Tue", total: 16, tiktok: 14, facebook: 17, instagram: 20, youtube: 13 },
      { label: "Wed", total: 14, tiktok: 12, facebook: 15, instagram: 18, youtube: 12 },
      { label: "Thu", total: 15, tiktok: 13, facebook: 16, instagram: 19, youtube: 13 },
      { label: "Fri", total: 16, tiktok: 14, facebook: 17, instagram: 20, youtube: 13 },
      { label: "Sat", total: 17, tiktok: 15, facebook: 18, instagram: 21, youtube: 14 },
      { label: "Sun", total: 16, tiktok: 14, facebook: 17, instagram: 20, youtube: 13 },
    ],
  },
  "1M": {
    views: [
      { label: "W1", total: 38000, tiktok: 18000, facebook: 11000, instagram: 5500, youtube: 3500 },
      { label: "W2", total: 41000, tiktok: 20000, facebook: 12000, instagram: 5800, youtube: 3200 },
      { label: "W3", total: 40400, tiktok: 18000, facebook: 12000, instagram: 6400, youtube: 4000 },
      { label: "W4", total: 45200, tiktok: 22000, facebook: 12500, instagram: 6200, youtube: 4500 },
    ],
    leads: [
      { label: "W1", total: 22, tiktok: 10, facebook: 7, instagram: 3, youtube: 2 },
      { label: "W2", total: 24, tiktok: 11, facebook: 8, instagram: 3, youtube: 2 },
      { label: "W3", total: 26, tiktok: 10, facebook: 9, instagram: 4, youtube: 3 },
      { label: "W4", total: 28, tiktok: 12, facebook: 9, instagram: 4, youtube: 3 },
    ],
    cpl: [
      { label: "W1", total: 18, tiktok: 16, facebook: 17, instagram: 22, youtube: 14 },
      { label: "W2", total: 17, tiktok: 15, facebook: 16.5, instagram: 21, youtube: 13.5 },
      { label: "W3", total: 15.4, tiktok: 15, facebook: 15.56, instagram: 17.5, youtube: 13.33 },
      { label: "W4", total: 16.1, tiktok: 15, facebook: 16.67, instagram: 20, youtube: 13.33 },
    ],
  },
  "3M": {
    views: [
      { label: "Oct", total: 142000, tiktok: 70000, facebook: 42000, instagram: 18000, youtube: 12000 },
      { label: "Nov", total: 158000, tiktok: 78000, facebook: 46000, instagram: 21000, youtube: 13000 },
      { label: "Dec", total: 164600, tiktok: 80000, facebook: 48500, instagram: 22000, youtube: 14100 },
    ],
    leads: [
      { label: "Oct", total: 78, tiktok: 36, facebook: 25, instagram: 10, youtube: 7 },
      { label: "Nov", total: 92, tiktok: 42, facebook: 30, instagram: 12, youtube: 8 },
      { label: "Dec", total: 100, tiktok: 46, facebook: 33, instagram: 13, youtube: 8 },
    ],
    cpl: [
      { label: "Oct", total: 19.2, tiktok: 17.5, facebook: 18.8, instagram: 24, youtube: 15 },
      { label: "Nov", total: 17.4, tiktok: 16, facebook: 17, instagram: 22, youtube: 14 },
      { label: "Dec", total: 16.5, tiktok: 15, facebook: 16.67, instagram: 20, youtube: 13.33 },
    ],
  },
  "1Y": {
    views: [
      { label: "Jan", total: 98000, tiktok: 48000, facebook: 29000, instagram: 13000, youtube: 8000 },
      { label: "Feb", total: 105000, tiktok: 52000, facebook: 31000, instagram: 14000, youtube: 8000 },
      { label: "Mar", total: 112000, tiktok: 55000, facebook: 33000, instagram: 15000, youtube: 9000 },
      { label: "Apr", total: 118000, tiktok: 58000, facebook: 35000, instagram: 15500, youtube: 9500 },
      { label: "May", total: 125000, tiktok: 62000, facebook: 37000, instagram: 16000, youtube: 10000 },
      { label: "Jun", total: 132000, tiktok: 65000, facebook: 39000, instagram: 17000, youtube: 11000 },
      { label: "Jul", total: 128000, tiktok: 63000, facebook: 38000, instagram: 16500, youtube: 10500 },
      { label: "Aug", total: 135000, tiktok: 66000, facebook: 40000, instagram: 17500, youtube: 11500 },
      { label: "Sep", total: 142000, tiktok: 70000, facebook: 42000, instagram: 18000, youtube: 12000 },
      { label: "Oct", total: 152000, tiktok: 75000, facebook: 45000, instagram: 19000, youtube: 13000 },
      { label: "Nov", total: 158000, tiktok: 78000, facebook: 46000, instagram: 21000, youtube: 13000 },
      { label: "Dec", total: 164600, tiktok: 80000, facebook: 48500, instagram: 22000, youtube: 14100 },
    ],
    leads: [
      { label: "Jan", total: 52, tiktok: 24, facebook: 17, instagram: 7, youtube: 4 },
      { label: "Feb", total: 58, tiktok: 27, facebook: 19, instagram: 8, youtube: 4 },
      { label: "Mar", total: 62, tiktok: 29, facebook: 20, instagram: 8, youtube: 5 },
      { label: "Apr", total: 68, tiktok: 32, facebook: 22, instagram: 9, youtube: 5 },
      { label: "May", total: 72, tiktok: 34, facebook: 23, instagram: 9, youtube: 6 },
      { label: "Jun", total: 78, tiktok: 36, facebook: 25, instagram: 10, youtube: 7 },
      { label: "Jul", total: 75, tiktok: 35, facebook: 24, instagram: 10, youtube: 6 },
      { label: "Aug", total: 82, tiktok: 38, facebook: 26, instagram: 11, youtube: 7 },
      { label: "Sep", total: 88, tiktok: 40, facebook: 28, instagram: 12, youtube: 8 },
      { label: "Oct", total: 92, tiktok: 42, facebook: 30, instagram: 12, youtube: 8 },
      { label: "Nov", total: 96, tiktok: 44, facebook: 31, instagram: 13, youtube: 8 },
      { label: "Dec", total: 100, tiktok: 46, facebook: 33, instagram: 13, youtube: 8 },
    ],
    cpl: [
      { label: "Jan", total: 22.5, tiktok: 20, facebook: 22, instagram: 28, youtube: 18 },
      { label: "Feb", total: 21.8, tiktok: 19.5, facebook: 21.5, instagram: 27, youtube: 17.5 },
      { label: "Mar", total: 21.2, tiktok: 19, facebook: 21, instagram: 26.5, youtube: 17 },
      { label: "Apr", total: 20.5, tiktok: 18.5, facebook: 20.5, instagram: 26, youtube: 16.5 },
      { label: "May", total: 19.8, tiktok: 18, facebook: 20, instagram: 25, youtube: 16 },
      { label: "Jun", total: 19.2, tiktok: 17.5, facebook: 19.5, instagram: 24, youtube: 15.5 },
      { label: "Jul", total: 18.8, tiktok: 17, facebook: 19, instagram: 23.5, youtube: 15 },
      { label: "Aug", total: 18.2, tiktok: 16.5, facebook: 18.5, instagram: 23, youtube: 14.5 },
      { label: "Sep", total: 17.6, tiktok: 16, facebook: 18, instagram: 22, youtube: 14 },
      { label: "Oct", total: 17.2, tiktok: 15.5, facebook: 17.5, instagram: 21.5, youtube: 13.5 },
      { label: "Nov", total: 16.8, tiktok: 15.2, facebook: 17, instagram: 21, youtube: 13.2 },
      { label: "Dec", total: 16.5, tiktok: 15, facebook: 16.67, instagram: 20, youtube: 13.33 },
    ],
  },
};

// Demo data with new structure
const demoWeeks: WeekData[] = [
  {
    startDate: "Nov 25",
    endDate: "Dec 1",
    totalViews: 45200,
    totalLeads: 28,
    totalSpend: 450,
    spendDelta: 50,
    viewsTrend: 12,
    leadsTrend: 8,
    cplTrend: -5,
    summaryLine: "Strong week — leads up 8% while cost per lead dropped 5%",
    platforms: [
      { platform: "TikTok", views: 22000, leads: 12, spend: 180, cpl: 15, trend: 18 },
      { platform: "Facebook", views: 12500, leads: 9, spend: 150, cpl: 16.67, trend: 5 },
      { platform: "Instagram", views: 6200, leads: 4, spend: 80, cpl: 20, trend: -8 },
      { platform: "YouTube", views: 4500, leads: 3, spend: 40, cpl: 13.33, trend: 12 },
    ],
    topContent: [
      { title: "Winter Ready: 2022 RAV4 AWD", platform: "TikTok", views: 8200, leads: 5, hook: "If you're looking for a reliable AWD vehicle this winter...", duration: "0:45", thumbnailUrl: "/demo/rav4-thumb.jpg" },
      { title: "Budget Friendly Picks Under $15k", platform: "Facebook", views: 4100, leads: 3, hook: "Don't break the bank! Here are our best deals...", duration: "0:32", thumbnailUrl: "/demo/budget-thumb.jpg" },
      { title: "Test Drive Tips for First-Timers", platform: "TikTok", views: 3800, leads: 2, hook: "First time buying a car? Here's what you need to know...", duration: "0:58", thumbnailUrl: "/demo/tips-thumb.jpg" },
    ],
    platformPlans: [
      {
        platform: "TikTok",
        status: "positive",
        lastWeek: "Delivered your best results at $15 per lead",
        thisWeek: "Adding 20% more budget to keep momentum going",
      },
      {
        platform: "Instagram",
        status: "caution",
        lastWeek: "Cost per lead was high ($20 vs $15 on TikTok)",
        thisWeek: "Pausing to refresh creative — back next week",
      },
    ],
    timingPlan: {
      schedule: "Shifted to 10am & 2pm",
      why: "Your audience engages most during lunch and mid-afternoon — we saw 40% higher clicks at these times",
    },
  },
  {
    startDate: "Nov 18",
    endDate: "Nov 24",
    totalViews: 40400,
    totalLeads: 26,
    totalSpend: 400,
    spendDelta: 0,
    viewsTrend: 6,
    leadsTrend: 4,
    cplTrend: 2,
    summaryLine: "Steady progress — 26 leads this week with testing on new formats",
    platforms: [
      { platform: "TikTok", views: 18000, leads: 10, spend: 150, cpl: 15, trend: 10 },
      { platform: "Facebook", views: 12000, leads: 9, spend: 140, cpl: 15.56, trend: 3 },
      { platform: "Instagram", views: 6400, leads: 4, spend: 70, cpl: 17.5, trend: -2 },
      { platform: "YouTube", views: 4000, leads: 3, spend: 40, cpl: 13.33, trend: 8 },
    ],
    topContent: [
      { title: "Holiday Travel Ready SUVs", platform: "Facebook", views: 5500, leads: 4, hook: "Planning a holiday road trip? These SUVs are ready!", duration: "0:40", thumbnailUrl: "/demo/holiday-thumb.jpg" },
      { title: "Why Buy Certified Pre-Owned?", platform: "TikTok", views: 4200, leads: 3, hook: "CPO vehicles offer the best of both worlds...", duration: "0:35", thumbnailUrl: "/demo/cpo-thumb.jpg" },
      { title: "Family Car Comparison", platform: "YouTube", views: 2800, leads: 2, hook: "Which family vehicle is right for you?", duration: "1:15", thumbnailUrl: "/demo/family-thumb.jpg" },
    ],
    platformPlans: [
      {
        platform: "TikTok",
        status: "positive",
        lastWeek: "Testing new video formats showed promise",
        thisWeek: "Ramping up spend on top-performing format",
      },
      {
        platform: "Facebook",
        status: "neutral",
        lastWeek: "Consistent performance at $15.56 per lead",
        thisWeek: "Maintaining current approach",
      },
    ],
    timingPlan: {
      schedule: "Testing morning posts at 9am",
      why: "Early data shows commute-time content gets more saves and shares",
    },
  },
];

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num.toString();
}

function formatCurrency(num: number): string {
  return "$" + num.toFixed(2).replace(/\.00$/, "");
}

// For metrics where UP is good (views, leads)
function TrendIndicatorPositive({ value }: { value: number }) {
  if (value > 0) {
    return (
      <span className="flex items-center text-green-600 text-sm">
        <TrendingUp className="w-3 h-3 mr-0.5" />
        {value}%
      </span>
    );
  } else if (value < 0) {
    return (
      <span className="flex items-center text-red-600 text-sm">
        <TrendingDown className="w-3 h-3 mr-0.5" />
        {Math.abs(value)}%
      </span>
    );
  }
  return <span className="text-gray-500 text-sm">0%</span>;
}

// For CPL where DOWN is good (lower cost = better)
function TrendIndicatorCPL({ value }: { value: number }) {
  if (value < 0) {
    return (
      <span className="flex items-center text-green-600 text-sm">
        <TrendingDown className="w-3 h-3 mr-0.5" />
        {Math.abs(value)}%
      </span>
    );
  } else if (value > 0) {
    return (
      <span className="flex items-center text-red-600 text-sm">
        <TrendingUp className="w-3 h-3 mr-0.5" />
        {value}%
      </span>
    );
  }
  return <span className="text-gray-500 text-sm">0%</span>;
}

// Platform table trend
function TableTrendIndicator({ value }: { value: number }) {
  if (value > 0) {
    return (
      <span className="inline-flex items-center justify-end text-green-600 text-sm w-16">
        <TrendingUp className="w-3 h-3 mr-0.5" />
        {value}%
      </span>
    );
  } else if (value < 0) {
    return (
      <span className="inline-flex items-center justify-end text-red-600 text-sm w-16">
        <TrendingDown className="w-3 h-3 mr-0.5" />
        {Math.abs(value)}%
      </span>
    );
  }
  return <span className="inline-flex items-center justify-end text-gray-500 text-sm w-16">0%</span>;
}

// Scroll indicator for tables
function ScrollIndicator({ showHint }: { showHint: boolean }) {
  if (!showHint) return null;

  return (
    <div className="md:hidden flex items-center justify-center gap-1 py-1.5 text-xs text-gray-400 bg-gray-50 border-b border-gray-100">
      <span>← Swipe to see more →</span>
    </div>
  );
}

// Simple line chart component (SVG-based, no dependencies)
function SimpleLineChart({
  data,
  color,
  label,
  icon,
  formatValue,
}: {
  data: ChartDataPoint[];
  color: string;
  label: string;
  icon: React.ReactNode;
  formatValue: (v: number) => string;
}) {
  if (data.length === 0) return null;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  // Chart dimensions
  const width = 280;
  const height = 60;
  const padding = { top: 5, right: 10, bottom: 5, left: 10 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Generate path
  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - ((d.value - min) / range) * chartHeight;
    return { x, y, ...d };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  // Area fill path
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`;

  const latestValue = data[data.length - 1]?.value ?? 0;
  const firstValue = data[0]?.value ?? 0;
  const change = firstValue > 0 ? ((latestValue - firstValue) / firstValue) * 100 : 0;

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-medium text-gray-700">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{formatValue(latestValue)}</span>
          <span className={`text-xs ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
            {change >= 0 ? "+" : ""}{change.toFixed(1)}%
          </span>
        </div>
      </div>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {/* Area fill */}
        <path d={areaD} fill={`${color}20`} />
        {/* Line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Data points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="white" stroke={color} strokeWidth="2" />
        ))}
      </svg>
      {/* X-axis labels */}
      <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-1">
        {data.map((d, i) => (
          <span key={i} className={data.length > 7 && i % 2 !== 0 ? "hidden md:inline" : ""}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// Combined overview chart with stacked area and gradients
function CombinedOverviewChart({
  timeRange,
  onTimeRangeChange,
}: {
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}) {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("views");
  const [hoveredPoint, setHoveredPoint] = useState<{
    index: number;
    x: number;
    y: number;
    data: MultiLineDataPoint;
  } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const data = multiLineChartData[timeRange][selectedMetric];
  const timeRanges: TimeRange[] = ["1W", "1M", "3M", "1Y"];

  const metricConfig: Record<MetricType, { label: string; format: (v: number) => string; icon: React.ReactNode }> = {
    views: { label: "Views", format: formatNumber, icon: <Eye className="w-4 h-4" /> },
    leads: { label: "Leads", format: (v) => v.toString(), icon: <Users className="w-4 h-4" /> },
    cpl: { label: "Cost per Lead", format: (v) => `$${v.toFixed(2)}`, icon: <DollarSign className="w-4 h-4" /> },
  };

  // Chart dimensions
  const width = 320;
  const height = 160;
  const padding = { top: 15, right: 15, bottom: 25, left: 15 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // For stacked area, we need cumulative values
  // Stack order: youtube (bottom), instagram, facebook, tiktok (top)
  const stackedData = data.map((d) => ({
    label: d.label,
    youtube: d.youtube,
    youtubeStack: d.youtube,
    instagram: d.instagram,
    instagramStack: d.youtube + d.instagram,
    facebook: d.facebook,
    facebookStack: d.youtube + d.instagram + d.facebook,
    tiktok: d.tiktok,
    tiktokStack: d.youtube + d.instagram + d.facebook + d.tiktok,
    total: d.total,
  }));

  // Calculate max for scaling (use total which should equal stacked top)
  const maxValue = Math.max(...stackedData.map((d) => d.tiktokStack)) * 1.1;

  // Generate area path (for stacked areas)
  const generateAreaPath = (
    topValues: number[],
    bottomValues: number[]
  ) => {
    const topPoints = topValues.map((v, i) => {
      const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
      const y = padding.top + chartHeight - (v / maxValue) * chartHeight;
      return { x, y };
    });

    const bottomPoints = bottomValues.map((v, i) => {
      const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
      const y = padding.top + chartHeight - (v / maxValue) * chartHeight;
      return { x, y };
    });

    // Create path: go forward along top, then backward along bottom
    const topPath = topPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const bottomPath = [...bottomPoints].reverse().map((p) => `L ${p.x} ${p.y}`).join(" ");

    return `${topPath} ${bottomPath} Z`;
  };

  // Stacked areas (bottom to top)
  const areas = [
    {
      key: "youtube",
      topValues: stackedData.map((d) => d.youtubeStack),
      bottomValues: stackedData.map(() => 0),
      color: platformColors.youtube,
      label: "YouTube",
    },
    {
      key: "instagram",
      topValues: stackedData.map((d) => d.instagramStack),
      bottomValues: stackedData.map((d) => d.youtubeStack),
      color: platformColors.instagram,
      label: "Instagram",
    },
    {
      key: "facebook",
      topValues: stackedData.map((d) => d.facebookStack),
      bottomValues: stackedData.map((d) => d.instagramStack),
      color: platformColors.facebook,
      label: "Facebook",
    },
    {
      key: "tiktok",
      topValues: stackedData.map((d) => d.tiktokStack),
      bottomValues: stackedData.map((d) => d.facebookStack),
      color: platformColors.tiktok,
      label: "TikTok",
    },
  ];

  // Hover points (on top of stacked area)
  const hoverPoints = stackedData.map((d, i) => {
    const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
    const y = padding.top + chartHeight - (d.tiktokStack / maxValue) * chartHeight;
    return { x, y, data: data[i], index: i };
  });

  // Format percentage
  const formatPercent = (value: number, total: number) => {
    if (total === 0) return "0%";
    return `${Math.round((value / total) * 100)}%`;
  };

  const currentConfig = metricConfig[selectedMetric];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-lg p-4 border border-gray-100">
      {/* Header with metric dropdown and time range */}
      <div className="flex items-center justify-between mb-3">
        {/* Metric dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-300 transition-colors"
          >
            {currentConfig.icon}
            <span>{currentConfig.label}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
          </button>
          {showDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[140px]">
              {(Object.keys(metricConfig) as MetricType[]).map((metric) => (
                <button
                  key={metric}
                  onClick={() => {
                    setSelectedMetric(metric);
                    setShowDropdown(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    selectedMetric === metric ? "bg-blue-50 text-blue-700" : "text-gray-700"
                  }`}
                >
                  {metricConfig[metric].icon}
                  {metricConfig[metric].label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-1">
          {timeRanges.map((tr) => (
            <button
              key={tr}
              onClick={() => onTimeRangeChange(tr)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                timeRange === tr
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {tr}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="overflow-visible"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="gradTiktok" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={platformColors.tiktok} stopOpacity="0.8" />
              <stop offset="100%" stopColor={platformColors.tiktok} stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="gradFacebook" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={platformColors.facebook} stopOpacity="0.8" />
              <stop offset="100%" stopColor={platformColors.facebook} stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="gradInstagram" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={platformColors.instagram} stopOpacity="0.8" />
              <stop offset="100%" stopColor={platformColors.instagram} stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="gradYoutube" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={platformColors.youtube} stopOpacity="0.8" />
              <stop offset="100%" stopColor={platformColors.youtube} stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const y = padding.top + chartHeight * (1 - pct);
            return (
              <line
                key={pct}
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
            );
          })}

          {/* Stacked areas with gradients (draw from bottom to top) */}
          {areas.map((area) => (
            <path
              key={area.key}
              d={generateAreaPath(area.topValues, area.bottomValues)}
              fill={`url(#grad${area.key.charAt(0).toUpperCase() + area.key.slice(1)})`}
              stroke={area.color}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          ))}

          {/* Data points on top line */}
          {hoverPoints.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="4"
              fill="white"
              stroke={platformColors.tiktok}
              strokeWidth="2"
            />
          ))}

          {/* Invisible hover areas */}
          {hoverPoints.map((p, i) => (
            <circle
              key={`hover-${i}`}
              cx={p.x}
              cy={p.y}
              r="15"
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredPoint(p)}
              onTouchStart={() => setHoveredPoint(p)}
            />
          ))}
        </svg>

        {/* Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-20 bg-gray-900 text-white text-xs rounded-lg shadow-xl p-3 pointer-events-none"
            style={{
              left: `${Math.min(Math.max(hoveredPoint.x - 80, 10), width - 170)}px`,
              top: `${hoveredPoint.y - 10}px`,
              transform: "translateY(-100%)",
              minWidth: "160px",
            }}
          >
            <div className="font-semibold mb-2 text-gray-200">{hoveredPoint.data.label}</div>
            <div className="font-bold text-base mb-2">
              Total: {currentConfig.format(hoveredPoint.data.total)} {selectedMetric}
            </div>
            <div className="space-y-1.5 border-t border-gray-700 pt-2">
              {[
                { key: "tiktok", label: "TikTok", value: hoveredPoint.data.tiktok, color: "#fff" },
                { key: "facebook", label: "Facebook", value: hoveredPoint.data.facebook, color: "#60a5fa" },
                { key: "instagram", label: "Instagram", value: hoveredPoint.data.instagram, color: "#f472b6" },
                { key: "youtube", label: "YouTube", value: hoveredPoint.data.youtube, color: "#f87171" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">├</span>
                    <span style={{ color: item.color }}>{item.label}:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{currentConfig.format(item.value)}</span>
                    <span className="text-gray-400">({formatPercent(item.value, hoveredPoint.data.total)})</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Arrow */}
            <div
              className="absolute w-3 h-3 bg-gray-900 transform rotate-45"
              style={{
                bottom: "-6px",
                left: "50%",
                marginLeft: "-6px",
              }}
            />
          </div>
        )}

        {/* X-axis labels */}
        <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-1">
          {data.map((d, i) => (
            <span key={i} className={data.length > 7 && i % 2 !== 0 ? "hidden md:inline" : ""}>
              {d.label}
            </span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-3 text-xs">
        {[...areas].reverse().map((area) => (
          <div key={area.key} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: area.color, opacity: 0.7 }}
            />
            <span className="text-gray-600">{area.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Chart view section with per-metric breakdown charts (combined chart is now at top of dashboard)
function ChartViewSection({
  timeRange,
  onTimeRangeChange,
}: {
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}) {
  const data = chartData[timeRange];
  const timeRanges: TimeRange[] = ["1W", "1M", "3M", "1Y"];

  return (
    <div className="space-y-4">
      {/* Time range selector */}
      <div className="flex items-center justify-end gap-1">
        {timeRanges.map((range) => (
          <button
            key={range}
            onClick={() => onTimeRangeChange(range)}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              timeRange === range
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Per-metric breakdown charts */}
      <div className="space-y-3">
        <SimpleLineChart
          data={data.views}
          color="#3b82f6"
          label="Views over time"
          icon={<Eye className="w-4 h-4 text-blue-500" />}
          formatValue={(v) => formatNumber(v)}
        />
        <SimpleLineChart
          data={data.leads}
          color="#22c55e"
          label="Leads over time"
          icon={<Users className="w-4 h-4 text-green-500" />}
          formatValue={(v) => v.toString()}
        />
        <SimpleLineChart
          data={data.cpl}
          color="#f59e0b"
          label="Cost per Lead trend"
          icon={<DollarSign className="w-4 h-4 text-amber-500" />}
          formatValue={(v) => `$${v.toFixed(2)}`}
        />
      </div>
    </div>
  );
}

// Platform plan card component with Lucide icons
function PlatformPlanCard({ plan }: { plan: PlatformPlan }) {
  const config = platformIcons[plan.platform];
  const statusStyles = {
    positive: "border-l-green-500 bg-green-50/50",
    caution: "border-l-amber-500 bg-amber-50/50",
    neutral: "border-l-gray-400 bg-gray-50/50",
  };
  const statusIconConfig = {
    positive: { Icon: CheckCircle2, color: "text-green-600" },
    caution: { Icon: AlertTriangle, color: "text-amber-500" },
    neutral: { Icon: BarChart3, color: "text-gray-500" },
  };

  const StatusIconComponent = statusIconConfig[plan.status].Icon;
  const statusIconColor = statusIconConfig[plan.status].color;

  return (
    <div className={`rounded-lg border-l-4 p-3 ${statusStyles[plan.status]}`}>
      <div className="flex items-center gap-2 mb-2">
        <StatusIconComponent className={`w-4 h-4 ${statusIconColor}`} />
        {config ? (
          <div className="flex items-center gap-1.5">
            <div className={`w-4 h-4 rounded flex items-center justify-center ${config.bgColor}`}>
              <config.Icon className={`w-2.5 h-2.5 ${config.iconColor}`} />
            </div>
            <span className="font-medium text-sm text-gray-900">{plan.platform}</span>
          </div>
        ) : (
          <span className="font-medium text-sm text-gray-900">{plan.platform}</span>
        )}
      </div>
      <div className="space-y-1 text-sm">
        <p className="text-gray-600">
          <span className="text-gray-400">Last week:</span> {plan.lastWeek}
        </p>
        <p className="text-gray-800 font-medium">
          <span className="text-gray-400 font-normal">This week:</span> {plan.thisWeek}
        </p>
      </div>
    </div>
  );
}

// Timing plan card with expandable tooltip
function TimingPlanCard({ plan }: { plan: TimingPlan }) {
  const [showWhy, setShowWhy] = useState(false);

  return (
    <div className="rounded-lg border-l-4 border-l-gray-400 bg-gray-50/50 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4 text-gray-500" />
        <span className="font-medium text-sm text-gray-900">Posting Schedule</span>
      </div>
      <p className="text-sm text-gray-800 font-medium mb-1">{plan.schedule}</p>
      <button
        onClick={() => setShowWhy(!showWhy)}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
      >
        <Info className="w-3 h-3" />
        Why?
        <ChevronDown className={`w-3 h-3 transition-transform ${showWhy ? "rotate-180" : ""}`} />
      </button>
      {showWhy && (
        <p className="text-xs text-gray-600 mt-2 pl-4 border-l-2 border-gray-300">
          {plan.why}
        </p>
      )}
    </div>
  );
}

// Video Preview Modal
function VideoPreviewModal({
  video,
  onClose,
}: {
  video: TopContent;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const platformConfig = platformIcons[video.platform];

  useEffect(() => {
    setMounted(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Video player area */}
        <div className="relative aspect-[9/16] max-h-[60vh] bg-black">
          <video
            className="w-full h-full object-contain"
            src="https://res.cloudinary.com/dtpqxuwby/video/upload/v1763688792/facebook_2025-11-20_test.mp4"
            autoPlay
            loop
            controls
            playsInline
            poster={video.thumbnailUrl}
          />
          {/* Duration badge */}
          {video.duration && (
            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded pointer-events-none">
              {video.duration}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title & Platform */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg leading-tight">{video.title}</h3>
            {platformConfig && (
              <div className={`shrink-0 w-6 h-6 rounded flex items-center justify-center ${platformConfig.bgColor}`}>
                <platformConfig.Icon className={`w-4 h-4 ${platformConfig.iconColor}`} />
              </div>
            )}
          </div>

          {/* Hook */}
          {video.hook && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Opening Hook
              </p>
              <p className="text-sm text-gray-700 italic">&ldquo;{video.hook}&rdquo;</p>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Eye className="w-4 h-4 text-gray-400" />
              <span className="font-medium">{formatNumber(video.views)}</span>
              <span className="text-gray-400">views</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="font-medium">{video.leads}</span>
              <span className="text-gray-400">leads</span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Email Report Modal
function EmailReportModal({
  onClose,
  onSend,
}: {
  onClose: () => void;
  onSend: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleSend = async () => {
    if (!email.trim() || !email.includes("@")) return;
    setSending(true);
    // Simulate sending
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onSend(email);
    setSending(false);
    setSent(true);
    setTimeout(() => onClose(), 1500);
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-lg font-medium text-gray-900">Report Sent!</p>
              <p className="text-sm text-gray-500 mt-1">Check your inbox</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Email Report</h3>
                  <p className="text-xs text-gray-500">Send performance summary to your inbox</p>
                </div>
              </div>

              <div className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  autoFocus
                />

                <Button
                  onClick={handleSend}
                  disabled={!email.trim() || !email.includes("@") || sending}
                  className="w-full"
                >
                  {sending ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Report
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export function PerformanceDashboard({
  weeks = demoWeeks,
  onEmailReport,
  onDownloadPDF,
}: PerformanceDashboardProps) {
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [canScroll, setCanScroll] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<TopContent | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "chart">("table");
  const [timeRange, setTimeRange] = useState<TimeRange>("1M");
  const scrollRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const currentWeek = weeks[currentWeekIndex];

  // Check if table is scrollable
  useEffect(() => {
    const checkScroll = () => {
      if (scrollRef.current) {
        const { scrollWidth, clientWidth } = scrollRef.current;
        setCanScroll(scrollWidth > clientWidth);
      }
    };

    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [currentWeekIndex]);

  const costPerLead = currentWeek.totalLeads > 0 ? currentWeek.totalSpend / currentWeek.totalLeads : 0;

  const canGoBack = currentWeekIndex < weeks.length - 1;
  const canGoForward = currentWeekIndex > 0;

  const goToPreviousWeek = () => {
    if (canGoBack) setCurrentWeekIndex(currentWeekIndex + 1);
  };

  const goToNextWeek = () => {
    if (canGoForward) setCurrentWeekIndex(currentWeekIndex - 1);
  };

  // PDF Download handler
  const handleDownloadPDF = async () => {
    if (!dashboardRef.current || isDownloading) return;

    setIsDownloading(true);
    try {
      // Dynamically import html2pdf
      const html2pdf = (await import("html2pdf.js")).default;

      const element = dashboardRef.current;
      const opt = {
        margin: 0.5,
        filename: `performance-report-${currentWeek.startDate}-${currentWeek.endDate}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" as const },
      };

      await html2pdf().set(opt).from(element).save();
      onDownloadPDF?.();
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Email handler
  const handleEmailReport = (email: string) => {
    console.log("Sending report to:", email);
    onEmailReport?.();
  };

  return (
    <>
    <Card className="w-full max-w-2xl" ref={dashboardRef}>
      <CardHeader className="pb-3 px-3 md:px-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Last Week&apos;s Performance
            </CardTitle>
            {/* Week Navigation */}
            <div className="flex items-center gap-1 md:gap-2 mt-1">
              <button
                onClick={goToPreviousWeek}
                disabled={!canGoBack}
                className={`p-1 rounded hover:bg-gray-100 ${!canGoBack ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              </button>
              <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap">
                {currentWeek.startDate} - {currentWeek.endDate}
              </span>
              <button
                onClick={goToNextWeek}
                disabled={!canGoForward}
                className={`p-1 rounded hover:bg-gray-100 ${!canGoForward ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 md:space-y-5 px-3 md:px-6">
        {/* 1. TOP SUMMARY LINE */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border border-green-100">
          <p className="text-sm md:text-base font-medium text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600 shrink-0" />
            {currentWeek.summaryLine}
          </p>
        </div>

        {/* 2. METRICS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Views */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
              <Eye className="w-3 h-3" />
              Total Views
            </div>
            <div className="text-xl font-bold">{formatNumber(currentWeek.totalViews)}</div>
            <TrendIndicatorPositive value={currentWeek.viewsTrend} />
          </div>

          {/* Leads */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
              <Users className="w-3 h-3" />
              Total Leads
            </div>
            <div className="text-xl font-bold">{currentWeek.totalLeads}</div>
            <TrendIndicatorPositive value={currentWeek.leadsTrend} />
          </div>

          {/* Ad Spend */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
              <DollarSign className="w-3 h-3" />
              Ad Spend
            </div>
            <div className="text-xl font-bold">{formatCurrency(currentWeek.totalSpend)}</div>
            <span className="text-gray-500 text-sm">
              {currentWeek.spendDelta >= 0 ? "+" : ""}
              {formatCurrency(currentWeek.spendDelta)}
            </span>
          </div>

          {/* CPL */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
              <TrendingUp className="w-3 h-3" />
              Cost/Lead
            </div>
            <div className="text-xl font-bold">{formatCurrency(costPerLead)}</div>
            <TrendIndicatorCPL value={currentWeek.cplTrend} />
          </div>
        </div>

        {/* 3. COMBINED OVERVIEW CHART - The Big Picture */}
        <CombinedOverviewChart timeRange={timeRange} onTimeRangeChange={setTimeRange} />

        {/* 4. THIS WEEK'S PLAN */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-500" />
            This Week&apos;s Plan
          </h4>
          <div className="space-y-2">
            {currentWeek.platformPlans.map((plan, index) => (
              <PlatformPlanCard key={index} plan={plan} />
            ))}
            {currentWeek.timingPlan && <TimingPlanCard plan={currentWeek.timingPlan} />}
          </div>
        </div>

        {/* 5. TOP VIDEOS (CLICKABLE) with Context */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-gray-700">Top Videos</span>
          </div>
          <p className="text-xs text-gray-500 mb-2.5">
            These performed best — consider similar themes or topics next week
          </p>
          <div className="flex flex-wrap gap-2">
            {currentWeek.topContent.slice(0, 3).map((video, index) => (
              <button
                key={index}
                onClick={() => setSelectedVideo(video)}
                className="text-xs px-2.5 py-1.5 bg-white border border-gray-200 rounded-full hover:border-blue-300 hover:bg-blue-50 transition-colors flex items-center gap-1.5"
              >
                <Play className="w-3 h-3 text-gray-400" />
                <span className="text-gray-700 truncate max-w-[150px]">{video.title}</span>
                <span className="text-gray-400">({formatNumber(video.views)})</span>
              </button>
            ))}
          </div>
        </div>

        {/* 6. PLATFORM BREAKDOWN with View Toggle */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">
              {viewMode === "table" ? "Platform Breakdown" : "Performance Trends"}
            </h4>
            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  viewMode === "table"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                Table
              </button>
              <button
                onClick={() => setViewMode("chart")}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  viewMode === "chart"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <LineChart className="w-3.5 h-3.5" />
                Chart
              </button>
            </div>
          </div>

          {viewMode === "table" ? (
            <>
              <ScrollIndicator showHint={canScroll} />
              <div ref={scrollRef} className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-1 font-medium text-gray-500">Platform</th>
                      <th className="text-right py-2 px-1 font-medium text-gray-500">Views</th>
                      <th className="text-right py-2 px-1 font-medium text-gray-500">Leads</th>
                      <th className="text-right py-2 px-1 font-medium text-gray-500">Spend</th>
                      <th className="text-right py-2 px-1 font-medium text-gray-500">Cost/Lead</th>
                      <th className="text-right py-2 px-1 font-medium text-gray-500 w-20">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentWeek.platforms.map((p) => (
                      <tr key={p.platform} className="border-b border-gray-100 last:border-0">
                        <td className="py-2 px-1 font-medium">
                          <PlatformIcon platform={p.platform} />
                        </td>
                        <td className="text-right py-2 px-1 text-gray-600">{formatNumber(p.views)}</td>
                        <td className="text-right py-2 px-1 text-gray-600">{p.leads}</td>
                        <td className="text-right py-2 px-1 text-gray-600">{formatCurrency(p.spend)}</td>
                        <td className="text-right py-2 px-1 text-gray-600">{formatCurrency(p.cpl)}</td>
                        <td className="text-right py-2 px-1">
                          <TableTrendIndicator value={p.trend} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <ChartViewSection timeRange={timeRange} onTimeRangeChange={setTimeRange} />
          )}
        </div>

        {/* 7. EMAIL / DOWNLOAD BUTTONS */}
        <div className="flex items-center justify-center gap-4 pt-4 border-t">
          <button
            onClick={() => setShowEmailModal(true)}
            className="flex items-center gap-1.5 text-xs md:text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Email Report
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex items-center gap-1.5 text-xs md:text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <span className="animate-spin">⏳</span>
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PDF
              </>
            )}
          </button>
        </div>
      </CardContent>
    </Card>

    {/* Video Preview Modal */}
    {selectedVideo && (
      <VideoPreviewModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    )}

    {/* Email Report Modal */}
    {showEmailModal && (
      <EmailReportModal
        onClose={() => setShowEmailModal(false)}
        onSend={handleEmailReport}
      />
    )}
    </>
  );
}
