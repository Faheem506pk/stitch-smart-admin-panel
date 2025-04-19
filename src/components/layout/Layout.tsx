
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { NetworkStatus } from "./NetworkStatus";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        className={sidebarCollapsed ? "w-[70px]" : "w-[250px]"} 
        onCollapse={(collapsed) => setSidebarCollapsed(collapsed)}
      />
      <Header sidebarCollapsed={sidebarCollapsed} />
      <main 
        className={cn(
          "pt-14 pb-8 transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "ml-[70px]" : "ml-[250px]"
        )}
      >
        <div className="container mx-auto p-4 md:p-6">
          {children}
        </div>
      </main>
      <NetworkStatus />
    </div>
  );
}
