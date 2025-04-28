import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from "sonner";
import { FirebaseConfig, initializeFirebase } from '@/services/firebase';

export function FirebaseSettings() {
  const [firebaseConfig, setFirebaseConfig] = useState<FirebaseConfig>({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pinInput, setPinInput] = useState('');

  // Fetch config data
  useEffect(() => {
    const storedConfig = localStorage.getItem('firebase_config');
    if (storedConfig) {
      setFirebaseConfig(JSON.parse(storedConfig));
    }
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

  return (
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
  );
}
