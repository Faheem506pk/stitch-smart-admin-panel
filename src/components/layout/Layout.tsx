import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { NetworkStatus } from "./NetworkStatus";
import { OnboardingBanner } from "./OnboardingBanner";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleMobileToggle = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        className={cn(
          "transition-all duration-300 ease-in-out",
          isMobile ? (mobileSidebarOpen ? "w-[18rem]" : "w-0") : sidebarCollapsed ? "w-[70px]" : "w-[250px]",
        )}
        onCollapse={(collapsed) => setSidebarCollapsed(collapsed)}
        isMobileSidebarOpen={mobileSidebarOpen}
        onMobileToggle={handleMobileToggle}
      />
      <Header sidebarCollapsed={sidebarCollapsed} onMobileToggle={handleMobileToggle} />
      <main className={cn("transition-all duration-300 ease-in-out pt-14 pb-8", isMobile ? "ml-0" : sidebarCollapsed ? "ml-[70px]" : "ml-[250px]")}>
        <OnboardingBanner />
        <div className="container mx-auto p-4">{children}</div>
      </main>
      <NetworkStatus />
    </div>
  );
}
