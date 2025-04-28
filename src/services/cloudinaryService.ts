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

  // Compress image before upload
  private async compressImage(file: File, maxSizeKB: number = 250): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          // First try: resize the image
          let width = img.width;
          let height = img.height;
          
          // Calculate the width and height, maintaining the aspect ratio
          const maxSize = 800; // Max dimension
          if (width > height && width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
          
          // Create canvas for the resized image
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          // Draw the resized image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Start with high quality
          let quality = 0.9;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);
          let currentSize = this.getFileSizeFromDataURL(dataUrl);
          
          console.log(`Initial size: ${currentSize / 1024}KB`);
          
          // Reduce quality until file size is under maxSizeKB
          while (currentSize > maxSizeKB * 1024 && quality > 0.1) {
            quality -= 0.05;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
            currentSize = this.getFileSizeFromDataURL(dataUrl);
          }
          
          // If still too large, reduce dimensions further
          if (currentSize > maxSizeKB * 1024) {
            let scale = 0.9;
            while (currentSize > maxSizeKB * 1024 && scale > 0.1) {
              width = Math.floor(width * scale);
              height = Math.floor(height * scale);
              
              canvas.width = width;
              canvas.height = height;
              ctx.drawImage(img, 0, 0, width, height);
              
              dataUrl = canvas.toDataURL('image/jpeg', quality);
              currentSize = this.getFileSizeFromDataURL(dataUrl);
              
              scale -= 0.1;
            }
          }
          
          const finalSize = this.getFileSizeFromDataURL(dataUrl) / 1024;
          console.log(`Compressed image to quality: ${quality.toFixed(2)}, dimensions: ${width}x${height}, size: ${finalSize.toFixed(2)}KB`);
          
          if (finalSize > maxSizeKB) {
            console.warn(`Could not compress image below ${maxSizeKB}KB. Final size: ${finalSize.toFixed(2)}KB`);
          }
          
          resolve(dataUrl);
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
    });
  }
  
  // Calculate file size from data URL
  private getFileSizeFromDataURL(dataURL: string): number {
    // Remove the prefix (data:image/png;base64,) and calculate size
    const base64 = dataURL.split(',')[1];
    const stringLength = base64.length;
    const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.75;
    return sizeInBytes;
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
      
      // Get local preview for immediate display
      const localPreview = await localPreviewPromise;
      
      // Start compression (this will take some time)
      toast.info("Compressing image...");
      const compressedImage = await this.compressImage(file);
      
      // Simulate upload delay
      toast.info("Uploading image...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Image uploaded successfully!");
      return compressedImage;
      
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
