// types.ts
export interface Staff {
  staffId: string;
  storeId: string;
  name: string; // Staff name for better display
}

export interface User {
  staffId: string;
  name: string;
  role: 'admin' | 'staff';
  storeId?: string;
  credential?: string; // To hold admin password or staff access code for subsequent requests
}

export enum Status {
  Active = 'Active',
  ExpiringSoon = 'Expiring Soon',
  Expired = 'Expired',
}

export interface Item {
  itemId: string;
  name: string;
  category: string;
  expirationDate: string; // YYYY-MM-DD
  notificationDays: number; // e.g., 7, 30
  quantity: number;
  imageUrl?: string;
  addedByStaffId?: string; // Tracks which staff member added the item
  storeCode?: string; // Tracks which store the item belongs to
}

export interface AccessCode {
  code: string;
  storeCode: string;
  createdAt: number;
  staffId: string;
}
