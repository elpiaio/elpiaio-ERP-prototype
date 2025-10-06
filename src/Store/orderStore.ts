// src/Store/orderStore.ts
import { create } from "zustand";
import { Order } from "@/Types/order";
import { orderService } from "@/Services/orderService";

type NewOrder = Omit<Order, "id" | "createdAt">;

interface OrderState {
  orders: Order[];
  loading: boolean;
  fetchOrders: () => Promise<void>;
  addOrder: (order: NewOrder) => Promise<void>;
  updateOrder: (id: string, patch: Partial<Order>) => Promise<Order | void>;
  clearMock: () => Promise<void>;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  loading: false,

  fetchOrders: async () => {
    set({ loading: true });
    try {
      const data = await orderService.getAll();
      set({ orders: data });
    } catch (err) {
      console.error("fetchOrders error", err);
      set({ orders: [] });
    } finally {
      set({ loading: false });
    }
  },

  addOrder: async (order: NewOrder) => {
    set({ loading: true });
    try {
      const created = await orderService.create(order);
      set((state) => ({ orders: [...state.orders, created] }));
    } catch (err) {
      console.error("addOrder error", err);
    } finally {
      set({ loading: false });
    }
  },

  updateOrder: async (id, patch) => {
    set({ loading: true });
    try {
      const updated = await orderService.update(id, patch);
      if (updated) {
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? updated : o)),
        }));
      }
      return updated;
    } catch (err) {
      console.error("updateOrder error", err);
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  clearMock: async () => {
    await orderService.clear();
    set({ orders: [] });
  },
}));
 
