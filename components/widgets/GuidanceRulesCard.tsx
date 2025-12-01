"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Plus, Pencil, Trash2, MessageSquare, Phone, Sparkles, Target } from "lucide-react";

export interface GuidanceRule {
  id: string;
  category: "tone" | "content" | "cta" | "style";
  rule: string;
}

export interface GuidanceRulesProps {
  rules: GuidanceRule[];
  clientName?: string;
  onAddRule?: () => void;
  onEditRule?: (id: string) => void;
  onDeleteRule?: (id: string) => void;
}

const categoryConfig = {
  tone: {
    label: "Tone",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: MessageSquare,
  },
  content: {
    label: "Content",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Sparkles,
  },
  cta: {
    label: "Call to Action",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: Phone,
  },
  style: {
    label: "Style",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: Target,
  },
};

export function GuidanceRulesCard({
  rules,
  clientName = "Your Business",
  onAddRule,
  onEditRule,
  onDeleteRule,
}: GuidanceRulesProps) {
  // Group rules by category
  const groupedRules = rules.reduce((acc, rule) => {
    if (!acc[rule.category]) {
      acc[rule.category] = [];
    }
    acc[rule.category].push(rule);
    return acc;
  }, {} as Record<string, GuidanceRule[]>);

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Settings className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Guidance Rules</CardTitle>
            <p className="text-sm text-gray-500">{clientName}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {Object.entries(groupedRules).map(([category, categoryRules]) => {
          const config = categoryConfig[category as keyof typeof categoryConfig];
          const CategoryIcon = config.icon;

          return (
            <div key={category} className="space-y-2">
              <div className="flex items-center gap-2">
                <CategoryIcon className="w-4 h-4 text-gray-400" />
                <Badge variant="outline" className={config.color}>
                  {config.label}
                </Badge>
              </div>
              <ul className="space-y-2 pl-6">
                {categoryRules.map((rule) => (
                  <li
                    key={rule.id}
                    className="flex items-start justify-between group bg-gray-50 rounded-lg p-2 -ml-2"
                  >
                    <span className="text-sm text-gray-700 flex-1">{rule.rule}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      {onEditRule && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => onEditRule(rule.id)}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                      )}
                      {onDeleteRule && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => onDeleteRule(rule.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        {rules.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No guidance rules configured yet.</p>
          </div>
        )}
      </CardContent>

      {onAddRule && (
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={onAddRule}>
            <Plus className="w-4 h-4 mr-2" />
            Add Rule
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
