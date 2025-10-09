import React, { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface ExtendedNavigator extends Navigator {
  standalone?: boolean;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkStandalone = () => {
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)",
      ).matches;
      const isInWebAppiOS =
        (window.navigator as ExtendedNavigator).standalone === true;
      setIsStandalone(isStandalone || isInWebAppiOS);
    };

    checkStandalone();

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show prompt after a delay (don't show immediately)
      setTimeout(() => {
        if (!isStandalone && !localStorage.getItem("pwa-prompt-dismissed")) {
          setShowPrompt(true);
        }
      }, 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for app installation
    window.addEventListener("appinstalled", () => {
      setDeferredPrompt(null);
      setShowPrompt(false);
      localStorage.setItem("pwa-installed", "true");
    });

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setShowPrompt(false);
        localStorage.setItem("pwa-installed", "true");
      }
    } catch (error) {
      console.error("Install prompt failed:", error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-dismissed", "true");

    // Reset dismissal after 7 days
    setTimeout(
      () => {
        localStorage.removeItem("pwa-prompt-dismissed");
      },
      7 * 24 * 60 * 60 * 1000,
    );
  };

  // Don't show if already installed or in standalone mode
  if (isStandalone || !showPrompt) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 mx-auto max-w-sm">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900">
                  Install SkillXChange
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {isIOS
                    ? "Tap the share button and select 'Add to Home Screen'"
                    : "Add to your home screen for the best experience"}
                </p>
              </div>

              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {!isIOS && deferredPrompt && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleInstallClick}
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Install App</span>
              </motion.button>
            )}

            {isIOS && (
              <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <p className="text-sm text-blue-800 font-medium">
                    Tap the share button (⬆️) above, then "Add to Home Screen"
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;
