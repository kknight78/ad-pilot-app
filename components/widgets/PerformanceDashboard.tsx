"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Eye, Users, DollarSign, TrendingUp, TrendingDown, Minus, Star } from "lucide-react";

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

export interface PerformanceDashboardProps {
  dateRange: string;
  totalViews: number;
  totalLeads: number;
  totalSpend: number;
  viewsTrend: number;
  leadsTrend: number;
  platforms: PlatformData[];
  topContent: TopContent[];
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num.toString();
}

function formatCurrency(num: number): string {
  return "$" + num.toFixed(2).replace(/\.00$/, "");
}

function TrendIndicator({ value, showPercent = true }: { value: number; showPercent?: boolean }) {
  if (value > 0) {
    return (
      <span className="flex items-center text-green-600 text-sm">
        <TrendingUp className="w-3 h-3 mr-0.5" />
        {showPercent && `↑ ${value}%`}
      </span>
    );
  } else if (value < 0) {
    return (
      <span className="flex items-center text-red-600 text-sm">
        <TrendingDown className="w-3 h-3 mr-0.5" />
        {showPercent && `↓ ${Math.abs(value)}%`}
      </span>
    );
  }
  return (
    <span className="flex items-center text-gray-500 text-sm">
      <Minus className="w-3 h-3 mr-0.5" />
      {showPercent && "→ 0%"}
    </span>
  );
}

export function PerformanceDashboard({
  dateRange,
  totalViews,
  totalLeads,
  totalSpend,
  viewsTrend,
  leadsTrend,
  platforms,
  topContent,
}: PerformanceDashboardProps) {
  const costPerLead = totalLeads > 0 ? totalSpend / totalLeads : 0;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary-100 rounded-lg">
            <BarChart3 className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Last Week&apos;s Performance</CardTitle>
            <p className="text-sm text-gray-500">{dateRange}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
              <Eye className="w-3 h-3" />
              Total Views
            </div>
            <div className="text-xl font-bold">{formatNumber(totalViews)}</div>
            <TrendIndicator value={viewsTrend} />
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
              <Users className="w-3 h-3" />
              Total Leads
            </div>
            <div className="text-xl font-bold">{totalLeads}</div>
            <TrendIndicator value={leadsTrend} />
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
              <DollarSign className="w-3 h-3" />
              Ad Spend
            </div>
            <div className="text-xl font-bold">{formatCurrency(totalSpend)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
              <TrendingUp className="w-3 h-3" />
              Cost/Lead
            </div>
            <div className="text-xl font-bold">{formatCurrency(costPerLead)}</div>
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
                  <th className="text-right py-2 px-1 font-medium text-gray-500">Trend</th>
                </tr>
              </thead>
              <tbody>
                {platforms.map((p) => (
                  <tr key={p.platform} className="border-b border-gray-100 last:border-0">
                    <td className="py-2 px-1 font-medium">{p.platform}</td>
                    <td className="text-right py-2 px-1 text-gray-600">{formatNumber(p.views)}</td>
                    <td className="text-right py-2 px-1 text-gray-600">{p.leads}</td>
                    <td className="text-right py-2 px-1 text-gray-600">{formatCurrency(p.spend)}</td>
                    <td className="text-right py-2 px-1 text-gray-600">{formatCurrency(p.cpl)}</td>
                    <td className="text-right py-2 px-1">
                      <TrendIndicator value={p.trend} />
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
            {topContent.map((content, index) => (
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
      </CardContent>
    </Card>
  );
}
