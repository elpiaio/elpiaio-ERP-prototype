// src/Types/filter.ts
export type OrderFilter = {
  customerName?: string; // substring search
  pickupFrom?: string | null; // ISO date string or yyyy-mm-dd
  pickupTo?: string | null;
  createdFrom?: string | null;
  createdTo?: string | null;
  createdBy?: string | null;
};
