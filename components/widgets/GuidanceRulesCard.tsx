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
} from "lucide-react";

export interface GuidanceRule {
  id: string;
  category: "tone" | "content" | "cta" | "forbidden" | "style";
  rule: string;
}

export interface TemplateRules {
  templateName: string;
  rules: string[];
}

export interface GuidanceRulesProps {
  baseRules?: Record<string, string[]>;
  templateRules?: TemplateRules[];
  customRules?: GuidanceRule[];
  onAddRule?: (rule: Omit<GuidanceRule, "id">) => void;
  onEditRule?: (id: string, rule: Omit<GuidanceRule, "id">) => void;
  onDeleteRule?: (id: string) => void;
}

const categoryLabels: Record<string, string> = {
  tone: "Tone",
  content: "Content",
  cta: "CTA",
  forbidden: "Forbidden",
  style: "Style",
};

// Demo data - Base Rules grouped by category
const demoBaseRules: Record<string, string[]> = {
  Tone: ["Friendly and approachable", "Never pushy or salesy"],
  Content: ["Always mention financing", "Highlight key features", "Include year/make/model"],
  CTA: ["Include clear next step", "Provide contact info"],
  Forbidden: ["Never guarantee APR", "No false claims"],
  Style: ["Casual and conversational", "Short sentences", "Avoid jargon"],
};

// Demo data - Template Rules (merged into one section)
const demoTemplateRules: TemplateRules[] = [
  {
    templateName: "Deep Dive",
    rules: ["Single vehicle focus", "Mention price/financing", "45-60 sec"],
  },
  {
    templateName: "Multi-Car",
    rules: ["Compare 2-3 vehicles", "Highlight variety"],
  },
  {
    templateName: "Capitol Smarts",
    rules: ["Educational tone", "Help not sell", "Soft CTA only"],
  },
];

// Demo data - Custom Rules
const demoCustomRules: GuidanceRule[] = [
  { id: "c1", category: "tone", rule: "Highlight local Rantoul connection" },
  { id: "c2", category: "cta", rule: "Primary: Call or text (217) 893-1190" },
  { id: "c3", category: "forbidden", rule: "Never mention competitor dealerships" },
];

// Compact Base Rules Section
function BaseRulesSection({
  rules,
  isExpanded,
  onToggle,
}: {
  rules: Record<string, string[]>;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const totalRules = Object.values(rules).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
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
          <span className="font-medium text-gray-900 text-sm">Base Rules (Ad Pilot defaults)</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          {totalRules} rules
        </Badge>
      </button>

      {isExpanded && (
        <div className="p-3 space-y-3 bg-white">
          {Object.entries(rules).map(([category, categoryRules]) => (
            <div key={category}>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                {category}
              </div>
              <p className="text-sm text-gray-700">
                {categoryRules.join(" • ")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Compact Template Rules Section
function TemplateRulesSection({
  templates,
  isExpanded,
  onToggle,
}: {
  templates: TemplateRules[];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const totalRules = templates.reduce((sum, t) => sum + t.rules.length, 0);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
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
          <span className="font-medium text-gray-900 text-sm">Template Rules</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          {totalRules} rules
        </Badge>
      </button>

      {isExpanded && (
        <div className="p-3 space-y-3 bg-white">
          {templates.map((template) => (
            <div key={template.templateName}>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                {template.templateName}
              </div>
              <p className="text-sm text-gray-700">
                {template.rules.join(" • ")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Custom Rules Section (editable, expanded by default)
function CustomRulesSection({
  rules,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
}: {
  rules: GuidanceRule[];
  isExpanded: boolean;
  onToggle: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
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
          <span className="font-medium text-gray-900 text-sm">Your Custom Rules</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          {rules.length} {rules.length === 1 ? "rule" : "rules"}
        </Badge>
      </button>

      {isExpanded && (
        <div className="p-3 space-y-2 bg-white">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-start justify-between gap-2 p-2 bg-gray-50 rounded-lg group"
            >
              <div className="flex-1 min-w-0">
                <span className="text-xs text-gray-500 font-medium">
                  {categoryLabels[rule.category]}
                </span>
                <p className="text-sm text-gray-700">{rule.rule}</p>
              </div>

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
            </div>
          ))}

          {rules.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">No custom rules yet</p>
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
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Add Custom Rule</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as GuidanceRule["category"])}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rule</label>
            <textarea
              value={ruleText}
              onChange={(e) => setRuleText(e.target.value)}
              placeholder='e.g., "Always mention we are family-owned"'
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
            />
          </div>
        </div>

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
  baseRules = demoBaseRules,
  templateRules = demoTemplateRules,
  customRules = demoCustomRules,
  onAddRule,
  onDeleteRule,
}: GuidanceRulesProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    base: false,
    templates: false,
    custom: true, // Expanded by default
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
          {/* Base Rules - collapsed by default */}
          <BaseRulesSection
            rules={baseRules}
            isExpanded={expandedSections.base}
            onToggle={() => toggleSection("base")}
          />

          {/* Template Rules - collapsed by default */}
          <TemplateRulesSection
            templates={templateRules}
            isExpanded={expandedSections.templates}
            onToggle={() => toggleSection("templates")}
          />

          {/* Custom Rules - expanded by default, editable */}
          <CustomRulesSection
            rules={customRules}
            isExpanded={expandedSections.custom}
            onToggle={() => toggleSection("custom")}
            onEdit={handleEditRule}
            onDelete={handleDeleteRule}
          />

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

      <AddRuleModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddRule}
      />
    </>
  );
}
