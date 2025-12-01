"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Video, Clock, Check, AlertCircle } from "lucide-react";

export interface ScheduledPost {
  id: string;
  date: string; // ISO date string
  title: string;
  thumbnailUrl?: string;
  platform: "facebook" | "tiktok" | "instagram" | "youtube";
  status: "scheduled" | "published" | "failed" | "draft";
  time?: string;
}

export interface ContentCalendarProps {
  posts: ScheduledPost[];
  weekStart?: Date;
  onPostClick?: (post: ScheduledPost) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
}

const platformColors = {
  facebook: "bg-blue-600",
  tiktok: "bg-black",
  instagram: "bg-gradient-to-r from-purple-500 to-pink-500",
  youtube: "bg-red-600",
};

const statusConfig = {
  scheduled: { icon: Clock, color: "text-amber-500", label: "Scheduled" },
  published: { icon: Check, color: "text-green-500", label: "Published" },
  failed: { icon: AlertCircle, color: "text-red-500", label: "Failed" },
  draft: { icon: Calendar, color: "text-gray-400", label: "Draft" },
};

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ContentCalendar({
  posts,
  weekStart = new Date(),
  onPostClick,
  onPrevWeek,
  onNextWeek,
}: ContentCalendarProps) {
  // Generate 7 days starting from weekStart
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() - date.getDay() + i); // Start from Sunday
    return date;
  });

  // Group posts by date
  const postsByDate = posts.reduce((acc, post) => {
    const dateKey = post.date.split("T")[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(post);
    return acc;
  }, {} as Record<string, ScheduledPost[]>);

  const formatWeekRange = () => {
    const start = days[0];
    const end = days[6];
    const startMonth = start.toLocaleDateString("en-US", { month: "short" });
    const endMonth = end.toLocaleDateString("en-US", { month: "short" });
    const year = end.getFullYear();

    if (startMonth === endMonth) {
      return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${year}`;
    }
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${year}`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            <CardTitle className="text-lg">Content Calendar</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={onPrevWeek}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[160px] text-center">
              {formatWeekRange()}
            </span>
            <Button size="sm" variant="ghost" onClick={onNextWeek}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {days.map((date, index) => (
            <div
              key={`header-${index}`}
              className={`text-center py-2 text-xs font-medium ${
                isToday(date) ? "text-primary-600" : "text-gray-500"
              }`}
            >
              <div>{dayNames[index]}</div>
              <div
                className={`text-lg ${
                  isToday(date)
                    ? "bg-primary-500 text-white rounded-full w-7 h-7 flex items-center justify-center mx-auto"
                    : ""
                }`}
              >
                {date.getDate()}
              </div>
            </div>
          ))}

          {/* Day cells with posts */}
          {days.map((date, index) => {
            const dateKey = date.toISOString().split("T")[0];
            const dayPosts = postsByDate[dateKey] || [];

            return (
              <div
                key={`cell-${index}`}
                className={`min-h-[100px] border rounded-lg p-1 ${
                  isToday(date) ? "border-primary-300 bg-primary-50/50" : "border-gray-100"
                }`}
              >
                {dayPosts.map((post) => {
                  const StatusIcon = statusConfig[post.status].icon;
                  return (
                    <button
                      key={post.id}
                      onClick={() => onPostClick?.(post)}
                      className="w-full mb-1 last:mb-0 group"
                    >
                      <div className="relative rounded overflow-hidden">
                        {/* Thumbnail or placeholder */}
                        {post.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={post.thumbnailUrl}
                            alt={post.title}
                            className="w-full aspect-video object-cover"
                          />
                        ) : (
                          <div className="w-full aspect-video bg-gray-100 flex items-center justify-center">
                            <Video className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                        {/* Platform indicator */}
                        <div
                          className={`absolute top-0.5 left-0.5 w-2 h-2 rounded-full ${
                            platformColors[post.platform]
                          }`}
                        />
                        {/* Status indicator */}
                        <div className="absolute top-0.5 right-0.5">
                          <StatusIcon
                            className={`w-3 h-3 ${statusConfig[post.status].color}`}
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-600 truncate mt-0.5 group-hover:text-primary-600">
                        {post.title}
                      </p>
                      {post.time && (
                        <p className="text-[9px] text-gray-400">{post.time}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t">
          {Object.entries(statusConfig).map(([status, config]) => {
            const Icon = config.icon;
            return (
              <div key={status} className="flex items-center gap-1 text-xs text-gray-500">
                <Icon className={`w-3 h-3 ${config.color}`} />
                {config.label}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
