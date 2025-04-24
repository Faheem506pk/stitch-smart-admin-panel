
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Database, FileText, User, Cloud, Image } from "lucide-react";
import { useState, useEffect } from "react";
import { cloudinaryService } from "@/services/cloudinaryService";
import { initializeFirebase, getFirebaseConfig, storeFirebaseConfig } from "@/services/firebase";

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

  // Cloudinary configuration state
  const [cloudinaryConfig, setCloudinaryConfig] = useState({
    cloudName: cloudinaryService.getConfig().cloudName || "",
    apiKey: cloudinaryService.getConfig().apiKey || "",
    uploadPreset: "stitchsmart"
  });

  useEffect(() => {
    // Load stored configurations on component mount
    const storedFirebaseConfig = getFirebaseConfig();
    if (storedFirebaseConfig) {
      setFirebaseConfig(storedFirebaseConfig);
    }
    
    const storedCloudinaryConfig = localStorage.getItem('cloudinary_config');
    if (storedCloudinaryConfig) {
      setCloudinaryConfig(JSON.parse(storedCloudinaryConfig));
    }
  }, []);

  const handleFirebaseConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFirebaseConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleCloudinaryConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCloudinaryConfig(prev => ({ ...prev, [name]: value }));
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
    // Save to localStorage and reinitialize Firebase
    storeFirebaseConfig(firebaseConfig);
    initializeFirebase(firebaseConfig);
    
    alert("Firebase configuration saved and reinitialized!");
    setIsEditMode(false);
  };

  const saveCloudinaryConfig = () => {
    // Save to localStorage
    localStorage.setItem('cloudinary_config', JSON.stringify(cloudinaryConfig));
    
    // Update the CloudinaryService configuration
    cloudinaryService.updateConfig({
      cloudName: cloudinaryConfig.cloudName,
      apiKey: cloudinaryConfig.apiKey,
      uploadPreset: cloudinaryConfig.uploadPreset
    });
    
    alert("Cloudinary configuration saved!");
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
                  <Input id="address" placeholder="123 Fashion Street, Karachi" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+92 300 1234567" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="contact@stitchsmart.com" />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="darkMode" />
                  <Label htmlFor="darkMode">Dark Mode Default</Label>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency Symbol</Label>
                  <Input id="currency" placeholder="Rs." defaultValue="Rs." />
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
                        defaultChecked={true}
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
          
          <TabsContent value="cloudinary" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Cloudinary Configuration</CardTitle>
                  <CardDescription>
                    Connect your application to Cloudinary for image storage.
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
                      <Label htmlFor="cloudName">Cloud Name</Label>
                      <Input 
                        id="cloudName" 
                        name="cloudName"
                        value={cloudinaryConfig.cloudName}
                        onChange={handleCloudinaryConfigChange}
                        placeholder="Your Cloudinary Cloud Name"
                        readOnly={!isEditMode}
                        className={!isEditMode ? "bg-muted" : ""}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input 
                        id="apiKey" 
                        name="apiKey"
                        value={cloudinaryConfig.apiKey}
                        onChange={handleCloudinaryConfigChange}
                        placeholder="Your Cloudinary API Key"
                        readOnly={!isEditMode}
                        className={!isEditMode ? "bg-muted" : ""}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="uploadPreset">Upload Preset</Label>
                      <Input 
                        id="uploadPreset" 
                        name="uploadPreset"
                        value={cloudinaryConfig.uploadPreset}
                        onChange={handleCloudinaryConfigChange}
                        placeholder="stitchsmart"
                        readOnly={!isEditMode}
                        className={!isEditMode ? "bg-muted" : ""}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="enableCloudinary"
                        disabled={!isEditMode} 
                        defaultChecked={true}
                      />
                      <Label htmlFor="enableCloudinary">Enable Cloudinary Integration</Label>
                    </div>
                    
                    {isEditMode && (
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsEditMode(false)}>
                          Cancel
                        </Button>
                        <Button onClick={saveCloudinaryConfig}>
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
