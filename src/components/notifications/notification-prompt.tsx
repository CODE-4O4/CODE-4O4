"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { requestNotificationPermission, subscribeToNotifications } from "@/lib/notifications";
import { useAuth } from "@/context/auth-context";

export function NotificationPrompt() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    const shouldShow = () => {
      if (typeof window === "undefined" || !("Notification" in window)) return false;
      const permission = Notification.permission;
      if (permission !== "default") return false;
      if (localStorage.getItem("notification-prompt-dismissed")) return false;
      if (!user) return false;
      return true;
    };

    const timer = setTimeout(() => {
      if (shouldShow()) setShow(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [user]);

  const handleEnable = async () => {
    if (!user) return;
    setIsSubscribing(true);

    try {
      const granted = await requestNotificationPermission();
      if (!granted) {
        alert("Notification permission denied. You can enable it later from browser settings.");
        return;
      }

      const success = await subscribeToNotifications(user.id);
      if (!success) {
        alert("Failed to enable notifications. Please try again.");
        return;
      }

      setShow(false);

      setTimeout(async () => {
        if ("Notification" in window && Notification.permission === "granted") {
          const title = "🎉 Welcome to CODE 404!";
          const options: NotificationOptions = {
            body: "You'll now receive updates about events, projects, and club activities.",
            icon: "/icon-192x192.svg",
            badge: "/icon-192x192.svg",
          };

          try {
            // @ts-ignore
            new Notification(title, options);
          } catch (err) {
            try {
              const reg = await navigator.serviceWorker.getRegistration();
              if (reg) reg.showNotification(title, options as any);
            } catch (swErr) {
              console.error("Failed to show welcome notification via service worker:", swErr);
            }
          }
        }
      }, 1000);
    } catch (error) {
      console.error("Error enabling notifications:", error);
      alert("An error occurred. Please check the console.");
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("notification-prompt-dismissed", "true");
  };

  const handleLater = () => setShow(false);

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleLater}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md"
          >
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-cyan-500/20 rounded-2xl shadow-2xl p-6 relative">
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Bell className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Stay in the Loop</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Get instant updates about new events, project opportunities, and important club announcements. <span className="text-cyan-400 font-medium"> You can change this anytime.</span>
                </p>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Never miss upcoming events and sessions</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Get notified when projects need contributors</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>Receive updates on your membership status</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleEnable}
                  disabled={isSubscribing}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium py-3 px-4 rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25"
                >
                  {isSubscribing ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enabling...
                    </span>
                  ) : (
                    "Enable Notifications"
                  )}
                </button>

                <button
                  onClick={handleLater}
                  className="px-4 py-3 text-slate-400 hover:text-white font-medium transition-colors"
                >
                  Later
                </button>
              </div>

              <p className="text-xs text-slate-500 text-center mt-4">We respect your privacy. Unsubscribe anytime from settings.</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
