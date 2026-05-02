import { useEffect, useState } from "react";
import { RefreshCcw, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";

export const NetworkStatusBanner = () => {
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== "undefined" ? !navigator.onLine : false,
  );

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <div
      className="mb-4 flex flex-wrap items-start justify-between gap-3 rounded-[1.1rem] border border-blue-300/60 bg-white/60 px-4 py-3 shadow-[0_10px_28px_rgba(20,87,216,0.12)] backdrop-blur-xl"
      data-testid="network-offline-banner"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100/80 text-[var(--app-brand)]">
          <WifiOff className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--app-text)]" data-testid="network-offline-title">
            You’re offline
          </p>
          <p className="text-sm text-[var(--app-text-soft)]" data-testid="network-offline-description">
            Your private vault still works. Store search and external shopping links may be limited until you reconnect.
          </p>
        </div>
      </div>

      <Button
        className="h-8 px-3 text-xs"
        data-testid="network-offline-retry-button"
        onClick={() => window.location.reload()}
        size="sm"
        type="button"
        variant="outline"
      >
        <RefreshCcw className="h-3.5 w-3.5" /> Retry
      </Button>
    </div>
  );
};
