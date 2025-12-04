"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Eye,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Mail,
  FileText,
  ArrowRight,
  AlertTriangle,
  Clock,
  Car,
} from "lucide-react";

export interface PlatformData {
  platform: string;
  views: number;
  leads: number;
  spend: number;
  cpl: number;
  trend: number; // percentage change, negative = down
}

export interface TopContent {
  title: string;
  platform: string;
  views: number;
  leads: number;
  featured?: boolean;
}

export interface Adjustment {
  type: "positive" | "caution" | "info";
  icon: "trending" | "warning" | "car" | "clock";
  text: string;
}

export interface WeekData {
  startDate: string;
  endDate: string;
  totalViews: number;
  totalLeads: number;
  totalSpend: number;
  spendDelta: number; // +/- from previous week
  viewsTrend: number;
  leadsTrend: number;
  cplTrend: number; // negative = good (lower cost)
  platforms: PlatformData[];
  topContent: TopContent[];
  adjustments: Adjustment[];
}

export interface PerformanceDashboardProps {
  weeks?: WeekData[];
  onViewPlan?: () => void;
  onEmailReport?: () => void;
  onDownloadPDF?: () => void;
}

// Demo data
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
    cplTrend: -5, // negative = good
    platforms: [
      { platform: "TikTok", views: 22000, leads: 12, spend: 180, cpl: 15, trend: 18 },
      { platform: "Facebook", views: 12500, leads: 9, spend: 150, cpl: 16.67, trend: 5 },
      { platform: "Instagram", views: 6200, leads: 4, spend: 80, cpl: 20, trend: -8 },
      { platform: "YouTube", views: 4500, leads: 3, spend: 40, cpl: 13.33, trend: 12 },
    ],
    topContent: [
      { title: "Winter Ready: 2022 RAV4 AWD", platform: "TikTok", views: 8200, leads: 5, featured: true },
      { title: "Budget Friendly Picks Under $15k", platform: "Facebook", views: 4100, leads: 3 },
      { title: "Test Drive Tips for First-Timers", platform: "TikTok", views: 3800, leads: 2 },
    ],
    adjustments: [
      { type: "positive", icon: "trending", text: "TikTok outperforming → Increased spend 20%" },
      { type: "caution", icon: "warning", text: "Instagram CPL high → Paused, refreshing creative" },
      { type: "info", icon: "car", text: "Featuring 3 vehicles over 45 days on lot" },
      { type: "positive", icon: "clock", text: "Optimized posting times to 10am & 2pm" },
    ],
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
    platforms: [
      { platform: "TikTok", views: 18000, leads: 10, spend: 150, cpl: 15, trend: 10 },
      { platform: "Facebook", views: 12000, leads: 9, spend: 140, cpl: 15.56, trend: 3 },
      { platform: "Instagram", views: 6400, leads: 4, spend: 70, cpl: 17.5, trend: -2 },
      { platform: "YouTube", views: 4000, leads: 3, spend: 40, cpl: 13.33, trend: 8 },
    ],
    topContent: [
      { title: "Holiday Travel Ready SUVs", platform: "Facebook", views: 5500, leads: 4, featured: true },
      { title: "Why Buy Certified Pre-Owned?", platform: "TikTok", views: 4200, leads: 3 },
      { title: "Family Car Comparison", platform: "YouTube", views: 2800, leads: 2 },
    ],
    adjustments: [
      { type: "positive", icon: "trending", text: "Ramped up TikTok testing with new formats" },
      { type: "info", icon: "car", text: "Highlighted 5 new arrivals on lot" },
    ],
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
        ↑{value}%
      </span>
    );
  } else if (value < 0) {
    return (
      <span className="flex items-center text-red-600 text-sm">
        <TrendingDown className="w-3 h-3 mr-0.5" />
        ↓{Math.abs(value)}%
      </span>
    );
  }
  return <span className="text-gray-500 text-sm">→ 0%</span>;
}

// For CPL where DOWN is good (lower cost = better)
function TrendIndicatorCPL({ value }: { value: number }) {
  if (value < 0) {
    // Negative trend = cost went down = good
    return (
      <span className="flex items-center text-green-600 text-sm">
        <TrendingDown className="w-3 h-3 mr-0.5" />
        ↓{Math.abs(value)}%
      </span>
    );
  } else if (value > 0) {
    // Positive trend = cost went up = bad
    return (
      <span className="flex items-center text-red-600 text-sm">
        <TrendingUp className="w-3 h-3 mr-0.5" />
        ↑{value}%
      </span>
    );
  }
  return <span className="text-gray-500 text-sm">→ 0%</span>;
}

// Platform table trend (using positive logic)
function TableTrendIndicator({ value }: { value: number }) {
  if (value > 0) {
    return (
      <span className="inline-flex items-center justify-end text-green-600 text-sm w-16">
        <TrendingUp className="w-3 h-3 mr-0.5" />
        ↑{value}%
      </span>
    );
  } else if (value < 0) {
    return (
      <span className="inline-flex items-center justify-end text-red-600 text-sm w-16">
        <TrendingDown className="w-3 h-3 mr-0.5" />
        ↓{Math.abs(value)}%
      </span>
    );
  }
  return <span className="inline-flex items-center justify-end text-gray-500 text-sm w-16">→ 0%</span>;
}

