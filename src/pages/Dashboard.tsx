import { Layout } from "@/components/layout/Layout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { UpcomingDeliveries } from "@/components/dashboard/UpcomingDeliveries";
import { Users, FileText, Shirt, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddCustomerDialog } from "@/components/customers/AddCustomerDialog";
import { useState, useEffect } from "react";
import { formatCurrency } from "@/utils/currencyUtils";
import { RupeeIcon } from "@/utils/icons";
import { useTenant } from "@/context/TenantContext";
import { collection, getDocs, query, where } from "firebase/firestore";

const Dashboard = () => {
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const { tenantDb, isTenantConfigured } = useTenant();

  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [activeOrders, setActiveOrders] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!tenantDb || !isTenantConfigured) {
      setIsLoading(false);
      return;
    }

    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Fetch total customers
        const customersSnap = await getDocs(collection(tenantDb, "customers"));
        setTotalCustomers(customersSnap.size);

        // Fetch total orders
        const ordersSnap = await getDocs(collection(tenantDb, "orders"));
        setTotalOrders(ordersSnap.size);

        // Fetch active orders (pending + stitching + ready)
        const activeStatuses = ["pending", "stitching", "ready"];
        let activeCount = 0;
        for (const status of activeStatuses) {
          const activeQuery = query(collection(tenantDb, "orders"), where("status", "==", status));
          const activeSnap = await getDocs(activeQuery);
          activeCount += activeSnap.size;
        }
        setActiveOrders(activeCount);

        // Calculate monthly revenue from delivered orders this month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        let revenue = 0;
        ordersSnap.forEach((doc) => {
          const data = doc.data();
          if (data.createdAt >= startOfMonth && data.totalAmount) {
            revenue += Number(data.totalAmount) || 0;
          }
        });
        setMonthlyRevenue(revenue);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [tenantDb, isTenantConfigured]);

  return (
    <Layout>
      <div className="flex flex-col gap-4 md:gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">Welcome to your tailor shop management dashboard.</p>
          </div>
          <Button onClick={() => setIsAddCustomerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Customer
          </Button>
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-2 md:grid-cols-4">
          <StatCard
            title="Total Customers"
            value={isLoading ? "..." : totalCustomers.toString()}
            icon={<Users className="h-4 w-4 md:h-5 md:w-5" />}
          />
          <StatCard title="Total Orders" value={isLoading ? "..." : totalOrders.toString()} icon={<FileText className="h-4 w-4 md:h-5 md:w-5" />} />
          <StatCard title="Active Orders" value={isLoading ? "..." : activeOrders.toString()} icon={<Shirt className="h-4 w-4 md:h-5 md:w-5" />} />
          <StatCard
            title="Revenue (Month)"
            value={isLoading ? "..." : formatCurrency(monthlyRevenue)}
            icon={<RupeeIcon className="h-4 w-4 md:h-5 md:w-5" />}
          />
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-7">
          <div className="md:col-span-4">
            <RecentOrders />
          </div>
          <div className="md:col-span-3">
            <UpcomingDeliveries />
          </div>
        </div>

        <AddCustomerDialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen} />
      </div>
    </Layout>
  );
};

export default Dashboard;
