
import { useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

export function NetworkStatus() {
  const isOnline = useStore((state) => state.isOnline);
  const setOnlineStatus = useStore((state) => state.setOnlineStatus);

  useEffect(() => {
    // Update initial state
    setOnlineStatus(navigator.onLine);

    // Event listeners
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setOnlineStatus]);

  if (isOnline) {
    return null; // Don't show anything when online
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-md bg-amber-100 px-3 py-2 text-sm font-medium text-amber-800 shadow-md">
      <WifiOff size={18} />
      <span>You are offline. Changes will be synced when you reconnect.</span>
    </div>
  );
}
