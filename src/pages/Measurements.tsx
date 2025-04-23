
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, User, FileText } from "lucide-react";
import { useState } from "react";

const Measurements = () => {
  const [measurementType, setMeasurementType] = useState("shirt");
  const [customerSearch, setCustomerSearch] = useState("");

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Measurements</h1>
            <p className="text-muted-foreground mt-1">
              Record and manage customer measurements.
            </p>
          </div>
          <Button>
            <Plus className="mr-2" />
            Add Measurement
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Customer Selection */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search customers..."
                    className="pl-8"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                  />
                </div>
                
                <div className="border rounded-md h-[300px] overflow-y-auto">
                  <div className="p-2 hover:bg-accent cursor-pointer">
                    <p className="font-medium">Ahmed Khan</p>
                    <p className="text-sm text-muted-foreground">Ahmed@example.com</p>
                  </div>
                  <div className="p-2 hover:bg-accent cursor-pointer">
                    <p className="font-medium">Bilal Ahmed</p>
                    <p className="text-sm text-muted-foreground">Ahmed@example.com</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Measurement Form */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Measurement Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="shirt" onValueChange={setMeasurementType}>
                <TabsList className="mb-4">
                  <TabsTrigger value="shirt">Shirt</TabsTrigger>
                  <TabsTrigger value="pant">Pant</TabsTrigger>
                  <TabsTrigger value="suit">Suit</TabsTrigger>
                  <TabsTrigger value="dress">Dress</TabsTrigger>
                </TabsList>
                
                <TabsContent value="shirt" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Neck</label>
                      <Input type="number" placeholder="Inches" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Chest</label>
                      <Input type="number" placeholder="Inches" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Shoulder</label>
                      <Input type="number" placeholder="Inches" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sleeve Length</label>
                      <Input type="number" placeholder="Inches" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Bicep</label>
                      <Input type="number" placeholder="Inches" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cuff</label>
                      <Input type="number" placeholder="Inches" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Shirt Length</label>
                      <Input type="number" placeholder="Inches" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notes</label>
                    <textarea className="w-full min-h-[100px] p-2 border rounded-md" placeholder="Additional notes..."></textarea>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">Reset</Button>
                    <Button>Save Measurements</Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="pant" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Waist</label>
                      <Input type="number" placeholder="Inches" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Hip</label>
                      <Input type="number" placeholder="Inches" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Inseam</label>
                      <Input type="number" placeholder="Inches" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Outseam</label>
                      <Input type="number" placeholder="Inches" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Thigh</label>
                      <Input type="number" placeholder="Inches" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Knee</label>
                      <Input type="number" placeholder="Inches" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Bottom</label>
                      <Input type="number" placeholder="Inches" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notes</label>
                    <textarea className="w-full min-h-[100px] p-2 border rounded-md" placeholder="Additional notes..."></textarea>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">Reset</Button>
                    <Button>Save Measurements</Button>
                  </div>
                </TabsContent>
                
                {/* Similar structure for suit and dress tabs */}
                <TabsContent value="suit" className="space-y-4">
                  <p className="text-muted-foreground">Suit measurements form will appear here.</p>
                </TabsContent>
                
                <TabsContent value="dress" className="space-y-4">
                  <p className="text-muted-foreground">Dress measurements form will appear here.</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Measurements;
