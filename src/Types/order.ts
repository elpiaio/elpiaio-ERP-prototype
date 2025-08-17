// src/Types/order.ts
import { Product } from "./product";

export type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  product?: Product; // opcional para UI
};

export type OrderStatus = "pendente" | "concluido" | "cancelado";

export type Order = {
  id: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status?: OrderStatus;
  createdAt: string; // ISO
  pickupAt?: string | null; // ISO string (data/hora de retirada) — opcional
  createdById?: string | null; // id do funcionário que criou o pedido
  createdByName?: string | null; // nome do funcionário
};
