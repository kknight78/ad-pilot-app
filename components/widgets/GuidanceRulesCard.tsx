"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  ChevronDown,
  X,
  MessageSquare,
  FileText,
  Phone,
  Ban,
  Palette,
} from "lucide-react";

export interface GuidanceRule {
  id: string;
  category: "tone" | "content" | "cta" | "forbidden" | "style";
  rule: string;
}

export interface RuleSection {
  id: string;
  name: string;
  rules: GuidanceRule[];
  editable: boolean;
}

export interface GuidanceRulesProps {
  sections?: RuleSection[];
  onAddRule?: (rule: Omit<GuidanceRule, "id">) => void;
  onEditRule?: (id: string, rule: Omit<GuidanceRule, "id">) => void;
  onDeleteRule?: (id: string) => void;
  // Legacy props for backwards compatibility
  rules?: GuidanceRule[];
  clientName?: string;
}

const categoryConfig = {
  tone: {
    label: "Tone",
    icon: MessageSquare,
    emoji: "🏷️",
  },
  content: {
    label: "Content",
    icon: FileText,
    emoji: "📝",
  },
  cta: {
    label: "CTA",
    icon: Phone,
    emoji: "📞",
  },
  forbidden: {
    label: "Forbidden",
    icon: Ban,
    emoji: "🚫",
  },
  style: {
    label: "Style",
    icon: Palette,
    emoji: "🎨",
  },
};

// Demo data
const demoSections: RuleSection[] = [
  {
    id: "base",
    name: "Base Rules (Ad Pilot defaults)",
    editable: false,
    rules: [
      { id: "b1", category: "tone", rule: "Friendly and approachable" },
      { id: "b2", category: "tone", rule: "Never pushy or salesy" },
      { id: "b3", category: "content", rule: "Always mention financing options" },
      { id: "b4", category: "content", rule: "Highlight key vehicle features" },
      { id: "b5", category: "content", rule: "Include vehicle year, make, and model" },
      { id: "b6", category: "cta", rule: "Include clear next step" },
      { id: "b7", category: "cta", rule: "Provide contact information" },
      { id: "b8", category: "forbidden", rule: "Never guarantee specific APR rates" },
      { id: "b9", category: "forbidden", rule: "No false claims about vehicle history" },
      { id: "b10", category: "style", rule: "Use casual, conversational language" },
      { id: "b11", category: "style", rule: "Keep sentences short and punchy" },
      { id: "b12", category: "style", rule: "Avoid industry jargon" },
    ],
  },
  {
    id: "deep-dive",
    name: "Template: Deep Dive",
    editable: false,
    rules: [
      { id: "dd1", category: "content", rule: "Focus on single vehicle deep features" },
      { id: "dd2", category: "content", rule: "Mention price and financing" },
      { id: "dd3", category: "style", rule: "45-60 second target length" },
      { id: "dd4", category: "cta", rule: "End with test drive invitation" },
    ],
  },
  {
    id: "multi-car",
    name: "Template: Multi-Car",
    editable: false,
    rules: [
      { id: "mc1", category: "content", rule: "Showcase 3-5 vehicles" },
      { id: "mc2", category: "style", rule: "Quick highlights, not deep dives" },
      { id: "mc3", category: "cta", rule: "Drive traffic to inventory page" },
    ],
  },
  {
    id: "capitol-smarts",
    name: "Template: Capitol Smarts",
    editable: false,
    rules: [
      { id: "cs1", category: "tone", rule: "Educational tone, not sales" },
      { id: "cs2", category: "tone", rule: "Focus on helping, not selling" },
      { id: "cs3", category: "content", rule: "Include practical tips" },
      { id: "cs4", category: "content", rule: "Establish expertise" },
      { id: "cs5", category: "cta", rule: "Soft CTA only" },
    ],
  },
  {
    id: "custom",
    name: "Your Custom Rules",
    editable: true,
    rules: [
      { id: "c1", category: "tone", rule: "Highlight local Rantoul connection" },
      { id: "c2", category: "cta", rule: "Primary: Call or text (217) 893-1190" },
      { id: "c3", category: "forbidden", rule: "Never mention competitor dealerships" },
    ],
  },
];

// Collapsible Section Component
function CollapsibleSection({
  section,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
}: {
  section: RuleSection;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Section Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          <span className="font-medium text-gray-900 text-sm">{section.name}</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          {section.rules.length} {section.rules.length === 1 ? "rule" : "rules"}
        </Badge>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-3 space-y-2 bg-white">
          {section.rules.map((rule) => {
            const config = categoryConfig[rule.category];
            return (
              <div
                key={rule.id}
                className="flex items-start justify-between gap-2 p-2 bg-gray-50 rounded-lg group"
              >
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <span className="text-sm shrink-0">{config.emoji}</span>
                  <div className="min-w-0">
                    <span className="text-xs text-gray-500 font-medium">{config.label}:</span>
                    <p className="text-sm text-gray-700">{rule.rule}</p>
                  </div>
                </div>

                {/* Edit/Delete buttons - only for editable sections */}
                {section.editable && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {onEdit && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-gray-400 hover:text-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(rule.id);
                        }}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(rule.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {section.rules.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">No rules in this section</p>
          )}
        </div>
      )}
    </div>
  );
}

// Add Rule Modal
function AddRuleModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (rule: Omit<GuidanceRule, "id">) => void;
}) {
  const [category, setCategory] = useState<GuidanceRule["category"]>("tone");
  const [ruleText, setRuleText] = useState("");

  const handleSubmit = () => {
    if (ruleText.trim()) {
      onAdd({ category, rule: ruleText.trim() });
      setRuleText("");
      setCategory("tone");
      onClose();
    }
  };

  if (!isOpen || typeof window === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Add Custom Rule</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Category Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as GuidanceRule["category"])}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.entries(categoryConfig).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.emoji} {config.label}
                </option>
              ))}
            </select>
          </div>

          {/* Rule Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rule</label>
            <textarea
              value={ruleText}
              onChange={(e) => setRuleText(e.target.value)}
              placeholder='e.g., "Always mention we&apos;re family-owned"'
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!ruleText.trim()}>
            Add Rule
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function GuidanceRulesCard({
  sections = demoSections,
  onAddRule,
  onEditRule,
  onDeleteRule,
}: GuidanceRulesProps) {
  // Track which sections are expanded
  // Custom rules expanded by default, others collapsed
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    custom: true,
  });

  const [showAddModal, setShowAddModal] = useState(false);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleAddRule = (rule: Omit<GuidanceRule, "id">) => {
    console.log("Adding rule:", rule);
    onAddRule?.(rule);
  };

  const handleEditRule = (id: string) => {
    console.log("Editing rule:", id);
    // In a real implementation, this would open an edit modal
  };

  const handleDeleteRule = (id: string) => {
    console.log("Deleting rule:", id);
    onDeleteRule?.(id);
  };

  return (
    <>
      <Card className="w-full max-w-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <ClipboardList className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Guidance Rules</CardTitle>
              <p className="text-sm text-gray-500">These shape how your content sounds</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {sections.map((section) => (
            <CollapsibleSection
              key={section.id}
              section={section}
              isExpanded={expandedSections[section.id] || false}
              onToggle={() => toggleSection(section.id)}
              onEdit={section.editable ? handleEditRule : undefined}
              onDelete={section.editable ? handleDeleteRule : undefined}
            />
          ))}

          {/* Add New Rule Button */}
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Rule
          </Button>
        </CardContent>
      </Card>

      {/* Add Rule Modal */}
      <AddRuleModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddRule}
      />
    </>
  );
}
