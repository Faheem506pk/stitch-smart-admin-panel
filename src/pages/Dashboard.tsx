
import { Layout } from "@/components/layout/Layout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { UpcomingDeliveries } from "@/components/dashboard/UpcomingDeliveries";
import { Users, FileText, Shirt, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome to your tailor shop management dashboard.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Customers"
            value="243"
            icon={<Users className="h-5 w-5" />}
            trend={{ value: 12, positive: true }}
          />
          <StatCard
            title="Total Orders"
            value="534"
            icon={<FileText className="h-5 w-5" />}
            trend={{ value: 8, positive: true }}
          />
          <StatCard
            title="Active Orders"
            value="42"
            icon={<Shirt className="h-5 w-5" />}
          />
          <StatCard
            title="Revenue (Month)"
            value="$12,543"
            icon={<DollarSign className="h-5 w-5" />}
            trend={{ value: 4, positive: true }}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-7">
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
