import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomerFormData } from "./addCustomerFlowTypes";
import { toast } from "sonner";
import { User, Mail, MapPin, FileText } from "lucide-react";
import { cloudinaryService } from "@/services/cloudinaryService";

interface AddCustomerStepInfoProps {
  customerData: CustomerFormData;
  setCustomerData: React.Dispatch<React.SetStateAction<CustomerFormData>>;
  onSave: () => Promise<boolean>;
  onBack: () => void;
  isExisting: boolean;
  isSaving: boolean;
}

function formatPakistaniNumber(number: string): string {
  // Remove all non-digit characters
  let cleaned = number.replace(/\D/g, "");

  // Ensure the number starts with 0 or 92
  if (cleaned.startsWith("92")) {
    cleaned = "0" + cleaned.slice(2);
  } else if (!cleaned.startsWith("0")) {
    cleaned = "0" + cleaned;
  }

  // Limit to 11 digits
  cleaned = cleaned.slice(0, 11);

  // Format to 0332-5194976
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  }

  return cleaned;
}

export function AddCustomerStepInfo({
  customerData,
  setCustomerData,
  onSave,
  onBack,
  isExisting,
  isSaving,
}: AddCustomerStepInfoProps) {
  const [profileImage, setProfileImage] = useState<string | null>(
    customerData.profilePicture || null
  );
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageUrl = event.target?.result as string;
          setProfileImage(imageUrl);
        };
        reader.readAsDataURL(file);

        const imageUrl = await cloudinaryService.uploadImage(file);
        if (imageUrl) {
          setCustomerData((prev) => ({ ...prev, profilePicture: imageUrl }));
          toast.success("Profile image uploaded successfully");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Failed to upload image. Please try again.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleCloudinaryUpload = async () => {
    setIsUploading(true);
    try {
      // Use direct upload instead of widget to avoid preset issues
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          try {
            const imageUrl = await cloudinaryService.uploadImage(file);
            if (imageUrl) {
              setProfileImage(imageUrl);
              setCustomerData((prev) => ({ ...prev, profilePicture: imageUrl }));
              toast.success("Profile image uploaded successfully");
            }
          } catch (error) {
            console.error("Error uploading image:", error);
            toast.error("Failed to upload image. Please try again.");
          } finally {
            setIsUploading(false);
          }
        } else {
          setIsUploading(false);
        }
      };
      
      input.click();
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image. Please try again.");
      setIsUploading(false);
    }
  };

  const handleWhatsAppChange = (checked: boolean) => {
    setCustomerData((prev) => ({ ...prev, isWhatsApp: checked }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatPakistaniNumber(value);

    // Validate phone number format for 11 digits
    if (formatted.replace(/\D/g, "").length <= 11) {
      // Only allow up to 11 digits
      setCustomerData((prev) => ({ ...prev, phone: formatted }));
    }
  };

  const handleSaveClick = async () => {
    // Validate phone number is exactly 11 digits
    if (customerData.phone.replace(/\D/g, "").length !== 11) {
      toast.error("Phone number must be exactly 11 digits");
      return;
    }

    const success = await onSave();
    if (success) {
      // Continue to next step or close
    }
  };

  const isValid = customerData.name && customerData.phone;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-shrink-0">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center relative overflow-hidden">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={() => {
                  setProfileImage(null);
                  setCustomerData((prev) => ({
                    ...prev,
                    profilePicture: null,
                  }));
                }}
              />
            ) : (
              <User className="h-12 w-12 text-muted-foreground" />
            )}
            <input
              type="file"
              id="profilePicture"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity">
              {isUploading ? (
                <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <label
                    htmlFor="profilePicture"
                    className="w-full h-full flex items-center justify-center hover:bg-black/20"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </label>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                value={customerData.name}
                onChange={(e) =>
                  setCustomerData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter customer name"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={customerData.phone}
              onChange={handlePhoneChange}
              placeholder="03XX-XXXXXXX"
              readOnly={isExisting}
              pattern="([0-9]{4})-([0-9]{7})" // Matches phone numbers like 0332-5194976 (with dash)
              minLength={12} // Minimum 12 characters (including dash)
              maxLength={12} // Maximum 12 characters (including dash)
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email (Optional)</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            value={customerData.email || ""}
            onChange={(e) =>
              setCustomerData((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder="Enter email address"
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address (Optional)</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Textarea
            id="address"
            value={customerData.address || ""}
            onChange={(e) =>
              setCustomerData((prev) => ({ ...prev, address: e.target.value }))
            }
            placeholder="Enter customer address"
            className="pl-10 pt-2"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Textarea
            id="notes"
            value={customerData.notes || ""}
            onChange={(e) =>
              setCustomerData((prev) => ({ ...prev, notes: e.target.value }))
            }
            placeholder="Add any notes about this customer"
            className="pl-10 pt-2"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isWhatsApp"
          checked={customerData.isWhatsApp}
          onCheckedChange={(checked) => handleWhatsAppChange(checked === true)}
        />
        <Label htmlFor="isWhatsApp" className="font-normal">
          This is a WhatsApp number
        </Label>
      </div>

      {customerData.isWhatsApp && customerData.phone && (
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 text-green-600"
          asChild
        >
          <a
            href={`https://wa.me/92${customerData.phone
              .replace(/\D/g, "")
              .replace(/^0+/, "")}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in WhatsApp
          </a>
        </Button>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isSaving || isUploading}
        >
          Back
        </Button>
        <Button
          onClick={handleSaveClick}
          disabled={!isValid || isSaving || isUploading}
        >
          {isSaving ? (
            <>
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
              Saving...
            </>
          ) : isExisting ? (
            "Update Customer"
          ) : (
            "Save Customer"
          )}
        </Button>
      </div>
    </div>
  );
}
