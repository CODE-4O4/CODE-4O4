"use client";

import { useEffect } from "react";

export default function SwRegister() {
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (typeof window === "undefined") return;
      try {
        const webpush = await import("@/lib/webpush");
        
        await webpush.registerServiceWorker();
      } catch (e) {
        
        
        console.warn('SW register failed (sw-register component)', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return null;
}
