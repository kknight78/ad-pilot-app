'use client';

import { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

interface WhatsThisProps {
  children: React.ReactNode;
  className?: string;
}

export function WhatsThis({ children, className = '' }: WhatsThisProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={className}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
      >
        <HelpCircle className="w-3 h-3" />
        What&apos;s this?
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="text-xs text-gray-600 mt-2 pl-4 border-l-2 border-gray-300">
          {children}
        </div>
      )}
    </div>
  );
}
