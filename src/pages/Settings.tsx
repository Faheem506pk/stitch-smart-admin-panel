
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Database, FileText, User, Cloud } from "lucide-react";
import { useState, useEffect } from "react";
import { googleDriveService } from "@/services/googleDriveService";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [pinInput, setPinInput] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPin, setShowPin] = useState(false);
  
  // Firebase configuration state
  const [firebaseConfig, setFirebaseConfig] = useState({
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  });

  // Google Drive configuration state
  const [googleDriveConfig, setGoogleDriveConfig] = useState({
    clientId: googleDriveService.getConfig().clientId || "",
    apiKey: ""
  });

  useEffect(() => {
    // Load stored configurations on component mount
    const storedFirebaseConfig = localStorage.getItem('firebase_config');
    if (storedFirebaseConfig) {
      setFirebaseConfig(JSON.parse(storedFirebaseConfig));
    }
    
    const storedGDriveConfig = localStorage.getItem('gdrive_config');
    if (storedGDriveConfig) {
      setGoogleDriveConfig(JSON.parse(storedGDriveConfig));
    }
  }, []);

  const handleFirebaseConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFirebaseConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleGoogleDriveConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGoogleDriveConfig(prev => ({ ...prev, [name]: value }));
  };

  const checkPin = () => {
    const correctPin = "121450";
    if (pinInput === correctPin) {
      setIsEditMode(true);
      setShowPin(false);
      setPinInput("");
    } else {
      alert("Incorrect PIN. Please try again.");
    }
  };

  const saveFirebaseConfig = () => {
    // Save to localStorage
    localStorage.setItem('firebase_config', JSON.stringify(firebaseConfig));
    
    // In a real implementation, this would also update Firebase configuration
    alert("Firebase configuration saved!");
    setIsEditMode(false);
  };

  const saveGoogleDriveConfig = () => {
    // Save to localStorage
    localStorage.setItem('gdrive_config', JSON.stringify(googleDriveConfig));
    
    // Update the GoogleDriveService configuration
    googleDriveService.updateConfig({
      clientId: googleDriveConfig.clientId,
      apiKey: googleDriveConfig.apiKey || undefined
    });
    
    alert("Google Drive configuration saved!");
    setIsEditMode(false);
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
            <TabsTrigger value="googleDrive">
              <Cloud className="h-4 w-4 mr-2" />
              Google Drive
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
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Firebase Configuration</CardTitle>
                  <CardDescription>
                    Connect your application to Firebase services. Enter your Firebase project credentials below.
                  </CardDescription>
                </div>
                {!isEditMode && (
                  <Button variant="outline" onClick={() => setShowPin(true)}>
                    {showPin ? "Cancel" : "Edit"}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {showPin ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="pin">Enter PIN to Edit</Label>
                      <div className="flex space-x-2">
                        <Input 
                          id="pin"
                          type="password" 
                          value={pinInput}
                          onChange={(e) => setPinInput(e.target.value)}
                          placeholder="Enter security PIN"
                        />
                        <Button onClick={checkPin}>Submit</Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input 
                        id="apiKey" 
                        name="apiKey"
                        value={firebaseConfig.apiKey}
                        onChange={handleFirebaseConfigChange}
                        placeholder="Your Firebase API Key"
                        readOnly={!isEditMode}
                        className={!isEditMode ? "bg-muted" : ""}
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
                        readOnly={!isEditMode}
                        className={!isEditMode ? "bg-muted" : ""}
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
                        readOnly={!isEditMode}
                        className={!isEditMode ? "bg-muted" : ""}
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
                        readOnly={!isEditMode}
                        className={!isEditMode ? "bg-muted" : ""}
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
                        readOnly={!isEditMode}
                        className={!isEditMode ? "bg-muted" : ""}
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
                        readOnly={!isEditMode}
                        className={!isEditMode ? "bg-muted" : ""}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="enableFirebase"
                        disabled={!isEditMode} 
                      />
                      <Label htmlFor="enableFirebase">Enable Firebase Integration</Label>
                    </div>
                    
                    {isEditMode && (
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsEditMode(false)}>
                          Cancel
                        </Button>
                        <Button onClick={saveFirebaseConfig}>
                          Save Configuration
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="googleDrive" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Google Drive Configuration</CardTitle>
                  <CardDescription>
                    Connect your application to Google Drive for image storage.
                  </CardDescription>
                </div>
                {!isEditMode && (
                  <Button variant="outline" onClick={() => setShowPin(true)}>
                    {showPin ? "Cancel" : "Edit"}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {showPin ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="pin">Enter PIN to Edit</Label>
                      <div className="flex space-x-2">
                        <Input 
                          id="pin"
                          type="password" 
                          value={pinInput}
                          onChange={(e) => setPinInput(e.target.value)}
                          placeholder="Enter security PIN"
                        />
                        <Button onClick={checkPin}>Submit</Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="clientId">Client ID</Label>
                      <Input 
                        id="clientId" 
                        name="clientId"
                        value={googleDriveConfig.clientId}
                        onChange={handleGoogleDriveConfigChange}
                        placeholder="Your Google Drive Client ID"
                        readOnly={!isEditMode}
                        className={!isEditMode ? "bg-muted" : ""}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">API Key (Optional)</Label>
                      <Input 
                        id="apiKey" 
                        name="apiKey"
                        value={googleDriveConfig.apiKey}
                        onChange={handleGoogleDriveConfigChange}
                        placeholder="Your Google API Key"
                        readOnly={!isEditMode}
                        className={!isEditMode ? "bg-muted" : ""}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="enableGoogleDrive"
                        disabled={!isEditMode} 
                        defaultChecked={true}
                      />
                      <Label htmlFor="enableGoogleDrive">Enable Google Drive Integration</Label>
                    </div>
                    
                    {isEditMode && (
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsEditMode(false)}>
                          Cancel
                        </Button>
                        <Button onClick={saveGoogleDriveConfig}>
                          Save Configuration
                        </Button>
                      </div>
                    )}
                  </>
                )}
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
