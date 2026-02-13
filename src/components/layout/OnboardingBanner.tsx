import { AlertTriangle, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTenant } from "@/context/TenantContext";
import { useStore } from "@/store/useStore";
import { useState, useEffect } from "react";

export function OnboardingBanner() {
  const { isTenantConfigured, isSuperAdmin, userProfile } = useTenant();
  const { user } = useStore();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  // Check localStorage for dismissed state - but only for current session
  useEffect(() => {
    const dismissedKey = `onboarding_banner_dismissed_${user?.id}`;
    const wasDismissed = localStorage.getItem(dismissedKey);
    if (wasDismissed === "true") {
      setDismissed(true);
    }
  }, [user?.id]);

  const handleDismiss = () => {
    setDismissed(true);
    const dismissedKey = `onboarding_banner_dismissed_${user?.id}`;
    localStorage.setItem(dismissedKey, "true");
  };

  // Don't show if:
  // - User is Super Admin (they don't need tenant config)
  // - Tenant is already configured
  // - Banner was dismissed for this session
  // - No user logged in
  if (isSuperAdmin || isTenantConfigured || dismissed || !user) {
    return null;
  }

  // Only show for 'admin' role (clients), not employees
  if (user.role !== "admin") {
    return null;
  }

  const hasFirebaseConfig = !!userProfile?.tenantConfig?.apiKey;
  const hasCloudinaryConfig = !!userProfile?.tenantConfig?.cloudinaryCloudName;

  // If both are configured, don't show
  if (hasFirebaseConfig && hasCloudinaryConfig) {
    return null;
  }

  return (
    <div className="relative bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-white px-4 py-3 shadow-md">
      <div className="flex items-center justify-between max-w-screen-xl mx-auto">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 animate-pulse" />
          <div>
            <p className="font-semibold text-sm">Setup Required — Please configure your API keys to start using the app</p>
            <p className="text-xs text-white/80 mt-0.5">
              {!hasFirebaseConfig && !hasCloudinaryConfig
                ? "Firebase and Cloudinary APIs need to be configured."
                : !hasFirebaseConfig
                  ? "Firebase API keys need to be configured."
                  : "Cloudinary API keys need to be configured."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="bg-white text-orange-600 hover:bg-white/90 font-medium text-xs"
            onClick={() => navigate("/settings")}
          >
            <Settings className="h-3.5 w-3.5 mr-1.5" />
            Go to Settings
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/10" onClick={handleDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
