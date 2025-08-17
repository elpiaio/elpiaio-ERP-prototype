// src/Services/orderService.ts
import { fetchJson } from "@/Libs/api";
import { Order } from "@/Types/order";

const STORAGE_KEY = "mock_orders_v1";

/**
 * Agora aceita partials com pickupAt e createdBy*
 */
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

  async create(partial: Partial<Omit<Order, "id" | "createdAt">> & { customerName: string; items: Order["items"]; total: number; createdById?: string | null; createdByName?: string | null; pickupAt?: string | null }): Promise<Order> {
    const current = await loadInitial();
    const nowIso = new Date().toISOString();
    const newOrder: Order = {
      id: Date.now().toString(),
      createdAt: nowIso,
      customerName: partial.customerName,
      items: partial.items ?? [],
      total: partial.total,
      status: partial.status ?? "pendente",
      pickupAt: partial.pickupAt ?? null,
      createdById: partial.createdById ?? null,
      createdByName: partial.createdByName ?? null,
    };
    current.push(newOrder);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    await new Promise((r) => setTimeout(r, 150)); // simula latência
    return newOrder;
  },

  async clear(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  },
};
