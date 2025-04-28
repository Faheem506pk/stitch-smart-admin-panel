import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { usePermissions } from "@/hooks/use-permissions";
import { 
  LayoutDashboard, 
  Users, 
  Scissors, 
  FileText, 
  Truck, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Moon,
  Sun
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { useStore } from "@/store/useStore";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  className?: string;
  onCollapse?: (collapsed: boolean) => void;
  isMobileSidebarOpen?: boolean;
  onMobileToggle?: () => void;
}

export function Sidebar({ 
  className, 
  onCollapse, 
  isMobileSidebarOpen, 
  onMobileToggle 
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();

  const { canView } = usePermissions();
  
  // Define all possible nav items
  const allNavItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard, permission: null },
    { path: "/employees", label: "Employees", icon: Users, permission: { section: 'employees' as const, action: 'view' as const } },
    { path: "/customers", label: "Customers", icon: Users, permission: { section: 'customers' as const, action: 'view' as const } },
    { path: "/measurements", label: "Measurements", icon: Scissors, permission: { section: 'measurements' as const, action: 'view' as const } },
    { path: "/orders", label: "Orders", icon: FileText, permission: { section: 'orders' as const, action: 'view' as const } },
    { path: "/delivery", label: "Delivery", icon: Truck, permission: { section: 'orders' as const, action: 'view' as const } },
    { path: "/settings", label: "Settings", icon: Settings, permission: { section: 'settings' as const, action: 'view' as const } },
  ];
  
  // Filter nav items based on permissions
  const navItems = allNavItems.filter(item => 
    item.permission === null || 
    (item.permission && canView(item.permission.section))
  );

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 flex h-screen flex-col transition-all duration-300 ease-in-out",
        collapsed ? "w-[70px]" : "w-[250px]",
        className
      )}
    >
      <div className="flex h-full flex-col overflow-hidden bg-sidebar border-r border-sidebar-border">
        <div className="flex h-14 items-center border-b border-sidebar-border px-4">
          {(!collapsed && !isMobile) || (isMobile && isMobileSidebarOpen) ? (
            <Link to="/" className="flex items-center gap-2">
              <Scissors className="h-6 w-6 text-primary" />
              <span className="font-bold text-sidebar-foreground">StitchSmart</span>
            </Link>
          ) : null}

          {isMobile ? (
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={onMobileToggle}
            >
              <X size={20} />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className={cn("ml-auto", collapsed && "mx-auto")}
              onClick={() => {
                const newCollapsed = !collapsed;
                setCollapsed(newCollapsed);
                onCollapse?.(newCollapsed);
              }}
            >
              {collapsed ? <Menu size={20} /> : <X size={20} />}
            </Button>
          )}
        </div>

        <nav className="flex-1 overflow-auto p-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    location.pathname === item.path
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon size={20} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-sidebar-border p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full justify-start gap-3"
          >
            {theme === "dark" ? (
              <>
                <Sun size={20} />
                {!collapsed && <span>Light Mode</span>}
              </>
            ) : (
              <>
                <Moon size={20} />
                {!collapsed && <span>Dark Mode</span>}
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 text-destructive hover:text-destructive mt-1"
            onClick={() => {
              const logout = useStore.getState().logout;
              logout();
              window.location.href = "/login";
            }}
          >
            <LogOut size={20} />
            {!collapsed && <span>Logout</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
}
