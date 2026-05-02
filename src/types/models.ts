export type Role = "USER" | "GARAGE_OWNER" | "SUPPLIER" | "ADMIN";

export interface AppUser {
  id: string;
  fullName: string;
  phone: string;
  role: Role;
}

export interface Garage {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  city: string;
  openingHours: string;
  description?: string;
  services: string[];
  mapQuery: string;
}

export interface SparePart {
  id: string;
  supplierId: string;
  name: string;
  category: string;
  brand?: string;
  price: number;
  quantity: number;
  description?: string;
  image?: string;
  garageCompatibleIds?: string[];
}

export interface CartItem {
  partId: string;
  quantity: number;
}

export interface Appointment {
  id: string;
  garageId: string;
  garageOwnerId: string;
  garageName: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  service: string;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
  status: "PENDING" | "CONFIRMED";
}

export interface Review {
  id: string;
  garageId: string;
  garageName: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  appointmentId?: string;
}
