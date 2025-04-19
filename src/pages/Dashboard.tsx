
import { Layout } from "@/components/layout/Layout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { UpcomingDeliveries } from "@/components/dashboard/UpcomingDeliveries";
import { Users, FileText, Shirt, DollarSign } from "lucide-react";

const Dashboard = () => {
  return (
    <Layout>
      <div className="flex flex-col gap-4 md:gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Welcome to your tailor shop management dashboard.
          </p>
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-2 md:grid-cols-4">
          <StatCard
            title="Total Customers"
            value="243"
            icon={<Users className="h-4 w-4 md:h-5 md:w-5" />}
            trend={{ value: 12, positive: true }}
          />
          <StatCard
            title="Total Orders"
            value="534"
            icon={<FileText className="h-4 w-4 md:h-5 md:w-5" />}
            trend={{ value: 8, positive: true }}
          />
          <StatCard
            title="Active Orders"
            value="42"
            icon={<Shirt className="h-4 w-4 md:h-5 md:w-5" />}
          />
          <StatCard
            title="Revenue (Month)"
            value="$12,543"
            icon={<DollarSign className="h-4 w-4 md:h-5 md:w-5" />}
            trend={{ value: 4, positive: true }}
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
      </div>
    </Layout>
  );
};

export default Dashboard;
