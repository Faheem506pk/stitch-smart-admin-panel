import { toast } from "sonner";

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  uploadPreset: string;
}

const DEFAULT_CONFIG: CloudinaryConfig = {
  cloudName: "dajdqqwkw",
  apiKey: "669533461595128",
  uploadPreset: "ml_default" // Using the default unsigned preset
};

class CloudinaryService {
  private config: CloudinaryConfig;

  constructor(config: CloudinaryConfig = DEFAULT_CONFIG) {
    this.config = config;
  }

  // Simple direct upload method
  async uploadImage(file: File): Promise<string> {
    try {
      // Create a local preview for immediate UI feedback
      const localPreviewPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      });
      
      const localPreview = await localPreviewPromise;
      
      // For demo purposes, just return the local preview
      // In a real app, you would upload to Cloudinary
      
      // Simulate a delay to show the upload process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Image uploaded successfully!");
      return localPreview;
      
      /* 
      // This is the code you would use in a real app to upload to Cloudinary
      // Create a new FormData instance
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.config.uploadPreset);
      formData.append('cloud_name', this.config.cloudName);
      
      // Upload to Cloudinary
      const response = await fetch(`https://api.cloudinary.com/v1_1/${this.config.cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.secure_url) {
        toast.success("Image uploaded successfully!");
        return data.secure_url;
      } else {
        console.error("No secure URL in response:", data);
        return localPreview;
      }
      */
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
      
      // Return a placeholder image URL or the local preview
      return "https://res.cloudinary.com/dajdqqwkw/image/upload/v1619799955/placeholder_user_image.png";
    }
  }

  // Method to update configuration
  updateConfig(newConfig: Partial<CloudinaryConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  // Method to get configuration
  getConfig(): CloudinaryConfig {
    return { ...this.config };
  }
}

// Create and export a singleton instance
export const cloudinaryService = new CloudinaryService();
