import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useTenant } from "@/context/TenantContext";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { formatCurrency } from "@/utils/currencyUtils";

interface Delivery {
  id: string;
  customer: { name: string };
  orderTypeDisplay: string;
  dueDate: string;
  totalAmount: number;
  daysLeft: number;
}

export function UpcomingDeliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { tenantDb, isTenantConfigured } = useTenant();

  useEffect(() => {
    if (!tenantDb || !isTenantConfigured) {
      setIsLoading(false);
      return;
    }

    const fetchDeliveries = async () => {
      setIsLoading(true);
      try {
        // Fetch orders that are not yet delivered, sorted by due date
        const deliveriesQuery = query(
          collection(tenantDb, "orders"),
          where("status", "in", ["pending", "stitching", "ready"]),
          orderBy("dueDate", "asc"),
          limit(5),
        );
        const snapshot = await getDocs(deliveriesQuery);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const deliveryList: Delivery[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          const dueDate = new Date(data.dueDate);
          const diffTime = dueDate.getTime() - today.getTime();
          const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

          return {
            id: doc.id,
            customer: data.customer || { name: "Unknown" },
            orderTypeDisplay: data.orderTypeDisplay || "N/A",
            dueDate: data.dueDate,
            totalAmount: data.totalAmount || 0,
            daysLeft,
          };
        });

        setDeliveries(deliveryList);
      } catch (error) {
        console.error("Error fetching upcoming deliveries:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeliveries();
  }, [tenantDb, isTenantConfigured]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-PK", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upcoming Deliveries</CardTitle>
        <Link to="/delivery">
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
        ) : deliveries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No upcoming deliveries.</p>
            <p className="text-sm mt-1">Active orders will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deliveries.map((delivery) => (
              <div key={delivery.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-1">
                  <p className="font-medium leading-none">{delivery.customer?.name || "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">
                    {delivery.orderTypeDisplay} • <span className="font-medium">{formatCurrency(delivery.totalAmount)}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-sm">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(delivery.dueDate)}</span>
                  </div>
                  <Badge
                    className={cn(
                      "rounded-full px-3",
                      delivery.daysLeft <= 1
                        ? "bg-red-100 text-red-800 hover:bg-red-100"
                        : delivery.daysLeft <= 3
                          ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                          : "bg-green-100 text-green-800 hover:bg-green-100",
                    )}
                  >
                    {delivery.daysLeft === 0 ? "Today" : delivery.daysLeft === 1 ? "Tomorrow" : `${delivery.daysLeft} Days`}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
