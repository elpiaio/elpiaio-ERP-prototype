// src/Services/orderService.ts
import { fetchJson } from "@/Libs/api";
import { Order } from "@/Types/order";
import { useAuthStore } from "@/Store/authStore";

const STORAGE_KEY = "mock_orders_v1";

async function loadInitial(): Promise<Order[]> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as Order[];
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
  const data = await fetchJson<Order[]>("/mock/orders.json");
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

export const orderService = {
  async getAll(): Promise<Order[]> {
    return await loadInitial();
  },

  async create(partial: Omit<Order, "id" | "createdAt"> & { id?: string }): Promise<Order> {
    const current = await loadInitial();
    const nowIso = new Date().toISOString();

    // normalize pickupAt
    let pickupIso: string | null | undefined = undefined;
    if (partial.pickupAt) {
      const d = new Date(partial.pickupAt);
      if (!isNaN(d.getTime())) pickupIso = d.toISOString();
      else pickupIso = partial.pickupAt as string;
    }

    // get current user from authStore (non-hook)
    const currentUser = useAuthStore.getState().user;
    const createdBy = currentUser?.name ?? "Operador desconhecido";
    const newOrder: Order = {
      id: partial.id ?? Date.now().toString(),
      createdAt: nowIso,
      ...partial,
      pickupAt: pickupIso ?? null,
      createdBy,
    };

    current.push(newOrder);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    await new Promise((r) => setTimeout(r, 150));
    return newOrder;
  },

  async update(id: string, patch: Partial<Order>): Promise<Order> {
    const current = await loadInitial();
    const idx = current.findIndex((o) => o.id === id);
    if (idx === -1) throw new Error("Order not found");

    const target = current[idx];
    const merged: Order = {
      ...target,
      ...patch,
      pickupAt:
        patch.pickupAt !== undefined && patch.pickupAt !== null
          ? (() => {
              const d = new Date(patch.pickupAt as string);
              return !isNaN(d.getTime()) ? d.toISOString() : (patch.pickupAt as string);
            })()
          : target.pickupAt ?? null,
    };

    current[idx] = merged;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    await new Promise((r) => setTimeout(r, 120));
    return merged;
  },

  async clear(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  },
};
