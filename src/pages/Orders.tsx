
import { Layout } from "@/components/layout/Layout";

const Orders = () => {
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Manage tailor shop orders.
          </p>
        </div>
        
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-8 flex items-center justify-center">
          <p className="text-muted-foreground">Orders management interface will be implemented here.</p>
        </div>
      </div>
    </Layout>
  );
};

export default Orders;
