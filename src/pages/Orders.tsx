
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { AddOrderDialog } from "@/components/orders/AddOrderDialog";

const Orders = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground mt-1">
              Manage tailor shop orders.
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2" />
            New Order
          </Button>
        </div>
        
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-4">Order ID</th>
                  <th className="text-left pb-4">Customer</th>
                  <th className="text-left pb-4">Status</th>
                  <th className="text-left pb-4">Due Date</th>
                  <th className="text-right pb-4">Amount</th>
                  <th className="text-right pb-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-4" colSpan={6}>
                    <p className="text-center text-muted-foreground">No orders found. Create your first order.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <AddOrderDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
      />
    </Layout>
  );
};

export default Orders;
