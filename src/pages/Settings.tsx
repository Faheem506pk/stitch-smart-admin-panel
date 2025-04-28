import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { SettingsIcon, Database, Image, Scissors, FileText, User } from 'lucide-react';
import { GeneralSettings } from '@/components/settings/GeneralSettings';
import { FirebaseSettings } from '@/components/settings/FirebaseSettings';
import { CloudinarySettings } from '@/components/settings/CloudinarySettings';
import { MeasurementSettings } from '@/components/settings/MeasurementSettings';
import { BusinessSettings } from '@/components/settings/BusinessSettings';
import { UserSettings } from '@/components/settings/UserSettings';
import { EmployeeCredentials } from '@/components/auth/EmployeeCredentials';
import { Employee } from '@/types/models';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);

  // Function to open employee credentials dialog
  const openEditCredentials = (employee: Employee) => {
    setCurrentEmployee(employee);
    setIsCredentialsDialogOpen(true);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your tailor shop settings.
          </p>
        </div>
        
        <Tabs defaultValue="general" onValueChange={setActiveTab}>
          <TabsList className="mb-4 flex flex-wrap">
            <TabsTrigger value="general">
              <SettingsIcon className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="firebase">
              <Database className="h-4 w-4 mr-2" />
              Firebase
            </TabsTrigger>
            <TabsTrigger value="cloudinary">
              <Image className="h-4 w-4 mr-2" />
              Cloudinary
            </TabsTrigger>
            <TabsTrigger value="measurements">
              <Scissors className="h-4 w-4 mr-2" />
              Measurements
            </TabsTrigger>
            <TabsTrigger value="business">
              <FileText className="h-4 w-4 mr-2" />
              Business
            </TabsTrigger>
            <TabsTrigger value="users">
              <User className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <GeneralSettings />
          </TabsContent>
          
          <TabsContent value="firebase" className="space-y-4">
            <FirebaseSettings />
          </TabsContent>
          
          <TabsContent value="cloudinary" className="space-y-4">
            <CloudinarySettings />
          </TabsContent>
          
          <TabsContent value="measurements" className="space-y-4">
            <MeasurementSettings />
          </TabsContent>

          <TabsContent value="business" className="space-y-4">
            <BusinessSettings />
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <UserSettings onEditCredentials={openEditCredentials} />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Employee Credentials Dialog */}
      <EmployeeCredentials
        isOpen={isCredentialsDialogOpen}
        onClose={() => setIsCredentialsDialogOpen(false)}
        employee={currentEmployee}
        mode="update"
      />
    </Layout>
  );
}
