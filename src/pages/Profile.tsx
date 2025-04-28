import { useState, useEffect } from 'react';
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useStore } from "@/store/useStore";
import { cloudinaryService } from "@/services/cloudinaryService";
import { employeeService } from "@/services/employeeService";
import { Loader2, Camera, Save } from "lucide-react";

const Profile = () => {
  const { user, updateUser } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: '',
    position: '',
    profilePicture: user?.profilePicture || ''
  });

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

  const handleUploadImage = async () => {
    setIsUploading(true);
    try {
      const imageUrl = await cloudinaryService.openUploadWidget();
      if (imageUrl) {
        setProfileData(prev => ({
          ...prev,
          profilePicture: imageUrl
        }));
        toast.success("Profile picture uploaded successfully!");
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
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profileData.profilePicture} />
                  <AvatarFallback className="text-lg">
                    {getInitials(profileData.name)}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  variant="outline" 
                  onClick={handleUploadImage}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      Change Picture
                    </>
                  )}
                </Button>
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="pt-4">
                <Button variant="outline" className="w-full">
                  Change Password
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
