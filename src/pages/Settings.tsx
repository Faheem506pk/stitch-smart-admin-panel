import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Database, FileText, User, Cloud, Image, Scissors, Trash } from "lucide-react";
import { useState, useEffect } from "react";
import { cloudinaryService } from "@/services/cloudinaryService";
import { initializeFirebase, getFirebaseConfig, storeFirebaseConfig, firestoreService } from "@/services/firebase";
import { toast } from "sonner";
import { CustomMeasurementField, CustomMeasurementType } from "@/types/measurementTypes";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FirebaseConfig } from "@/services/firebase";

const defaultFirebaseConfig: FirebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

const defaultCloudinaryConfig = {
  cloudName: "",
  apiKey: "",
  uploadPreset: ""
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [pinInput, setPinInput] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState('Rs.');
  const [measurementTypes, setMeasurementTypes] = useState<CustomMeasurementType[]>([]);
  const [isAddTypeDialogOpen, setIsAddTypeDialogOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [isAddFieldDialogOpen, setIsAddFieldDialogOpen] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<'number' | 'text'>('number');
  const [newFieldRequired, setNewFieldRequired] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [firebaseConfig, setFirebaseConfig] = useState<FirebaseConfig>(defaultFirebaseConfig);
  const [cloudinaryConfig, setCloudinaryConfig] = useState(defaultCloudinaryConfig);

  useEffect(() => {
    const storedFirebaseConfig = getFirebaseConfig();
    if (storedFirebaseConfig) {
      setFirebaseConfig(storedFirebaseConfig);
    }
    
    const storedCloudinaryConfig = localStorage.getItem('cloudinary_config');
    if (storedCloudinaryConfig) {
      setCloudinaryConfig(JSON.parse(storedCloudinaryConfig));
    }
    
    const storedCurrency = localStorage.getItem('currency_symbol');
    if (storedCurrency) {
      setCurrencySymbol(storedCurrency);
    }
    
    fetchMeasurementTypes();
  }, []);

  const fetchMeasurementTypes = async () => {
    setIsLoading(true);
    try {
      if (firestoreService.isFirebaseInitialized()) {
        const types = await firestoreService.getDocuments('measurementTypes');
        setMeasurementTypes(types as CustomMeasurementType[]);
      } else {
        const typesJson = localStorage.getItem('measurement_types');
        if (typesJson) {
          setMeasurementTypes(JSON.parse(typesJson));
        }
      }
    } catch (error) {
      console.error('Error loading measurement types:', error);
      toast.error('Failed to load measurement types');
    } finally {
      setIsLoading(false);
    }
  };

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
    storeFirebaseConfig(firebaseConfig);
    initializeFirebase(firebaseConfig);
    
    alert("Firebase configuration saved and reinitialized!");
    setIsEditMode(false);
  };

  const saveCloudinaryConfig = () => {
    localStorage.setItem('cloudinary_config', JSON.stringify(cloudinaryConfig));
    
    cloudinaryService.updateConfig({
      cloudName: cloudinaryConfig.cloudName,
      apiKey: cloudinaryConfig.apiKey,
      uploadPreset: cloudinaryConfig.uploadPreset
    });
    
    alert("Cloudinary configuration saved!");
    setIsEditMode(false);
  };

  const saveCurrencySymbol = () => {
    localStorage.setItem('currency_symbol', currencySymbol);
    toast.success('Currency symbol updated successfully!');
  };

  
  const addMeasurementType = async () => {
    if (!newTypeName.trim()) {
      toast.error('Please enter a type name');
      return;
    }

    try {
      if (firestoreService.isFirebaseInitialized()) {
        // Create a new measurement type without specifying an ID first
        // Let Firestore generate the document ID
        const newType = {
          name: newTypeName,
          fields: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Add the document to Firestore and get the generated ID
        const docRef = await firestoreService.addDocument('measurementTypes', newType);
        
        // Log success with the new document ID
        console.log(`Added new measurement type with ID: ${docRef.id}`);
      } else {
        // For local storage, we still need to generate a client-side ID
        const newType: CustomMeasurementType = {
          id: crypto.randomUUID(),
          name: newTypeName,
          fields: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const updatedTypes = [...measurementTypes, newType];
        localStorage.setItem('measurement_types', JSON.stringify(updatedTypes));
        setMeasurementTypes(updatedTypes);
      }
      
      setNewTypeName('');
      setIsAddTypeDialogOpen(false);
      toast.success('Measurement type added successfully!');
      fetchMeasurementTypes(); // Refresh the list
    } catch (error) {
      console.error('Error adding measurement type:', error);
      toast.error('Failed to add measurement type');
    }
  };

  const addFieldToType = async () => {
    if (!selectedTypeId) return;
    if (!newFieldName.trim()) {
      toast.error('Please enter a field name');
      return;
    }
  
    const selectedType = measurementTypes.find(type => type.id === selectedTypeId);
    if (!selectedType) return;
  
    const newField: CustomMeasurementField = {
      id: crypto.randomUUID(), // ID for the field is OK to generate client-side
      label: newFieldName,
      type: newFieldType,
      required: newFieldRequired
    };
  
    const updatedType = {
      ...selectedType,
      fields: [...selectedType.fields, newField],
      updatedAt: new Date().toISOString()
    };
  
    try {
      if (firestoreService.isFirebaseInitialized()) {
        // Simply update the document using its existing ID
        await firestoreService.updateDocument('measurementTypes', selectedTypeId, updatedType);
        console.log(`Updated measurement type ${selectedType.name} with new field ${newFieldName}`);
      } else {
        const updatedTypes = measurementTypes.map(type => 
          type.id === selectedTypeId ? updatedType : type
        );
        localStorage.setItem('measurement_types', JSON.stringify(updatedTypes));
        setMeasurementTypes(updatedTypes);
      }
      
      setNewFieldName('');
      setNewFieldType('number');
      setNewFieldRequired(true);
      setIsAddFieldDialogOpen(false);
      toast.success('Field added successfully!');
      fetchMeasurementTypes();
    } catch (error) {
      console.error('Error adding field:', error);
      toast.error('Failed to add field');
    }
  };

  const deleteField = async (typeId: string, fieldId: string) => {
    const selectedType = measurementTypes.find(type => type.id === typeId);
    if (!selectedType) return;

    const updatedFields = selectedType.fields.filter(field => field.id !== fieldId);
    const updatedType = {
      ...selectedType,
      fields: updatedFields,
      updatedAt: new Date().toISOString()
    };

    try {
      if (firestoreService.isFirebaseInitialized()) {
        await firestoreService.updateDocument('measurementTypes', typeId, updatedType);
      } else {
        const updatedTypes = measurementTypes.map(type => 
          type.id === typeId ? updatedType : type
        );
        localStorage.setItem('measurement_types', JSON.stringify(updatedTypes));
        setMeasurementTypes(updatedTypes);
      }
      
      toast.success('Field deleted successfully!');
      fetchMeasurementTypes();
    } catch (error) {
      console.error('Error deleting field:', error);
      toast.error('Failed to delete field');
    }
  };

  const deleteMeasurementType = async (typeId: string) => {
    try {
      if (firestoreService.isFirebaseInitialized()) {
        await firestoreService.deleteDocument('measurementTypes', typeId);
      } else {
        const updatedTypes = measurementTypes.filter(type => type.id !== typeId);
        localStorage.setItem('measurement_types', JSON.stringify(updatedTypes));
        setMeasurementTypes(updatedTypes);
      }
      
      toast.success('Measurement type deleted successfully!');
      fetchMeasurementTypes();
    } catch (error) {
      console.error('Error deleting measurement type:', error);
      toast.error('Failed to delete measurement type');
    }
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
                  <div className="flex items-center space-x-2">
                    <Input 
                      id="currency" 
                      placeholder="Rs." 
                      value={currencySymbol}
                      onChange={(e) => setCurrencySymbol(e.target.value)}
                    />
                    <Button onClick={saveCurrencySymbol}>Save</Button>
                  </div>
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
          
          <TabsContent value="measurements" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Custom Measurement Types</CardTitle>
                  <CardDescription>
                    Create and manage custom measurement types and fields.
                  </CardDescription>
                </div>
                <Button onClick={() => setIsAddTypeDialogOpen(true)}>Add Type</Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : measurementTypes.length === 0 ? (
                  <div className="text-center p-8 border rounded-md">
                    <Scissors className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                    <p className="text-muted-foreground">No custom measurement types yet.</p>
                    <p className="text-muted-foreground text-sm mt-1">
                      Add a new type to start customizing your measurements.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {measurementTypes.map(type => (
                      <div key={type.id} className="border rounded-md p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-medium text-lg">{type.name}</h3>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTypeId(type.id);
                                setIsAddFieldDialogOpen(true);
                              }}
                            >
                              Add Field
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteMeasurementType(type.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {type.fields.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No fields added yet.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {type.fields.map(field => (
                              <div 
                                key={field.id}
                                className="flex items-center justify-between border rounded-md p-2"
                              >
                                <div>
                                  <p className="font-medium">{field.label}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Type: {field.type} • {field.required ? 'Required' : 'Optional'}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => deleteField(type.id, field.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
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

      <Dialog open={isAddTypeDialogOpen} onOpenChange={setIsAddTypeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Measurement Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="typeName">Type Name</Label>
              <Input
                id="typeName"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                placeholder="e.g., Shirt, Kurta, Waistcoat"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTypeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addMeasurementType}>Add Type</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddFieldDialogOpen} onOpenChange={setIsAddFieldDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Measurement Field</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fieldName">Field Name</Label>
              <Input
                id="fieldName"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                placeholder="e.g., Chest, Waist, Length"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fieldType">Field Type</Label>
              <Select 
                value={newFieldType} 
                onValueChange={(value) => setNewFieldType(value as 'number' | 'text')}
              >
                <SelectTrigger id="fieldType">
                  <SelectValue placeholder="Select field type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="required"
                checked={newFieldRequired}
                onCheckedChange={setNewFieldRequired}
              />
              <Label htmlFor="required">Required Field</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddFieldDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addFieldToType}>Add Field</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Settings;
