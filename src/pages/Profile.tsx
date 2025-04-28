import { useState, useEffect } from 'react';
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useStore } from "@/store/useStore";
import { employeeService } from "@/services/employeeService";
import { Loader2, Camera, Save } from "lucide-react";

const Profile = () => {
  const { user, updateUser } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useState<HTMLInputElement | null>(null);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: '',
    position: '',
    profilePicture: user?.profilePicture || ''
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Fetch additional employee data
  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!user) return;
      
      try {
        const employee = await employeeService.getEmployeeById(user.id);
        if (employee) {
          setProfileData(prev => ({
            ...prev,
            name: employee.name,
            email: employee.email,
            phoneNumber: employee.phoneNumber || '',
            position: employee.position || '',
            profilePicture: employee.profilePicture || user?.profilePicture || ''
          }));
        }
      } catch (error) {
        console.error("Error fetching employee data:", error);
      }
    };

    fetchEmployeeData();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      // Show local preview immediately
      const localPreview = URL.createObjectURL(file);
      setProfileData(prev => ({
        ...prev,
        profilePicture: localPreview
      }));
      
      // Create a FormData instance
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ml_default');
      formData.append('cloud_name', 'dajdqqwkw');
      
      // Upload to Cloudinary
      const response = await fetch('https://api.cloudinary.com/v1_1/dajdqqwkw/image/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.secure_url) {
        setProfileData(prev => ({
          ...prev,
          profilePicture: data.secure_url
        }));
        toast.success("Profile picture uploaded successfully!");
      } else {
        throw new Error("No secure URL returned from Cloudinary");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload profile picture");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Update employee record in Firestore
      const success = await employeeService.updateEmployee(user.id, {
        name: profileData.name,
        phoneNumber: profileData.phoneNumber,
        position: profileData.position,
        profilePicture: profileData.profilePicture
      });
      
      if (success) {
        // Update local user state
        updateUser({
          name: profileData.name,
          profilePicture: profileData.profilePicture
        });
        
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating your profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;
    
    // Validate passwords
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    
    if (!newPassword) {
      toast.error("Please enter a new password");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setIsChangingPassword(true);
    try {
      // In a real app, you would verify the current password with Firebase Auth
      // For this demo, we'll just update the password
      const success = await employeeService.changePassword(user.id, newPassword);
      
      if (success) {
        toast.success("Password changed successfully!");
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error("Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("An error occurred while changing your password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <p>Please log in to view your profile.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal information and settings
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4 mb-6">
                <div className="relative h-24 w-24">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profileData.profilePicture} />
                    <AvatarFallback className="text-lg">
                      {getInitials(profileData.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <input
                    type="file"
                    id="profilePicture"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity rounded-full">
                    {isUploading ? (
                      <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <label
                          htmlFor="profilePicture"
                          className="w-full h-full flex items-center justify-center hover:bg-black/20 rounded-full"
                        >
                          <Camera className="h-5 w-5 text-white" />
                        </label>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Click on the image to upload a new profile picture
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={profileData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  value={profileData.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground">
                  Contact an administrator to change your email address
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={profileData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Your phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  name="position"
                  value={profileData.position}
                  onChange={handleInputChange}
                  placeholder="Your position"
                  disabled={user.role !== 'admin'}
                  className={user.role !== 'admin' ? "bg-muted" : ""}
                />
                {user.role !== 'admin' && (
                  <p className="text-sm text-muted-foreground">
                    Only administrators can change position information
                  </p>
                )}
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
              <CardDescription>
                Manage your password and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div className="pt-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing Password...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </div>

              <div className="pt-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Account Type:</strong> {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Last Login:</strong> {new Date(user.lastLogin).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
