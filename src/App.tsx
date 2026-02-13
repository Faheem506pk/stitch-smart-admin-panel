import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { TenantProvider } from "@/context/TenantContext";
import Index from "./pages/Index";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import Measurements from "./pages/Measurements";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import EditOrder from "./pages/EditOrder";
import Delivery from "./pages/Delivery";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Search from "./pages/Search";
import { useStore } from "@/store/useStore";
import { initializeFirebaseApp } from "./lib/firebaseUtils";

const queryClient = new QueryClient();

const App = () => {
  const isOnline = useStore((state) => state.isOnline);

  useEffect(() => {
    // Initialize Firebase
    initializeFirebaseApp().catch(console.error);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="tailor-shop-theme">
        <TenantProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/employees"
                  element={
                    <ProtectedRoute requiredPermission={{ section: "employees", action: "view" }}>
                      <Employees />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customers"
                  element={
                    <ProtectedRoute requiredPermission={{ section: "customers", action: "view" }}>
                      <Customers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customers/:id"
                  element={
                    <ProtectedRoute requiredPermission={{ section: "customers", action: "view" }}>
                      <CustomerDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/measurements"
                  element={
                    <ProtectedRoute requiredPermission={{ section: "measurements", action: "view" }}>
                      <Measurements />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute requiredPermission={{ section: "orders", action: "view" }}>
                      <Orders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoute requiredPermission={{ section: "orders", action: "view" }}>
                      <OrderDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id/edit"
                  element={
                    <ProtectedRoute requiredPermission={{ section: "orders", action: "edit" }}>
                      <EditOrder />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/delivery"
                  element={
                    <ProtectedRoute requiredPermission={{ section: "orders", action: "view" }}>
                      <Delivery />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute requiredPermission={{ section: "settings", action: "view" }}>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/search"
                  element={
                    <ProtectedRoute>
                      <Search />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </TenantProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
