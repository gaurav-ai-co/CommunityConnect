export enum UserRole {
  ADMIN = 'admin',
  RESIDENT = 'resident',
  GUARD = 'guard'
}

export interface Pet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'other';
  breed?: string;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  flatNumber?: string;
  block?: string;
  phone?: string;
  isPublic?: boolean; // For community directory visibility
  status: 'pending' | 'approved' | 'rejected'; // New field for approval
  pets?: Pet[]; // New field for pets
}

export enum VisitorStatus {
  PRE_APPROVED = 'pre_approved',
  ENTERED = 'entered',
  EXITED = 'exited',
  DENIED = 'denied'
}

export interface Visitor {
  id: string;
  name: string;
  type: 'guest' | 'delivery' | 'service';
  code: string; // Entry code
  status: VisitorStatus;
  expectedArrival: string; // ISO date string
  entryTime?: string;
  exitTime?: string;
  hostId: string;
  hostName: string;
  hostFlat: string;
  phone?: string; // For walk-ins
  vehicleNumber?: string;
  entryPhoto?: string; // Base64 image string
}

export interface Payment {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  category: 'maintenance' | 'utility' | 'amenity' | 'other';
  paidAt?: string;
  residentId?: string; // To track who it belongs to
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Complaint {
  id: string;
  residentId: string;
  residentName: string;
  flat: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  category: 'electrical' | 'plumbing' | 'security' | 'common_area' | 'other';
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
}

export interface Vehicle {
  id: string;
  residentId: string;
  make: string; // e.g., Toyota
  model: string; // e.g., Corolla
  plateNumber: string;
  type: 'car' | 'bike';
}

export interface Amenity {
  id: string;
  name: string;
  description: string;
  maxCapacity: number;
  openTime: string; // e.g. "06:00"
  closeTime: string; // e.g. "22:00"
}

export interface Booking {
  id: string;
  amenityId: string;
  amenityName: string;
  residentId: string;
  residentName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: 'confirmed' | 'cancelled';
}