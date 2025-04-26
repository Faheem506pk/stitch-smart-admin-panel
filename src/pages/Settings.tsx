
import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomMeasurementType, CustomMeasurementField } from '@/types/measurementTypes';
import { firestoreService, FirebaseConfig, initializeFirebase } from '@/services/firebase';
import { toast } from "sonner";
import { SettingsIcon, Database, Image, Scissors, FileText, User, RotateCcw, Plus, Trash, PenLine, Key, Check, X, RefreshCw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Employee } from '@/types/models';
import { employeeService } from '@/services/employeeService';
import { EmployeeCredentials } from '@/components/auth/EmployeeCredentials';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [firebaseConfig, setFirebaseConfig] = useState<FirebaseConfig>({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  });
  const [cloudinaryConfig, setCloudinaryConfig] = useState({
    cloudName: '',
    apiKey: '',
    uploadPreset: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState(() => {
    return localStorage.getItem('currency_symbol') || 'Rs.';
  });
  const [measurementTypes, setMeasurementTypes] = useState<CustomMeasurementType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddTypeDialogOpen, setIsAddTypeDialogOpen] = useState(false);
  const [isAddFieldDialogOpen, setIsAddFieldDialogOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'number'>('number');
  const [newFieldRequired, setNewFieldRequired] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [isAddEmployeeDialogOpen, setIsAddEmployeeDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    position: '',
    role: 'employee' as 'admin' | 'employee',
  });

  // Fetch config data
  useEffect(() => {
    const storedConfig = localStorage.getItem('firebase_config');
    if (storedConfig) {
      setFirebaseConfig(JSON.parse(storedConfig));
    }
    
    const storedCloudinaryConfig = localStorage.getItem('cloudinary_config');
    if (storedCloudinaryConfig) {
      setCloudinaryConfig(JSON.parse(storedCloudinaryConfig));
    }
    
    fetchMeasurementTypes();
    fetchEmployees();
  }, []);
  
  // Check for correct PIN
  const checkPin = () => {
    const correctPin = '0000'; // This should be stored securely in a real app
    if (pinInput === correctPin) {
      setIsEditMode(true);
      setShowPin(false);
      setPinInput('');
    } else {
      toast.error('Incorrect PIN');
    }
  };
  
  // Save Firebase configuration
  const saveFirebaseConfig = () => {
    // Validate config
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      toast.error('API Key and Project ID are required');
      return;
    }
    
    try {
      localStorage.setItem('firebase_config', JSON.stringify(firebaseConfig));
      
      // Re-initialize Firebase with new config
      const result = initializeFirebase(firebaseConfig);
      if (result.initialized) {
        toast.success('Firebase configuration saved successfully');
        setIsEditMode(false);
      } else {
        toast.error('Failed to initialize Firebase with new config');
      }
    } catch (error) {
      console.error('Error saving Firebase config:', error);
      toast.error('Failed to save Firebase configuration');
    }
  };
  
  // Handle Firebase config changes
  const handleFirebaseConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFirebaseConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Save Cloudinary configuration
  const saveCloudinaryConfig = () => {
    // Validate config
    if (!cloudinaryConfig.cloudName || !cloudinaryConfig.uploadPreset) {
      toast.error('Cloud Name and Upload Preset are required');
      return;
    }
    
    try {
      localStorage.setItem('cloudinary_config', JSON.stringify(cloudinaryConfig));
      toast.success('Cloudinary configuration saved successfully');
      setIsEditMode(false);
    } catch (error) {
      console.error('Error saving Cloudinary config:', error);
      toast.error('Failed to save Cloudinary configuration');
    }
  };
  
  // Handle Cloudinary config changes
  const handleCloudinaryConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCloudinaryConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Save currency symbol
  const saveCurrencySymbol = () => {
    try {
      localStorage.setItem('currency_symbol', currencySymbol);
      toast.success('Currency symbol saved successfully');
    } catch (error) {
      console.error('Error saving currency symbol:', error);
      toast.error('Failed to save currency symbol');
    }
  };
  
  // Fetch measurement types
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
  
  // Add measurement type
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

  // Add field to type
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

  // Delete field
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

  // Delete measurement type
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
  
  // Fetch employees
  const fetchEmployees = async () => {
    setIsLoadingEmployees(true);
    try {
      const fetchedEmployees = await employeeService.getEmployees();
      setEmployees(fetchedEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setIsLoadingEmployees(false);
    }
  };
  
  // Add new employee
  const addNewEmployee = async () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.position) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      // Create the new employee
      const employeeData = {
        ...newEmployee,
        hireDate: new Date().toISOString(),
        permissions: getDefaultPermissions(newEmployee.role),
        passwordResetRequired: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const addedEmployee = await employeeService.addEmployee(employeeData);
      
      if (addedEmployee) {
        toast.success('Employee added successfully!');
        setNewEmployee({
          name: '',
          email: '',
          phoneNumber: '',
          position: '',
          role: 'employee',
        });
        setIsAddEmployeeDialogOpen(false);
        fetchEmployees();
        
        // Open credentials dialog for the new employee
        setCurrentEmployee(addedEmployee);
        setIsCredentialsDialogOpen(true);
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error('Failed to add employee');
    }
  };
  
  // Delete employee
  const deleteEmployee = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) {
      return;
    }
    
    try {
      const success = await employeeService.deleteEmployee(id);
      if (success) {
        toast.success('Employee deleted successfully!');
        fetchEmployees();
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
    }
  };
  
  // Reset employee password
  const resetEmployeePassword = async (employee: Employee) => {
    try {
      const success = await employeeService.requestPasswordReset(employee.id);
      if (success) {
        toast.success('Password reset requested successfully!');
        fetchEmployees();
      }
    } catch (error) {
      console.error('Error requesting password reset:', error);
      toast.error('Failed to request password reset');
    }
  };
  
  // Update employee permissions
  const updateEmployeeRole = async (id: string, role: 'admin' | 'employee') => {
    try {
      const success = await employeeService.updateEmployee(id, { 
        role,
        permissions: getDefaultPermissions(role),
        updatedAt: new Date().toISOString()
      });
      
      if (success) {
        toast.success('Employee role updated successfully!');
        fetchEmployees();
      }
    } catch (error) {
      console.error('Error updating employee role:', error);
      toast.error('Failed to update employee role');
    }
  };
  
  // Get default permissions based on role
  const getDefaultPermissions = (role: 'admin' | 'employee') => {
    if (role === 'admin') {
      return {
        customers: { view: true, add: true, edit: true, delete: true },
        orders: { view: true, add: true, edit: true, delete: true },
        measurements: { view: true, add: true, edit: true },
        payments: { view: true, add: true },
        employees: { view: true, add: true, edit: true, delete: true },
        settings: { view: true, edit: true },
      };
    } else {
      return {
        customers: { view: true, add: true, edit: true, delete: false },
        orders: { view: true, add: true, edit: true, delete: false },
        measurements: { view: true, add: true, edit: true },
        payments: { view: true, add: true },
        employees: { view: false, add: false, edit: false, delete: false },
        settings: { view: false, edit: false },
      };
    }
  };
  
  // Open edit credentials dialog
  const openEditCredentials = (employee: Employee) => {
    setCurrentEmployee(employee);
    setIsCredentialsDialogOpen(true);
  };
  
  // Handle new employee input change
  const handleEmployeeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({
      ...prev,
      [name]: value
    }));
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
                <Button onClick={() => setIsAddTypeDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Type
                </Button>
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
                              <Plus className="h-4 w-4 mr-1" />
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
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  Manage your business details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input id="businessName" placeholder="Your Business Name" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="businessLogo">Business Logo</Label>
                  <Input id="businessLogo" type="file" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input id="tagline" placeholder="Your business tagline" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="businessDescription">Business Description</Label>
                  <Textarea 
                    id="businessDescription" 
                    placeholder="Describe your business"
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Receipt Settings</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="showLogo" />
                      <Label htmlFor="showLogo">Show Logo on Receipt</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch id="showAddress" defaultChecked />
                      <Label htmlFor="showAddress">Show Address on Receipt</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch id="showContact" defaultChecked />
                      <Label htmlFor="showContact">Show Contact Info on Receipt</Label>
                    </div>
                  </div>
                </div>
                
                <Button>Save Business Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage user accounts and permissions
                  </CardDescription>
                </div>
                <Button onClick={() => setIsAddEmployeeDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingEmployees ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            <div className="flex justify-center items-center">
                              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : employees.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            <p className="text-muted-foreground">No employees found</p>
                            <p className="text-muted-foreground text-sm">
                              Add your first employee to get started
                            </p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        employees.map((employee) => (
                          <TableRow key={employee.id}>
                            <TableCell className="font-medium">{employee.name}</TableCell>
                            <TableCell>{employee.email}</TableCell>
                            <TableCell>{employee.position}</TableCell>
                            <TableCell>
                              <Select
                                value={employee.role}
                                onValueChange={(value) => updateEmployeeRole(employee.id, value as 'admin' | 'employee')}
                              >
                                <SelectTrigger className="w-[120px]">
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="employee">Employee</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-right space-x-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => resetEmployeePassword(employee)}
                                className="h-8"
                              >
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Reset
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditCredentials(employee)}
                                className="h-8"
                              >
                                <PenLine className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteEmployee(employee.id)}
                                className="h-8 text-destructive hover:text-destructive"
                              >
                                <Trash className="h-3 w-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Add Type Dialog */}
      <Dialog open={isAddTypeDialogOpen} onOpenChange={setIsAddTypeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Measurement Type</DialogTitle>
            <DialogDescription>
              Create a new custom measurement type for your tailor shop
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="typeName">Type Name</Label>
              <Input
                id="typeName"
                placeholder="e.g., Kurta, Sherwani, etc."
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTypeDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={addMeasurementType}>
              <Check className="h-4 w-4 mr-2" />
              Add Type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Field Dialog */}
      <Dialog open={isAddFieldDialogOpen} onOpenChange={setIsAddFieldDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Measurement Field</DialogTitle>
            <DialogDescription>
              Add a custom measurement field to this type
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fieldName">Field Name</Label>
              <Input
                id="fieldName"
                placeholder="e.g., Chest, Waist, etc."
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
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
                  <SelectItem value="number">Number (inches)</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="fieldRequired"
                checked={newFieldRequired}
                onCheckedChange={setNewFieldRequired}
              />
              <Label htmlFor="fieldRequired">Required Field</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddFieldDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={addFieldToType}>
              <Check className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Employee Dialog */}
      <Dialog open={isAddEmployeeDialogOpen} onOpenChange={setIsAddEmployeeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Create a new employee account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="employeeName">Full Name</Label>
              <Input
                id="employeeName"
                name="name"
                placeholder="Employee Name"
                value={newEmployee.name}
                onChange={handleEmployeeInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employeeEmail">Email</Label>
              <Input
                id="employeeEmail"
                type="email"
                name="email"
                placeholder="employee@example.com"
                value={newEmployee.email}
                onChange={handleEmployeeInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employeePhone">Phone Number</Label>
              <Input
                id="employeePhone"
                name="phoneNumber"
                placeholder="03XX-XXXXXXX"
                value={newEmployee.phoneNumber}
                onChange={handleEmployeeInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employeePosition">Position</Label>
              <Input
                id="employeePosition"
                name="position"
                placeholder="e.g., Tailor, Manager, etc."
                value={newEmployee.position}
                onChange={handleEmployeeInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employeeRole">Role</Label>
              <Select 
                value={newEmployee.role}
                onValueChange={(value) => setNewEmployee(prev => ({
                  ...prev,
                  role: value as 'admin' | 'employee'
                }))}
              >
                <SelectTrigger id="employeeRole">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEmployeeDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={addNewEmployee}>
              <Check className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
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
