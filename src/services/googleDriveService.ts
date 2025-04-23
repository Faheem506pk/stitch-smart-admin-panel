
import { toast } from "sonner";
import { getFirebaseConfig } from "./firebase";

interface GoogleDriveConfig {
  clientId: string;
  apiKey?: string;
  scopes?: string[];
}

const DEFAULT_CONFIG: GoogleDriveConfig = {
  clientId: "331309828650-c00h45fpu5goah9u4m52mo9cua5vc6kb.apps.googleusercontent.com",
  scopes: [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.appdata'
  ]
};

class GoogleDriveService {
  private config: GoogleDriveConfig;
  private tokenClient: any = null;
  private isInitialized: boolean = false;
  private gisLoaded: boolean = false;

  constructor(config: GoogleDriveConfig = DEFAULT_CONFIG) {
    this.config = config;
    
    // Load the Google API client library
    this.loadGapiAndGsi();
  }

  private loadGapiAndGsi() {
    // Add Google API Client Library
    const gapiScript = document.createElement('script');
    gapiScript.src = 'https://apis.google.com/js/api.js';
    gapiScript.async = true;
    gapiScript.defer = true;
    gapiScript.onload = () => this.initGapi();
    document.head.appendChild(gapiScript);
    
    // Add Google Identity Services
    const gsiScript = document.createElement('script');
    gsiScript.src = 'https://accounts.google.com/gsi/client';
    gsiScript.async = true;
    gsiScript.defer = true;
    gsiScript.onload = () => {
      this.gisLoaded = true;
      this.initTokenClient();
    };
    document.head.appendChild(gsiScript);
  }

  private initGapi() {
    if (!window.gapi) {
      console.error("Google API client not loaded");
      return;
    }
    
    window.gapi.load('client', async () => {
      try {
        await window.gapi.client.init({});
        await window.gapi.client.load('drive', 'v3');
        console.log("Google Drive API loaded");
        this.isInitialized = true;
      } catch (error) {
        console.error("Error initializing GAPI client", error);
      }
    });
  }

  private initTokenClient() {
    if (!this.gisLoaded || !window.google) {
      console.log("Google Identity Services not yet loaded");
      return;
    }
    
    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: this.config.clientId,
      scope: this.config.scopes?.join(' ') || '',
      callback: (response: any) => {
        if (response.error !== undefined) {
          throw response;
        }
        
        console.log("Google Drive authentication successful");
      },
    });
  }

  private async ensureAuthenticated(): Promise<boolean> {
    if (!this.isInitialized || !this.tokenClient) {
      console.log("Google Drive service not initialized yet");
      toast.error("Google Drive service not initialized. Please try again.");
      return false;
    }
    
    return new Promise((resolve) => {
      // Check if already authenticated
      if (window.gapi.client.getToken()) {
        resolve(true);
        return;
      }
      
      // Request authentication
      this.tokenClient.callback = (response: any) => {
        if (response.error !== undefined) {
          toast.error("Failed to authenticate with Google Drive");
          resolve(false);
          return;
        }
        resolve(true);
      };
      
      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  }

  async uploadImage(file: File): Promise<string | null> {
    try {
      const isAuthenticated = await this.ensureAuthenticated();
      if (!isAuthenticated) {
        return null;
      }
      
      // Read the file as array buffer
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // Upload file metadata
      const fileMetadata = {
        name: file.name,
        mimeType: file.type,
      };
      
      // Create multipart request for metadata + file content
      const boundary = '-------314159265358979323846';
      const delimiter = "\r\n--" + boundary + "\r\n";
      const closeDelim = "\r\n--" + boundary + "--";
      
      const contentType = file.type || 'application/octet-stream';
      let multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(fileMetadata) +
        delimiter +
        'Content-Type: ' + contentType + '\r\n';

      // Base64 encode the binary data
      const base64Data = btoa(
        bytes.reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      multipartRequestBody += 'Content-Transfer-Encoding: base64\r\n\r\n' + base64Data + closeDelim;

      // Upload the file
      const response = await window.gapi.client.request({
        path: '/upload/drive/v3/files',
        method: 'POST',
        params: { uploadType: 'multipart' },
        headers: {
          'Content-Type': 'multipart/related; boundary="' + boundary + '"'
        },
        body: multipartRequestBody
      });
      
      if (response.status !== 200) {
        throw new Error(`Error uploading file: ${response.status}`);
      }
      
      // Set file permissions to anyone with the link can view
      const fileId = response.result.id;
      await window.gapi.client.drive.permissions.create({
        fileId: fileId,
        resource: {
          role: 'reader',
          type: 'anyone'
        }
      });
      
      // Get the file's webViewLink
      const fileResponse = await window.gapi.client.drive.files.get({
        fileId: fileId,
        fields: 'webViewLink,webContentLink'
      });
      
      // Use webContentLink as it's direct access to the file
      const imageUrl = fileResponse.result.webContentLink;
      return imageUrl;
    } catch (error) {
      console.error("Error uploading to Google Drive:", error);
      toast.error("Failed to upload image to Google Drive");
      return null;
    }
  }

  // Method to update configuration
  updateConfig(newConfig: Partial<GoogleDriveConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  // Method to get configuration
  getConfig(): GoogleDriveConfig {
    return this.config;
  }
}

// Create and export a singleton instance
export const googleDriveService = new GoogleDriveService();

// Add Google Drive types to the window object
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}
