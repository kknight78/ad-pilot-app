"use client";

import { useState, useEffect } from "react";
import { X, Share, Plus, Check } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(standalone);

    if (standalone) return; // Don't show if already installed

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    // Check if user has dismissed before (within last 7 days)
    const dismissed = localStorage.getItem("pwa-prompt-dismissed");
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSince = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return;
    }

    // Listen for the beforeinstallprompt event (Android/Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // For iOS, show after a short delay
    if (ios) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setInstalled(true);
        // Auto-hide after 5 seconds
        setTimeout(() => setShowPrompt(false), 5000);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-dismissed", new Date().toISOString());
  };

  if (!showPrompt || isStandalone) return null;

  return (
    // Only show on mobile devices (hidden on md and up)
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-gray-900 text-white shadow-2xl border-t border-gray-700 animate-slide-up">
      {!installed && (
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shrink-0">
          <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
            <path d="M20 2L38 20L20 38L2 20L20 2Z" fill="#3B82F6" stroke="#60A5FA" strokeWidth="1"/>
            <path d="M20 8L32 20L20 32L8 20L20 8Z" fill="#60A5FA" opacity="0.5"/>
            <path d="M16 13L28 20L16 27V13Z" fill="white"/>
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          {installed ? (
            <>
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400" />
                App Installed!
              </h3>
              <p className="text-sm text-gray-300 mt-1">
                Look for Ad Pilot on your home screen
              </p>
            </>
          ) : (
            <>
              <h3 className="font-semibold text-base">Install Ad Pilot</h3>

              {isIOS ? (
                <p className="text-sm text-gray-300 mt-1">
                  Tap <Share className="w-4 h-4 inline-block mx-1" /> then{" "}
                  <span className="whitespace-nowrap">&quot;Add to Home Screen&quot;</span>
                </p>
              ) : (
                <>
                  <p className="text-sm text-gray-300 mt-1">
                    Get quick access from your home screen
                  </p>
                  <button
                    onClick={handleInstall}
                    className="mt-2 px-4 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium transition-colors"
                  >
                    Install App
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
