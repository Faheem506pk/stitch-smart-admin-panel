import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/utils/currencyUtils";
import { useTenant } from "@/context/TenantContext";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { Loader2 } from "lucide-react";

interface Order {
  id: string;
  customer: { name: string };
  orderTypeDisplay: string;
  status: string;
  totalAmount: number;
}

const StatusBadgeMap: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  },
  stitching: {
    label: "Stitching",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  },
  ready: {
    label: "Ready",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  delivered: {
    label: "Delivered",
    className: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  },
};

export function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { tenantDb, isTenantConfigured } = useTenant();

  useEffect(() => {
    if (!tenantDb || !isTenantConfigured) {
      setIsLoading(false);
      return;
    }

    const fetchRecentOrders = async () => {
      setIsLoading(true);
      try {
        const ordersQuery = query(collection(tenantDb, "orders"), orderBy("createdAt", "desc"), limit(5));
        const snapshot = await getDocs(ordersQuery);
        const ordersList: Order[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          customer: doc.data().customer || { name: "Unknown" },
          orderTypeDisplay: doc.data().orderTypeDisplay || "N/A",
          status: doc.data().status || "pending",
          totalAmount: doc.data().totalAmount || 0,
        }));
        setOrders(ordersList);
      } catch (error) {
        console.error("Error fetching recent orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentOrders();
  }, [tenantDb, isTenantConfigured]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Orders</CardTitle>
        <Link to="/orders">
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No orders yet.</p>
            <p className="text-sm mt-1">Orders will appear here once created.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const statusConfig = StatusBadgeMap[order.status] || {
                  label: order.status,
                  className: "bg-gray-100 text-gray-800",
                };
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer?.name || "Unknown"}</TableCell>
                    <TableCell>{order.orderTypeDisplay}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(statusConfig.className)}>
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(order.totalAmount)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
