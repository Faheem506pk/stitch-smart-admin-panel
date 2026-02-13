import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { db } from "@/services/firebase"; // Master DB
import { doc, updateDoc } from "firebase/firestore";
import { useTenant } from "@/context/TenantContext";

export function CloudinarySettings() {
  const { userProfile } = useTenant();
  const [cloudinaryConfig, setCloudinaryConfig] = useState({
    cloudName: "",
    apiKey: "",
    uploadPreset: "",
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Sync with user profile
  useEffect(() => {
    if (userProfile?.tenantConfig) {
      setCloudinaryConfig({
        cloudName: userProfile.tenantConfig.cloudinaryCloudName || "",
        apiKey: userProfile.tenantConfig.cloudinaryApiKey || "",
        uploadPreset: userProfile.tenantConfig.cloudinaryUploadPreset || "",
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

  // Save Cloudinary configuration
  const saveCloudinaryConfig = async () => {
    // Validate config
    if (!cloudinaryConfig.cloudName || !cloudinaryConfig.uploadPreset) {
      toast.error("Cloud Name and Upload Preset are required");
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

      await updateDoc(userRef, {
        "tenantConfig.cloudinaryCloudName": cloudinaryConfig.cloudName,
        "tenantConfig.cloudinaryApiKey": cloudinaryConfig.apiKey,
        "tenantConfig.cloudinaryUploadPreset": cloudinaryConfig.uploadPreset,
      });

      toast.success("Cloudinary configuration saved to profile");
      setIsEditMode(false);
    } catch (error) {
      console.error("Error saving Cloudinary config:", error);
      toast.error("Failed to save Cloudinary configuration");
    } finally {
      setLoading(false);
    }
  };

  // Handle Cloudinary config changes
  const handleCloudinaryConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCloudinaryConfig((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Cloudinary Configuration</CardTitle>
          <CardDescription>Connect your application to Cloudinary for image storage.</CardDescription>
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
              <Switch id="enableCloudinary" disabled={!isEditMode} defaultChecked={true} />
              <Label htmlFor="enableCloudinary">Enable Cloudinary Integration</Label>
            </div>

            {isEditMode && (
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditMode(false)}>
                  Cancel
                </Button>
                <Button onClick={saveCloudinaryConfig}>Save Configuration</Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
