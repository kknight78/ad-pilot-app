"use client";

import { Button } from "@/components/ui/button";

export interface ActionButton {
  label: string;
  message: string;
  variant?: "primary" | "secondary";
}

export interface ActionButtonsProps {
  buttons: ActionButton[];
  onAction: (message: string) => void;
  disabled?: boolean;
}

export function ActionButtons({
  buttons,
  onAction,
  disabled = false,
}: ActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2 my-2">
      {buttons.map((button, index) => (
        <Button
          key={index}
          variant={button.variant === "secondary" ? "outline" : "default"}
          size="sm"
          onClick={() => onAction(button.message)}
          disabled={disabled}
          className={
            button.variant === "secondary"
              ? "border-gray-300 text-gray-700 hover:bg-gray-50"
              : ""
          }
        >
          {button.label}
        </Button>
      ))}
    </div>
  );
}
