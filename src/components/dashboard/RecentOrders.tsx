
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom"; 
import { formatCurrency } from "@/utils/currencyUtils";

// Sample data for recent orders
const recentOrders = [
  {
    id: "ORD-1234",
    customer: "Ahmed Khan",
    item: "Custom Suit",
    status: "pending",
    date: "2023-04-15",
    price: "250",
  },
  {
    id: "ORD-1235",
    customer: "Ayesha Malik",
    item: "Wedding Dress",
    status: "stitching",
    date: "2023-04-14",
    price: "350",
  },
  {
    id: "ORD-1236",
    customer: "Bilal Ahmed",
    item: "Formal Shirt",
    status: "ready",
    date: "2023-04-13",
    price: "80",
  },
  {
    id: "ORD-1237",
    customer: "Fatima Zahra",
    item: "Evening Gown",
    status: "delivered",
    date: "2023-04-12",
    price: "200",
  },
  {
    id: "ORD-1238",
    customer: "Usman Tariq",
    item: "Dress Pants",
    status: "pending",
    date: "2023-04-11",
    price: "95",
  },
];


const StatusBadgeMap = {
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
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Orders</CardTitle>
        <Link to="/delivery">
        <Button variant="outline" size="sm" >
          View All
        </Button>
        </Link>
      </CardHeader>
      <CardContent>
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
            {recentOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.item}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      StatusBadgeMap[order.status as keyof typeof StatusBadgeMap].className
                    )}
                  >
                    {StatusBadgeMap[order.status as keyof typeof StatusBadgeMap].label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(order.price)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
