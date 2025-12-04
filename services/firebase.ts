import { User, UserRole, Visitor, VisitorStatus, Payment, Notice, Complaint, Vehicle, Amenity, Booking, Pet } from '../types';

// NOTE: In a real app, you would import firebase SDKs here:
// import { initializeApp } from 'firebase/app';
// import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
// import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';

// Mock Data for "Demo Mode" since we don't have a real Firebase project connected in this environment.
let MOCK_USERS: User[] = [
  { uid: '1', email: 'resident@demo.com', displayName: 'Alice Resident', role: UserRole.RESIDENT, flatNumber: '101', block: 'A', phone: '555-0101', isPublic: true, status: 'approved', pets: [{id: 'pet1', name: 'Bruno', type: 'dog', breed: 'Labrador'}] },
  { uid: '4', email: 'bob@resident.com', displayName: 'Bob Neighbor', role: UserRole.RESIDENT, flatNumber: '102', block: 'A', phone: '555-0102', isPublic: false, status: 'approved', pets: [] },
  { uid: '5', email: 'charlie@resident.com', displayName: 'Charlie Pending', role: UserRole.RESIDENT, flatNumber: '101', block: 'A', phone: '555-0103', isPublic: true, status: 'pending', pets: [] },
  { uid: '2', email: 'guard@demo.com', displayName: 'Guard Security', role: UserRole.GUARD, status: 'approved' },
  { uid: '3', email: 'admin@demo.com', displayName: 'Charlie Admin', role: UserRole.ADMIN, status: 'approved' },
];

let MOCK_VISITORS: Visitor[] = [
  { 
    id: 'v1', 
    name: 'John Delivery', 
    type: 'delivery', 
    code: '1234', 
    status: VisitorStatus.PRE_APPROVED, 
    expectedArrival: new Date().toISOString(),
    hostId: '1',
    hostName: 'Alice Resident',
    hostFlat: 'A-101'
  },
  { 
    id: 'v2', 
    name: 'Sarah Guest', 
    type: 'guest', 
    code: '5678', 
    status: VisitorStatus.ENTERED, 
    expectedArrival: new Date(Date.now() - 3600000).toISOString(),
    entryTime: new Date(Date.now() - 1800000).toISOString(),
    hostId: '1',
    hostName: 'Alice Resident',
    hostFlat: 'A-101',
    vehicleNumber: 'KA-05-MJ-3333'
  }
];

let MOCK_PAYMENTS: Payment[] = [
  { id: 'p1', residentId: '1', title: 'Monthly Maintenance - Oct', amount: 3500, dueDate: '2023-10-05', status: 'paid', category: 'maintenance', paidAt: '2023-10-01' },
  { id: 'p2', residentId: '1', title: 'Monthly Maintenance - Nov', amount: 3500, dueDate: '2023-11-05', status: 'pending', category: 'maintenance' },
  { id: 'p3', residentId: '1', title: 'Clubhouse Booking', amount: 500, dueDate: '2023-11-10', status: 'pending', category: 'amenity' },
];

const MOCK_NOTICES: Notice[] = [
  { id: 'n1', title: 'Diwali Celebration', content: 'Join us for the Grand Diwali Party on Nov 12th at the Clubhouse. Dinner starts at 7 PM. Dress code: Traditional.', date: '2023-10-25', priority: 'high' },
  { id: 'n2', title: 'Lift Maintenance', content: 'Lift B will be under maintenance on Monday from 10 AM to 2 PM. Please use Lift A.', date: '2023-10-28', priority: 'medium' },
  { id: 'n3', title: 'New Gym Rules', content: 'Please carry a separate pair of shoes for the gym. Towels are mandatory. Operating hours are 5 AM to 10 PM. Guests are charged $10 per visit.', date: '2023-10-01', priority: 'low' }
];

let MOCK_COMPLAINTS: Complaint[] = [
  { id: 'c1', residentId: '1', residentName: 'Alice Resident', flat: 'A-101', title: 'Leaking Tap', description: 'Kitchen tap is dripping continuously.', category: 'plumbing', status: 'open', createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'c2', residentId: '1', residentName: 'Alice Resident', flat: 'A-101', title: 'Corridor Light', description: 'Light outside door is flickering.', category: 'electrical', status: 'resolved', createdAt: new Date(Date.now() - 172800000).toISOString(), updatedAt: new Date(Date.now() - 3600000).toISOString() }
];

let MOCK_VEHICLES: Vehicle[] = [
  { id: 've1', residentId: '1', make: 'Honda', model: 'City', plateNumber: 'KA-01-AB-1234', type: 'car' }
];

