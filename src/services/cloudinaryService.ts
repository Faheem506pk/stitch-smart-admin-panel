import { toast } from "sonner";

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret?: string;
  uploadPreset?: string;
}

const DEFAULT_CONFIG: CloudinaryConfig = {
  cloudName: "dajdqqwkw",
  apiKey: "669533461595128",
  uploadPreset: "ml_default" // Using the default unsigned preset
};

class CloudinaryService {
  private config: CloudinaryConfig;
  private isInitialized: boolean = false;
  private uploadWidget: any = null;

  constructor(config: CloudinaryConfig = DEFAULT_CONFIG) {
    this.config = config;
    this.initCloudinary();
  }

  private initCloudinary() {
    // Add Cloudinary script if not already loaded
    if (!window.cloudinary) {
      const script = document.createElement('script');
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.async = true;
      script.onload = () => {
        this.isInitialized = true;
        console.log("Cloudinary upload widget initialized");
      };
      document.head.appendChild(script);
    } else {
      this.isInitialized = true;
    }
  }

  private ensureInitialized(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.isInitialized) {
        resolve(true);
        return;
      }

      const checkInterval = setInterval(() => {
        if (window.cloudinary) {
          clearInterval(checkInterval);
          this.isInitialized = true;
          resolve(true);
        }
      }, 100);

      // Timeout after 5 seconds
      setTimeout(() => {
        if (!this.isInitialized) {
          clearInterval(checkInterval);
          resolve(false);
        }
      }, 5000);
    });
  }

  // Direct upload method using the Cloudinary Upload Widget
  async uploadImage(file: File): Promise<string | null> {
    // Create a local preview for immediate UI feedback
    const localPreviewPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    });
    
    const localPreview = await localPreviewPromise;
    
    try {
      // Use the upload widget instead of direct API call
      const isInitialized = await this.ensureInitialized();
      
      if (!isInitialized) {
        toast.error("Cloudinary upload widget failed to initialize");
        return localPreview; // Return local preview as fallback
      }
      
      return new Promise<string>((resolve) => {
        const options = {
          cloudName: this.config.cloudName,
          uploadPreset: this.config.uploadPreset || 'ml_default',
          apiKey: this.config.apiKey,
          sources: ['local'],
          multiple: false,
          folder: 'profile_pictures',
          tags: ['profile', 'user'],
          resourceType: 'image',
          clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif'],
          maxFileSize: 5000000, // 5MB
          showUploadMoreButton: false,
          singleUploadAutoClose: true,
          styles: {
            palette: {
              window: "#FFFFFF",
              windowBorder: "#90A0B3",
              tabIcon: "#0078FF",
              menuIcons: "#5A616A",
              textDark: "#000000",
              textLight: "#FFFFFF",
              link: "#0078FF",
              action: "#FF620C",
              inactiveTabIcon: "#0E2F5A",
              error: "#F44235",
              inProgress: "#0078FF",
              complete: "#20B832",
              sourceBg: "#E4EBF1"
            }
          }
        };
        
        // Create a temporary file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        
        // Create a DataTransfer object and add the file
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        
        // Create and open the upload widget
        this.uploadWidget = window.cloudinary.createUploadWidget(
          options,
          (error: any, result: any) => {
            if (!error && result && result.event === "success") {
              const imageUrl = result.info.secure_url;
              toast.success("Image uploaded successfully!");
              resolve(imageUrl);
            } else if (result && result.event === "close") {
              // If widget is closed without uploading, return local preview
              resolve(localPreview);
            } else if (error) {
              console.error("Cloudinary widget error:", error);
              toast.error("Error uploading image");
              resolve(localPreview);
            }
            
            // Clean up
            document.body.removeChild(fileInput);
          }
        );
        
        // Simulate a file selection
        this.uploadWidget.open();
        
        // If widget fails to open, use direct upload as fallback
        setTimeout(() => {
          if (!this.uploadWidget.isShowing()) {
            this.directUpload(file).then(resolve);
          }
        }, 1000);
      });
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      toast.error("Failed to upload image to Cloudinary");
      // Return local preview so UI isn't blocked
      return localPreview;
    }
  }
  
  // Fallback direct upload method
  private async directUpload(file: File): Promise<string> {
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
      
      // Create a new FormData instance
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.config.uploadPreset || 'ml_default');
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
    } catch (error) {
      console.error("Direct upload error:", error);
      toast.error("Failed to upload image directly");
      
      // Return a placeholder image URL
      return "https://res.cloudinary.com/dajdqqwkw/image/upload/v1619799955/placeholder_user_image.png";
    }
  }

  // Open the Cloudinary upload widget
  async openUploadWidget(): Promise<string | null> {
    const isInitialized = await this.ensureInitialized();
    
    if (!isInitialized) {
      toast.error("Cloudinary upload widget failed to initialize");
      return null;
    }
    
    return new Promise((resolve) => {
      const options = {
        cloudName: this.config.cloudName,
        uploadPreset: this.config.uploadPreset || 'ml_default',
        apiKey: this.config.apiKey,
        sources: ['local', 'camera'],
        multiple: false,
        cropping: true,
        croppingAspectRatio: 1,
        showSkipCropButton: true,
        styles: {
          palette: {
            window: "#FFFFFF",
            windowBorder: "#90A0B3",
            tabIcon: "#0078FF",
            menuIcons: "#5A616A",
            textDark: "#000000",
            textLight: "#FFFFFF",
            link: "#0078FF",
            action: "#FF620C",
            inactiveTabIcon: "#0E2F5A",
            error: "#F44235",
            inProgress: "#0078FF",
            complete: "#20B832",
            sourceBg: "#E4EBF1"
          },
          fonts: {
            default: null,
            "'Poppins', sans-serif": {
              url: "https://fonts.googleapis.com/css?family=Poppins",
              active: true
            }
          }
        }
      };
      
      this.uploadWidget = window.cloudinary.createUploadWidget(
        options,
        (error: any, result: any) => {
          if (!error && result && result.event === "success") {
            const imageUrl = result.info.secure_url;
            resolve(imageUrl);
          } else if (result && result.event === "close") {
            resolve(null);
          } else if (error) {
            console.error("Cloudinary widget error:", error);
            toast.error("Error uploading image");
            resolve(null);
          }
        }
      );
      
      this.uploadWidget.open();
    });
  }

  // Delete an image from Cloudinary (requires backend with API secret)
  async deleteImage(publicId: string): Promise<boolean> {
    try {
      // Extract public ID from URL if a full URL is provided
      if (publicId.includes('cloudinary.com')) {
        const urlParts = publicId.split('/');
        const filename = urlParts[urlParts.length - 1];
        publicId = filename.split('.')[0];
      }
      
      toast.error("Image deletion from Cloudinary requires a backend endpoint with API secret");
      console.warn("Direct image deletion from client-side is not supported for security reasons");
      
      return false;
    } catch (error) {
      console.error("Error deleting from Cloudinary:", error);
      toast.error("Failed to delete image");
      return false;
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

// Add Cloudinary types to the window object
declare global {
  interface Window {
    cloudinary: any;
  }
}
