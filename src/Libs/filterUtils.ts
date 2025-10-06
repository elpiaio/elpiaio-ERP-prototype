// src/Libs/filterUtils.ts
import { Order } from "@/Types/order";
import { OrderFilter } from "@/Types/filter";

/** compara se isoDate (string) está entre (inclusive) from/to (format YYYY-MM-DD or ISO) */
function inDateRange(isoDate?: string | null, from?: string | null, to?: string | null) {
  if (!isoDate) return false;
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return false;
  if (from) {
    const f = new Date(from);
    if (isNaN(f.getTime()) && from.length === 10) f.setHours(0, 0, 0, 0);
    if (d < f) return false;
  }
  if (to) {
    const t = new Date(to);
    if (isNaN(t.getTime()) && to.length === 10) t.setHours(23, 59, 59, 999);
    if (d > t) return false;
  }
  return true;
}

export function matchesFilter(order: Order, filter?: OrderFilter) {
  if (!filter) return true;
  // customer name substring (case-insensitive)
  if (filter.customerName) {
    const q = filter.customerName.trim().toLowerCase();
    if (!order.customerName?.toLowerCase().includes(q)) return false;
  }
  // pickup date range
  if (filter.pickupFrom || filter.pickupTo) {
    if (!inDateRange(order.pickupAt ?? undefined, filter.pickupFrom ?? undefined, filter.pickupTo ?? undefined))
      return false;
  }
  // created date range
  if (filter.createdFrom || filter.createdTo) {
    if (!inDateRange(order.createdAt, filter.createdFrom ?? undefined, filter.createdTo ?? undefined))
      return false;
  }
  // createdBy exact match
  if (filter.createdBy) {
    if ((order.createdBy ?? "Sem usuário") !== filter.createdBy) return false;
  }
  return true;
}