let MOCK_AMENITIES: Amenity[] = [
  { id: 'a1', name: 'Clubhouse Hall', description: 'Large hall for parties', maxCapacity: 50, openTime: '10:00', closeTime: '22:00' },
  { id: 'a2', name: 'Tennis Court', description: 'Synthetic court', maxCapacity: 4, openTime: '06:00', closeTime: '21:00' }
];

let MOCK_BOOKINGS: Booking[] = [];

// --- Simulation Service ---

export const authService = {
  login: async (email: string): Promise<User> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    const user = MOCK_USERS.find(u => u.email === email);
    
    if (!user) throw new Error('User not found.');
    if (user.status === 'pending') throw new Error('Account pending approval by Admin.');
    if (user.status === 'rejected') throw new Error('Account request rejected.');
    
    return user;
  },
  logout: async () => {
    return Promise.resolve();
  }
};

export const dataService = {
  // Config: Flats
  getFlatsConfig: () => {
    const blocks = ['A', 'B', 'C'];
    const flats: string[] = [];
    blocks.forEach(block => {
      for(let i=1; i<=4; i++) { // 4 floors
        for(let j=1; j<=2; j++) { // 2 flats per floor
           flats.push(`${block}-${i}0${j}`);
        }
      }
    });
    return { blocks, flats };
  },

  // Visitor Management
  getVisitors: async (role: UserRole, userId?: string): Promise<Visitor[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (role === UserRole.RESIDENT) {
      return MOCK_VISITORS.filter(v => v.hostId === userId);
    }
    return MOCK_VISITORS;
  },

  addVisitor: async (visitor: Omit<Visitor, 'id' | 'status'>): Promise<Visitor> => {
    const newVisitor: Visitor = {
      ...visitor,
      id: Math.random().toString(36).substr(2, 9),
      status: visitor.entryTime ? VisitorStatus.ENTERED : VisitorStatus.PRE_APPROVED
    };
    
    // Simulate Notification if Walk-in
    if (visitor.code === 'WALK-IN') {
      const residents = MOCK_USERS.filter(u => 
        u.role === UserRole.RESIDENT && 
        u.status === 'approved' &&
        u.flatNumber && 
        u.block && 
        visitor.hostFlat.includes(u.block + '-' + u.flatNumber)
      );
      
      console.log(`[NOTIFICATION SYSTEM] Notifying residents of ${visitor.hostFlat}: ${residents.map(r => r.displayName).join(', ')}`);
    }

    MOCK_VISITORS = [newVisitor, ...MOCK_VISITORS];
    return newVisitor;
  },

  updateVisitorStatus: async (
    visitorId: string, 
    status: VisitorStatus, 
    extraData?: { vehicleNumber?: string, entryPhoto?: string }
  ): Promise<void> => {
    MOCK_VISITORS = MOCK_VISITORS.map(v => {
      if (v.id === visitorId) {
        const updates: Partial<Visitor> = { status };
        if (status === VisitorStatus.ENTERED) updates.entryTime = new Date().toISOString();
        if (status === VisitorStatus.EXITED) updates.exitTime = new Date().toISOString();
        if (extraData?.vehicleNumber) updates.vehicleNumber = extraData.vehicleNumber;
        if (extraData?.entryPhoto) updates.entryPhoto = extraData.entryPhoto;
        return { ...v, ...updates };
      }
      return v;
    });
  },

  // Payments & Maintenance
  getPayments: async (userId?: string): Promise<Payment[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (userId) return MOCK_PAYMENTS.filter(p => p.residentId === userId);
    return MOCK_PAYMENTS;
  },

  payInvoice: async (paymentId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate gateway
    MOCK_PAYMENTS = MOCK_PAYMENTS.map(p => 
      p.id === paymentId ? { ...p, status: 'paid', paidAt: new Date().toISOString() } : p
    );
  },

  createInvoice: async (invoice: Omit<Payment, 'id' | 'status' | 'paidAt'>): Promise<void> => {
    const newPayment: Payment = {
      ...invoice,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending'
    };
    MOCK_PAYMENTS = [newPayment, ...MOCK_PAYMENTS];
  },

  sendPaymentReminder: async (paymentId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In a real backend, this would trigger an email/push notification cloud function
    console.log(`Reminder sent for payment ${paymentId}`);
  },

  // Notices
  getNotices: async (): Promise<Notice[]> => {
    return MOCK_NOTICES;
  },

  // Complaints
  getComplaints: async (role: UserRole, userId?: string): Promise<Complaint[]> => {
    if (role === UserRole.RESIDENT) {
      return MOCK_COMPLAINTS.filter(c => c.residentId === userId);
    }
    return MOCK_COMPLAINTS;
  },

  addComplaint: async (complaint: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<void> => {
    const newComplaint: Complaint = {
      ...complaint,
      id: Math.random().toString(36).substr(2, 9),
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    MOCK_COMPLAINTS = [newComplaint, ...MOCK_COMPLAINTS];
  },

  updateComplaintStatus: async (id: string, status: Complaint['status']): Promise<void> => {
    MOCK_COMPLAINTS = MOCK_COMPLAINTS.map(c => c.id === id ? { ...c, status, updatedAt: new Date().toISOString() } : c);
  },

  // Vehicles
  getVehicles: async (userId: string): Promise<Vehicle[]> => {
    return MOCK_VEHICLES.filter(v => v.residentId === userId);
  },

  addVehicle: async (vehicle: Omit<Vehicle, 'id'>): Promise<void> => {
    MOCK_VEHICLES = [...MOCK_VEHICLES, { ...vehicle, id: Math.random().toString(36).substr(2, 9) }];
  },

  // Pets
  addPet: async (userId: string, pet: Omit<Pet, 'id'>): Promise<void> => {
    const newPet = { ...pet, id: Math.random().toString(36).substr(2, 9) };
    MOCK_USERS = MOCK_USERS.map(u => {
      if (u.uid === userId) {
        return { ...u, pets: [...(u.pets || []), newPet] };
      }
      return u;
    });
  },

  // Amenities & Booking
  getAmenities: async (): Promise<Amenity[]> => {
    return MOCK_AMENITIES;
  },

  getBookings: async (userId?: string): Promise<Booking[]> => {
    if (userId) return MOCK_BOOKINGS.filter(b => b.residentId === userId);
    return MOCK_BOOKINGS;
  },

  addBooking: async (booking: Omit<Booking, 'id' | 'status'>): Promise<void> => {
    // Basic double booking check
    const isTaken = MOCK_BOOKINGS.some(b => 
      b.amenityId === booking.amenityId && 
      b.date === booking.date && 
      b.startTime === booking.startTime &&
      b.status === 'confirmed'
    );
    if (isTaken) throw new Error("Slot already booked!");

    MOCK_BOOKINGS = [...MOCK_BOOKINGS, { ...booking, id: Math.random().toString(36).substr(2, 9), status: 'confirmed' }];
  },

  // Directory & User Management
  getResidents: async (): Promise<User[]> => {
    return MOCK_USERS.filter(u => u.role === UserRole.RESIDENT);
  },

  getAllUsers: async (): Promise<User[]> => {
    return MOCK_USERS;
  },

  addUser: async (user: Omit<User, 'uid' | 'status'>): Promise<void> => {
    // Check Max 3 rule
    if (user.role === UserRole.RESIDENT && user.flatNumber && user.block) {
      const existingInFlat = MOCK_USERS.filter(u => 
        u.role === UserRole.RESIDENT && 
        u.block === user.block && 
        u.flatNumber === user.flatNumber &&
        u.status === 'approved'
      );
      // NOTE: We allow creation, but approval might be blocked if full. 
      // Or we can block creation. Let's block creation if 3 *approved* exist.
      if (existingInFlat.length >= 3) {
        // throw new Error(`Flat ${user.block}-${user.flatNumber} already has 3 approved members.`);
        // Actually, better to allow registration but Admin sees the count before approving.
      }
    }

    MOCK_USERS = [...MOCK_USERS, { 
      ...user, 
      uid: Math.random().toString(36).substr(2, 9),
      status: 'pending', // Default for new registrations
      pets: []
    }];
  },

  updateUserStatus: async (uid: string, status: 'approved' | 'rejected'): Promise<void> => {
     // If approving, check limit
     if (status === 'approved') {
        const target = MOCK_USERS.find(u => u.uid === uid);
        if (target && target.role === UserRole.RESIDENT) {
           const existing = MOCK_USERS.filter(u => 
             u.role === UserRole.RESIDENT && 
             u.block === target.block && 
             u.flatNumber === target.flatNumber &&
             u.status === 'approved'
           );
           if (existing.length >= 3) {
             throw new Error("Cannot approve: Flat limit (3) reached.");
           }
        }
     }

     MOCK_USERS = MOCK_USERS.map(u => u.uid === uid ? { ...u, status } : u);
  },

  // Helper for AI context
  getAllCommunityContext: async (): Promise<string> => {
    const notices = MOCK_NOTICES.map(n => `${n.title}: ${n.content}`).join('\n');
    return `
    Community Name: Sunrise Enclave.
    Blocks: A, B, C. 4 Floors each.
    Rules: 
    - Max 3 residents per flat.
    - Pets must be registered.
    - Quiet hours 10 PM to 6 AM.
    - Speed limit 10km/h.
    - Visitor parking is in the basement.
    - Deliveries must use the service lift.
    
    Active Notices:
    ${notices}
    `;
  }
};