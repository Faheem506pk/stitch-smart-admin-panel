
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileText, Truck, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const Delivery = () => {
  const [deliveryTab, setDeliveryTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Delivery Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage order deliveries.
          </p>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Deliveries</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search orders..." 
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" onValueChange={setDeliveryTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="pending">Pending Delivery</TabsTrigger>
                <TabsTrigger value="enroute">In Transit</TabsTrigger>
                <TabsTrigger value="delivered">Delivered</TabsTrigger>
                <TabsTrigger value="all">All Orders</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pending" className="space-y-4">
                <div className="rounded-md border">
                  <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-5 gap-4 border-b hover:bg-muted/40 transition-colors">
                    <div>
                      <p className="text-sm font-medium">Order #1234</p>
                      <p className="text-xs text-muted-foreground">Due in 2 days</p>
                    </div>
                    <div>
                      <p className="text-sm">John Doe</p>
                      <p className="text-xs text-muted-foreground">212-555-1234</p>
                    </div>
                    <div>
                      <p className="text-sm">2x Shirts, 1x Pants</p>
                      <Badge variant="outline" className="mt-1">Ready for delivery</Badge>
                    </div>
                    <div>
                      <p className="text-sm">Due Date:</p>
                      <p className="text-xs text-muted-foreground">April 22, 2025</p>
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                      <Button size="sm">
                        <Truck className="h-4 w-4 mr-1" />
                        Mark Delivered
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-5 gap-4 hover:bg-muted/40 transition-colors">
                    <div>
                      <p className="text-sm font-medium">Order #1235</p>
                      <p className="text-xs text-muted-foreground">Due in 5 days</p>
                    </div>
                    <div>
                      <p className="text-sm">Jane Smith</p>
                      <p className="text-xs text-muted-foreground">212-555-5678</p>
                    </div>
                    <div>
                      <p className="text-sm">1x Dress</p>
                      <Badge variant="outline" className="mt-1">Ready for delivery</Badge>
                    </div>
                    <div>
                      <p className="text-sm">Due Date:</p>
                      <p className="text-xs text-muted-foreground">April 25, 2025</p>
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                      <Button size="sm">
                        <Truck className="h-4 w-4 mr-1" />
                        Mark Delivered
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="enroute" className="space-y-4">
                <p className="text-muted-foreground">No orders currently in transit.</p>
              </TabsContent>
              
              <TabsContent value="delivered" className="space-y-4">
                <p className="text-muted-foreground">No orders have been delivered yet.</p>
              </TabsContent>
              
              <TabsContent value="all" className="space-y-4">
                <p className="text-muted-foreground">All orders will be displayed here.</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Delivery Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-8 flex items-center justify-center border rounded-md">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <p className="text-muted-foreground">Delivery calendar will be implemented here.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Delivery;
