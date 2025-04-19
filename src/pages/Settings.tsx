
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Database, FileText, User } from "lucide-react";
import { useState } from "react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  // Firebase configuration state
  const [firebaseConfig, setFirebaseConfig] = useState({
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  });

  const handleFirebaseConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFirebaseConfig(prev => ({ ...prev, [name]: value }));
  };

  const saveFirebaseConfig = () => {
    console.log("Saving Firebase configuration:", firebaseConfig);
    // In a real implementation, this would store the configuration securely
    alert("Firebase configuration saved!");
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
          <TabsList className="mb-4">
            <TabsTrigger value="general">
              <SettingsIcon className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="firebase">
              <Database className="h-4 w-4 mr-2" />
              Firebase
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
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure general settings for your application.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shopName">Shop Name</Label>
                  <Input id="shopName" placeholder="StitchSmart Tailors" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Shop Address</Label>
                  <Input id="address" placeholder="123 Fashion Street" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+1 234 567 8900" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="contact@stitchsmart.com" />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="darkMode" />
                  <Label htmlFor="darkMode">Dark Mode Default</Label>
                </div>
                
                <Button>Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="firebase" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Firebase Configuration</CardTitle>
                <CardDescription>
                  Connect your application to Firebase services. Enter your Firebase project credentials below.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input 
                    id="apiKey" 
                    name="apiKey"
                    value={firebaseConfig.apiKey}
                    onChange={handleFirebaseConfigChange}
                    placeholder="Your Firebase API Key" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="authDomain">Auth Domain</Label>
                  <Input 
                    id="authDomain" 
                    name="authDomain"
                    value={firebaseConfig.authDomain}
                    onChange={handleFirebaseConfigChange}
                    placeholder="your-project.firebaseapp.com" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="projectId">Project ID</Label>
                  <Input 
                    id="projectId" 
                    name="projectId"
                    value={firebaseConfig.projectId}
                    onChange={handleFirebaseConfigChange}
                    placeholder="your-project-id" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="storageBucket">Storage Bucket</Label>
                  <Input 
                    id="storageBucket" 
                    name="storageBucket"
                    value={firebaseConfig.storageBucket}
                    onChange={handleFirebaseConfigChange}
                    placeholder="your-project.appspot.com" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="messagingSenderId">Messaging Sender ID</Label>
                  <Input 
                    id="messagingSenderId" 
                    name="messagingSenderId"
                    value={firebaseConfig.messagingSenderId}
                    onChange={handleFirebaseConfigChange}
                    placeholder="1234567890" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="appId">App ID</Label>
                  <Input 
                    id="appId" 
                    name="appId"
                    value={firebaseConfig.appId}
                    onChange={handleFirebaseConfigChange}
                    placeholder="1:1234567890:web:abcdef1234567890" 
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="enableFirebase" />
                  <Label htmlFor="enableFirebase">Enable Firebase Integration</Label>
                </div>
                
                <Button onClick={saveFirebaseConfig}>Save Firebase Configuration</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="business" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Business Settings</CardTitle>
                <CardDescription>
                  Configure business-specific settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Business settings will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user accounts and permissions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">User management will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