function AdjustmentIcon({ icon }: { icon: Adjustment["icon"] }) {
  switch (icon) {
    case "trending":
      return <TrendingUp className="w-4 h-4" />;
    case "warning":
      return <AlertTriangle className="w-4 h-4" />;
    case "car":
      return <Car className="w-4 h-4" />;
    case "clock":
      return <Clock className="w-4 h-4" />;
    default:
      return <TrendingUp className="w-4 h-4" />;
  }
}

export function PerformanceDashboard({
  weeks = demoWeeks,
  onViewPlan,
  onEmailReport,
  onDownloadPDF,
}: PerformanceDashboardProps) {
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [showAdjustments, setShowAdjustments] = useState(false);

  const currentWeek = weeks[currentWeekIndex];
  const costPerLead = currentWeek.totalLeads > 0 ? currentWeek.totalSpend / currentWeek.totalLeads : 0;

  const canGoBack = currentWeekIndex < weeks.length - 1;
  const canGoForward = currentWeekIndex > 0;

  const goToPreviousWeek = () => {
    if (canGoBack) setCurrentWeekIndex(currentWeekIndex + 1);
  };

  const goToNextWeek = () => {
    if (canGoForward) setCurrentWeekIndex(currentWeekIndex - 1);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Last Week&apos;s Performance</CardTitle>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousWeek}
              disabled={!canGoBack}
              className={`p-1 rounded hover:bg-gray-100 ${!canGoBack ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-sm text-gray-600 min-w-[120px] text-center">
              {currentWeek.startDate} - {currentWeek.endDate}
            </span>
            <button
              onClick={goToNextWeek}
              disabled={!canGoForward}
              className={`p-1 rounded hover:bg-gray-100 ${!canGoForward ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Summary Cards */}
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

          {/* Ad Spend - Neutral (no color judgment) */}
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

          {/* CPL - with inverted trend indicator */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
              <TrendingUp className="w-3 h-3" />
              Cost/Lead
            </div>
            <div className="text-xl font-bold">{formatCurrency(costPerLead)}</div>
            <TrendIndicatorCPL value={currentWeek.cplTrend} />
          </div>
        </div>

        {/* Platform Breakdown */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Platform Breakdown</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-1 font-medium text-gray-500">Platform</th>
                  <th className="text-right py-2 px-1 font-medium text-gray-500">Views</th>
                  <th className="text-right py-2 px-1 font-medium text-gray-500">Leads</th>
                  <th className="text-right py-2 px-1 font-medium text-gray-500">Spend</th>
                  <th className="text-right py-2 px-1 font-medium text-gray-500">CPL</th>
                  <th className="text-right py-2 px-1 font-medium text-gray-500 w-20">Trend</th>
                </tr>
              </thead>
              <tbody>
                {currentWeek.platforms.map((p) => (
                  <tr key={p.platform} className="border-b border-gray-100 last:border-0">
                    <td className="py-2 px-1 font-medium">{p.platform}</td>
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
        </div>

        {/* Top Performing Content */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Top Performing Content</h4>
          <div className="space-y-2">
            {currentWeek.topContent.map((content, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 rounded-lg p-2"
              >
                <div className="flex items-center gap-2">
                  {content.featured && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                  <div>
                    <span className="font-medium text-sm">&ldquo;{content.title}&rdquo;</span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {content.platform}
                    </Badge>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-500">
                  <span>{formatNumber(content.views)} views</span>
                  {content.leads > 0 && <span className="ml-2">{content.leads} leads</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Adjustments Section (Collapsible) */}
        <div className="border-t pt-4">
          <button
            onClick={() => setShowAdjustments(!showAdjustments)}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <span>What We Adjusted This Week</span>
            {showAdjustments ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {showAdjustments && (
            <div className="mt-3 space-y-2">
              {currentWeek.adjustments.map((adj, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${
                    adj.type === "positive"
                      ? "bg-green-50 border-green-500"
                      : adj.type === "caution"
                      ? "bg-amber-50 border-amber-500"
                      : "bg-blue-50 border-blue-500"
                  }`}
                >
                  <div
                    className={`mt-0.5 ${
                      adj.type === "positive"
                        ? "text-green-600"
                        : adj.type === "caution"
                        ? "text-amber-600"
                        : "text-blue-600"
                    }`}
                  >
                    <AdjustmentIcon icon={adj.icon} />
                  </div>
                  <span className="text-sm text-gray-700">{adj.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-4">
            <button
              onClick={onEmailReport}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <Mail className="w-4 h-4" />
              Email Report
            </button>
            <button
              onClick={onDownloadPDF}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <FileText className="w-4 h-4" />
              Download PDF
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={onViewPlan}>
            View This Week&apos;s Plan
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
