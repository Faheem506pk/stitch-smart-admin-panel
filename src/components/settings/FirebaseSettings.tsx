import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { FirebaseConfig } from "@/services/firebase";
import { db } from "@/services/firebase"; // Master DB
import { doc, updateDoc } from "firebase/firestore";
import { useTenant } from "@/context/TenantContext";

export function FirebaseSettings() {
  const { userProfile, refreshTenant } = useTenant();
  const [firebaseConfig, setFirebaseConfig] = useState<FirebaseConfig>({
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Sync with user profile
  useEffect(() => {
    if (userProfile?.tenantConfig) {
      setFirebaseConfig({
        apiKey: userProfile.tenantConfig.apiKey || "",
        authDomain: userProfile.tenantConfig.authDomain || "",
        projectId: userProfile.tenantConfig.projectId || "",
        storageBucket: userProfile.tenantConfig.storageBucket || "",
        messagingSenderId: userProfile.tenantConfig.messagingSenderId || "",
        appId: userProfile.tenantConfig.appId || "",
      });
    }
  }, [userProfile]);

  // Check for correct PIN
  const checkPin = () => {
    const correctPin = "0000"; // This should be stored securely in a real app
    if (pinInput === correctPin) {
      setIsEditMode(true);
      setShowPin(false);
      setPinInput("");
    } else {
      toast.error("Incorrect PIN");
    }
  };

  // Save Firebase configuration
  const saveFirebaseConfig = async () => {
    // Validate config
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      toast.error("API Key and Project ID are required");
      return;
    }

    if (!userProfile?.id || !db) {
      toast.error("User profile not found. Cannot save settings.");
      return;
    }

    setLoading(true);
    try {
      // Update User Profile in Master DB
      const userRef = doc(db, "users", userProfile.id);

      // Merge with existing config to preserve Cloudinary settings if any
      await updateDoc(userRef, {
        "tenantConfig.apiKey": firebaseConfig.apiKey,
        "tenantConfig.authDomain": firebaseConfig.authDomain,
        "tenantConfig.projectId": firebaseConfig.projectId,
        "tenantConfig.storageBucket": firebaseConfig.storageBucket,
        "tenantConfig.messagingSenderId": firebaseConfig.messagingSenderId,
        "tenantConfig.appId": firebaseConfig.appId,
      });

      toast.success("Firebase configuration saved to profile");
      setIsEditMode(false);
      refreshTenant(); // Trigger re-init
    } catch (error) {
      console.error("Error saving Firebase config:", error);
      toast.error("Failed to save Firebase configuration");
    } finally {
      setLoading(false);
    }
  };

  // Handle Firebase config changes
  const handleFirebaseConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFirebaseConfig((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Firebase Configuration</CardTitle>
          <CardDescription>Connect your application to Firebase services. Enter your Firebase project credentials below.</CardDescription>
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
                <Input id="pin" type="password" value={pinInput} onChange={(e) => setPinInput(e.target.value)} placeholder="Enter security PIN" />
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
              <Switch id="enableFirebase" disabled={!isEditMode} defaultChecked={true} />
              <Label htmlFor="enableFirebase">Enable Firebase Integration</Label>
            </div>

            {isEditMode && (
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditMode(false)}>
                  Cancel
                </Button>
                <Button onClick={saveFirebaseConfig}>Save Configuration</Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
