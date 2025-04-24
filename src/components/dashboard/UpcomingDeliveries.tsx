
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

// Sample data for upcoming deliveries with Pakistani names
const deliveries = [
  {
    id: "DEL-1234",
    customer: "Ahmed Khan",
    item: "Custom Suit",
    date: "2023-04-20",
    daysLeft: 1,
  },
  {
    id: "DEL-1235",
    customer: "Ayesha Malik",
    item: "Wedding Dress",
    date: "2023-04-22",
    daysLeft: 3,
  },
  {
    id: "DEL-1236",
    customer: "Bilal Ahmed",
    item: "Formal Shirt",
    date: "2023-04-25",
    daysLeft: 6,
  },
];


export function UpcomingDeliveries() {
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
        <div className="space-y-4">
          {deliveries.map((delivery) => (
            <div
              key={delivery.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="space-y-1">
                <p className="font-medium leading-none">{delivery.customer}</p>
                <p className="text-sm text-muted-foreground">
                  {delivery.item} • <span className="font-medium">Rs. {Math.floor(Math.random() * 5000) + 2000}</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-sm">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span>{delivery.date}</span>
                </div>
                <Badge
                  className={cn(
                    "rounded-full px-3",
                    delivery.daysLeft <= 1
                      ? "bg-red-100 text-red-800 hover:bg-red-100"
                      : delivery.daysLeft <= 3
                      ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                      : "bg-green-100 text-green-800 hover:bg-green-100"
                  )}
                >
                  {delivery.daysLeft === 0
                    ? "Today"
                    : delivery.daysLeft === 1
                    ? "Tomorrow"
                    : `${delivery.daysLeft} Days`}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
