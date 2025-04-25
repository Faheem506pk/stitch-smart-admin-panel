
export interface CustomerFormData {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  profilePicture: string | null;
  isWhatsApp: boolean;
}
