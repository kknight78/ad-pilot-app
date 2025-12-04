"use client";

import React, { useState, useEffect } from "react";
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
  presenter: "all" | "kelly" | "shad" | "gary";
  category: "facts" | "pronunciation" | "style" | "compliance" | "other";
  rule: string;
  active: boolean;
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
  facts: "Facts",
  pronunciation: "Pronunciation",
  style: "Style",
  compliance: "Compliance",
  other: "Other",
};

const presenterLabels: Record<string, string> = {
  all: "All",
  kelly: "Kelly",
  shad: "Shad",
  gary: "Gary",
};

const presenterOptions = [
  { value: "all", label: "* All Presenters" },
  { value: "kelly", label: "Kelly" },
  { value: "shad", label: "Shad" },
  { value: "gary", label: "Gary" },
];

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
  { id: "c1", presenter: "kelly", category: "style", rule: "Kelly should always act like a badass", active: true },
  { id: "c2", presenter: "shad", category: "facts", rule: "Shad has over 35 years of automotive experience - mention this when introducing him", active: true },
  { id: "c3", presenter: "all", category: "facts", rule: "Capitol Car Credit has been family-owned for over 20 years", active: true },
  { id: "c4", presenter: "gary", category: "facts", rule: "Gary is the owner and founded the dealership", active: false },
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
  onToggleActive,
}: {
  rules: GuidanceRule[];
  isExpanded: boolean;
  onToggle: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleActive?: (id: string) => void;
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
              className={`flex items-start justify-between gap-2 p-3 bg-gray-50 rounded-lg group ${
                !rule.active ? "opacity-60" : ""
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500 font-medium">
                    {presenterLabels[rule.presenter]} • {categoryLabels[rule.category]}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleActive?.(rule.id);
                    }}
                    className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
                      rule.active
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                    }`}
                  >
                    {rule.active ? "Active" : "Inactive"}
                  </button>
                </div>
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

// Add/Edit Rule Modal
function RuleModal({
  isOpen,
  onClose,
  onSave,
  editingRule,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: Omit<GuidanceRule, "id">) => void;
  editingRule?: GuidanceRule | null;
}) {
  const [presenter, setPresenter] = useState<GuidanceRule["presenter"]>("all");
  const [category, setCategory] = useState<GuidanceRule["category"]>("facts");
  const [ruleText, setRuleText] = useState("");
  const [active, setActive] = useState(true);

  // Reset form when modal opens with editingRule
  useEffect(() => {
    if (isOpen) {
      if (editingRule) {
        setPresenter(editingRule.presenter);
        setCategory(editingRule.category);
        setRuleText(editingRule.rule);
        setActive(editingRule.active);
      } else {
        setPresenter("all");
        setCategory("facts");
        setRuleText("");
        setActive(true);
      }
    }
  }, [isOpen, editingRule]);

  const handleSubmit = () => {
    if (ruleText.trim()) {
      onSave({ presenter, category, rule: ruleText.trim(), active });
      setRuleText("");
      setPresenter("all");
      setCategory("facts");
      setActive(true);
      onClose();
    }
  };

  const handleClose = () => {
    setRuleText("");
    setPresenter("all");
    setCategory("facts");
    setActive(true);
    onClose();
  };

  if (!isOpen || typeof window === "undefined") return null;

  const isEditing = !!editingRule;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">
            {isEditing ? "Edit Custom Rule" : "Add Custom Rule"}
          </h3>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Presenter</label>
            <select
              value={presenter}
              onChange={(e) => setPresenter(e.target.value as GuidanceRule["presenter"])}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {presenterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

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
              placeholder='e.g., "Shad has over 35 years of experience"'
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <Button variant="outline" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!ruleText.trim()}>
            {isEditing ? "Save Changes" : "Add Rule"}
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
  customRules: initialCustomRules = demoCustomRules,
  onAddRule,
  onEditRule,
  onDeleteRule,
}: GuidanceRulesProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    base: false,
    templates: false,
    custom: true, // Expanded by default
  });

  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<GuidanceRule | null>(null);
  const [localRules, setLocalRules] = useState<GuidanceRule[]>(initialCustomRules);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleSaveRule = (rule: Omit<GuidanceRule, "id">) => {
    if (editingRule) {
      // Editing existing rule
      const updatedRule = { ...rule, id: editingRule.id };
      setLocalRules((prev) =>
        prev.map((r) => (r.id === editingRule.id ? updatedRule : r))
      );
      onEditRule?.(editingRule.id, rule);
      console.log("Editing rule:", editingRule.id, rule);
    } else {
      // Adding new rule
      const newRule = { ...rule, id: `c${Date.now()}` };
      setLocalRules((prev) => [...prev, newRule]);
      onAddRule?.(rule);
      console.log("Adding rule:", rule);
    }
    setEditingRule(null);
  };

  const handleEditRule = (id: string) => {
    const rule = localRules.find((r) => r.id === id);
    if (rule) {
      setEditingRule(rule);
      setShowModal(true);
    }
  };

  const handleDeleteRule = (id: string) => {
    setLocalRules((prev) => prev.filter((r) => r.id !== id));
    onDeleteRule?.(id);
    console.log("Deleting rule:", id);
  };

  const handleToggleActive = (id: string) => {
    setLocalRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
    console.log("Toggling active:", id);
  };

  const handleOpenAddModal = () => {
    setEditingRule(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRule(null);
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
            rules={localRules}
            isExpanded={expandedSections.custom}
            onToggle={() => toggleSection("custom")}
            onEdit={handleEditRule}
            onDelete={handleDeleteRule}
            onToggleActive={handleToggleActive}
          />

          {/* Add New Rule Button */}
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={handleOpenAddModal}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Rule
          </Button>
        </CardContent>
      </Card>

      <RuleModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSaveRule}
        editingRule={editingRule}
      />
    </>
  );
}
