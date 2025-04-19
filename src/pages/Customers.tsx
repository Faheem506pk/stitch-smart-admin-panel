
import { Layout } from "@/components/layout/Layout";

const Customers = () => {
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground mt-1">
            Manage your tailor shop customers.
          </p>
        </div>
        
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-8 flex items-center justify-center">
          <p className="text-muted-foreground">Customer management interface will be implemented here.</p>
        </div>
      </div>
    </Layout>
  );
};

export default Customers;
