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

  addOrder: async (order) => {
    set({ loading: true });
    try {
      // sem "any" — usa a tipagem correta NewOrder
      const created = await orderService.create(order);
      set((state) => ({ orders: [...state.orders, created] }));
    } catch (err) {
      console.error("addOrder error", err);
    } finally {
      set({ loading: false });
    }
  },

  clearMock: async () => {
    await orderService.clear();
    set({ orders: [] });
  },
}));
