'use client';

import { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface WhatsThisProps {
  children: React.ReactNode;
  className?: string;
}

export function WhatsThis({ children, className = '' }: WhatsThisProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
      >
        <HelpCircle className="w-3 h-3" />
        What&apos;s this?
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-72 bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-600 shadow-lg">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="pr-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
