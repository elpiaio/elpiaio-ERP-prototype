// src/Services/orderService.ts
import { fetchJson } from "@/Libs/api";
import { Order } from "@/Types/order";

const STORAGE_KEY = "mock_orders_v1";

/** Carrega dados iniciais do localStorage ou do arquivo /mock/orders.json */
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

  /**
   * partial: Omit<Order, "id" | "createdAt">
   * cria id e createdAt automaticamente. Mantém pickupAt se fornecido.
   */
  async create(partial: Omit<Order, "id" | "createdAt"> & { id?: string }): Promise<Order> {
    const current = await loadInitial();
    const nowIso = new Date().toISOString();

    // normalize pickup (if passed as Date string like '2025-08-16T17:30' from datetime-local, convert to ISO)
    let pickupIso: string | null | undefined = undefined;
    if (partial.pickupAt) {
      // try to create ISO -- if already ISO, this preserves; if local 'YYYY-MM-DDTHH:mm' it converts to ISO
      const d = new Date(partial.pickupAt);
      if (!isNaN(d.getTime())) {
        pickupIso = d.toISOString();
      } else {
        pickupIso = partial.pickupAt as string;
      }
    }

    const newOrder: Order = {
      id: partial.id ?? Date.now().toString(),
      createdAt: nowIso,
      ...partial,
      pickupAt: pickupIso ?? null,
    };

    current.push(newOrder);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    // simulated latency
    await new Promise((r) => setTimeout(r, 150));
    return newOrder;
  },

   /**
   * Update: recebe id e um objeto parcial com os campos a atualizar.
   * Retorna o order atualizado.
   */
  async update(id: string, patch: Partial<Order>): Promise<Order> {
    const current = await loadInitial();
    const idx = current.findIndex((o) => o.id === id);
    if (idx === -1) throw new Error("Order not found");

    const target = current[idx];
    const merged: Order = {
      ...target,
      ...patch,
      // if pickupAt provided and is parsable as local datetime, normalize to ISO
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
