'use client';

import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

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
        {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {isOpen && (
        <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-600">
          {children}
        </div>
      )}
    </div>
  );
}
