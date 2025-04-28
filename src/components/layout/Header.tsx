
import { useState, useEffect } from "react";
import { Bell, Search, Menu, User, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useStore } from "@/store/useStore";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  sidebarCollapsed: boolean;
  onMobileToggle?: () => void; // new prop to toggle mobile sidebar
}

export function Header({ sidebarCollapsed, onMobileToggle }: HeaderProps) {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications] = useState([
    {
      id: 1,
      title: "Order #1234 ready for delivery",
      time: "10 minutes ago",
    },
    {
      id: 2,
      title: "New customer registration",
      time: "1 hour ago",
    },
    {
      id: 3,
      title: "Delivery due today (3 orders)",
      time: "2 hours ago",
    },
  ]);

  const isMobile = useIsMobile();
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      className={cn(
        "fixed top-0 z-20 flex h-14 items-center border-b border-border bg-background px-4",
        isMobile
          ? "left-0 w-full"
          : sidebarCollapsed
          ? "left-[70px] w-[calc(100%-70px)]"
          : "left-[250px] w-[calc(100%-250px)]"
      )}
    >
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center space-x-2">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onMobileToggle && onMobileToggle()}
              className="mr-2 md:hidden"
              aria-label="Toggle Sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search customers, orders..."
              className={cn(
                "w-full rounded-md pl-8",
                isMobile ? "max-w-[150px]" : "md:w-[300px] lg:w-[400px]"
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle Button - Only visible on mobile */}
          <ThemeToggle className="md:hidden" />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {notifications.length}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px]">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex flex-col items-start py-2"
                >
                  <span>{notification.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {notification.time}
                  </span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center font-medium">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <div className="h-8 w-8 rounded-full overflow-hidden">
                  {user?.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt={user?.name || 'User'} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-primary/20 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {user?.name?.charAt(0) || 'A'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-muted-foreground">{user?.role === 'admin' ? 'Administrator' : 'Employee'}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

// Theme toggle component
function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={className}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}
