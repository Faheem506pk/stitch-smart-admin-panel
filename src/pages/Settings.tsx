
import { Layout } from "@/components/layout/Layout";

const Settings = () => {
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your tailor shop settings.
          </p>
        </div>
        
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-8 flex items-center justify-center">
          <p className="text-muted-foreground">Settings interface will be implemented here.</p>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
