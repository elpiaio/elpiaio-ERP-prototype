import { fetchJson } from "@/Libs/api";
import { Order } from "@/Types/order";

const STORAGE_KEY = "mock_orders_v1";

/**
 * Strategy:
 * - on first load, read public/mock/orders.json and persist to localStorage
 * - subsequent reads use localStorage (so new created orders persist across reloads)
 * - create simula POST atualizando localStorage
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
  // fallback: fetch the mock file
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
    const newOrder: Order = {
      id: partial.id ?? Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...partial,
    };
    current.push(newOrder);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    // small simulated latency
    await new Promise((r) => setTimeout(r, 200));
    return newOrder;
  },

  // optional helper to clear mock (dev)
  async clear(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  },
};
