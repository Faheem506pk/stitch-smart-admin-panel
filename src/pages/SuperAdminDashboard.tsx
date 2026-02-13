import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useTenant } from "@/context/TenantContext";
import { db } from "@/services/firebase"; // Master DB
import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, ShieldAlert } from "lucide-react";
import { User } from "@/types/models";
import { useNavigate } from "react-router-dom";

export default function SuperAdminDashboard() {
  const { isSuperAdmin, userProfile } = useTenant();
  const [clients, setClients] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSuperAdmin) {
      navigate("/");
      return;
    }
    fetchClients();
  }, [isSuperAdmin, navigate]);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      // Query users from Master DB
      // TODO: Filter for users who are 'admin' (clients) not employees or super_admin if possible
      // For now, fetch all and filter client-side or assume 'admin' role means Client
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("role", "==", "admin"));
      const querySnapshot = await getDocs(q);

      const clientList: User[] = [];
      querySnapshot.forEach((doc) => {
        clientList.push({ id: doc.id, ...doc.data() } as User);
      });
      setClients(clientList);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Failed to load clients");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleClientStatus = async (clientId: string, currentStatus: string | undefined) => {
    const newStatus = currentStatus === "banned" ? "active" : "banned";
    try {
      const clientRef = doc(db, "users", clientId);
      await updateDoc(clientRef, { status: newStatus });

      // Update local state
      setClients(clients.map((c) => (c.id === clientId ? { ...c, status: newStatus as any } : c)));

      toast.success(`Client ${newStatus === "active" ? "activated" : "banned"} successfully`);
    } catch (error) {
      console.error("Error updating client status:", error);
      toast.error("Failed to update status");
    }
  };

  if (!isSuperAdmin) return null;

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage client accounts and access.</p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <ShieldAlert className="h-4 w-4" /> Super Admin Area
          </Badge>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tenant Configured</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No clients found.
                    </TableCell>
                  </TableRow>
                ) : (
                  clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{client.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={client.status === "banned" ? "destructive" : "default"}
                          className={client.status === "active" ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                          {client.status || "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {client.tenantConfig ? (
                          <Badge variant="outline" className="border-green-500 text-green-600">
                            Configured
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant={client.status === "banned" ? "default" : "destructive"}
                          size="sm"
                          onClick={() => toggleClientStatus(client.id, client.status)}
                        >
                          {client.status === "banned" ? "Unban" : "Ban Access"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Layout>
  );
}
